const pool = require('../db/pool');

async function checkUser(userId) {
    const client = await pool.connect();
    
    try {
        console.log(`[Check User] Checking data for user ID: ${userId}`);
        
        // Query to get user data
        const query = `
            SELECT 
                id,
                email,
                full_name,
                profile_picture_url,
                created_at,
                last_login
            FROM users 
            WHERE id = $1;
        `;
        
        const result = await client.query(query, [userId]);
        
        if (result.rows.length === 0) {
            console.log('[Check User] No user found with ID:', userId);
            return;
        }
        
        const user = result.rows[0];
        console.log('\n[Check User] User Data:');
        console.log('------------------------');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Full Name:', user.full_name);
        console.log('Profile Picture URL:', user.profile_picture_url || 'Not set');
        console.log('Created At:', user.created_at);
        console.log('Last Login:', user.last_login);
        console.log('------------------------\n');
        
        // Additional check for profile picture URL
        if (user.profile_picture_url) {
            console.log('[Check User] Profile Picture Details:');
            console.log('- URL exists and is set');
            console.log('- URL length:', user.profile_picture_url.length);
            console.log('- URL starts with:', user.profile_picture_url.substring(0, 50) + '...');
        } else {
            console.log('[Check User] Profile Picture Details:');
            console.log('- No profile picture URL set');
        }
        
    } catch (error) {
        console.error('[Check User] Error:', error.message);
        console.error('[Check User] Error stack:', error.stack);
    } finally {
        client.release();
    }
}

// Run the check for user ID 1
checkUser(1)
    .then(() => {
        console.log('[Check User] Script completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('[Check User] Script failed:', error);
        process.exit(1);
    }); 