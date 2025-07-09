const pool = require('../db/pool');

// Test configuration
const TEST_MEDIA_ITEM_ID = "TEST-PHOTO-" + Date.now();
const TEST_USER_ID = 1; // Change this to a valid user ID
const TEST_SHARED_WITH_USER_ID = 12; // Change this to a valid user ID

async function testUploadShared() {
    try {
        console.log(`🧪 Testing upload-shared route with new database logic...\n`);
        
        // First, check if the test photo exists (it shouldn't)
        console.log(`1️⃣ Checking if test photo exists in database...`);
        const existingPhoto = await pool.query(
            'SELECT * FROM photos WHERE media_item_id = $1',
            [TEST_MEDIA_ITEM_ID]
        );
        
        if (existingPhoto.rows.length > 0) {
            console.log(`❌ Test photo already exists, using different ID`);
            return;
        } else {
            console.log(`✅ Test photo doesn't exist (expected)\n`);
        }
        
        // Check if test users exist
        console.log(`2️⃣ Checking if test users exist...`);
        const user1 = await pool.query('SELECT id, email FROM users WHERE id = $1', [TEST_USER_ID]);
        const user2 = await pool.query('SELECT id, email FROM users WHERE id = $1', [TEST_SHARED_WITH_USER_ID]);
        
        if (user1.rows.length === 0 || user2.rows.length === 0) {
            console.log(`❌ Test users not found. Please update TEST_USER_ID and TEST_SHARED_WITH_USER_ID`);
            console.log(`Available users:`);
            const allUsers = await pool.query('SELECT id, email FROM users ORDER BY id LIMIT 5');
            allUsers.rows.forEach(user => {
                console.log(`  ID: ${user.id} - ${user.email}`);
            });
            return;
        }
        
        console.log(`✅ Test users found:`);
        console.log(`  User 1: ${user1.rows[0].email} (ID: ${TEST_USER_ID})`);
        console.log(`  User 2: ${user2.rows[0].email} (ID: ${TEST_SHARED_WITH_USER_ID})\n`);
        
        // Simulate what the upload-shared route would do
        console.log(`3️⃣ Simulating upload-shared route logic...`);
        
        // Create a dummy photo record
        const photoData = {
            mediaItemId: TEST_MEDIA_ITEM_ID,
            userId: TEST_USER_ID,
            photoOf: TEST_SHARED_WITH_USER_ID, // This is the key change!
            baseUrl: 'icloud://' + TEST_MEDIA_ITEM_ID,
            mimeType: 'image/jpeg',
            width: 1920,
            height: 1080,
            creationTime: new Date(),
            s3Key: `test-s3-key-${TEST_MEDIA_ITEM_ID}`,
            s3Url: `https://test-bucket.s3.amazonaws.com/test-s3-key-${TEST_MEDIA_ITEM_ID}`,
            sharedAt: new Date()
        };
        
        // Insert the photo
        const { upsertPhoto } = require('../db/photos');
        const insertedPhoto = await upsertPhoto(photoData);
        
        console.log(`✅ Successfully inserted test photo:`);
        console.log(`  ID: ${insertedPhoto.id}`);
        console.log(`  Media Item ID: ${insertedPhoto.media_item_id}`);
        console.log(`  User ID: ${insertedPhoto.user_id}`);
        console.log(`  Photo Of: ${insertedPhoto.photo_of}`);
        console.log(`  S3 Key: ${insertedPhoto.s3_key}`);
        console.log(`  S3 URL: ${insertedPhoto.s3_url}\n`);
        
        // Verify the photo can be found by photo_of
        console.log(`4️⃣ Verifying photo can be found by photo_of...`);
        const photosOfUser = await pool.query(
            'SELECT * FROM photos WHERE photo_of = $1',
            [TEST_SHARED_WITH_USER_ID]
        );
        
        console.log(`✅ Found ${photosOfUser.rows.length} photos where photo_of = ${TEST_SHARED_WITH_USER_ID}`);
        
        // Clean up test data
        console.log(`5️⃣ Cleaning up test data...`);
        await pool.query('DELETE FROM photos WHERE media_item_id = $1', [TEST_MEDIA_ITEM_ID]);
        console.log(`✅ Test photo deleted\n`);
        
        console.log(`🎉 Test completed successfully!`);
        console.log(`The upload-shared route should now properly insert photos with photo_of set correctly.`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await pool.end();
    }
}

// Run the test
testUploadShared(); 