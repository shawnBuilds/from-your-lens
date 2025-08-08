const express = require("express");
const multer = require("multer");
const {
  DetectFacesCommand,
  CompareFacesCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} = require("@aws-sdk/client-rekognition");
const { rekClient } = require("../lib/rekognitionClient");
const Controls = require("../controls");
const { BatchJobService } = require("../services/batchJobService");

const upload = multer();     // in-memory storage
const router = express.Router();

// Initialize batch job service
const batchJobService = new BatchJobService();

// AWS Rekognition limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_IMAGE_SIZE = 1 * 1024; // 1KB

// Helper function to detect faces in an image
async function detectFacesInImage(imageBuffer, imageName) {
  if (Controls.enableDebugLogFaceDetection) {
    console.log(`\nDetecting faces in ${imageName}...`);
  }
  try {
    const detectCmd = new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
      Attributes: ["ALL"],
    });
    const { FaceDetails } = await rekClient.send(detectCmd);
    if (Controls.enableDebugLogFaceDetection) {
      console.log(`Found ${FaceDetails?.length || 0} faces in ${imageName}`);
    }
    return FaceDetails;
  } catch (err) {
    console.error(`Error detecting faces in ${imageName}:`, err.message);
    throw err;
  }
}

// Helper function to compare faces between source and target images
async function compareFaces(sourceBuffer, targetBuffer, sourceName, targetName) {
  if (Controls.enableDebugLogBatchCompare) {
    console.log(`[BatchCompare] Comparing ${sourceName} ↔ ${targetName}`);
  }
  
  try {
    const cmd = new CompareFacesCommand({
      SourceImage: { Bytes: sourceBuffer },
      TargetImage: { Bytes: targetBuffer },
      SimilarityThreshold: 90,
    });
    
    const { FaceMatches, UnmatchedFaces } = await rekClient.send(cmd);
    
    if (Controls.enableDebugLogBatchCompare) {
      console.log(`[BatchCompare] ✅ ${targetName}: ${FaceMatches?.length || 0} matches, ${UnmatchedFaces?.length || 0} unmatched`);
    }
    
    return {
      success: true,
      FaceMatches: FaceMatches || [],
      UnmatchedFaces: UnmatchedFaces || [],
      error: null
    };
  } catch (err) {
    if (Controls.enableDebugLogBatchCompare) {
      console.log(`[BatchCompare] ❌ ${targetName}: ${err.message}`);
    }
    return {
      success: false,
      FaceMatches: [],
      UnmatchedFaces: [],
      error: err.message
    };
  }
}

// Helper function to process target images (used for both regular and chunked processing)
async function processTargetImages(sourceBuffer, targetFiles, sourceFaces) {
  const comparisonPromises = targetFiles.map(async (targetFile) => {
    // Detect faces in target image
    const targetFaces = await detectFacesInImage(targetFile.buffer, targetFile.originalname);
    
    if (!targetFaces || targetFaces.length === 0) {
      if (Controls.enableDebugLogBatchCompare) {
        console.log(`[BatchCompare] ⚠️  No faces detected in ${targetFile.originalname}`);
      }
      return {
        targetFileName: targetFile.originalname,
        success: true, // This is a successful comparison, just no faces found
        FaceMatches: [],
        UnmatchedFaces: [],
        sourceFaceCount: sourceFaces.length,
        targetFaceCount: 0,
        error: null // No error, just no faces detected
      };
    }

    // Compare faces
    const comparisonResult = await compareFaces(
      sourceBuffer, 
      targetFile.buffer, 
      "source", 
      targetFile.originalname
    );

    return {
      targetFileName: targetFile.originalname,
      success: comparisonResult.success,
      FaceMatches: comparisonResult.FaceMatches,
      UnmatchedFaces: comparisonResult.UnmatchedFaces,
      sourceFaceCount: sourceFaces.length,
      targetFaceCount: targetFaces.length,
      error: comparisonResult.error
    };
  });

  // Wait for all comparisons to complete
  return await Promise.all(comparisonPromises);
}

