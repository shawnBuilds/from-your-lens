import Foundation
import Photos
import UIKit

// MARK: - Photo Download Service Protocol
protocol PhotoDownloadServiceProtocol {
    func requestPhotoLibraryAccess() async -> Bool
    func downloadPhotoToLibrary(_ photo: Photo) async throws -> Bool
    func downloadMultiplePhotosToLibrary(_ photos: [Photo]) async throws -> PhotoDownloadResult
}

// MARK: - Photo Download Result
struct PhotoDownloadResult {
    let success: Bool
    let downloadedCount: Int
    let failedCount: Int
    let errors: [PhotoDownloadError]
    
    var summary: String {
        if errors.isEmpty {
            return "Successfully downloaded \(downloadedCount) photo\(downloadedCount == 1 ? "" : "s")"
        } else {
            return "Downloaded \(downloadedCount) photo\(downloadedCount == 1 ? "" : "s"), failed to download \(failedCount) photo\(failedCount == 1 ? "" : "s")"
        }
    }
}

// MARK: - Photo Download Error
struct PhotoDownloadError {
    let photoId: Int
    let mediaItemId: String
    let error: Error
    let message: String
}

// MARK: - Photo Download Service
class PhotoDownloadService: PhotoDownloadServiceProtocol {
    
    // MARK: - Photo Library Access
    func requestPhotoLibraryAccess() async -> Bool {
        return await withCheckedContinuation { continuation in
            PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
                let hasAccess = status == .authorized || status == .limited
                if FeatureFlags.enableDebugLogPhotoDownload {
                    print("[PhotoDownloadService] Photo library access status: \(status.rawValue), hasAccess: \(hasAccess)")
                }
                continuation.resume(returning: hasAccess)
            }
        }
    }
    
    // MARK: - Download Single Photo
    func downloadPhotoToLibrary(_ photo: Photo) async throws -> Bool {
        if FeatureFlags.enableDebugLogPhotoDownload {
            print("[PhotoDownloadService] Starting download for photo: \(photo.mediaItemId)")
            print("[PhotoDownloadService] Photo S3 URL: \(photo.s3Url ?? "nil")")
        }
        
        // Verify this is an S3 photo
        guard let s3Url = photo.s3Url, !s3Url.isEmpty else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] ❌ Photo is not an S3 photo: \(photo.mediaItemId)")
            }
            throw PhotoDownloadServiceError.notS3Photo
        }
        
        // Request photo library access
        guard await requestPhotoLibraryAccess() else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] ❌ Photo library access denied")
            }
            throw PhotoDownloadServiceError.accessDenied
        }
        
        // Download image data from S3
        guard let imageData = await downloadImageData(from: s3Url) else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] ❌ Failed to download image data from S3: \(s3Url)")
            }
            throw PhotoDownloadServiceError.downloadFailed
        }
        
        // Save to photo library
        return try await saveImageDataToLibrary(imageData, photo: photo)
    }
    
    // MARK: - Download Multiple Photos
    func downloadMultiplePhotosToLibrary(_ photos: [Photo]) async throws -> PhotoDownloadResult {
        if FeatureFlags.enableDebugLogPhotoDownload {
            print("[PhotoDownloadService] Starting batch download for \(photos.count) photos")
        }
        
        // Filter to only S3 photos
        let s3Photos = photos.filter { $0.s3Url != nil && !$0.s3Url!.isEmpty }
        
        if FeatureFlags.enableDebugLogPhotoDownload {
            print("[PhotoDownloadService] Found \(s3Photos.count) S3 photos out of \(photos.count) total")
        }
        
        guard !s3Photos.isEmpty else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] No S3 photos to download")
            }
            return PhotoDownloadResult(
                success: true,
                downloadedCount: 0,
                failedCount: 0,
                errors: []
            )
        }
        
        // Request photo library access
        guard await requestPhotoLibraryAccess() else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] ❌ Photo library access denied for batch download")
            }
            throw PhotoDownloadServiceError.accessDenied
        }
        
        var downloadedCount = 0
        var failedCount = 0
        var errors: [PhotoDownloadError] = []
        
        // Process photos concurrently with limited concurrency
        await withTaskGroup(of: (Photo, Bool, Error?).self) { group in
            // Limit concurrent downloads to avoid overwhelming the system
            let maxConcurrent = 3
            var activeTasks = 0
            
            for photo in s3Photos {
                // Wait if we've reached the maximum concurrent tasks
                while activeTasks >= maxConcurrent {
                    if let result = await group.next() {
                        let (photo, success, error) = result
                        activeTasks -= 1
                        if success {
                            downloadedCount += 1
                        } else {
                            failedCount += 1
                            if let error = error {
                                errors.append(PhotoDownloadError(
                                    photoId: photo.id,
                                    mediaItemId: photo.mediaItemId,
                                    error: error,
                                    message: error.localizedDescription
                                ))
                            }
                        }
                    }
                }
                
                // Add new task
                activeTasks += 1
                group.addTask {
                    do {
                        let success = try await self.downloadPhotoToLibrary(photo)
                        return (photo, success, nil)
                    } catch {
                        return (photo, false, error)
                    }
                }
            }
            
            // Wait for remaining tasks
            for await result in group {
                let (photo, success, error) = result
                if success {
                    downloadedCount += 1
                } else {
                    failedCount += 1
                    if let error = error {
                        errors.append(PhotoDownloadError(
                            photoId: photo.id,
                            mediaItemId: photo.mediaItemId,
                            error: error,
                            message: error.localizedDescription
                        ))
                    }
                }
            }
        }
        
        let success = failedCount == 0
        
        if FeatureFlags.enableDebugLogPhotoDownload {
            print("[PhotoDownloadService] Batch download completed:")
            print("  - Downloaded: \(downloadedCount)")
            print("  - Failed: \(failedCount)")
            print("  - Success: \(success)")
        }
        
        // Send notification for successful download
        if FeatureFlags.enablePushNotifications && downloadedCount > 0 {
            NotificationService.shared.sendDownloadCompleteNotification(downloadCount: downloadedCount)
        }
        
        return PhotoDownloadResult(
            success: success,
            downloadedCount: downloadedCount,
            failedCount: failedCount,
            errors: errors
        )
    }
    
    // MARK: - Private Helper Methods
    private func downloadImageData(from urlString: String) async -> Data? {
        guard let url = URL(string: urlString) else {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] Invalid S3 URL: \(urlString)")
            }
            return nil
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                if FeatureFlags.enableDebugLogPhotoDownload {
                    print("[PhotoDownloadService] Invalid response type from S3")
                }
                return nil
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogPhotoDownload {
                    print("[PhotoDownloadService] S3 download failed with status: \(httpResponse.statusCode)")
                }
                return nil
            }
            
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] ✅ Successfully downloaded image data: \(data.count) bytes")
            }
            
            return data
        } catch {
            if FeatureFlags.enableDebugLogPhotoDownload {
                print("[PhotoDownloadService] ❌ Error downloading image data: \(error)")
            }
            return nil
        }
    }
    
    private func saveImageDataToLibrary(_ imageData: Data, photo: Photo) async throws -> Bool {
        return try await withCheckedThrowingContinuation { continuation in
            PHPhotoLibrary.shared().performChanges({
                // Create photo creation request
                let request = PHAssetCreationRequest.forAsset()
                request.addResource(with: .photo, data: imageData, options: nil)
                
                // Set creation date if available
                if let creationTime = photo.creationTime {
                    request.creationDate = creationTime
                }
                
                // Set location if available (could be added to Photo model later)
                // request.location = photo.location
                
            }) { success, error in
                if FeatureFlags.enableDebugLogPhotoDownload {
                    if success {
                        print("[PhotoDownloadService] ✅ Successfully saved photo to library: \(photo.mediaItemId)")
                    } else {
                        print("[PhotoDownloadService] ❌ Failed to save photo to library: \(photo.mediaItemId)")
                        if let error = error {
                            print("[PhotoDownloadService] Error: \(error)")
                        }
                    }
                }
                
                if success {
                    continuation.resume(returning: true)
                } else {
                    continuation.resume(throwing: error ?? PhotoDownloadServiceError.saveFailed)
                }
            }
        }
    }
}

// MARK: - Photo Download Service Errors
enum PhotoDownloadServiceError: Error, LocalizedError {
    case accessDenied
    case notS3Photo
    case downloadFailed
    case saveFailed
    case invalidURL
    
    var errorDescription: String? {
        switch self {
        case .accessDenied:
            return "Photo library access denied"
        case .notS3Photo:
            return "Photo is not an S3 photo that can be downloaded"
        case .downloadFailed:
            return "Failed to download photo from server"
        case .saveFailed:
            return "Failed to save photo to library"
        case .invalidURL:
            return "Invalid photo URL"
        }
    }
} 