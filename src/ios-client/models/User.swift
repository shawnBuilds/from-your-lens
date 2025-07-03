import Foundation

struct User: Codable, Identifiable, Equatable {
    let id: Int
    let googleId: String
    let email: String
    let fullName: String?
    let profilePictureUrl: String?
    let createdAt: Date?
    let lastLogin: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case googleId = "google_id"
        case email
        case fullName = "fullName"
        case profilePictureUrl = "profilePictureUrl"
        case createdAt = "created_at"
        case lastLogin = "last_login"
    }
    
    // MARK: - Custom Decoder
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Required fields
        id = try container.decode(Int.self, forKey: .id)
        googleId = try container.decode(String.self, forKey: .googleId)
        email = try container.decode(String.self, forKey: .email)
        
        // Optional fields with fallbacks
        fullName = try container.decodeIfPresent(String.self, forKey: .fullName)
        profilePictureUrl = try container.decodeIfPresent(String.self, forKey: .profilePictureUrl)
        
        // Date fields with fallbacks - use current date if not provided
        if let createdAtString = try container.decodeIfPresent(String.self, forKey: .createdAt) {
            let formatter = ISO8601DateFormatter()
            createdAt = formatter.date(from: createdAtString) ?? Date()
        } else {
            createdAt = Date()
        }
        
        if let lastLoginString = try container.decodeIfPresent(String.self, forKey: .lastLogin) {
            let formatter = ISO8601DateFormatter()
            lastLogin = formatter.date(from: lastLoginString) ?? Date()
        } else {
            lastLogin = Date()
        }
    }
    
    // MARK: - Manual Initializer
    init(id: Int, googleId: String, email: String, fullName: String? = nil, profilePictureUrl: String? = nil, createdAt: Date? = nil, lastLogin: Date? = nil) {
        self.id = id
        self.googleId = googleId
        self.email = email
        self.fullName = fullName
        self.profilePictureUrl = profilePictureUrl
        self.createdAt = createdAt ?? Date()
        self.lastLogin = lastLogin ?? Date()
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