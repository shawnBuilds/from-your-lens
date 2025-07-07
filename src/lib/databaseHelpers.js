/**
 * Database to API Field Mapping Helpers
 * 
 * This module provides utility functions to transform database rows
 * (snake_case) to API responses (camelCase) with consistent field naming.
 * 
 * USAGE EXAMPLES:
 * 
 * // Transform a single user
 * const apiUser = transformUserToAPI(dbUser);
 * 
 * // Transform an array of users
 * const apiUsers = transformUsersToAPI(dbUsers);
 * 
 * // Custom field mapping for new entities
 * const customMapping = {
 *   apiFieldName: 'database_field_name',
 *   anotherField: 'another_db_field'
 * };
 * const transformed = transformWithMapping(dbRow, customMapping);
 * const transformedArray = transformArrayWithMapping(dbRows, customMapping);
 */

/**
 * Transform a single user database row to API response format
 * @param {Object} dbUser - Database user row with snake_case fields
 * @returns {Object} API user object with camelCase fields
 */
const transformUserToAPI = (dbUser) => {
    if (!dbUser) return null;
    
    return {
        id: dbUser.id,
        google_id: dbUser.google_id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        profilePictureUrl: dbUser.profile_picture_url,
        createdAt: dbUser.created_at,
        lastLogin: dbUser.last_login
    };
};

/**
 * Transform an array of user database rows to API response format
 * @param {Array} dbUsers - Array of database user rows
 * @returns {Array} Array of API user objects with camelCase fields
 */
const transformUsersToAPI = (dbUsers) => {
    if (!Array.isArray(dbUsers)) return [];
    return dbUsers.map(transformUserToAPI).filter(Boolean);
};

/**
 * Transform a single photo database row to API response format
 * @param {Object} dbPhoto - Database photo row with snake_case fields
 * @returns {Object} API photo object with camelCase fields
 */
const transformPhotoToAPI = (dbPhoto) => {
    if (!dbPhoto) return null;
    
    return {
        id: dbPhoto.id,
        mediaItemId: dbPhoto.media_item_id,
        userId: dbPhoto.user_id,
        photoOf: dbPhoto.photo_of,
        altText: dbPhoto.alt_text,
        tags: dbPhoto.tags,
        baseUrl: dbPhoto.base_url,
        mimeType: dbPhoto.mime_type,
        width: dbPhoto.width,
        height: dbPhoto.height,
        creationTime: dbPhoto.creation_time,
        createdAt: dbPhoto.created_at,
        updatedAt: dbPhoto.updated_at
    };
};

/**
 * Transform an array of photo database rows to API response format
 * @param {Array} dbPhotos - Array of database photo rows
 * @returns {Array} Array of API photo objects with camelCase fields
 */
const transformPhotosToAPI = (dbPhotos) => {
    if (!Array.isArray(dbPhotos)) return [];
    return dbPhotos.map(transformPhotoToAPI).filter(Boolean);
};

/**
 * Generic database row transformer with custom field mapping
 * @param {Object} dbRow - Database row object
 * @param {Object} fieldMapping - Object mapping database fields to API fields
 * @returns {Object} Transformed object with mapped fields
 */
const transformWithMapping = (dbRow, fieldMapping) => {
    if (!dbRow) return null;
    
    const transformed = {};
    for (const [apiField, dbField] of Object.entries(fieldMapping)) {
        transformed[apiField] = dbRow[dbField];
    }
    return transformed;
};

/**
 * Generic array transformer with custom field mapping
 * @param {Array} dbRows - Array of database rows
 * @param {Object} fieldMapping - Object mapping database fields to API fields
 * @returns {Array} Array of transformed objects
 */
const transformArrayWithMapping = (dbRows, fieldMapping) => {
    if (!Array.isArray(dbRows)) return [];
    return dbRows.map(row => transformWithMapping(row, fieldMapping)).filter(Boolean);
};

module.exports = {
    transformUserToAPI,
    transformUsersToAPI,
    transformPhotoToAPI,
    transformPhotosToAPI,
    transformWithMapping,
    transformArrayWithMapping
}; 