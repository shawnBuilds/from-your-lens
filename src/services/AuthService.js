handleReturningUser: async () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    console.log('[AuthService] No token found in localStorage for returning user.');
    localStorage.removeItem(STORAGE_KEYS.USER_DATA); // Ensure user data is also cleared
    logStorageEvent('REMOVE', 'Stale User Data (no token)', STORAGE_KEYS.USER_DATA, null);
    return { sessionValid: false };
  }

  // Get existing user data before verification
  const existingUserData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}');
  console.log('[AuthService] Existing user data before verification:', existingUserData);

  const verifyTokenUrl = `${BASE_API_URL}/auth/verify-token`;
  console.log(`[AuthService] Verifying token at: ${verifyTokenUrl}`);
  try {
    const response = await fetch(verifyTokenUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const verificationData = await response.json();
      if (verificationData.valid && verificationData.user) {
        console.log('[AuthService] Token is valid. Verification data:', verificationData.user);
        
        // Merge verification data with existing user data
        const mergedUserData = {
          ...existingUserData,
          ...verificationData.user,
          // Preserve profile picture URL if it exists in either source
          profilePictureUrl: verificationData.user.profilePictureUrl || existingUserData.profilePictureUrl
        };
        
        console.log('[AuthService] Merged user data:', mergedUserData);
        
        // Update localStorage with merged data
        logStorageEvent('SAVE_INITIATED', 'User Data (merged from verification)', STORAGE_KEYS.USER_DATA, null);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mergedUserData));
        logStorageEvent('SAVE_COMPLETED', 'User Data (merged from verification)', STORAGE_KEYS.USER_DATA, mergedUserData);
        
        return { sessionValid: true, user: mergedUserData };
      } else {
        console.log('[AuthService] Token verification failed or user data missing.', verificationData);
        // Token is invalid or response is malformed
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        logStorageEvent('REMOVE', 'Invalid Auth Token', STORAGE_KEYS.AUTH_TOKEN, null);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        logStorageEvent('REMOVE', 'Stale User Data (invalid token)', STORAGE_KEYS.USER_DATA, null);
        return { sessionValid: false };
      }
    } else {
      console.log('[AuthService] Token verification request returned not ok. Status:', response.status);
      // Server rejected token (e.g., expired, malformed)
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      logStorageEvent('REMOVE', 'Rejected Auth Token', STORAGE_KEYS.AUTH_TOKEN, null);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      logStorageEvent('REMOVE', 'Stale User Data (rejected token)', STORAGE_KEYS.USER_DATA, null);
      return { sessionValid: false };
    }
  } catch (error) {
    console.error('[AuthService] Error during token verification:', error);
    // Network error, don't clear local storage, backend might be temporarily unavailable
    return { sessionValid: false, error: `Network error: ${error.message}` };
  }
}

handleGoogleAuthCallback: (event) => {
    console.log('[AuthService] Handling Google Auth Callback:', event.data);
    
    // Handle both Drive and Photos auth success
    if (event.data.type === 'GOOGLE_AUTH_SUCCESS' || event.data.type === 'GOOGLE_PHOTOS_AUTH_SUCCESS') {
        const { token, user } = event.data;
        
        // Store the token
        logStorageEvent('SAVE_INITIATED', 'Auth Token', STORAGE_KEYS.AUTH_TOKEN, null);
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        logStorageEvent('SAVE_COMPLETED', 'Auth Token', STORAGE_KEYS.AUTH_TOKEN, token);
        
        // Store user data
        logStorageEvent('SAVE_INITIATED', 'User Data', STORAGE_KEYS.USER_DATA, null);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        logStorageEvent('SAVE_COMPLETED', 'User Data', STORAGE_KEYS.USER_DATA, user);
        
        return { success: true, user };
    }
    
    console.log('[AuthService] Received unhandled or malformed message for auth callback:', event.data);
    return { success: false, error: 'Malformed callback data' };
} 