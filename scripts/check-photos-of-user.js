const pool = require('../db/pool');

// Get target user ID from command line argument or use default
const TARGET_USER_ID = process.argv[2] ? parseInt(process.argv[2]) : 1;

// Validate the user ID
if (isNaN(TARGET_USER_ID) || TARGET_USER_ID <= 0) {
    console.error('❌ Invalid user ID. Please provide a positive number.');
    console.log('Usage: node scripts/check-photos-of-user.js [user_id]');
    console.log('Example: node scripts/check-photos-of-user.js 5');
    process.exit(1);
}

async function checkPhotosOfUser() {
    try {
        console.log(`🔍 Checking photos where photo_of = ${TARGET_USER_ID}...\n`);
        
        // First, verify the user exists
        const userCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [TARGET_USER_ID]);
        if (userCheck.rows.length === 0) {
            console.log(`❌ User ID ${TARGET_USER_ID} not found in the database.`);
            console.log('\n💡 Available users:');
            const allUsers = await pool.query('SELECT id, email FROM users ORDER BY id LIMIT 10');
            allUsers.rows.forEach(user => {
                console.log(`  ID: ${user.id} - ${user.email}`);
            });
            return;
        }
        
        console.log(`✅ User found: ${userCheck.rows[0].email} (ID: ${TARGET_USER_ID})\n`);
        
        // Get photos where the target user is the subject
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
            WHERE p.photo_of = $1
            ORDER BY p.created_at DESC
        `, [TARGET_USER_ID]);

        if (result.rows.length === 0) {
            console.log(`❌ No photos found where photo_of = ${TARGET_USER_ID}`);
            console.log('\n💡 This could mean:');
            console.log('  - No photos have been marked as photos of this user');
            console.log('  - Photos need to be uploaded and tagged with this user');
            console.log('  - The batch compare process hasn\'t identified photos of this user yet');
            return;
        }

        console.log(`✅ Found ${result.rows.length} photos where photo_of = ${TARGET_USER_ID}\n`);

        // Display each photo's details
        result.rows.forEach((photo, index) => {
            console.log(`📸 Photo ${index + 1}:`);
            console.log(`  ID: ${photo.id}`);
            console.log(`  Media Item ID: ${photo.media_item_id || 'Not set'}`);
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
            console.log('----------------------------------------');
        });

        // Summary statistics
        console.log('\n📊 Summary:');
        console.log(`  Total photos of user ${TARGET_USER_ID}: ${result.rows.length}`);
        
        // Count by uploader
        const uploaderCounts = {};
        result.rows.forEach(photo => {
            const uploader = photo.uploaded_by_email || 'Unknown';
            uploaderCounts[uploader] = (uploaderCounts[uploader] || 0) + 1;
        });
        
        console.log('  Photos by uploader:');
        Object.entries(uploaderCounts).forEach(([uploader, count]) => {
            console.log(`    ${uploader}: ${count} photos`);
        });

        // Check for S3 uploads
        const s3Uploads = result.rows.filter(photo => photo.s3_key && photo.s3_url);
        console.log(`  Photos with S3 uploads: ${s3Uploads.length}/${result.rows.length}`);

        // Check for tags
        const taggedPhotos = result.rows.filter(photo => photo.tags && photo.tags.length > 0);
        console.log(`  Photos with tags: ${taggedPhotos.length}/${result.rows.length}`);

    } catch (error) {
        console.error('❌ Error checking photos of user:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
checkPhotosOfUser(); 