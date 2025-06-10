require('dotenv').config();
const { createPhotosTable } = require('../db/photos');

async function main() {
    console.group('📸 Photos Table Creation');
    try {
        console.log('🔄 Initializing photos table...');
        await createPhotosTable();
        console.log('✅ Photos table created successfully');
        
        console.group('📋 Table Structure');
        console.log(`
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    media_item_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    photo_of INTEGER REFERENCES users(id),
    alt_text VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    base_url TEXT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    creation_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`);
        console.groupEnd();
        
    } catch (error) {
        console.error('❌ Error creating photos table:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
    console.groupEnd();
}

main(); 