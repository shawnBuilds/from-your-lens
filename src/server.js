require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const pool = require('../db/pool');
const { initializeDatabase } = require('../db/users');
const Controls = require('./controls');

// Import auth routes
const { router: authRoutes, verifyJWT } = require('./routes/auth');

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

// Session configuration for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());

// Log OAuth configuration (without exposing secrets)
console.log('[Server] OAuth Configuration:');
console.log('[Server] - Google Client ID configured:', !!process.env.GOOGLE_CLIENT_ID);
if (process.env.GOOGLE_CLIENT_ID) {
    console.log('[Server] - Google Client ID (first 20 chars):', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
    console.log('[Server] - Google Client ID (last 10 chars):', '...' + process.env.GOOGLE_CLIENT_ID.substring(process.env.GOOGLE_CLIENT_ID.length - 10));
}
console.log('[Server] - Google Client Secret configured:', !!process.env.GOOGLE_CLIENT_SECRET);
if (process.env.GOOGLE_CLIENT_SECRET) {
    console.log('[Server] - Google Client Secret (first 10 chars):', process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...');
}
console.log('[Server] - JWT Secret configured:', !!process.env.JWT_SECRET);
console.log('[Server] - NODE_ENV:', process.env.NODE_ENV);
console.log('[Server] - Callback URL:', process.env.NODE_ENV === 'production' 
    ? 'https://fromyourlens-904e01076638.herokuapp.com/auth/google/callback'
    : 'http://localhost:5000/auth/google/callback');

// Routes
app.use('/auth', authRoutes);
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
            console.log(`[Server] Face Detection: ${Controls.enableFaceDetection ? 'ENABLED' : 'DISABLED'}`);
            console.log(`[Server] JWT Auth: ${Controls.enableJWT ? 'ENABLED' : 'DISABLED'}`);
        });
    } catch (err) {
        console.error('[Server] Failed to initialize database:', err);
        process.exit(1);
    }
}

startServer(); 