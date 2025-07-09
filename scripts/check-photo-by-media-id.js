const pool = require('../db/pool');

// Get media item ID from command line argument
const MEDIA_ITEM_ID = process.argv[2];

if (!MEDIA_ITEM_ID) {
    console.error('❌ Media item ID is required.');
    console.log('Usage: node scripts/check-photo-by-media-id.js [media_item_id]');
    console.log('Example: node scripts/check-photo-by-media-id.js "5DE683F6-675E-499E-B81F-F4562A9516B2/L0/001"');
    process.exit(1);
}

async function checkPhotoByMediaId() {
    try {
        console.log(`🔍 Checking photo with media_item_id: ${MEDIA_ITEM_ID}...\n`);
        
        // Get photo by media item ID
        const result = await pool.query(`
            SELECT 
                p.id,
                p.media_item_id,
                p.user_id,
                u.email as uploaded_by_email,
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
                p.updated_at,
                p.s3_key,
                p.s3_url,
                p.shared_at
            FROM photos p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN users po ON p.photo_of = po.id
            WHERE p.media_item_id = $1
        `, [MEDIA_ITEM_ID]);

        if (result.rows.length === 0) {
            console.log(`❌ Photo with media_item_id "${MEDIA_ITEM_ID}" not found in database.`);
            console.log('\n💡 This means:');
            console.log('  - The photo was never inserted into the photos table');
            console.log('  - Only the S3 upload happened, but no database record exists');
            console.log('  - The photo needs to be added to the database first');
            return;
        }

        const photo = result.rows[0];
        console.log(`✅ Photo found in database!\n`);
        
        console.log(`📸 Photo Details:`);
        console.log(`  ID: ${photo.id}`);
        console.log(`  Media Item ID: ${photo.media_item_id}`);
        console.log(`  Uploaded by: ${photo.uploaded_by_email || 'Unknown'} (User ID: ${photo.user_id})`);
        console.log(`  Photo of: ${photo.photo_of_email || 'Unknown'} (User ID: ${photo.photo_of})`);
        console.log(`  Alt Text: ${photo.alt_text || 'Not set'}`);
        console.log(`  Tags: ${photo.tags?.length ? photo.tags.join(', ') : 'None'}`);
        console.log(`  Base URL: ${photo.base_url || 'Not set'}`);
        console.log(`  MIME Type: ${photo.mime_type || 'Not set'}`);
        console.log(`  Dimensions: ${photo.width ? `${photo.width}x${photo.height}` : 'Not set'}`);
        console.log(`  Creation Time: ${photo.creation_time || 'Not set'}`);
        console.log(`  Created At: ${photo.created_at}`);
        console.log(`  Updated At: ${photo.updated_at}`);
        console.log(`  S3 Key: ${photo.s3_key || 'Not set'}`);
        console.log(`  S3 URL: ${photo.s3_url || 'Not set'}`);
        console.log(`  Shared At: ${photo.shared_at || 'Not set'}`);
        
        console.log('\n🔍 Analysis:');
        if (photo.photo_of) {
            console.log(`  ✅ photo_of is set to: ${photo.photo_of} (${photo.photo_of_email})`);
        } else {
            console.log(`  ❌ photo_of is NULL - this is the problem!`);
            console.log(`  💡 The photo exists but isn't marked as being of any user`);
        }
        
        if (photo.s3_key && photo.s3_url) {
            console.log(`  ✅ S3 upload completed successfully`);
        } else {
            console.log(`  ❌ S3 upload not completed`);
        }

    } catch (error) {
        console.error('❌ Error checking photo:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
checkPhotoByMediaId(); 