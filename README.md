# FromYourLens

A photo sharing and face matching application with iOS client and Node.js backend.

## Features

- Photo upload and sharing
- Face recognition and matching
- Google OAuth integration
- iOS native client
- PostgreSQL database
- AWS S3 storage
- Heroku deployment ready

## Quick Setup

### Backend (Node.js)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   Create `.env` file with:
   ```env
   NODE_ENV=development
   PORT=5000
   SESSION_SECRET=your-session-secret
   JWT_SECRET=your-jwt-secret
   
   # Database
   DATABASE_URL=your-postgres-connection-string
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # AWS (for face recognition & S3)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=your-aws-region
   S3_BUCKET=your-s3-bucket-name
   ```

3. **Database setup**
   ```bash
   # Ensure PostgreSQL is running
   node utils/check_db.js
   ```

4. **Start server**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

### iOS Client

The iOS client source files are located in `src/ios-client/` and include:
- **Models**: Swift data models for API responses, photos, and users
- **Services**: Authentication, photo management, face recognition, and cloud storage services
- **ViewModels**: App state management
- **Views**: SwiftUI views for the user interface

**To use with Xcode project:**
1. Open `FromYourLens-xcode/FromYourLens.xcodeproj` in Xcode
2. Copy/update files from `src/ios-client/` to your Xcode project as needed
3. Configure Google OAuth in `GoogleService-Info.plist`
4. Build and run on device/simulator

**To develop/modify:**
- Edit Swift files in `src/ios-client/`
- Copy updated files to your Xcode project
- Or set up a build process to sync between directories


## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/google/token` - Get JWT token after OAuth

### User Photos
- `POST /api/photos/upload-shared` - Upload photos to S3 for sharing
- `GET /api/photos` - Get user's photos
- `POST /api/photos` - Create new photo record

### Face Recognition
- `POST /api/face/detect` - Detect faces in image
- `POST /api/face/compare` - Compare two images for face matching
- `POST /api/face/batch-compare` - Batch compare multiple images
- `POST /api/face/index` - Index faces for search
- `POST /api/face/search` - Search faces by image

### Users
- `GET /api/users` - Get all users (for search)
- `POST /api/users/profile-picture` - Upload profile picture

### Google Drive (deprecated)
- `GET /drive/auth/status` - Check Drive authentication status
- ...

### Google Photos (deprecated)
- `GET /api/google-photos` - List photos from Google Photos
- ...

### Health
- `GET /api/health` - Server health check
