const { Pool } = require('pg');
const pool = require('../db/pool');

async function migratePhotosTable() {
    const client = await pool.connect();
    
    try {
        console.log('Starting photos table migration...');
        
        // Start transaction
        await client.query('BEGIN');
        
        // Create backup of current photos table
        console.log('Creating backup of current photos table...');
        await client.query(`
            CREATE TABLE photos_backup AS 
            SELECT * FROM photos
        `);
        
        // Create new photos table with updated schema
        console.log('Creating new photos table...');
        await client.query(`
            CREATE TABLE photos_new (
                id SERIAL PRIMARY KEY,
                media_item_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                photo_of INTEGER,
                alt_text TEXT,
                tags TEXT[] DEFAULT '{}',
                base_url TEXT,
                mime_type TEXT,
                width INTEGER,
                height INTEGER,
                creation_time TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_photo_of
                    FOREIGN KEY (photo_of)
                    REFERENCES users(id)
                    ON DELETE SET NULL
            )
        `);
        
        // Create indexes
        console.log('Creating indexes...');
        await client.query(`
            CREATE INDEX idx_photos_media_item_id ON photos_new(media_item_id);
            CREATE INDEX idx_photos_user_id ON photos_new(user_id);
            CREATE INDEX idx_photos_photo_of ON photos_new(photo_of);
            CREATE INDEX idx_photos_creation_time ON photos_new(creation_time);
        `);
        
        // Migrate data
        console.log('Migrating data...');
        await client.query(`
            INSERT INTO photos_new (
                media_item_id,
                user_id,
                photo_of,
                alt_text,
                tags,
                creation_time,
                created_at,
                updated_at
            )
            SELECT 
                drive_file_id as media_item_id,
                user_id,
                photo_of,
                alt_text,
                tags,
                created_time as creation_time,
                created_at,
                updated_at
            FROM photos
        `);
        
        // Drop old table and rename new one
        console.log('Dropping old table and renaming new one...');
        await client.query(`
            DROP TABLE photos;
            ALTER TABLE photos_new RENAME TO photos;
        `);
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('Migration completed successfully!');
        console.log('\nNew photos table structure:');
        const tableInfo = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'photos'
            ORDER BY ordinal_position;
        `);
        
        console.table(tableInfo.rows);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
migratePhotosTable().catch(console.error); 