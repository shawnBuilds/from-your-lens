require('dotenv').config();
const { Pool } = require('pg');

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect()
    .then(() => console.log('[Database] Connected to PostgreSQL database'))
    .catch(err => {
        console.error('[Database] Connection error:', err.message);
        console.error('[Database] Error stack:', err.stack);
        process.exit(1); // Exit if we can't connect to the database
    });

module.exports = pool; 