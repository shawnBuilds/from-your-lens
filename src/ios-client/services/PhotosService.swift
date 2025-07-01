import Foundation

// MARK: - Protocol Definition
protocol PhotosServiceProtocol {
    func fetchUserPhotos(userId: String) async throws -> PhotosResult
    func loadMorePhotos(userId: String, offset: Int) async throws -> PhotosResult
    func fetchPhotosOfUser(userId: String) async throws -> PhotosResult
    func loadMorePhotosOfUser(userId: String, offset: Int) async throws -> PhotosResult
    func updatePhotoMetadata(_ photo: Photo) async throws -> Photo
    func updatePhotoSubject(mediaItemId: String, photoOf: Int?) async throws -> Photo
}

class PhotosService: PhotosServiceProtocol {
    
    // MARK: - Properties
    private let iCloudPhotoService = ICloudPhotoService()
    
    // MARK: - PhotosServiceProtocol Implementation
    func fetchUserPhotos(userId: String) async throws -> PhotosResult {
        print("[PhotosService] Fetching user photos for user ID: \(userId)")
        
        // Check if iCloud photo usage is enabled
        if FeatureFlags.enableICloudPhotoUsage {
            return try await fetchUserPhotosFromICloud(userId: userId)
        } else {
            // Fall back to mock photos
            return try await fetchUserPhotosFromMock(userId: userId)
        }
    }
    
    func loadMorePhotos(userId: String, offset: Int) async throws -> PhotosResult {
        print("[PhotosService] Loading more photos for user ID: \(userId), offset: \(offset)")
        
        // Check if iCloud photo usage is enabled
        if FeatureFlags.enableICloudPhotoUsage {
            return try await loadMorePhotosFromICloud(userId: userId, offset: offset)
        } else {
            // Fall back to mock behavior
            return try await loadMorePhotosFromMock(userId: userId, offset: offset)
        }
    }
    
    func fetchPhotosOfUser(userId: String) async throws -> PhotosResult {
        print("[PhotosService] Fetching photos of user ID: \(userId)")
        
        // Check if iCloud photo usage is enabled
        if FeatureFlags.enableICloudPhotoUsage {
            return try await fetchPhotosOfUserFromICloud(userId: userId)
        } else {
            // Fall back to mock photos
            return try await fetchPhotosOfUserFromMock(userId: userId)
        }
    }
    
    func loadMorePhotosOfUser(userId: String, offset: Int) async throws -> PhotosResult {
        print("[PhotosService] Loading more photos of user ID: \(userId), offset: \(offset)")
        
        // Check if iCloud photo usage is enabled
        if FeatureFlags.enableICloudPhotoUsage {
            return try await loadMorePhotosOfUserFromICloud(userId: userId, offset: offset)
        } else {
            // Fall back to mock behavior
            return try await loadMorePhotosOfUserFromMock(userId: userId, offset: offset)
        }
    }
    
    func updatePhotoMetadata(_ photo: Photo) async throws -> Photo {
        print("[PhotosService] Updating photo metadata for photo ID: \(photo.id)")
        
        // Simulate network delay
        try await Task.sleep(nanoseconds: 400_000_000) // 0.4 seconds
        
        // TODO: Implement actual API call
        // For now, return the same photo
        return photo
    }
    
    func updatePhotoSubject(mediaItemId: String, photoOf: Int?) async throws -> Photo {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        
        // TODO: Implement actual API call to PATCH /api/photos/:mediaItemId/photo-of
        // For now, return a mock updated photo
        let mockPhoto = Photo.mockPhotos.first { $0.mediaItemId == mediaItemId } ?? Photo.mockPhotos[0]
        
        // Create updated photo with new photoOf value
        let updatedPhoto = Photo(
            id: mockPhoto.id,
            mediaItemId: mockPhoto.mediaItemId,
            userId: mockPhoto.userId,
            photoOf: photoOf,
            altText: mockPhoto.altText,
            tags: mockPhoto.tags,
            baseUrl: mockPhoto.baseUrl,
            mimeType: mockPhoto.mimeType,
            width: mockPhoto.width,
            height: mockPhoto.height,
            creationTime: mockPhoto.creationTime,
            createdAt: mockPhoto.createdAt,
            updatedAt: Date()
        )
        
        return updatedPhoto
    }
    
