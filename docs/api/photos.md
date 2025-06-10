# Photos API Documentation

## Photos Routes

These routes handle the internal photo metadata and management.

### List User's Photos
```http
GET /api/photos?limit=20&offset=0
```

Get a paginated list of the authenticated user's photos.

**Query Parameters:**
- `limit` (optional): Number of photos per page (default: 20)
- `offset` (optional): Number of photos to skip (default: 0)

**Response:**
```json
{
    "photos": [
        {
            "id": "string",
            "media_item_id": "string",
            "user_id": "string",
            "photo_of": "string | null",
            "alt_text": "string | null",
            "tags": "string[]",
            "base_url": "string",
            "mime_type": "string",
            "width": "number",
            "height": "number",
            "creation_time": "string",
            "created_at": "string",
            "updated_at": "string"
        }
    ],
    "total": "number",
    "has_more": "boolean"
}
```

### Get Photos of User
```http
GET /api/photos/of/:userId?limit=20&offset=0
```

Get photos where a specific user is the subject.

**Path Parameters:**
- `userId`: ID of the user to get photos of

**Query Parameters:**
- `limit` (optional): Number of photos per page (default: 20)
- `offset` (optional): Number of photos to skip (default: 0)

**Response:**
```json
{
    "photos": [
        {
            "id": "string",
            "media_item_id": "string",
            "user_id": "string",
            "photo_of": "string",
            "alt_text": "string | null",
            "tags": "string[]",
            "base_url": "string",
            "mime_type": "string",
            "width": "number",
            "height": "number",
            "creation_time": "string",
            "created_at": "string",
            "updated_at": "string"
        }
    ],
    "total": "number",
    "has_more": "boolean"
}
```

### Get Single Photo
```http
GET /api/photos/:mediaItemId
```

Get metadata for a specific photo.

**Path Parameters:**
- `mediaItemId`: Google Photos media item ID

**Response:**
```json
{
    "id": "string",
    "media_item_id": "string",
    "user_id": "string",
    "photo_of": "string | null",
    "alt_text": "string | null",
    "tags": "string[]",
    "base_url": "string",
    "mime_type": "string",
    "width": "number",
    "height": "number",
    "creation_time": "string",
    "created_at": "string",
    "updated_at": "string"
}
```

### Update Photo Tags
```http
PATCH /api/photos/:mediaItemId/tags
```

Update the tags for a specific photo.

**Path Parameters:**
- `mediaItemId`: Google Photos media item ID

**Request Body:**
```json
{
    "tags": ["string"]
}
```

**Response:**
```json
{
    "id": "string",
    "media_item_id": "string",
    "user_id": "string",
    "photo_of": "string | null",
    "alt_text": "string | null",
    "tags": ["string"],
    "base_url": "string",
    "mime_type": "string",
    "width": "number",
    "height": "number",
    "creation_time": "string",
    "created_at": "string",
    "updated_at": "string"
}
```

### Search Photos by Tags
```http
GET /api/photos/search?tags=tag1,tag2&limit=20&offset=0
```

Search photos by tags.

**Query Parameters:**
- `tags`: Comma-separated list of tags to search for
- `limit` (optional): Number of photos per page (default: 20)
- `offset` (optional): Number of photos to skip (default: 0)

**Response:**
```json
{
    "photos": [
        {
            "id": "string",
            "media_item_id": "string",
            "user_id": "string",
            "photo_of": "string | null",
            "alt_text": "string | null",
            "tags": ["string"],
            "base_url": "string",
            "mime_type": "string",
            "width": "number",
            "height": "number",
            "creation_time": "string",
            "created_at": "string",
            "updated_at": "string"
        }
    ],
    "total": "number",
    "has_more": "boolean"
}
```

### Update Photo Subject
```http
PATCH /api/photos/:mediaItemId/photo-of
```

Update who a photo is of.

**Path Parameters:**
- `mediaItemId`: Google Photos media item ID

**Request Body:**
```json
{
    "photoOf": "string | null"
}
```

**Response:**
```json
{
    "id": "string",
    "media_item_id": "string",
    "user_id": "string",
    "photo_of": "string | null",
    "alt_text": "string | null",
    "tags": ["string"],
    "base_url": "string",
    "mime_type": "string",
    "width": "number",
    "height": "number",
    "creation_time": "string",
    "created_at": "string",
    "updated_at": "string"
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

## Related Documentation

For Google Photos Library API integration, see [Google Photos API Documentation](./google-photos.md). 