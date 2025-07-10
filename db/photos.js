const pool = require('./pool');

// Utility function to format database timestamps to ISO8601 strings
const formatPhotoDates = (photo) => {
    if (!photo) return photo;
    
    return {
        ...photo,
        creation_time: photo.creation_time ? new Date(photo.creation_time).toISOString() : null,
        created_at: photo.created_at ? new Date(photo.created_at).toISOString() : null,
        updated_at: photo.updated_at ? new Date(photo.updated_at).toISOString() : null,
        shared_at: photo.shared_at ? new Date(photo.shared_at).toISOString() : null
    };
};

// Utility function to format arrays of photos
const formatPhotoArray = (photos) => {
    return photos.map(formatPhotoDates);
};

// Create photos table if it doesn't exist
const createPhotosTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            media_item_id VARCHAR(255) UNIQUE NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id),
            photo_of INTEGER REFERENCES users(id),  -- Allow NULL
            alt_text VARCHAR(255),
            tags TEXT[] DEFAULT '{}',
            base_url TEXT,
            mime_type VARCHAR(100),
            width INTEGER,
            height INTEGER,
            creation_time TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    try {
        await pool.query(query);
    } catch (err) {
        console.error('[Database] Error creating photos table:', err.message);
        throw err;
    }
};

// Insert or update photo metadata
const upsertPhoto = async (photoData) => {
    const query = `
        INSERT INTO photos (
            media_item_id,
            user_id,
            photo_of,
            alt_text,
            tags,
            base_url,
            mime_type,
            width,
            height,
            creation_time,
            s3_key,
            s3_url,
            shared_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (media_item_id) 
        DO UPDATE SET 
            photo_of = COALESCE(EXCLUDED.photo_of, photos.photo_of),
            alt_text = COALESCE(EXCLUDED.alt_text, photos.alt_text),
            tags = COALESCE(EXCLUDED.tags, photos.tags),
            base_url = COALESCE(EXCLUDED.base_url, photos.base_url),
            mime_type = COALESCE(EXCLUDED.mime_type, photos.mime_type),
            width = COALESCE(EXCLUDED.width, photos.width),
            height = COALESCE(EXCLUDED.height, photos.height),
            creation_time = COALESCE(EXCLUDED.creation_time, photos.creation_time),
            s3_key = COALESCE(EXCLUDED.s3_key, photos.s3_key),
            s3_url = COALESCE(EXCLUDED.s3_url, photos.s3_url),
            shared_at = COALESCE(EXCLUDED.shared_at, photos.shared_at),
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    
    const values = [
        photoData.mediaItemId,
        photoData.userId,
        photoData.photoOf || null,
        photoData.alt,
        photoData.tags || [],
        photoData.baseUrl,
        photoData.mimeType,
        photoData.width,
        photoData.height,
        photoData.creationTime,
        photoData.s3Key || null,
        photoData.s3Url || null,
        photoData.sharedAt || null
    ];

    try {
        const result = await pool.query(query, values);
        return formatPhotoDates(result.rows[0]);
    } catch (err) {
        console.error('[Database] Error upserting photo:', err.message);
        throw err;
    }
};

// Get photo by media item ID
const getPhotoByMediaItemId = async (mediaItemId) => {
    const query = `
        SELECT * FROM photos 
        WHERE media_item_id = $1;
    `;
    
    try {
        const result = await pool.query(query, [mediaItemId]);
        return formatPhotoDates(result.rows[0]);
    } catch (err) {
        console.error('[Database] Error getting photo by media item ID:', err.message);
        throw err;
    }
};

// Get all photos for a user
const getUserPhotos = async (userId, { limit = 20, offset = 0 } = {}) => {
    const query = `
        SELECT * FROM photos 
        WHERE user_id = $1
        ORDER BY creation_time DESC NULLS LAST
        LIMIT $2 OFFSET $3;
    `;
    
    try {
        const result = await pool.query(query, [userId, limit, offset]);
        return formatPhotoArray(result.rows);
    } catch (err) {
        console.error('[Database] Error getting user photos:', err.message);
        throw err;
    }
};

// Get photos where user is the subject
const getPhotosOfUser = async (userId, { limit = 20, offset = 0 } = {}) => {
    const query = `
        SELECT * FROM photos 
        WHERE photo_of = $1
        ORDER BY creation_time DESC NULLS LAST
        LIMIT $2 OFFSET $3;
    `;
    
    try {
        const result = await pool.query(query, [userId, limit, offset]);
        return formatPhotoArray(result.rows);
    } catch (err) {
        console.error('[Database] Error getting photos of user:', err.message);
        throw err;
    }
};

// Update photo tags
const updatePhotoTags = async (mediaItemId, tags) => {
    const query = `
        UPDATE photos 
        SET 
            tags = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE media_item_id = $2
        RETURNING *;
    `;
    
    try {
        const result = await pool.query(query, [tags, mediaItemId]);
        return formatPhotoDates(result.rows[0]);
    } catch (err) {
        console.error('[Database] Error updating photo tags:', err.message);
        throw err;
    }
};

// Update photo subject
const updatePhotoOf = async (mediaItemId, photoOf) => {
    const query = `
        UPDATE photos 
        SET 
            photo_of = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE media_item_id = $2
        RETURNING *;
    `;
    
    try {
        const result = await pool.query(query, [photoOf, mediaItemId]);
        return formatPhotoDates(result.rows[0]);
    } catch (err) {
        console.error('[Database] Error updating photo subject:', err.message);
        throw err;
    }
};

// Update photo S3 information
const updatePhotoS3Info = async (mediaItemId, s3Key, s3Url) => {
    const query = `
        UPDATE photos 
        SET 
            s3_key = $1,
            s3_url = $2,
            shared_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE media_item_id = $3
        RETURNING *;
    `;
    
    try {
        const result = await pool.query(query, [s3Key, s3Url, mediaItemId]);
        return formatPhotoDates(result.rows[0]);
    } catch (err) {
        console.error('[Database] Error updating photo S3 info:', err.message);
        throw err;
    }
};

// Search photos by tags
const searchPhotosByTags = async (userId, tags, { limit = 20, offset = 0 } = {}) => {
    const query = `
        SELECT * FROM photos 
        WHERE user_id = $1 
        AND tags @> $2::text[]
        ORDER BY creation_time DESC NULLS LAST
        LIMIT $3 OFFSET $4;
    `;
    
    try {
        const result = await pool.query(query, [userId, tags, limit, offset]);
        return formatPhotoArray(result.rows);
    } catch (err) {
        console.error('[Database] Error searching photos by tags:', err.message);
        throw err;
    }
};

// Delete photo metadata
const deletePhoto = async (mediaItemId) => {
    const query = `
        DELETE FROM photos 
        WHERE media_item_id = $1
        RETURNING *;
    `;
    
    try {
        const result = await pool.query(query, [mediaItemId]);
        return formatPhotoDates(result.rows[0]);
    } catch (err) {
        console.error('[Database] Error deleting photo:', err.message);
        throw err;
    }
};

// Get total count of photos for a user
const getUserPhotosCount = async (userId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM photos 
        WHERE user_id = $1;
    `;
    
    try {
        const result = await pool.query(query, [userId]);
        return parseInt(result.rows[0].total);
    } catch (err) {
        console.error('[Database] Error getting user photos count:', err.message);
        throw err;
    }
};

// Get total count of photos where user is the subject
const getPhotosOfUserCount = async (userId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM photos 
        WHERE photo_of = $1;
    `;
    
    try {
        const result = await pool.query(query, [userId]);
        return parseInt(result.rows[0].total);
    } catch (err) {
        console.error('[Database] Error getting photos of user count:', err.message);
        throw err;
    }
};

module.exports = {
    createPhotosTable,
    upsertPhoto,
    getPhotoByMediaItemId,
    getUserPhotos,
    getPhotosOfUser,
    updatePhotoTags,
    updatePhotoOf,
    updatePhotoS3Info,
    searchPhotosByTags,
    deletePhoto,
    getUserPhotosCount,
    getPhotosOfUserCount
}; 