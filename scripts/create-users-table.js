require('dotenv').config();
const pool = require('../db/pool');

async function main() {
    console.group('👥 Users Table Creation');
    try {
        console.log('🔄 Dropping existing users table...');
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        console.log('✅ Old users table dropped');

        console.log('🔄 Creating new users table...');
        const query = `
            CREATE TABLE users (
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
        await pool.query(query);
        console.log('✅ New users table created successfully');
        
        console.group('📋 Table Structure');
        console.log(query);
        console.groupEnd();
        
    } catch (error) {
        console.error('❌ Error creating users table:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
    console.groupEnd();
}

main(); 