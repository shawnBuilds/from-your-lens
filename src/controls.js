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
    
    // Development Controls - Specific debug flags to reduce console noise
    enableDebugLogOAuth: true,        // Google OAuth flow logs
    enableDebugLogFaceDetection: false, // Face detection/comparison logs
    enableDebugLogBatchCompare: true, // Batch face comparison logs (NEW)
    enableDebugLogBatchJobService: true, // Batch job service logs (NEW)
    enableDebugLogPhotoUpload: true, // Debug: log photo upload operations
    enableDebugLogAuth: true,         // General auth service logs
    enableDebugLogUser: true,         // User management logs
    enableMockData: true,
    maxBatchCompareTargets: 1000,
    maxImageSize: 5 * 1024 * 1024, // 5MB per image (optional, for clarity)
    
    // Environment-specific overrides
    get isProduction() {
        return process.env.NODE_ENV === 'production';
    },
    
    get isDevelopment() {
        return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    }
};

module.exports = Controls; 