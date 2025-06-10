const express = require('express');
const router = express.Router();
const { upload, getS3Url } = require('../../utils/s3');
const pool = require('../../db/pool');

// Upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
    console.log('[Profile Picture] Upload request received');
    console.log('[Profile Picture] Request headers:', {
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? 'Bearer token present' : 'No token'
    });

    try {
        if (!req.file) {
            console.log('[Profile Picture] No file uploaded in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('[Profile Picture] File details:', {
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            key: req.file.key
        });

        const userId = req.user.id;
        console.log('[Profile Picture] User ID:', userId);

        const s3Url = getS3Url(req.file.key);
        console.log('[Profile Picture] Generated S3 URL:', s3Url);

        // Update user's profile picture URL in database
        const query = `
            UPDATE users 
            SET profile_picture_url = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        
        console.log('[Profile Picture] Updating database with new URL');
        const result = await pool.query(query, [s3Url, userId]);
        console.log('[Profile Picture] Database update successful');
        
        const response = {
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: s3Url,
            user: result.rows[0]
        };
        console.log('[Profile Picture] Upload completed successfully');
        
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

module.exports = router; 