import Foundation
import SwiftUI
import Combine
import GoogleSignIn

@MainActor
class AppState: ObservableObject {
    // MARK: - Published Properties
    @Published var currentUser: User?
    @Published var currentView: ViewState = .landing
    @Published var isLoading: Bool = true
    @Published var availableTags: [String] = []
    
    // MARK: - Asset Preloading
    var assetPreloadingService: AssetPreloadingService {
        return _assetPreloadingService
    }
    
    // MARK: - Photo State
    @Published var photos: [Photo] = []
    @Published var isFetchingPhotos: Bool = false
    @Published var fetchPhotosError: Error?
    @Published var hasMorePhotos: Bool = true
    
    // MARK: - Photos of You State
    @Published var photosOfYou: [Photo] = []
    @Published var isFetchingPhotosOfYou: Bool = false
    @Published var fetchPhotosOfYouError: Error?
    @Published var hasMorePhotosOfYou: Bool = true
    @Published var photosOfYouInitialFetchComplete: Bool = false
    
    // MARK: - Batch Compare State
    @Published var isBatchCompareModalPresented: Bool = false
    @Published var isBatchComparing: Bool = false
    @Published var batchCompareProgress: Double = 0.0
    @Published var matchesAttempted: Int = 0
    @Published var batchCompareState: BatchCompareState = .waiting
    @Published var batchCompareResults: [BatchCompareResult] = []
    @Published var batchCompareError: String?
    @Published var selectedSourcePhoto: Photo?
    @Published var selectedTargetPhotos: [Photo] = []
    
    // MARK: - User Search State
    @Published var allUsers: [User] = []
    @Published var isFetchingUsers: Bool = false
    @Published var fetchUsersError: Error?
    @Published var selectedTargetUser: User?
    @Published var batchCompareMode: BatchCompareMode = .findPhotos
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let authService = AuthService()
    private let googleOAuthService = GoogleOAuthService()
    private let userService = UserService()
    private let photosService = PhotosService()
    private let faceApiService = FaceApiService()
    private let _assetPreloadingService = AssetPreloadingService()
    
    // MARK: - Initialization
    init() {
        setupBindings()
        initializeApp()
    }
    
    // MARK: - Setup
    private func setupBindings() {
        // Update available tags when photos change
        $photos
            .map { photos in
                let allTags = photos.compactMap { $0.tags }.flatMap { $0 }
                return Array(Set(allTags)).sorted()
            }
            .assign(to: \.availableTags, on: self)
            .store(in: &cancellables)
    }
    
    // MARK: - App Initialization
    private func initializeApp() {
        Task {
            if FeatureFlags.enableAssetPreloading {
                await initializeWithAssetPreloading()
            } else {
                await checkReturningUser()
            }
        }
    }
    
    private func initializeWithAssetPreloading() async {
        if FeatureFlags.enableDebugLogAssetPreloading {
            print("[AppState] Starting app initialization with asset preloading")
        }
        
        // Start asset preloading
        await _assetPreloadingService.startPreloading()
        
        // Wait for preloading to complete
        while case .inProgress = _assetPreloadingService.preloadingState {
            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        }
        
        if FeatureFlags.enableDebugLogAssetPreloading {
            print("[AppState] Asset preloading completed, proceeding with user check")
        }
        
        // Now proceed with normal initialization
        await checkReturningUser()
    }
    
    // MARK: - User Authentication
    private func checkReturningUser() async {
        // Check for existing Google OAuth session
        await googleOAuthService.checkForExistingSignIn()
        
        if googleOAuthService.isAuthenticated, let user = googleOAuthService.currentUser {
            print("[AppState] Found existing Google OAuth session for user:", user.email)
            currentUser = user
            currentView = .photos
            
            // Fetch photos based on feature flags
            await fetchPhotosForUser(user)
        } else {
            // Fallback to legacy auth service
        do {
            let result = try await authService.handleReturningUser()
            if result.sessionValid, let user = result.user {
                currentUser = user
                currentView = .photos
                
                // Fetch photos based on feature flags
                await fetchPhotosForUser(user)
            } else {
                currentView = .landing
            }
        } catch {
            print("[AppState] Error checking returning user:", error)
            currentView = .landing
            }
        }
        
        isLoading = false
    }
    
