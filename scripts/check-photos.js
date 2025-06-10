require('dotenv').config();
const pool = require('../db/pool');

async function clearPhotos() {
    try {
        console.log('Clearing photos table...');
        await pool.query('TRUNCATE TABLE photos RESTART IDENTITY CASCADE');
        console.log('Photos table cleared successfully.');
    } catch (error) {
        console.error('Error clearing photos table:', error);
        throw error;
    }
}

async function checkPhotos() {
    try {
        // Get all photos
        const result = await pool.query(`
            SELECT 
                p.id,
                p.media_item_id,
                p.user_id,
                u.email as user_email,
                p.photo_of,
                po.email as photo_of_email,
                p.alt_text,
                p.tags,
                p.base_url,
                p.mime_type,
                p.width,
                p.height,
                p.creation_time,
                p.created_at,
                p.updated_at
            FROM photos p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN users po ON p.photo_of = po.id
            ORDER BY p.id
        `);

        if (result.rows.length === 0) {
            console.log('No photos found in the database.');
            return;
        }

        console.log(`Found ${result.rows.length} photos in the database.\n`);

        // Display each photo's details
        result.rows.forEach(photo => {
            console.log(`Photo ID: ${photo.id}`);
            console.log(`  Media Item ID: ${photo.media_item_id || 'Not set'}`);
            console.log(`  User ID: ${photo.user_id}`);
            console.log(`  User Email: ${photo.user_email || 'Not found'}`);
            console.log(`  Photo Of: ${photo.photo_of_email || 'Not set'}`);
            console.log(`  Alt Text: ${photo.alt_text || 'Not set'}`);
            console.log(`  Tags: ${photo.tags?.length ? photo.tags.join(', ') : 'None'}`);
            console.log(`  Base URL: ${photo.base_url || 'Not set'}`);
            console.log(`  MIME Type: ${photo.mime_type || 'Not set'}`);
            console.log(`  Dimensions: ${photo.width ? `${photo.width}x${photo.height}` : 'Not set'}`);
            console.log(`  Creation Time: ${photo.creation_time || 'Not set'}`);
            console.log(`  Created At: ${photo.created_at}`);
            console.log(`  Updated At: ${photo.updated_at}`);
            console.log('----------------------------------------');
        });

    } catch (error) {
        console.error('Error checking photos:', error);
    } finally {
        await pool.end();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');

// Run the script
async function main() {
    try {
        if (shouldClear) {
            await clearPhotos();
        }
        await checkPhotos();
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main(); 