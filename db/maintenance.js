require('dotenv').config();
const pool = require('./pool');
const { createUsersTable } = require('./users');

/**
 * Drop and recreate the users table
 * WARNING: This will delete all user data
 */
const refreshUsersTable = async () => {
    const dropQuery = `DROP TABLE IF EXISTS users CASCADE;`;
    const createQuery = createUsersTable;

    try {
        console.log('[Maintenance] Starting users table refresh');
        
        // Drop the table
        console.log('[Maintenance] Dropping users table');
        await pool.query(dropQuery);
        console.log('[Maintenance] Users table dropped successfully');

        // Create the table
        console.log('[Maintenance] Creating users table');
        await createQuery();
        console.log('[Maintenance] Users table created successfully');

        console.log('[Maintenance] Users table refresh completed successfully');
    } catch (err) {
        console.error('[Maintenance] Error refreshing users table:', err.message);
        console.error('[Maintenance] Error stack:', err.stack);
        throw err;
    }
};

/**
 * List all tables in the database
 */
const listTables = async () => {
    const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    `;

    try {
        console.log('[Maintenance] Listing all tables');
        const result = await pool.query(query);
        console.log('[Maintenance] Tables found:', result.rows.map(row => row.table_name).join(', '));
        return result.rows;
    } catch (err) {
        console.error('[Maintenance] Error listing tables:', err.message);
        console.error('[Maintenance] Error stack:', err.stack);
        throw err;
    }
};

/**
 * Check table structure
 * @param {string} tableName - Name of the table to check
 */
const checkTableStructure = async (tableName) => {
    const query = `
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1;
    `;

    try {
        console.log(`[Maintenance] Checking structure of table: ${tableName}`);
        const result = await pool.query(query, [tableName]);
        console.log('[Maintenance] Table structure:', result.rows);
        return result.rows;
    } catch (err) {
        console.error('[Maintenance] Error checking table structure:', err.message);
        console.error('[Maintenance] Error stack:', err.stack);
        throw err;
    }
};

// If this file is run directly
if (require.main === module) {
    const main = async () => {
        try {
            // List current tables
            console.log('\nCurrent tables:');
            await listTables();

            // Refresh users table
            console.log('\nRefreshing users table...');
            await refreshUsersTable();

            // Verify new table structure
            console.log('\nNew users table structure:');
            await checkTableStructure('users');

            // List tables again
            console.log('\nUpdated tables:');
            await listTables();

            console.log('\nMaintenance completed successfully');
        } catch (err) {
            console.error('Maintenance failed:', err);
            process.exit(1);
        } finally {
            await pool.end();
        }
    };

    main();
}

module.exports = {
    refreshUsersTable,
    listTables,
    checkTableStructure
}; 