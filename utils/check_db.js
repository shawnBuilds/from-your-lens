require('dotenv').config();
const pool = require('../db/pool');

// Function to get all users
const getAllUsers = async () => {
    try {
        const result = await pool.query('SELECT * FROM users;');
        return result.rows;
    } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
    }
};

// Function to get user count
const getUserCount = async () => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM users;');
        return result.rows[0].count;
    } catch (err) {
        console.error('Error getting user count:', err);
        throw err;
    }
};

// Function to get table structure
const getTableStructure = async () => {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'users';
        `);
        return result.rows;
    } catch (err) {
        console.error('Error getting table structure:', err);
        throw err;
    }
};

// Main function to display all information
const displayDatabaseInfo = async () => {
    try {
        console.log('\n=== DATABASE CHECK REPORT ===\n');

        // Get and display table structure
        console.log('📋 TABLE STRUCTURE:');
        console.log('-------------------');
        const structure = await getTableStructure();
        structure.forEach(column => {
            console.log(`${column.column_name}: ${column.data_type}${column.character_maximum_length ? ` (max length: ${column.character_maximum_length})` : ''}`);
        });
        console.log('\n');

        // Get and display user count
        console.log('👥 USER COUNT:');
        console.log('-------------');
        const count = await getUserCount();
        console.log(`Total users: ${count}\n`);

        // Get and display all users
        console.log('👤 USER DETAILS:');
        console.log('---------------');
        const users = await getAllUsers();
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            users.forEach((user, index) => {
                console.log(`\nUser ${index + 1}:`);
                console.log(`  ID: ${user.id}`);
                console.log(`  Google ID: ${user.google_id}`);
                console.log(`  Email: ${user.email}`);
                console.log(`  Full Name: ${user.full_name}`);
                console.log(`  Profile Picture: ${user.profile_picture_url || 'Not set'}`);
                console.log(`  Created: ${user.created_at}`);
                console.log(`  Last Login: ${user.last_login}`);
            });
        }

        console.log('\n=== END OF REPORT ===\n');
    } catch (err) {
        console.error('Error generating database report:', err);
    } finally {
        // Close the pool
        await pool.end();
    }
};

// Run the script
displayDatabaseInfo(); 