    // MARK: - iCloud Photo Methods
    private func fetchUserPhotosFromICloud(userId: String) async throws -> PhotosResult {
        do {
            let photos = try await iCloudPhotoService.fetchRecentPhotos(count: FeatureFlags.defaultICloudPhotoCount)
            return PhotosResult(
                photos: photos,
                hasMore: photos.count >= FeatureFlags.defaultICloudPhotoCount,
                total: photos.count,
                error: nil
            )
        } catch {
            print("[PhotosService] Error fetching photos from iCloud: \(error)")
            return PhotosResult.mockError
        }
    }
    
    private func loadMorePhotosFromICloud(userId: String, offset: Int) async throws -> PhotosResult {
        // For now, return empty result as we've already loaded the photos
        // In the future, this could implement pagination
        return PhotosResult.mockEmpty
    }
    
    private func fetchPhotosOfUserFromICloud(userId: String) async throws -> PhotosResult {
        do {
            let photos = try await iCloudPhotoService.fetchPhotosOfUser(count: FeatureFlags.defaultICloudPhotoCount)
            return PhotosResult(
                photos: photos,
                hasMore: photos.count >= FeatureFlags.defaultICloudPhotoCount,
                total: photos.count,
                error: nil
            )
        } catch {
            print("[PhotosService] Error fetching photos of user from iCloud: \(error)")
            return PhotosResult.mockError
        }
    }
    
    private func loadMorePhotosOfUserFromICloud(userId: String, offset: Int) async throws -> PhotosResult {
        // For now, return empty result as we've already loaded the photos
        // In the future, this could implement pagination
        return PhotosResult.mockEmpty
    }
    
    // MARK: - Mock Photo Methods (for fallback)
    private func fetchUserPhotosFromMock(userId: String) async throws -> PhotosResult {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 800_000_000) // 0.8 seconds
        
        // Return mock photos
        return PhotosResult.mockWithPhotos
    }
    
    private func loadMorePhotosFromMock(userId: String, offset: Int) async throws -> PhotosResult {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 600_000_000) // 0.6 seconds
        
        // Return empty result (no more photos)
        return PhotosResult.mockEmpty
    }
    
    private func fetchPhotosOfUserFromMock(userId: String) async throws -> PhotosResult {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 700_000_000) // 0.7 seconds
        
        // Return mock photos where user is the subject
        let photosOfUser = Photo.mockPhotos.filter { $0.isPhotoOfUser }
        return PhotosResult(
            photos: photosOfUser,
            hasMore: false,
            total: photosOfUser.count,
            error: nil
        )
    }
    
    private func loadMorePhotosOfUserFromMock(userId: String, offset: Int) async throws -> PhotosResult {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        
        // Return empty result (no more photos)
        return PhotosResult.mockEmpty
    }
    
    // MARK: - Additional Methods (to be implemented)
    func searchPhotosByTags(userId: String, tags: [String]) async throws -> PhotosResult {
        print("[PhotosService] Search photos by tags not implemented yet")
        throw PhotosServiceError.notImplemented
    }
    
    func deletePhoto(mediaItemId: String) async throws -> Bool {
        print("[PhotosService] Delete photo not implemented yet")
        throw PhotosServiceError.notImplemented
    }
}

// MARK: - Photos Service Errors
enum PhotosServiceError: Error, LocalizedError {
    case notImplemented
    case invalidPhotoId
    case networkError
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "Photos service method not implemented yet"
        case .invalidPhotoId:
            return "Invalid photo ID"
        case .networkError:
            return "Network error occurred"
        case .serverError:
            return "Server error occurred"
        }
    }
} 