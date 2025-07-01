import Foundation

struct User: Codable, Identifiable, Equatable {
    let id: Int
    let googleId: String
    let email: String
    let fullName: String?
    let profilePictureUrl: String?
    let createdAt: Date
    let lastLogin: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case googleId = "google_id"
        case email
        case fullName = "full_name"
        case profilePictureUrl = "profile_picture_url"
        case createdAt = "created_at"
        case lastLogin = "last_login"
    }
    
    // MARK: - Computed Properties
    var displayName: String {
        return fullName ?? email
    }
    
    var hasValidProfilePicture: Bool {
        return profilePictureUrl != nil && !profilePictureUrl!.isEmpty
    }
}

// MARK: - Mock Data
extension User {
    static let mock = User(
        id: 9999,
        googleId: "mock-user-01",
        email: "test@example.com",
        fullName: "Test User",
        profilePictureUrl: "https://play.rosebud.ai/assets/jules-pfp.jpg?gCCe",
        createdAt: Date(),
        lastLogin: Date()
    )
} 