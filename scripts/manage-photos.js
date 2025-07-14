const pool = require('../db/pool');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility function to prompt user for input
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

// Utility function to display a separator line
const displaySeparator = () => {
    console.log('─'.repeat(80));
};

// Utility function to display a header
const displayHeader = (title) => {
    console.log('\n' + '='.repeat(80));
    console.log(`  ${title}`);
    console.log('='.repeat(80));
};

// Main menu options
const MAIN_MENU_OPTIONS = [
    { id: 1, label: 'Browse Users', action: browseUsers },
    { id: 2, label: 'View Photos of Specific User', action: viewPhotosOfUser },
    { id: 3, label: 'Delete Photo by ID', action: deletePhotoById },
    { id: 4, label: 'Exit', action: exit }
];

// User management menu options
const USER_MENU_OPTIONS = [
    { id: 1, label: 'View User\'s Photos', action: viewUserPhotos },
    { id: 2, label: 'View Photos of This User', action: viewPhotosOfThisUser },
    { id: 3, label: 'Delete User\'s Photo', action: deleteUserPhoto },
    { id: 4, label: 'Back to Main Menu', action: showMainMenu }
];

// Photo management menu options
const PHOTO_MENU_OPTIONS = [
    { id: 1, label: 'Delete This Photo', action: deleteCurrentPhoto },
    { id: 2, label: 'View Next Photo', action: viewNextPhoto },
    { id: 3, label: 'View Previous Photo', action: viewPreviousPhoto },
    { id: 4, label: 'Back to User Menu', action: showUserMenu }
];

// Global state
let currentUser = null;
let currentPhotos = [];
let currentPhotoIndex = 0;

// Main menu
async function showMainMenu() {
    displayHeader('Photo Management Tool');
    console.log('Select an option:\n');
    
    MAIN_MENU_OPTIONS.forEach(option => {
        console.log(`  ${option.id}. ${option.label}`);
    });
    
    const choice = await askQuestion('\nEnter your choice (1-4): ');
    const option = MAIN_MENU_OPTIONS.find(opt => opt.id === parseInt(choice));
    
    if (option) {
        await option.action();
    } else {
        console.log('❌ Invalid choice. Please try again.');
        await showMainMenu();
    }
}

