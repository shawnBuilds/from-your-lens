import Foundation

// MARK: - Protocol Definition
protocol FaceApiServiceProtocol {
    func detectFacesWithApi(imageData: Data) async throws -> FaceDetectionResult
    func compareFacesWithApi(sourceImageData: Data, targetImageData: Data) async throws -> FaceComparisonResult
    func batchCompareFacesWithApi(sourceImageData: Data, targetImageDataArray: [Data]) async throws -> BatchCompareResponse
    
    // MARK: - Chunked Batch Compare Methods
    func createBatchJob(sourceImageData: Data, totalTargetCount: Int, userId: Int) async throws -> BatchJob
    func sendBatchChunk(jobId: String, sourceImageData: Data, targetImageDataArray: [Data]) async throws -> BatchCompareResponse
    func getBatchJobStatus(jobId: String) async throws -> BatchJobStatusResponse
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
    
    // MARK: - Chunked Batch Compare Methods
    
    func createBatchJob(sourceImageData: Data, totalTargetCount: Int, userId: Int) async throws -> BatchJob {
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            // Return mock batch job for testing
            return BatchJob(
                id: "mock_batch_job_123",
                userId: 1,
                totalBatches: 1,
                completedBatches: 0,
                status: BatchJobStatus.pending,
                createdAt: Date(),
                updatedAt: Date(),
                metadata: ["mock": "true"]
            )
        }
        
        // Validate source image data size
        guard sourceImageData.count >= FeatureFlags.minImageSizeForFaceDetection else {
            throw FaceApiServiceError.imageTooSmall
        }
        
        guard sourceImageData.count <= FeatureFlags.maxImageSizeForFaceDetection else {
            throw FaceApiServiceError.imageTooLarge
        }
        
        do {
            let url = URL(string: "\(baseURL)/api/face/batch-job")!
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
            
            // Add totalBatches field
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"totalBatches\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(totalTargetCount)".data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
            
            // Add userId field
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"userId\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(userId)".data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
            
            body.append("--\(boundary)--\r\n".data(using: .utf8)!)
            
            request.httpBody = body
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Creating batch job for \(totalTargetCount) total targets")
                print("[FaceApiService] Request body size: \(body.count) bytes")
                print("[FaceApiService] Source image size: \(sourceImageData.count) bytes")
            }
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw FaceApiServiceError.invalidResponse
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogBatchCompare {
                    print("[FaceApiService] Batch job creation failed with status code: \(httpResponse.statusCode)")
                    
                    // Try to read error response
                    if let errorData = data, let errorString = String(data: errorData, encoding: .utf8) {
                        print("[FaceApiService] Server error response: \(errorString)")
                    }
                }
                throw FaceApiServiceError.serverError
            }
            
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            
            let creationResponse = try decoder.decode(BatchJobCreationResponse.self, from: data)
            
            // Create BatchJob from response
            let batchJob = BatchJob(
                id: creationResponse.jobId,
                userId: creationResponse.userId,
                totalBatches: creationResponse.totalBatches,
                completedBatches: 0,
                status: BatchJobStatus(rawValue: creationResponse.status) ?? BatchJobStatus.pending,
                createdAt: creationResponse.createdAt,
                updatedAt: creationResponse.createdAt,
                metadata: ["sourceFaceCount": "\(creationResponse.sourceFaceCount)"]
            )
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Created batch job: \(batchJob.id)")
            }
            
            return batchJob
            
        } catch {
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Error creating batch job: \(error)")
            }
            throw error
        }
    }
    
    func sendBatchChunk(jobId: String, sourceImageData: Data, targetImageDataArray: [Data]) async throws -> BatchCompareResponse {
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            return BatchCompareResponse.mockResponse
        }
        
        // Validate target images
        guard !targetImageDataArray.isEmpty else {
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
            
            // Add jobId field
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"jobId\"\r\n\r\n".data(using: .utf8)!)
            body.append(jobId.data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
            
            body.append("--\(boundary)--\r\n".data(using: .utf8)!)
            
            request.httpBody = body
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Sending batch chunk for job \(jobId) with \(targetImageDataArray.count) target images")
            }
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                return BatchCompareResponse.mockError
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogBatchCompare {
                    print("[FaceApiService] Batch chunk failed with status code: \(httpResponse.statusCode)")
                }
                return BatchCompareResponse.mockError
            }
            
            let decoder = JSONDecoder()
            let chunkResponse = try decoder.decode(ChunkedBatchCompareResponse.self, from: data)
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Batch chunk completed: \(chunkResponse.successfulComparisons) successful, \(chunkResponse.failedComparisons) failed")
            }
            
            return BatchCompareResponse(
                results: chunkResponse.chunkResults,
                totalProcessed: chunkResponse.totalProcessed,
                successfulComparisons: chunkResponse.successfulComparisons,
                failedComparisons: chunkResponse.failedComparisons,
                error: nil
            )
            
        } catch {
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Batch chunk error: \(error)")
            }
            return BatchCompareResponse.mockError
        }
    }
    
    func getBatchJobStatus(jobId: String) async throws -> BatchJobStatusResponse {
        // Check if face detection is enabled
        if !FeatureFlags.enableFaceDetectionUsage {
            // Return mock status for testing
            return BatchJobStatusResponse(
                job: BatchJob(
                    id: jobId,
                    userId: 1,
                    totalBatches: 5,
                    completedBatches: 2,
                    status: BatchJobStatus.processing,
                    createdAt: Date(),
                    updatedAt: Date(),
                    metadata: ["mock": "true"]
                ),
                progress: 40.0,
                estimatedTimeRemaining: 180.0,
                summary: BatchJobSummary(
                    totalProcessed: 40,
                    successfulComparisons: 38,
                    failedComparisons: 2,
                    totalMatches: 15,
                    sourceFaceCount: 1
                )
            )
        }
        
        do {
            let url = URL(string: "\(baseURL)/api/face/batch-status/\(jobId)")!
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Getting batch job status for: \(jobId)")
            }
            
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw FaceApiServiceError.invalidResponse
            }
            
            guard httpResponse.statusCode == 200 else {
                if FeatureFlags.enableDebugLogBatchCompare {
                    print("[FaceApiService] Batch job status failed with status code: \(httpResponse.statusCode)")
                }
                throw FaceApiServiceError.serverError
            }
            
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            
            let statusResponse = try decoder.decode(BatchJobStatusResponse.self, from: data)
            
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Batch job status: \(statusResponse.job.status), progress: \(statusResponse.progress)%")
            }
            
            return statusResponse
            
        } catch {
            if FeatureFlags.enableDebugLogBatchCompare {
                print("[FaceApiService] Error getting batch job status: \(error)")
            }
            throw error
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