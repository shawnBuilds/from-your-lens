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
import React, { useState, useEffect, useMemo } from 'react';
var ImageCarousel = function(param) {
    var _param_images = param.images, images = _param_images === void 0 ? [] : _param_images, _param_isLoading = param.isLoading, isLoading = _param_isLoading === void 0 ? false : _param_isLoading, onImageLoad = param.onImageLoad, renderImageDetails = param.renderImageDetails, _param_noItemsMessage = param.noItemsMessage, noItemsMessage = _param_noItemsMessage === void 0 ? "No images to display." : _param_noItemsMessage, itemActions = param.itemActions, carouselTitle = param.carouselTitle, _param_className = param.className, className = _param_className === void 0 ? "" : _param_className, onIndexChange // Callback when index changes: (newIndex) => void
     = param.onIndexChange;
    var _useState = _sliced_to_array(useState(0), 2), currentIndex = _useState[0], setCurrentIndex = _useState[1];
    useEffect(function() {
        if (images.length > 0 && currentIndex >= images.length) {
            setCurrentIndex(images.length - 1);
        } else if (images.length === 0 && currentIndex !== 0) {
            setCurrentIndex(0);
        }
    }, [
        images,
        currentIndex
    ]);
    useEffect(function() {
        if (onIndexChange) {
            onIndexChange(currentIndex);
        }
    }, [
        currentIndex,
        onIndexChange
    ]);
    var handlePrev = function() {
        setCurrentIndex(function(prev) {
            return Math.max(0, prev - 1);
        });
    };
    var handleNext = function() {
        setCurrentIndex(function(prev) {
            return Math.min(images.length - 1, prev + 1);
        });
    };
    var currentImage = useMemo(function() {
        return images[currentIndex];
    }, [
        images,
        currentIndex
    ]);
    if (isLoading) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "image-carousel-root ".concat(className),
            children: [
                carouselTitle && /*#__PURE__*/ _jsxDEV("h3", {
                    className: "batch-compare-section-title",
                    children: [
                        carouselTitle,
                        " (Loading...)"
                    ]
                }, void 0, true, {
                    fileName: "ImageCarousel.jsx",
                    lineNumber: 42,
                    columnNumber: 27
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "image-carousel-container",
                    style: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '200px'
                    },
                    children: /*#__PURE__*/ _jsxDEV("p", {
                        children: "Loading images..."
                    }, void 0, false, {
                        fileName: "ImageCarousel.jsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, _this)
                }, void 0, false, {
                    fileName: "ImageCarousel.jsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, _this)
            ]
        }, void 0, true, {
            fileName: "ImageCarousel.jsx",
            lineNumber: 41,
            columnNumber: 7
        }, _this);
    }
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "image-carousel-root ".concat(className),
        children: [
            carouselTitle && !isLoading && /*#__PURE__*/ _jsxDEV("h3", {
                className: "batch-compare-section-title",
                children: carouselTitle
            }, void 0, false, {
                fileName: "ImageCarousel.jsx",
                lineNumber: 51,
                columnNumber: 39
            }, _this),
            images.length === 0 && !isLoading && /*#__PURE__*/ _jsxDEV("div", {
                className: "image-carousel-container",
                style: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px'
                },
                children: /*#__PURE__*/ _jsxDEV("p", {
                    children: noItemsMessage
                }, void 0, false, {
                    fileName: "ImageCarousel.jsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, _this)
            }, void 0, false, {
                fileName: "ImageCarousel.jsx",
                lineNumber: 54,
                columnNumber: 10
            }, _this),
            images.length > 0 && !isLoading && /*#__PURE__*/ _jsxDEV(_Fragment, {
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "image-carousel-container",
                        children: [
                            /*#__PURE__*/ _jsxDEV("button", {
                                type: "button",
                                className: "carousel-arrow prev",
                                onClick: handlePrev,
                                disabled: currentIndex === 0,
                                "aria-label": "Previous image",
                                children: /*#__PURE__*/ _jsxDEV("img", {
                                    src: "https://play.rosebud.ai/assets/arrow-left.png?Kh8c",
                                    alt: "Previous"
                                }, void 0, false, {
                                    fileName: "ImageCarousel.jsx",
                                    lineNumber: 69,
                                    columnNumber: 15
                                }, _this)
                            }, void 0, false, {
                                fileName: "ImageCarousel.jsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, _this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "carousel-image-placeholder",
                                children: currentImage && currentImage.previewUrl ? /*#__PURE__*/ _jsxDEV("img", {
                                    src: currentImage.previewUrl,
                                    alt: currentImage.name || "Image ".concat(currentIndex + 1),
                                    onLoad: function(e) {
                                        if (onImageLoad) {
                                            onImageLoad(e, currentIndex, currentImage.id);
                                        }
                                    },
                                    style: currentImage.hasError ? {
                                        filter: 'grayscale(100%) opacity(0.5)'
                                    } : {}
                                }, void 0, false, {
                                    fileName: "ImageCarousel.jsx",
                                    lineNumber: 74,
                                    columnNumber: 17
                                }, _this) : /*#__PURE__*/ _jsxDEV("span", {
                                    children: currentImage && currentImage.hasError ? "Error loading preview" : "Preview not available"
                                }, void 0, false, {
                                    fileName: "ImageCarousel.jsx",
                                    lineNumber: 85,
                                    columnNumber: 17
                                }, _this)
                            }, void 0, false, {
                                fileName: "ImageCarousel.jsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, _this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                type: "button",
                                className: "carousel-arrow next",
                                onClick: handleNext,
                                disabled: currentIndex >= images.length - 1 || images.length === 0,
                                "aria-label": "Next image",
                                children: /*#__PURE__*/ _jsxDEV("img", {
                                    src: "https://play.rosebud.ai/assets/arrow-right.png?GrbO",
                                    alt: "Next"
                                }, void 0, false, {
                                    fileName: "ImageCarousel.jsx",
                                    lineNumber: 96,
                                    columnNumber: 15
                                }, _this)
                            }, void 0, false, {
                                fileName: "ImageCarousel.jsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "ImageCarousel.jsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, _this),
                    currentImage && renderImageDetails && /*#__PURE__*/ _jsxDEV("div", {
                        className: "carousel-image-details",
                        style: {
                            textAlign: 'center',
                            marginTop: '0.5rem',
                            fontSize: '0.9rem'
                        },
                        children: renderImageDetails(currentImage, currentIndex)
                    }, void 0, false, {
                        fileName: "ImageCarousel.jsx",
                        lineNumber: 100,
                        columnNumber: 13
                    }, _this),
                    currentImage && itemActions && /*#__PURE__*/ _jsxDEV("div", {
                        className: "carousel-item-actions",
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem',
                            marginTop: '1rem'
                        },
                        children: itemActions(currentImage, currentIndex)
                    }, void 0, false, {
                        fileName: "ImageCarousel.jsx",
                        lineNumber: 105,
                        columnNumber: 13
                    }, _this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "ImageCarousel.jsx",
        lineNumber: 50,
        columnNumber: 5
    }, _this);
};
export default ImageCarousel;
