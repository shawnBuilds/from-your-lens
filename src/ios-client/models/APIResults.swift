import Foundation

// MARK: - Authentication Results
struct SessionResult {
    let sessionValid: Bool
    let user: User?
    let error: String?
}

struct LogoutResult {
    let success: Bool
    let error: String?
}

// MARK: - User Service Results
struct ProfilePictureResult {
    let success: Bool
    let user: User?
    let error: String?
}

// MARK: - Photos Service Results
struct PhotosResult {
    let photos: [Photo]
    let hasMore: Bool
    let total: Int?
    let error: String?
}

// MARK: - Face Detection Results
struct FaceDetectionResult {
    let faces: [FaceDetail]
    let error: String?
}

// MARK: - Face Comparison Results
struct FaceComparisonResult {
    let faceMatches: [FaceMatch]
    let unmatchedFaces: [FaceDetail]
    let sourceFaceCount: Int
    let targetFaceCount: Int
    let error: String?
}

// MARK: - Batch Compare Results
struct BatchCompareResult: Identifiable {
    var id: String { targetFileName }
    let targetFileName: String
    let photo: Photo
    let faceMatches: [FaceMatch]
    let unmatchedFaces: [FaceDetail]
    let sourceFaceCount: Int
    let targetFaceCount: Int
    let error: String?
    let rejected: Bool
}

struct BatchCompareResponse {
    let results: [BatchCompareResult]
    let totalProcessed: Int
    let successfulComparisons: Int
    let failedComparisons: Int
    let error: String?
    
    // MARK: - Mock Responses
    static let mockResponse = BatchCompareResponse(
        results: [],
        totalProcessed: 0,
        successfulComparisons: 0,
        failedComparisons: 0,
        error: nil
    )
    
    static let mockError = BatchCompareResponse(
        results: [],
        totalProcessed: 0,
        successfulComparisons: 0,
        failedComparisons: 0,
        error: "Mock error response"
    )
}

struct FaceDetail: Codable {
    let boundingBox: BoundingBox
    let confidence: Double
    let ageRange: AgeRange?
    let smile: Smile?
    let eyeglasses: Eyeglasses?
    let sunglasses: Sunglasses?
    let gender: Gender?
    let beard: Beard?
    let mustache: Mustache?
    let eyesOpen: EyesOpen?
    let mouthOpen: MouthOpen?
    let emotions: [Emotion]?
    let landmarks: [Landmark]?
    let pose: Pose?
    let quality: ImageQuality?
    let faceOccluded: FaceOccluded?
    let eyeDirection: EyeDirection?
    
    enum CodingKeys: String, CodingKey {
        case boundingBox = "BoundingBox"
        case confidence = "Confidence"
        case ageRange = "AgeRange"
        case smile = "Smile"
        case eyeglasses = "Eyeglasses"
        case sunglasses = "Sunglasses"
        case gender = "Gender"
        case beard = "Beard"
        case mustache = "Mustache"
        case eyesOpen = "EyesOpen"
        case mouthOpen = "MouthOpen"
        case emotions = "Emotions"
        case landmarks = "Landmarks"
        case pose = "Pose"
        case quality = "Quality"
        case faceOccluded = "FaceOccluded"
        case eyeDirection = "EyeDirection"
    }
}

struct BoundingBox: Codable {
    let width: Double
    let height: Double
    let left: Double
    let top: Double
    
    enum CodingKeys: String, CodingKey {
        case width = "Width"
        case height = "Height"
        case left = "Left"
        case top = "Top"
    }
}

struct FaceMatch: Codable {
    let similarity: Double
    let face: FaceDetail
    
    enum CodingKeys: String, CodingKey {
        case similarity = "Similarity"
        case face = "Face"
    }
}

// MARK: - Supporting Structures
struct AgeRange: Codable {
    let low: Int
    let high: Int
    
    enum CodingKeys: String, CodingKey {
        case low = "Low"
        case high = "High"
    }
}

