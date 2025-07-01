import Foundation
import GoogleSignIn
import GoogleSignInSwift

class GoogleOAuthService: ObservableObject {
    
    // MARK: - Published Properties
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // MARK: - Constants
    private let clientID = GoogleOAuthConfig.clientID
    private let serverURL = GoogleOAuthConfig.serverURL
    
    // MARK: - Initialization
    init() {
        setupGoogleSignIn()
    }
    
    // MARK: - Setup
    private func setupGoogleSignIn() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: path),
              let clientId = plist["CLIENT_ID"] as? String else {
            print("[GoogleOAuth] Failed to load GoogleService-Info.plist")
            return
        }
        
        let config = GIDConfiguration(clientID: clientId)
        GIDSignIn.sharedInstance.configuration = config
        
        // Check for existing sign-in
        Task {
            await checkForExistingSignIn()
        }
    }
    
    // MARK: - Authentication Methods
    @MainActor
    func signIn() async throws -> User {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController else {
            throw OAuthError.noRootViewController
        }
        
        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)
            
            let user = result.user
            
            print("[GoogleOAuth] Google Sign-In successful for: \(user.profile?.email ?? "unknown")")
            
            // Exchange Google token for our JWT
            let jwtUser = try await exchangeGoogleTokenForJWT(googleUser: user)
            
            // Store the JWT token
            UserDefaults.standard.set(jwtUser.token, forKey: UserDefaultsKeys.authToken)
            
            // Update current user
            self.currentUser = jwtUser.user
            self.isAuthenticated = true
            
            print("[GoogleOAuth] Authentication completed successfully")
            return jwtUser.user
            
        } catch {
            print("[GoogleOAuth] Sign-In error: \(error)")
            self.errorMessage = error.localizedDescription
            throw error
        }
    }
    
    @MainActor
    func signOut() async throws {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // Sign out from Google
            GIDSignIn.sharedInstance.signOut()
            
            // Clear local storage
            UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
            UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.userData)
            
            // Call server logout endpoint
            try await callServerLogout()
            
            // Update state
            self.currentUser = nil
            self.isAuthenticated = false
            self.errorMessage = nil
            
            print("[GoogleOAuth] Sign out completed successfully")
            
        } catch {
            print("[GoogleOAuth] Sign out error: \(error)")
            self.errorMessage = error.localizedDescription
            throw error
        }
    }
    
    @MainActor
    func checkForExistingSignIn() async {
        guard let user = GIDSignIn.sharedInstance.currentUser else {
            print("[GoogleOAuth] No existing Google sign-in found")
            return
        }
        
        print("[GoogleOAuth] Found existing Google sign-in for: \(user.profile?.email ?? "unknown")")
        
        // Check if we have a valid JWT token
        if let token = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken), !token.isEmpty {
            do {
                let isValid = try await verifyToken(token: token)
                if isValid {
                    // Token is valid, try to get user data
                    if let userData = try? await getUserData(token: token) {
                        self.currentUser = userData
                        self.isAuthenticated = true
                        print("[GoogleOAuth] Existing session is valid")
                    }
                } else {
                    // Token is invalid, clear it
                    UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
                    print("[GoogleOAuth] Existing token is invalid, cleared")
                }
            } catch {
                print("[GoogleOAuth] Error verifying existing token: \(error)")
                UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
            }
        }
    }
    
    // MARK: - Network Methods
    private func exchangeGoogleTokenForJWT(googleUser: GIDGoogleUser) async throws -> JWTResponse {
        guard let idToken = googleUser.idToken?.tokenString else {
            throw OAuthError.noIDToken
        }
        
        let url = URL(string: "\(serverURL)/auth/google/callback")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "id_token": idToken,
            "access_token": googleUser.accessToken.tokenString
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if httpResponse.statusCode != 200 {
            throw OAuthError.serverError(httpResponse.statusCode)
        }
        
        let jwtResponse = try JSONDecoder().decode(JWTResponse.self, from: data)
        return jwtResponse
    }
    
    private func verifyToken(token: String) async throws -> Bool {
        let url = URL(string: "\(serverURL)/auth/verify-token")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        return httpResponse.statusCode == 200
    }
    
    private func getUserData(token: String) async throws -> User {
        let url = URL(string: "\(serverURL)/auth/verify-token")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if httpResponse.statusCode != 200 {
            throw OAuthError.serverError(httpResponse.statusCode)
        }
        
        let verifyResponse = try JSONDecoder().decode(VerifyTokenResponse.self, from: data)
        return verifyResponse.user
    }
    
    private func callServerLogout() async throws {
        guard let token = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken) else {
            return // No token to logout
        }
        
        let url = URL(string: "\(serverURL)/auth/logout")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if httpResponse.statusCode != 200 {
            throw OAuthError.serverError(httpResponse.statusCode)
        }
    }
}

// MARK: - Response Models
struct JWTResponse: Codable {
    let token: String
    let user: User
}

struct VerifyTokenResponse: Codable {
    let valid: Bool
    let user: User
}

// MARK: - Error Types
enum OAuthError: Error, LocalizedError {
    case noRootViewController
    case noUserData
    case noIDToken
    case invalidResponse
    case serverError(Int)
    
    var errorDescription: String? {
        switch self {
        case .noRootViewController:
            return "Unable to present sign-in view"
        case .noUserData:
            return "No user data received from Google"
        case .noIDToken:
            return "No ID token received from Google"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let code):
            return "Server error: \(code)"
        }
    }
}