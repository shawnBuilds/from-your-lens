import Foundation

// MARK: - Protocol Definition
protocol UserServiceProtocol {
    func uploadProfilePicture(_ imageData: Data) async throws -> ProfilePictureResult
    func removeProfilePicture(userId: Int) async throws -> ProfilePictureResult
    func getAllUsers() async throws -> [User]
}

class UserService: UserServiceProtocol {
    
    // MARK: - UserServiceProtocol Implementation
    func uploadProfilePicture(_ imageData: Data) async throws -> ProfilePictureResult {
        print("[UserService] Uploading profile picture...")
        
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
        
        // TODO: Implement actual profile picture upload
        // For now, return mock success with updated user
        let updatedUser = User(
            id: 1,
            googleId: "mock_google_id",
            email: "user@example.com",
            fullName: "Mock User",
            profilePictureUrl: "https://example.com/uploaded_profile.jpg"
        )
        
        return ProfilePictureResult(
            success: true,
            user: updatedUser,
            error: nil
        )
    }
    
    func removeProfilePicture(userId: Int) async throws -> ProfilePictureResult {
        print("[UserService] Removing profile picture...")
        guard let authToken = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken) else {
            throw UserServiceError.invalidData
        }
        let url = URL(string: "\(APIConfig.baseURL)/api/users/profile-picture")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw UserServiceError.networkError
        }
        if httpResponse.statusCode == 200 {
            let decoder = JSONDecoder()
            struct RemoveProfilePictureResponse: Codable {
                let message: String
                let user: User
            }
            let removeResponse = try decoder.decode(RemoveProfilePictureResponse.self, from: data)
            return ProfilePictureResult(success: true, user: removeResponse.user, error: nil)
        } else {
            let errorMessage: String
            if let errorData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let msg = errorData["error"] as? String {
                errorMessage = msg
            } else {
                errorMessage = "Failed with status: \(httpResponse.statusCode)"
            }
            return ProfilePictureResult(success: false, user: nil, error: errorMessage)
        }
    }
    
    // MARK: - Get All Users
    func getAllUsers() async throws -> [User] {
        print("[UserService] Fetching all users...")
        guard let authToken = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken) else {
            throw UserServiceError.invalidData
        }
        
        let url = URL(string: "\(APIConfig.baseURL)/api/users")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw UserServiceError.networkError
        }
        
        if httpResponse.statusCode == 200 {
            struct GetAllUsersResponse: Codable {
                let users: [User]
                let total: Int
            }
            let decoder = JSONDecoder()
            let usersResponse = try decoder.decode(GetAllUsersResponse.self, from: data)
            print("[UserService] Successfully fetched \(usersResponse.users.count) users")
            return usersResponse.users
        } else {
            let errorMessage: String
            if let errorData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let msg = errorData["error"] as? String {
                errorMessage = msg
            } else {
                errorMessage = "Failed with status: \(httpResponse.statusCode)"
            }
            throw UserServiceError.networkError
        }
    }
    
    // MARK: - Additional Methods (to be implemented)
    func getUserProfile(userId: String) async throws -> User {
        print("[UserService] Get user profile not implemented yet")
        throw UserServiceError.notImplemented
    }
    
    func updateUserProfile(userId: String, updates: [String: Any]) async throws -> User {
        print("[UserService] Update user profile not implemented yet")
        throw UserServiceError.notImplemented
    }
}

// MARK: - User Service Errors
enum UserServiceError: Error, LocalizedError {
    case notImplemented
    case invalidData
    case uploadFailed
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "User service method not implemented yet"
        case .invalidData:
            return "Invalid user data"
        case .uploadFailed:
            return "Profile picture upload failed"
        case .networkError:
            return "Network error occurred"
        }
    }
} 