import Foundation
import SwiftUI
import Combine
import GoogleSignIn
import UIKit

@MainActor
class AppState: ObservableObject {
    // MARK: - Published Properties
    @Published var currentUser: User?
    @Published var currentView: ViewState = .landing
    @Published var isLoading: Bool = true
    @Published var availableTags: [String] = []
    @Published var isAppInForeground: Bool = true
    
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
    
    // MARK: - Chunking State
    @Published var isChunkingEnabled: Bool = false
    @Published var chunkingProgress: ChunkingProgress?
    @Published var currentChunkIndex: Int = 0
    @Published var totalChunks: Int = 0
    
    // MARK: - User Search State
    @Published var allUsers: [User] = []
    @Published var isFetchingUsers: Bool = false
    @Published var fetchUsersError: Error?
    @Published var selectedTargetUser: User?
    @Published var batchCompareMode: BatchCompareMode = .findPhotos
    
    // MARK: - Photo Download State
    @Published var isDownloadingPhotos: Bool = false
    @Published var downloadProgress: Double = 0.0
    @Published var downloadResult: PhotoDownloadResult?
    @Published var downloadError: Error?
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let authService = AuthService()
    private let googleOAuthService = GoogleOAuthService()
    private let userService = UserService()
    private let photosService = PhotosService()
    private let faceApiService = FaceApiService()
    private let photoDownloadService = PhotoDownloadService()
    private let chunkingService = BatchCompareChunkingService()
    
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
            await checkReturningUser()
        }
        setupAppStateTracking()
    }
    
    // MARK: - App State Tracking
    private func setupAppStateTracking() {
        // Listen for app state changes
        NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.isAppInForeground = true
            if FeatureFlags.enableDebugLogNotifications {
                print("[AppState] App entered foreground - isAppInForeground: true")
            }
        }
        
        NotificationCenter.default.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.isAppInForeground = false
            if FeatureFlags.enableDebugLogNotifications {
                print("[AppState] App entered background - isAppInForeground: false")
            }
        }
        
        // Set initial state
        isAppInForeground = UIApplication.shared.applicationState == .active
        if FeatureFlags.enableDebugLogNotifications {
            print("[AppState] Initial app state - isAppInForeground: \(isAppInForeground)")
        }
    }
    
    deinit {
        // Clean up notification observers
        NotificationCenter.default.removeObserver(self)
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
        
        if FeatureFlags.enableDebugLogICloudPhotos {
            print("[DEBUG][AppState] After Google sign-in - photos.count: \(photos.count)")
        }
        
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
        
        // Reset all photo-related state
        print("[AppState] Resetting photo state for clean logout")
        // Removed verbose before reset logging
        
        photos = []
        isFetchingPhotos = false
        fetchPhotosError = nil
        hasMorePhotos = true
        
        photosOfYou = []
        isFetchingPhotosOfYou = false
        fetchPhotosOfYouError = nil
        hasMorePhotosOfYou = true
        photosOfYouInitialFetchComplete = false
        
        // Removed verbose after reset logging
        
        // Reset batch compare state
        isBatchCompareModalPresented = false
        isBatchComparing = false
        batchCompareProgress = 0.0
        matchesAttempted = 0
        batchCompareState = .waiting
        batchCompareResults = []
        batchCompareError = nil
        selectedSourcePhoto = nil
        selectedTargetPhotos = []
        
        // Reset user search state
        allUsers = []
        isFetchingUsers = false
        fetchUsersError = nil
        selectedTargetUser = nil
        batchCompareMode = .findPhotos
        
        // Reset available tags
        availableTags = []
        
        // Reset download state
        isDownloadingPhotos = false
        downloadProgress = 0.0
        downloadResult = nil
        downloadError = nil
        
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
            // Load all photos at once instead of using pagination
            let result = try await photosService.fetchPhotosOfUser(userId: String(user.id))
            if FeatureFlags.enableDebugLogServerPhotos {
                print("[DEBUG][AppState] ✅ Successfully fetched \(result.photos.count) photos of user")
                print("[DEBUG][AppState] 📊 Result details - Has more: \(result.hasMore), Total: \(result.total ?? 0)")
            }
            photosOfYou = result.photos
            // Photos of You tab now loads all photos at once, so no pagination needed
            hasMorePhotosOfYou = false
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
    
    // loadMorePhotosOfUser function removed - Photos of You tab now loads all photos at once
    
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
    func startBatchCompareWithPermissionCheck(sourcePhoto: Photo, targetPhotos: [Photo]) async -> Bool {
        // Check notification permission first
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        
        if FeatureFlags.enableDebugLogNotifications {
            print("[AppState] Batch compare permission check - status: \(settings.authorizationStatus.rawValue)")
        }
        
        // If notifications are disabled and we should show the modal, return false to indicate modal should be shown
        if (settings.authorizationStatus == .denied || settings.authorizationStatus == .notDetermined) && FeatureFlags.enablePushNotifications && FeatureFlags.showNotificationPermissionModal {
            if FeatureFlags.enableDebugLogNotifications {
                print("[AppState] Notification permission needed, should show modal")
            }
            return false
        }
        
        // Permission is granted or not needed, proceed with batch compare
        if FeatureFlags.enableDebugLogNotifications {
            print("[AppState] Notification permission OK, starting batch compare")
        }
        await startBatchCompare(sourcePhoto: sourcePhoto, targetPhotos: targetPhotos)
        return true
    }
    
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
        
        // Reset chunking state
        isChunkingEnabled = false
        chunkingProgress = nil
        currentChunkIndex = 0
        totalChunks = 0
        
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[AppState] Starting batch compare with \(targetPhotos.count) target photos")
        }
        
        if FeatureFlags.enableDebugBatchCompareModal {
            print("[BatchCompareModal] State transition: WAITING → MATCHING")
        }
        
        // Determine if we should use chunking
        let shouldUseChunking = targetPhotos.count > ChunkingConfig.maxChunkSize
        
        if shouldUseChunking {
            await performChunkedBatchCompare(sourcePhoto: sourcePhoto, targetPhotos: targetPhotos)
        } else {
            await performSingleBatchCompare(sourcePhoto: sourcePhoto, targetPhotos: targetPhotos)
        }
        
        isBatchComparing = false
    }
    
    
    // MARK: - Chunked Batch Compare
    private func performChunkedBatchCompare(sourcePhoto: Photo, targetPhotos: [Photo]) async {
        isChunkingEnabled = true
        
        if FeatureFlags.enableDebugLogBatchChunking {
            print("[AppState] Using chunked batch compare for \(targetPhotos.count) photos")
        }
        
        let results = await chunkingService.processBatchInChunks(
            sourcePhoto: sourcePhoto,
            targetPhotos: targetPhotos
        ) { progress in
            // Update progress on main thread
            Task { @MainActor in
                self.chunkingProgress = progress
                self.currentChunkIndex = progress.currentChunkIndex
                self.totalChunks = progress.totalChunks
                self.batchCompareProgress = progress.overallProgress
                
                // Don't update batchCompareResults until all chunks are complete
                // This prevents UI from updating after each chunk
                
                if FeatureFlags.enableDebugLogBatchChunking {
                    print("[AppState] Chunking progress: \(progress.completedChunks)/\(progress.totalChunks) chunks, \(String(format: "%.1f", progress.overallProgress * 100))%")
                }
            }
        }
        
        // Process results only after ALL chunks are complete
        await processBatchCompareResults(results, targetPhotos: targetPhotos)
    }
    
    // MARK: - Single Batch Compare (Original Logic)
    private func performSingleBatchCompare(sourcePhoto: Photo, targetPhotos: [Photo]) async {
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[AppState] Using single batch compare for \(targetPhotos.count) photos")
        }
        
        do {
            // Convert source photo to image data
            guard let sourceImageData = await convertPhotoToImageData(sourcePhoto) else {
                batchCompareError = "Failed to load source image"
                batchCompareState = .error
                return
            }
            
            // Convert all target photos to image data
            var targetImageDataArray: [Data] = []
            var validTargetPhotos: [Photo] = []
            
            for (index, targetPhoto) in targetPhotos.enumerated() {
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[AppState] 🔍 Converting target \(index + 1)/\(targetPhotos.count): \(targetPhoto.mediaItemId)")
                }
                
                guard let targetImageData = await convertPhotoToImageData(targetPhoto) else {
                    if FeatureFlags.enableDebugBatchCompareModal {
                        print("[BatchCompareModal] Failed to load target image data for: \(targetPhoto.mediaItemId)")
                    }
                    continue
                }
                
                targetImageDataArray.append(targetImageData)
                validTargetPhotos.append(targetPhoto)
            }
            
            guard !targetImageDataArray.isEmpty else {
                batchCompareError = "Failed to load any target images"
                batchCompareState = .error
                return
            }
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Prepared \(targetImageDataArray.count) target images for batch processing")
            }
            
            // Perform batch face comparison
            let batchResponse = try await faceApiService.batchCompareFacesWithApi(
                sourceImageData: sourceImageData,
                targetImageDataArray: targetImageDataArray
            )
            
            // Map results back to photos
            var allResults: [BatchCompareResult] = []
            
            for (index, result) in batchResponse.results.enumerated() {
                guard index < validTargetPhotos.count else { break }
                
                let targetPhoto = validTargetPhotos[index]
                
                // Create a new BatchCompareResult with the actual photo object
                let batchResult = BatchCompareResult(
                    targetFileName: result.targetFileName,
                    photo: targetPhoto, // Use the actual photo instead of placeholder
                    faceMatches: result.faceMatches,
                    unmatchedFaces: result.unmatchedFaces,
                    sourceFaceCount: result.sourceFaceCount,
                    targetFaceCount: result.targetFaceCount,
                    error: result.error,
                    rejected: result.rejected
                )
                
                allResults.append(batchResult)
            }
            
            // Add error results for photos that couldn't be converted
            for targetPhoto in targetPhotos {
                if !validTargetPhotos.contains(where: { $0.id == targetPhoto.id }) {
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
                }
            }
            
            // Process results
            await processBatchCompareResults(allResults, targetPhotos: targetPhotos)
            
        } catch {
            batchCompareError = "Batch comparison failed: \(error.localizedDescription)"
            batchCompareState = .error
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[BatchCompareModal] State transition: MATCHING → ERROR (exception)")
            }
            print("[AppState] Error during batch compare:", error)
        }
    }
    
    // MARK: - Process Batch Compare Results
    private func processBatchCompareResults(_ allResults: [BatchCompareResult], targetPhotos: [Photo]) async {
        batchCompareProgress = 1.0
        batchCompareResults = allResults
        
        if FeatureFlags.enableDebugLogFaceDetection {
            let successfulComparisons = allResults.filter { $0.error == nil || $0.error == "No faces detected in target image" }.count
            let failedComparisons = allResults.filter { $0.error != nil && $0.error != "No faces detected in target image" }.count
            print("[AppState] Batch compare completed: \(successfulComparisons) successful, \(failedComparisons) failed")
            print("[AppState] Results breakdown:")
            for (index, result) in allResults.enumerated() {
                print("  [\(index)] \(result.targetFileName): \(result.faceMatches.count) matches, error: \(result.error ?? "none")")
            }
        }
        
        // Determine state based on results
        let matchingResults = allResults.filter { !$0.faceMatches.isEmpty }
        let hasAnyMatches = !matchingResults.isEmpty
        
        // Check if there were any actual technical failures (not just "no faces detected")
        let technicalFailures = allResults.filter { $0.error != nil && $0.error != "No faces detected in target image" }
        let hasTechnicalFailures = !technicalFailures.isEmpty
        
        if hasTechnicalFailures && technicalFailures.count == targetPhotos.count {
            // All comparisons failed due to technical issues (API errors, network, etc.)
            batchCompareError = "All \(targetPhotos.count) image comparisons failed"
            batchCompareState = .error
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[BatchCompareModal] State transition: MATCHING → ERROR (all failed)")
            }
        } else if hasTechnicalFailures {
            // Some comparisons had technical issues, but others succeeded
            batchCompareError = "\(technicalFailures.count) of \(targetPhotos.count) comparisons had issues"
            batchCompareState = .matched
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[BatchCompareModal] State transition: MATCHING → MATCHED (partial success)")
            }
        } else {
            // All comparisons completed successfully (regardless of whether matches were found)
            batchCompareState = .matched
            if FeatureFlags.enableDebugBatchCompareModal {
                if hasAnyMatches {
                    print("[BatchCompareModal] State transition: MATCHING → MATCHED (found \(matchingResults.count) matches)")
                } else {
                    print("[BatchCompareModal] State transition: MATCHING → MATCHED (no matches found)")
                }
            }
        }
        
        // Send notification for batch compare completion
        if FeatureFlags.enablePushNotifications {
            let matchCount = allResults.filter { !$0.faceMatches.isEmpty }.count
            
            // Only send notification if app is not in foreground (when feature flag is enabled)
            let shouldSkipNotification = FeatureFlags.skipBatchCompareNotificationsWhenInForeground && isAppInForeground
            
            if !shouldSkipNotification {
                if FeatureFlags.enableDebugLogNotifications {
                    print("[AppState] Sending batch compare notification with \(matchCount) matches")
                }
                NotificationService.shared.sendBatchCompareCompleteNotification(matchCount: matchCount)
            }
        }
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
        
        // Reset chunking state
        isChunkingEnabled = false
        chunkingProgress = nil
        currentChunkIndex = 0
        totalChunks = 0
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
                // For iCloud photos, we need to update the existing photo in our array
                // rather than creating a new one from the service
                if let index = photos.firstIndex(where: { $0.mediaItemId == result.photo.mediaItemId }) {
                    // Update the existing photo with the new photoOf value
                    let originalPhoto = photos[index]
                    let updatedPhoto = Photo(
                        id: originalPhoto.id,
                        mediaItemId: originalPhoto.mediaItemId,
                        userId: originalPhoto.userId,
                        photoOf: targetUserId, // Update the photoOf field
                        altText: originalPhoto.altText,
                        tags: originalPhoto.tags,
                        baseUrl: originalPhoto.baseUrl,
                        mimeType: originalPhoto.mimeType,
                        width: originalPhoto.width,
                        height: originalPhoto.height,
                        creationTime: originalPhoto.creationTime,
                        createdAt: originalPhoto.createdAt,
                        updatedAt: Date(),
                        s3Key: originalPhoto.s3Key,
                        s3Url: originalPhoto.s3Url,
                        sharedAt: originalPhoto.sharedAt
                    )
                    
                    // Update the photo in our local array
                    photos[index] = updatedPhoto
                    
                    if FeatureFlags.enableDebugLogPhotoUpload {
                        print("[AppState] Updated photo \(result.photo.mediaItemId) with photoOf: \(targetUserId)")
                    }
                    
                } else {
                    // Photo not found in local array, try the service method
                    let updatedPhoto = try await photosService.updatePhotoSubject(
                        mediaItemId: result.photo.mediaItemId,
                        photoOf: targetUserId
                    )
                    
                    // Update the photo in our local photos array
                    await updateSinglePhotoMetadata(updatedPhoto)
                    
                }
                
            } catch {
                failedUpdates += 1
                if FeatureFlags.enableDebugLogPhotoUpload {
                    print("[AppState] Failed to update photo metadata for \(result.photo.mediaItemId): \(error)")
                }
            }
        }
        
        // If this is send photos mode, start S3 upload in background (don't await)
        if batchCompareMode == .sendPhotos && !matchingResults.isEmpty {
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[AppState] Starting background S3 upload for \(matchingResults.count) photos to user \(targetUserId)")
            }
            Task {
                await uploadMatchedPhotosToS3(matchingResults: matchingResults, sharedWithUserId: targetUserId)
                if FeatureFlags.enableDebugLogPhotoUpload {
                    print("[AppState] Background S3 upload completed for user \(targetUserId)")
                }
            }
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
        // Handle iCloud photos
        if photo.baseUrl.hasPrefix("icloud://") {
            do {
                let iCloudService = ICloudPhotoService()
                guard let asset = try await iCloudService.getPhotoAsset(for: photo) else {
                    return nil
                }
                
                let targetSize = CGSize(width: 1920, height: 1920) // High quality for face detection
                guard let image = try await iCloudService.loadImageFromAsset(asset, targetSize: targetSize) else {
                    return nil
                }
                
                // Convert UIImage to Data
                guard let imageData = image.jpegData(compressionQuality: 0.9) else {
                    return nil
                }
                
                return imageData
                
            } catch {
                return nil
            }
        }
        
        // Handle regular HTTP URLs
        guard let url = URL(string: photo.baseUrl) else {
            return nil
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return data
        } catch {
            return nil
        }
    }
    
    // MARK: - Photo Download Methods
    func downloadPhotosOfYouToLibrary() async {
        guard !photosOfYou.isEmpty else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] No photos of you to download")
            }
            return
        }
        
        // Filter to only S3 photos
        let s3Photos = photosOfYou.filter { $0.s3Url != nil && !$0.s3Url!.isEmpty }
        
        guard !s3Photos.isEmpty else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] No S3 photos found in photos of you")
            }
            return
        }
        
        if FeatureFlags.enableDebugLogPhotoDownload {
            print("[AppState] Starting download of \(s3Photos.count) S3 photos to library")
        }
        
        isDownloadingPhotos = true
        downloadProgress = 0.0
        downloadResult = nil
        downloadError = nil
        
        do {
            let result = try await photoDownloadService.downloadMultiplePhotosToLibrary(s3Photos)
            
            await MainActor.run {
                self.downloadResult = result
                self.downloadProgress = 1.0
                self.isDownloadingPhotos = false
            }
            
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] Download completed: \(result.summary)")
            }
            
        } catch {
            await MainActor.run {
                self.downloadError = error
                self.isDownloadingPhotos = false
            }
            
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] Download failed: \(error)")
            }
        }
    }
    
    func downloadSinglePhotoToLibrary(_ photo: Photo) async {
        guard let s3Url = photo.s3Url, !s3Url.isEmpty else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] Photo is not an S3 photo: \(photo.mediaItemId)")
            }
            return
        }
        
        if FeatureFlags.enableDebugLogPhotoDownload {
            print("[AppState] Starting download of single photo: \(photo.mediaItemId)")
        }
        
        isDownloadingPhotos = true
        downloadProgress = 0.0
        downloadResult = nil
        downloadError = nil
        
        do {
            let success = try await photoDownloadService.downloadPhotoToLibrary(photo)
            
            await MainActor.run {
                self.downloadProgress = 1.0
                self.isDownloadingPhotos = false
                
                if success {
                    self.downloadResult = PhotoDownloadResult(
                        success: true,
                        downloadedCount: 1,
                        failedCount: 0,
                        errors: []
                    )
                } else {
                    self.downloadError = PhotoDownloadServiceError.saveFailed
                }
            }
            
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] Single photo download completed: \(success)")
            }
            
        } catch {
            await MainActor.run {
                self.downloadError = error
                self.isDownloadingPhotos = false
            }
            
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[AppState] Single photo download failed: \(error)")
            }
        }
    }
    
    // MARK: - Helper Methods
    private func clearLocalStorage() {
        UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
        UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.userData)
    }
} 