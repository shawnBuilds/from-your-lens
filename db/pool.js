require('dotenv').config();
const { Pool } = require('pg');

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Parse DATABASE_URL and override SSL settings for local development
let connectionConfig = {
    connectionString: process.env.DATABASE_URL
};

// For local development, explicitly disable SSL
if (process.env.NODE_ENV !== 'production') {
    connectionConfig = {
        ...connectionConfig,
        ssl: false,
        rejectUnauthorized: false
    };
} else {
    // For production, use SSL with proper configuration
    connectionConfig = {
        ...connectionConfig,
        ssl: { rejectUnauthorized: false }
    };
}

const pool = new Pool(connectionConfig);

// Test database connection
pool.connect()
    .then(() => console.log('[Database] Connected to PostgreSQL database'))
    .catch(err => {
        console.error('[Database] Connection error:', err.message);
        console.error('[Database] Error stack:', err.stack);
        process.exit(1); // Exit if we can't connect to the database
    });

module.exports = pool; 