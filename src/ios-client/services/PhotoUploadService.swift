import Foundation
import UIKit

// MARK: - Photo Upload Service Protocol
protocol PhotoUploadServiceProtocol {
    func uploadPhotosToS3(mediaItemIds: [String], sharedWithUserId: Int) async throws -> PhotoUploadResult
}

// MARK: - Photo Upload Result
struct PhotoUploadResult {
    let success: Bool
    let results: [PhotoUploadItemResult]
    let errors: [PhotoUploadError]
    let summary: PhotoUploadSummary
    
    struct PhotoUploadItemResult {
        let mediaItemId: String
        let success: Bool
        let s3Key: String?
        let s3Url: String?
    }
    
    struct PhotoUploadError {
        let mediaItemId: String
        let error: String
    }
    
    struct PhotoUploadSummary {
        let total: Int
        let successful: Int
        let failed: Int
    }
}

// MARK: - Photo Upload Service
class PhotoUploadService: PhotoUploadServiceProtocol {
    
    // MARK: - Properties
    private let iCloudPhotoService = ICloudPhotoService()
    
    // MARK: - Photo Upload Service Protocol Implementation
    func uploadPhotosToS3(mediaItemIds: [String], sharedWithUserId: Int) async throws -> PhotoUploadResult {
        if FeatureFlags.enableDebugLogPhotoUpload {
            print("[PhotoUploadService] Starting S3 upload for \(mediaItemIds.count) photos to user \(sharedWithUserId)")
        }
        
        guard let authToken = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken) else {
            throw PhotoUploadServiceError.noAuthToken
        }
        
        var results: [PhotoUploadResult.PhotoUploadItemResult] = []
        var errors: [PhotoUploadResult.PhotoUploadError] = []
        
        // Process each photo
        for mediaItemId in mediaItemIds {
            do {
                let uploadResult = try await uploadSinglePhotoToS3(
                    mediaItemId: mediaItemId,
                    sharedWithUserId: sharedWithUserId,
                    authToken: authToken
                )
                
                if uploadResult.success {
                    results.append(uploadResult)
                    if FeatureFlags.enableDebugLogPhotoUpload {
                        print("[PhotoUploadService] Successfully uploaded photo \(mediaItemId)")
                    }
                } else {
                    errors.append(PhotoUploadResult.PhotoUploadError(
                        mediaItemId: mediaItemId,
                        error: uploadResult.error ?? "Unknown error"
                    ))
                    if FeatureFlags.enableDebugLogPhotoUpload {
                        print("[PhotoUploadService] Failed to upload photo \(mediaItemId): \(uploadResult.error ?? "Unknown error")")
                    }
                }
                
            } catch {
                errors.append(PhotoUploadResult.PhotoUploadError(
                    mediaItemId: mediaItemId,
                    error: error.localizedDescription
                ))
                if FeatureFlags.enableDebugLogPhotoUpload {
                    print("[PhotoUploadService] Error uploading photo \(mediaItemId): \(error)")
                }
            }
        }
        
        let summary = PhotoUploadResult.PhotoUploadSummary(
            total: mediaItemIds.count,
            successful: results.count,
            failed: errors.count
        )
        
        if FeatureFlags.enableDebugLogPhotoUpload {
            print("[PhotoUploadService] Upload completed: \(summary.successful) successful, \(summary.failed) failed")
        }
        
