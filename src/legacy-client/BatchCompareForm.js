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
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
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
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { faceApiService } from './FaceApiService.js';
import { photosService } from './PhotosService.js'; // Import photosService
// import DetectionBoundingBoxes from './DetectionBoundingBoxes.js'; // Removed for now
import ImageCarousel from './ImageCarousel.js'; // Import the new carousel
import { DEFAULT_BATCH_TARGET_COUNT } from './constants.js'; // Import default count
import { fetchImageBlob, blobToFile } from './imageUtils.js'; // Import image utilities
import { useAutoScroll } from './useAutoScroll.js'; // Import the new hook
var BatchCompareForm = function(param) {
    var onResults = param.onResults, onError = param.onError, title = param.title, onClose = param.onClose, externalErrorToDisplay = param.externalErrorToDisplay, apiEndpointInfo = param.apiEndpointInfo, sourceImageUrlFromProp = param.sourceImageUrlFromProp, _param_targetPhotosFromDrive = param.targetPhotosFromDrive, targetPhotosFromDrive = _param_targetPhotosFromDrive === void 0 ? [] : _param_targetPhotosFromDrive, preloadedImageBlobs = param.preloadedImageBlobs, userId = param.userId, updateSinglePhotoMetadata // Add new prop
     = param.updateSinglePhotoMetadata;
    console.log('[BatchCompareForm top level] Initial sourceImageUrlFromProp:', sourceImageUrlFromProp, 'Target photos from Drive:', targetPhotosFromDrive.length, 'Preloaded blobs available:', (preloadedImageBlobs === null || preloadedImageBlobs === void 0 ? void 0 : preloadedImageBlobs.size) || 0);
    var _useState = _sliced_to_array(useState(false), 2), internalIsLoading = _useState[0], setInternalIsLoading = _useState[1];
    var _useState1 = _sliced_to_array(useState(0), 2), progressPercent = _useState1[0], setProgressPercent = _useState1[1]; // New state for progress
    var _useState2 = _sliced_to_array(useState(false), 2), isPreparingTargets = _useState2[0], setIsPreparingTargets = _useState2[1];
    var _useState3 = _sliced_to_array(useState(null), 2), sourceFile = _useState3[0], setSourceFile = _useState3[1];
    var _useState4 = _sliced_to_array(useState(false), 2), isSourceSetByProp = _useState4[0], setIsSourceSetByProp = _useState4[1];
    var _useState5 = _sliced_to_array(useState([]), 2), targetFiles = _useState5[0], setTargetFiles = _useState5[1]; // Will store File objects from Drive photos
    var _useState6 = _sliced_to_array(useState(null), 2), sourcePreviewUrl = _useState6[0], setSourcePreviewUrl = _useState6[1];
    var _useState7 = _sliced_to_array(useState(null), 2), sourceImageDimensions = _useState7[0], setSourceImageDimensions = _useState7[1];
    var _useState8 = _sliced_to_array(useState([]), 2), targetPreviewUrls = _useState8[0], setTargetPreviewUrls = _useState8[1]; // Stores blob URLs for previews (still used by results carousel)
    var _useState9 = _sliced_to_array(useState([]), 2), targetImageDimensionsList = _useState9[0], setTargetImageDimensionsList = _useState9[1];
    var _useState10 = _sliced_to_array(useState(null), 2), batchCompareResult = _useState10[0], setBatchCompareResult = _useState10[1];
    var _useState11 = _sliced_to_array(useState(0), 2), currentDisplayIndex = _useState11[0], setCurrentDisplayIndex = _useState11[1]; // For results carousel
    var _useState12 = _sliced_to_array(useState([]), 2), displayableTargetImages = _useState12[0], setDisplayableTargetImages = _useState12[1]; // For new input target carousel
    // Auto-scroll refs
    var progressBarRef = useAutoScroll([
        internalIsLoading && progressPercent < 100
    ]); // Scroll when progress bar is active
    var resultsSectionRef = useAutoScroll([
        batchCompareResult
    ]); // Scroll when results are populated
    // Effect to process targetPhotosFromDrive into File objects and previews
    useEffect(function() {
        var processDrivePhotos = /*#__PURE__*/ function() {
            var _ref = _async_to_generator(function() {
                var newTargetFiles, newTargetPreviewUrlsData, newDisplayableItems, newTargetImageDimensionsListData, hasOverallError, i, photo, photoIdentifier, blob, fileTypeFromMeta, fileExtension, finalMimeType, subtype, subtype1, fileName, currentExt, file, previewUrl, err;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            if (!targetPhotosFromDrive || targetPhotosFromDrive.length === 0) {
                                setTargetFiles([]);
                                // Revoke old preview URLs from displayableTargetImages if they exist
                                displayableTargetImages.forEach(function(img) {
                                    if (img.previewUrl && img.previewUrl.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl);
                                });
                                setDisplayableTargetImages([]);
                                // targetPreviewUrls cleanup is handled by its own effect/logic if still needed elsewhere
                                setTargetPreviewUrls([]); // Clear this too, though displayableTargetImages is primary for new carousel
                                setTargetImageDimensionsList([]);
                                setBatchCompareResult(null);
                                setCurrentDisplayIndex(0);
                                return [
                                    2
                                ];
                            }
                            console.log('[BatchCompareForm] Processing target photos from Drive prop:', targetPhotosFromDrive.length);
                            setIsPreparingTargets(true);
                            if (onError) onError(null);
                            setBatchCompareResult(null);
                            // Revoke previous blob URLs from displayableTargetImages before creating new ones
                            displayableTargetImages.forEach(function(img) {
                                if (img.previewUrl && img.previewUrl.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl);
                            });
                            newTargetFiles = [];
                            newTargetPreviewUrlsData = []; // For the results carousel's memoizedMatchingData
                            newDisplayableItems = [];
                            newTargetImageDimensionsListData = new Array(targetPhotosFromDrive.length).fill(null);
                            hasOverallError = false;
                            i = 0;
                            _state.label = 1;
                        case 1:
                            if (!(i < targetPhotosFromDrive.length)) return [
                                3,
                                8
                            ];
                            photo = targetPhotosFromDrive[i];
                            photoIdentifier = photo.name || photo.id || "image-".concat(i);
                            if (!photo || !photo.id) {
                                console.warn('[BatchCompareForm] Skipping invalid photo object from Drive:', photo);
                                newDisplayableItems.push({
                                    id: "error-drive-photo-".concat(i),
                                    previewUrl: null,
                                    name: photoIdentifier,
                                    hasError: true,
                                    errorMessage: 'Invalid photo data from Drive.'
                                });
                                newTargetPreviewUrlsData.push(null); // Keep consistent length for other logic
                                // Not adding to newTargetFiles as it's not a valid file for submission
                                return [
                                    3,
                                    7
                                ];
                            }
                            _state.label = 2;
                        case 2:
                            _state.trys.push([
                                2,
                                6,
                                ,
                                7
                            ]);
                            blob = void 0;
                            if (!(preloadedImageBlobs && preloadedImageBlobs.has(photo.id))) return [
                                3,
                                3
                            ];
                            blob = preloadedImageBlobs.get(photo.id);
                            return [
                                3,
                                5
                            ];
                        case 3:
                            return [
                                4,
                                fetchImageBlob(photo.id)
                            ];
                        case 4:
                            blob = _state.sent();
                            _state.label = 5;
                        case 5:
                            fileTypeFromMeta = photo.mimeType;
                            fileExtension = 'jpg';
                            finalMimeType = blob.type;
                            if (fileTypeFromMeta && fileTypeFromMeta.startsWith('image/')) {
                                finalMimeType = fileTypeFromMeta;
                                subtype = fileTypeFromMeta.split('/')[1];
                                if (subtype) fileExtension = subtype.toLowerCase() === 'jpeg' ? 'jpg' : subtype.toLowerCase();
                            } else if (blob.type && blob.type.startsWith('image/')) {
                                subtype1 = blob.type.split('/')[1];
                                if (subtype1) fileExtension = subtype1.toLowerCase() === 'jpeg' ? 'jpg' : subtype1.toLowerCase();
                            }
                            fileName = photo.name;
                            if (!fileName || !fileName.includes('.')) {
                                fileName = "drive_image_".concat(photo.id, ".").concat(fileExtension);
                            } else {
                                currentExt = fileName.split('.').pop().toLowerCase();
                                if (![
                                    'jpg',
                                    'jpeg',
                                    'png',
                                    'gif'
                                ].includes(currentExt)) {
                                    fileName = "".concat(fileName.substring(0, fileName.lastIndexOf('.') || fileName.length), ".").concat(fileExtension);
                                }
                            }
                            file = new File([
                                blob
                            ], fileName, {
                                type: finalMimeType
                            });
                            newTargetFiles.push(file);
                            previewUrl = URL.createObjectURL(blob);
                            newTargetPreviewUrlsData.push(previewUrl); // For results carousel logic
                            newDisplayableItems.push({
                                id: photo.id,
                                previewUrl: previewUrl,
                                name: file.name,
                                hasError: false
                            });
                            return [
                                3,
                                7
                            ];
                        case 6:
                            err = _state.sent();
                            console.error("[BatchCompareForm] Failed to fetch/process Drive photo ".concat(photo.id, " (name: ").concat(photo.name, "):"), err);
                            newTargetFiles.push({
                                name: photoIdentifier,
                                error: err.message || 'Failed to load'
                            }); // Keep for submit logic
                            newTargetPreviewUrlsData.push(null); // For results carousel logic
                            newDisplayableItems.push({
                                id: photo.id,
                                previewUrl: null,
                                name: photoIdentifier,
                                hasError: true,
                                errorMessage: err.message || 'Failed to load this image.'
                            });
                            if (onError && !hasOverallError) {
                                onError('Failed to load one or more target images. First error on "'.concat(photoIdentifier, '".'));
                                hasOverallError = true;
                            }
                            return [
                                3,
                                7
                            ];
                        case 7:
                            i++;
                            return [
                                3,
                                1
                            ];
                        case 8:
                            setTargetFiles(newTargetFiles);
                            setTargetPreviewUrls(newTargetPreviewUrlsData); // Update this for results carousel
                            setDisplayableTargetImages(newDisplayableItems);
                            setTargetImageDimensionsList(newTargetImageDimensionsListData);
                            setIsPreparingTargets(false);
                            console.log('[BatchCompareForm] Finished processing Drive photos. Displayable items:', newDisplayableItems.length);
                            return [
                                2
                            ];
                    }
                });
            });
            return function processDrivePhotos() {
                return _ref.apply(this, arguments);
            };
        }();
        processDrivePhotos();
        // Cleanup for blob URLs in displayableTargetImages
        return function() {
            displayableTargetImages.forEach(function(img) {
                if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(img.previewUrl);
                }
            });
        };
    }, [
        targetPhotosFromDrive,
        preloadedImageBlobs,
        onError
    ]);
    var handleBatchCompareSubmit = useCallback(/*#__PURE__*/ function() {
        var _ref = _async_to_generator(function(event) {
            var validTargetFiles, allResults, overallErrorOccurred, i, targetFileOrError, progress, targetFile, formData, ensureImageMimeType, processedSourceFile, processedTargetFile, result, err, apiAttemptedResults, apiErrors, err1;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        event.preventDefault();
                        // Filter out any files that had loading errors
                        validTargetFiles = targetFiles.filter(function(file) {
                            return _instanceof(file, File);
                        });
                        if (!sourceFile || validTargetFiles.length === 0) {
                            if (onError) onError(isPreparingTargets ? 'Target images are still loading...' : 'Please select a source image and ensure target images are loaded from Drive.');
                            return [
                                2
                            ];
                        }
                        if (onError) onError(null);
                        setBatchCompareResult(null);
                        setCurrentDisplayIndex(0);
                        setInternalIsLoading(true);
                        setProgressPercent(0);
                        allResults = [];
                        overallErrorOccurred = false;
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            11,
                            12,
                            13
                        ]);
                        console.log('[BatchCompareForm] Starting incremental batch comparison.');
                        console.log('  Source File Details:', {
                            name: sourceFile.name,
                            type: sourceFile.type,
                            size: sourceFile.size
                        });
                        console.log("  Total Target Files to process: ".concat(targetFiles.length, " (valid: ").concat(validTargetFiles.length, ")"));
                        i = 0;
                        _state.label = 2;
                    case 2:
                        if (!(i < targetFiles.length)) return [
                            3,
                            10
                        ];
                        targetFileOrError = targetFiles[i];
                        progress = (i + 1) / targetFiles.length * 100;
                        if (!_instanceof(targetFileOrError, File)) return [
                            3,
                            7
                        ];
                        targetFile = targetFileOrError;
                        console.log("[BatchCompareForm] Processing target ".concat(i + 1, "/").concat(targetFiles.length, ": ").concat(targetFile.name));
                        _state.label = 3;
                    case 3:
                        _state.trys.push([
                            3,
                            5,
                            ,
                            6
                        ]);
                        formData = new FormData();
                        // Helper to ensure a file has an image MIME type
                        ensureImageMimeType = function(file) {
                            var defaultMimeType = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'image/jpeg';
                            if (file.type && file.type.startsWith('image/')) {
                                return file;
                            }
                            console.warn('[BatchCompareForm] Overriding MIME type for file "'.concat(file.name, '". Original type: "').concat(file.type, '". New type: "').concat(defaultMimeType, '".'));
                            return new File([
                                file
                            ], file.name, {
                                type: defaultMimeType,
                                lastModified: file.lastModified
                            });
                        };
                        processedSourceFile = ensureImageMimeType(sourceFile);
                        processedTargetFile = ensureImageMimeType(targetFile);
                        formData.append('source', processedSourceFile);
                        formData.append('target', processedTargetFile);
                        return [
                            4,
                            faceApiService.compareFacesWithApi(formData)
                        ];
                    case 4:
                        result = _state.sent();
                        allResults.push(_object_spread({
                            targetFileName: targetFile.name
                        }, result));
                        return [
                            3,
                            6
                        ];
                    case 5:
                        err = _state.sent();
                        console.error("[BatchCompareForm] Error comparing with target ".concat(targetFile.name, ":"), err);
                        allResults.push({
                            targetFileName: targetFile.name,
                            error: err.message || 'Failed to compare',
                            rejected: false
                        }); // rejected:false means API call was attempted
                        if (onError && !overallErrorOccurred) {
                            // onError(`Comparison error for "${targetFile.name}": ${err.message}. Other comparisons may proceed.`);
                            // Delaying global error message until the end.
                            overallErrorOccurred = true;
                        }
                        return [
                            3,
                            6
                        ];
                    case 6:
                        return [
                            3,
                            8
                        ];
                    case 7:
                        // This was a file that failed to load initially (during processDrivePhotos)
                        console.warn("[BatchCompareForm] Skipping pre-failed target ".concat(i + 1, "/").concat(targetFiles.length, ": ").concat(targetFileOrError.name));
                        allResults.push({
                            targetFileName: targetFileOrError.name,
                            error: targetFileOrError.error || 'Failed to load this target image',
                            rejected: true,
                            SourceImageFace: null,
                            FaceMatches: [],
                            UnmatchedFaces: []
                        });
                        _state.label = 8;
                    case 8:
                        setProgressPercent(progress);
                        _state.label = 9;
                    case 9:
                        i++;
                        return [
                            3,
                            2
                        ];
                    case 10:
                        setProgressPercent(100);
                        setBatchCompareResult(allResults);
                        if (onResults) onResults(allResults, false);
                        // Post-processing error reporting
                        apiAttemptedResults = allResults.filter(function(res) {
                            return !res.rejected;
                        });
                        apiErrors = apiAttemptedResults.filter(function(res) {
                            return res.error;
                        });
                        if (apiErrors.length === apiAttemptedResults.length && apiAttemptedResults.length > 0) {
                            if (onError) onError("All ".concat(apiAttemptedResults.length, ' image comparisons failed API processing. First error on "').concat(apiErrors[0].targetFileName, '": ').concat(apiErrors[0].error));
                        } else if (apiErrors.length > 0) {
                            console.warn("[BatchCompareForm] ".concat(apiErrors.length, ' image(s) had processing issues during API comparison. These errors are noted in the individual image results. First such issue on "').concat(apiErrors[0].targetFileName, '": ').concat(apiErrors[0].error));
                        // Optionally, set a less severe global error if many (but not all) failed.
                        // if (onError) onError(`${apiErrors.length} of ${apiAttemptedResults.length} comparisons had issues. Check individual results.`);
                        } else if (allResults.length > 0 && allResults.every(function(res) {
                            return res.rejected;
                        })) {
                            if (onError) onError("All ".concat(allResults.length, " target images failed to load and could not be processed."));
                        }
                        return [
                            3,
                            13
                        ];
                    case 11:
                        err1 = _state.sent();
                        console.error('[BatchCompareForm] Unexpected error during batch compare submission:', err1);
                        if (onError) onError(err1.message || 'An unexpected error occurred during batch comparison.');
                        if (onResults) onResults([], false); // Send empty results
                        setBatchCompareResult([]);
                        setProgressPercent(0);
                        return [
                            3,
                            13
                        ];
                    case 12:
                        setInternalIsLoading(false);
                        return [
                            7
                        ];
                    case 13:
                        return [
                            2
                        ];
                }
            });
        });
        return function(event) {
            return _ref.apply(this, arguments);
        };
    }(), [
        sourceFile,
        targetFiles,
        onResults,
        onError,
        isPreparingTargets
    ]);
    // const memoizedBatchSourceFaceDetails = useMemo(() => {
    //   // Source face details are assumed to be consistent across all batch results for the single source image.
    //   // We look at the first item in batchCompareResult if available.
    //   if (batchCompareResult && batchCompareResult.length > 0 && batchCompareResult[0] && batchCompareResult[0].SourceImageFace && batchCompareResult[0].SourceImageFace.BoundingBox) {
    //     return [batchCompareResult[0].SourceImageFace]; // DetectionBoundingBoxes expects an array
    //   }
    //   return [];
    // }, [batchCompareResult]);
    // Memoize the filtered list of matching images and their related data
    var memoizedMatchingData = useMemo(function() {
        if (!batchCompareResult || batchCompareResult.length === 0) {
            return {
                results: [],
                previewUrls: [],
                files: [],
                dimensions: [],
                originalIndices: []
            };
        }
        // Filter out rejected items
        var filtered = batchCompareResult.reduce(function(acc, resultItem, originalIndex) {
            if (resultItem && !resultItem.rejected && resultItem.FaceMatches && resultItem.FaceMatches.length > 0) {
                acc.results.push(resultItem);
                if (targetPreviewUrls && targetPreviewUrls[originalIndex]) {
                    acc.previewUrls.push(targetPreviewUrls[originalIndex]);
                }
                if (targetFiles && targetFiles[originalIndex]) {
                    acc.files.push(targetFiles[originalIndex]);
                }
                acc.dimensions.push(targetImageDimensionsList[originalIndex] || null);
                acc.originalIndices.push(originalIndex);
            }
            return acc;
        }, {
            results: [],
            previewUrls: [],
            files: [],
            dimensions: [],
            originalIndices: []
        });
        // Basic validation for mismatched lengths, could indicate an issue in data handling
        if (filtered.results.length !== filtered.previewUrls.length || filtered.results.length !== filtered.files.length || filtered.results.length !== filtered.dimensions.length) {
            console.warn('[BatchCompareForm] Mismatch in filtered data lengths. Results:', filtered.results.length, 'Previews:', filtered.previewUrls.length, 'Files:', filtered.files.length, 'Dimensions:', filtered.dimensions.length);
        // Consider returning empty or partially valid data if critical for stability
        }
        return filtered;
    }, [
        batchCompareResult,
        targetPreviewUrls,
        targetFiles,
        targetImageDimensionsList
    ]);
    useEffect(function() {
        console.log('[BatchCompareForm useEffect sourceImageUrlFromProp] Prop value:', sourceImageUrlFromProp, 'isSourceSetByProp currently:', isSourceSetByProp, 'Current time:', new Date().toLocaleTimeString());
        var fetchAndSetSourceImage = /*#__PURE__*/ function() {
            var _ref = _async_to_generator(function() {
                var filename, urlPath, segments, response, blob, file, err;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            console.log('[BatchCompareForm fetchAndSetSourceImage] Starting fetch. Current sourceFile:', sourceFile, 'isSourceSetByProp:', isSourceSetByProp, 'Current time:', new Date().toLocaleTimeString());
                            if (sourcePreviewUrl && isSourceSetByProp) {
                                URL.revokeObjectURL(sourcePreviewUrl);
                            }
                            setSourcePreviewUrl(null);
                            setSourceFile(null);
                            setSourceImageDimensions(null);
                            setBatchCompareResult(null);
                            if (onError) onError(null);
                            setInternalIsLoading(true);
                            _state.label = 1;
                        case 1:
                            _state.trys.push([
                                1,
                                4,
                                5,
                                6
                            ]);
                            filename = "profile_source_image.jpg";
                            try {
                                urlPath = new URL(sourceImageUrlFromProp).pathname;
                                segments = urlPath.split('/');
                                if (segments.length > 0 && segments[segments.length - 1]) {
                                    filename = segments[segments.length - 1];
                                }
                            } catch (e) {
                                console.warn("[BatchCompareForm] Could not parse filename from sourceImageUrlFromProp, using default.");
                            }
                            return [
                                4,
                                fetch(sourceImageUrlFromProp)
                            ];
                        case 2:
                            response = _state.sent();
                            if (!response.ok) {
                                throw new Error("Failed to fetch source image from URL: ".concat(response.status, " ").concat(response.statusText));
                            }
                            return [
                                4,
                                response.blob()
                            ];
                        case 3:
                            blob = _state.sent();
                            if (!blob.type.startsWith('image/')) {
                                throw new Error("Fetched content is not an image. MIME type: ".concat(blob.type));
                            }
                            file = new File([
                                blob
                            ], filename, {
                                type: blob.type
                            });
                            setSourceFile(file);
                            console.log('[BatchCompareForm fetchAndSetSourceImage] Source file set:', file, 'Current time:', new Date().toLocaleTimeString());
                            setSourcePreviewUrl(URL.createObjectURL(blob));
                            console.log('[BatchCompareForm fetchAndSetSourceImage] Source preview URL set.', 'Current time:', new Date().toLocaleTimeString());
                            setIsSourceSetByProp(true);
                            console.log('[BatchCompareForm fetchAndSetSourceImage] isSourceSetByProp set to true.', 'Current time:', new Date().toLocaleTimeString());
                            return [
                                3,
                                6
                            ];
                        case 4:
                            err = _state.sent();
                            console.error("[BatchCompareForm fetchAndSetSourceImage] Error in fetch:", err, 'Current time:', new Date().toLocaleTimeString());
                            if (onError) onError("Failed to load profile image as source: ".concat(err.message));
                            setSourceFile(null);
                            setSourcePreviewUrl(null);
                            setSourceImageDimensions(null);
                            setIsSourceSetByProp(false);
                            return [
                                3,
                                6
                            ];
                        case 5:
                            setInternalIsLoading(false);
                            return [
                                7
                            ];
                        case 6:
                            return [
                                2
                            ];
                    }
                });
            });
            return function fetchAndSetSourceImage() {
                return _ref.apply(this, arguments);
            };
        }();
        if (sourceImageUrlFromProp) {
            fetchAndSetSourceImage();
        } else {
            console.log('[BatchCompareForm useEffect sourceImageUrlFromProp] Prop is falsy. isSourceSetByProp was:', isSourceSetByProp, 'Current time:', new Date().toLocaleTimeString());
            if (isSourceSetByProp) {
                if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
                setSourcePreviewUrl(null);
                setSourceFile(null);
                setSourceImageDimensions(null);
                setBatchCompareResult(null);
                setIsSourceSetByProp(false);
                console.log('[BatchCompareForm useEffect sourceImageUrlFromProp] Cleared prop-set source. isSourceSetByProp set to false.', 'Current time:', new Date().toLocaleTimeString());
                if (onError) onError(null);
            }
        }
    }, [
        sourceImageUrlFromProp
    ]); // Effect dependencies
    useEffect(function() {
        // General cleanup for sourcePreviewUrl, regardless of how it was set
        var currentSourceUrl = sourcePreviewUrl;
        return function() {
            if (currentSourceUrl) {
                URL.revokeObjectURL(currentSourceUrl);
            }
        };
    }, [
        sourcePreviewUrl
    ]); // Runs when sourcePreviewUrl itself changes
    // useEffect(() => { // This cleanup is now part of the processDrivePhotos effect.
    //   const currentTargetUrlsToRevoke = [...targetPreviewUrls];
    //   return () => {
    //     currentTargetUrlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    //   };
    // }, [targetPreviewUrls]);
    var handleSourceFileChange = function(event) {
        setIsSourceSetByProp(false); // Manual selection, so not from prop
        var file = event.target.files[0];
        setSourceFile(file);
        setBatchCompareResult(null);
        if (onError) onError(null);
        setSourceImageDimensions(null);
        // sourcePreviewUrl will be updated by its own effect if already set, or a new one created
        // No, direct update is better here for immediate feedback
        if (sourcePreviewUrl) {
            URL.revokeObjectURL(sourcePreviewUrl);
        }
        if (file) {
            setSourcePreviewUrl(URL.createObjectURL(file));
        } else {
            setSourcePreviewUrl(null);
        }
    };
    // const handleTargetFilesChange = (event) => { // This is no longer needed as targets come from props
    //   const files = Array.from(event.target.files);
    //   setTargetFiles(files);
    //   setBatchCompareResult(null);
    //   if (onError) onError(null);
    //   targetPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    //   setCurrentDisplayIndex(0); 
    //   if (files.length > 0) {
    //     const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    //     setTargetPreviewUrls(newPreviewUrls);
    //     setTargetImageDimensionsList(new Array(files.length).fill(null));
    //   } else {
    //     setTargetPreviewUrls([]);
    //     setTargetImageDimensionsList([]);
    //   }
    // };
    // Original handleSubmit is removed and replaced by handleBatchCompareSubmit above.
    // The form's onSubmit will now call handleBatchCompareSubmit.
    var handlePrevImage = function() {
        setCurrentDisplayIndex(function(prev) {
            return Math.max(0, prev - 1);
        });
    };
    var handleNextImage = function() {
        // Use memoizedMatchingData for length check
        setCurrentDisplayIndex(function(prev) {
            return Math.min(memoizedMatchingData.previewUrls.length - 1, prev + 1);
        });
    };
    var handleRejectImage = function() {
        if (memoizedMatchingData.results.length === 0 || currentDisplayIndex < 0 || currentDisplayIndex >= memoizedMatchingData.results.length) {
            return; // No image to reject or index out of bounds
        }
        var originalIndexToReject = memoizedMatchingData.originalIndices[currentDisplayIndex];
        // Create a new array for batchCompareResult to trigger re-render and memoization
        var updatedResults = batchCompareResult.map(function(result, index) {
            if (index === originalIndexToReject) {
                return _object_spread_props(_object_spread({}, result), {
                    rejected: true
                });
            }
            return result;
        });
        setBatchCompareResult(updatedResults);
        if (onResults) onResults(updatedResults); // Notify parent about the change
        // Determine the new currentDisplayIndex based on what memoizedMatchingData *will* become.
        // Simulate the filtering that memoizedMatchingData does on the updatedResults.
        var newFilteredResultsLength = updatedResults.filter(function(resultItem) {
            return resultItem && !resultItem.rejected && resultItem.FaceMatches && resultItem.FaceMatches.length > 0;
        }).length;
        if (newFilteredResultsLength === 0) {
            setCurrentDisplayIndex(0); // No matching non-rejected images left
        } else {
            // Adjust currentDisplayIndex to be within the bounds of the new filtered list.
            // If the current item was removed (and it wasn't the only item),
            // this ensures the index points to a valid item (often the one that shifted into its place)
            // or the new last item if the original was the last.
            setCurrentDisplayIndex(function(prevIndex) {
                return Math.min(prevIndex, newFilteredResultsLength - 1);
            });
        }
    };
    var handleDownloadCurrentImage = function(file, previewUrl) {
        if (!file || !previewUrl) {
            console.error("Download error: File or URL is missing for the current image.");
            if (onError) onError("Could not download the image. File data is missing.");
            return;
        }
        var link = document.createElement('a');
        link.href = previewUrl;
        link.download = file.name || "target-image-".concat(currentDisplayIndex + 1, ".jpg"); // Fallback name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    var handleConfirmAllMatches = /*#__PURE__*/ function() {
        var _ref = _async_to_generator(function() {
            var successfulUpdates, failedUpdates, i, originalIndex, photo, updatedPhoto, err;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!userId) {
                            console.error("[BatchCompareForm] Cannot confirm matches: userId is missing.");
                            if (onError) onError("User information is missing, cannot confirm photos.");
                            return [
                                2
                            ];
                        }
                        if (!memoizedMatchingData || memoizedMatchingData.results.length === 0) {
                            console.warn("[BatchCompareForm] No matches to confirm.");
                            return [
                                2
                            ];
                        }
                        setInternalIsLoading(true); // Indicate processing
                        if (onError) onError(null); // Clear previous errors
                        console.log("[BatchCompareForm] User ".concat(userId, " is confirming ").concat(memoizedMatchingData.results.length, " matched photos. Attempting to update 'photoOf'."));
                        successfulUpdates = 0;
                        failedUpdates = 0;
                        i = 0;
                        _state.label = 1;
                    case 1:
                        if (!(i < memoizedMatchingData.originalIndices.length)) return [
                            3,
                            8
                        ];
                        originalIndex = memoizedMatchingData.originalIndices[i];
                        photo = targetPhotosFromDrive[originalIndex];
                        if (!(photo && photo.id)) return [
                            3,
                            6
                        ];
                        _state.label = 2;
                    case 2:
                        _state.trys.push([
                            2,
                            4,
                            ,
                            5
                        ]);
                        console.log("  - Updating photoOf for Photo ID: ".concat(photo.id, " to User ID: ").concat(userId, "."));
                        return [
                            4,
                            photosService.updatePhotoSubject(photo.id, userId)
                        ];
                    case 3:
                        updatedPhoto = _state.sent();
                        console.log("    Successfully updated photoOf for ".concat(photo.id, "."));
                        successfulUpdates++;
                        if (updatedPhoto && updateSinglePhotoMetadata) {
                            console.log("    Calling updateSinglePhotoMetadata for ".concat(updatedPhoto.drive_file_id, "."));
                            updateSinglePhotoMetadata(updatedPhoto);
                        } else if (!updatedPhoto) {
                            console.warn("    photoService.updatePhotoSubject for ".concat(photo.id, " did not return updated photo data. UI state for this photo might not refresh immediately."));
                        }
                        return [
                            3,
                            5
                        ];
                    case 4:
                        err = _state.sent();
                        console.error("    Failed to update photoOf for ".concat(photo.id, ":"), err);
                        failedUpdates++;
                        // Optionally, report the first error to the UI
                        if (onError && failedUpdates === 1) {
                            onError('Failed to update "'.concat(photo.name || photo.id, '" as a photo of you. Other updates may continue. Error: ').concat(err.message));
                        }
                        return [
                            3,
                            5
                        ];
                    case 5:
                        return [
                            3,
                            7
                        ];
                    case 6:
                        console.warn("  - Could not update photoOf at originalIndex ".concat(originalIndex, ", missing photo data or ID."));
                        failedUpdates++; // Count this as a failure for reporting
                        _state.label = 7;
                    case 7:
                        i++;
                        return [
                            3,
                            1
                        ];
                    case 8:
                        setInternalIsLoading(false);
                        console.log("[BatchCompareForm] Finished updating 'photoOf' for all confirmed matches. Successful: ".concat(successfulUpdates, ", Failed: ").concat(failedUpdates, "."));
                        if (failedUpdates > 0 && successfulUpdates === 0) {
                            // If all failed, keep the modal open and show the last error (or first if reported earlier)
                            if (onError && !onError) {
                                onError("Could not update 'photo of you' for any of the ".concat(memoizedMatchingData.results.length, " photos. Please check logs."));
                            }
                        // Do not close if all failed, let user see error.
                        } else {
                            if (failedUpdates > 0 && onError) {
                            // If some failed, the error for the first one is already set.
                            // We might add a more general "Some updates failed" message or rely on the first error shown.
                            // For now, we'll close, assuming the first error gave enough info.
                            }
                            // Close the modal if at least one update was successful, or if there were no updates to attempt.
                            // The `onResults` callback isn't strictly necessary here unless the parent needs to react
                            // to the confirmation itself, beyond just the form closing.
                            onClose();
                        }
                        return [
                            2
                        ];
                }
            });
        });
        return function handleConfirmAllMatches() {
            return _ref.apply(this, arguments);
        };
    }();
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "modal-overlay",
        children: /*#__PURE__*/ _jsxDEV("div", {
            className: "modal-content",
            style: {
                maxWidth: '700px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            },
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-header",
                    children: [
                        /*#__PURE__*/ _jsxDEV("h2", {
                            className: "modal-title-container",
                            children: title
                        }, void 0, false, {
                            fileName: "BatchCompareForm.jsx",
                            lineNumber: 520,
                            columnNumber: 9
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("button", {
                            type: "button",
                            className: "modal-close-button",
                            onClick: onClose,
                            "aria-label": "Close",
                            children: "\xd7"
                        }, void 0, false, {
                            fileName: "BatchCompareForm.jsx",
                            lineNumber: 521,
                            columnNumber: 9
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "BatchCompareForm.jsx",
                    lineNumber: 519,
                    columnNumber: 7
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-body",
                    style: {
                        flexGrow: 1,
                        overflowY: 'auto'
                    },
                    children: [
                        /*#__PURE__*/ _jsxDEV("form", {
                            id: "batchCompareFormExternal",
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem'
                            },
                            onSubmit: handleBatchCompareSubmit,
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "batch-source-target-wrapper",
                                    children: [
                                        " ",
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "batch-compare-section",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("h3", {
                                                    className: "batch-compare-section-title",
                                                    children: "Photo of You"
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 535,
                                                    columnNumber: 15
                                                }, _this),
                                                !isSourceSetByProp ? // Manual selection mode
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "file-input-batch-wrapper",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "file-input-batch-control",
                                                            children: [
                                                                " ",
                                                                /*#__PURE__*/ _jsxDEV("label", {
                                                                    htmlFor: "batchCompareSourceImageExternal",
                                                                    className: "file-input-batch-button",
                                                                    children: sourcePreviewUrl ? "Change Source File" : "Choose Source File"
                                                                }, void 0, false, {
                                                                    fileName: "BatchCompareForm.jsx",
                                                                    lineNumber: 541,
                                                                    columnNumber: 21
                                                                }, _this),
                                                                !sourcePreviewUrl && /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "file-input-batch-text",
                                                                    children: sourceFile ? sourceFile.name : 'No file selected'
                                                                }, void 0, false, {
                                                                    fileName: "BatchCompareForm.jsx",
                                                                    lineNumber: 545,
                                                                    columnNumber: 23
                                                                }, _this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "BatchCompareForm.jsx",
                                                            lineNumber: 540,
                                                            columnNumber: 19
                                                        }, _this),
                                                        /*#__PURE__*/ _jsxDEV("input", {
                                                            type: "file",
                                                            id: "batchCompareSourceImageExternal",
                                                            accept: "image/*",
                                                            onChange: handleSourceFileChange,
                                                            style: {
                                                                display: 'none'
                                                            },
                                                            required: !sourceFile,
                                                            disabled: internalIsLoading
                                                        }, void 0, false, {
                                                            fileName: "BatchCompareForm.jsx",
                                                            lineNumber: 551,
                                                            columnNumber: 19
                                                        }, _this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 539,
                                                    columnNumber: 17
                                                }, _this) : // Prop selection mode
                                                // Show loading/error message ONLY if no preview is available yet
                                                !sourcePreviewUrl && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "file-input-batch-wrapper",
                                                    children: /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "file-input-batch-control",
                                                        style: {
                                                            justifyContent: 'center'
                                                        },
                                                        children: /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "file-input-batch-text",
                                                            style: {
                                                                fontStyle: 'italic',
                                                                textAlign: 'center'
                                                            },
                                                            children: internalIsLoading ? 'Loading profile image...' : sourceFile ? sourceFile.name : 'Failed to load profile image.'
                                                        }, void 0, false, {
                                                            fileName: "BatchCompareForm.jsx",
                                                            lineNumber: 567,
                                                            columnNumber: 23
                                                        }, _this)
                                                    }, void 0, false, {
                                                        fileName: "BatchCompareForm.jsx",
                                                        lineNumber: 566,
                                                        columnNumber: 21
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 565,
                                                    columnNumber: 19
                                                }, _this),
                                                sourcePreviewUrl && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "batch-image-preview-container",
                                                    style: {
                                                        marginTop: isSourceSetByProp && sourcePreviewUrl ? '0' : '1rem'
                                                    },
                                                    children: /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "batch-source-preview",
                                                        children: /*#__PURE__*/ _jsxDEV("img", {
                                                            src: sourcePreviewUrl,
                                                            alt: "Batch Compare Source Preview",
                                                            onLoad: function(e) {
                                                                setSourceImageDimensions({
                                                                    width: e.target.offsetWidth,
                                                                    height: e.target.offsetHeight,
                                                                    offsetX: 0,
                                                                    offsetY: 0
                                                                });
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "BatchCompareForm.jsx",
                                                            lineNumber: 582,
                                                            columnNumber: 21
                                                        }, _this)
                                                    }, void 0, false, {
                                                        fileName: "BatchCompareForm.jsx",
                                                        lineNumber: 581,
                                                        columnNumber: 19
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 577,
                                                    columnNumber: 17
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "BatchCompareForm.jsx",
                                            lineNumber: 534,
                                            columnNumber: 13
                                        }, _this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "batch-compare-section target-image-preview-outer-section",
                                            children: /*#__PURE__*/ _jsxDEV(ImageCarousel, {
                                                images: displayableTargetImages,
                                                isLoading: isPreparingTargets,
                                                carouselTitle: "Your Photos",
                                                noItemsMessage: targetPhotosFromDrive && targetPhotosFromDrive.length > 0 ? "All target images failed to load from Drive. Check console for details." : "No target images provided from Drive.",
                                                renderImageDetails: function(image) {
                                                    return /*#__PURE__*/ _jsxDEV("div", {
                                                        style: {
                                                            marginTop: '0.5rem',
                                                            fontSize: '0.85rem',
                                                            color: image.hasError ? 'var(--error-color)' : 'inherit',
                                                            padding: '0 8px'
                                                        },
                                                        children: image.hasError && /*#__PURE__*/ _jsxDEV("p", {
                                                            style: {
                                                                margin: '4px 0 0',
                                                                fontStyle: 'italic'
                                                            },
                                                            children: image.errorMessage || 'Failed to load'
                                                        }, void 0, false, {
                                                            fileName: "BatchCompareForm.jsx",
                                                            lineNumber: 616,
                                                            columnNumber: 40
                                                        }, void 0)
                                                    }, void 0, false, {
                                                        fileName: "BatchCompareForm.jsx",
                                                        lineNumber: 614,
                                                        columnNumber: 19
                                                    }, void 0);
                                                },
                                                className: "target-previews-input-carousel"
                                            }, void 0, false, {
                                                fileName: "BatchCompareForm.jsx",
                                                lineNumber: 604,
                                                columnNumber: 15
                                            }, _this)
                                        }, void 0, false, {
                                            fileName: "BatchCompareForm.jsx",
                                            lineNumber: 603,
                                            columnNumber: 13
                                        }, _this)
                                    ]
                                }, void 0, true, {
                                    fileName: "BatchCompareForm.jsx",
                                    lineNumber: 532,
                                    columnNumber: 11
                                }, _this),
                                " ",
                                /*#__PURE__*/ _jsxDEV("button", {
                                    type: "submit",
                                    className: "button-primary",
                                    disabled: internalIsLoading || isPreparingTargets || !sourceFile || targetFiles.filter(function(f) {
                                        return _instanceof(f, File);
                                    }).length === 0,
                                    style: {
                                        marginTop: '0.5rem',
                                        width: '100%',
                                        maxWidth: '400px',
                                        display: 'block',
                                        marginLeft: 'auto',
                                        marginRight: 'auto'
                                    },
                                    children: internalIsLoading ? 'Comparing...' : isPreparingTargets ? 'Preparing Targets...' : 'Find Photos of You'
                                }, void 0, false, {
                                    fileName: "BatchCompareForm.jsx",
                                    lineNumber: 623,
                                    columnNumber: 11
                                }, _this),
                                internalIsLoading && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "progress-bar-container",
                                    ref: progressBarRef,
                                    children: /*#__PURE__*/ _jsxDEV("div", {
                                        className: "progress-bar-fill",
                                        style: {
                                            width: "".concat(progressPercent, "%")
                                        },
                                        role: "progressbar",
                                        "aria-valuenow": progressPercent,
                                        "aria-valuemin": "0",
                                        "aria-valuemax": "100"
                                    }, void 0, false, {
                                        fileName: "BatchCompareForm.jsx",
                                        lineNumber: 634,
                                        columnNumber: 15
                                    }, _this)
                                }, void 0, false, {
                                    fileName: "BatchCompareForm.jsx",
                                    lineNumber: 633,
                                    columnNumber: 13
                                }, _this),
                                memoizedMatchingData.previewUrls.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "batch-compare-section batch-results-preview-section",
                                    style: {
                                        marginTop: '2rem'
                                    },
                                    ref: resultsSectionRef,
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("h3", {
                                            className: "batch-compare-section-title",
                                            children: "Matching Images"
                                        }, void 0, false, {
                                            fileName: "BatchCompareForm.jsx",
                                            lineNumber: 648,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "image-carousel-container",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    type: "button",
                                                    className: "carousel-arrow prev",
                                                    onClick: handlePrevImage,
                                                    disabled: currentDisplayIndex === 0,
                                                    "aria-label": "Previous image",
                                                    children: /*#__PURE__*/ _jsxDEV("img", {
                                                        src: "https://play.rosebud.ai/assets/arrow-left.png?Kh8c",
                                                        alt: "Previous"
                                                    }, void 0, false, {
                                                        fileName: "BatchCompareForm.jsx",
                                                        lineNumber: 657,
                                                        columnNumber: 21
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 650,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "carousel-image-placeholder",
                                                    children: memoizedMatchingData.previewUrls[currentDisplayIndex] ? function() {
                                                        var currentMatchingResult = memoizedMatchingData.results[currentDisplayIndex];
                                                        var currentMatchingFile = memoizedMatchingData.files[currentDisplayIndex];
                                                        var currentMatchingDimension = memoizedMatchingData.dimensions[currentDisplayIndex];
                                                        var currentOriginalIndex = memoizedMatchingData.originalIndices[currentDisplayIndex];
                                                        return /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                            children: /*#__PURE__*/ _jsxDEV("img", {
                                                                src: memoizedMatchingData.previewUrls[currentDisplayIndex],
                                                                alt: "Matching Target ".concat(currentDisplayIndex + 1, ": ").concat((currentMatchingFile === null || currentMatchingFile === void 0 ? void 0 : currentMatchingFile.name) || ''),
                                                                onLoad: function(e) {
                                                                    if (typeof currentOriginalIndex === 'number') {
                                                                        var img = e.target;
                                                                        var naturalWidth = img.naturalWidth;
                                                                        var naturalHeight = img.naturalHeight;
                                                                        var containerWidth = img.offsetWidth;
                                                                        var containerHeight = img.offsetHeight;
                                                                        var displayWidth = containerWidth;
                                                                        var displayHeight = containerHeight;
                                                                        var offsetX = 0;
                                                                        var offsetY = 0;
                                                                        if (naturalWidth > 0 && naturalHeight > 0) {
                                                                            var naturalAspectRatio = naturalWidth / naturalHeight;
                                                                            var containerAspectRatio = containerWidth / containerHeight;
                                                                            if (naturalAspectRatio > containerAspectRatio) {
                                                                                // Image is wider than container, letterboxed top/bottom
                                                                                displayWidth = containerWidth;
                                                                                displayHeight = containerWidth / naturalAspectRatio;
                                                                                offsetY = (containerHeight - displayHeight) / 2;
                                                                            } else {
                                                                                // Image is taller or same aspect, letterboxed left/right
                                                                                displayHeight = containerHeight;
                                                                                displayWidth = containerHeight * naturalAspectRatio;
                                                                                offsetX = (containerWidth - displayWidth) / 2;
                                                                            }
                                                                        } else {
                                                                            // If natural dimensions are zero, use container dimensions with no offset
                                                                            // This might not be perfect but prevents errors.
                                                                            displayWidth = containerWidth;
                                                                            displayHeight = containerHeight;
                                                                        }
                                                                        var newFullDimensionsList = _to_consumable_array(targetImageDimensionsList);
                                                                        newFullDimensionsList[currentOriginalIndex] = {
                                                                            width: displayWidth,
                                                                            height: displayHeight,
                                                                            offsetX: offsetX,
                                                                            offsetY: offsetY
                                                                        };
                                                                        setTargetImageDimensionsList(newFullDimensionsList);
                                                                    }
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "BatchCompareForm.jsx",
                                                                lineNumber: 668,
                                                                columnNumber: 27
                                                            }, _this)
                                                        }, void 0, false);
                                                    }() : /*#__PURE__*/ _jsxDEV("span", {
                                                        children: "Loading image..."
                                                    }, void 0, false, {
                                                        fileName: "BatchCompareForm.jsx",
                                                        lineNumber: 732,
                                                        columnNumber: 23
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 660,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    type: "button",
                                                    className: "carousel-arrow next",
                                                    onClick: handleNextImage,
                                                    disabled: currentDisplayIndex >= memoizedMatchingData.previewUrls.length - 1 || memoizedMatchingData.previewUrls.length === 0,
                                                    "aria-label": "Next image",
                                                    children: /*#__PURE__*/ _jsxDEV("img", {
                                                        src: "https://play.rosebud.ai/assets/arrow-right.png?GrbO",
                                                        alt: "Next"
                                                    }, void 0, false, {
                                                        fileName: "BatchCompareForm.jsx",
                                                        lineNumber: 742,
                                                        columnNumber: 21
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 735,
                                                    columnNumber: 19
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "BatchCompareForm.jsx",
                                            lineNumber: 649,
                                            columnNumber: 17
                                        }, _this),
                                        memoizedMatchingData.previewUrls.length > 0 && memoizedMatchingData.previewUrls[currentDisplayIndex] && memoizedMatchingData.files[currentDisplayIndex] && /*#__PURE__*/ _jsxDEV("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: '1rem',
                                                marginTop: '1rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    type: "button",
                                                    onClick: function() {
                                                        return handleDownloadCurrentImage(memoizedMatchingData.files[currentDisplayIndex], memoizedMatchingData.previewUrls[currentDisplayIndex]);
                                                    },
                                                    className: "button-secondary",
                                                    children: "Download"
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 747,
                                                    columnNumber: 21
                                                }, _this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    type: "button",
                                                    onClick: handleRejectImage,
                                                    className: "button-secondary",
                                                    style: {
                                                        backgroundColor: 'var(--error-color)',
                                                        color: 'var(--secondary-color)'
                                                    },
                                                    children: "Reject"
                                                }, void 0, false, {
                                                    fileName: "BatchCompareForm.jsx",
                                                    lineNumber: 754,
                                                    columnNumber: 21
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "BatchCompareForm.jsx",
                                            lineNumber: 746,
                                            columnNumber: 19
                                        }, _this),
                                        memoizedMatchingData.results.length > 0 && userId && /*#__PURE__*/ _jsxDEV("div", {
                                            style: {
                                                textAlign: 'center',
                                                marginTop: '1.5rem',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid var(--border-color)'
                                            },
                                            children: /*#__PURE__*/ _jsxDEV("button", {
                                                type: "button",
                                                className: "button-primary",
                                                onClick: handleConfirmAllMatches,
                                                style: {
                                                    padding: '10px 20px',
                                                    fontSize: '1rem'
                                                },
                                                disabled: internalIsLoading || isPreparingTargets,
                                                children: [
                                                    "Confirm All ",
                                                    memoizedMatchingData.results.length,
                                                    " Displayed Matches"
                                                ]
                                            }, void 0, true, {
                                                fileName: "BatchCompareForm.jsx",
                                                lineNumber: 767,
                                                columnNumber: 21
                                            }, _this)
                                        }, void 0, false, {
                                            fileName: "BatchCompareForm.jsx",
                                            lineNumber: 766,
                                            columnNumber: 19
                                        }, _this)
                                    ]
                                }, void 0, true, {
                                    fileName: "BatchCompareForm.jsx",
                                    lineNumber: 647,
                                    columnNumber: 15
                                }, _this),
                                memoizedMatchingData.previewUrls.length === 0 && batchCompareResult && batchCompareResult.length > 0 && !internalIsLoading && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "batch-compare-section batch-results-preview-section",
                                    style: {
                                        marginTop: '2rem',
                                        textAlign: 'center'
                                    },
                                    ref: resultsSectionRef,
                                    children: /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "batch-compare-section-title",
                                        children: "All matching images have been processed or rejected."
                                    }, void 0, false, {
                                        fileName: "BatchCompareForm.jsx",
                                        lineNumber: 782,
                                        columnNumber: 19
                                    }, _this)
                                }, void 0, false, {
                                    fileName: "BatchCompareForm.jsx",
                                    lineNumber: 781,
                                    columnNumber: 16
                                }, _this)
                            ]
                        }, void 0, true, {
                            fileName: "BatchCompareForm.jsx",
                            lineNumber: 531,
                            columnNumber: 9
                        }, _this),
                        externalErrorToDisplay && /*#__PURE__*/ _jsxDEV("div", {
                            className: "error-message",
                            style: {
                                marginTop: '1rem',
                                color: 'var(--error-color)',
                                borderTop: '1px solid var(--border-color)',
                                paddingTop: '1rem'
                            },
                            children: [
                                /*#__PURE__*/ _jsxDEV("strong", {
                                    children: "Error:"
                                }, void 0, false, {
                                    fileName: "BatchCompareForm.jsx",
                                    lineNumber: 788,
                                    columnNumber: 13
                                }, _this),
                                " ",
                                externalErrorToDisplay
                            ]
                        }, void 0, true, {
                            fileName: "BatchCompareForm.jsx",
                            lineNumber: 787,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "BatchCompareForm.jsx",
                    lineNumber: 530,
                    columnNumber: 7
                }, _this)
            ]
        }, void 0, true, {
            fileName: "BatchCompareForm.jsx",
            lineNumber: 518,
            columnNumber: 5
        }, _this)
    }, void 0, false, {
        fileName: "BatchCompareForm.jsx",
        lineNumber: 517,
        columnNumber: 3
    }, _this);
};
export default BatchCompareForm;
