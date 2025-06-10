function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
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
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
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
import { useState, useCallback, useEffect } from 'react';
import { photosService } from './PhotosService.js';
import { VIEW_STATES } from './constants.js';
var PHOTOS_PER_PAGE = 10;
// TOTAL_PHOTOS_TO_PRELOAD is removed as we paginate directly
// Helper function to map API photo data to internal structure
var mapApiPhotoToInternalPhoto = function(apiPhoto) {
    var _apiPhoto_mediaMetadata;
    if (!apiPhoto || !apiPhoto.id) {
        console.warn('[usePhotos mapApiPhotoToInternalPhoto] Invalid API photo data (missing id):', apiPhoto);
        return null;
    }
    // Attempt to find a usable image source URL
    // Prioritize content_url, then productUrl (Google Photos specific), then baseUrl, then thumbnail_link
    var imageSrc = apiPhoto.content_url || apiPhoto.productUrl || apiPhoto.baseUrl || apiPhoto.thumbnail_link;
    if (!imageSrc) {
        console.warn("[usePhotos mapApiPhotoToInternalPhoto] Photo ".concat(apiPhoto.id, " is missing a valid image source URL (content_url, productUrl, baseUrl, thumbnail_link)."), apiPhoto);
    // Depending on requirements, you might still return the photo metadata without src, or null.
    // For now, let's return it, PhotoItem will handle missing src.
    }
    return {
        id: apiPhoto.id,
        name: apiPhoto.filename || "Photo ".concat(apiPhoto.id),
        alt: apiPhoto.description || apiPhoto.filename || "Photo ".concat(apiPhoto.id),
        mimeType: apiPhoto.mimeType,
        tags: apiPhoto.tags || [],
        createdTime: ((_apiPhoto_mediaMetadata = apiPhoto.mediaMetadata) === null || _apiPhoto_mediaMetadata === void 0 ? void 0 : _apiPhoto_mediaMetadata.creationTime) || apiPhoto.created_time,
        photoOf: apiPhoto.photo_of,
        src: imageSrc
    };
};
export var usePhotos = function(currentUser, currentView) {
    var userId = currentUser === null || currentUser === void 0 ? void 0 : currentUser.id;
    // State for "My Photos" (formerly "My Drive" photos)
    var _useState = _sliced_to_array(useState([]), 2), myPhotos = _useState[0], setMyPhotos = _useState[1]; // Stores all fetched "My Photos"
    var _useState1 = _sliced_to_array(useState(false), 2), isFetchingMyPhotos = _useState1[0], setIsFetchingMyPhotos = _useState1[1];
    var _useState2 = _sliced_to_array(useState(null), 2), fetchMyPhotosError = _useState2[0], setFetchMyPhotosError = _useState2[1];
    var _useState3 = _sliced_to_array(useState(true), 2), hasMoreMyPhotos = _useState3[0], setHasMoreMyPhotos = _useState3[1]; // Remains, indicates if more photos can be fetched
    var _useState4 = _sliced_to_array(useState(null), 2), myPhotosNextPageToken = _useState4[0], setMyPhotosNextPageToken = _useState4[1]; // For Google Photos pagination
    var _useState5 = _sliced_to_array(useState(false), 2), myPhotosInitialFetchComplete = _useState5[0], setMyPhotosInitialFetchComplete = _useState5[1];
    // State for "Photos of You" (remains largely the same logic)
    var _useState6 = _sliced_to_array(useState([]), 2), allPhotosOfYou = _useState6[0], setAllPhotosOfYou = _useState6[1];
    var _useState7 = _sliced_to_array(useState([]), 2), displayedPhotosOfYou = _useState7[0], setDisplayedPhotosOfYou = _useState7[1];
    var _useState8 = _sliced_to_array(useState(false), 2), isFetchingPhotosOfYou = _useState8[0], setIsFetchingPhotosOfYou = _useState8[1];
    var _useState9 = _sliced_to_array(useState(null), 2), fetchPhotosOfYouError = _useState9[0], setFetchPhotosOfYouError = _useState9[1];
    var _useState10 = _sliced_to_array(useState(0), 2), currentPhotosOfYouOffset = _useState10[0], setCurrentPhotosOfYouOffset = _useState10[1];
    var _useState11 = _sliced_to_array(useState(true), 2), hasMorePhotosOfYou = _useState11[0], setHasMorePhotosOfYou = _useState11[1];
    var _useState12 = _sliced_to_array(useState(false), 2), photosOfYouInitialFetchComplete = _useState12[0], setPhotosOfYouInitialFetchComplete = _useState12[1];
    // parsePhotoMetadata is no longer needed as mapApiPhotoToInternalPhoto will handle the new API structure.
    // fetchRemainingPhotosInBackground is removed. Pagination will be handled by loadMoreMyPhotos.
    var fetchInitialMyPhotos = useCallback(/*#__PURE__*/ _async_to_generator(function() {
        var response, mappedPhotos, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (!userId) {
                        setMyPhotos([]);
                        setMyPhotosNextPageToken(null); // Reset page token
                        setFetchMyPhotosError(null);
                        setHasMoreMyPhotos(true); // Assume more can be fetched until first API call
                        setMyPhotosInitialFetchComplete(false);
                        return [
                            2
                        ];
                    }
                    setIsFetchingMyPhotos(true);
                    setFetchMyPhotosError(null);
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        3,
                        4,
                        5
                    ]);
                    console.log('[usePhotos] Fetching initial batch of "My Photos"...');
                    return [
                        4,
                        photosService.listGooglePhotos({
                            pageSize: PHOTOS_PER_PAGE
                        })
                    ];
                case 2:
                    response = _state.sent();
                    if (response && response.mediaItems) {
                        mappedPhotos = response.mediaItems.map(mapApiPhotoToInternalPhoto).filter(function(p) {
                            return p !== null;
                        });
                        setMyPhotos(mappedPhotos);
                        setMyPhotosNextPageToken(response.nextPageToken || null); // Store the next page token
                        setHasMoreMyPhotos(!!response.nextPageToken); // If there's a nextPageToken, there are more photos
                        console.log('[usePhotos] Initial "My Photos" (Google Photos) batch fetched:', mappedPhotos.length, 'Next Page Token:', response.nextPageToken);
                    } else {
                        setMyPhotos([]);
                        setMyPhotosNextPageToken(null);
                        setHasMoreMyPhotos(false);
                    }
                    return [
                        3,
                        5
                    ];
                case 3:
                    error = _state.sent();
                    console.error('[usePhotos] Error fetching initial "My Photos":', error);
                    setFetchMyPhotosError(error.message || 'Failed to load initial photos.');
                    setMyPhotos([]);
                    setHasMoreMyPhotos(false);
                    return [
                        3,
                        5
                    ];
                case 4:
                    setIsFetchingMyPhotos(false);
                    setMyPhotosInitialFetchComplete(true);
                    return [
                        7
                    ];
                case 5:
                    return [
                        2
                    ];
            }
        });
    }), [
        userId
    ]);
    useEffect(function() {
        if (userId && currentView === VIEW_STATES.PHOTOS && !myPhotosInitialFetchComplete) {
            fetchInitialMyPhotos();
        } else if (!userId) {
            // Reset "My Photos" state
            setMyPhotos([]);
            setMyPhotosNextPageToken(null);
            setFetchMyPhotosError(null);
            setHasMoreMyPhotos(true);
            setIsFetchingMyPhotos(false);
            setMyPhotosInitialFetchComplete(false);
            // Reset "Photos of You" state
            setAllPhotosOfYou([]);
            setDisplayedPhotosOfYou([]);
            setIsFetchingPhotosOfYou(false);
            setFetchPhotosOfYouError(null);
            setCurrentPhotosOfYouOffset(0);
            setHasMorePhotosOfYou(true);
            setPhotosOfYouInitialFetchComplete(false);
        }
    }, [
        userId,
        currentView,
        fetchInitialMyPhotos,
        myPhotosInitialFetchComplete
    ]);
    var loadMoreMyPhotos = useCallback(/*#__PURE__*/ _async_to_generator(function() {
        var response, newMappedPhotos, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    // Use myPhotosNextPageToken for pagination. If it's null and hasMoreMyPhotos was true from initial fetch,
                    // it implies we've reached the end if the API didn't return a token on the last page.
                    // More robustly, hasMoreMyPhotos should be solely based on the presence of nextPageToken.
                    if (!userId || !myPhotosNextPageToken || isFetchingMyPhotos) {
                        if (!myPhotosNextPageToken && hasMoreMyPhotos) {
                            console.log('[usePhotos] Load more called, but no next page token. Assuming end of list.');
                            setHasMoreMyPhotos(false); // Explicitly set to false if no token
                        }
                        return [
                            2
                        ];
                    }
                    setIsFetchingMyPhotos(true);
                    console.log('[usePhotos] Loading more "My Photos" (Google Photos), pageToken: '.concat(myPhotosNextPageToken));
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        3,
                        4,
                        5
                    ]);
                    return [
                        4,
                        photosService.listGooglePhotos({
                            pageSize: PHOTOS_PER_PAGE,
                            pageToken: myPhotosNextPageToken
                        })
                    ];
                case 2:
                    response = _state.sent();
                    if (response && response.mediaItems && response.mediaItems.length > 0) {
                        newMappedPhotos = response.mediaItems.map(mapApiPhotoToInternalPhoto).filter(function(p) {
                            return p !== null;
                        });
                        setMyPhotos(function(prev) {
                            return _to_consumable_array(prev).concat(_to_consumable_array(newMappedPhotos));
                        });
                        setMyPhotosNextPageToken(response.nextPageToken || null); // Update the next page token
                        setHasMoreMyPhotos(!!response.nextPageToken); // Update hasMore based on new token
                        console.log('[usePhotos] More "My Photos" (Google Photos) loaded:', newMappedPhotos.length, 'Next Page Token:', response.nextPageToken);
                    } else {
                        // No more items or empty response
                        setMyPhotosNextPageToken(null);
                        setHasMoreMyPhotos(false);
                    }
                    return [
                        3,
                        5
                    ];
                case 3:
                    error = _state.sent();
                    console.error('[usePhotos] Error loading more "My Photos":', error);
                    setFetchMyPhotosError(error.message || 'Failed to load more photos.');
                    return [
                        3,
                        5
                    ];
                case 4:
                    setIsFetchingMyPhotos(false);
                    return [
                        7
                    ];
                case 5:
                    return [
                        2
                    ];
            }
        });
    }), [
        userId,
        myPhotosNextPageToken,
        isFetchingMyPhotos,
        hasMoreMyPhotos
    ]); // depends on myPhotosNextPageToken now
    var fetchInitialPhotosOfUser = useCallback(/*#__PURE__*/ function() {
        var _ref = _async_to_generator(function(currentUserId) {
            var response, mappedPhotos, error;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!currentUserId) {
                            setAllPhotosOfYou([]);
                            setDisplayedPhotosOfYou([]);
                            setFetchPhotosOfYouError(null);
                            setHasMorePhotosOfYou(false);
                            setPhotosOfYouInitialFetchComplete(true);
                            return [
                                2
                            ];
                        }
                        setIsFetchingPhotosOfYou(true);
                        setFetchPhotosOfYouError(null);
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            4,
                            5
                        ]);
                        console.log("[usePhotos] Fetching initial batch of photos of user ".concat(currentUserId, "..."));
                        return [
                            4,
                            photosService.getPhotosOfUser(currentUserId, {
                                limit: PHOTOS_PER_PAGE,
                                offset: 0
                            })
                        ];
                    case 2:
                        response = _state.sent();
                        if (response && response.photos) {
                            mappedPhotos = response.photos.map(mapApiPhotoToInternalPhoto).filter(function(p) {
                                return p !== null;
                            });
                            setAllPhotosOfYou(mappedPhotos);
                            setDisplayedPhotosOfYou(mappedPhotos);
                            setCurrentPhotosOfYouOffset(mappedPhotos.length);
                            setHasMorePhotosOfYou(response.has_more);
                            console.log('[usePhotos] Initial batch of photos of user fetched and displayed:', mappedPhotos);
                        } else {
                            setAllPhotosOfYou([]);
                            setDisplayedPhotosOfYou([]);
                            setHasMorePhotosOfYou(false);
                        }
                        return [
                            3,
                            5
                        ];
                    case 3:
                        error = _state.sent();
                        console.error('[usePhotos] Error fetching initial photos of user:', error);
                        setFetchPhotosOfYouError(error.message || 'Failed to load photos of you.');
                        setAllPhotosOfYou([]);
                        setDisplayedPhotosOfYou([]);
                        setHasMorePhotosOfYou(false);
                        return [
                            3,
                            5
                        ];
                    case 4:
                        setIsFetchingPhotosOfYou(false);
                        setPhotosOfYouInitialFetchComplete(true);
                        return [
                            7
                        ];
                    case 5:
                        return [
                            2
                        ];
                }
            });
        });
        return function(currentUserId) {
            return _ref.apply(this, arguments);
        };
    }(), []);
    var loadMorePhotosOfUser = useCallback(/*#__PURE__*/ function() {
        var _ref = _async_to_generator(function(currentUserId) {
            var response, newMappedPhotos, error;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!currentUserId || !hasMorePhotosOfYou || isFetchingPhotosOfYou) return [
                            2
                        ];
                        setIsFetchingPhotosOfYou(true);
                        console.log("[usePhotos] Loading more photos of user ".concat(currentUserId, ", offset: ").concat(currentPhotosOfYouOffset));
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            4,
                            5
                        ]);
                        return [
                            4,
                            photosService.getPhotosOfUser(currentUserId, {
                                limit: PHOTOS_PER_PAGE,
                                offset: currentPhotosOfYouOffset
                            })
                        ];
                    case 2:
                        response = _state.sent();
                        if (response && response.photos && response.photos.length > 0) {
                            newMappedPhotos = response.photos.map(mapApiPhotoToInternalPhoto).filter(function(p) {
                                return p !== null;
                            });
                            setAllPhotosOfYou(function(prev) {
                                return _to_consumable_array(prev).concat(_to_consumable_array(newMappedPhotos));
                            });
                            setDisplayedPhotosOfYou(function(prev) {
                                return _to_consumable_array(prev).concat(_to_consumable_array(newMappedPhotos));
                            });
                            setCurrentPhotosOfYouOffset(function(prevOffset) {
                                return prevOffset + newMappedPhotos.length;
                            });
                            setHasMorePhotosOfYou(response.has_more);
                            console.log('[usePhotos] More photos of user loaded:', newMappedPhotos.length);
                        } else {
                            setHasMorePhotosOfYou(false);
                        }
                        return [
                            3,
                            5
                        ];
                    case 3:
                        error = _state.sent();
                        console.error('[usePhotos] Error loading more photos of user:', error);
                        setFetchPhotosOfYouError(error.message || 'Failed to load more photos of you.');
                        return [
                            3,
                            5
                        ];
                    case 4:
                        setIsFetchingPhotosOfYou(false);
                        return [
                            7
                        ];
                    case 5:
                        return [
                            2
                        ];
                }
            });
        });
        return function(currentUserId) {
            return _ref.apply(this, arguments);
        };
    }(), [
        hasMorePhotosOfYou,
        isFetchingPhotosOfYou,
        currentPhotosOfYouOffset
    ]);
    var updateSinglePhotoMetadata = useCallback(function(updatedPhoto) {
        if (!updatedPhoto || !updatedPhoto.drive_file_id) {
            console.warn('[usePhotos updateSinglePhotoMetadata] Received invalid or incomplete photo data:', updatedPhoto);
            return;
        }
        // The ID from Google Photos is `id`. Backend `photo` table also uses `id` (which is the Google mediaItem ID).
        // `drive_file_id` is for the old Drive integration.
        // We should be consistent and use `id` when referring to Google Photos media items.
        var photoId = updatedPhoto.id;
        if (!photoId) {
            console.warn('[usePhotos updateSinglePhotoMetadata] Received photo data without an ID:', updatedPhoto);
            return;
        }
        console.log("[usePhotos updateSinglePhotoMetadata] Updating photo ".concat(photoId, " with new data:"), updatedPhoto);
        var mappedPhoto = mapApiPhotoToInternalPhoto(updatedPhoto); // Ensure consistent structure
        if (!mappedPhoto) {
            console.warn('[usePhotos updateSinglePhotoMetadata] Failed to map updated photo, aborting update:', updatedPhoto);
            return;
        }
        // Update "My Photos" (which are now Google Photos)
        setMyPhotos(function(prevPhotos) {
            return prevPhotos.map(function(p) {
                return p.id === photoId ? _object_spread({}, p, mappedPhoto) : p;
            });
        });
        // Update "Photos of You"
        // This list might also contain Google Photos if the backend links them.
        setAllPhotosOfYou(function(prevMetadata) {
            return prevMetadata.map(function(p) {
                return p.id === photoId ? _object_spread({}, p, mappedPhoto) : p;
            });
        });
        setDisplayedPhotosOfYou(function(prevDisplayed) {
            return prevDisplayed.map(function(p) {
                return p.id === photoId ? _object_spread({}, p, mappedPhoto) : p;
            });
        });
    }, []);
    return {
        // "My Photos" related exports (formerly "My Drive")
        photos: myPhotos,
        isFetchingPhotos: isFetchingMyPhotos,
        fetchPhotosError: fetchMyPhotosError,
        fetchUserPhotos: fetchInitialMyPhotos,
        loadMorePhotos: loadMoreMyPhotos,
        hasMorePhotos: hasMoreMyPhotos,
        // isFetchingMoreMetadata, // This state is removed as background full metadata load is removed
        // "Photos of You" related exports (structure remains similar)
        photosOfYou: displayedPhotosOfYou,
        isFetchingPhotosOfYou: isFetchingPhotosOfYou,
        fetchPhotosOfYouError: fetchPhotosOfYouError,
        fetchInitialPhotosOfUser: fetchInitialPhotosOfUser,
        loadMorePhotosOfUser: loadMorePhotosOfUser,
        hasMorePhotosOfYou: hasMorePhotosOfYou,
        photosOfYouInitialFetchComplete: photosOfYouInitialFetchComplete,
        // Common
        updateSinglePhotoMetadata: updateSinglePhotoMetadata
    };
};
