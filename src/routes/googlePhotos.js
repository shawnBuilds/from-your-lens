const express = require('express');
const { verifyJWT } = require('./auth');
const photosService = require('../services/photos');
const photosDb = require('../../db/photos');
const Controls = require('../controls');

const router = express.Router();

// Middleware to check if user is authenticated via JWT
const isAuthenticated = verifyJWT;

// Apply authentication middleware to all routes
router.use(isAuthenticated);

/**
 * @route GET /api/google-photos
 * @desc List photos from Google Photos Library
 */
router.get('/', async (req, res) => {
    try {
        const { pageSize = 20, pageToken = null } = req.query;
        
        const result = await photosService.listMediaItemsForUser(req.user.id, {
            pageSize: parseInt(pageSize),
            pageToken
        });

        // Sync the photos with our database
        const syncedPhotos = await Promise.all(
            result.mediaItems.map(async (item) => {
                const photoData = {
                    mediaItemId: item.id,
                    userId: req.user.id,
                    baseUrl: item.baseUrl,
                    mimeType: item.mimeType,
                    width: item.mediaMetadata?.width,
                    height: item.mediaMetadata?.height,
                    creationTime: item.mediaMetadata?.creationTime
                };
                return await photosDb.upsertPhoto(photoData);
            })
        );

        res.json({
            photos: syncedPhotos,
            nextPageToken: result.nextPageToken
        });
    } catch (error) {
        console.error('[Google Photos] Error listing photos:', error.message);
        res.status(500).json({ 
            error: 'Failed to list photos from Google Photos',
            code: 'LIST_PHOTOS_ERROR'
        });
    }
});

/**
 * @route GET /api/google-photos/:mediaItemId
 * @desc Get metadata for a specific photo from Google Photos
 */
router.get('/:mediaItemId', async (req, res) => {
    try {
        const mediaItem = await photosService.getMediaItem(req.params.mediaItemId);
        
        // Sync the photo with our database
        const photoData = {
            mediaItemId: mediaItem.id,
            userId: req.user.id,
            baseUrl: mediaItem.baseUrl,
            mimeType: mediaItem.mimeType,
            width: mediaItem.mediaMetadata?.width,
            height: mediaItem.mediaMetadata?.height,
            creationTime: mediaItem.mediaMetadata?.creationTime
        };
        
        const syncedPhoto = await photosDb.upsertPhoto(photoData);
        
        res.json(syncedPhoto);
    } catch (error) {
        console.error('[Google Photos] Error getting photo:', error.message);
        res.status(500).json({ 
            error: 'Failed to get photo from Google Photos',
            code: 'GET_PHOTO_ERROR'
        });
    }
});

/**
 * @route GET /api/google-photos/:mediaItemId/content
 * @desc Get photo content (using baseUrl from Google Photos)
 */
router.get('/:mediaItemId/content', async (req, res) => {
    try {
        const mediaItem = await photosService.getMediaItem(req.params.mediaItemId);
        
        // Redirect to the baseUrl which serves the photo content
        res.redirect(mediaItem.baseUrl);
    } catch (error) {
        console.error('[Google Photos] Error getting photo content:', error.message);
        res.status(500).json({ 
            error: 'Failed to get photo content from Google Photos',
            code: 'GET_PHOTO_CONTENT_ERROR'
        });
    }
});

/**
 * @route GET /api/google-photos/search
 * @desc Search photos in Google Photos Library
 */
router.get('/search', async (req, res) => {
    try {
        const { query = '', filters = {} } = req.query;
        
        const mediaItems = await photosService.searchMediaItems({
            query,
            filters: JSON.parse(filters || '{}')
        });

        // Sync the photos with our database
        const syncedPhotos = await Promise.all(
            mediaItems.map(async (item) => {
                const photoData = {
                    mediaItemId: item.id,
                    userId: req.user.id,
                    baseUrl: item.baseUrl,
                    mimeType: item.mimeType,
                    width: item.mediaMetadata?.width,
                    height: item.mediaMetadata?.height,
                    creationTime: item.mediaMetadata?.creationTime
                };
                return await photosDb.upsertPhoto(photoData);
            })
        );

        res.json({ photos: syncedPhotos });
    } catch (error) {
        console.error('[Google Photos] Error searching photos:', error.message);
        res.status(500).json({ 
            error: 'Failed to search photos in Google Photos',
            code: 'SEARCH_PHOTOS_ERROR'
        });
    }
});

/**
 * @route GET /google-photos/auth/status
 * @desc Check Photos authentication status for the current user
 */
router.get('/auth/status', async (req, res) => {
    if (Controls.enableDebugLogPhotos) {
        console.log('[Photos Routes] Checking auth status', {
            userId: req.user.id,
            email: req.user.email,
            path: req.path,
            timestamp: new Date().toISOString()
        });
    }
    
    try {
        const initialized = await photosService.initializeForUser(req.user.id);
        if (Controls.enableDebugLogPhotos) {
            console.log('[Photos Routes] Photos auth status check complete', {
                userId: req.user.id,
                authenticated: initialized,
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({ 
            authenticated: initialized,
            message: initialized ? 'Photos access configured' : 'Photos access not configured'
        });
    } catch (error) {
        console.error('[Photos Routes] Photos auth status check failed', {
            userId: req.user.id,
            error: error.message,
            errorType: error.name,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to check Photos authentication status' });
    }
});

module.exports = router; 