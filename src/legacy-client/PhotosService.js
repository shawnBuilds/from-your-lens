function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import { BASE_API_URL, STORAGE_KEYS, ENABLE_GOOGLE_DRIVE_USAGE } from './constants.js'; // Added STORAGE_KEYS and ENABLE_GOOGLE_DRIVE_USAGE
import { loadFromLocalStorage } from './localStorageUtils.js'; // Added for token retrieval
var DRIVE_API_BASE_URL = "".concat(BASE_API_URL, "/drive");
var PHOTOS_API_BASE_URL = "".concat(BASE_API_URL, "/api/photos"); // New base URL for photo metadata API
var GOOGLE_PHOTOS_API_BASE_URL = "".concat(BASE_API_URL, "/api/google-photos"); // Base URL for Google Photos Library endpoints
var PhotosService = /*#__PURE__*/ function() {
    "use strict";
    function PhotosService() {
        _class_call_check(this, PhotosService);
        this.driveApiUrl = DRIVE_API_BASE_URL;
        this.photosApiUrl = PHOTOS_API_BASE_URL; // Store new base URL
        this.googlePhotosApiUrl = GOOGLE_PHOTOS_API_BASE_URL; // Store Google Photos base URL
    }
    _create_class(PhotosService, [
        {
            key: "_fetch",
            value: function _fetch(url) {
                var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                return _async_to_generator(function() {
                    var token, defaultHeaders, mergedOptions, response, errorData, e, _tmp, contentType, error;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                token = loadFromLocalStorage(STORAGE_KEYS.AUTH_TOKEN, 'Auth Token for API Request');
                                defaultHeaders = {
                                    'Content-Type': 'application/json'
                                };
                                if (token) {
                                    defaultHeaders['Authorization'] = "Bearer ".concat(token);
                                }
                                // Removed credentials: 'include' as JWT in header is used now.
                                // If some specific endpoints still need cookies for other reasons (not auth),
                                // it would need more granular control. For now, assuming JWT is primary auth.
                                mergedOptions = _object_spread_props(_object_spread({}, options), {
                                    headers: _object_spread({}, defaultHeaders, options.headers || {})
                                });
                                _state.label = 1;
                            case 1:
                                _state.trys.push([
                                    1,
                                    9,
                                    ,
                                    10
                                ]);
                                return [
                                    4,
                                    fetch(url, mergedOptions)
                                ];
                            case 2:
                                response = _state.sent();
                                if (!!response.ok) return [
                                    3,
                                    8
                                ];
                                _state.label = 3;
                            case 3:
                                _state.trys.push([
                                    3,
                                    5,
                                    ,
                                    7
                                ]);
                                return [
                                    4,
                                    response.json()
                                ];
                            case 4:
                                errorData = _state.sent();
                                return [
                                    3,
                                    7
                                ];
                            case 5:
                                e = _state.sent();
                                _tmp = {
                                    error: response.statusText
                                };
                                return [
                                    4,
                                    response.text().catch(function() {
                                        return 'Could not read error response text.';
                                    })
                                ];
                            case 6:
                                // If response is not JSON or empty
                                errorData = (_tmp.detail = _state.sent(), _tmp);
                                return [
                                    3,
                                    7
                                ];
                            case 7:
                                console.error("[PhotosService] API Error: ".concat(response.status, " ").concat(response.statusText), errorData);
                                throw new Error(errorData.error || "Failed to fetch from ".concat(url, ". Status: ").concat(response.status));
                            case 8:
                                // Handle cases where response might be empty or not JSON (e.g., 204 No Content)
                                contentType = response.headers.get('content-type');
                                if (contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/octet-stream')) {
                                    return [
                                        2,
                                        response
                                    ]; // Return raw response for binary data like image content
                                }
                                if (response.status === 204 || !(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) {
                                    // For 204 or non-JSON, return the response object directly or a success marker
                                    // This allows callers to check response.ok or status without expecting JSON
                                    return [
                                        2,
                                        response
                                    ]; // Or potentially { success: true, status: response.status }
                                }
                                return [
                                    2,
                                    response.json()
                                ];
                            case 9:
                                error = _state.sent();
                                console.error('[PhotosService] Network or parsing error:', error);
                                throw error; // Re-throw the error to be caught by the caller
                            case 10:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "checkAuthStatus",
            value: function checkAuthStatus() {
                var _this = this;
                return _async_to_generator(function() {
                    var url;
                    return _ts_generator(this, function(_state) {
                        if (!ENABLE_GOOGLE_DRIVE_USAGE) {
                            console.warn('[PhotosService] Google Drive usage is disabled. checkAuthStatus will not proceed.');
                            throw new Error('Google Drive functionality is currently disabled.');
                        }
                        url = "".concat(_this.driveApiUrl, "/auth/status");
                        console.log("[PhotosService] Checking Drive auth status at: ".concat(url));
                        return [
                            2,
                            _this._fetch(url)
                        ];
                    });
                })();
            }
        },
        {
            key: "listFiles",
            value: function listFiles() {
                var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref_pageSize = _ref.pageSize, pageSize = _ref_pageSize === void 0 ? 10 : _ref_pageSize, pageToken = _ref.pageToken, _ref_query = _ref.query, query = _ref_query === void 0 ? "mimeType contains 'image/'" : _ref_query;
                var _this = this;
                return _async_to_generator(function() {
                    var urlParams, url;
                    return _ts_generator(this, function(_state) {
                        if (!ENABLE_GOOGLE_DRIVE_USAGE) {
                            console.warn('[PhotosService] Google Drive usage is disabled. listFiles will not proceed.');
                            throw new Error('Google Drive functionality is currently disabled.');
                        }
                        urlParams = new URLSearchParams();
                        urlParams.append('pageSize', pageSize.toString());
                        if (pageToken) {
                            urlParams.append('pageToken', pageToken);
                        }
                        urlParams.append('query', query);
                        url = "".concat(_this.driveApiUrl, "/files?").concat(urlParams.toString());
                        console.log("[PhotosService] Listing files from: ".concat(url));
                        return [
                            2,
                            _this._fetch(url)
                        ];
                    });
                })();
            }
        },
        {
            key: "getFileMetadata",
            value: function getFileMetadata(fileId) {
                var _this = this;
                return _async_to_generator(function() {
                    var url;
                    return _ts_generator(this, function(_state) {
                        if (!ENABLE_GOOGLE_DRIVE_USAGE) {
                            console.warn('[PhotosService] Google Drive usage is disabled. getFileMetadata will not proceed.');
                            throw new Error('Google Drive functionality is currently disabled.');
                        }
                        if (!fileId) {
                            console.error('[PhotosService] getFileMetadata: fileId is required.');
                            throw new Error('File ID is required to get metadata.');
                        }
                        url = "".concat(_this.driveApiUrl, "/files/").concat(fileId);
                        console.log("[PhotosService] Getting file metadata from: ".concat(url));
                        return [
                            2,
                            _this._fetch(url)
                        ];
                    });
                })();
            }
        },
        {
            key: "getFileContent",
            value: function getFileContent(fileId) {
                var _this = this;
                return _async_to_generator(function() {
                    var url;
                    return _ts_generator(this, function(_state) {
                        if (!ENABLE_GOOGLE_DRIVE_USAGE) {
                            console.warn('[PhotosService] Google Drive usage is disabled. getFileContent will not proceed.');
                            throw new Error('Google Drive functionality is currently disabled.');
                        }
                        if (!fileId) {
                            console.error('[PhotosService] getFileContent: fileId is required.');
                            throw new Error('File ID is required to get content.');
                        }
                        url = "".concat(_this.driveApiUrl, "/files/").concat(fileId, "/content");
                        console.log("[PhotosService] Getting file content from: ".concat(url));
                        return [
                            2,
                            _this._fetch(url)
                        ];
                    });
                })();
            }
        },
        {
            key: "searchFiles",
            value: function searchFiles() {
                var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, query = _ref.query, mimeType = _ref.mimeType, folderId = _ref.folderId;
                var _this = this;
                return _async_to_generator(function() {
                    var urlParams, url;
                    return _ts_generator(this, function(_state) {
                        if (!ENABLE_GOOGLE_DRIVE_USAGE) {
                            console.warn('[PhotosService] Google Drive usage is disabled. searchFiles will not proceed.');
                            throw new Error('Google Drive functionality is currently disabled.');
                        }
                        urlParams = new URLSearchParams();
                        if (query) {
                            urlParams.append('query', query);
                        }
                        if (mimeType) {
                            urlParams.append('mimeType', mimeType);
                        }
                        if (folderId) {
                            urlParams.append('folderId', folderId);
                        }
                        if (urlParams.toString() === '') {
                            console.warn('[PhotosService] searchFiles: At least one search parameter (query, mimeType, or folderId) is recommended.');
                        }
                        url = "".concat(_this.driveApiUrl, "/search?").concat(urlParams.toString());
                        console.log("[PhotosService] Searching files with params: ".concat(urlParams.toString()));
                        return [
                            2,
                            _this._fetch(url)
                        ];
                    });
                })();
            }
        },
        {
            key: "getFolderContents",
            value: function getFolderContents(folderId) {
                var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref_pageSize = _ref.pageSize, pageSize = _ref_pageSize === void 0 ? 10 : _ref_pageSize, pageToken = _ref.pageToken, _ref_additionalQuery = _ref.additionalQuery, additionalQuery = _ref_additionalQuery === void 0 ? "mimeType contains 'image/' and trashed = false" : _ref_additionalQuery;
                var _this = this;
                return _async_to_generator(function() {
                    var query, urlParams, url;
                    return _ts_generator(this, function(_state) {
                        if (!ENABLE_GOOGLE_DRIVE_USAGE) {
                            console.warn('[PhotosService] Google Drive usage is disabled. getFolderContents will not proceed.');
                            throw new Error('Google Drive functionality is currently disabled.');
                        }
                        if (!folderId) {
                            console.error('[PhotosService] getFolderContents: folderId is required.');
                            throw new Error('Folder ID is required to get folder contents.');
                        }
                        query = "'".concat(folderId, "' in parents");
                        if (additionalQuery && additionalQuery.trim() !== "") {
                            query += " and (".concat(additionalQuery, ")");
                        }
                        urlParams = new URLSearchParams();
                        urlParams.append('pageSize', pageSize.toString());
                        if (pageToken) {
                            urlParams.append('pageToken', pageToken);
                        }
                        urlParams.append('query', query);
                        url = "".concat(_this.driveApiUrl, "/files?").concat(urlParams.toString());
                        console.log("[PhotosService] Getting folder contents for '".concat(folderId, "' from: ").concat(url));
                        return [
                            2,
                            _this._fetch(url)
                        ];
                    });
                })();
            }
        },
        {
            key: "syncPhotoMetadata",
            value: // New method for syncing photo metadata
            function syncPhotoMetadata(photoData) {
                var _this = this;
                return _async_to_generator(function() {
                    var url, body, result;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                // photoData should conform to the POST /api/photos/sync request body:
                                // { id (driveFileId), alt, tags, createdTime, photoOf }
                                if (!photoData || !photoData.id) {
                                    console.error('[PhotosService] syncPhotoMetadata: photoData with id (driveFileId) is required.');
                                    throw new Error('Photo data with id (driveFileId) is required for sync.');
                                }
                                url = "".concat(_this.photosApiUrl, "/sync");
                                console.log("[PhotosService] Syncing photo metadata for ".concat(photoData.id, " to: ").concat(url));
                                // The request body should match the API spec.
                                // API expects: { id, alt, tags, createdTime, photoOf }
                                // We map our internal naming if necessary, but here it seems direct.
                                body = {
                                    id: photoData.id,
                                    alt: photoData.alt_text || photoData.alt,
                                    tags: photoData.tags || [],
                                    createdTime: photoData.created_time || photoData.createdTime,
                                    photoOf: photoData.photo_of || photoData.photoOf // Allow both
                                };
                                return [
                                    4,
                                    _this._fetch(url, {
                                        method: 'POST',
                                        body: JSON.stringify(body)
                                    })
                                ];
                            case 1:
                                result = _state.sent();
                                // The _fetch method returns the raw Response object for 204 or non-JSON success,
                                // and the parsed JSON object otherwise.
                                // We want to ensure these service methods return the photo object or null.
                                if (_instanceof(result, Response)) {
                                    // This means _fetch returned the raw Response (e.g. successful 204 No Content, or successful non-JSON response)
                                    // In this case, the full photo object is not available in the result.
                                    console.warn("[PhotosService] syncPhotoMetadata for ".concat(photoData.id, " received raw Response. API might not have returned photo data directly. Status: ").concat(result.status));
                                    return [
                                        2,
                                        null
                                    ]; // Indicate that the full object wasn't returned.
                                }
                                // If result is not a Response instance, it's assumed to be the parsed photo object.
                                return [
                                    2,
                                    result
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "getUserPhotos",
            value: /**
   * Retrieves photos taken by the authenticated user.
   * Corresponds to GET /api/photos
   * @param {object} [params={}] - Optional parameters.
   * @param {number} [params.limit=20] - Number of photos to return.
   * @param {number} [params.offset=0] - Number of photos to skip.
   * @returns {Promise<object>} A promise that resolves to an object containing photos, total, and has_more.
   * Example response: { photos: [...], total: 1, has_more: false }
   */ function getUserPhotos() {
                var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, limit = _ref.limit, offset = _ref.offset;
                var _this = this;
                return _async_to_generator(function() {
                    var urlParams, queryString, url;
                    return _ts_generator(this, function(_state) {
                        urlParams = new URLSearchParams();
                        if (limit !== undefined) {
                            urlParams.append('limit', limit.toString());
                        }
                        if (offset !== undefined) {
                            urlParams.append('offset', offset.toString());
                        }
                        queryString = urlParams.toString();
                        url = "".concat(_this.photosApiUrl).concat(queryString ? "?".concat(queryString) : '');
                        console.log("[PhotosService] Getting user's photos from: ".concat(url));
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'GET'
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "getPhotosOfUser",
            value: /**
   * Retrieves photos where the specified user is the subject.
   * Corresponds to GET /api/photos/of/:userId
   * @param {string|number} userId - ID of the user who is the subject of the photos.
   * @param {object} [params={}] - Optional parameters.
   * @param {number} [params.limit=20] - Number of photos to return.
   * @param {number} [params.offset=0] - Number of photos to skip.
   * @returns {Promise<object>} A promise that resolves to an object containing photos, total, and has_more.
   */ function getPhotosOfUser(userId) {
                var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, limit = _ref.limit, offset = _ref.offset;
                var _this = this;
                return _async_to_generator(function() {
                    var urlParams, queryString, encodedUserId, url;
                    return _ts_generator(this, function(_state) {
                        if (!userId) {
                            console.error('[PhotosService] getPhotosOfUser: userId is required.');
                            // Using Promise.reject for consistency with how _fetch might fail,
                            // or throw new Error directly if preferred.
                            return [
                                2,
                                Promise.reject(new Error('User ID is required to get photos of the user.'))
                            ];
                        }
                        urlParams = new URLSearchParams();
                        if (limit !== undefined) {
                            urlParams.append('limit', limit.toString());
                        }
                        if (offset !== undefined) {
                            urlParams.append('offset', offset.toString());
                        }
                        queryString = urlParams.toString();
                        // Ensure userId is properly encoded if it could contain special characters,
                        // though typically IDs are simple.
                        encodedUserId = encodeURIComponent(userId);
                        url = "".concat(_this.photosApiUrl, "/of/").concat(encodedUserId).concat(queryString ? "?".concat(queryString) : '');
                        console.log("[PhotosService] Getting photos of user ".concat(userId, " from: ").concat(url));
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'GET'
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "getPhotoMetadata",
            value: /**
   * Retrieves metadata for a specific photo from the photo metadata API.
   * Corresponds to GET /api/photos/:mediaItemId
   * @param {string} mediaItemId - Google Photos media item ID of the photo.
   * @returns {Promise<object>} A promise that resolves to the photo metadata object.
   */ function getPhotoMetadata(mediaItemId) {
                var _this = this;
                return _async_to_generator(function() {
                    var encodedMediaItemId, url;
                    return _ts_generator(this, function(_state) {
                        if (!mediaItemId) {
                            console.error('[PhotosService] getPhotoMetadata: mediaItemId is required.');
                            return [
                                2,
                                Promise.reject(new Error('Google Photos media item ID is required to get photo metadata.'))
                            ];
                        }
                        // Ensure mediaItemId is properly encoded if it could contain special characters.
                        encodedMediaItemId = encodeURIComponent(mediaItemId);
                        url = "".concat(_this.photosApiUrl, "/").concat(encodedMediaItemId);
                        console.log("[PhotosService] Getting photo metadata for mediaItemId ".concat(mediaItemId, " from: ").concat(url));
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'GET'
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "updatePhotoTags",
            value: /**
   * Updates tags for a specific photo.
   * Corresponds to PATCH /api/photos/:mediaItemId/tags
   * @param {string} mediaItemId - Google Photos media item ID of the photo.
   * @param {string[]} tags - An array of tags to set for the photo.
   * @returns {Promise<object>} A promise that resolves to the updated photo metadata object.
   */ function updatePhotoTags(mediaItemId, tags) {
                var _this = this;
                return _async_to_generator(function() {
                    var encodedMediaItemId, url, body;
                    return _ts_generator(this, function(_state) {
                        if (!mediaItemId) {
                            console.error('[PhotosService] updatePhotoTags: mediaItemId is required.');
                            return [
                                2,
                                Promise.reject(new Error('Google Photos media item ID is required to update photo tags.'))
                            ];
                        }
                        if (!Array.isArray(tags)) {
                            console.error('[PhotosService] updatePhotoTags: tags must be an array.');
                            return [
                                2,
                                Promise.reject(new Error('Tags must be provided as an array.'))
                            ];
                        }
                        encodedMediaItemId = encodeURIComponent(mediaItemId);
                        url = "".concat(_this.photosApiUrl, "/").concat(encodedMediaItemId, "/tags");
                        console.log("[PhotosService] Updating tags for photo with mediaItemId ".concat(mediaItemId, " to:"), tags, "at URL: ".concat(url));
                        body = {
                            tags: tags
                        };
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'PATCH',
                                body: JSON.stringify(body)
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "searchPhotosByTags",
            value: /**
   * Searches for photos by tags.
   * Corresponds to GET /api/photos/search
   * @param {object} [params={}] - Parameters for the search.
   * @param {string[]} params.tags - An array of tags to search for.
   * @param {number} [params.limit=20] - Number of photos to return.
   * @param {number} [params.offset=0] - Number of photos to skip.
   * @returns {Promise<object>} A promise that resolves to an object containing photos, total, and has_more.
   */ function searchPhotosByTags() {
                var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, tags = _ref.tags, limit = _ref.limit, offset = _ref.offset;
                var _this = this;
                return _async_to_generator(function() {
                    var urlParams, queryString, url;
                    return _ts_generator(this, function(_state) {
                        if (!tags || !Array.isArray(tags) || tags.length === 0) {
                            console.error('[PhotosService] searchPhotosByTags: tags array is required and cannot be empty.');
                            return [
                                2,
                                Promise.reject(new Error('Tags array is required and cannot be empty for searching photos.'))
                            ];
                        }
                        urlParams = new URLSearchParams();
                        // The backend expects tags as a comma-separated string in a single 'tags' query parameter.
                        urlParams.append('tags', tags.join(','));
                        if (limit !== undefined) {
                            urlParams.append('limit', limit.toString());
                        }
                        if (offset !== undefined) {
                            urlParams.append('offset', offset.toString());
                        }
                        queryString = urlParams.toString();
                        url = "".concat(_this.photosApiUrl, "/search").concat(queryString ? "?".concat(queryString) : '');
                        console.log("[PhotosService] Searching photos by tags (".concat(tags.join(', '), ") from: ").concat(url));
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'GET'
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "updatePhotoSubject",
            value: /**
   * Updates the subject of a specific photo.
   * Corresponds to PATCH /api/photos/:mediaItemId/photo-of
   * @param {string} mediaItemId - Google Photos media item ID of the photo.
   * @param {string|null} photoOfUserId - The ID of the user who is the subject, or null to remove.
   * @returns {Promise<object>} A promise that resolves to the updated photo metadata object.
   */ function updatePhotoSubject(mediaItemId, photoOfUserId) {
                var _this = this;
                return _async_to_generator(function() {
                    var encodedMediaItemId, url, body, result;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                if (!mediaItemId) {
                                    console.error('[PhotosService] updatePhotoSubject: mediaItemId is required.');
                                    return [
                                        2,
                                        Promise.reject(new Error('Google Photos media item ID is required to update photo subject.'))
                                    ];
                                }
                                // photoOfUserId can be a string (user_id) or null.
                                encodedMediaItemId = encodeURIComponent(mediaItemId);
                                url = "".concat(_this.photosApiUrl, "/").concat(encodedMediaItemId, "/photo-of");
                                console.log("[PhotosService] Updating photo subject for mediaItemId ".concat(mediaItemId, " to user ID: ").concat(photoOfUserId, " at URL: ").concat(url));
                                body = {
                                    photoOf: photoOfUserId
                                }; // Backend expects "photoOf" in the body.
                                return [
                                    4,
                                    _this._fetch(url, {
                                        method: 'PATCH',
                                        body: JSON.stringify(body)
                                    })
                                ];
                            case 1:
                                result = _state.sent();
                                if (_instanceof(result, Response)) {
                                    console.warn("[PhotosService] updatePhotoSubject for mediaItemId ".concat(mediaItemId, " received raw Response. API might not have returned photo data directly. Status: ").concat(result.status));
                                    return [
                                        2,
                                        null
                                    ];
                                }
                                return [
                                    2,
                                    result
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "listGooglePhotos",
            value: /**
   * Retrieves photos from Google Photos Library.
   * Corresponds to GET /api/google-photos
   * @param {object} [params={}] - Optional parameters.
   * @param {number} [params.pageSize] - Number of photos to return.
   * @param {string} [params.pageToken] - Token for pagination.
   * @returns {Promise<object>} A promise that resolves to an object containing photos and nextPageToken.
   */ function listGooglePhotos() {
                var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, pageSize = _ref.pageSize, pageToken = _ref.pageToken;
                var _this = this;
                return _async_to_generator(function() {
                    var urlParams, queryString, url;
                    return _ts_generator(this, function(_state) {
                        urlParams = new URLSearchParams();
                        if (pageSize !== undefined) {
                            urlParams.append('pageSize', pageSize.toString());
                        }
                        if (pageToken) {
                            urlParams.append('pageToken', pageToken);
                        }
                        queryString = urlParams.toString();
                        url = "".concat(_this.googlePhotosApiUrl).concat(queryString ? "?".concat(queryString) : '');
                        console.log("[PhotosService] Listing Google Photos from: ".concat(url));
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'GET'
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "getGooglePhotoMetadata",
            value: /**
   * Retrieves metadata for a specific photo from Google Photos Library.
   * Corresponds to GET /api/google-photos/:mediaItemId
   * @param {string} mediaItemId - ID of the media item in Google Photos.
   * @returns {Promise<object>} A promise that resolves to the photo metadata object.
   */ function getGooglePhotoMetadata(mediaItemId) {
                var _this = this;
                return _async_to_generator(function() {
                    var encodedMediaItemId, url;
                    return _ts_generator(this, function(_state) {
                        if (!mediaItemId) {
                            console.error('[PhotosService] getGooglePhotoMetadata: mediaItemId is required.');
                            return [
                                2,
                                Promise.reject(new Error('Media Item ID is required to get Google Photo metadata.'))
                            ];
                        }
                        encodedMediaItemId = encodeURIComponent(mediaItemId);
                        url = "".concat(_this.googlePhotosApiUrl, "/").concat(encodedMediaItemId);
                        console.log("[PhotosService] Getting Google Photo metadata for ".concat(mediaItemId, " from: ").concat(url));
                        return [
                            2,
                            _this._fetch(url, {
                                method: 'GET'
                            })
                        ];
                    });
                })();
            }
        }
    ]);
    return PhotosService;
}();
export var photosService = new PhotosService();
