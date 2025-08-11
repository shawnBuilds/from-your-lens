import Foundation

// MARK: - Chunking Configuration
struct ChunkingConfig {
    static let maxChunkSize = 10// Process 25 images per request (safe for server memory)
    static let maxConcurrentChunks = 1 // Sequential processing to avoid overwhelming server
    static let retryAttempts = 2 // Retry failed chunks
    static let retryDelaySeconds = 2.0 // Wait between retries
}

// MARK: - Chunk Processing Result
struct ChunkResult {
    let chunkIndex: Int
    let targetPhotos: [Photo]
    let results: [BatchCompareResult]
    let success: Bool
    let error: String?
    let processingTime: TimeInterval
}

// MARK: - Progress Tracking
struct ChunkingProgress {
    let totalChunks: Int
    let completedChunks: Int
    let currentChunkIndex: Int
    let totalPhotos: Int
    let processedPhotos: Int
    let overallProgress: Double
    let estimatedTimeRemaining: TimeInterval?
}

// MARK: - Batch Compare Chunking Service
class BatchCompareChunkingService {
    private let faceApiService = FaceApiService()
    
    // MARK: - Main Chunking Method
    func processBatchInChunks(
        sourcePhoto: Photo,
        targetPhotos: [Photo],
        progressCallback: @escaping (ChunkingProgress) -> Void
    ) async -> [BatchCompareResult] {
        
        // Step 1: Prepare source image data (once)
        guard let sourceImageData = await convertPhotoToImageData(sourcePhoto) else {
            return createErrorResults(for: targetPhotos, error: "Failed to load source image")
        }
        
        // Step 2: Create chunks
        let chunks = createChunks(from: targetPhotos, chunkSize: ChunkingConfig.maxChunkSize)
        
        // Step 3: Process chunks sequentially
        var allResults: [BatchCompareResult] = []
        let startTime = Date()
        
        for (chunkIndex, chunkPhotos) in chunks.enumerated() {
            let chunkStartTime = Date()
            
            // Update progress
            let progress = ChunkingProgress(
                totalChunks: chunks.count,
                completedChunks: chunkIndex,
                currentChunkIndex: chunkIndex,
                totalPhotos: targetPhotos.count,
                processedPhotos: allResults.count,
                overallProgress: Double(chunkIndex) / Double(chunks.count),
                estimatedTimeRemaining: estimateTimeRemaining(
                    completedChunks: chunkIndex,
                    totalChunks: chunks.count,
                    elapsedTime: Date().timeIntervalSince(startTime)
                )
            )
            progressCallback(progress)
            
            // Process chunk with retry logic
            let chunkResult = await processChunkWithRetry(
                chunkIndex: chunkIndex,
                sourceImageData: sourceImageData,
                targetPhotos: chunkPhotos
            )
            
            // Add results
            allResults.append(contentsOf: chunkResult.results)
            
            // Log chunk completion
            if FeatureFlags.enableDebugLogBatchChunking {
                print("[ChunkingService] Chunk \(chunkIndex + 1)/\(chunks.count) completed: \(chunkResult.success ? "SUCCESS" : "FAILED")")
                print("[ChunkingService] Chunk processing time: \(String(format: "%.2f", chunkResult.processingTime))s")
                print("[ChunkingService] Chunk results: \(chunkResult.results.count) photos processed")
            }
            
            // Small delay between chunks to be nice to the server
            if chunkIndex < chunks.count - 1 {
                try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
            }
        }
        
        // Final progress update
        let finalProgress = ChunkingProgress(
            totalChunks: chunks.count,
            completedChunks: chunks.count,
            currentChunkIndex: chunks.count - 1,
            totalPhotos: targetPhotos.count,
            processedPhotos: allResults.count,
            overallProgress: 1.0,
            estimatedTimeRemaining: 0
        )
        progressCallback(finalProgress)
        
        return allResults
    }
    
    // MARK: - Private Helper Methods
    
    private func createChunks(from photos: [Photo], chunkSize: Int) -> [[Photo]] {
        var chunks: [[Photo]] = []
        var currentChunk: [Photo] = []
        
        for photo in photos {
            currentChunk.append(photo)
            
            if currentChunk.count >= chunkSize {
                chunks.append(currentChunk)
                currentChunk = []
            }
        }
        
        // Add remaining photos as final chunk
        if !currentChunk.isEmpty {
            chunks.append(currentChunk)
        }
        
        return chunks
    }
    
