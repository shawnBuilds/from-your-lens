# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the From Your Lens iOS app.

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Copy from env.template
cp env.template .env
```

Then edit `.env` with your actual values:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/fromyourlens
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Create a Web application client ID for the backend
7. Add authorized redirect URIs:
   - Development: `http://localhost:5000/auth/google/callback`
   - Production: `https://fromyourlens-904e01076638.herokuapp.com/auth/google/callback`

### 3. Start the Backend Server

```bash
npm install
npm start
```

## iOS App Setup

### 1. Google Sign-In SDK

Add the Google Sign-In SDK to your iOS project:

1. In Xcode, go to your project settings
2. Select your target
3. Go to "Package Dependencies"
4. Add package: `https://github.com/google/GoogleSignIn-iOS`

### 2. GoogleService-Info.plist

1. In Google Cloud Console, create an iOS OAuth 2.0 Client ID
2. Download the `GoogleService-Info.plist` file
3. Add it to your iOS project (drag and drop into Xcode)
4. Make sure it's included in your target

### 3. URL Scheme Configuration

1. In Xcode, select your target
2. Go to "Info" tab
3. Add a URL scheme: `fromyourlens`
4. This allows the OAuth callback to redirect back to your app

### 4. Update GoogleOAuthService.swift

Update the `clientID` constant in `GoogleOAuthService.swift` with your actual iOS client ID:

```swift
private let clientID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
```

### 5. Update Server URL

In `GoogleOAuthService.swift`, update the server URL for your environment:

```swift
// Development
private let serverURL = "http://localhost:5000"

// Production
private let serverURL = "https://fromyourlens-904e01076638.herokuapp.com"
```

## Testing the Integration

### 1. Backend Testing

Test the backend OAuth flow:

```bash
# Start the server
npm start

# Test the OAuth endpoint
curl http://localhost:5000/auth/google
```

### 2. iOS App Testing

1. Build and run the iOS app
2. Tap "Sign in with Google"
3. Complete the Google OAuth flow
4. Verify you're redirected to the photos view
5. Check the console logs for authentication flow

## Expected Behavior

### When User Taps "Sign in with Google":

1. **iOS App**: Calls `appState.handleGoogleSignIn()`
2. **GoogleOAuthService**: Presents Google Sign-In UI
3. **User**: Completes Google authentication
4. **GoogleOAuthService**: Exchanges Google token for JWT
5. **Backend**: Creates/updates user in database
6. **iOS App**: Receives JWT token and user data
7. **Navigation**: User is taken to photos view

### Debug Logs to Expect:

```
[AppState] Initiating Google Sign-In...
[GoogleOAuth] Google Sign-In successful for: user@example.com
[GoogleOAuth] OAuth callback successful for user: user@example.com
[GoogleOAuth] Redirecting to iOS app: fromyourlens://oauth-callback?token=...
[AppState] Google Sign-In successful for user: user@example.com
[AppState] Current user set. Navigating to PHOTOS view.
```

## Troubleshooting

### Common Issues:

1. **"Failed to load GoogleService-Info.plist"**
   - Make sure the file is added to your Xcode project
   - Verify it's included in your target

2. **"No ID token received from Google"**
   - Check that your Google Cloud Console OAuth client is configured correctly
   - Verify the bundle ID matches your app

3. **"Server error: 500"**
   - Check backend logs for detailed error messages
   - Verify environment variables are set correctly
   - Ensure database is running and accessible

4. **"Unable to present sign-in view"**
   - Make sure you're calling the sign-in method from the main thread
   - Verify the root view controller is available

### Debug Mode:

Enable debug logging by setting these feature flags in `Constants.swift`:

```swift
static let enableDebugLogSkipAuth = true
static let enableDebugLogICloudPhotos = true
```

## Security Notes

1. **Never commit your `.env` file** - it contains sensitive credentials
2. **Use different client IDs** for development and production
3. **Rotate JWT secrets** regularly in production
4. **Validate tokens** on the server side for all protected routes
5. **Use HTTPS** in production for all OAuth callbacks 