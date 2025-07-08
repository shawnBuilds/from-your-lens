const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const Controls = require('../controls');

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Upload a photo to S3 for sharing
 * @param {Object} photo - Photo object from database
 * @param {number} originalUserId - ID of user who owns the photo
 * @param {number} sharedWithUserId - ID of user the photo is being shared with
 * @returns {Promise<Object>} Upload result with success status and S3 info
 */
const uploadPhotoToS3 = async (photo, originalUserId, sharedWithUserId) => {
    try {
        if (Controls.enableDebugLogPhotoUpload) {
            console.log(`[PhotoUploadService] Starting S3 upload for photo ${photo.media_item_id}`);
        }
        
        // Generate S3 key
        const s3Key = generateS3Key(photo.media_item_id, originalUserId, sharedWithUserId);
        
        // Get image data from the photo URL
        const imageData = await fetchImageData(photo.base_url);
        
        if (!imageData) {
            return {
                success: false,
                error: 'Failed to fetch image data from source URL'
            };
        }
        
        // Determine content type
        const contentType = photo.mime_type || 'image/jpeg';
        
        // Upload to S3
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: imageData,
            ContentType: contentType,
            Metadata: {
                originalUserId: originalUserId.toString(),
                sharedWithUserId: sharedWithUserId.toString(),
                mediaItemId: photo.media_item_id,
                originalUrl: photo.base_url
            }
        };
        
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Generate S3 URL
        const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        
        if (Controls.enableDebugLogPhotoUpload) {
            console.log(`[PhotoUploadService] Successfully uploaded photo ${photo.media_item_id} to S3: ${s3Key}`);
        }
        
        return {
            success: true,
            s3Key,
            s3Url,
            contentType
        };
        
    } catch (error) {
        if (Controls.enableDebugLogPhotoUpload) {
            console.error(`[PhotoUploadService] Error uploading photo ${photo.media_item_id} to S3:`, error);
        }
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate S3 key for shared photos
 * @param {string} mediaItemId - Original media item ID
 * @param {number} originalUserId - ID of user who owns the photo
 * @param {number} sharedWithUserId - ID of user the photo is being shared with
 * @returns {string} S3 key
 */
const generateS3Key = (mediaItemId, originalUserId, sharedWithUserId) => {
    const timestamp = Date.now();
    const extension = '.jpg'; // Default to jpg, could be determined from mime type
    
    return `shared-photos/${originalUserId}/${sharedWithUserId}/${timestamp}-${mediaItemId}${extension}`;
};

/**
 * Fetch image data from URL
 * @param {string} imageUrl - URL of the image to fetch
 * @returns {Promise<Buffer|null>} Image data as buffer or null if failed
 */
const fetchImageData = async (imageUrl) => {
    try {
        // Handle iCloud URLs differently
        if (imageUrl.startsWith('icloud://')) {
            // For iCloud URLs, we need to handle this differently
            // This would require the iOS client to provide the actual image data
            if (Controls.enableDebugLogPhotoUpload) {
                console.warn('[PhotoUploadService] iCloud URL detected, image data should be provided by client');
            }
            return null;
        }
        
        // For regular HTTP URLs
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
        
    } catch (error) {
        if (Controls.enableDebugLogPhotoUpload) {
            console.error(`[PhotoUploadService] Error fetching image data from ${imageUrl}:`, error);
        }
        return null;
    }
};

/**
 * Delete a photo from S3
 * @param {string} s3Key - S3 key of the photo to delete
 * @returns {Promise<boolean>} Success status
 */
const deletePhotoFromS3 = async (s3Key) => {
    try {
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        
        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key
        }));
        
        if (Controls.enableDebugLogPhotoUpload) {
            console.log(`[PhotoUploadService] Successfully deleted photo from S3: ${s3Key}`);
        }
        return true;
        
    } catch (error) {
        if (Controls.enableDebugLogPhotoUpload) {
            console.error(`[PhotoUploadService] Error deleting photo from S3: ${s3Key}`, error);
        }
        return false;
    }
};

module.exports = {
    uploadPhotoToS3,
    deletePhotoFromS3,
    generateS3Key
}; 