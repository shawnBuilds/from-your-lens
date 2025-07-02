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
        console.log('[GoogleOAuth] Strategy - Processing Google profile');
        console.log('[GoogleOAuth] Strategy - Profile ID:', profile.id);
        console.log('[GoogleOAuth] Strategy - Profile email:', profile.emails?.[0]?.value);
        console.log('[GoogleOAuth] Strategy - Profile display name:', profile.displayName);
        console.log('[GoogleOAuth] Strategy - Access token received:', !!accessToken);
        console.log('[GoogleOAuth] Strategy - Refresh token received:', !!refreshToken);

        // Create or update user in database
        const userData = {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            fullName: profile.displayName,
            profilePictureUrl: profile.photos?.[0]?.value
        };

        console.log('[GoogleOAuth] Strategy - User data to upsert:', userData);

        const user = await upsertUser(userData);
        console.log('[GoogleOAuth] Strategy - User upserted successfully:', user.email);
        console.log('[GoogleOAuth] Strategy - User ID from database:', user.id);
        
        return done(null, user);
    } catch (error) {
        console.error('[GoogleOAuth] Strategy - Error processing Google profile:', error);
        console.error('[GoogleOAuth] Strategy - Error stack:', error.stack);
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
router.get('/google', (req, res, next) => {
    console.log('[GoogleOAuth] GET /auth/google - Starting OAuth flow');
    console.log('[GoogleOAuth] Request headers:', req.headers);
    console.log('[GoogleOAuth] Request query:', req.query);
    
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    console.log('[GoogleOAuth] GET /auth/google/callback - OAuth callback received');
    console.log('[GoogleOAuth] Callback request headers:', req.headers);
    console.log('[GoogleOAuth] Callback request query:', req.query);
    console.log('[GoogleOAuth] Callback request body:', req.body);
    console.log('[GoogleOAuth] Callback request method:', req.method);
    
    passport.authenticate('google', { 
        failureRedirect: '/auth/failure',
        session: false 
    })(req, res, next);
}, async (req, res) => {
    try {
        console.log('[GoogleOAuth] OAuth callback successful for user:', req.user.email);
        console.log('[GoogleOAuth] User data from passport:', {
            id: req.user.id,
            email: req.user.email,
            googleId: req.user.google_id,
            fullName: req.user.full_name
        });
        
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

        console.log('[GoogleOAuth] JWT token generated successfully');

        // For iOS client, redirect to a custom URL scheme
        const redirectUrl = `fromyourlens://oauth-callback?token=${encodeURIComponent(token)}&userId=${req.user.id}&email=${encodeURIComponent(req.user.email)}&fullName=${encodeURIComponent(req.user.full_name || '')}&profilePictureUrl=${encodeURIComponent(req.user.profile_picture_url || '')}`;
        
        console.log('[GoogleOAuth] Redirecting to iOS app:', redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('[GoogleOAuth] Error in callback:', error);
        console.error('[GoogleOAuth] Error stack:', error.stack);
        res.redirect('/auth/failure');
    }
});

// POST route for iOS token exchange
router.post('/google/callback', async (req, res) => {
    console.log('[GoogleOAuth] POST /auth/google/callback - iOS token exchange');
    console.log('[GoogleOAuth] Request headers:', req.headers);
    console.log('[GoogleOAuth] Request body:', req.body);
    
    try {
        const { id_token, access_token } = req.body;
        
        if (!id_token || !access_token) {
            console.error('[GoogleOAuth] Missing tokens in request body');
            return res.status(400).json({ error: 'Missing id_token or access_token' });
        }
        
        // Verify the ID token with Google
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        console.log('[GoogleOAuth] ID token verified for user:', payload.email);
        
        // Create or update user in database
        const userData = {
            googleId: payload.sub,
            email: payload.email,
            fullName: payload.name,
            profilePictureUrl: payload.picture
        };
        
        console.log('[GoogleOAuth] User data to upsert:', userData);
        const user = await upsertUser(userData);
        console.log('[GoogleOAuth] User upserted successfully:', user.email);
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                googleId: user.google_id
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        console.log('[GoogleOAuth] JWT token generated successfully');
        
        // Return JWT response for iOS
        res.json({
            token: token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                profilePictureUrl: user.profile_picture_url
            }
        });
        
    } catch (error) {
        console.error('[GoogleOAuth] Error in POST callback:', error);
        console.error('[GoogleOAuth] Error stack:', error.stack);
        res.status(500).json({ error: 'Token exchange failed' });
    }
});

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