const express = require('express');
const router = express.Router();
const { upload, getS3Url } = require('../../utils/s3');
const pool = require('../../db/pool');
const Controls = require('../controls');

// Upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
    if (Controls.enableDebugLogUser) {
        console.log('[Profile Picture] Upload request received');
        console.log('[Profile Picture] Request headers:', {
            contentType: req.headers['content-type'],
            authorization: req.headers.authorization ? 'Bearer token present' : 'No token'
        });
    }

    try {
        if (!req.file) {
            if (Controls.enableDebugLogUser) {
                console.log('[Profile Picture] No file uploaded in request');
            }
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] File details:', {
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                key: req.file.key
            });
        }

        const userId = req.user.id;
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] User ID:', userId);
        }

        const s3Url = getS3Url(req.file.key);
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Generated S3 URL:', s3Url);
        }

        // Update user's profile picture URL in database
        const query = `
            UPDATE users 
            SET profile_picture_url = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Updating database with new URL');
        }
        const result = await pool.query(query, [s3Url, userId]);
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Database update successful');
        }
        
        const response = {
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: s3Url,
            user: result.rows[0]
        };
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Upload completed successfully');
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
        console.log('[Profile Picture] Remove request received');
        console.log('[Profile Picture] Request headers:', {
            authorization: req.headers.authorization ? 'Bearer token present' : 'No token'
        });
    }
    try {
        const userId = req.user.id;
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] User ID:', userId);
        }
        // Set profile_picture_url to null in the database
        const query = `
            UPDATE users 
            SET profile_picture_url = NULL 
            WHERE id = $1 
            RETURNING *;
        `;
        const result = await pool.query(query, [userId]);
        if (Controls.enableDebugLogUser) {
            console.log('[Profile Picture] Database update (remove) successful');
        }
        res.json({
            message: 'Profile picture removed successfully',
            user: result.rows[0]
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