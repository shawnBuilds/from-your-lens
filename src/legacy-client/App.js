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
var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback } from 'react';
// AuthForm is no longer imported as it's being replaced by AuthButton in LandingPage
import LandingPage from './LandingPage.js';
import PhotosView from './PhotosView.js';
import TestingForm from './TestingForm.js';
import { VIEW_STATES, STORAGE_KEYS, SHOW_TESTING_FORM_ON_START, MOCK_USER } from './constants.js';
import { loadFromLocalStorage, saveToLocalStorage, logStorageEvent } from './localStorageUtils.js';
import { AuthService } from './AuthService.js';
import { UserService } from './UserService.js';
import { usePhotos } from './usePhotos.js';
var getUniqueTags = function(photos) {
    var allTags = photos.reduce(function(acc, photo) {
        if (photo.tags) {
            return acc.concat(photo.tags);
        }
        return acc;
    }, []);
    return _to_consumable_array(new Set(allTags)).sort();
};
var App = function() {
    var _useState = _sliced_to_array(useState(getUniqueTags([])), 2), availableTags = _useState[0], setAvailableTags = _useState[1];
    var _useState1 = _sliced_to_array(useState(null), 2), currentUser = _useState1[0], setCurrentUser = _useState1[1];
    var _useState2 = _sliced_to_array(useState(VIEW_STATES.LANDING), 2), currentView = _useState2[0], setCurrentView = _useState2[1];
    var _useState3 = _sliced_to_array(useState(true), 2), isLoading = _useState3[0], setIsLoading = _useState3[1];
    var _usePhotos = usePhotos(currentUser, currentView), photos = _usePhotos.photos, isFetchingPhotos = _usePhotos.isFetchingPhotos, fetchPhotosError = _usePhotos.fetchPhotosError, refetchUserPhotos = _usePhotos.fetchUserPhotos, loadMorePhotos = _usePhotos.loadMorePhotos, hasMorePhotos = _usePhotos.hasMorePhotos, updateSinglePhotoMetadata = _usePhotos.updateSinglePhotoMetadata, // Destructure new state and functions for "Photos of You"
    photosOfYou = _usePhotos.photosOfYou, isFetchingPhotosOfYou = _usePhotos.isFetchingPhotosOfYou, fetchPhotosOfYouError = _usePhotos.fetchPhotosOfYouError, fetchInitialPhotosOfUser = _usePhotos.fetchInitialPhotosOfUser, loadMorePhotosOfUser = _usePhotos.loadMorePhotosOfUser, hasMorePhotosOfYou = _usePhotos.hasMorePhotosOfYou, photosOfYouInitialFetchComplete = _usePhotos.photosOfYouInitialFetchComplete;
    useEffect(function() {
        var initializeApp = /*#__PURE__*/ function() {
            var _ref = _async_to_generator(function() {
                var sessionResult;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            setIsLoading(true);
                            console.log('[App] Initializing app, checking for returning user session...');
                            return [
                                4,
                                AuthService.handleReturningUser()
                            ];
                        case 1:
                            sessionResult = _state.sent();
                            if (sessionResult.sessionValid && sessionResult.user) {
                                console.log('[App] Session valid. User data from server:', sessionResult.user);
                                console.log('[App] Valid session found. User will start on LANDING page as per requirement.');
                                setCurrentUser(null);
                                setCurrentView(VIEW_STATES.LANDING);
                            } else {
                                console.log('[App] No valid session or error during check. Clearing client data and defaulting to LANDING.');
                                if (!sessionResult.sessionValid && !sessionResult.error) {
                                    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                                    logStorageEvent('REMOVE', 'Stale Auth Token (App Init)', STORAGE_KEYS.AUTH_TOKEN, null);
                                    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                                    logStorageEvent('REMOVE', 'Stale User Data (App Init)', STORAGE_KEYS.USER_DATA, null);
                                }
                                setCurrentUser(null);
                                setCurrentView(VIEW_STATES.LANDING);
                            }
                            setIsLoading(false);
                            return [
                                2
                            ];
                    }
                });
            });
            return function initializeApp() {
                return _ref.apply(this, arguments);
            };
        }();
        initializeApp();
    }, []);
    var handleAuthSuccess = function(authResult) {
        console.log('[App] Handling successful authentication callback...', authResult);
        if (authResult === null || authResult === void 0 ? void 0 : authResult.isSkipped) {
            console.log('[App] Skipping authentication, using mock user.');
            setCurrentUser(MOCK_USER);
            setCurrentView(VIEW_STATES.PHOTOS);
            return;
        }
        var user = loadFromLocalStorage(STORAGE_KEYS.USER_DATA, 'User Data', true);
        console.log('[App] Reloaded user data from localStorage:', user);
        if (user) {
            setCurrentUser(user);
            console.log('[App] Current user set. Transitioning to Photos view.');
        } else {
            console.warn('[App] Auth success callback, but no user data found in localStorage. Check AuthService handling.');
        }
        setCurrentView(VIEW_STATES.PHOTOS);
    };
    var handleLogout = /*#__PURE__*/ function() {
        var _ref = _async_to_generator(function() {
            var logoutResult;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        console.log('[App] Initiating logout process...');
                        return [
                            4,
                            AuthService.logout()
                        ];
                    case 1:
                        logoutResult = _state.sent();
                        if (!logoutResult.success) {
                            console.warn('[App] Server logout was not successful or an error occurred. Details:', logoutResult.error);
                        }
                        console.log('[App] Clearing client-side session data.');
                        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                        logStorageEvent('REMOVE', 'Auth Token', STORAGE_KEYS.AUTH_TOKEN, null);
                        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                        logStorageEvent('REMOVE', 'User Data', STORAGE_KEYS.USER_DATA, null);
                        setCurrentUser(null);
                        setCurrentView(VIEW_STATES.LANDING);
                        console.log('[App] Logout complete. Navigating to LANDING view.');
                        return [
                            2
                        ];
                }
            });
        });
        return function handleLogout() {
            return _ref.apply(this, arguments);
        };
    }();
    // navigateToAuth is no longer needed as AuthForm view is removed
    var handleProfilePictureUpdate = /*#__PURE__*/ function() {
        var _ref = _async_to_generator(function(tempUserWithObjectURL, fileToUpload) {
            var uploadResult, updatedUserFromServer, error;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!currentUser || !fileToUpload) {
                            console.warn('[App] Profile picture update called without user or file.');
                            return [
                                2
                            ];
                        }
                        console.log('[App] Starting profile picture upload for user:', currentUser.id);
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
                            UserService.uploadProfilePicture(fileToUpload)
                        ];
                    case 2:
                        uploadResult = _state.sent();
                        if (uploadResult.success && uploadResult.user) {
                            updatedUserFromServer = uploadResult.user;
                            console.log('[App] Profile picture uploaded. New user data:', updatedUserFromServer);
                            setCurrentUser(updatedUserFromServer);
                            saveToLocalStorage(STORAGE_KEYS.USER_DATA, updatedUserFromServer, 'Updated User Data (PFP)');
                            if (tempUserWithObjectURL.profilePictureUrl && tempUserWithObjectURL.profilePictureUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(tempUserWithObjectURL.profilePictureUrl);
                            }
                        } else {
                            console.error('[App] Profile picture upload failed:', uploadResult.error);
                        }
                        return [
                            3,
                            5
                        ];
                    case 3:
                        error = _state.sent();
                        console.error('[App] Error during profile picture update process:', error);
                        return [
                            3,
                            5
                        ];
                    case 4:
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
        return function handleProfilePictureUpdate(tempUserWithObjectURL, fileToUpload) {
            return _ref.apply(this, arguments);
        };
    }();
    useEffect(function() {
        setAvailableTags(getUniqueTags(photos));
    }, [
        photos
    ]);
    var renderCurrentView = function() {
        if (isLoading) {
            console.log('[App renderCurrentView] Rendering: Loading...');
            return /*#__PURE__*/ _jsxDEV("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '1.5rem'
                },
                children: "Loading..."
            }, void 0, false, {
                fileName: "App.jsx",
                lineNumber: 144,
                columnNumber: 14
            }, _this);
        }
        if (SHOW_TESTING_FORM_ON_START && !currentUser) {
            console.log('[App renderCurrentView] Rendering: TestingForm (SHOW_TESTING_FORM_ON_START)');
            return /*#__PURE__*/ _jsxDEV(TestingForm, {}, void 0, false, {
                fileName: "App.jsx",
                lineNumber: 148,
                columnNumber: 14
            }, _this);
        }
        if (currentUser && currentView === VIEW_STATES.PHOTOS) {
            console.log('[App renderCurrentView] Rendering: PhotosView');
            return /*#__PURE__*/ _jsxDEV(PhotosView, {
                onLogout: handleLogout,
                user: currentUser,
                photos: photos,
                isFetchingPhotos: isFetchingPhotos,
                fetchPhotosError: fetchPhotosError,
                loadMorePhotos: loadMorePhotos,
                hasMorePhotos: hasMorePhotos,
                onProfilePictureUpdate: handleProfilePictureUpdate,
                updateSinglePhotoMetadata: updateSinglePhotoMetadata,
                // Pass "Photos of You" props
                photosOfYou: photosOfYou,
                isFetchingPhotosOfYou: isFetchingPhotosOfYou,
                fetchPhotosOfYouError: fetchPhotosOfYouError,
                fetchInitialPhotosOfUser: fetchInitialPhotosOfUser,
                loadMorePhotosOfUser: loadMorePhotosOfUser,
                hasMorePhotosOfYou: hasMorePhotosOfYou,
                photosOfYouInitialFetchComplete: photosOfYouInitialFetchComplete
            }, void 0, false, {
                fileName: "App.jsx",
                lineNumber: 153,
                columnNumber: 9
            }, _this);
        }
        if (currentView === VIEW_STATES.LANDING) {
            console.log('[App renderCurrentView] Rendering: LandingPage');
            return /*#__PURE__*/ _jsxDEV(LandingPage, {
                onAuthSuccess: handleAuthSuccess
            }, void 0, false, {
                fileName: "App.jsx",
                lineNumber: 176,
                columnNumber: 14
            }, _this); // Pass onAuthSuccess directly
        }
        // The VIEW_STATES.AUTH case is removed as AuthForm is no longer a separate view
        if (currentUser) {
            console.log("[App renderCurrentView] Fallback for logged-in user. currentView ('".concat(currentView, "') is not PHOTOS. Redirecting to PHOTOS."));
            setCurrentView(VIEW_STATES.PHOTOS);
            console.log('[App renderCurrentView] Rendering: null (due to fallback redirect to PHOTOS)');
            return null;
        }
        // If not logged in and not on LANDING (and not in TESTING mode), default to LANDING.
        // The check for SHOW_TESTING_FORM_ON_START already handles the TESTING view.
        console.warn("[App renderCurrentView] Fallback for non-logged-in user. currentView ('".concat(currentView, "') is not LANDING. Redirecting to LANDING. State:"), {
            currentUser: !!currentUser,
            currentView: currentView,
            isLoading: isLoading
        });
        setCurrentView(VIEW_STATES.LANDING);
        console.log('[App renderCurrentView] Rendering: null (due to fallback redirect to LANDING)');
        return null;
    };
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "app-container",
        children: renderCurrentView()
    }, void 0, false, {
        fileName: "App.jsx",
        lineNumber: 193,
        columnNumber: 5
    }, _this);
};
export default App;
