const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { upsertUser, getUserByGoogleId, getUserById } = require('../../db/users');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Google OAuth configuration
const GOOGLE_SCOPES = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/photoslibrary.readonly'  // Add Photos API scope
];

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

// Configure Passport with Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_PHOTOS_CLIENT_ID || process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_PHOTOS_CLIENT_SECRET || process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_PHOTOS_REDIRECT_URI || process.env.GOOGLE_DRIVE_REDIRECT_URI,
    scope: GOOGLE_SCOPES
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('[Google OAuth] Callback received for profile:', profile.id);
        console.log('[Google OAuth] Token details:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length,
            refreshTokenLength: refreshToken?.length,
            email: profile.emails[0].value
        });

        // First check if user exists to preserve their profile picture
        const existingUser = await getUserByGoogleId(profile.id);
        console.log('[Google OAuth] Existing user check:', {
            exists: !!existingUser,
            hasProfilePicture: !!existingUser?.profile_picture_url,
            profilePictureUrl: existingUser?.profile_picture_url
        });

        const userData = {
            googleId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            profilePictureUrl: existingUser?.profile_picture_url || null, // Preserve existing profile picture
            photosAccessToken: accessToken,
            photosRefreshToken: refreshToken,
            photosTokenExpiry: new Date(Date.now() + 3600 * 1000) // 1 hour from now
        };

        console.log('[Google OAuth] Storing tokens in database:', {
            email: userData.email,
            hasAccessToken: !!userData.photosAccessToken,
            hasRefreshToken: !!userData.photosRefreshToken,
            tokenExpiry: userData.photosTokenExpiry,
            hasProfilePicture: !!userData.profilePictureUrl,
            profilePictureUrl: userData.profilePictureUrl
        });

        const user = await upsertUser(userData);
        console.log('[Google OAuth] User upserted successfully:', {
            userId: user.id,
            email: user.email,
            hasAccessToken: !!user.photos_access_token,
            hasRefreshToken: !!user.photos_refresh_token,
            tokenExpiry: user.photos_token_expiry,
            hasProfilePicture: !!user.profile_picture_url,
            profilePictureUrl: user.profile_picture_url
        });
        return done(null, user);
    } catch (err) {
        console.error('[Google OAuth] Strategy error:', err.message);
        console.error('[Google OAuth] Error stack:', err.stack);
        return done(err, null);
    }
}));

// Passport session serialization
passport.serializeUser((user, done) => {
    console.log('[Session] Serializing user:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log('[Session] Attempting to deserialize user ID:', id);
        const user = await getUserById(id);
        
        if (user) {
            console.log('[Session] User found by ID:', user.email);
            done(null, user);
        } else {
            console.log('[Session] User not found by ID:', id);
            done(null, false);
        }
    } catch (err) {
        console.error('[Session] Deserialization error:', err.message);
        console.error('[Session] Error stack:', err.stack);
        done(err, null);
    }
});

