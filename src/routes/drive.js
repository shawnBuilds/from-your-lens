const express = require('express');
const { verifyJWT } = require('./auth');
const driveService = require('../services/drive');

const router = express.Router();

// Middleware to check if user is authenticated via JWT
const isAuthenticated = verifyJWT;

// Apply authentication middleware to all routes
router.use(isAuthenticated);

/**
 * @route GET /drive/auth/status
 * @desc Check Drive authentication status for the current user
 */
router.get('/auth/status', async (req, res) => {
    console.log('[Drive Routes] Checking auth status', {
        userId: req.user.id,
        email: req.user.email,
        path: req.path,
        timestamp: new Date().toISOString()
    });
    
    try {
        const initialized = await driveService.initializeForUser(req.user.id);
        console.log('[Drive Routes] Drive auth status check complete', {
            userId: req.user.id,
            authenticated: initialized,
            timestamp: new Date().toISOString()
        });
        
        res.json({ 
            authenticated: initialized,
            message: initialized ? 'Drive access configured' : 'Drive access not configured'
        });
    } catch (error) {
        console.error('[Drive Routes] Drive auth status check failed', {
            userId: req.user.id,
            error: error.message,
            errorType: error.name,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to check Drive authentication status' });
    }
});

/**
 * @route GET /drive/files
 * @desc List files from user's Drive
 */
router.get('/files', async (req, res) => {
    console.log('[Drive Routes] Listing files for user:', req.user.id);
    try {
        const { pageSize = 10, pageToken = null, query = "mimeType contains 'image/'" } = req.query;
        
        const result = await driveService.listFilesForUser(req.user.id, {
            pageSize: parseInt(pageSize),
            pageToken,
            query
        });

        res.json(result);
    } catch (error) {
        console.error('[Drive Routes] Error listing files:', {
            userId: req.user.id,
            error: error.message
        });
        res.status(500).json({ error: 'Failed to list files from Drive' });
    }
});

/**
 * @route GET /drive/files/:fileId
 * @desc Get metadata for a specific file
 */
router.get('/files/:fileId', async (req, res) => {
    console.log('[Drive Routes] Getting file metadata:', {
        userId: req.user.id,
        fileId: req.params.fileId
    });
    try {
        const file = await driveService.getFile(req.params.fileId);
        
        // Log the availability of thumbnail and web view links
        console.log('[Drive Routes] File metadata links:', {
            fileId: req.params.fileId,
            hasThumbnailLink: !!file.thumbnailLink,
            hasWebViewLink: !!file.webViewLink,
            thumbnailLink: file.thumbnailLink,
            webViewLink: file.webViewLink
        });
        
        res.json(file);
    } catch (error) {
        console.error('[Drive Routes] Error getting file metadata:', {
            userId: req.user.id,
            fileId: req.params.fileId,
            error: error.message
        });
        res.status(500).json({ error: 'Failed to get file metadata' });
    }
});

/**
 * @route GET /drive/files/:fileId/content
 * @desc Get file content
 */
router.get('/files/:fileId/content', async (req, res) => {
    console.log('[Drive Routes] Getting file content:', {
        userId: req.user.id,
        fileId: req.params.fileId
    });
    try {
        const fileStream = await driveService.getFileContent(req.params.fileId);
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileId}"`);
        
        // Pipe the file stream to the response
        fileStream.pipe(res);
    } catch (error) {
        console.error('[Drive Routes] Error getting file content:', {
            userId: req.user.id,
            fileId: req.params.fileId,
            error: error.message
        });
        res.status(500).json({ error: 'Failed to get file content' });
    }
});

/**
 * @route GET /drive/search
 * @desc Search for files with specific criteria
 */
router.get('/search', async (req, res) => {
    console.log('[Drive Routes] Searching files:', {
        userId: req.user.id,
        query: req.query
    });
    try {
        const { query = '', mimeType = null, folderId = null } = req.query;
        
        const files = await driveService.searchFiles({
            query,
            mimeType,
            folderId
        });

        res.json({ files });
    } catch (error) {
        console.error('[Drive Routes] Error searching files:', {
            userId: req.user.id,
            query: req.query,
            error: error.message
        });
        res.status(500).json({ error: 'Failed to search files' });
    }
});

/**
 * @route GET /drive/folders/:folderId
 * @desc Get contents of a specific folder
 */
router.get('/folders/:folderId', async (req, res) => {
    console.log('[Drive Routes] Getting folder contents:', {
        userId: req.user.id,
        folderId: req.params.folderId
    });
    try {
        const files = await driveService.getFolderContents(req.params.folderId);
        res.json({ files });
    } catch (error) {
        console.error('[Drive Routes] Error getting folder contents:', {
            userId: req.user.id,
            folderId: req.params.folderId,
            error: error.message
        });
        res.status(500).json({ error: 'Failed to get folder contents' });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('[Drive Routes] Unhandled error:', {
        userId: req.user?.id,
        error: err.message,
        stack: err.stack
    });
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = router; 