    private func processChunkWithRetry(
        chunkIndex: Int,
        sourceImageData: Data,
        targetPhotos: [Photo]
    ) async -> ChunkResult {
        
        for attempt in 0...ChunkingConfig.retryAttempts {
            do {
                let startTime = Date()
                
                // Convert target photos to image data
                var targetImageDataArray: [Data] = []
                var validTargetPhotos: [Photo] = []
                
                for targetPhoto in targetPhotos {
                    guard let targetImageData = await convertPhotoToImageData(targetPhoto) else {
                        continue
                    }
                    targetImageDataArray.append(targetImageData)
                    validTargetPhotos.append(targetPhoto)
                }
                
                guard !targetImageDataArray.isEmpty else {
                    return ChunkResult(
                        chunkIndex: chunkIndex,
                        targetPhotos: targetPhotos,
                        results: createErrorResults(for: targetPhotos, error: "Failed to load any target images"),
                        success: false,
                        error: "Failed to load any target images",
                        processingTime: Date().timeIntervalSince(startTime)
                    )
                }
                
                // Call API
                let batchResponse = try await faceApiService.batchCompareFacesWithApi(
                    sourceImageData: sourceImageData,
                    targetImageDataArray: targetImageDataArray
                )
                
                // Map results back to photos
                var results: [BatchCompareResult] = []
                
                for (index, result) in batchResponse.results.enumerated() {
                    guard index < validTargetPhotos.count else { break }
                    
                    let targetPhoto = validTargetPhotos[index]
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
                    results.append(batchResult)
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
                        results.append(errorResult)
                    }
                }
                
                return ChunkResult(
                    chunkIndex: chunkIndex,
                    targetPhotos: targetPhotos,
                    results: results,
                    success: true,
                    error: nil,
                    processingTime: Date().timeIntervalSince(startTime)
                )
                
            } catch {
                if attempt < ChunkingConfig.retryAttempts {
                    if FeatureFlags.enableDebugLogBatchChunking {
                        print("[ChunkingService] Chunk \(chunkIndex + 1) attempt \(attempt + 1) failed: \(error)")
                        print("[ChunkingService] Retrying in \(ChunkingConfig.retryDelaySeconds) seconds...")
                    }
                    try? await Task.sleep(nanoseconds: UInt64(ChunkingConfig.retryDelaySeconds * 1_000_000_000))
                } else {
                    if FeatureFlags.enableDebugLogBatchChunking {
                        print("[ChunkingService] Chunk \(chunkIndex + 1) failed after \(ChunkingConfig.retryAttempts + 1) attempts: \(error)")
                    }
                    return ChunkResult(
                        chunkIndex: chunkIndex,
                        targetPhotos: targetPhotos,
                        results: createErrorResults(for: targetPhotos, error: error.localizedDescription),
                        success: false,
                        error: error.localizedDescription,
                        processingTime: 0
                    )
                }
            }
        }
        
        // This should never be reached, but just in case
        return ChunkResult(
            chunkIndex: chunkIndex,
            targetPhotos: targetPhotos,
            results: createErrorResults(for: targetPhotos, error: "Unknown error"),
            success: false,
            error: "Unknown error",
            processingTime: 0
        )
    }
    
    private func createErrorResults(for photos: [Photo], error: String) -> [BatchCompareResult] {
        return photos.map { photo in
            BatchCompareResult(
                targetFileName: photo.mediaItemId,
                photo: photo,
                faceMatches: [],
                unmatchedFaces: [],
                sourceFaceCount: 0,
                targetFaceCount: 0,
                error: error,
                rejected: true
            )
        }
    }
    
    private func estimateTimeRemaining(
        completedChunks: Int,
        totalChunks: Int,
        elapsedTime: TimeInterval
    ) -> TimeInterval? {
        guard completedChunks > 0 else { return nil }
        
        let averageTimePerChunk = elapsedTime / Double(completedChunks)
        let remainingChunks = totalChunks - completedChunks
        return averageTimePerChunk * Double(remainingChunks)
    }
    
    // Reuse existing photo conversion method
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
}