        return PhotoUploadResult(
            success: errors.isEmpty,
            results: results,
            errors: errors,
            summary: summary
        )
    }
    
    // MARK: - Private Methods
    private func uploadSinglePhotoToS3(
        mediaItemId: String,
        sharedWithUserId: Int,
        authToken: String
    ) async throws -> PhotoUploadResult.PhotoUploadItemResult {
        
        // First, get the photo data from iCloud
        guard let photo = await getPhotoFromICloud(mediaItemId: mediaItemId) else {
            return PhotoUploadResult.PhotoUploadItemResult(
                mediaItemId: mediaItemId,
                success: false,
                s3Key: nil,
                s3Url: nil
            )
        }
        
        // Get image data
        guard let imageData = await getImageData(for: photo) else {
            return PhotoUploadResult.PhotoUploadItemResult(
                mediaItemId: mediaItemId,
                success: false,
                s3Key: nil,
                s3Url: nil
            )
        }
        
        // Upload to server
        return try await uploadImageDataToServer(
            mediaItemId: mediaItemId,
            imageData: imageData,
            sharedWithUserId: sharedWithUserId,
            authToken: authToken
        )
    }
    
    private func getPhotoFromICloud(mediaItemId: String) async -> Photo? {
        // This would need to be implemented to get the photo from the local photos array
        // For now, we'll return nil and handle this in the calling code
        return nil
    }
    
    private func getImageData(for photo: Photo) async -> Data? {
        if photo.baseUrl.hasPrefix("icloud://") {
            // Handle iCloud photos
            return await getICloudImageData(for: photo)
        } else {
            // Handle regular URLs
            return await getURLImageData(from: photo.baseUrl)
        }
    }
    
    private func getICloudImageData(for photo: Photo) async -> Data? {
        do {
            let asset = try await iCloudPhotoService.getPhotoAsset(for: photo)
            guard let asset = asset else {
                if FeatureFlags.enableDebugLogPhotoUpload {
                    print("[PhotoUploadService] Could not find iCloud asset for photo \(photo.mediaItemId)")
                }
                return nil
            }
            
            let targetSize = CGSize(width: 1920, height: 1920) // High quality for sharing
            guard let image = try await iCloudPhotoService.loadImageFromAsset(asset, targetSize: targetSize) else {
                if FeatureFlags.enableDebugLogPhotoUpload {
                    print("[PhotoUploadService] Could not load image from iCloud asset for photo \(photo.mediaItemId)")
                }
                return nil
            }
            
            // Convert UIImage to Data
            return image.jpegData(compressionQuality: 0.9)
            
        } catch {
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[PhotoUploadService] Error getting iCloud image data for photo \(photo.mediaItemId): \(error)")
            }
            return nil
        }
    }
    
    private func getURLImageData(from urlString: String) async -> Data? {
        guard let url = URL(string: urlString) else {
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[PhotoUploadService] Invalid URL: \(urlString)")
            }
            return nil
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return data
        } catch {
            if FeatureFlags.enableDebugLogPhotoUpload {
                print("[PhotoUploadService] Error downloading image from URL \(urlString): \(error)")
            }
            return nil
        }
    }
    
    private func uploadImageDataToServer(
        mediaItemId: String,
        imageData: Data,
        sharedWithUserId: Int,
        authToken: String
    ) async throws -> PhotoUploadResult.PhotoUploadItemResult {
        
        let url = URL(string: "\(APIConfig.baseURL)/api/photos/upload-shared")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // For now, we'll use a simplified approach where we send the mediaItemIds
        // and let the server handle the image data fetching
        let requestBody = [
            "mediaItemIds": [mediaItemId],
            "sharedWithUserId": sharedWithUserId
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw PhotoUploadServiceError.invalidResponse
        }
        
        if httpResponse.statusCode == 200 {
            let uploadResponse = try JSONDecoder().decode(PhotoUploadResponse.self, from: data)
            
            if let result = uploadResponse.results.first {
                return PhotoUploadResult.PhotoUploadItemResult(
                    mediaItemId: mediaItemId,
                    success: result.success,
                    s3Key: result.s3Key,
                    s3Url: result.s3Url
                )
            } else {
                throw PhotoUploadServiceError.noResultInResponse
            }
        } else {
            throw PhotoUploadServiceError.serverError(httpResponse.statusCode)
        }
    }
}

// MARK: - Response Models
struct PhotoUploadResponse: Codable {
    let success: Bool
    let results: [PhotoUploadItemResponse]
    let errors: [PhotoUploadErrorResponse]
    let summary: PhotoUploadSummaryResponse
    
    struct PhotoUploadItemResponse: Codable {
        let mediaItemId: String
        let success: Bool
        let s3Key: String?
        let s3Url: String?
    }
    
    struct PhotoUploadErrorResponse: Codable {
        let mediaItemId: String
        let error: String
    }
    
    struct PhotoUploadSummaryResponse: Codable {
        let total: Int
        let successful: Int
        let failed: Int
    }
}

// MARK: - Photo Upload Service Errors
enum PhotoUploadServiceError: Error, LocalizedError {
    case noAuthToken
    case invalidResponse
    case noResultInResponse
    case serverError(Int)
    case imageDataNotFound
    
    var errorDescription: String? {
        switch self {
        case .noAuthToken:
            return "No authentication token found"
        case .invalidResponse:
            return "Invalid response from server"
        case .noResultInResponse:
            return "No result found in server response"
        case .serverError(let code):
            return "Server error with status code: \(code)"
        case .imageDataNotFound:
            return "Image data not found"
        }
    }
} 