struct Smile: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct Eyeglasses: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct Sunglasses: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct Gender: Codable {
    let value: String
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct Beard: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct Mustache: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct EyesOpen: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct MouthOpen: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct Emotion: Codable {
    let type: String
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case type = "Type"
        case confidence = "Confidence"
    }
}

struct Landmark: Codable {
    let type: String
    let x: Double
    let y: Double
    
    enum CodingKeys: String, CodingKey {
        case type = "Type"
        case x = "X"
        case y = "Y"
    }
}

struct Pose: Codable {
    let roll: Double
    let yaw: Double
    let pitch: Double
    
    enum CodingKeys: String, CodingKey {
        case roll = "Roll"
        case yaw = "Yaw"
        case pitch = "Pitch"
    }
}

struct ImageQuality: Codable {
    let brightness: Double
    let sharpness: Double
    
    enum CodingKeys: String, CodingKey {
        case brightness = "Brightness"
        case sharpness = "Sharpness"
    }
}

struct FaceOccluded: Codable {
    let value: Bool
    let confidence: Double
    
    enum CodingKeys: String, CodingKey {
        case value = "Value"
        case confidence = "Confidence"
    }
}

struct EyeDirection: Codable {
    let yaw: Double
    let pitch: Double
    
    enum CodingKeys: String, CodingKey {
        case yaw = "Yaw"
        case pitch = "Pitch"
    }
}

// MARK: - Mock Data
extension SessionResult {
    static let mockValid = SessionResult(
        sessionValid: true,
        user: User.mock,
        error: nil
    )
    
    static let mockInvalid = SessionResult(
        sessionValid: false,
        user: nil,
        error: "Session expired"
    )
}

extension LogoutResult {
    static let mockSuccess = LogoutResult(
        success: true,
        error: nil
    )
    
    static let mockFailure = LogoutResult(
        success: false,
        error: "Logout failed"
    )
}

extension ProfilePictureResult {
    static let mockSuccess = ProfilePictureResult(
        success: true,
        user: User.mock,
        error: nil
    )
    
    static let mockFailure = ProfilePictureResult(
        success: false,
        user: nil,
        error: "Upload failed"
    )
}

extension PhotosResult {
    static let mockEmpty = PhotosResult(
        photos: [],
        hasMore: false,
        total: 0,
        error: nil
    )
    
    static let mockWithPhotos = PhotosResult(
        photos: Photo.mockPhotos,
        hasMore: true,
        total: 100,
        error: nil
    )
    
    static let mockError = PhotosResult(
        photos: [],
        hasMore: false,
        total: nil,
        error: "Failed to fetch photos"
    )
}

// MARK: - Server API Response Models
struct PhotosServerResponse: Codable {
    let photos: [Photo]
    let total: Int
    let has_more: Bool
}

extension FaceDetectionResult {
    static let mockEmpty = FaceDetectionResult(
        faces: [],
        error: nil
    )
    
    static let mockWithFaces = FaceDetectionResult(
        faces: [
            FaceDetail(
                boundingBox: BoundingBox(width: 0.5, height: 0.6, left: 0.2, top: 0.1),
                confidence: 99.5,
                ageRange: AgeRange(low: 25, high: 35),
                smile: Smile(value: true, confidence: 85.0),
                eyeglasses: Eyeglasses(value: false, confidence: 95.0),
                sunglasses: Sunglasses(value: false, confidence: 98.0),
                gender: Gender(value: "Male", confidence: 90.0),
                beard: Beard(value: false, confidence: 88.0),
                mustache: Mustache(value: false, confidence: 92.0),
                eyesOpen: EyesOpen(value: true, confidence: 87.0),
                mouthOpen: MouthOpen(value: false, confidence: 89.0),
                emotions: [Emotion(type: "HAPPY", confidence: 85.0)],
                landmarks: [],
                pose: Pose(roll: 0.0, yaw: 5.0, pitch: -2.0),
                quality: ImageQuality(brightness: 75.0, sharpness: 80.0),
                faceOccluded: FaceOccluded(value: false, confidence: 95.0),
                eyeDirection: EyeDirection(yaw: 0.0, pitch: 0.0)
            )
        ],
        error: nil
    )
    
