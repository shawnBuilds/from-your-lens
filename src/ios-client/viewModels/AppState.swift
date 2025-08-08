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
    
    // MARK: - Chunked Batch Compare State
    @Published var batchJobId: String?
    @Published var batchJobProgress: Double = 0.0
    @Published var batchJobStatus: BatchJobStatus = .pending
    @Published var batchJobEstimatedTimeRemaining: TimeInterval?
    @Published var isPollingBatchJobStatus: Bool = false
    
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
    private var batchJobStatusTimer: Timer?
    
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
        
        // Clean up batch job status polling (invalidate timer directly)
        batchJobStatusTimer?.invalidate()
        batchJobStatusTimer = nil
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
    
    // MARK: - Chunked Batch Compare Helper Methods
    
    private func calculateOptimalChunkSize(for targetPhotos: [Photo]) async -> Int {
        // Start with the configured chunk size
        var chunkSize = FeatureFlags.maxBatchChunkSize
        
        // If we have fewer photos than the max chunk size, use all of them
        if targetPhotos.count <= chunkSize {
            return targetPhotos.count
        }
        
        // Calculate total size of all target photos to determine optimal chunking
        var totalSize: Int64 = 0
        var photoSizes: [Int] = []
        
        for photo in targetPhotos {
            if let imageData = await convertPhotoToImageData(photo) {
                let size = imageData.count
                totalSize += Int64(size)
                photoSizes.append(size)
            }
        }
        
        // If total size is small, we can use larger chunks
        let averageSize = totalSize / Int64(targetPhotos.count)
        let maxPhotosPerChunk = Int(FeatureFlags.maxBatchChunkSizeBytes / Int(averageSize))
        
        // Use the smaller of: configured chunk size, calculated optimal size, or total photos
        chunkSize = min(chunkSize, maxPhotosPerChunk, targetPhotos.count)
        
        // Ensure minimum chunk size of 1
        return max(chunkSize, 1)
    }
    
    private func createChunks(from targetPhotos: [Photo], chunkSize: Int) -> [[Photo]] {
        var chunks: [[Photo]] = []
        var currentChunk: [Photo] = []
        
        for photo in targetPhotos {
            currentChunk.append(photo)
            
            if currentChunk.count >= chunkSize {
                chunks.append(currentChunk)
                currentChunk = []
            }
        }
        
        // Add any remaining photos as the last chunk
        if !currentChunk.isEmpty {
            chunks.append(currentChunk)
        }
        
        return chunks
    }
    
    private func startBatchJobStatusPolling() {
        guard let jobId = batchJobId else { return }
        
        isPollingBatchJobStatus = true
        
        batchJobStatusTimer = Timer.scheduledTimer(withTimeInterval: FeatureFlags.batchJobStatusPollInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.pollBatchJobStatus(jobId: jobId)
            }
        }
        
        if FeatureFlags.enableDebugLogBatchCompare {
            print("[AppState] Started polling batch job status for: \(jobId)")
        }
    }
    
    private func stopBatchJobStatusPolling() {
        batchJobStatusTimer?.invalidate()
        batchJobStatusTimer = nil
        isPollingBatchJobStatus = false
        
        if FeatureFlags.enableDebugLogBatchCompare {
            print("[AppState] Stopped polling batch job status")
        }
    }
    
    private func pollBatchJobStatus(jobId: String) async {
        do {
            let statusResponse = try await faceApiService.getBatchJobStatus(jobId: jobId)
            
            await MainActor.run {
                self.batchJobProgress = statusResponse.progress
                self.batchJobStatus = statusResponse.job.status
                self.batchJobEstimatedTimeRemaining = statusResponse.estimatedTimeRemaining
                
                // Update overall progress
                self.batchCompareProgress = statusResponse.progress / 100.0
                
                if FeatureFlags.enableDebugLogBatchCompare {
                    print("[AppState] Batch job status update - Progress: \(statusResponse.progress)%, Status: \(statusResponse.job.status)")
                }
                
                // Check if job is completed
                if statusResponse.job.status == .completed {
                    self.handleBatchJobCompletion(statusResponse: statusResponse)
                } else if statusResponse.job.status == .failed {
                    self.handleBatchJobFailure(error: "Batch job failed")
                }
            }
            
        } catch {
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[AppState] Error polling batch job status: \(error)")
            }
        }
    }
    
    private func handleBatchJobCompletion(statusResponse: BatchJobStatusResponse) {
        stopBatchJobStatusPolling()
        
        // Get all results from the batch job
        if let summary = statusResponse.summary {
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[AppState] Batch job completed - Total processed: \(summary.totalProcessed), Matches: \(summary.totalMatches)")
            }
            
            // Update state
            batchCompareProgress = 1.0
            batchCompareState = .matched
            
            // Note: The actual results will be aggregated from all chunks
            // For now, we'll keep the existing results from individual chunks
        }
        
        isBatchComparing = false
    }
    
    private func handleBatchJobFailure(error: String) {
        stopBatchJobStatusPolling()
        
        batchCompareError = error
        batchCompareState = .error
        isBatchComparing = false
        
        if FeatureFlags.enableDebugLogBatchCompare {
            print("[AppState] Batch job failed: \(error)")
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
        
        // Reset chunked batch compare state
        batchJobId = nil
        batchJobProgress = 0.0
        batchJobStatus = .pending
        batchJobEstimatedTimeRemaining = nil
        stopBatchJobStatusPolling()
        
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[AppState] Starting batch compare with \(targetPhotos.count) target photos")
        }
        
        if FeatureFlags.enableDebugBatchCompareModal {
            print("[BatchCompareModal] State transition: WAITING → MATCHING")
        }
        
        // Check if chunked processing is enabled
        if FeatureFlags.enableChunkedBatchCompare && targetPhotos.count > FeatureFlags.maxBatchChunkSize {
            await startChunkedBatchCompare(sourcePhoto: sourcePhoto, targetPhotos: targetPhotos)
        } else {
            await startRegularBatchCompare(sourcePhoto: sourcePhoto, targetPhotos: targetPhotos)
        }
    }
    
    private func startChunkedBatchCompare(sourcePhoto: Photo, targetPhotos: [Photo]) async {
        if FeatureFlags.enableDebugLogBatchCompare {
            print("[AppState] Starting CHUNKED batch compare with \(targetPhotos.count) target photos")
        }
        
        do {
            // Convert source photo to image data
            guard let sourceImageData = await convertPhotoToImageData(sourcePhoto) else {
                batchCompareError = "Failed to load source image"
                batchCompareState = .error
                isBatchComparing = false
                return
            }
            
            // Calculate optimal chunk size
            let chunkSize = await calculateOptimalChunkSize(for: targetPhotos)
            let chunks = createChunks(from: targetPhotos, chunkSize: chunkSize)
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[AppState] Created \(chunks.count) chunks with \(chunkSize) photos per chunk")
            }
            
            // Create batch job
            guard let currentUser = currentUser else {
                batchCompareError = "No current user available"
                batchCompareState = .error
                isBatchComparing = false
                return
            }
            
            let batchJob = try await faceApiService.createBatchJob(
                sourceImageData: sourceImageData,
                totalTargetCount: chunks.count,
                userId: currentUser.id
            )
            
            await MainActor.run {
                self.batchJobId = batchJob.id
                self.batchJobStatus = batchJob.status
            }
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[AppState] Created batch job: \(batchJob.id) with \(chunks.count) total chunks")
            }
            
            // Start polling for job status
            startBatchJobStatusPolling()
            
            // Send chunks in parallel (limited by maxConcurrentChunks)
            let semaphore = DispatchSemaphore(value: FeatureFlags.maxConcurrentChunks)
            var allResults: [BatchCompareResult] = []
            var chunkErrors: [Error] = []
            
            await withTaskGroup(of: Void.self) { group in
                for (chunkIndex, chunk) in chunks.enumerated() {
                    group.addTask {
                        await semaphore.wait()
                        defer { semaphore.signal() }
                        
                        do {
                            // Convert chunk photos to image data
                            var chunkImageData: [Data] = []
                            var validChunkPhotos: [Photo] = []
                            
                            for photo in chunk {
                                if let imageData = await self.convertPhotoToImageData(photo) {
                                    chunkImageData.append(imageData)
                                    validChunkPhotos.append(photo)
                                }
                            }
                            
                            guard !chunkImageData.isEmpty else {
                                if FeatureFlags.enableDebugLogBatchCompare {
                                    print("[AppState] Chunk \(chunkIndex + 1) has no valid images")
                                }
                                return
                            }
                            
                            if FeatureFlags.enableDebugLogBatchCompare {
                                print("[AppState] Sending chunk \(chunkIndex + 1)/\(chunks.count) with \(chunkImageData.count) images")
                            }
                            
                            // Send chunk to server
                            let chunkResponse = try await self.faceApiService.sendBatchChunk(
                                jobId: batchJob.id,
                                sourceImageData: sourceImageData,
                                targetImageDataArray: chunkImageData
                            )
                            
                            // Map results back to photos
                            for (index, result) in chunkResponse.results.enumerated() {
                                guard index < validChunkPhotos.count else { break }
                                
                                let targetPhoto = validChunkPhotos[index]
                                let batchResult = BatchCompareResult(
                                    targetFileName: result.targetFileName,
                                    photo: targetPhoto,
                                    faceMatches: result.faceMatches,
                                    unmatchedFaces: result.unmatchedFaces,
                                    sourceFaceCount: result.sourceFaceCount,
                                    targetFaceCount: result.targetFaceCount,
                                    error: result.error,
                                    rejected: result.rejected
                                )
                                
                                await MainActor.run {
                                    allResults.append(batchResult)
                                }
                            }
                            
                            if FeatureFlags.enableDebugLogBatchCompare {
                                print("[AppState] Chunk \(chunkIndex + 1) completed: \(chunkResponse.successfulComparisons) successful, \(chunkResponse.failedComparisons) failed")
                            }
                            
                        } catch {
                            if FeatureFlags.enableDebugLogBatchCompare {
                                print("[AppState] Chunk \(chunkIndex + 1) failed: \(error)")
                            }
                            await MainActor.run {
                                chunkErrors.append(error)
                            }
                        }
                    }
                }
            }
            
            // Update results
            await MainActor.run {
                self.batchCompareResults = allResults
                
                if FeatureFlags.enableDebugLogBatchCompare {
                    print("[AppState] Chunked batch compare completed: \(allResults.count) total results, \(chunkErrors.count) chunk errors")
                }
            }
            
        } catch {
            await MainActor.run {
                self.batchCompareError = error.localizedDescription
                self.batchCompareState = .error
                self.isBatchComparing = false
                self.stopBatchJobStatusPolling()
            }
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[AppState] Error during chunked batch compare: \(error)")
            }
        }
    }
    
    private func startRegularBatchCompare(sourcePhoto: Photo, targetPhotos: [Photo]) async {
        if FeatureFlags.enableDebugLogBatchCompare {
            print("[AppState] Starting REGULAR batch compare with \(targetPhotos.count) target photos")
        }
        
        do {
            // Convert source photo to image data
            guard let sourceImageData = await convertPhotoToImageData(sourcePhoto) else {
                batchCompareError = "Failed to load source image"
                batchCompareState = .error
                isBatchComparing = false
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
                isBatchComparing = false
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
            
            batchCompareProgress = 1.0
            batchCompareResults = allResults
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[AppState] Batch compare completed: \(batchResponse.successfulComparisons) successful, \(batchResponse.failedComparisons) failed")
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
                } else {
                    if FeatureFlags.enableDebugLogNotifications {
                        print("[AppState] App is in foreground, skipping batch compare notification (user will see results directly)")
                    }
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
        
        // Reset chunked batch compare state
        batchJobId = nil
        batchJobProgress = 0.0
        batchJobStatus = .pending
        batchJobEstimatedTimeRemaining = nil
        stopBatchJobStatusPolling()
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