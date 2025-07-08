import Foundation

struct Photo: Codable, Identifiable, Equatable {
    let id: Int
    let mediaItemId: String
    let userId: Int
    let photoOf: Int?
    let altText: String?
    let tags: [String]
    let baseUrl: String
    let mimeType: String
    let width: Int?
    let height: Int?
    let creationTime: Date?
    let createdAt: Date
    let updatedAt: Date
    let s3Key: String?
    let s3Url: String?
    let sharedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case mediaItemId = "media_item_id"
        case userId = "user_id"
        case photoOf = "photo_of"
        case altText = "alt_text"
        case tags
        case baseUrl = "base_url"
        case mimeType = "mime_type"
        case width
        case height
        case creationTime = "creation_time"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case s3Key = "s3_key"
        case s3Url = "s3_url"
        case sharedAt = "shared_at"
    }
    
    // MARK: - Computed Properties
    var aspectRatio: Double {
        guard let width = width, let height = height, height > 0 else { return 1.0 }
        return Double(width) / Double(height)
    }
    
    var isPortrait: Bool {
        return aspectRatio < 1.0
    }
    
    var isLandscape: Bool {
        return aspectRatio > 1.0
    }
    
    var isSquare: Bool {
        return abs(aspectRatio - 1.0) < 0.1
    }
    
    var hasTags: Bool {
        return !tags.isEmpty
    }
    
    var isPhotoOfUser: Bool {
        return photoOf != nil
    }
}

// MARK: - Mock Data
extension Photo {
    static let mock = Photo(
        id: 1,
        mediaItemId: "mock_media_item_id",
        userId: 1,
        photoOf: nil,
        altText: "Mock photo",
        tags: ["mock", "test"],
        baseUrl: "https://example.com/photo.jpg",
        mimeType: "image/jpeg",
        width: 1920,
        height: 1080,
        creationTime: Date(),
        createdAt: Date(),
        updatedAt: Date(),
        s3Key: nil,
        s3Url: nil,
        sharedAt: nil
    )
    
    // MARK: - Profile Picture Helper
    static func fromProfilePicture(url: String, userId: Int) -> Photo {
        return Photo(
            id: -1, // Special ID for profile picture
            mediaItemId: "profile_picture_\(userId)",
            userId: userId,
            photoOf: userId,
            altText: "Profile picture",
            tags: ["profile", "portrait"],
            baseUrl: url,
            mimeType: "image/jpeg",
            width: 400, // Default profile picture dimensions
            height: 400,
            creationTime: Date(),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        )
    }
    
    static let mockPhotos = [
        Photo(
            id: 1,
            mediaItemId: "mock-photo-1",
            userId: 9999,
            photoOf: nil,
            altText: "A scenic adventure photo",
            tags: ["travel", "scenic"],
            baseUrl: "https://play.rosebud.ai/assets/jules-01.jpg?P9o9",
            mimeType: "image/jpeg",
            width: 1920,
            height: 1080,
            creationTime: Date().addingTimeInterval(-86400 * 1),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        ),
        Photo(
            id: 2,
            mediaItemId: "mock-photo-2",
            userId: 9999,
            photoOf: nil,
            altText: "Group fun photo",
            tags: ["friends", "group"],
            baseUrl: "https://play.rosebud.ai/assets/jules-02.jpg?8JqA",
            mimeType: "image/jpeg",
            width: 1920,
            height: 1080,
            creationTime: Date().addingTimeInterval(-86400 * 2),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        ),
        Photo(
            id: 3,
            mediaItemId: "mock-photo-3",
            userId: 9999,
            photoOf: nil,
            altText: "A portrait of Jules",
            tags: ["portrait"],
            baseUrl: "https://play.rosebud.ai/assets/jules-03.jpg?0dLv",
            mimeType: "image/jpeg",
            width: 1080,
            height: 1350,
            creationTime: Date().addingTimeInterval(-86400 * 3),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        ),
        Photo(
            id: 4,
            mediaItemId: "mock-scene-1",
            userId: 9999,
            photoOf: nil,
            altText: "A mock scene photo",
            tags: ["mock", "scene"],
            baseUrl: "https://play.rosebud.ai/assets/mock-scene-1.jpg?kxZh",
            mimeType: "image/jpeg",
            width: 1920,
            height: 1080,
            creationTime: Date().addingTimeInterval(-86400 * 4),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        ),
        Photo(
            id: 5,
            mediaItemId: "mock-photo-5",
            userId: 9999,
            photoOf: nil,
            altText: "Jules in a stylish outfit",
            tags: ["fashion", "outdoor"],
            baseUrl: "https://play.rosebud.ai/assets/jules-05.jpg?597c",
            mimeType: "image/jpeg",
            width: 1080,
            height: 1350,
            creationTime: Date().addingTimeInterval(-86400 * 5),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        ),
        Photo(
            id: 6,
            mediaItemId: "mock-photo-6",
            userId: 9999,
            photoOf: nil,
            altText: "Jules profile picture",
            tags: ["profile", "portrait"],
            baseUrl: "https://rosebud.ai/assets/jules-pfp.jpg?zlHT",
            mimeType: "image/jpeg",
            width: 400,
            height: 400,
            creationTime: Date().addingTimeInterval(-86400 * 6),
            createdAt: Date(),
            updatedAt: Date(),
            s3Key: nil,
            s3Url: nil,
            sharedAt: nil
        )
        // Add more as needed to match the legacy MOCK_PHOTOS
    ]
} 