// POST /api/face/detect
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    const command = new DetectFacesCommand({
      Image: { Bytes: req.file.buffer },
      Attributes: ["ALL"],            // include emotions, pose, landmarks
    });
    const { FaceDetails } = await rekClient.send(command);
    res.json(FaceDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/face/compare
router.post(
  "/compare",
  upload.fields([
    { name: "source", maxCount: 1 },
    { name: "target", maxCount: 1 },
  ]),
  async (req, res) => {
    if (Controls.enableDebugLogFaceDetection) {
      console.log("\n=== Face Comparison Request Started ===");
      console.log("Request received at:", new Date().toISOString());
    }
    
    try {
      // Log file details
      if (!req.files) {
        console.error("No files received in request");
        return res.status(400).json({ error: "No files received" });
      }

      const sourceFile = req.files.source?.[0];
      const targetFile = req.files.target?.[0];

      if (Controls.enableDebugLogFaceDetection) {
        console.log("\nSource Image Details:");
        console.log("- Filename:", sourceFile?.originalname);
        console.log("- Size:", sourceFile?.size, "bytes");
        console.log("- MIME Type:", sourceFile?.mimetype);
        console.log("- Buffer Length:", sourceFile?.buffer?.length);

        console.log("\nTarget Image Details:");
        console.log("- Filename:", targetFile?.originalname);
        console.log("- Size:", targetFile?.size, "bytes");
        console.log("- MIME Type:", targetFile?.mimetype);
        console.log("- Buffer Length:", targetFile?.buffer?.length);
      }

      // Validate files
      if (!sourceFile?.buffer || !targetFile?.buffer) {
        console.error("Missing image buffers");
        return res.status(400).json({ error: "Invalid image data" });
      }

      // Validate file sizes
      if (sourceFile.size > MAX_IMAGE_SIZE || targetFile.size > MAX_IMAGE_SIZE) {
        console.error("Image too large");
        return res.status(400).json({ 
          error: "Image size exceeds 5MB limit",
          details: {
            sourceSize: sourceFile.size,
            targetSize: targetFile.size,
            maxAllowed: MAX_IMAGE_SIZE
          }
        });
      }

      if (sourceFile.size < MIN_IMAGE_SIZE || targetFile.size < MIN_IMAGE_SIZE) {
        console.error("Image too small");
        return res.status(400).json({ 
          error: "Image size below minimum threshold",
          details: {
            sourceSize: sourceFile.size,
            targetSize: targetFile.size,
            minRequired: MIN_IMAGE_SIZE
          }
        });
      }

      // Validate MIME types
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (!validMimeTypes.includes(sourceFile.mimetype) || !validMimeTypes.includes(targetFile.mimetype)) {
        console.error("Invalid MIME type");
        return res.status(400).json({ 
          error: "Invalid image format",
          details: {
            sourceMimeType: sourceFile.mimetype,
            targetMimeType: targetFile.mimetype,
            allowedTypes: validMimeTypes
          }
        });
      }

      // Detect faces in both images first
      const sourceFaces = await detectFacesInImage(sourceFile.buffer, sourceFile.originalname);
      const targetFaces = await detectFacesInImage(targetFile.buffer, targetFile.originalname);

      // Check if faces were detected in both images
      if (!sourceFaces || sourceFaces.length === 0) {
        console.error("No faces detected in source image");
        return res.status(400).json({
          error: "No faces detected in source image",
          details: {
            imageName: sourceFile.originalname,
            imageSize: sourceFile.size,
            imageType: sourceFile.mimetype
          }
        });
      }

      if (!targetFaces || targetFaces.length === 0) {
        console.error("No faces detected in target image");
        return res.status(400).json({
          error: "No faces detected in target image",
          details: {
            imageName: targetFile.originalname,
            imageSize: targetFile.size,
            imageType: targetFile.mimetype
          }
        });
      }

      if (Controls.enableDebugLogFaceDetection) {
        console.log("\nPreparing CompareFacesCommand...");
      }
      const cmd = new CompareFacesCommand({
        SourceImage: { Bytes: sourceFile.buffer },
        TargetImage: { Bytes: targetFile.buffer },
        SimilarityThreshold: 90,
      });

      if (Controls.enableDebugLogFaceDetection) {
        console.log("Sending request to AWS Rekognition...");
      }
      const { FaceMatches, UnmatchedFaces } = await rekClient.send(cmd);
      
      if (Controls.enableDebugLogFaceDetection) {
        console.log("\nAWS Response:");
        console.log("- Face Matches:", FaceMatches?.length || 0);
        console.log("- Unmatched Faces:", UnmatchedFaces?.length || 0);
        
        console.log("\n=== Face Comparison Request Completed Successfully ===\n");
      }
      res.json({ 
        FaceMatches, 
        UnmatchedFaces,
        sourceFaceCount: sourceFaces.length,
        targetFaceCount: targetFaces.length
      });
    } catch (err) {
      console.error("\n=== Face Comparison Error ===");
      console.error("Error Type:", err.name);
      console.error("Error Message:", err.message);
      console.error("Error Stack:", err.stack);
      
      if (err.$metadata) {
        console.error("\nAWS Error Metadata:");
        console.error("- Request ID:", err.$metadata.requestId);
        console.error("- HTTP Status Code:", err.$metadata.httpStatusCode);
        console.error("- Attempts:", err.$metadata.attempts);
      }
      
      // Enhanced error response
      const errorResponse = {
        error: err.message,
        type: err.name,
        details: {
          timestamp: new Date().toISOString(),
          requestId: err.$metadata?.requestId,
          statusCode: err.$metadata?.httpStatusCode
        }
      };
      
      console.error("\n=== End Error Details ===\n");
      res.status(500).json(errorResponse);
    }
  }
);

// POST /api/face/index
router.post(
  "/index",
  upload.single("image"),
  async (req, res) => {
    try {
      const cmd = new IndexFacesCommand({
        CollectionId: "myFaceCollection",   // create this in AWS beforehand
        Image: { Bytes: req.file.buffer },
        DetectionAttributes: ["ALL"],
        ExternalImageId: req.body.userId,    // tag faces with your own ID
      });
      const { FaceRecords } = await rekClient.send(cmd);
      res.json(FaceRecords);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/face/search
router.post(
  "/search",
  upload.single("image"),
  async (req, res) => {
    try {
      const cmd = new SearchFacesByImageCommand({
        CollectionId: "myFaceCollection",
        Image: { Bytes: req.file.buffer },
        FaceMatchThreshold: 90,
        MaxFaces: 5,
      });
      const { FaceMatches } = await rekClient.send(cmd);
      res.json(FaceMatches);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/face/batch-compare
router.post(
  "/batch-compare",
  upload.fields([
    { name: "source", maxCount: 1 },
    { name: "targets", maxCount: Controls.maxBatchCompareTargets },
    { name: "jobId", maxCount: 1 } // Optional: for chunked processing
  ]),
  async (req, res) => {
    if (Controls.enableDebugLogBatchCompare) {
      console.log("\n=== Batch Face Comparison Request Started ===");
      console.log("Request received at:", new Date().toISOString());
    }
    
    try {
      // Validate request structure
      if (!req.files) {
        console.error("[BatchCompare] No files received in request");
        return res.status(400).json({ error: "No files received" });
      }

      const sourceFile = req.files.source?.[0];
      const targetFiles = req.files.targets || [];
      const jobIdField = req.files.jobId?.[0];
      const jobId = jobIdField ? jobIdField.buffer.toString() : null;

      if (Controls.enableDebugLogBatchCompare) {
        console.log("\n[BatchCompare] Request Details:");
        console.log("- Source Image:", sourceFile?.originalname);
        console.log("- Target Images:", targetFiles.length);
        targetFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.originalname} (${file.size} bytes)`);
        });
      }

      // Validate source file
      if (!sourceFile?.buffer) {
        console.error("[BatchCompare] Missing source image buffer");
        return res.status(400).json({ error: "Invalid source image data" });
      }

      if (sourceFile.size > MAX_IMAGE_SIZE) {
        console.error("[BatchCompare] Source image too large");
        return res.status(400).json({ 
          error: "Source image size exceeds 5MB limit",
          details: { sourceSize: sourceFile.size, maxAllowed: MAX_IMAGE_SIZE }
        });
      }

      if (sourceFile.size < MIN_IMAGE_SIZE) {
        console.error("[BatchCompare] Source image too small");
        return res.status(400).json({ 
          error: "Source image size below minimum threshold",
          details: { sourceSize: sourceFile.size, minRequired: MIN_IMAGE_SIZE }
        });
      }

      // Validate target files
      if (targetFiles.length === 0) {
        console.error("[BatchCompare] No target images provided");
        return res.status(400).json({ error: "No target images provided" });
      }

      if (targetFiles.length > Controls.maxBatchCompareTargets) {
        console.error("[BatchCompare] Too many target images");
        return res.status(400).json({ error: `Maximum ${Controls.maxBatchCompareTargets} target images allowed` });
      }

      // Validate all target files
      for (const targetFile of targetFiles) {
        if (!targetFile.buffer) {
          console.error("[BatchCompare] Missing target image buffer");
          return res.status(400).json({ error: "Invalid target image data" });
        }

        if (targetFile.size > MAX_IMAGE_SIZE) {
          console.error("[BatchCompare] Target image too large:", targetFile.originalname);
          return res.status(400).json({ 
            error: "Target image size exceeds 5MB limit",
            details: { 
              targetName: targetFile.originalname,
              targetSize: targetFile.size, 
              maxAllowed: MAX_IMAGE_SIZE 
            }
          });
        }

        if (targetFile.size < MIN_IMAGE_SIZE) {
          console.error("[BatchCompare] Target image too small:", targetFile.originalname);
          return res.status(400).json({ 
            error: "Target image size below minimum threshold",
            details: { 
              targetName: targetFile.originalname,
              targetSize: targetFile.size, 
              minRequired: MIN_IMAGE_SIZE 
            }
          });
        }
      }

      // Validate MIME types
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (!validMimeTypes.includes(sourceFile.mimetype)) {
        console.error("[BatchCompare] Invalid source MIME type:", sourceFile.mimetype);
        return res.status(400).json({ 
          error: "Invalid source image format",
          details: { sourceMimeType: sourceFile.mimetype, allowedTypes: validMimeTypes }
        });
      }

      for (const targetFile of targetFiles) {
        if (!validMimeTypes.includes(targetFile.mimetype)) {
          console.error("[BatchCompare] Invalid target MIME type:", targetFile.mimetype);
          return res.status(400).json({ 
            error: "Invalid target image format",
            details: { 
              targetName: targetFile.originalname,
              targetMimeType: targetFile.mimetype, 
              allowedTypes: validMimeTypes 
            }
          });
        }
      }

      // Handle chunked processing if jobId is provided
      if (jobId) {
        if (Controls.enableDebugLogBatchCompare) {
          console.log(`[BatchCompare] Processing chunk for job: ${jobId}`);
        }
        
        // Get the batch job
        const batchJob = batchJobService.getBatchJob(jobId);
        if (!batchJob) {
          console.error(`[BatchCompare] Batch job not found: ${jobId}`);
          return res.status(404).json({ error: "Batch job not found" });
        }
        
        // Use the source image from the batch job
        const sourceImageData = batchJob.sourceImageData;
        if (!sourceImageData) {
          console.error(`[BatchCompare] No source image data in batch job: ${jobId}`);
          return res.status(400).json({ error: "No source image data in batch job" });
        }
        
        // Detect faces in source image from batch job
        if (Controls.enableDebugLogBatchCompare) {
          console.log("\n[BatchCompare] Detecting faces in source image from batch job...");
        }
        
        const sourceFaces = await detectFacesInImage(sourceImageData, "source_from_job");
        
        if (!sourceFaces || sourceFaces.length === 0) {
          console.error("[BatchCompare] No faces detected in source image from batch job");
          return res.status(400).json({
            error: "No faces detected in source image from batch job"
          });
        }
        
        if (Controls.enableDebugLogBatchCompare) {
          console.log(`[BatchCompare] Found ${sourceFaces.length} faces in source image from batch job`);
          console.log("\n[BatchCompare] Starting chunk processing...");
        }
        
        // Process this chunk and update the batch job
        const chunkResults = await processTargetImages(sourceImageData, targetFiles, sourceFaces);
        
        // Update batch job progress
        const currentCompletedBatches = batchJob.completedBatches + 1;
        batchJobService.updateBatchJobProgress(jobId, currentCompletedBatches, chunkResults);
        
        if (Controls.enableDebugLogBatchCompare) {
          console.log(`[BatchCompare] Chunk completed for job ${jobId}. Progress: ${currentCompletedBatches}/${batchJob.totalBatches}`);
        }
        
        // Return chunk results
        res.json({
          jobId: jobId,
          chunkResults: chunkResults,
          totalProcessed: chunkResults.length,
          successfulComparisons: chunkResults.filter(r => r.success).length,
          failedComparisons: chunkResults.filter(r => !r.success).length,
          totalMatches: chunkResults.reduce((sum, r) => sum + r.FaceMatches.length, 0),
          sourceFaceCount: sourceFaces.length,
          isChunk: true
        });
        
        return;
      }
      
      // Regular batch processing (non-chunked)
      if (Controls.enableDebugLogBatchCompare) {
        console.log("\n[BatchCompare] Detecting faces in source image...");
      }
      
      const sourceFaces = await detectFacesInImage(sourceFile.buffer, sourceFile.originalname);
      
      if (!sourceFaces || sourceFaces.length === 0) {
        console.error("[BatchCompare] No faces detected in source image");
        return res.status(400).json({
          error: "No faces detected in source image",
          details: {
            imageName: sourceFile.originalname,
            imageSize: sourceFile.size,
            imageType: sourceFile.mimetype
          }
        });
      }

      if (Controls.enableDebugLogBatchCompare) {
        console.log(`[BatchCompare] Found ${sourceFaces.length} faces in source image`);
        console.log("\n[BatchCompare] Starting parallel face comparisons...");
      }

      // Process all target images in parallel
      const results = await processTargetImages(sourceFile.buffer, targetFiles, sourceFaces);
      
      // Calculate summary statistics
      const successfulComparisons = results.filter(r => r.success).length;
      const failedComparisons = results.filter(r => !r.success).length;
      const totalMatches = results.reduce((sum, r) => sum + r.FaceMatches.length, 0);

      if (Controls.enableDebugLogBatchCompare) {
        console.log("\n[BatchCompare] Summary:");
        console.log(`- Total processed: ${results.length}`);
        console.log(`- Successful: ${successfulComparisons}`);
        console.log(`- Failed: ${failedComparisons}`);
        console.log(`- Total face matches: ${totalMatches}`);
        console.log("\n=== Batch Face Comparison Request Completed Successfully ===\n");
      }

      res.json({
        results,
        totalProcessed: results.length,
        successfulComparisons,
        failedComparisons,
        totalMatches,
        sourceFaceCount: sourceFaces.length
      });

    } catch (err) {
      console.error("\n=== Batch Face Comparison Error ===");
      console.error("Error Type:", err.name);
      console.error("Error Message:", err.message);
      console.error("Error Stack:", err.stack);
      
      if (err.$metadata) {
        console.error("\nAWS Error Metadata:");
        console.error("- Request ID:", err.$metadata.requestId);
        console.error("- HTTP Status Code:", err.$metadata.httpStatusCode);
        console.error("- Attempts:", err.$metadata.attempts);
      }
      
      const errorResponse = {
        error: err.message,
        type: err.name,
        details: {
          timestamp: new Date().toISOString(),
          requestId: err.$metadata?.requestId,
          statusCode: err.$metadata?.httpStatusCode
        }
      };
      
      console.error("\n=== End Batch Comparison Error Details ===\n");
      res.status(500).json(errorResponse);
    }
  }
);

// POST /api/face/batch-job
router.post("/batch-job", upload.fields([
  { name: "source", maxCount: 1 },
  { name: "totalBatches", maxCount: 1 },
  { name: "userId", maxCount: 1 }
]), async (req, res) => {
  if (Controls.enableDebugLogBatchJobService) {
    console.log("[BatchJob] Creating new batch job request");
  }
  
  try {
    // Validate request structure
    if (!req.files) {
      console.error("[BatchJob] No files received in request");
      return res.status(400).json({ error: "No files received" });
    }

    const sourceFile = req.files.source?.[0];
    const totalBatchesField = req.files.totalBatches?.[0];
    const userIdField = req.files.userId?.[0];
    
    if (Controls.enableDebugLogBatchJobService) {
      console.log("[BatchJob] Fields received - Source:", !!sourceFile, "TotalBatches:", !!totalBatchesField, "UserId:", !!userIdField);
    }

    if (!sourceFile?.buffer || !totalBatchesField?.buffer || !userIdField?.buffer) {
      console.error("[BatchJob] Missing required fields - Source:", !!sourceFile?.buffer, "TotalBatches:", !!totalBatchesField?.buffer, "UserId:", !!userIdField?.buffer);
      return res.status(400).json({ error: "Missing required fields: source, totalBatches, userId" });
    }

    const totalBatches = parseInt(totalBatchesField.buffer.toString());
    const userId = parseInt(userIdField.buffer.toString());

    if (isNaN(totalBatches) || totalBatches <= 0) {
      console.error("[BatchJob] Invalid totalBatches value");
      return res.status(400).json({ error: "Invalid totalBatches value" });
    }

    if (isNaN(userId) || userId <= 0) {
      console.error("[BatchJob] Invalid userId value");
      return res.status(400).json({ error: "Invalid userId value" });
    }

    // Validate source image
    if (sourceFile.size > MAX_IMAGE_SIZE) {
      console.error("[BatchJob] Source image too large");
      return res.status(400).json({ 
        error: "Source image size exceeds 5MB limit",
        details: { sourceSize: sourceFile.size, maxAllowed: MAX_IMAGE_SIZE }
      });
    }

    if (sourceFile.size < MIN_IMAGE_SIZE) {
      console.error("[BatchJob] Source image too small");
      return res.status(400).json({ 
        error: "Source image size below minimum threshold",
        details: { sourceSize: sourceFile.size, minRequired: MIN_IMAGE_SIZE }
      });
    }

    // Detect faces in source image to validate it
    const sourceFaces = await detectFacesInImage(sourceFile.buffer, sourceFile.originalname);
    
    if (!sourceFaces || sourceFaces.length === 0) {
      console.error("[BatchJob] No faces detected in source image");
      return res.status(400).json({
        error: "No faces detected in source image",
        details: {
          imageName: sourceFile.originalname,
          imageSize: sourceFile.size,
          imageType: sourceFile.mimetype
        }
      });
    }

    // Create batch job
    const batchJob = batchJobService.createBatchJob(
      userId, 
      sourceFile.buffer, 
      totalBatches,
      {
        sourceImageName: sourceFile.originalname,
        sourceImageSize: sourceFile.size,
        sourceImageType: sourceFile.mimetype,
        sourceFaceCount: sourceFaces.length
      }
    );

    if (Controls.enableDebugLogBatchJobService) {
      console.log(`[BatchJob] Created batch job: ${batchJob.id} for user ${userId} with ${totalBatches} batches`);
    }

    res.json({
      jobId: batchJob.id,
      userId: batchJob.userId,
      totalBatches: batchJob.totalBatches,
      status: batchJob.status,
      createdAt: batchJob.createdAt,
      sourceFaceCount: sourceFaces.length
    });

  } catch (err) {
    console.error("[BatchJob] Error creating batch job:", err);
    res.status(500).json({ 
      error: "Failed to create batch job",
      details: err.message 
    });
  }
});

// GET /api/face/batch-status/:jobId
router.get("/batch-status/:jobId", async (req, res) => {
  if (Controls.enableDebugLogBatchJobService) {
    console.log(`[BatchStatus] Status request for job: ${req.params.jobId}`);
  }
  
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }
    
    const status = batchJobService.getBatchJobStatus(jobId);
    
    if (!status) {
      if (Controls.enableDebugLogBatchJobService) {
        console.log(`[BatchStatus] Job not found: ${jobId}`);
      }
      return res.status(404).json({ error: "Batch job not found" });
    }
    
    if (Controls.enableDebugLogBatchJobService) {
      console.log(`[BatchStatus] Job ${jobId} status: ${status.job.status}, progress: ${status.progress.toFixed(1)}%`);
    }
    
    res.json(status);
    
  } catch (err) {
    console.error("[BatchStatus] Error getting batch job status:", err);
    res.status(500).json({ 
      error: "Failed to get batch job status",
      details: err.message 
    });
  }
});

// GET /api/face/batch-stats
router.get("/batch-stats", async (req, res) => {
  if (Controls.enableDebugLogBatchJobService) {
    console.log("[BatchStats] Stats request received");
  }
  
  try {
    const stats = batchJobService.getStats();
    
    if (Controls.enableDebugLogBatchJobService) {
      console.log(`[BatchStats] Current stats:`, stats);
    }
    
    res.json(stats);
    
  } catch (err) {
    console.error("[BatchStats] Error getting batch job stats:", err);
    res.status(500).json({ 
      error: "Failed to get batch job stats",
      details: err.message 
    });
  }
});

module.exports = router; 