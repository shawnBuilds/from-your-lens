import Foundation

// MARK: - Feature Flags
struct FeatureFlags {
    static let enableFaceDetectionOnImageLoad = false
    static let showFaceCountBadge = false
    static let showTestingFormOnStart = false
    static let defaultBatchTargetCount = 2
    static let enableGoogleDriveUsage = false
    static let enableSkipAuthFlow = true // Set to true to enable the "skip auth" modal for development
    static let enableDebugLogSkipAuth = false // Debug: log state changes for skip auth/test data
    static let enableDebugLogPhotoGallery = true // Debug: log data shown in photo gallery
    static let enableDebugLogLandingView = false // Debug: log layout info for landing view
    static let enableLandingGalleryImages = true // Toggle gallery images section in LandingView
    static let enableLandingHowItWorks = true // Toggle how it works section in LandingView
    
    // MARK: - iCloud Photo Integration
    static let enableICloudPhotoUsage = false // Master switch for iCloud photo functionality
    static let defaultICloudPhotoCount = 10 // Default number of photos to fetch from iCloud
    static let enableTestUserWithICloudPhotos = false // Use test user with real iCloud photos instead of mock data
    static let enableDebugLogICloudPhotos = false // Debug: log iCloud photo fetching operations
    
    // MARK: - Face Detection Integration
    static let enableFaceDetectionUsage = true // Master switch for face detection functionality
    static let enableDebugLogFaceDetection = true // Debug: log face detection operations
    static let faceDetectionSimilarityThreshold = 90.0 // Minimum similarity threshold for face matching
    static let maxImageSizeForFaceDetection = 5 * 1024 * 1024 // 5MB max image size for face detection
    static let minImageSizeForFaceDetection = 1 * 1024 // 1KB min image size for face detection
}        

// MARK: - API Configuration
struct APIConfig {
    // MARK: - Environment Configuration
    // Set this to true for production, false for local development
    static let useProductionServer = false
    
    static let baseURL: String = {
        if useProductionServer {
            return "https://your-heroku-app.herokuapp.com"
        } else {
            return "http://127.0.0.1:3000"
        }
    }()
    
    static let profilePicURL = "https://rosebud.ai/assets/icon-default-pfp.png?ibhI"
}

// MARK: - Storage Keys
struct StorageKeys {
    static let authToken = "from-your-lens-authToken-v1"
    static let userData = "from-your-lens-user-v1"
}

// MARK: - UserDefaults Keys (for backward compatibility)
struct UserDefaultsKeys {
    static let authToken = StorageKeys.authToken
    static let userData = StorageKeys.userData
}

// MARK: - View States
enum ViewState: String, CaseIterable {
    case photos = "PHOTOS"
    case landing = "LANDING"
    case testing = "TESTING"
}

// MARK: - Icon URLs
struct IconURLs {
    static let myDrive = "https://play.rosebud.ai/assets/icon-google-drive-transparent.png?4rTm"
    static let photosOfYou = "https://play.rosebud.ai/assets/icon-you-selfie.png?MQtz"
    static let findPhotos = "https://play.rosebud.ai/assets/icon-search.png?mQKb"
    static let sendPhotos = "https://play.rosebud.ai/assets/icon-send-no-bg.png?b4PE"
}

// MARK: - Service Protocols
protocol AuthServiceProtocol {
    func handleReturningUser() async throws -> SessionResult
    func logout() async throws -> LogoutResult
    func login() async throws -> SessionResult
    func refreshToken() async throws -> SessionResult
}
