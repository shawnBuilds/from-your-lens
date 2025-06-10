require('dotenv').config();
const pool = require('../db/pool');

async function clearUsers() {
    try {
        console.log('Clearing users table...');
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
        console.log('Users table cleared successfully.');
    } catch (error) {
        console.error('Error clearing users table:', error);
        throw error;
    }
}

async function checkUsers() {
    try {
        // Get all users with token status
        const result = await pool.query(`
            SELECT 
                id,
                google_id,
                email,
                full_name,
                profile_picture_url,
                drive_access_token IS NOT NULL as has_drive_token,
                drive_token_expiry > CURRENT_TIMESTAMP as is_drive_token_valid,
                photos_access_token IS NOT NULL as has_photos_token,
                photos_token_expiry > CURRENT_TIMESTAMP as is_photos_token_valid,
                created_at,
                last_login
            FROM users
            ORDER BY id
        `);

        if (result.rows.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        console.log(`Found ${result.rows.length} users in the database.\n`);

        // Display each user's details
        result.rows.forEach(user => {
            console.log(`User ID: ${user.id}`);
            console.log(`  Google ID: ${user.google_id}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Full Name: ${user.full_name || 'Not set'}`);
            console.log(`  Profile Picture: ${user.profile_picture_url || 'Not set'}`);
            console.log('  Drive Access:');
            console.log(`    Has Token: ${user.has_drive_token ? 'Yes' : 'No'}`);
            console.log(`    Token Valid: ${user.is_drive_token_valid ? 'Yes' : 'No'}`);
            console.log('  Photos Access:');
            console.log(`    Has Token: ${user.has_photos_token ? 'Yes' : 'No'}`);
            console.log(`    Token Valid: ${user.is_photos_token_valid ? 'Yes' : 'No'}`);
            console.log(`  Created At: ${user.created_at}`);
            console.log(`  Last Login: ${user.last_login}`);
            console.log('----------------------------------------');
        });

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await pool.end();
    }
}

// Check if --clear flag is provided
const shouldClear = process.argv.includes('--clear');

async function main() {
    if (shouldClear) {
        await clearUsers();
    }
    await checkUsers();
}

main().catch(console.error); 