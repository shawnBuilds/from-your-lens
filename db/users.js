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
            drive_access_token TEXT,
            drive_refresh_token TEXT,
            drive_token_expiry TIMESTAMP WITH TIME ZONE,
            photos_access_token TEXT,
            photos_refresh_token TEXT,
            photos_token_expiry TIMESTAMP WITH TIME ZONE,
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
            drive_access_token,
            drive_refresh_token,
            drive_token_expiry,
            photos_access_token,
            photos_refresh_token,
            photos_token_expiry,
            last_login
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        ON CONFLICT (google_id) 
        DO UPDATE SET 
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            profile_picture_url = EXCLUDED.profile_picture_url,
            drive_access_token = EXCLUDED.drive_access_token,
            drive_refresh_token = EXCLUDED.drive_refresh_token,
            drive_token_expiry = EXCLUDED.drive_token_expiry,
            photos_access_token = EXCLUDED.photos_access_token,
            photos_refresh_token = EXCLUDED.photos_refresh_token,
            photos_token_expiry = EXCLUDED.photos_token_expiry,
            last_login = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    
    const values = [
        userData.googleId,
        userData.email,
        userData.fullName,
        userData.profilePictureUrl,
        userData.driveAccessToken,
        userData.driveRefreshToken,
        userData.driveTokenExpiry,
        userData.photosAccessToken,
        userData.photosRefreshToken,
        userData.photosTokenExpiry
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

// Update Drive tokens for a user
const updateDriveTokens = async (userId, { access_token, refresh_token, expiry_date }) => {
    const query = `
        UPDATE users 
        SET 
            drive_access_token = $1,
            drive_refresh_token = $2,
            drive_token_expiry = $3
        WHERE id = $4
        RETURNING *;
    `;
    
    try {
        console.log('[Database] Updating Drive tokens for user:', userId);
        const result = await pool.query(query, [
            access_token,
            refresh_token,
            expiry_date,
            userId
        ]);
        console.log('[Database] Drive tokens updated successfully');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error updating Drive tokens:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Get Drive tokens for a user
const getDriveTokens = async (userId) => {
    const query = `
        SELECT 
            drive_access_token,
            drive_refresh_token,
            drive_token_expiry
        FROM users 
        WHERE id = $1;
    `;
    
    try {
        console.log('[Database] Fetching Drive tokens for user:', userId);
        const result = await pool.query(query, [userId]);
        console.log('[Database] Drive tokens fetched successfully');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error fetching Drive tokens:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Check if Drive tokens are valid
const areDriveTokensValid = async (userId) => {
    const query = `
        SELECT 
            drive_access_token IS NOT NULL as has_access_token,
            drive_refresh_token IS NOT NULL as has_refresh_token,
            drive_token_expiry > CURRENT_TIMESTAMP as is_token_valid
        FROM users 
        WHERE id = $1;
    `;
    
    try {
        console.log('[Database] Checking Drive token validity for user:', userId);
        const result = await pool.query(query, [userId]);
        const { has_access_token, has_refresh_token, is_token_valid } = result.rows[0];
        console.log('[Database] Drive token validity check complete');
        return has_access_token && has_refresh_token && is_token_valid;
    } catch (err) {
        console.error('[Database] Error checking Drive token validity:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Update Photos tokens for a user
const updatePhotosTokens = async (userId, { access_token, refresh_token, expiry_date }) => {
    const query = `
        UPDATE users 
        SET 
            photos_access_token = $1,
            photos_refresh_token = $2,
            photos_token_expiry = $3
        WHERE id = $4
        RETURNING *;
    `;
    
    try {
        console.log('[Database] Updating Photos tokens for user:', userId);
        const result = await pool.query(query, [
            access_token,
            refresh_token,
            expiry_date,
            userId
        ]);
        console.log('[Database] Photos tokens updated successfully');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error updating Photos tokens:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Get Photos tokens for a user
const getPhotosTokens = async (userId) => {
    const query = `
        SELECT 
            photos_access_token,
            photos_refresh_token,
            photos_token_expiry
        FROM users 
        WHERE id = $1;
    `;
    
    try {
        console.log('[Database] Fetching Photos tokens for user:', userId);
        const result = await pool.query(query, [userId]);
        console.log('[Database] Photos tokens fetched successfully');
        return result.rows[0];
    } catch (err) {
        console.error('[Database] Error fetching Photos tokens:', err.message);
        console.error('[Database] Error stack:', err.stack);
        throw err;
    }
};

// Check if Photos tokens are valid
const arePhotosTokensValid = async (userId) => {
    const query = `
        SELECT 
            photos_access_token IS NOT NULL as has_access_token,
            photos_refresh_token IS NOT NULL as has_refresh_token,
            photos_token_expiry > CURRENT_TIMESTAMP as is_token_valid
        FROM users 
        WHERE id = $1;
    `;
    
    try {
        console.log('[Database] Checking Photos token validity for user:', userId);
        const result = await pool.query(query, [userId]);
        const { has_access_token, has_refresh_token, is_token_valid } = result.rows[0];
        console.log('[Database] Photos token validity check complete');
        return has_access_token && has_refresh_token && is_token_valid;
    } catch (err) {
        console.error('[Database] Error checking Photos token validity:', err.message);
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
    updateDriveTokens,
    getDriveTokens,
    areDriveTokensValid,
    updatePhotosTokens,
    getPhotosTokens,
    arePhotosTokensValid,
    createUsersTable
}; 