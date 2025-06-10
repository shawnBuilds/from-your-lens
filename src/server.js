require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const pool = require('../db/pool');
const { initializeDatabase } = require('../db/users');
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
    origin: 'https://canvas.play.rosebud.ai',
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

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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

// Initialize all database tables
Promise.all([
    initializeDatabase(),
    createPhotosTable()
])
    .then(() => {
        app.listen(PORT, () => {
            console.log(`[Server] Running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('[Server] Failed to initialize database:', err);
        process.exit(1);
    }); 