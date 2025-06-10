export var PROFILE_PIC_URL = "https://rosebud.ai/assets/icon-default-pfp.png?ibhI";
export var VIEW_STATES = {
    PHOTOS: 'PHOTOS',
    // AUTH: 'AUTH', // Removed as AuthForm is no longer a separate view
    LANDING: 'LANDING',
    TESTING: 'TESTING'
};
export var STORAGE_KEYS = {
    AUTH_TOKEN: 'from-your-lens-authToken-v1',
    USER_DATA: 'from-your-lens-user-v1'
};
export var BASE_API_URL = 'http://localhost:5000';
// CDN URLs for face-api.js models are no longer needed for client-side detection
// export const FACE_API_MODEL_CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model'; 
// Feature Flags / Controls
export var ENABLE_FACE_DETECTION_ON_IMAGE_LOAD = false; // Client-side detection is removed
export var SHOW_FACE_COUNT_BADGE = false; // Client-side face count badge is removed
export var SHOW_TESTING_FORM_ON_START = false; // Set to true to show the Face API testing form on app start
export var DEFAULT_BATCH_TARGET_COUNT = 2; // Number of recent photos to use as targets in batch compare
export var ENABLE_GOOGLE_DRIVE_USAGE = false; // Controls access to Google Drive specific routes
export var ICON_URLS = {
    MY_DRIVE: "https://play.rosebud.ai/assets/icon-google-drive-transparent.png?4rTm",
    PHOTOS_OF_YOU: "https://play.rosebud.ai/assets/icon-you-selfie.png?MQtz",
    FIND_PHOTOS: "https://play.rosebud.ai/assets/icon-search.png?mQKb",
    SEND_PHOTOS: "https://play.rosebud.ai/assets/icon-send-no-bg.png?b4PE"
};
