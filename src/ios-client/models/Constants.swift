import Foundation

// MARK: - Feature Flags
struct FeatureFlags {
    static let enableFaceDetectionOnImageLoad = false
    static let showFaceCountBadge = false
    static let defaultBatchTargetCount = 2
    static let enableGoogleDriveUsage = false
    static let enableSkipAuthFlow = false // Set to true to enable the "skip auth" modal for development
    static let enableDebugLogSkipAuth = false // Debug: log state changes for skip auth/test data
    static let enableDebugLogPhotoGallery = false // Debug: log data shown in photo gallery
    static let enableDebugLogLandingView = true // Debug: log layout info for landing view
    static let enableLandingGalleryImages = true // Toggle gallery images section in LandingView
    static let enableLandingHowItWorks = true // Toggle how it works section in LandingView
    
    // MARK: - Time Debugging
    static let enableDebugLogTimeSync = true // Debug: log time synchronization issues
    
    // MARK: - iCloud Photo Integration
    static let enableICloudPhotoUsage = true // Enable iCloud photo fetching
    static let enableDebugLogICloudPhotos = true // Debug: log iCloud photo operations
    static let defaultICloudPhotoCount = 100 // Default number of photos to fetch from iCloud
    static let enableServerPhotoUsage = true // Enable server API for photos of user
    static let enableDebugLogServerPhotos = false // Debug: log server photo operations
    static let enableTestUserWithICloudPhotos = false // Use test user with real iCloud photos instead of mock data
    
    // MARK: - Face Detection Integration
    static let enableFaceDetectionUsage = true // Master switch for face detection functionality
    static let enableDebugLogFaceDetection = false // Debug: log face detection operations
    static let enableDebugBatchCompareModal = true // Debug: log batch compare modal operations
    
    // MARK: - Notification Integration
    static let enablePushNotifications = true // Master switch for push notifications
    static let enableDebugLogNotifications = true // Debug: log notification operations
    static let showNotificationPermissionModal = true // Show permission modal when notifications are disabled
    static let enableDebugLogBatchCompare = true // Debug: log batch compare API operations (NEW)
    static let faceDetectionSimilarityThreshold = 90.0 // Minimum similarity threshold for face matching
    static let maxImageSizeForFaceDetection = 5 * 1024 * 1024 // 5MB max image size for face detection
    static let minImageSizeForFaceDetection = 1 * 1024 // 1KB min image size for face detection
    
    // MARK: - Photo Upload Integration
    static let enableDebugLogPhotoUpload = false // Debug: log photo upload operations
    
    // MARK: - Photo Download Integration
    static let enableDebugLogPhotoDownload = true // Debug: log photo download operations
    
    // MARK: - OAuth Integration
    static let enableDebugLogOAuth = false // Debug: log OAuth operations and network requests
    static let enableDebugLogAuth = true // Debug: log AuthService operations and token validation
    static let enableDebugLogUser = false // Debug: log user fetch/search operations
    static let enableAutoProfilePicturePrompt = true // Auto-show PFP picker for users without profile pictures
    static let enableUpdateFilteredUsersInSearch = true // Debug: enable/disable filtering in UserSearchModal
    
    // MARK: - Keyboard Debugging
    static let enableDebugLogKeyboard = true // Debug: log keyboard events and timing
    
    // MARK: - Photo Selection Limits
    static let maxSourcePhotoSelection = 1 // Maximum number of source photos that can be selected
    static let maxTargetPhotoSelection = 10 // Maximum number of target photos that can be selected for batch comparison
    
    // MARK: - Modal Behavior Control
    static let showCompareModalOnFindPhotosClick = true // Show batch compare modal when "Find Photos" is clicked
    
    // MARK: - Invite Configuration
    static let inviteAppLink = "https://testflight.apple.com/join/INVITE_CODE" // Placeholder TestFlight link for invite sharing
}        

// MARK: - API Configuration
struct APIConfig {
    // MARK: - Environment Configuration
    // Set this to true for production, false for local development
    static let useProductionServer = true
    
    static let baseURL: String = {
        if useProductionServer {
            return "https://fromyourlens-904e01076638.herokuapp.com"
        } else {
            return "http://127.0.0.1:3000"
        }
    }()
    
    static let profilePicURL = "https://rosebud.ai/assets/icon-default-pfp.png?ibhI"
}

// MARK: - Google OAuth Configuration
struct GoogleOAuthConfig {
    // MARK: - Client Configuration
    static let clientID = "374611061345-5op1h3i3pp2a53jo7t71e705qvomg5m4.apps.googleusercontent.com"
    
    // MARK: - Server Configuration``
    static let serverURL: String = {
        if APIConfig.useProductionServer {
            return "https://fromyourlens-904e01076638.herokuapp.com"
        } else {
            return "http://localhost:5000"
        }
    }()
    
    // MARK: - URL Scheme
    static let urlScheme = "fromyourlens"
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
}

// MARK: - Batch Compare States
enum BatchCompareState: String, CaseIterable {
    case waiting = "WAITING"      // Initial state - waiting for user to start
    case matching = "MATCHING"    // Face matching in progress
    case matched = "MATCHED"      // Matching completed with results
    case error = "ERROR"          // Error occurred during matching
}

// MARK: - Batch Compare Modes
enum BatchCompareMode: String, CaseIterable {
    case findPhotos = "FIND_PHOTOS"    // Find photos of current user
    case sendPhotos = "SEND_PHOTOS"    // Send photos to another user
}

// MARK: - Icon URLs
struct IconURLs {
    static let allPhotos = "https://rosebud.ai/assets/iCloud-icon.png?qh8y"
    static let photosOfYou = "https://play.rosebud.ai/assets/icon-you-selfie.png?MQtz"
    static let findPhotos = "https://play.rosebud.ai/assets/icon-search.png?mQKb"
    static let sendPhotos = "https://play.rosebud.ai/assets/icon-send-no-bg.png?b4PE"
    static let whiteArrow = "https://rosebud.ai/assets/arrow-white.png?EJbv" // Added new arrow asset
}

// MARK: - Service Protocols
protocol AuthServiceProtocol {
    func handleReturningUser() async throws -> SessionResult
    func logout() async throws -> LogoutResult
    func login() async throws -> SessionResult
    func refreshToken() async throws -> SessionResult
}
