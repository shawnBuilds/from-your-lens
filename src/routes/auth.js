const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../../db/users');

const router = express.Router();

// JWT verification middleware
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('[JWT] Token verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// New endpoint to verify JWT token
router.get('/verify-token', verifyJWT, async (req, res) => {
    try {
        // Get fresh user data from database
        const user = await getUserById(req.user.id);
        console.log('[Auth] Verifying token for user:', {
            userId: user.id,
            email: user.email,
            hasProfilePicture: !!user.profile_picture_url,
            profilePictureUrl: user.profile_picture_url
        });

        res.json({ 
            valid: true, 
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                profilePictureUrl: user.profile_picture_url
            }
        });
    } catch (error) {
        console.error('[Auth] Error verifying token:', {
            error: error.message,
            userId: req.user.id
        });
        res.status(500).json({ error: 'Failed to verify token' });
    }
});

// Basic health check for auth service
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Auth service is running' });
});

module.exports = { router, verifyJWT }; 