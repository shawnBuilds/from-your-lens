require('dotenv').config();
const pool = require('../db/pool');

async function updateUser(userId) {
    const client = await pool.connect();
    
    try {
        console.log(`[Update User] Starting update for user ID: ${userId}`);
        
        // Begin transaction
        await client.query('BEGIN');
        
        // Update user to remove profile picture
        const updateQuery = `
            UPDATE users 
            SET profile_picture_url = NULL 
            WHERE id = $1 
            RETURNING *;
        `;
        
        const result = await client.query(updateQuery, [userId]);
        
        if (result.rows.length === 0) {
            throw new Error(`User with ID ${userId} not found`);
        }
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('[Update User] Successfully updated user:', {
            id: result.rows[0].id,
            email: result.rows[0].email,
            fullName: result.rows[0].full_name,
            profilePictureUrl: result.rows[0].profile_picture_url
        });
        
        return result.rows[0];
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('[Update User] Error:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// If running directly (not imported)
if (require.main === module) {
    const userId = process.argv[2];
    
    if (!userId) {
        console.error('Please provide a user ID as an argument');
        process.exit(1);
    }
    
    updateUser(userId)
        .then(() => {
            console.log('[Update User] Script completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('[Update User] Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { updateUser }; 