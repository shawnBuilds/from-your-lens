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
        // Use the client ID from Info.plist (GIDClientID key)
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Setting up Google Sign-In with client ID:", clientID)
        }
        let config = GIDConfiguration(clientID: clientID)
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
            
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Google Sign-In successful for: \(user.profile?.email ?? "unknown")")
            }
            
            // Exchange Google token for our JWT
            let jwtUser = try await exchangeGoogleTokenForJWT(googleUser: user)
            
            // Store the JWT token
            UserDefaults.standard.set(jwtUser.token, forKey: UserDefaultsKeys.authToken)
            
            // Update current user
            self.currentUser = jwtUser.user
            self.isAuthenticated = true
            
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Authentication completed successfully")
            }
            return jwtUser.user
            
        } catch {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Sign-In error: \(error)")
            }
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
            
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Sign out completed successfully")
            }
            
        } catch {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Sign out error: \(error)")
            }
            self.errorMessage = error.localizedDescription
            throw error
        }
    }
    
    @MainActor
    func checkForExistingSignIn() async {
        guard let user = GIDSignIn.sharedInstance.currentUser else {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] No existing Google sign-in found")
            }
            return
        }
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Found existing Google sign-in for: \(user.profile?.email ?? "unknown")")
        }
        
        // Check if we have a valid JWT token
        if let token = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken), !token.isEmpty {
            do {
                let isValid = try await verifyToken(token: token)
                if isValid {
                    // Token is valid, try to get user data
                    if let userData = try? await getUserData(token: token) {
                        self.currentUser = userData
                        self.isAuthenticated = true
                        if FeatureFlags.enableDebugLogOAuth {
                            print("[GoogleOAuth] Existing session is valid")
                        }
                    }
                } else {
                    // Token is invalid, clear it
                    UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
                    if FeatureFlags.enableDebugLogOAuth {
                        print("[GoogleOAuth] Existing token is invalid, cleared")
                    }
                }
            } catch {
                if FeatureFlags.enableDebugLogOAuth {
                    print("[GoogleOAuth] Error verifying existing token: \(error)")
                }
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
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Sending token exchange request to: \(url)")
            print("[GoogleOAuth] Request body keys: \(body.keys)")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Server response status: \(httpResponse.statusCode)")
        }
        
        if httpResponse.statusCode != 200 {
            let errorData = String(data: data, encoding: .utf8) ?? "No error data"
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Server error response: \(errorData)")
            }
            throw OAuthError.serverError(httpResponse.statusCode)
        }
        
        // Log the raw response for debugging
        if FeatureFlags.enableDebugLogOAuth {
            let responseString = String(data: data, encoding: .utf8) ?? "Unable to decode response"
            print("[GoogleOAuth] Raw server response: \(responseString)")
        }
        
        do {
            let jwtResponse = try JSONDecoder().decode(JWTResponse.self, from: data)
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Successfully decoded JWT response")
                print("[GoogleOAuth] User ID: \(jwtResponse.user.id)")
                print("[GoogleOAuth] User email: \(jwtResponse.user.email)")
            }
            return jwtResponse
        } catch {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] JSON decoding error: \(error)")
                if let decodingError = error as? DecodingError {
                    switch decodingError {
                    case .keyNotFound(let key, let context):
                        print("[GoogleOAuth] Missing key: \(key.stringValue)")
                        print("[GoogleOAuth] Context: \(context.debugDescription)")
                    case .typeMismatch(let type, let context):
                        print("[GoogleOAuth] Type mismatch: expected \(type), context: \(context.debugDescription)")
                    case .valueNotFound(let type, let context):
                        print("[GoogleOAuth] Value not found: expected \(type), context: \(context.debugDescription)")
                    case .dataCorrupted(let context):
                        print("[GoogleOAuth] Data corrupted: \(context.debugDescription)")
                    @unknown default:
                        print("[GoogleOAuth] Unknown decoding error")
                    }
                }
            }
            throw error
        }
    }
    
    private func verifyToken(token: String) async throws -> Bool {
        let url = URL(string: "\(serverURL)/auth/verify-token")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Verifying token with server")
        }
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Token verification response: \(httpResponse.statusCode)")
        }
        
        return httpResponse.statusCode == 200
    }
    
    private func getUserData(token: String) async throws -> User {
        let url = URL(string: "\(serverURL)/auth/verify-token")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Fetching user data from server")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if httpResponse.statusCode != 200 {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Failed to get user data: \(httpResponse.statusCode)")
            }
            throw OAuthError.serverError(httpResponse.statusCode)
        }
        
        let verifyResponse = try JSONDecoder().decode(VerifyTokenResponse.self, from: data)
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Successfully fetched user data for: \(verifyResponse.user.email)")
        }
        return verifyResponse.user
    }
    
    private func callServerLogout() async throws {
        guard let token = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken) else {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] No token found for server logout")
            }
            return // No token to logout
        }
        
        let url = URL(string: "\(serverURL)/auth/logout")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Calling server logout endpoint")
        }
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw OAuthError.invalidResponse
        }
        
        if httpResponse.statusCode != 200 {
            if FeatureFlags.enableDebugLogOAuth {
                print("[GoogleOAuth] Server logout failed: \(httpResponse.statusCode)")
            }
            throw OAuthError.serverError(httpResponse.statusCode)
        }
        
        if FeatureFlags.enableDebugLogOAuth {
            print("[GoogleOAuth] Server logout successful")
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