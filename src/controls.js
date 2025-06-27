// Feature Controls - Centralized configuration for enabling/disabling features
const Controls = {
    // Authentication Controls
    enableJWT: true,
    
    // API Controls
    enableFaceDetection: true,
    enablePhotoUpload: true,
    enableUserManagement: true,
    
    // Database Controls
    enableDatabaseInitialization: true,
    
    // Development Controls
    enableDebugLogging: true,
    enableMockData: true,
    
    // Environment-specific overrides
    get isProduction() {
        return process.env.NODE_ENV === 'production';
    },
    
    get isDevelopment() {
        return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    }
};

module.exports = Controls; 