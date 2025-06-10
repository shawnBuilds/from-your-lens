# Google Photos API Documentation

These routes handle direct interactions with the Google Photos Library API.

### List Photos
```http
GET /api/google-photos
```

Retrieves photos from Google Photos Library with pagination.

#### Query Parameters
- `pageSize` (optional): Number of photos to return (default: 20)
- `pageToken` (optional): Token for pagination

#### Response
```json
{
    "photos": [
        {
            "id": 1,
            "media_item_id": "string",
            "user_id": 123,
            "photo_of": 456,
            "alt_text": "string",
            "tags": ["tag1", "tag2"],
            "base_url": "https://...",
            "mime_type": "image/jpeg",
            "width": 1920,
            "height": 1080,
            "creation_time": "2024-03-20T12:00:00Z",
            "created_at": "2024-03-20T12:00:00Z",
            "updated_at": "2024-03-20T12:00:00Z"
        }
    ],
    "nextPageToken": "string"
}
```

### Get Photo Metadata
```http
GET /api/google-photos/:mediaItemId
```

Retrieves metadata for a specific photo from Google Photos Library.

#### URL Parameters
- `mediaItemId`: ID of the media item in Google Photos

#### Response
```json
{
    "id": 1,
    "media_item_id": "string",
    "user_id": 123,
    "photo_of": 456,
    "alt_text": "string",
    "tags": ["tag1", "tag2"],
    "base_url": "https://...",
    "mime_type": "image/jpeg",
    "width": 1920,
    "height": 1080,
    "creation_time": "2024-03-20T12:00:00Z",
    "created_at": "2024-03-20T12:00:00Z",
    "updated_at": "2024-03-20T12:00:00Z"
}
```

### Get Photo Content
```http
GET /api/google-photos/:mediaItemId/content
```

Redirects to the photo content URL from Google Photos Library.

#### URL Parameters
- `mediaItemId`: ID of the media item in Google Photos

#### Response
Redirects to the photo content URL.

### Search Photos
```http
GET /api/google-photos/search
```

Searches photos in Google Photos Library.

#### Query Parameters
- `query` (optional): Search query text
- `filters` (optional): JSON string of additional filters

#### Response
```json
{
    "photos": [
        {
            "id": 1,
            "media_item_id": "string",
            "user_id": 123,
            "photo_of": 456,
            "alt_text": "string",
            "tags": ["tag1", "tag2"],
            "base_url": "https://...",
            "mime_type": "image/jpeg",
            "width": 1920,
            "height": 1080,
            "creation_time": "2024-03-20T12:00:00Z",
            "created_at": "2024-03-20T12:00:00Z",
            "updated_at": "2024-03-20T12:00:00Z"
        }
    ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
    "error": "Invalid or missing token",
    "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
    "error": "Unauthorized access to photo",
    "code": "UNAUTHORIZED_ACCESS"
}
```

### 404 Not Found
```json
{
    "error": "Photo not found",
    "code": "PHOTO_NOT_FOUND"
}
```

### 429 Too Many Requests
```json
{
    "error": "Too many requests, please try again later."
}
```

### 500 Internal Server Error
```json
{
    "error": "Failed to [operation]",
    "code": "[OPERATION]_ERROR"
}
``` 