const pool = require('../db/pool');

async function migratePhotosTableForS3() {
    console.log('[Migration] Starting photos table S3 migration...');
    
    try {
        // Drop existing photos table
        const dropQuery = `DROP TABLE IF EXISTS photos CASCADE;`;
        await pool.query(dropQuery);
        console.log('[Migration] Dropped existing photos table');
        
        // Create new photos table with all required fields including S3
        const createQuery = `
            CREATE TABLE photos (
                id SERIAL PRIMARY KEY,
                media_item_id VARCHAR(255) UNIQUE NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id),
                photo_of INTEGER REFERENCES users(id),  -- Allow NULL
                alt_text VARCHAR(255),
                tags TEXT[] DEFAULT '{}',
                base_url TEXT,
                mime_type VARCHAR(100),
                width INTEGER,
                height INTEGER,
                creation_time TIMESTAMP WITH TIME ZONE,
                s3_key VARCHAR(500),
                s3_url TEXT,
                shared_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await pool.query(createQuery);
        console.log('[Migration] Successfully created new photos table with S3 fields');
        
        // Create indexes for better performance
        const indexes = [
            'CREATE INDEX idx_photos_user_id ON photos(user_id);',
            'CREATE INDEX idx_photos_photo_of ON photos(photo_of);',
            'CREATE INDEX idx_photos_media_item_id ON photos(media_item_id);',
            'CREATE INDEX idx_photos_s3_key ON photos(s3_key);',
            'CREATE INDEX idx_photos_creation_time ON photos(creation_time DESC);',
            'CREATE INDEX idx_photos_shared_at ON photos(shared_at DESC);'
        ];
        
        for (const indexQuery of indexes) {
            await pool.query(indexQuery);
        }
        console.log('[Migration] Successfully created all indexes');
        
        console.log('[Migration] Photos table S3 migration completed successfully');
        
    } catch (error) {
        console.error('[Migration] Error during photos table S3 migration:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    migratePhotosTableForS3()
        .then(() => {
            console.log('[Migration] Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('[Migration] Migration failed:', error);
            process.exit(1);
        });
}

module.exports = migratePhotosTableForS3; 