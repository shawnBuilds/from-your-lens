const pool = require('./pool');

// Create users table if it doesn't exist
const createUsersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            google_id VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255),
            profile_picture_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    try {
        console.log('[Database] Creating users table if not exists');
        await pool.query(query);
        console.log('[Database] Users table created or already exists');
    } catch (err) {
        console.error('[Database] Error creating users table:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Get user by database ID
const getUserById = async (id) => {
    const query = `
        SELECT * FROM users 
        WHERE id = $1;
    `;
    
    try {
        console.log('[Database] Fetching user by ID:', id);
        const result = await pool.query(query, [id]);
        console.log('[Database] User fetch result:', result.rows[0] ? 'Found' : 'Not found');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error getting user by ID:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Create or update user from Google OAuth
const upsertUser = async (userData) => {
    const query = `
        INSERT INTO users (
            google_id, 
            email, 
            full_name, 
            profile_picture_url, 
            last_login
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (google_id) 
        DO UPDATE SET 
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            profile_picture_url = EXCLUDED.profile_picture_url,
            last_login = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    
    const values = [
        userData.googleId,
        userData.email,
        userData.fullName,
        userData.profilePictureUrl
    ];

    try {
        console.log('[Database] Upserting user:', userData.email);
        const result = await pool.query(query, values);
        console.log('[Database] User upserted successfully:', userData.email);
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error upserting user:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Get user by Google ID
const getUserByGoogleId = async (googleId) => {
    const query = `
        SELECT * FROM users 
        WHERE google_id = $1;
    `;
    
    try {
        console.log('[Database] Fetching user by Google ID:', googleId);
        const result = await pool.query(query, [googleId]);
        console.log('[Database] User fetch result:', result.rows[0] ? 'Found' : 'Not found');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error getting user by Google ID:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Get user by email
const getUserByEmail = async (email) => {
    const query = `
        SELECT * FROM users 
        WHERE email = $1;
    `;
    
    try {
        console.log('[Database] Fetching user by email:', email);
        const result = await pool.query(query, [email]);
        console.log('[Database] User fetch result:', result.rows[0] ? 'Found' : 'Not found');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error getting user by email:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Initialize the database
const initializeDatabase = async () => {
    try {
        console.log('[Database] Starting database initialization');
        await createUsersTable();
        console.log('[Database] Database initialized successfully');
    } catch (err) {
        console.error('[Database] Error initializing database:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

module.exports = {
    initializeDatabase,
    upsertUser,
    getUserByGoogleId,
    getUserByEmail,
    getUserById,
    createUsersTable
}; 