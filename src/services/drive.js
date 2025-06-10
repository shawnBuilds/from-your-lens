const { google } = require('googleapis');
const { getDriveTokens, updateDriveTokens, areDriveTokensValid } = require('../../db/users');

class DriveService {
    constructor() {
        this.drive = null;
        this.auth = null;
    }

    /**
     * Initialize the Drive client with credentials
     * @param {Object} credentials - OAuth2 credentials
     */
    async initialize(credentials) {
        this.auth = new google.auth.OAuth2(
            process.env.GOOGLE_DRIVE_CLIENT_ID,
            process.env.GOOGLE_DRIVE_CLIENT_SECRET,
            process.env.GOOGLE_DRIVE_REDIRECT_URI
        );

        this.auth.setCredentials(credentials);
        this.drive = google.drive({ version: 'v3', auth: this.auth });
    }

    /**
     * Initialize Drive client for a user
     * @param {number} userId - The user's ID
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initializeForUser(userId) {
        try {
            const tokensValid = await areDriveTokensValid(userId);
            if (!tokensValid) {
                return false;
            }

            const tokens = await getDriveTokens(userId);
            if (!tokens) {
                return false;
            }

            await this.initialize({
                access_token: tokens.drive_access_token,
                refresh_token: tokens.drive_refresh_token,
                expiry_date: tokens.drive_token_expiry
            });

            return true;
        } catch (error) {
            console.error('[Drive Service] Error initializing for user:', error.message);
            return false;
        }
    }

    /**
     * Refresh access token if expired
     * @param {number} userId - The user's ID
     * @returns {Promise<boolean>} True if refresh was successful
     */
    async refreshTokenIfNeeded(userId) {
        try {
            const tokensValid = await areDriveTokensValid(userId);
            if (tokensValid) {
                return true;
            }

            const tokens = await getDriveTokens(userId);
            if (!tokens || !tokens.drive_refresh_token) {
                return false;
            }

            this.auth.setCredentials({
                refresh_token: tokens.drive_refresh_token
            });

            const { credentials } = await this.auth.refreshAccessToken();
            
            await updateDriveTokens(userId, {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || tokens.drive_refresh_token,
                expiry_date: new Date(credentials.expiry_date)
            });

            this.auth.setCredentials(credentials);
            this.drive = google.drive({ version: 'v3', auth: this.auth });

            return true;
        } catch (error) {
            console.error('[Drive Service] Error refreshing token:', error.message);
            return false;
        }
    }

    /**
     * List files from Google Drive
     * @param {Object} options - Query options
     * @param {string} options.query - Search query
     * @param {number} options.pageSize - Number of items per page
     * @param {string} options.pageToken - Page token for pagination
     * @returns {Promise<Object>} List of files
     */
    async listFiles({ query = "mimeType contains 'image/'", pageSize = 10, pageToken = null } = {}) {
        try {
            if (!this.drive) {
                throw new Error('Drive client not initialized');
            }

            const requestParams = {
                q: query,
                pageSize,
                pageToken,
                fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, size, createdTime, modifiedTime)',
                spaces: 'drive'
            };

            const response = await this.drive.files.list(requestParams);
            
            if (!response.data || !response.data.files) {
                throw new Error('Invalid response from Drive API');
            }

            return {
                files: response.data.files,
                nextPageToken: response.data.nextPageToken
            };
        } catch (error) {
            console.error('[Drive Service] Error listing files:', error.message);
            throw new Error(`Failed to list files from Drive: ${error.message}`);
        }
    }

    /**
     * Get a specific file by ID
     * @param {string} fileId - The ID of the file to retrieve
     * @returns {Promise<Object>} File metadata
     */
    async getFile(fileId) {
        try {
            const response = await this.drive.files.get({
                fileId,
                fields: 'id, name, mimeType, thumbnailLink, webViewLink, size, createdTime, modifiedTime'
            });

            return response.data;
        } catch (error) {
            console.error('[Drive Service] Error getting file:', error.message);
            throw new Error('Failed to get file from Drive');
        }
    }

    /**
     * Get file content as a stream
     * @param {string} fileId - The ID of the file to download
     * @returns {Promise<ReadableStream>} File content stream
     */
    async getFileContent(fileId) {
        try {
            const response = await this.drive.files.get({
                fileId,
                alt: 'media'
            }, {
                responseType: 'stream'
            });

            return response.data;
        } catch (error) {
            console.error('[Drive Service] Error getting file content:', error.message);
            throw new Error('Failed to get file content from Drive');
        }
    }

    /**
     * Search for files with specific criteria
     * @param {Object} options - Search options
     * @param {string} options.query - Search query
     * @param {string} options.mimeType - MIME type filter
     * @param {string} options.folderId - Search within specific folder
     * @returns {Promise<Array>} List of matching files
     */
    async searchFiles({ query = '', mimeType = null, folderId = null } = {}) {
        try {
            let searchQuery = query;
            
            if (mimeType) {
                searchQuery += ` and mimeType='${mimeType}'`;
            }
            
            if (folderId) {
                searchQuery += ` and '${folderId}' in parents`;
            }

            const response = await this.drive.files.list({
                q: searchQuery,
                fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, size, createdTime, modifiedTime)',
                spaces: 'drive'
            });

            return response.data.files;
        } catch (error) {
            console.error('[Drive Service] Error searching files:', error.message);
            throw new Error('Failed to search files in Drive');
        }
    }

    /**
     * Get folder contents
     * @param {string} folderId - The ID of the folder
     * @returns {Promise<Array>} List of files in the folder
     */
    async getFolderContents(folderId) {
        try {
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, size, createdTime, modifiedTime)',
                spaces: 'drive'
            });

            return response.data.files;
        } catch (error) {
            console.error('[Drive Service] Error getting folder contents:', error.message);
            throw new Error('Failed to get folder contents from Drive');
        }
    }

    /**
     * Check if the current credentials are valid
     * @returns {Promise<boolean>} True if credentials are valid
     */
    async validateCredentials() {
        try {
            await this.drive.about.get({
                fields: 'user'
            });
            return true;
        } catch (error) {
            console.error('[Drive Service] Invalid credentials:', error.message);
            return false;
        }
    }

    /**
     * List files from Google Drive with token refresh
     * @param {number} userId - The user's ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} List of files
     */
    async listFilesForUser(userId, options = {}) {
        try {
            const initialized = await this.initializeForUser(userId);
            if (!initialized) {
                throw new Error('Failed to initialize Drive client for user');
            }

            const tokensValid = await this.refreshTokenIfNeeded(userId);
            if (!tokensValid) {
                throw new Error('Invalid or expired tokens');
            }

            return await this.listFiles(options);
        } catch (error) {
            console.error('[Drive Service] Error listing files for user:', error.message);
            throw error;
        }
    }
}

module.exports = new DriveService(); 