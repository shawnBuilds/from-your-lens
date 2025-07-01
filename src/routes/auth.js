const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getUserById, upsertUser } = require('../../db/users');

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://fromyourlens-904e01076638.herokuapp.com/auth/google/callback'
        : 'http://localhost:5000/auth/google/callback',
    scope: ['profile', 'email'] // Only basic profile and email, no Drive/Photos scopes
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('[GoogleOAuth] Processing Google profile:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName
        });

        // Create or update user in database
        const userData = {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            fullName: profile.displayName,
            profilePictureUrl: profile.photos?.[0]?.value,
            // No Drive/Photos tokens since we're not requesting those scopes
            driveAccessToken: null,
            driveRefreshToken: null,
            driveTokenExpiry: null,
            photosAccessToken: null,
            photosRefreshToken: null,
            photosTokenExpiry: null
        };

        const user = await upsertUser(userData);
        console.log('[GoogleOAuth] User upserted successfully:', user.email);
        
        return done(null, user);
    } catch (error) {
        console.error('[GoogleOAuth] Error processing Google profile:', error);
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await getUserById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

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

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/auth/failure',
        session: false 
    }), 
    async (req, res) => {
        try {
            console.log('[GoogleOAuth] OAuth callback successful for user:', req.user.email);
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: req.user.id, 
                    email: req.user.email,
                    googleId: req.user.google_id
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            // For iOS client, redirect to a custom URL scheme
            const redirectUrl = `fromyourlens://oauth-callback?token=${encodeURIComponent(token)}&userId=${req.user.id}&email=${encodeURIComponent(req.user.email)}&fullName=${encodeURIComponent(req.user.full_name || '')}&profilePictureUrl=${encodeURIComponent(req.user.profile_picture_url || '')}`;
            
            console.log('[GoogleOAuth] Redirecting to iOS app:', redirectUrl);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('[GoogleOAuth] Error in callback:', error);
            res.redirect('/auth/failure');
        }
    }
);

// OAuth failure route
router.get('/failure', (req, res) => {
    console.log('[GoogleOAuth] OAuth authentication failed');
    res.json({ 
        error: 'Authentication failed',
        message: 'Google OAuth authentication was unsuccessful'
    });
});

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

// Logout route
router.get('/logout', verifyJWT, (req, res) => {
    console.log('[Auth] User logout:', req.user.email);
    res.json({ success: true, message: 'Logged out successfully' });
});

// Basic health check for auth service
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Auth service is running' });
});

module.exports = { router, verifyJWT }; 