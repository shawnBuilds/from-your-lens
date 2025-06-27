import Foundation

// MARK: - Protocol Definition
protocol FaceApiServiceProtocol {
    func detectFacesWithApi(imageData: Data) async throws -> FaceDetectionResult
    func compareFacesWithApi(sourceImageData: Data, targetImageData: Data) async throws -> FaceComparisonResult
}

class FaceApiService: FaceApiServiceProtocol {
    
    // MARK: - Properties
    private let baseURL = APIConfig.baseURL
    private let session = URLSession.shared
    
    // MARK: - FaceApiServiceProtocol Implementation
    func detectFacesWithApi(imageData: Data) async throws -> FaceDetectionResult {
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[FaceApiService] Starting face detection for image data of size: \(imageData.count) bytes")
        }
        
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Face detection disabled, returning mock result")
            }
            return FaceDetectionResult.mockWithFaces
        }
        
        // Validate image data size
        guard imageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Image too small: \(imageData.count) bytes")
            }
            return FaceDetectionResult.mockError
        }
        
        guard imageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Image too large: \(imageData.count) bytes")
            }
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
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Sending face detection request to: \(url)")
            }
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[FaceApiService] Invalid response type")
                }
                return FaceDetectionResult.mockError
            }
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Face detection response status: \(httpResponse.statusCode)")
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[FaceApiService] Face detection failed with status: \(httpResponse.statusCode)")
                }
                return FaceDetectionResult.mockError
            }
            
            let decoder = JSONDecoder()
            let faceDetails = try decoder.decode([FaceDetail].self, from: data)
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Face detection successful, found \(faceDetails.count) faces")
            }
            
            return FaceDetectionResult(faces: faceDetails, error: nil)
            
        } catch {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Error during face detection: \(error)")
            }
            return FaceDetectionResult.mockError
        }
    }
    
    func compareFacesWithApi(sourceImageData: Data, targetImageData: Data) async throws -> FaceComparisonResult {
        if FeatureFlags.enableDebugLogFaceDetection {
            print("[FaceApiService] Starting face comparison")
            print("[FaceApiService] Source image size: \(sourceImageData.count) bytes")
            print("[FaceApiService] Target image size: \(targetImageData.count) bytes")
        }
        
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Face detection disabled, returning mock comparison result")
            }
            return FaceComparisonResult.mockMatch
        }
        
        // Validate image data sizes
        guard sourceImageData.count >= FeatureFlags.minImageSizeForFaceDetection,
              targetImageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] One or both images too small")
            }
            return FaceComparisonResult.mockError
        }
        
        guard sourceImageData.count <= FeatureFlags.maxImageSizeForFaceDetection,
              targetImageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] One or both images too large")
            }
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
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Sending face comparison request to: \(url)")
            }
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[FaceApiService] Invalid response type")
                }
                return FaceComparisonResult.mockError
            }
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Face comparison response status: \(httpResponse.statusCode)")
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogFaceDetection {
                    print("[FaceApiService] Face comparison failed with status: \(httpResponse.statusCode)")
                }
                return FaceComparisonResult.mockError
            }
            
            let decoder = JSONDecoder()
            let comparisonResponse = try decoder.decode(FaceComparisonAPIResponse.self, from: data)
            
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Face comparison successful")
                print("[FaceApiService] Face matches: \(comparisonResponse.FaceMatches?.count ?? 0)")
                print("[FaceApiService] Unmatched faces: \(comparisonResponse.UnmatchedFaces?.count ?? 0)")
                print("[FaceApiService] Source face count: \(comparisonResponse.sourceFaceCount)")
                print("[FaceApiService] Target face count: \(comparisonResponse.targetFaceCount)")
            }
            
            return FaceComparisonResult(
                faceMatches: comparisonResponse.FaceMatches ?? [],
                unmatchedFaces: comparisonResponse.UnmatchedFaces ?? [],
                sourceFaceCount: comparisonResponse.sourceFaceCount,
                targetFaceCount: comparisonResponse.targetFaceCount,
                error: nil
            )
            
        } catch {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[FaceApiService] Error during face comparison: \(error)")
            }
            return FaceComparisonResult.mockError
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