// Session check endpoint - now supports both session and JWT
router.get('/check-session', (req, res) => {
    console.log('[Auth] Checking session status');
    if (req.isAuthenticated()) {
        console.log('[Auth] Valid session found for user:', req.user.id);
        res.json({ 
            valid: true, 
            user: {
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.full_name,
                profilePictureUrl: req.user.profile_picture_url
            }
        });
    } else {
        console.log('[Auth] No valid session found');
        res.status(401).json({ valid: false });
    }
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

// Auth Routes
router.get('/google', (req, res, next) => {
    console.log('[Google OAuth] Initiating authentication flow');
    next();
}, passport.authenticate('google', { 
    scope: GOOGLE_SCOPES,
    accessType: 'offline',  // This is required to get a refresh token
    prompt: 'consent'       // This ensures we get a refresh token even if we already have one
}));

// Google Photos specific auth route
router.get('/google/photos', (req, res, next) => {
    console.log('[Google Photos OAuth] Initiating authentication flow');
    next();
}, passport.authenticate('google', { 
    scope: GOOGLE_SCOPES,
    accessType: 'offline',
    prompt: 'consent'
}));

// Logout route
router.get('/logout', (req, res) => {
    console.log('[Logout] Starting logout process');
    console.log('[Logout] Session ID:', req.sessionID);
    console.log('[Logout] User authenticated:', !!req.user);
    
    req.logout((err) => {
        if (err) {
            console.error('[Logout] Passport logout failed:', err.message);
            console.error('[Logout] Error stack:', err.stack);
            return res.status(500).json({ error: 'Error during logout' });
        }
        console.log('[Logout] Passport logout successful');
        
        req.session.destroy((err) => {
            if (err) {
                console.error('[Logout] Session destruction failed:', err.message);
                console.error('[Logout] Error stack:', err.stack);
                return res.status(500).json({ error: 'Error destroying session' });
            }
            console.log('[Logout] Session destroyed successfully');
            
            res.clearCookie('connect.sid');
            console.log('[Logout] Session cookie cleared');
            console.log('[Logout] Logout process completed successfully');
            res.json({ message: 'Logged out successfully' });
        });
    });
});

// Google Photos callback route
router.get('/google/photos/callback', (req, res, next) => {
    console.log('[Google Photos OAuth] Handling callback request', {
        sessionId: req.sessionID,
        hasUser: !!req.user
    });
    next();
}, passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
}), (req, res) => {
    console.log('[Google Photos OAuth] Authentication successful, generating JWT token', {
        userId: req.user.id,
        email: req.user.email,
        sessionId: req.sessionID
    });
    
    const userData = {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.full_name,
        profilePictureUrl: req.user.profile_picture_url
    };

    console.log('[Google Photos OAuth] User data being sent to frontend:', {
        ...userData,
        hasProfilePicture: !!userData.profilePictureUrl,
        profilePictureUrl: userData.profilePictureUrl
    });
    
    const token = jwt.sign(
        userData,
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '1h' }
    );
    
    console.log('[Google Photos OAuth] JWT token generated', {
        userId: req.user.id,
        tokenExpiry: new Date(Date.now() + 3600 * 1000).toISOString(),
        tokenPayload: userData
    });
    
    console.log('[Google Photos OAuth] Sending success response to client');
    // Send HTML that will communicate with the opener window
    res.send(`
        <html>
            <body>
                <script>
                    if (window.opener) {
                        const responseData = {
                            type: 'GOOGLE_PHOTOS_AUTH_SUCCESS',
                            token: '${token}',
                            user: ${JSON.stringify(userData)}
                        };
                        console.log('[Google Photos OAuth] Sending response data:', responseData);
                        window.opener.postMessage(responseData, '*');
                        window.close();
                    }
                </script>
            </body>
        </html>
    `);
});

// Keep the existing Drive callback for backward compatibility
router.get('/google/callback', (req, res, next) => {
    console.log('[Google OAuth] Handling callback request', {
        sessionId: req.sessionID,
        hasUser: !!req.user
    });
    next();
}, passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
}), (req, res) => {
    console.log('[Google OAuth] Authentication successful, generating JWT token', {
        userId: req.user.id,
        email: req.user.email,
        sessionId: req.sessionID
    });
    
    const userData = {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.full_name,
        profilePictureUrl: req.user.profile_picture_url
    };

    console.log('[Google OAuth] User data being sent to frontend:', {
        ...userData,
        hasProfilePicture: !!userData.profilePictureUrl,
        profilePictureUrl: userData.profilePictureUrl
    });
    
    const token = jwt.sign(
        userData,
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '1h' }
    );
    
    console.log('[Google OAuth] JWT token generated', {
        userId: req.user.id,
        tokenExpiry: new Date(Date.now() + 3600 * 1000).toISOString(),
        tokenPayload: userData
    });
    
    console.log('[Google OAuth] Sending success response to client');
    // Send HTML that will communicate with the opener window
    res.send(`
        <html>
            <body>
                <script>
                    if (window.opener) {
                        const responseData = {
                            type: 'GOOGLE_AUTH_SUCCESS',
                            token: '${token}',
                            user: ${JSON.stringify(userData)}
                        };
                        console.log('[Google OAuth] Sending response data:', responseData);
                        window.opener.postMessage(responseData, '*');
                        window.close();
                    }
                </script>
            </body>
        </html>
    `);
});

module.exports = { router, verifyJWT }; 