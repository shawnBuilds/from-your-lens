const express = require('express');
const { verifyJWT } = require('./auth');
const photosDb = require('../../db/photos');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

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