    static let mockError = FaceDetectionResult(
        faces: [],
        error: "Failed to detect faces"
    )
}

extension FaceComparisonResult {
    static let mockMatch = FaceComparisonResult(
        faceMatches: [
            FaceMatch(
                similarity: 95.5,
                face: FaceDetail(
                    boundingBox: BoundingBox(width: 0.5, height: 0.6, left: 0.2, top: 0.1),
                    confidence: 99.5,
                    ageRange: AgeRange(low: 25, high: 35),
                    smile: Smile(value: true, confidence: 85.0),
                    eyeglasses: Eyeglasses(value: false, confidence: 95.0),
                    sunglasses: Sunglasses(value: false, confidence: 98.0),
                    gender: Gender(value: "Male", confidence: 90.0),
                    beard: Beard(value: false, confidence: 88.0),
                    mustache: Mustache(value: false, confidence: 92.0),
                    eyesOpen: EyesOpen(value: true, confidence: 87.0),
                    mouthOpen: MouthOpen(value: false, confidence: 89.0),
                    emotions: [Emotion(type: "HAPPY", confidence: 85.0)],
                    landmarks: [],
                    pose: Pose(roll: 0.0, yaw: 5.0, pitch: -2.0),
                    quality: ImageQuality(brightness: 75.0, sharpness: 80.0),
                    faceOccluded: FaceOccluded(value: false, confidence: 95.0),
                    eyeDirection: EyeDirection(yaw: 0.0, pitch: 0.0)
                )
            )
        ],
        unmatchedFaces: [],
        sourceFaceCount: 1,
        targetFaceCount: 1,
        error: nil
    )
    
    static let mockNoMatch = FaceComparisonResult(
        faceMatches: [],
        unmatchedFaces: [
            FaceDetail(
                boundingBox: BoundingBox(width: 0.5, height: 0.6, left: 0.2, top: 0.1),
                confidence: 99.5,
                ageRange: AgeRange(low: 25, high: 35),
                smile: Smile(value: true, confidence: 85.0),
                eyeglasses: Eyeglasses(value: false, confidence: 95.0),
                sunglasses: Sunglasses(value: false, confidence: 98.0),
                gender: Gender(value: "Male", confidence: 90.0),
                beard: Beard(value: false, confidence: 88.0),
                mustache: Mustache(value: false, confidence: 92.0),
                eyesOpen: EyesOpen(value: true, confidence: 87.0),
                mouthOpen: MouthOpen(value: false, confidence: 89.0),
                emotions: [Emotion(type: "HAPPY", confidence: 85.0)],
                landmarks: [],
                pose: Pose(roll: 0.0, yaw: 5.0, pitch: -2.0),
                quality: ImageQuality(brightness: 75.0, sharpness: 80.0),
                faceOccluded: FaceOccluded(value: false, confidence: 95.0),
                eyeDirection: EyeDirection(yaw: 0.0, pitch: 0.0)
            )
        ],
        sourceFaceCount: 1,
        targetFaceCount: 1,
        error: nil
    )
    
    static let mockError = FaceComparisonResult(
        faceMatches: [],
        unmatchedFaces: [],
        sourceFaceCount: 0,
        targetFaceCount: 0,
        error: "Failed to compare faces"
    )
}

