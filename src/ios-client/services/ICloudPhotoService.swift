import Foundation
import Photos
import UIKit

// MARK: - iCloud Photo Service Protocol
protocol ICloudPhotoServiceProtocol {
    func requestPhotoLibraryAccess() async -> Bool
    func fetchRecentPhotos(count: Int) async throws -> [Photo]
    func fetchPhotosOfUser(count: Int) async throws -> [Photo]
    func getPhotoAsset(for photo: Photo) async throws -> PHAsset?
}

// MARK: - iCloud Photo Service
class ICloudPhotoService: ICloudPhotoServiceProtocol {
    
    // MARK: - Properties
    private var photoCounter = 0
    private let imageManager = PHImageManager.default()
    
    // MARK: - Photo Library Access
    func requestPhotoLibraryAccess() async -> Bool {
        return await withCheckedContinuation { continuation in
            PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
                let hasAccess = status == .authorized || status == .limited
                continuation.resume(returning: hasAccess)
            }
        }
    }
    
    // MARK: - Fetch Recent Photos
    func fetchRecentPhotos(count: Int) async throws -> [Photo] {
        if FeatureFlags.enableDebugLogICloudPhotos {
            print("[DEBUG][ICloudPhotoService] Fetching \(count) photos from iCloud")
        }
        
        guard await requestPhotoLibraryAccess() else {
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][ICloudPhotoService] Photo library access denied")
            }
            throw ICloudPhotoServiceError.accessDenied
        }
        
        let fetchOptions = PHFetchOptions()
        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        fetchOptions.fetchLimit = count
        
        let fetchResult = PHAsset.fetchAssets(with: .image, options: fetchOptions)
        
        var photos: [Photo] = []
        let group = DispatchGroup()
        let queue = DispatchQueue(label: "com.fromyourlens.icloudphotos", attributes: .concurrent)
        
        let actualCount = min(fetchResult.count, count)
        
        for i in 0..<actualCount {
            group.enter()
            let asset = fetchResult.object(at: i)
            
            queue.async {
                Task {
                    do {
                        let photo = try await self.createPhotoFromAsset(asset, userId: 9999)
                        photos.append(photo)
                    } catch {
                        if FeatureFlags.enableDebugLogICloudPhotos {
                            print("[DEBUG][ICloudPhotoService] Error creating photo from asset \(i+1): \(error)")
                        }
                    }
                    group.leave()
                }
            }
        }
        
        group.wait()
        
        // Sort by creation date (newest first)
        photos.sort { ($0.creationTime ?? Date.distantPast) > ($1.creationTime ?? Date.distantPast) }
        
        if FeatureFlags.enableDebugLogICloudPhotos {
            print("[DEBUG][ICloudPhotoService] Successfully fetched \(photos.count) photos from iCloud")
        }
        
        return photos
    }
    
    // MARK: - Fetch Photos of User
    func fetchPhotosOfUser(count: Int) async throws -> [Photo] {
        guard await requestPhotoLibraryAccess() else {
            throw ICloudPhotoServiceError.accessDenied
        }
        
        // For now, we'll return the same photos as recent photos
        // In the future, this could use face detection or other metadata
        let allPhotos = try await fetchRecentPhotos(count: count * 2) // Fetch more to filter
        
        // Filter to photos that might be of the user (for now, just take a subset)
        // This is a placeholder - real implementation would use face detection
        let photosOfUser = Array(allPhotos.prefix(count))
        
        return photosOfUser
    }
    
    // MARK: - Get Photo Asset
    func getPhotoAsset(for photo: Photo) async throws -> PHAsset? {
        guard await requestPhotoLibraryAccess() else {
            throw ICloudPhotoServiceError.accessDenied
        }
        
        // Try to find the asset by local identifier
        if let asset = PHAsset.fetchAssets(withLocalIdentifiers: [photo.mediaItemId], options: nil).firstObject {
            return asset
        }
        
        return nil
    }
    
    // MARK: - Helper Methods
    private func createPhotoFromAsset(_ asset: PHAsset, userId: Int) async throws -> Photo {
        photoCounter += 1
        
        let creationDate = asset.creationDate ?? Date()
        let mediaItemId = asset.localIdentifier
        
        // Get image dimensions
        let size = CGSize(width: asset.pixelWidth, height: asset.pixelHeight)
        
        // Create a unique base URL for the asset
        let baseUrl = "icloud://\(mediaItemId)"
        
        return Photo(
            id: photoCounter,
            mediaItemId: mediaItemId,
            userId: userId,
            photoOf: nil, // Will be determined by face detection later
            altText: nil, // Could be extracted from metadata or AI analysis
            tags: [], // Could be extracted from metadata or AI analysis
            baseUrl: baseUrl,
            mimeType: "image/jpeg", // Default, could be determined from asset
            width: Int(size.width),
            height: Int(size.height),
            creationTime: creationDate,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    // MARK: - Image Loading (for future use)
    func loadImageFromAsset(_ asset: PHAsset, targetSize: CGSize) async throws -> UIImage? {
        return await withCheckedContinuation { continuation in
            let options = PHImageRequestOptions()
            options.deliveryMode = .highQualityFormat
            options.isNetworkAccessAllowed = true
            options.isSynchronous = false
            
            imageManager.requestImage(
                for: asset,
                targetSize: targetSize,
                contentMode: .aspectFill,
                options: options
            ) { image, info in
                continuation.resume(returning: image)
            }
        }
    }
}

// MARK: - iCloud Photo Service Errors
enum ICloudPhotoServiceError: Error, LocalizedError {
    case accessDenied
    case noPhotosFound
    case assetNotFound
    case imageLoadFailed
    
    var errorDescription: String? {
        switch self {
        case .accessDenied:
            return "Photo library access denied"
        case .noPhotosFound:
            return "No photos found in iCloud"
        case .assetNotFound:
            return "Photo asset not found"
        case .imageLoadFailed:
            return "Failed to load image from iCloud"
        }
    }
} 