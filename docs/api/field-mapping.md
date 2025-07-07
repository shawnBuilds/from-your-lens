# Database to API Field Mapping

## Overview

This document explains the field mapping pattern used to transform database rows (snake_case) to API responses (camelCase) for consistent frontend integration.

## The Problem

Database fields use `snake_case` naming convention:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255),
    full_name VARCHAR(255),
    profile_picture_url TEXT,
    created_at TIMESTAMP
);
```

But frontend models expect `camelCase`:
```swift
struct User: Codable {
    let id: Int
    let googleId: String
    let fullName: String?
    let profilePictureUrl: String?
    let createdAt: Date?
}
```

## The Solution

Use the helper functions in `src/lib/databaseHelpers.js` to transform database rows to API responses.

## Available Helpers

### User Transformers
```javascript
const { transformUserToAPI, transformUsersToAPI } = require('../lib/databaseHelpers');

// Transform single user
const apiUser = transformUserToAPI(dbUser);

// Transform array of users
const apiUsers = transformUsersToAPI(dbUsers);
```

### Photo Transformers
```javascript
const { transformPhotoToAPI, transformPhotosToAPI } = require('../lib/databaseHelpers');

// Transform single photo
const apiPhoto = transformPhotoToAPI(dbPhoto);

// Transform array of photos
const apiPhotos = transformPhotosToAPI(dbPhotos);
```

### Generic Transformers
```javascript
const { transformWithMapping, transformArrayWithMapping } = require('../lib/databaseHelpers');

// Custom field mapping
const fieldMapping = {
    apiFieldName: 'database_field_name',
    anotherField: 'another_db_field'
};

// Transform with custom mapping
const transformed = transformWithMapping(dbRow, fieldMapping);
const transformedArray = transformArrayWithMapping(dbRows, fieldMapping);
```

## Usage in Routes

### Before (Inconsistent)
```javascript
// ❌ Direct database response - causes frontend issues
res.json({
    users: dbUsers, // snake_case fields
    total: dbUsers.length
});
```

### After (Consistent)
```javascript
// ✅ Transformed response - works with frontend
const transformedUsers = transformUsersToAPI(dbUsers);
res.json({
    users: transformedUsers, // camelCase fields
    total: transformedUsers.length
});
```

## Field Mappings

### User Fields
| Database Field | API Field |
|----------------|-----------|
| `id` | `id` |
| `google_id` | `google_id` |
| `email` | `email` |
| `full_name` | `fullName` |
| `profile_picture_url` | `profilePictureUrl` |
| `created_at` | `createdAt` |
| `last_login` | `lastLogin` |

### Photo Fields
| Database Field | API Field |
|----------------|-----------|
| `id` | `id` |
| `media_item_id` | `mediaItemId` |
| `user_id` | `userId` |
| `photo_of` | `photoOf` |
| `alt_text` | `altText` |
| `base_url` | `baseUrl` |
| `mime_type` | `mimeType` |
| `creation_time` | `creationTime` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

## Best Practices

1. **Always use helpers** for database-to-API transformations
2. **Add new entities** to the helpers file when creating new endpoints
3. **Use generic transformers** for custom field mappings
4. **Test field mapping** by checking frontend logs for `nil` values
5. **Document new mappings** in this file

## Debugging

If you see `nil` values in frontend logs, check:
1. Database has the data (check backend logs)
2. Field mapping is correct (check this document)
3. Helper function is being used (check route code)
4. Frontend model expects the right field names (check Swift code) 