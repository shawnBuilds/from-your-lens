function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
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
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var _this = this;
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header.js';
import Tabs, { TAB_OPTIONS } from './Tabs.js'; // Import TAB_OPTIONS
import PhotoGallery from './PhotoGallery.js';
import BatchCompareForm from './BatchCompareForm.js';
import LoadingIndicator from './LoadingIndicator.js'; // Import the new LoadingIndicator
import { DEFAULT_BATCH_TARGET_COUNT } from './constants.js';
var PhotosView = function(param) {
    var onLogout = param.onLogout, photos = param.photos, user = param.user, isFetchingPhotos = param.isFetchingPhotos, fetchPhotosError = param.fetchPhotosError, loadMorePhotos = param.loadMorePhotos, hasMorePhotos = param.hasMorePhotos, onProfilePictureUpdate = param.onProfilePictureUpdate, updateSinglePhotoMetadata = param.updateSinglePhotoMetadata, // Props for "Photos of You"
    photosOfYou = param.photosOfYou, isFetchingPhotosOfYou = param.isFetchingPhotosOfYou, fetchPhotosOfYouError = param.fetchPhotosOfYouError, fetchInitialPhotosOfUser = param.fetchInitialPhotosOfUser, loadMorePhotosOfUser = param.loadMorePhotosOfUser, hasMorePhotosOfYou = param.hasMorePhotosOfYou, photosOfYouInitialFetchComplete = param.photosOfYouInitialFetchComplete;
    var _useState = _sliced_to_array(useState(false), 2), isInitialLoadingComplete = _useState[0], setIsInitialLoadingComplete = _useState[1]; // Overall loading complete state
    var _useState1 = _sliced_to_array(useState(false), 2), myDriveFetchAttempted = _useState1[0], setMyDriveFetchAttempted = _useState1[1];
    var _useState2 = _sliced_to_array(useState(false), 2), showBatchCompareModal = _useState2[0], setShowBatchCompareModal = _useState2[1];
    var _useState3 = _sliced_to_array(useState(new Map()), 2), preloadedImageBlobs = _useState3[0], setPreloadedImageBlobs = _useState3[1];
    var _useState4 = _sliced_to_array(useState(TAB_OPTIONS.MY_DRIVE), 2), currentPhotoViewTab = _useState4[0], setCurrentPhotoViewTab = _useState4[1];
    // State for tracking initial "My Drive" photo rendering
    var _useState5 = _sliced_to_array(useState(new Set()), 2), initialMyDrivePhotoIds = _useState5[0], setInitialMyDrivePhotoIds = _useState5[1];
    var _useState6 = _sliced_to_array(useState(new Set()), 2), renderedInitialMyDrivePhotoIds = _useState6[0], setRenderedInitialMyDrivePhotoIds = _useState6[1];
    var _useState7 = _sliced_to_array(useState(false), 2), myDriveMetadataLoadComplete = _useState7[0], setMyDriveMetadataLoadComplete = _useState7[1];
    useEffect(function() {
        // Track if an initial fetch for "My Drive" photos has been triggered.
        if (isFetchingPhotos) {
            setMyDriveFetchAttempted(true);
        }
    }, [
        isFetchingPhotos
    ]);
    useEffect(function() {
        // This effect manages setting myDriveMetadataLoadComplete and initialMyDrivePhotoIds
        // ONCE the initial fetch for "My Drive" photos is done.
        if (myDriveFetchAttempted && !isFetchingPhotos) {
            if (!myDriveMetadataLoadComplete) {
                if (photos && photos.length > 0) {
                    setInitialMyDrivePhotoIds(new Set(photos.map(function(p) {
                        return p.id;
                    })));
                    console.log('[PhotosView] Initial "My Drive" photo IDs set (first time). Count:', photos.length);
                } else if (fetchPhotosError || photos && photos.length === 0 && myDriveFetchAttempted && !isFetchingPhotos) {
                    // This condition handles:
                    // 1. An error occurred during the fetch.
                    // 2. Fetch completed successfully but returned no photos.
                    console.log('[PhotosView] Initial "My Drive" photos fetch complete (error or no photos). Clearing/setting empty initial IDs.');
                    setInitialMyDrivePhotoIds(new Set());
                }
                // Whether photos were found, not found, or an error occurred, the initial metadata load attempt is complete.
                setMyDriveMetadataLoadComplete(true);
                console.log('[PhotosView] myDriveMetadataLoadComplete has been set to true.');
            }
        // If myDriveMetadataLoadComplete is already true, subsequent changes to 'photos'
        // (e.g., from metadata syncs) should not re-trigger the setting of initialMyDrivePhotoIds here.
        // The dependency array includes 'photos' because the initial setting of initialMyDrivePhotoIds depends on it.
        }
    }, [
        myDriveFetchAttempted,
        isFetchingPhotos,
        photos,
        fetchPhotosError,
        myDriveMetadataLoadComplete
    ]);
    useEffect(function() {
        // Determine if the overall initial loading for PhotosView is complete.
        if (!isInitialLoadingComplete && myDriveMetadataLoadComplete) {
            if (fetchPhotosError) {
                // If there's an error fetching metadata, we complete loading to show the error.
                console.log('[PhotosView] Initial data load for "My Drive" failed. Completing loading to show error.');
                setIsInitialLoadingComplete(true);
            } else if (initialMyDrivePhotoIds.size === 0 && photos.length === 0) {
                // No photos to render, so loading is complete.
                console.log('[PhotosView] No initial "My Drive" photos to render. Completing loading.');
                setIsInitialLoadingComplete(true);
            } else if (initialMyDrivePhotoIds.size > 0 && renderedInitialMyDrivePhotoIds.size >= initialMyDrivePhotoIds.size) {
                // All initial "My Drive" photos have rendered.
                console.log('[PhotosView] All initial "My Drive" photos rendered. Completing loading.');
                setIsInitialLoadingComplete(true);
            }
        }
    }, [
        isInitialLoadingComplete,
        myDriveMetadataLoadComplete,
        initialMyDrivePhotoIds,
        renderedInitialMyDrivePhotoIds,
        photos,
        fetchPhotosError
    ]);
    var handleImageBlobReady = useCallback(function(fileId, blob) {
        setPreloadedImageBlobs(function(prevMap) {
            if (!prevMap.has(fileId)) {
                var newMap = new Map(prevMap);
                newMap.set(fileId, blob);
                console.log("[PhotosView] Cached blob for ".concat(fileId, ". Cache size: ").concat(newMap.size));
                return newMap;
            }
            return prevMap;
        });
    }, []);
    useEffect(function() {
        console.log('[PhotosView] Mounted/Updated. User ID:', user === null || user === void 0 ? void 0 : user.id, 'Current Tab:', currentPhotoViewTab);
        if (currentPhotoViewTab === TAB_OPTIONS.PHOTOS_OF_YOU && (user === null || user === void 0 ? void 0 : user.id) && !photosOfYouInitialFetchComplete && !isFetchingPhotosOfYou) {
            console.log('[PhotosView] "Photos of You" tab active, fetching initial set.');
            fetchInitialPhotosOfUser(user.id);
        }
        return function() {
        // console.log('[PhotosView] Cleanup effect. User ID was:', user?.id, 'Current Tab was:', currentPhotoViewTab);
        };
    }, [
        user === null || user === void 0 ? void 0 : user.id,
        currentPhotoViewTab,
        photosOfYouInitialFetchComplete,
        fetchInitialPhotosOfUser,
        isFetchingPhotosOfYou
    ]);
    var handleTabChange = function(newTab) {
        console.log('[PhotosView] Tab changed to:', newTab);
        setCurrentPhotoViewTab(newTab);
    // Potentially clear/reset photos or trigger new fetch based on tab
    // For now, just logging.
    };
    var handleComparePhotosClick = function() {
        setShowBatchCompareModal(true);
    };
    var handleCloseBatchCompareModal = function() {
        setShowBatchCompareModal(false);
    };
    var _useState8 = _sliced_to_array(useState(null), 2), batchCompareApiError = _useState8[0], setBatchCompareApiError = _useState8[1];
    var handleImageRendered = useCallback(function(fileId) {
        if (currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && initialMyDrivePhotoIds.has(fileId)) {
            setRenderedInitialMyDrivePhotoIds(function(prevRendered) {
                if (!prevRendered.has(fileId)) {
                    var newRendered = new Set(prevRendered);
                    newRendered.add(fileId);
                    console.log('[PhotosView] Initial "My Drive" image rendered: '.concat(fileId, ". Total rendered: ").concat(newRendered.size, "/").concat(initialMyDrivePhotoIds.size));
                    return newRendered;
                }
                return prevRendered;
            });
        }
    // Note: We are not currently tracking initial "Photos of You" rendering in the same way.
    // This logic is specific to the "My Drive" initial load enhancement.
    }, [
        currentPhotoViewTab,
        initialMyDrivePhotoIds
    ]);
    // Determine if initial metadata for the current My Drive tab is loading
    var myDriveIsFetchingInitialMetadata = currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && isFetchingPhotos && // This prop indicates initial metadata fetch for My Drive
    !myDriveMetadataLoadComplete; // And it's not yet complete
    // Determine if initial metadata for "Photos of You" tab is loading
    var photosOfYouIsFetchingInitialMetadata = currentPhotoViewTab === TAB_OPTIONS.PHOTOS_OF_YOU && isFetchingPhotosOfYou && // This prop indicates initial metadata fetch for Photos of You
    !photosOfYouInitialFetchComplete; // And it's not yet complete
    // Show a primary loading indicator if either active tab is fetching its initial metadata
    if (myDriveIsFetchingInitialMetadata || photosOfYouIsFetchingInitialMetadata) {
        // Standardized loading text
        var mainLoadingText = "Checking your photos...";
        var subLoadingText = "This might take a few seconds.";
        console.log("[PhotosView] Rendering: LoadingIndicator (Initial Metadata Fetch for ".concat(currentPhotoViewTab, ")"));
        return /*#__PURE__*/ _jsxDEV(_Fragment, {
            children: [
                /*#__PURE__*/ _jsxDEV(Header, {
                    onLogout: onLogout,
                    user: user,
                    onProfilePictureUpdate: onProfilePictureUpdate
                }, void 0, false, {
                    fileName: "PhotosView.jsx",
                    lineNumber: 158,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV(LoadingIndicator, {
                    mainText: mainLoadingText,
                    subText: subLoadingText
                }, void 0, false, {
                    fileName: "PhotosView.jsx",
                    lineNumber: 160,
                    columnNumber: 9
                }, _this)
            ]
        }, void 0, true);
    }
    // If initial metadata fetching is complete, prepare to render the main content
    console.log("[PhotosView] Rendering main content structure. Tab: ".concat(currentPhotoViewTab, ", MyDrive All Images Rendered: ").concat(isInitialLoadingComplete));
    // Standardized loading text for subsequent stages
    var mainLoadingText1 = "Checking your photos...";
    var subLoadingText1 = "This might take a few seconds.";
    // The main container for PhotosView will be a flex column.
    return /*#__PURE__*/ _jsxDEV("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden'
        },
        children: [
            /*#__PURE__*/ _jsxDEV(Header, {
                onLogout: onLogout,
                user: user,
                onProfilePictureUpdate: onProfilePictureUpdate
            }, void 0, false, {
                fileName: "PhotosView.jsx",
                lineNumber: 173,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV(Tabs, {
                onComparePhotosClick: handleComparePhotosClick,
                onTabChange: handleTabChange,
                style: {
                    // flexShrink: 0, // Tabs should not shrink
                    visibility: currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? 'hidden' : 'visible',
                    opacity: currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? 0 : 1,
                    pointerEvents: currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? 'none' : 'auto',
                    height: currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? '0px' : 'auto',
                    overflow: currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE && myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? 'hidden' : 'visible'
                }
            }, void 0, false, {
                fileName: "PhotosView.jsx",
                lineNumber: 179,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV("div", {
                style: {
                    flexGrow: 1,
                    position: 'relative',
                    overflowY: 'auto'
                },
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        style: {
                            display: currentPhotoViewTab === TAB_OPTIONS.MY_DRIVE ? 'block' : 'none',
                            height: '100%' /* Ensure this section tries to fill its parent */ 
                        },
                        children: [
                            myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError && /*#__PURE__*/ _jsxDEV(LoadingIndicator, {
                                mainText: mainLoadingText1,
                                subText: subLoadingText1
                            }, void 0, false, {
                                fileName: "PhotosView.jsx",
                                lineNumber: 199,
                                columnNumber: 13
                            }, _this),
                            (myDriveMetadataLoadComplete || fetchPhotosError) && /*#__PURE__*/ _jsxDEV("div", {
                                style: {
                                    visibility: myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? 'hidden' : 'visible',
                                    height: myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? '0px' : '100%',
                                    overflow: myDriveMetadataLoadComplete && !isInitialLoadingComplete && photos.length > 0 && !fetchPhotosError ? 'hidden' : 'auto' // Allow scroll when visible
                                },
                                children: /*#__PURE__*/ _jsxDEV(PhotoGallery, {
                                    photos: photos,
                                    isFetchingPhotos: isFetchingPhotos && hasMorePhotos,
                                    fetchPhotosError: fetchPhotosError,
                                    loadMorePhotos: loadMorePhotos,
                                    hasMorePhotos: hasMorePhotos,
                                    onImageBlobReady: handleImageBlobReady,
                                    onImageRendered: handleImageRendered,
                                    preloadedImageBlobs: preloadedImageBlobs
                                }, void 0, false, {
                                    fileName: "PhotosView.jsx",
                                    lineNumber: 207,
                                    columnNumber: 15
                                }, _this)
                            }, void 0, false, {
                                fileName: "PhotosView.jsx",
                                lineNumber: 202,
                                columnNumber: 13
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "PhotosView.jsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        style: {
                            display: currentPhotoViewTab === TAB_OPTIONS.PHOTOS_OF_YOU ? 'block' : 'none',
                            height: '100%' /* Ensure this section tries to fill its parent */ 
                        },
                        children: [
                            isFetchingPhotosOfYou && !photosOfYouInitialFetchComplete && /*#__PURE__*/ _jsxDEV(LoadingIndicator, {
                                mainText: mainLoadingText1,
                                subText: subLoadingText1
                            }, void 0, false, {
                                fileName: "PhotosView.jsx",
                                lineNumber: 226,
                                columnNumber: 14
                            }, _this),
                            (photosOfYouInitialFetchComplete || fetchPhotosOfYouError) && !isFetchingPhotosOfYou && /*#__PURE__*/ _jsxDEV("div", {
                                style: {
                                    height: '100%',
                                    overflowY: 'auto'
                                },
                                children: [
                                    " ",
                                    /*#__PURE__*/ _jsxDEV(PhotoGallery, {
                                        photos: photosOfYou,
                                        isFetchingPhotos: isFetchingPhotosOfYou && hasMorePhotosOfYou,
                                        fetchPhotosError: fetchPhotosOfYouError,
                                        loadMorePhotos: function() {
                                            return loadMorePhotosOfUser(user === null || user === void 0 ? void 0 : user.id);
                                        },
                                        hasMorePhotos: hasMorePhotosOfYou,
                                        onImageBlobReady: handleImageBlobReady,
                                        onImageRendered: handleImageRendered,
                                        preloadedImageBlobs: preloadedImageBlobs
                                    }, void 0, false, {
                                        fileName: "PhotosView.jsx",
                                        lineNumber: 230,
                                        columnNumber: 15
                                    }, _this)
                                ]
                            }, void 0, true, {
                                fileName: "PhotosView.jsx",
                                lineNumber: 229,
                                columnNumber: 13
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "PhotosView.jsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "PhotosView.jsx",
                lineNumber: 192,
                columnNumber: 7
            }, _this),
            showBatchCompareModal && /*#__PURE__*/ _jsxDEV(BatchCompareForm, {
                title: "Batch Compare Photos",
                onClose: handleCloseBatchCompareModal,
                onResults: function(results) {
                    return console.log('Batch compare results:', results);
                },
                onError: function(errorMessage) {
                    console.error('Batch compare error:', errorMessage);
                    setBatchCompareApiError(errorMessage);
                },
                externalErrorToDisplay: batchCompareApiError,
                apiEndpointInfo: {
                    text: "Endpoint:",
                    code: "POST /api/face/batch-compare"
                },
                sourceImageUrlFromProp: user === null || user === void 0 ? void 0 : user.profilePictureUrl,
                targetPhotosFromDrive: photos.slice(0, DEFAULT_BATCH_TARGET_COUNT),
                preloadedImageBlobs: preloadedImageBlobs,
                userId: user === null || user === void 0 ? void 0 : user.id,
                updateSinglePhotoMetadata: updateSinglePhotoMetadata
            }, void 0, false, {
                fileName: "PhotosView.jsx",
                lineNumber: 246,
                columnNumber: 9
            }, _this)
        ]
    }, void 0, true, {
        fileName: "PhotosView.jsx",
        lineNumber: 172,
        columnNumber: 5
    }, _this);
};
export default PhotosView;
