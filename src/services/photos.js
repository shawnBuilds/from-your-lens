const { google } = require('googleapis');
const { getPhotosTokens, updatePhotosTokens, arePhotosTokensValid } = require('../../db/users');
const Controls = require('../controls');

class PhotosService {
    constructor() {
        this.photos = null;
        this.auth = null;
    }

    /**
     * Initialize the Photos client with credentials
     * @param {Object} credentials - OAuth2 credentials
     */ 
    async initialize(credentials) {
        try {
            this.auth = new google.auth.OAuth2(
                process.env.GOOGLE_PHOTOS_CLIENT_ID,
                process.env.GOOGLE_PHOTOS_CLIENT_SECRET,
                process.env.GOOGLE_PHOTOS_REDIRECT_URI
            );

            this.auth.setCredentials(credentials);
            
            // Initialize the Photos Library API
            this.photos = google.photoslibrary({ version: 'v1', auth: this.auth });
            
            // Test the connection
            await this.photos.albums.list({ pageSize: 1 });
            
            if (Controls.enableDebugLogPhotos) {
                console.log('[Photos Service] Successfully initialized Photos client');
            }
            return true;
        } catch (error) {
            console.error('[Photos Service] Error initializing Photos client:', error.message);
            throw error;
        }
    }

    /**
     * Initialize Photos client for a user
     * @param {number} userId - The user's ID
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initializeForUser(userId) {
        try {
            const tokensValid = await arePhotosTokensValid(userId);
            if (!tokensValid) {
                return false;
            }

            const tokens = await getPhotosTokens(userId);
            if (!tokens) {
                return false;
            }

            await this.initialize({
                access_token: tokens.photos_access_token,
                refresh_token: tokens.photos_refresh_token,
                expiry_date: tokens.photos_token_expiry
            });

            return true;
        } catch (error) {
            console.error('[Photos Service] Error initializing for user:', error.message);
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
            const tokensValid = await arePhotosTokensValid(userId);
            if (tokensValid) {
                return true;
            }

            const tokens = await getPhotosTokens(userId);
            if (!tokens || !tokens.photos_refresh_token) {
                return false;
            }

            this.auth.setCredentials({
                refresh_token: tokens.photos_refresh_token
            });

            const { credentials } = await this.auth.refreshAccessToken();
            
            await updatePhotosTokens(userId, {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || tokens.photos_refresh_token,
                expiry_date: new Date(credentials.expiry_date)
            });

            this.auth.setCredentials(credentials);
            this.photos = google.photoslibrary({ version: 'v1', auth: this.auth });

            return true;
        } catch (error) {
            console.error('[Photos Service] Error refreshing token:', error.message);
            return false;
        }
    }

    /**
     * List media items from Google Photos
     * @param {Object} options - Query options
     * @param {number} options.pageSize - Number of items per page
     * @param {string} options.pageToken - Page token for pagination
     * @returns {Promise<Object>} List of media items
     */
    async listMediaItems({ pageSize = 10, pageToken = null } = {}) {
        try {
            if (!this.photos) {
                throw new Error('Photos client not initialized');
            }

            const requestParams = {
                pageSize,
                pageToken,
                fields: 'nextPageToken, mediaItems(id, filename, mediaMetadata, baseUrl)'
            };

            const response = await this.photos.mediaItems.list(requestParams);
            
            if (!response.data || !response.data.mediaItems) {
                throw new Error('Invalid response from Photos API');
            }

            return {
                mediaItems: response.data.mediaItems,
                nextPageToken: response.data.nextPageToken
            };
        } catch (error) {
            console.error('[Photos Service] Error listing media items:', error.message);
            throw new Error(`Failed to list media items from Photos: ${error.message}`);
        }
    }

    /**
     * Search for media items with specific criteria
     * @param {Object} options - Search options
     * @param {string} options.query - Search query
     * @param {string} options.filters - Additional filters
     * @returns {Promise<Array>} List of matching media items
     */
    async searchMediaItems({ query = '', filters = {} } = {}) {
        try {
            const requestBody = {
                pageSize: 100,
                filters: {
                    ...filters,
                    mediaTypeFilter: {
                        mediaTypes: ['PHOTO']
                    }
                }
            };

            if (query) {
                requestBody.filters.contentFilter = {
                    includedContentCategories: ['NONE'],
                    includedContentTypes: ['PHOTO'],
                    textFilter: query
                };
            }

            const response = await this.photos.mediaItems.search({
                resource: requestBody
            });

            return response.data.mediaItems || [];
        } catch (error) {
            console.error('[Photos Service] Error searching media items:', error.message);
            throw new Error('Failed to search media items in Photos');
        }
    }

    /**
     * Get a specific media item by ID
     * @param {string} mediaItemId - The ID of the media item to retrieve
     * @returns {Promise<Object>} Media item metadata
     */
    async getMediaItem(mediaItemId) {
        try {
            const response = await this.photos.mediaItems.get({
                mediaItemId,
                fields: 'id, filename, mediaMetadata, baseUrl'
            });

            return response.data;
        } catch (error) {
            console.error('[Photos Service] Error getting media item:', error.message);
            throw new Error('Failed to get media item from Photos');
        }
    }

    /**
     * List media items for a user with token refresh
     * @param {number} userId - The user's ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} List of media items
     */
    async listMediaItemsForUser(userId, options = {}) {
        try {
            const initialized = await this.initializeForUser(userId);
            if (!initialized) {
                throw new Error('Failed to initialize Photos client for user');
            }

            const tokensValid = await this.refreshTokenIfNeeded(userId);
            if (!tokensValid) {
                throw new Error('Invalid or expired tokens');
            }

            return await this.listMediaItems(options);
        } catch (error) {
            console.error('[Photos Service] Error listing media items for user:', error.message);
            throw error;
        }
    }
}

module.exports = new PhotosService(); 