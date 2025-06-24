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
export var ENABLE_SKIP_AUTH_FLOW = true; // Set to true to enable the "skip auth" modal for development
export var DEFAULT_BATCH_TARGET_COUNT = 5; // Number of recent photos to use as targets in batch compare
export var ENABLE_GOOGLE_DRIVE_USAGE = false; // Controls access to Google Drive specific routes
export var ICON_URLS = {
    MY_DRIVE: "https://play.rosebud.ai/assets/icon-google-drive-transparent.png?4rTm",
    PHOTOS_OF_YOU: "https://play.rosebud.ai/assets/icon-you-selfie.png?MQtz",
    FIND_PHOTOS: "https://play.rosebud.ai/assets/icon-search.png?mQKb",
    SEND_PHOTOS: "https://play.rosebud.ai/assets/icon-send-no-bg.png?b4PE"
};
export var MOCK_USER = {
    id: 'mock-user-01',
    name: 'Test User',
    email: 'test@example.com',
    profilePictureUrl: "https://play.rosebud.ai/assets/jules-pfp.jpg?gCCe"
};
export var MOCK_PHOTOS = [
    {
        id: 'mock-photo-1',
        name: 'Jules 01',
        alt: 'A scenic adventure photo',
        src: 'https://play.rosebud.ai/assets/jules-01.jpg?P9o9',
        mimeType: 'image/jpeg',
        tags: [
            'travel',
            'scenic'
        ],
        createdTime: '2023-10-26T10:00:00Z'
    },
    {
        id: 'mock-scene-1',
        name: 'Mock Scene 1',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-1.jpg?kxZh',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-21T11:00:00Z'
    },
    {
        id: 'mock-photo-2',
        name: 'Jules 02',
        alt: 'Group fun photo',
        src: 'https://play.rosebud.ai/assets/jules-02.jpg?8JqA',
        mimeType: 'image/jpeg',
        tags: [
            'friends',
            'group'
        ],
        createdTime: '2023-10-25T18:30:00Z'
    },
    {
        id: 'mock-scene-2',
        name: 'Mock Scene 2',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-2.jpg?DFSi',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-20T11:00:00Z'
    },
    {
        id: 'mock-photo-3',
        name: 'Jules 03',
        alt: 'A portrait of Jules',
        src: 'https://play.rosebud.ai/assets/jules-03.jpg?0dLv',
        mimeType: 'image/jpeg',
        tags: [
            'portrait'
        ],
        createdTime: '2023-10-24T12:00:00Z'
    },
    {
        id: 'mock-scene-3',
        name: 'Mock Scene 3',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-3.jpg?Uw0B',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-19T11:00:00Z'
    },
    {
        id: 'mock-scene-4',
        name: 'Mock Scene 4',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-4.jpg?dUFm',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-18T11:00:00Z'
    },
    {
        id: 'mock-photo-5',
        name: 'Jules 05',
        alt: 'Jules in a stylish outfit',
        src: 'https://play.rosebud.ai/assets/jules-05.jpg?597c',
        mimeType: 'image/jpeg',
        tags: [
            'fashion',
            'outdoor'
        ],
        createdTime: '2023-10-22T15:20:00Z'
    },
    {
        id: 'mock-scene-5',
        name: 'Mock Scene 5',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-5.jpg?uB7r',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-17T11:00:00Z'
    },
    {
        id: 'mock-scene-6',
        name: 'Mock Scene 6',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-6.jpg?nLjH',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-16T11:00:00Z'
    },
    {
        id: 'mock-scene-7',
        name: 'Mock Scene 7',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-7.jpg?D1wm',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-15T11:00:00Z'
    },
    {
        id: 'mock-scene-8',
        name: 'Mock Scene 8',
        alt: 'A mock scene photo',
        src: 'https://play.rosebud.ai/assets/mock-scene-8.jpg?EyO6',
        mimeType: 'image/jpeg',
        tags: [
            'mock',
            'scene'
        ],
        createdTime: '2023-10-14T11:00:00Z'
    }
];
