function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
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
import React, { useState, useEffect, useRef } from 'react';
import { photosService } from './PhotosService.js';
import { faceApiService } from './FaceApiService.js';
import { ENABLE_FACE_DETECTION_ON_IMAGE_LOAD, SHOW_FACE_COUNT_BADGE, MOCK_PHOTOS } from './constants.js';
var PhotoItem = function(param) {
    var fileId = param.fileId, alt = param.alt, src = param.src, onImageBlobReady = param.onImageBlobReady, onImageRendered = param.onImageRendered, initialBlob = param.initialBlob;
    var isMockPhoto = MOCK_PHOTOS.some(function(p) {
        return p.id === fileId;
    });
    var _useState = _sliced_to_array(useState(isMockPhoto ? src : null), 2), imageSrc = _useState[0], setImageSrc = _useState[1];
    var imgRef = useRef(null);
    var _useState1 = _sliced_to_array(useState(!initialBlob), 2), isLoading = _useState1[0], setIsLoading = _useState1[1]; // If initialBlob, not loading initially
    var _useState2 = _sliced_to_array(useState(null), 2), error = _useState2[0], setError = _useState2[1];
    var _useState3 = _sliced_to_array(useState(null), 2), faceCount = _useState3[0], setFaceCount = _useState3[1]; // State to store the number of detected faces
    useEffect(function() {
        var objectUrl = null;
        var objectUrlToRevoke = null; // Keep track of URL created by this instance
        var loadImage = /*#__PURE__*/ function() {
            var _ref = _async_to_generator(function() {
                var response, errorDetail, errorData, e, blob, err;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            if (isMockPhoto) {
                                setIsLoading(false);
                                return [
                                    2
                                ];
                            }
                            if (!fileId) {
                                setError('No File ID provided');
                                setIsLoading(false);
                                return [
                                    2
                                ];
                            }
                            if (initialBlob) {
                                console.log("[PhotoItem ".concat(fileId, "] Using preloaded blob."));
                                try {
                                    objectUrlToRevoke = URL.createObjectURL(initialBlob);
                                    setImageSrc(objectUrlToRevoke);
                                    setIsLoading(false); // Already set, but ensure
                                // Face detection could optionally run here too if needed for preloaded
                                } catch (e) {
                                    console.error("[PhotoItem ".concat(fileId, "] Error creating object URL from preloaded blob:"), e);
                                    setError('Could not load image from cache.');
                                    setIsLoading(false);
                                }
                                return [
                                    2
                                ]; // Don't fetch if preloaded blob is used
                            }
                            // If no initialBlob, proceed to fetch
                            setIsLoading(true);
                            setError(null);
                            _state.label = 1;
                        case 1:
                            _state.trys.push([
                                1,
                                10,
                                11,
                                12
                            ]);
                            return [
                                4,
                                photosService.getFileContent(fileId)
                            ];
                        case 2:
                            response = _state.sent();
                            if (!!response.ok) return [
                                3,
                                8
                            ];
                            errorDetail = "Status: ".concat(response.status);
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
                            errorDetail = errorData.error || errorData.detail || errorDetail;
                            return [
                                3,
                                7
                            ];
                        case 5:
                            e = _state.sent();
                            return [
                                4,
                                response.text().catch(function() {
                                    return errorDetail;
                                })
                            ];
                        case 6:
                            errorDetail = _state.sent();
                            return [
                                3,
                                7
                            ];
                        case 7:
                            console.error("[PhotoItem] Error fetching file content for ".concat(fileId, ": ").concat(errorDetail));
                            throw new Error("Failed to load image. ".concat(errorDetail));
                        case 8:
                            return [
                                4,
                                response.blob()
                            ];
                        case 9:
                            blob = _state.sent();
                            if (onImageBlobReady) {
                                onImageBlobReady(fileId, blob); // Cache it at PhotosView level
                            }
                            objectUrlToRevoke = URL.createObjectURL(blob);
                            setImageSrc(objectUrlToRevoke);
                            // Face detection logic (remains the same)
                            if (ENABLE_FACE_DETECTION_ON_IMAGE_LOAD && objectUrlToRevoke) {
                                setTimeout(/*#__PURE__*/ _async_to_generator(function() {
                                    var detections, detections1, detectionError;
                                    return _ts_generator(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                _state.trys.push([
                                                    0,
                                                    5,
                                                    ,
                                                    6
                                                ]);
                                                if (!imgRef.current) return [
                                                    3,
                                                    2
                                                ];
                                                return [
                                                    4,
                                                    faceApiService.detectFaces(imgRef.current)
                                                ];
                                            case 1:
                                                detections = _state.sent();
                                                setFaceCount(detections.length);
                                                return [
                                                    3,
                                                    4
                                                ];
                                            case 2:
                                                return [
                                                    4,
                                                    faceApiService.detectFaces(objectUrlToRevoke)
                                                ];
                                            case 3:
                                                detections1 = _state.sent();
                                                setFaceCount(detections1.length);
                                                _state.label = 4;
                                            case 4:
                                                return [
                                                    3,
                                                    6
                                                ];
                                            case 5:
                                                detectionError = _state.sent();
                                                console.error("[PhotoItem ".concat(fileId, "] Error during face detection:"), detectionError);
                                                return [
                                                    3,
                                                    6
                                                ];
                                            case 6:
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                }), 100);
                            }
                            return [
                                3,
                                12
                            ];
                        case 10:
                            err = _state.sent();
                            console.error("[PhotoItem] Exception fetching file content for ".concat(fileId, ":"), err);
                            setError(err.message || 'Could not load image.');
                            return [
                                3,
                                12
                            ];
                        case 11:
                            setIsLoading(false);
                            return [
                                7
                            ];
                        case 12:
                            return [
                                2
                            ];
                    }
                });
            });
            return function loadImage() {
                return _ref.apply(this, arguments);
            };
        }();
        loadImage();
        return function() {
            if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
                console.log("[PhotoItem ".concat(fileId, "] Revoked object URL for self-created blob."));
            }
        // Note: We don't revoke URLs from `initialBlob` here,
        // as `PhotosView` (or a higher component) should manage the lifecycle of `preloadedImageBlobs`.
        // `PhotoItem` only creates and revokes URLs for blobs it fetches itself.
        };
    }, [
        fileId,
        initialBlob,
        onImageBlobReady
    ]); // Add initialBlob and onImageBlobReady
    if (isLoading) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "photo-item loading-placeholder",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "loading-spinner",
                    style: {
                        margin: 'auto'
                    }
                }, void 0, false, {
                    fileName: "PhotoItem.jsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, _this),
                " "
            ]
        }, void 0, true, {
            fileName: "PhotoItem.jsx",
            lineNumber: 101,
            columnNumber: 7
        }, _this);
    }
    if (error) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "photo-item error-placeholder",
            children: /*#__PURE__*/ _jsxDEV("p", {
                children: [
                    alt || 'Image',
                    ":",
                    /*#__PURE__*/ _jsxDEV("br", {}, void 0, false, {
                        fileName: "PhotoItem.jsx",
                        lineNumber: 111,
                        columnNumber: 29
                    }, _this),
                    error
                ]
            }, void 0, true, {
                fileName: "PhotoItem.jsx",
                lineNumber: 111,
                columnNumber: 9
            }, _this)
        }, void 0, false, {
            fileName: "PhotoItem.jsx",
            lineNumber: 110,
            columnNumber: 7
        }, _this);
    }
    if (imageSrc) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "photo-item",
            children: [
                /*#__PURE__*/ _jsxDEV("img", {
                    ref: imgRef,
                    src: imageSrc,
                    alt: alt || 'Photo',
                    className: "photo-img",
                    onLoad: function() {
                        if (onImageRendered) {
                            onImageRendered(fileId);
                        }
                    }
                }, void 0, false, {
                    fileName: "PhotoItem.jsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, _this),
                SHOW_FACE_COUNT_BADGE && typeof faceCount === 'number' && /*#__PURE__*/ _jsxDEV("div", {
                    className: "face-count-badge",
                    children: faceCount > 0 ? "".concat(faceCount, " face").concat(faceCount > 1 ? 's' : '') : 'No faces'
                }, void 0, false, {
                    fileName: "PhotoItem.jsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, _this)
            ]
        }, void 0, true, {
            fileName: "PhotoItem.jsx",
            lineNumber: 118,
            columnNumber: 7
        }, _this);
    }
    return null; // Or some other fallback if needed
};
export default PhotoItem;
