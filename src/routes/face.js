const express = require("express");
const multer = require("multer");
const {
  DetectFacesCommand,
  CompareFacesCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} = require("@aws-sdk/client-rekognition");
const { rekClient } = require("../lib/rekognitionClient");

const upload = multer();     // in-memory storage
const router = express.Router();

// AWS Rekognition limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_IMAGE_SIZE = 1 * 1024; // 1KB

// Helper function to detect faces in an image
async function detectFacesInImage(imageBuffer, imageName) {
  console.log(`\nDetecting faces in ${imageName}...`);
  try {
    const detectCmd = new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
      Attributes: ["ALL"],
    });
    const { FaceDetails } = await rekClient.send(detectCmd);
    console.log(`Found ${FaceDetails?.length || 0} faces in ${imageName}`);
    return FaceDetails;
  } catch (err) {
    console.error(`Error detecting faces in ${imageName}:`, err.message);
    throw err;
  }
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
    console.log("\n=== Face Comparison Request Started ===");
    console.log("Request received at:", new Date().toISOString());
    
    try {
      // Log file details
      if (!req.files) {
        console.error("No files received in request");
        return res.status(400).json({ error: "No files received" });
      }

      const sourceFile = req.files.source?.[0];
      const targetFile = req.files.target?.[0];

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

      console.log("\nPreparing CompareFacesCommand...");
      const cmd = new CompareFacesCommand({
        SourceImage: { Bytes: sourceFile.buffer },
        TargetImage: { Bytes: targetFile.buffer },
        SimilarityThreshold: 90,
      });

      console.log("Sending request to AWS Rekognition...");
      const { FaceMatches, UnmatchedFaces } = await rekClient.send(cmd);
      
      console.log("\nAWS Response:");
      console.log("- Face Matches:", FaceMatches?.length || 0);
      console.log("- Unmatched Faces:", UnmatchedFaces?.length || 0);
      
      console.log("\n=== Face Comparison Request Completed Successfully ===\n");
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

module.exports = router; 