// Browse all users
async function browseUsers() {
    displayHeader('Browse Users');
    
    try {
        const result = await pool.query(`
            SELECT id, email, full_name, created_at, 
                   (SELECT COUNT(*) FROM photos WHERE user_id = users.id) as photo_count,
                   (SELECT COUNT(*) FROM photos WHERE photo_of = users.id) as photos_of_count
            FROM users 
            ORDER BY full_name ASC NULLS LAST, email ASC
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ No users found in the database.');
            await showMainMenu();
            return;
        }
        
        console.log(`Found ${result.rows.length} users:\n`);
        
        result.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email})`);
            console.log(`   ID: ${user.id} | Photos uploaded: ${user.photo_count} | Photos of user: ${user.photos_of_count}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
            console.log('');
        });
        
        const choice = await askQuestion('Enter user number to manage (or press Enter to go back): ');
        
        if (choice === '') {
            await showMainMenu();
            return;
        }
        
        const userIndex = parseInt(choice) - 1;
        if (userIndex >= 0 && userIndex < result.rows.length) {
            currentUser = result.rows[userIndex];
            await showUserMenu();
        } else {
            console.log('❌ Invalid user number.');
            await browseUsers();
        }
        
    } catch (error) {
        console.error('❌ Error browsing users:', error.message);
        await showMainMenu();
    }
}

// View photos of a specific user by ID
async function viewPhotosOfUser() {
    displayHeader('View Photos of Specific User');
    
    const userId = await askQuestion('Enter user ID: ');
    
    if (!userId || isNaN(userId)) {
        console.log('❌ Invalid user ID.');
        await showMainMenu();
        return;
    }
    
    try {
        // First, verify the user exists
        const userCheck = await pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            console.log(`❌ User ID ${userId} not found in the database.`);
            await showMainMenu();
            return;
        }
        
        currentUser = userCheck.rows[0];
        await viewPhotosOfThisUser();
        
    } catch (error) {
        console.error('❌ Error viewing photos of user:', error.message);
        await showMainMenu();
    }
}

// Delete photo by ID
async function deletePhotoById() {
    displayHeader('Delete Photo by ID');
    
    const photoId = await askQuestion('Enter photo ID to delete: ');
    
    if (!photoId || isNaN(photoId)) {
        console.log('❌ Invalid photo ID.');
        await showMainMenu();
        return;
    }
    
    try {
        // Get photo details first
        const photoResult = await pool.query(`
            SELECT p.*, u.email as uploaded_by_email, po.email as photo_of_email
            FROM photos p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN users po ON p.photo_of = po.id
            WHERE p.id = $1
        `, [photoId]);
        
        if (photoResult.rows.length === 0) {
            console.log(`❌ Photo ID ${photoId} not found in the database.`);
            await showMainMenu();
            return;
        }
        
        const photo = photoResult.rows[0];
        
        console.log('\n📸 Photo Details:');
        console.log(`  ID: ${photo.id}`);
        console.log(`  Media Item ID: ${photo.media_item_id}`);
        console.log(`  Uploaded by: ${photo.uploaded_by_email} (User ID: ${photo.user_id})`);
        console.log(`  Photo of: ${photo.photo_of_email || 'Not set'} (User ID: ${photo.photo_of || 'Not set'})`);
        console.log(`  Base URL: ${photo.base_url || 'Not set'}`);
        console.log(`  Created: ${new Date(photo.created_at).toLocaleString()}`);
        
        const confirm = await askQuestion('\n⚠️  Are you sure you want to delete this photo? (yes/no): ');
        
        if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await pool.query('DELETE FROM photos WHERE id = $1', [photoId]);
            console.log('✅ Photo deleted successfully.');
        } else {
            console.log('❌ Deletion cancelled.');
        }
        
        await showMainMenu();
        
    } catch (error) {
        console.error('❌ Error deleting photo:', error.message);
        await showMainMenu();
    }
}

// User menu
async function showUserMenu() {
    if (!currentUser) {
        console.log('❌ No user selected.');
        await showMainMenu();
        return;
    }
    
    displayHeader(`Manage User: ${currentUser.full_name || 'No name'} (${currentUser.email})`);
    console.log('Select an option:\n');
    
    USER_MENU_OPTIONS.forEach(option => {
        console.log(`  ${option.id}. ${option.label}`);
    });
    
    const choice = await askQuestion('\nEnter your choice (1-4): ');
    const option = USER_MENU_OPTIONS.find(opt => opt.id === parseInt(choice));
    
    if (option) {
        await option.action();
    } else {
        console.log('❌ Invalid choice. Please try again.');
        await showUserMenu();
    }
}

// View user's uploaded photos
async function viewUserPhotos() {
    displayHeader(`Photos Uploaded by ${currentUser.full_name || currentUser.email}`);
    
    try {
        const result = await pool.query(`
            SELECT p.*, po.email as photo_of_email
            FROM photos p
            LEFT JOIN users po ON p.photo_of = po.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `, [currentUser.id]);
        
        if (result.rows.length === 0) {
            console.log('❌ No photos found for this user.');
            await showUserMenu();
            return;
        }
        
        currentPhotos = result.rows;
        currentPhotoIndex = 0;
        await displayCurrentPhoto();
        
    } catch (error) {
        console.error('❌ Error viewing user photos:', error.message);
        await showUserMenu();
    }
}

// View photos where user is the subject
async function viewPhotosOfThisUser() {
    displayHeader(`Photos of ${currentUser.full_name || currentUser.email}`);
    
    try {
        const result = await pool.query(`
            SELECT p.*, u.email as uploaded_by_email
            FROM photos p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.photo_of = $1
            ORDER BY p.created_at DESC
        `, [currentUser.id]);
        
        if (result.rows.length === 0) {
            console.log('❌ No photos found of this user.');
            await showUserMenu();
            return;
        }
        
        currentPhotos = result.rows;
        currentPhotoIndex = 0;
        await displayCurrentPhoto();
        
    } catch (error) {
        console.error('❌ Error viewing photos of user:', error.message);
        await showUserMenu();
    }
}

// Display current photo with navigation options
async function displayCurrentPhoto() {
    if (currentPhotos.length === 0) {
        console.log('❌ No photos to display.');
        await showUserMenu();
        return;
    }
    
    const photo = currentPhotos[currentPhotoIndex];
    
    displayHeader(`Photo ${currentPhotoIndex + 1} of ${currentPhotos.length}`);
    
    console.log('📸 Photo Details:');
    console.log(`  ID: ${photo.id}`);
    console.log(`  Media Item ID: ${photo.media_item_id}`);
    console.log(`  Uploaded by: ${photo.uploaded_by_email || 'Unknown'} (User ID: ${photo.user_id})`);
    console.log(`  Photo of: ${photo.photo_of_email || 'Not set'} (User ID: ${photo.photo_of || 'Not set'})`);
    console.log(`  Alt Text: ${photo.alt_text || 'Not set'}`);
    console.log(`  Tags: ${photo.tags?.length ? photo.tags.join(', ') : 'None'}`);
    console.log(`  Base URL: ${photo.base_url || 'Not set'}`);
    console.log(`  MIME Type: ${photo.mime_type || 'Not set'}`);
    console.log(`  Dimensions: ${photo.width ? `${photo.width}x${photo.height}` : 'Not set'}`);
    console.log(`  Creation Time: ${photo.creation_time || 'Not set'}`);
    console.log(`  Created At: ${new Date(photo.created_at).toLocaleString()}`);
    console.log(`  S3 Key: ${photo.s3_key || 'Not set'}`);
    console.log(`  S3 URL: ${photo.s3_url || 'Not set'}`);
    console.log(`  Shared At: ${photo.shared_at || 'Not set'}`);
    
    console.log('\nNavigation Options:');
    PHOTO_MENU_OPTIONS.forEach(option => {
        console.log(`  ${option.id}. ${option.label}`);
    });
    
    const choice = await askQuestion('\nEnter your choice (1-4): ');
    const option = PHOTO_MENU_OPTIONS.find(opt => opt.id === parseInt(choice));
    
    if (option) {
        await option.action();
    } else {
        console.log('❌ Invalid choice. Please try again.');
        await displayCurrentPhoto();
    }
}

// Delete current photo
async function deleteCurrentPhoto() {
    const photo = currentPhotos[currentPhotoIndex];
    
    console.log(`\n⚠️  About to delete photo ID: ${photo.id}`);
    console.log(`   Media Item ID: ${photo.media_item_id}`);
    console.log(`   Base URL: ${photo.base_url || 'Not set'}`);
    
    const confirm = await askQuestion('\nAre you sure you want to delete this photo? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
        try {
            await pool.query('DELETE FROM photos WHERE id = $1', [photo.id]);
            console.log('✅ Photo deleted successfully.');
            
            // Remove from current photos array
            currentPhotos.splice(currentPhotoIndex, 1);
            
            if (currentPhotos.length === 0) {
                console.log('No more photos to display.');
                await showUserMenu();
            } else {
                // Adjust index if we deleted the last photo
                if (currentPhotoIndex >= currentPhotos.length) {
                    currentPhotoIndex = currentPhotos.length - 1;
                }
                await displayCurrentPhoto();
            }
        } catch (error) {
            console.error('❌ Error deleting photo:', error.message);
            await displayCurrentPhoto();
        }
    } else {
        console.log('❌ Deletion cancelled.');
        await displayCurrentPhoto();
    }
}

// View next photo
async function viewNextPhoto() {
    if (currentPhotoIndex < currentPhotos.length - 1) {
        currentPhotoIndex++;
        await displayCurrentPhoto();
    } else {
        console.log('❌ Already at the last photo.');
        await displayCurrentPhoto();
    }
}

// View previous photo
async function viewPreviousPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        await displayCurrentPhoto();
    } else {
        console.log('❌ Already at the first photo.');
        await displayCurrentPhoto();
    }
}

// Delete user photo (from user menu)
async function deleteUserPhoto() {
    displayHeader(`Delete Photo for ${currentUser.full_name || currentUser.email}`);
    
    const photoId = await askQuestion('Enter photo ID to delete: ');
    
    if (!photoId || isNaN(photoId)) {
        console.log('❌ Invalid photo ID.');
        await showUserMenu();
        return;
    }
    
    try {
        // Verify the photo belongs to this user or is of this user
        const photoResult = await pool.query(`
            SELECT * FROM photos 
            WHERE id = $1 AND (user_id = $2 OR photo_of = $2)
        `, [photoId, currentUser.id]);
        
        if (photoResult.rows.length === 0) {
            console.log(`❌ Photo ID ${photoId} not found or doesn't belong to this user.`);
            await showUserMenu();
            return;
        }
        
        const photo = photoResult.rows[0];
        
        console.log('\n📸 Photo Details:');
        console.log(`  ID: ${photo.id}`);
        console.log(`  Media Item ID: ${photo.media_item_id}`);
        console.log(`  Base URL: ${photo.base_url || 'Not set'}`);
        console.log(`  Created: ${new Date(photo.created_at).toLocaleString()}`);
        
        const confirm = await askQuestion('\n⚠️  Are you sure you want to delete this photo? (yes/no): ');
        
        if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            await pool.query('DELETE FROM photos WHERE id = $1', [photoId]);
            console.log('✅ Photo deleted successfully.');
        } else {
            console.log('❌ Deletion cancelled.');
        }
        
        await showUserMenu();
        
    } catch (error) {
        console.error('❌ Error deleting photo:', error.message);
        await showUserMenu();
    }
}

// Exit function
async function exit() {
    console.log('\n👋 Goodbye!');
    rl.close();
    await pool.end();
    process.exit(0);
}

// Error handler
process.on('SIGINT', async () => {
    console.log('\n\n👋 Goodbye!');
    rl.close();
    await pool.end();
    process.exit(0);
});

// Main execution
async function main() {
    try {
        console.log('🚀 Starting Photo Management Tool...');
        await showMainMenu();
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        rl.close();
        await pool.end();
        process.exit(1);
    }
}

// Run the script
main(); 