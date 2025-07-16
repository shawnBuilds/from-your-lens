import Foundation

// MARK: - Protocol Definition
protocol FaceApiServiceProtocol {
    func detectFacesWithApi(imageData: Data) async throws -> FaceDetectionResult
    func compareFacesWithApi(sourceImageData: Data, targetImageData: Data) async throws -> FaceComparisonResult
    func batchCompareFacesWithApi(sourceImageData: Data, targetImageDataArray: [Data]) async throws -> BatchCompareResponse
}

class FaceApiService: FaceApiServiceProtocol {
    
    // MARK: - Properties
    private let baseURL = APIConfig.baseURL
    private let session = URLSession.shared
    
    // MARK: - FaceApiServiceProtocol Implementation
    func detectFacesWithApi(imageData: Data) async throws -> FaceDetectionResult {
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            return FaceDetectionResult.mockWithFaces
        }
        
        // Validate image data size
        guard imageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
            return FaceDetectionResult.mockError
        }
        
        guard imageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
            return FaceDetectionResult.mockError
        }
        
        do {
            let url = URL(string: "\(baseURL)/api/face/detect")!
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            
            // Create multipart form data
            let boundary = UUID().uuidString
            request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            
            var body = Data()
            
            // Add image data
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"image\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imageData)
            body.append("\r\n".data(using: .utf8)!)
            body.append("--\(boundary)--\r\n".data(using: .utf8)!)
            
            request.httpBody = body
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                return FaceDetectionResult.mockError
            }
            
            guard httpResponse.statusCode == 200 else {
                return FaceDetectionResult.mockError
            }
            
            let decoder = JSONDecoder()
            let faceDetails = try decoder.decode([FaceDetail].self, from: data)
            
            return FaceDetectionResult(faces: faceDetails, error: nil)
            
        } catch {
            return FaceDetectionResult.mockError
        }
    }
    
    func compareFacesWithApi(sourceImageData: Data, targetImageData: Data) async throws -> FaceComparisonResult {
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            return FaceComparisonResult.mockMatch
        }
        
        // Validate image data sizes
        guard sourceImageData.count >= FeatureFlags.minImageSizeForFaceDetection,
              targetImageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
            return FaceComparisonResult.mockError
        }
        
        guard sourceImageData.count <= FeatureFlags.maxImageSizeForFaceDetection,
              targetImageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
            return FaceComparisonResult.mockError
        }
        
        do {
            let url = URL(string: "\(baseURL)/api/face/compare")!
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            
            // Create multipart form data
            let boundary = UUID().uuidString
            request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            
            var body = Data()
            
            // Add source image data
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"source\"; filename=\"source.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(sourceImageData)
            body.append("\r\n".data(using: .utf8)!)
            
            // Add target image data
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"target\"; filename=\"target.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(targetImageData)
            body.append("\r\n".data(using: .utf8)!)
            
            body.append("--\(boundary)--\r\n".data(using: .utf8)!)
            
            request.httpBody = body
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                return FaceComparisonResult.mockError
            }
            
            guard httpResponse.statusCode == 200 else {
                return FaceComparisonResult.mockError
            }
            
            let decoder = JSONDecoder()
            let comparisonResponse = try decoder.decode(FaceComparisonAPIResponse.self, from: data)
            
            return FaceComparisonResult(
                faceMatches: comparisonResponse.FaceMatches ?? [],
                unmatchedFaces: comparisonResponse.UnmatchedFaces ?? [],
                sourceFaceCount: comparisonResponse.sourceFaceCount,
                targetFaceCount: comparisonResponse.targetFaceCount,
                error: nil
            )
            
        } catch {
            return FaceComparisonResult.mockError
        }
    }
    
    func batchCompareFacesWithApi(sourceImageData: Data, targetImageDataArray: [Data]) async throws -> BatchCompareResponse {
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            return BatchCompareResponse.mockResponse
        }
        
        // Validate source image data size
        guard sourceImageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
            return BatchCompareResponse.mockError
        }
        
        guard sourceImageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
            return BatchCompareResponse.mockError
        }
        
        // Validate target images
        guard !targetImageDataArray.isEmpty else {
            return BatchCompareResponse.mockError
        }
        
        guard targetImageDataArray.count <= 20 else {
            return BatchCompareResponse.mockError
        }
        
        for targetImageData in targetImageDataArray {
            guard targetImageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
                return BatchCompareResponse.mockError
            }
            
            guard targetImageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
                return BatchCompareResponse.mockError
            }
        }
        
        do {
            let url = URL(string: "\(baseURL)/api/face/batch-compare")!
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            
            // Create multipart form data
            let boundary = UUID().uuidString
            request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            
            var body = Data()
            
            // Add source image data
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"source\"; filename=\"source.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(sourceImageData)
            body.append("\r\n".data(using: .utf8)!)
            
            // Add all target image data
            for (index, targetImageData) in targetImageDataArray.enumerated() {
                body.append("--\(boundary)\r\n".data(using: .utf8)!)
                body.append("Content-Disposition: form-data; name=\"targets\"; filename=\"target\(index).jpg\"\r\n".data(using: .utf8)!)
                body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
                body.append(targetImageData)
                body.append("\r\n".data(using: .utf8)!)
            }
            
            body.append("--\(boundary)--\r\n".data(using: .utf8)!)
            
            request.httpBody = body
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Sending batch compare request with \(targetImageDataArray.count) target images")
            }
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                return BatchCompareResponse.mockError
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogBatchCompare {
                    print("[FaceApiService] Batch compare failed with status code: \(httpResponse.statusCode)")
                }
                return BatchCompareResponse.mockError
            }
            
            let decoder = JSONDecoder()
            let batchResponse = try decoder.decode(BatchCompareAPIResponse.self, from: data)
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Batch compare completed: \(batchResponse.successfulComparisons) successful, \(batchResponse.failedComparisons) failed")
            }
            
            return BatchCompareResponse(
                results: batchResponse.results,
                totalProcessed: batchResponse.totalProcessed,
                successfulComparisons: batchResponse.successfulComparisons,
                failedComparisons: batchResponse.failedComparisons,
                error: nil
            )
            
        } catch {
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Batch compare error: \(error)")
            }
            return BatchCompareResponse.mockError
        }
    }
}

// MARK: - API Response Structures
struct FaceComparisonAPIResponse: Codable {
    let FaceMatches: [FaceMatch]?
    let UnmatchedFaces: [FaceDetail]?
    let sourceFaceCount: Int
    let targetFaceCount: Int
}

struct BatchCompareAPIResponse: Codable {
    let results: [BatchCompareResult]
    let totalProcessed: Int
    let successfulComparisons: Int
    let failedComparisons: Int
    let totalMatches: Int
    let sourceFaceCount: Int
}

// MARK: - Face API Service Errors
enum FaceApiServiceError: Error, LocalizedError {
    case invalidImageData
    case imageTooSmall
    case imageTooLarge
    case networkError
    case serverError
    case invalidResponse
    
    var errorDescription: String? {
        switch self {
        case .invalidImageData:
            return "Invalid image data provided"
        case .imageTooSmall:
            return "Image size is below minimum threshold"
        case .imageTooLarge:
            return "Image size exceeds maximum limit"
        case .networkError:
            return "Network error occurred"
        case .serverError:
            return "Server error occurred"
        case .invalidResponse:
            return "Invalid response from server"
        }
    }
} 