extension BatchCompareResult {
    static let mockMatch = BatchCompareResult(
        targetFileName: "photo1.jpg",
        photo: Photo.mockPhotos[0],
        faceMatches: [
            FaceMatch(
                similarity: 95.5,
                face: FaceDetail(
                    boundingBox: BoundingBox(width: 0.5, height: 0.6, left: 0.2, top: 0.1),
                    confidence: 99.5,
                    ageRange: AgeRange(low: 25, high: 35),
                    smile: Smile(value: true, confidence: 85.0),
                    eyeglasses: Eyeglasses(value: false, confidence: 95.0),
                    sunglasses: Sunglasses(value: false, confidence: 98.0),
                    gender: Gender(value: "Male", confidence: 90.0),
                    beard: Beard(value: false, confidence: 88.0),
                    mustache: Mustache(value: false, confidence: 92.0),
                    eyesOpen: EyesOpen(value: true, confidence: 87.0),
                    mouthOpen: MouthOpen(value: false, confidence: 89.0),
                    emotions: [Emotion(type: "HAPPY", confidence: 85.0)],
                    landmarks: [],
                    pose: Pose(roll: 0.0, yaw: 5.0, pitch: -2.0),
                    quality: ImageQuality(brightness: 75.0, sharpness: 80.0),
                    faceOccluded: FaceOccluded(value: false, confidence: 95.0),
                    eyeDirection: EyeDirection(yaw: 0.0, pitch: 0.0)
                )
            )
        ],
        unmatchedFaces: [],
        sourceFaceCount: 1,
        targetFaceCount: 1,
        error: nil,
        rejected: false
    )
    
    static let mockNoMatch = BatchCompareResult(
        targetFileName: "photo2.jpg",
        photo: Photo.mockPhotos[1],
        faceMatches: [],
        unmatchedFaces: [
            FaceDetail(
                boundingBox: BoundingBox(width: 0.5, height: 0.6, left: 0.2, top: 0.1),
                confidence: 99.5,
                ageRange: AgeRange(low: 25, high: 35),
                smile: Smile(value: true, confidence: 85.0),
                eyeglasses: Eyeglasses(value: false, confidence: 95.0),
                sunglasses: Sunglasses(value: false, confidence: 98.0),
                gender: Gender(value: "Male", confidence: 90.0),
                beard: Beard(value: false, confidence: 88.0),
                mustache: Mustache(value: false, confidence: 92.0),
                eyesOpen: EyesOpen(value: true, confidence: 87.0),
                mouthOpen: MouthOpen(value: false, confidence: 89.0),
                emotions: [Emotion(type: "HAPPY", confidence: 85.0)],
                landmarks: [],
                pose: Pose(roll: 0.0, yaw: 5.0, pitch: -2.0),
                quality: ImageQuality(brightness: 75.0, sharpness: 80.0),
                    faceOccluded: FaceOccluded(value: false, confidence: 95.0),
                    eyeDirection: EyeDirection(yaw: 0.0, pitch: 0.0)
            )
        ],
        sourceFaceCount: 1,
        targetFaceCount: 1,
        error: nil,
        rejected: false
    )
    
    static let mockError = BatchCompareResult(
        targetFileName: "photo3.jpg",
        photo: Photo.mockPhotos[2],
        faceMatches: [],
        unmatchedFaces: [],
        sourceFaceCount: 0,
        targetFaceCount: 0,
        error: "Failed to compare faces",
        rejected: false
    )
}

extension BatchCompareResponse {
    static let mockSuccess = BatchCompareResponse(
        results: [BatchCompareResult.mockMatch, BatchCompareResult.mockNoMatch],
        totalProcessed: 2,
        successfulComparisons: 2,
        failedComparisons: 0,
        error: nil
    )
    
    static let mockPartialFailure = BatchCompareResponse(
        results: [BatchCompareResult.mockMatch, BatchCompareResult.mockError],
        totalProcessed: 2,
        successfulComparisons: 1,
        failedComparisons: 1,
        error: "Some comparisons failed"
    )
    
    static let mockFailure = BatchCompareResponse(
        results: [BatchCompareResult.mockError],
        totalProcessed: 1,
        successfulComparisons: 0,
        failedComparisons: 1,
        error: "All comparisons failed"
    )
} 