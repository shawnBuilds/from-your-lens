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
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let authService = AuthService()
    private let googleOAuthService = GoogleOAuthService()
    private let userService = UserService()
    private let photosService = PhotosService()
    private let faceApiService = FaceApiService()
    
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
            return 
        }
        
        isFetchingPhotosOfYou = true
        fetchPhotosOfYouError = nil
        
        do {
            let result = try await photosService.fetchPhotosOfUser(userId: String(user.id))
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][AppState] Fetched \(result.photos.count) photos of user from iCloud")
            }
            photosOfYou = result.photos
            hasMorePhotosOfYou = result.hasMore
            photosOfYouInitialFetchComplete = true
        } catch {
            fetchPhotosOfYouError = error
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][AppState] Error fetching photos of user: \(error)")
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
                let progress = Double(index) / Double(targetPhotos.count)
                batchCompareProgress = progress
                matchesAttempted = index + 1
                
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[AppState] Comparing target \(index + 1)/\(targetPhotos.count): \(targetPhoto.mediaItemId)")
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
        
        for result in matchingResults {
            do {
                let updatedPhoto = try await photosService.updatePhotoSubject(
                    mediaItemId: result.photo.mediaItemId,
                    photoOf: currentUser.id
                )
                
                // Update the photo in our local photos array
                await updateSinglePhotoMetadata(updatedPhoto)
                
                successfulUpdates += 1
                
            } catch {
                failedUpdates += 1
            }
        }
    }
    
    private func convertPhotoToImageData(_ photo: Photo) async -> Data? {
        // For now, we'll use a placeholder implementation
        // In a real implementation, this would fetch the actual image data from the photo URL
        guard let url = URL(string: photo.baseUrl) else {
            return nil
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
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