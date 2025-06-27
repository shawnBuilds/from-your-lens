require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const pool = require('../db/pool');
const { initializeDatabase } = require('../db/users');
const Controls = require('./controls');

// Conditionally import auth routes
let authRoutes, verifyJWT;
if (Controls.enableGoogleOAuth || Controls.enableSessionAuth) {
    const authModule = require('./routes/auth');
    authRoutes = authModule.router;
    verifyJWT = authModule.verifyJWT;
} else {
    // Mock auth middleware for when OAuth is disabled
    verifyJWT = (req, res, next) => {
        // For now, just pass through - you can add mock user data here
        req.user = { id: 1, email: 'mock@example.com' };
        next();
    };
}

const driveRoutes = require('./routes/drive');
const faceRoutes = require('./routes/face');
const userRoutes = require('./routes/user');
const photosRoutes = require('./routes/photos');
const googlePhotosRoutes = require('./routes/googlePhotos');
const { createPhotosTable } = require('../db/photos');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://canvas.play.rosebud.ai', 'https://fromyourlens-904e01076638.herokuapp.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://canvas.play.rosebud.ai'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// Initialize Passport (only if auth is enabled)
if (Controls.enableGoogleOAuth || Controls.enableSessionAuth) {
    app.use(passport.initialize());
    app.use(passport.session());
}

// Routes
if (authRoutes) {
    app.use('/auth', authRoutes);
}
app.use('/drive', driveRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/users', verifyJWT, userRoutes);
app.use('/api/photos', verifyJWT, photosRoutes);
app.use('/api/google-photos', verifyJWT, googlePhotosRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
    console.log('[Health] Checking server status');
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Server] Error:', err.message);
    console.error('[Server] Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

// Initialize all database tables sequentially
async function startServer() {
    try {
        console.log('[Server] Initializing database tables...');
        
        if (Controls.enableDatabaseInitialization) {
            // Initialize users table first
            await initializeDatabase();
            console.log('[Server] Users table initialized');
            
            // Then initialize photos table (which depends on users table)
            await createPhotosTable();
            console.log('[Server] Photos table initialized');
        } else {
            console.log('[Server] Database initialization disabled');
        }
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`[Server] Running on port ${PORT}`);
            console.log(`[Server] Google OAuth: ${Controls.enableGoogleOAuth ? 'ENABLED' : 'DISABLED'}`);
            console.log(`[Server] Face Detection: ${Controls.enableFaceDetection ? 'ENABLED' : 'DISABLED'}`);
        });
    } catch (err) {
        console.error('[Server] Failed to initialize database:', err);
        process.exit(1);
    }
}

startServer(); 