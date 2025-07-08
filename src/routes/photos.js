const express = require('express');
const { verifyJWT } = require('./auth');
const photosDb = require('../../db/photos');
const { uploadPhotoToS3 } = require('../services/photoUploadService');
const Controls = require('../controls');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

/**
 * @route POST /api/photos/upload-shared
 * @desc Upload photos to S3 when sharing with another user
 */
router.post('/upload-shared', async (req, res) => {
    try {
        const { mediaItemIds, photos, sharedWithUserId } = req.body;
        
        if (!mediaItemIds || !Array.isArray(mediaItemIds) || mediaItemIds.length === 0) {
            return res.status(400).json({
                error: 'mediaItemIds array is required',
                code: 'INVALID_MEDIA_ITEM_IDS'
            });
        }
        
        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({
                error: 'photos array with image data is required',
                code: 'INVALID_PHOTOS_DATA'
            });
        }
        
        if (!sharedWithUserId) {
            return res.status(400).json({
                error: 'sharedWithUserId is required',
                code: 'INVALID_SHARED_WITH_USER_ID'
            });
        }
        
        if (Controls.enableDebugLogPhotoUpload) {
            console.log(`[Photos] Uploading ${mediaItemIds.length} photos to S3 for sharing with user ${sharedWithUserId}`);
        }
        
        const results = [];
        const errors = [];
        
        // Process each photo
        for (let i = 0; i < mediaItemIds.length; i++) {
            const mediaItemId = mediaItemIds[i];
            const photoData = photos[i];
            
            try {
                if (!photoData || !photoData.imageData) {
                    errors.push({
                        mediaItemId,
                        error: 'Photo image data is missing'
                    });
                    continue;
                }
                
                // Convert base64 image data to buffer
                const imageBuffer = Buffer.from(photoData.imageData, 'base64');
                
                // Generate S3 key
                const s3Key = generateS3Key(mediaItemId, req.user.id, sharedWithUserId);
                
                // Determine content type
                const contentType = photoData.mimeType || 'image/jpeg';
                
                // Upload to S3
                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: s3Key,
                    Body: imageBuffer,
                    ContentType: contentType,
                    Metadata: {
                        originalUserId: req.user.id.toString(),
                        sharedWithUserId: sharedWithUserId.toString(),
                        mediaItemId: mediaItemId,
                        originalUrl: photoData.baseUrl || 'icloud://' + mediaItemId
                    }
                };
                
                const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
                const s3Client = new S3Client({
                    region: process.env.AWS_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                    }
                });
                
                await s3Client.send(new PutObjectCommand(uploadParams));
                
                // Generate S3 URL
                const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
                
                // Update database with S3 info if photo exists
                try {
                    await photosDb.updatePhotoS3Info(mediaItemId, s3Key, s3Url);
                } catch (dbError) {
                    if (Controls.enableDebugLogPhotoUpload) {
                        console.log(`[Photos] Photo ${mediaItemId} not in database, skipping DB update`);
                    }
                }
                
                results.push({
                    mediaItemId,
                    success: true,
                    s3Key,
                    s3Url
                });
                
                if (Controls.enableDebugLogPhotoUpload) {
                    console.log(`[Photos] Successfully uploaded photo ${mediaItemId} to S3`);
                }
                
            } catch (error) {
                if (Controls.enableDebugLogPhotoUpload) {
                    console.error(`[Photos] Error processing photo ${mediaItemId}:`, error);
                }
                errors.push({
                    mediaItemId,
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            results,
            errors,
            summary: {
                total: mediaItemIds.length,
                successful: results.length,
                failed: errors.length
            }
        });
        
    } catch (error) {
        console.error('[Photos] Error uploading shared photos:', error.message);
        res.status(500).json({ 
            error: 'Failed to upload shared photos',
            code: 'UPLOAD_SHARED_PHOTOS_ERROR'
        });
    }
});

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
 * @route GET /api/photos
 * @desc Get user's photos with pagination
 */
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const photos = await photosDb.getUserPhotos(req.user.id, { limit, offset });
        const total = await photosDb.getUserPhotosCount(req.user.id);

        res.json({
            photos,
            total,
            has_more: offset + photos.length < total
        });
    } catch (error) {
        console.error('[Photos] Error getting user photos:', error.message);
        res.status(500).json({ 
            error: 'Failed to get photos',
            code: 'GET_PHOTOS_ERROR'
        });
    }
});

