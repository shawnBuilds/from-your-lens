const express = require('express');
const router = express.Router();
const { upload, getS3Url } = require('../../utils/s3');
const pool = require('../../db/pool');
const { getAllUsers } = require('../../db/users');
const { transformUsersToAPI, transformUserToAPI } = require('../lib/databaseHelpers');
const Controls = require('../controls');

// Get all users (for search functionality)
router.get('/', async (req, res) => {
    if (Controls.enableDebugLogUser) {
        console.log('[Users] Get all users request received for user ID:', req.user.id);
    }
    
    try {
        const users = await getAllUsers();
        
        if (Controls.enableDebugLogUser) {
            console.log('[Users] Returning', users.length, 'users to client');
        }
        
        // Transform database fields to match iOS client expectations
        const transformedUsers = transformUsersToAPI(users);
        
        res.json({
            users: transformedUsers,
            total: transformedUsers.length
        });
    } catch (error) {
        console.error('[Users] Error getting all users:', error);
        res.status(500).json({ 
            error: 'Failed to get users',
            details: error.message 
        });
    }
});

// Upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
    if (Controls.enableDebugLogUser) {
        console.log('[Profile Picture] Upload request received for user ID:', req.user.id);
    }

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const s3Url = getS3Url(req.file.key);

        // Update user's profile picture URL in database
        const query = `
            UPDATE users 
            SET profile_picture_url = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        
        const result = await pool.query(query, [s3Url, req.user.id]);
        
        const response = {
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: s3Url,
            user: transformUserToAPI(result.rows[0])
        };
        
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Upload completed successfully for user ID:', req.user.id);
        }
        
        res.json(response);
    } catch (error) {
        console.error('[Profile Picture] Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            error: 'Failed to upload profile picture',
            details: error.message 
        });
    }
});

// Remove profile picture
router.delete('/profile-picture', async (req, res) => {
    if (Controls.enableDebugLogUser) {
        console.log('[Profile Picture] Remove request received for user ID:', req.user.id);
    }
    try {
        // Set profile_picture_url to null in the database
        const query = `
            UPDATE users 
            SET profile_picture_url = NULL 
            WHERE id = $1 
            RETURNING *;
        `;
        const result = await pool.query(query, [req.user.id]);
        
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Remove completed successfully for user ID:', req.user.id);
        }
        
        res.json({
            message: 'Profile picture removed successfully',
            user: transformUserToAPI(result.rows[0])
        });
    } catch (error) {
        console.error('[Profile Picture] Remove error:', error);
        res.status(500).json({
            error: 'Failed to remove profile picture',
            details: error.message
        });
    }
});

module.exports = router; 