    // MARK: - Photo Fetching Logic
    private func fetchPhotosForUser(_ user: User) async {
        if FeatureFlags.enableDebugLogICloudPhotos {
            print("[DEBUG][AppState] Photo fetching will be triggered by PhotosView")
        }
    }
    
    // MARK: - Authentication Methods
    func handleGoogleSignIn() async throws {
        print("[AppState] Initiating Google Sign-In...")
        
        let user = try await googleOAuthService.signIn()
        print("[AppState] Google Sign-In successful for user:", user.email)
        
        // Update current user and navigate to photos
        currentUser = user
        currentView = .photos
        
        // Fetch photos for the user
        await fetchPhotosForUser(user)
    }
    
    func handleAuthSuccess() {
        print("[AppState] Handling successful authentication callback...")
        
        if let userData = UserDefaults.standard.data(forKey: UserDefaultsKeys.userData),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            print("[AppState] Reloaded user data from UserDefaults:", user)
            currentUser = user
            print("[AppState] Current user set. Navigating to PHOTOS view.")
        } else {
            print("[AppState] Auth success callback, but no user data found in UserDefaults. Check AuthService handling.")
        }
        
        currentView = .photos
    }
    
    func handleLogout() async {
        print("[AppState] Initiating logout process...")
        
        do {
            // Sign out from Google OAuth
            try await googleOAuthService.signOut()
            print("[AppState] Google OAuth sign out successful")
        } catch {
            print("[AppState] Error during Google OAuth sign out:", error)
        }
        
        // Also try server logout for cleanup
        do {
            let logoutResult = try await authService.logout()
            if !logoutResult.success {
                print("[AppState] Server logout was not successful or an error occurred. Details:", logoutResult.error ?? "Unknown error")
            }
        } catch {
            print("[AppState] Error during server logout:", error)
        }
        
        print("[AppState] Clearing client-side session data.")
        clearLocalStorage()
        
        currentUser = nil
        currentView = .landing
        print("[AppState] Logout complete. Navigating to LANDING view.")
    }
    
    // MARK: - Profile Picture Methods
    func handleProfilePictureUpdate(tempUserWithObjectURL: User, fileToUpload: Data) async {
        guard let currentUser = currentUser else {
            print("[AppState] Profile picture update called without user.")
            return
        }
        
        print("[AppState] Starting profile picture upload for user:", currentUser.id)
        
        do {
            let uploadResult = try await userService.uploadProfilePicture(fileToUpload)
            
            if uploadResult.success, let updatedUser = uploadResult.user {
                print("[AppState] Profile picture uploaded. New user data:", updatedUser)
                self.currentUser = updatedUser
                
                // Save updated user data
                if let userData = try? JSONEncoder().encode(updatedUser) {
                    UserDefaults.standard.set(userData, forKey: UserDefaultsKeys.userData)
                }
            } else {
                print("[AppState] Profile picture upload failed:", uploadResult.error ?? "Unknown error")
            }
        } catch {
            print("[AppState] Error during profile picture update process:", error)
        }
    }
    
    // MARK: - Photo Management Methods
    func fetchUserPhotos() async {
        guard let user = currentUser else { 
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][AppState] fetchUserPhotos: No current user, returning early")
            }
            return 
        }
        
        isFetchingPhotos = true
        fetchPhotosError = nil
        
        if FeatureFlags.enableDebugLogICloudPhotos {
            print("[DEBUG][AppState] Starting to fetch photos for user: \(user.id)")
        }
        
        do {
            let result = try await photosService.fetchUserPhotos(userId: String(user.id))
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][AppState] Fetched \(result.photos.count) photos from iCloud")
                
                // Log details of first few photos for debugging
                let samplePhotos = Array(result.photos.prefix(3))
                for (index, photo) in samplePhotos.enumerated() {
                    print("[DEBUG][AppState] Sample photo \(index + 1):")
                    print("  - ID: \(photo.id)")
                    print("  - mediaItemId: \(photo.mediaItemId)")
                    print("  - URL: \(photo.baseUrl)")
                    print("  - Creation time: \(photo.creationTime?.description ?? "nil")")
                }
            }
            photos = result.photos
            hasMorePhotos = result.hasMore
        } catch {
            fetchPhotosError = error
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][AppState] Error fetching photos: \(error)")
            }
            print("[AppState] Error fetching user photos:", error)
        }
        
        isFetchingPhotos = false
    }
    
    func loadMorePhotos() async {
        guard let user = currentUser, hasMorePhotos, !isFetchingPhotos else { 
            return 
        }
        
        isFetchingPhotos = true
        
        do {
            let result = try await photosService.loadMorePhotos(userId: String(user.id), offset: photos.count)
            photos.append(contentsOf: result.photos)
            hasMorePhotos = result.hasMore
        } catch {
            fetchPhotosError = error
            print("[AppState] Error loading more photos:", error)
        }
        
        isFetchingPhotos = false
    }
    
    func fetchInitialPhotosOfUser() async {
        guard let user = currentUser else { 
            if FeatureFlags.enableDebugLogServerPhotos {
                print("[DEBUG][AppState] ❌ fetchInitialPhotosOfUser: No current user, returning early")
            }
            return 
        }
        
        if FeatureFlags.enableDebugLogServerPhotos {
            print("[DEBUG][AppState] 🚀 Starting fetchInitialPhotosOfUser for user: \(user.id) (\(user.email))")
        }
        
        isFetchingPhotosOfYou = true
        fetchPhotosOfYouError = nil
        
        do {
            let result = try await photosService.fetchPhotosOfUser(userId: String(user.id))
            if FeatureFlags.enableDebugLogServerPhotos {
                print("[DEBUG][AppState] ✅ Successfully fetched \(result.photos.count) photos of user")
                print("[DEBUG][AppState] 📊 Result details - Has more: \(result.hasMore), Total: \(result.total ?? 0)")
            }
            photosOfYou = result.photos
            hasMorePhotosOfYou = result.hasMore
            photosOfYouInitialFetchComplete = true
        } catch {
            fetchPhotosOfYouError = error
            if FeatureFlags.enableDebugLogServerPhotos {
                print("[DEBUG][AppState] ❌ Error fetching photos of user: \(error)")
            }
            print("[AppState] Error fetching photos of user:", error)
        }
        
        isFetchingPhotosOfYou = false
    }
    
    func loadMorePhotosOfUser() async {
        guard let user = currentUser, hasMorePhotosOfYou, !isFetchingPhotosOfYou else { return }
        
        isFetchingPhotosOfYou = true
        
        do {
            let result = try await photosService.loadMorePhotosOfUser(userId: String(user.id), offset: photosOfYou.count)
            photosOfYou.append(contentsOf: result.photos)
            hasMorePhotosOfYou = result.hasMore
        } catch {
            fetchPhotosOfYouError = error
            print("[AppState] Error loading more photos of user:", error)
        }
        
        isFetchingPhotosOfYou = false
    }
    
    func updateSinglePhotoMetadata(_ photo: Photo) async {
        do {
            let updatedPhoto = try await photosService.updatePhotoMetadata(photo)
            if let index = photos.firstIndex(where: { $0.id == updatedPhoto.id }) {
                photos[index] = updatedPhoto
            }
        } catch {
            print("[AppState] Error updating photo metadata:", error)
        }
    }
    
    // MARK: - Batch Compare Methods
    func startBatchCompare(sourcePhoto: Photo, targetPhotos: [Photo]) async {
        guard !targetPhotos.isEmpty else {
            batchCompareError = "No target photos selected"
            batchCompareState = .error
            return
        }
        
        selectedSourcePhoto = sourcePhoto
        selectedTargetPhotos = targetPhotos
        isBatchComparing = true
        batchCompareProgress = 0.0
        matchesAttempted = 0
        batchCompareResults = []
        batchCompareError = nil
        batchCompareState = .matching
        
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[AppState] Starting batch compare with \(targetPhotos.count) target photos")
        }
        
        if FeatureFlags.enableDebugBatchCompareModal {
            print("[BatchCompareModal] State transition: WAITING → MATCHING")
        }
        
        do {
            // Convert source photo to image data
            guard let sourceImageData = await convertPhotoToImageData(sourcePhoto) else {
                batchCompareError = "Failed to load source image"
                batchCompareState = .error
                isBatchComparing = false
                return
            }
            
            var allResults: [BatchCompareResult] = []
            var successfulComparisons = 0
            var failedComparisons = 0
            
            for (index, targetPhoto) in targetPhotos.enumerated() {
                matchesAttempted = index + 1
                if FeatureFlags.enableDebugBatchCompareModal {
                    print("[AppState] 🎯 matchesAttempted updated: \(matchesAttempted)/\(targetPhotos.count)")
                }
                
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[AppState] 🔍 Comparing target \(index + 1)/\(targetPhotos.count): \(targetPhoto.mediaItemId)")
                    print("[AppState] Target photo details:")
                    print("  - ID: \(targetPhoto.id)")
                    print("  - URL: \(targetPhoto.baseUrl)")
                    print("  - User ID: \(targetPhoto.userId)")
                    print("  - Creation time: \(targetPhoto.creationTime?.description ?? "nil")")
                }
                
                do {
                    // Convert target photo to image data
                    guard let targetImageData = await convertPhotoToImageData(targetPhoto) else {
                        if FeatureFlags.enableDebugBatchCompareModal {
                            print("[BatchCompareModal] Failed to load target image data for: \(targetPhoto.mediaItemId)")
                            print("[BatchCompareModal] Target photo URL: \(targetPhoto.baseUrl)")
                        }
                        let errorResult = BatchCompareResult(
                            targetFileName: targetPhoto.mediaItemId,
                            photo: targetPhoto,
                            faceMatches: [],
                            unmatchedFaces: [],
                            sourceFaceCount: 0,
                            targetFaceCount: 0,
                            error: "Failed to load target image",
                            rejected: true
                        )
                        allResults.append(errorResult)
                        failedComparisons += 1
                        
                        // Update progress after each photo is processed (even if failed to load)
                        let progress = Double(index + 1) / Double(targetPhotos.count)
                        batchCompareProgress = progress
                        
                        continue
                    }
                    
                    // Perform face comparison
                    let comparisonResult = try await faceApiService.compareFacesWithApi(
                        sourceImageData: sourceImageData,
                        targetImageData: targetImageData
                    )
                    
                    if FeatureFlags.enableDebugBatchCompareModal {
                        print("[BatchCompareModal] Creating batch result for: \(targetPhoto.mediaItemId)")
                        print("[BatchCompareModal] Photo URL: \(targetPhoto.baseUrl)")
                        print("[BatchCompareModal] Face matches: \(comparisonResult.faceMatches.count)")
                    }
                    
                    let batchResult = BatchCompareResult(
                        targetFileName: targetPhoto.mediaItemId,
                        photo: targetPhoto,
                        faceMatches: comparisonResult.faceMatches,
                        unmatchedFaces: comparisonResult.unmatchedFaces,
                        sourceFaceCount: comparisonResult.sourceFaceCount,
                        targetFaceCount: comparisonResult.targetFaceCount,
                        error: comparisonResult.error,
                        rejected: false
                    )
                    
                    allResults.append(batchResult)
                    
                    if comparisonResult.error == nil {
                        successfulComparisons += 1
                    } else {
                        failedComparisons += 1
                    }
                    
                    // Update progress after each photo is processed
                    let progress = Double(index + 1) / Double(targetPhotos.count)
                    batchCompareProgress = progress
                    if FeatureFlags.enableDebugBatchCompareModal {
                        print("[AppState] 📊 Progress update: \(Int(progress * 100))% (\(index + 1)/\(targetPhotos.count))")
                    }
                    
                } catch {
                    if FeatureFlags.enableDebugLogFaceDetection {
                        print("[AppState] Error comparing with target \(targetPhoto.mediaItemId): \(error)")
                    }
                    
                    let errorResult = BatchCompareResult(
                        targetFileName: targetPhoto.mediaItemId,
                        photo: targetPhoto,
                        faceMatches: [],
                        unmatchedFaces: [],
                        sourceFaceCount: 0,
                        targetFaceCount: 0,
                        error: error.localizedDescription,
                        rejected: false
                    )
                    allResults.append(errorResult)
                    failedComparisons += 1
                    
                    // Update progress after error
                    let progress = Double(index + 1) / Double(targetPhotos.count)
                    batchCompareProgress = progress
                    if FeatureFlags.enableDebugBatchCompareModal {
                        print("[AppState] 📊 Progress update (error): \(Int(progress * 100))% (\(index + 1)/\(targetPhotos.count))")
                    }
                }
            }
            
            batchCompareProgress = 1.0
            batchCompareResults = allResults
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Batch compare completed: \(successfulComparisons) successful, \(failedComparisons) failed")
            }
            
            // Set error message if all comparisons failed
            if failedComparisons == targetPhotos.count && targetPhotos.count > 0 {
                batchCompareError = "All \(targetPhotos.count) image comparisons failed"
                batchCompareState = .error
                if FeatureFlags.enableDebugBatchCompareModal {
                    print("[BatchCompareModal] State transition: MATCHING → ERROR (all failed)")
                }
            } else if failedComparisons > 0 {
                batchCompareError = "\(failedComparisons) of \(targetPhotos.count) comparisons had issues"
                batchCompareState = .matched
                if FeatureFlags.enableDebugBatchCompareModal {
                    print("[BatchCompareModal] State transition: MATCHING → MATCHED (partial success)")
                }
            } else {
                batchCompareState = .matched
                if FeatureFlags.enableDebugBatchCompareModal {
                    print("[BatchCompareModal] State transition: MATCHING → MATCHED (all successful)")
                }
            }
            
        } catch {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Error during batch compare: \(error)")
            }
            batchCompareError = error.localizedDescription
            batchCompareState = .error
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[BatchCompareModal] State transition: MATCHING → ERROR (exception)")
            }
        }
        
        isBatchComparing = false
    }
    
    func resetBatchCompare() {
        selectedSourcePhoto = nil
        selectedTargetPhotos = []
        batchCompareResults = []
        batchCompareError = nil
        batchCompareProgress = 0.0
        isBatchComparing = false
        matchesAttempted = 0
        batchCompareState = .waiting
        selectedTargetUser = nil
        batchCompareMode = .findPhotos
    }
    
    // MARK: - User Management Methods
    func fetchAllUsers() async {
        guard !isFetchingUsers else { return }
        
        let startTime = Date()
        isFetchingUsers = true
        fetchUsersError = nil
        
        if FeatureFlags.enableDebugBatchCompareModal {
            print("[AppState] Starting user fetch...")
        }
        
        do {
            allUsers = try await userService.getAllUsers()
            let fetchTime = Date().timeIntervalSince(startTime)
            
            if FeatureFlags.enableDebugLogAuth || FeatureFlags.enableDebugLogUser {
                print("[AppState] Successfully fetched \(allUsers.count) users in \(String(format: "%.3f", fetchTime))s")
            }
        } catch {
            fetchUsersError = error
            if FeatureFlags.enableDebugLogAuth || FeatureFlags.enableDebugLogUser {
                print("[AppState] Error fetching users: \(error)")
            }
        }
        
        isFetchingUsers = false
    }
    
    func selectTargetUser(_ user: User) {
        selectedTargetUser = user
        if FeatureFlags.enableDebugLogAuth || FeatureFlags.enableDebugBatchCompareModal {
            print("[AppState] Selected target user: \(user.displayName)")
        }
        
        // Auto-present batch compare modal for send photos mode
        if batchCompareMode == .sendPhotos {
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[AppState] Auto-presenting batch compare modal for send photos mode")
                print("[AppState] Current user photos available: \(photos.count)")
                print("[AppState] Target user: \(user.displayName) (ID: \(user.id))")
                
                // Log sample of available photos for debugging
                let samplePhotos = Array(photos.prefix(3))
                for (index, photo) in samplePhotos.enumerated() {
                    print("[AppState] Sample photo \(index + 1) for batch compare:")
                    print("  - ID: \(photo.id)")
                    print("  - mediaItemId: \(photo.mediaItemId)")
                    print("  - URL: \(photo.baseUrl)")
                }
            }
            isBatchCompareModalPresented = true
        }
    }
    
    func clearTargetUser() {
        selectedTargetUser = nil
        if FeatureFlags.enableDebugLogAuth {
            print("[AppState] Cleared target user")
        }
    }
    
    func confirmMatches() async {
        guard let currentUser = currentUser else {
            return
        }
        
        let matchingResults = batchCompareResults.filter { !$0.faceMatches.isEmpty }
        
        if matchingResults.isEmpty {
            return
        }
        
        var successfulUpdates = 0
        var failedUpdates = 0
        
        // Determine which user ID to assign based on mode
        let targetUserId: Int
        switch batchCompareMode {
        case .findPhotos:
            targetUserId = currentUser.id
        case .sendPhotos:
            guard let selectedUser = selectedTargetUser else {
                print("[AppState] No target user selected for send photos mode")
                return
            }
            targetUserId = selectedUser.id
        }
        
        // First, update photo metadata (photo_of field)
        for result in matchingResults {
            do {
                let updatedPhoto = try await photosService.updatePhotoSubject(
                    mediaItemId: result.photo.mediaItemId,
                    photoOf: targetUserId
                )
                
                // Update the photo in our local photos array
                await updateSinglePhotoMetadata(updatedPhoto)
                
                successfulUpdates += 1
                
            } catch {
                failedUpdates += 1
                if FeatureFlags.enableDebugLogPhotoUpload {
                    print("[AppState] Failed to update photo metadata for \(result.photo.mediaItemId): \(error)")
                }
            }
        }
        
        // If this is send photos mode, upload photos to S3
        if batchCompareMode == .sendPhotos && !matchingResults.isEmpty {
            await uploadMatchedPhotosToS3(matchingResults: matchingResults, sharedWithUserId: targetUserId)
        }
        
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[AppState] Confirmed \(successfulUpdates) matches for user ID: \(targetUserId)")
        }
    }
    
    // MARK: - Photo Upload Methods
    private func uploadMatchedPhotosToS3(matchingResults: [BatchCompareResult], sharedWithUserId: Int) async {
        let photoUploadService = PhotoUploadService()
        let mediaItemIds = matchingResults.map { $0.photo.mediaItemId }
        let photosToUpload = matchingResults.map { $0.photo }
        
        if FeatureFlags.enableDebugLogPhotoUpload {
            print("[AppState] Starting S3 upload for \(mediaItemIds.count) matched photos to user \(sharedWithUserId)")
        }
        
        do {
            let uploadResult = try await photoUploadService.uploadPhotosToS3(
                mediaItemIds: mediaItemIds,
                photos: photosToUpload,
                sharedWithUserId: sharedWithUserId
            )
            
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[AppState] S3 upload completed: \(uploadResult.summary.successful) successful, \(uploadResult.summary.failed) failed")
                
                if !uploadResult.errors.isEmpty {
                    print("[AppState] S3 upload errors:")
                    for error in uploadResult.errors {
                        print("  - \(error.mediaItemId): \(error.error)")
                    }
                }
            }
            
            // Update local photos with S3 URLs for successful uploads
            for result in uploadResult.results {
                if result.success, let s3Url = result.s3Url {
                    await updatePhotoS3Url(mediaItemId: result.mediaItemId, s3Url: s3Url)
                }
            }
            
        } catch {
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[AppState] Error during S3 upload: \(error)")
            }
        }
    }
    
    private func updatePhotoS3Url(mediaItemId: String, s3Url: String) async {
        // Update the photo in our local photos array with the S3 URL
        if let index = photos.firstIndex(where: { $0.mediaItemId == mediaItemId }) {
            // Create updated photo with S3 URL
            let originalPhoto = photos[index]
            let updatedPhoto = Photo(
                id: originalPhoto.id,
                mediaItemId: originalPhoto.mediaItemId,
                userId: originalPhoto.userId,
                photoOf: originalPhoto.photoOf,
                altText: originalPhoto.altText,
                tags: originalPhoto.tags,
                baseUrl: originalPhoto.baseUrl,
                mimeType: originalPhoto.mimeType,
                width: originalPhoto.width,
                height: originalPhoto.height,
                creationTime: originalPhoto.creationTime,
                createdAt: originalPhoto.createdAt,
                updatedAt: originalPhoto.updatedAt,
                s3Key: nil, // We don't store the key locally
                s3Url: s3Url,
                sharedAt: Date()
            )
            
            await MainActor.run {
                photos[index] = updatedPhoto
            }
            
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[AppState] Updated local photo \(mediaItemId) with S3 URL")
            }
        }
    }
    
    private func convertPhotoToImageData(_ photo: Photo) async -> Data? {
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[AppState] Converting photo to image data: \(photo.mediaItemId)")
            print("[AppState] Photo URL: \(photo.baseUrl)")
            print("[AppState] Photo ID: \(photo.id)")
            print("[AppState] Photo userId: \(photo.userId)")
        }
        
        // Handle iCloud photos
        if photo.baseUrl.hasPrefix("icloud://") {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Processing iCloud photo: \(photo.mediaItemId)")
                print("[AppState] Extracted mediaItemId from URL: \(photo.mediaItemId)")
            }
            
            do {
                let iCloudService = ICloudPhotoService()
                guard let asset = try await iCloudService.getPhotoAsset(for: photo) else {
                    if FeatureFlags.enableDebugLogFaceDetection {
                        print("[AppState] ❌ Could not find iCloud asset for photo: \(photo.mediaItemId)")
                        print("[AppState] This will cause face matching to fail")
                    }
                    return nil
                }
                
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[AppState] ✅ Found iCloud asset, loading image data...")
                }
                
                let targetSize = CGSize(width: 1920, height: 1920) // High quality for face detection
                guard let image = try await iCloudService.loadImageFromAsset(asset, targetSize: targetSize) else {
                    if FeatureFlags.enableDebugLogFaceDetection {
                        print("[AppState] ❌ Could not load image from iCloud asset: \(photo.mediaItemId)")
                    }
                    return nil
                }
                
                // Convert UIImage to Data
                guard let imageData = image.jpegData(compressionQuality: 0.9) else {
                    if FeatureFlags.enableDebugLogFaceDetection {
                        print("[AppState] ❌ Could not convert UIImage to Data for: \(photo.mediaItemId)")
                    }
                    return nil
                }
                
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[AppState] ✅ Successfully loaded iCloud image data: \(photo.mediaItemId), size: \(imageData.count) bytes")
                }
                
                return imageData
                
            } catch {
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[AppState] ❌ Error loading iCloud image data for \(photo.mediaItemId): \(error)")
                }
                return nil
            }
        }
        
        // Handle regular HTTP URLs
        guard let url = URL(string: photo.baseUrl) else {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Invalid URL: \(photo.baseUrl)")
            }
            return nil
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Successfully loaded HTTP image data: \(photo.mediaItemId), size: \(data.count) bytes")
            }
            return data
        } catch {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Error converting photo to image data: \(error)")
            }
            return nil
        }
    }
    
    // MARK: - Helper Methods
    private func clearLocalStorage() {
        UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
        UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.userData)
    }
} 