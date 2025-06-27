import Foundation

struct User: Codable, Identifiable, Equatable {
    let id: Int
    let googleId: String
    let email: String
    let fullName: String?
    let profilePictureUrl: String?
    let driveAccessToken: String?
    let driveRefreshToken: String?
    let driveTokenExpiry: Date?
    let photosAccessToken: String?
    let photosRefreshToken: String?
    let photosTokenExpiry: Date?
    let createdAt: Date
    let lastLogin: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case googleId = "google_id"
        case email
        case fullName = "full_name"
        case profilePictureUrl = "profile_picture_url"
        case driveAccessToken = "drive_access_token"
        case driveRefreshToken = "drive_refresh_token"
        case driveTokenExpiry = "drive_token_expiry"
        case photosAccessToken = "photos_access_token"
        case photosRefreshToken = "photos_refresh_token"
        case photosTokenExpiry = "photos_token_expiry"
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
    
    var hasDriveAccess: Bool {
        return driveAccessToken != nil && driveTokenExpiry != nil && driveTokenExpiry! > Date()
    }
    
    var hasPhotosAccess: Bool {
        return photosAccessToken != nil && photosTokenExpiry != nil && photosTokenExpiry! > Date()
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
        driveAccessToken: nil,
        driveRefreshToken: nil,
        driveTokenExpiry: nil,
        photosAccessToken: nil,
        photosRefreshToken: nil,
        photosTokenExpiry: nil,
        createdAt: Date(),
        lastLogin: Date()
    )
} 