/**
 * @route GET /api/photos/of/:userId
 * @desc Get photos where a user is the subject
 */
router.get('/of/:userId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const photos = await photosDb.getPhotosOfUser(req.params.userId, { limit, offset });
        const total = await photosDb.getPhotosOfUserCount(req.params.userId);

        res.json({
            photos,
            total,
            has_more: offset + photos.length < total
        });
    } catch (error) {
        console.error('[Photos] Error getting photos of user:', error.message);
        res.status(500).json({ 
            error: 'Failed to get photos of user',
            code: 'GET_PHOTOS_OF_USER_ERROR'
        });
    }
});

/**
 * @route GET /api/photos/:mediaItemId
 * @desc Get single photo by media item ID
 */
router.get('/:mediaItemId', async (req, res) => {
    try {
        const photo = await photosDb.getPhotoByMediaItemId(req.params.mediaItemId);
        
        if (!photo) {
            return res.status(404).json({
                error: 'Photo not found',
                code: 'PHOTO_NOT_FOUND'
            });
        }

        if (photo.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'Unauthorized access to photo',
                code: 'UNAUTHORIZED_ACCESS'
            });
        }

        res.json(photo);
    } catch (error) {
        console.error('[Photos] Error getting photo:', error.message);
        res.status(500).json({ 
            error: 'Failed to get photo',
            code: 'GET_PHOTO_ERROR'
        });
    }
});

/**
 * @route PATCH /api/photos/:mediaItemId/tags
 * @desc Update photo tags
 */
router.patch('/:mediaItemId/tags', async (req, res) => {
    try {
        const photo = await photosDb.getPhotoByMediaItemId(req.params.mediaItemId);
        
        if (!photo) {
            return res.status(404).json({
                error: 'Photo not found',
                code: 'PHOTO_NOT_FOUND'
            });
        }

        if (photo.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'Unauthorized access to photo',
                code: 'UNAUTHORIZED_ACCESS'
            });
        }

        const updatedPhoto = await photosDb.updatePhotoTags(
            req.params.mediaItemId,
            req.body.tags
        );

        res.json(updatedPhoto);
    } catch (error) {
        console.error('[Photos] Error updating photo tags:', error.message);
        res.status(500).json({ 
            error: 'Failed to update photo tags',
            code: 'UPDATE_TAGS_ERROR'
        });
    }
});

/**
 * @route GET /api/photos/search
 * @desc Search photos by tags
 */
router.get('/search', async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const photos = await photosDb.searchPhotosByTags(req.user.id, tags, { limit, offset });
        const total = await photosDb.getPhotosByTagsCount(req.user.id, tags);

        res.json({
            photos,
            total,
            has_more: offset + photos.length < total
        });
    } catch (error) {
        console.error('[Photos] Error searching photos:', error.message);
        res.status(500).json({ 
            error: 'Failed to search photos',
            code: 'SEARCH_PHOTOS_ERROR'
        });
    }
});

/**
 * @route PATCH /api/photos/:mediaItemId/photo-of
 * @desc Update who the photo is of
 */
router.patch('/:mediaItemId/photo-of', async (req, res) => {
    try {
        const photo = await photosDb.getPhotoByMediaItemId(req.params.mediaItemId);
        
        if (!photo) {
            return res.status(404).json({
                error: 'Photo not found',
                code: 'PHOTO_NOT_FOUND'
            });
        }

        if (photo.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'Unauthorized access to photo',
                code: 'UNAUTHORIZED_ACCESS'
            });
        }

        const updatedPhoto = await photosDb.updatePhotoOf(
            req.params.mediaItemId,
            req.body.photoOf || null
        );

        res.json(updatedPhoto);
    } catch (error) {
        console.error('[Photos] Error updating photo subject:', error.message);
        res.status(500).json({ 
            error: 'Failed to update photo subject',
            code: 'UPDATE_PHOTO_OF_ERROR'
        });
    }
});

module.exports = router; 