var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React from 'react';
import PhotoItem from './PhotoItem.js'; // Import the new PhotoItem component
var PhotoGallery = function(param) {
    var _param_photos = param.photos, photos = _param_photos === void 0 ? [] : _param_photos, isFetchingPhotos = param.isFetchingPhotos, fetchPhotosError = param.fetchPhotosError, loadMorePhotos = param.loadMorePhotos, hasMorePhotos = param.hasMorePhotos, onImageBlobReady = param.onImageBlobReady, onImageRendered = param.onImageRendered, preloadedImageBlobs // New prop: map of preloaded blobs
     = param.preloadedImageBlobs;
    if (isFetchingPhotos) {
        // TODO: Consider a more sophisticated loading state for the whole gallery
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "photo-gallery-container",
            children: /*#__PURE__*/ _jsxDEV("p", {
                style: {
                    textAlign: 'center',
                    padding: '20px'
                },
                children: "Loading photos..."
            }, void 0, false, {
                fileName: "PhotoGallery.jsx",
                lineNumber: 17,
                columnNumber: 9
            }, _this)
        }, void 0, false, {
            fileName: "PhotoGallery.jsx",
            lineNumber: 16,
            columnNumber: 7
        }, _this);
    }
    if (fetchPhotosError) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "photo-gallery-container",
            children: /*#__PURE__*/ _jsxDEV("p", {
                style: {
                    textAlign: 'center',
                    padding: '20px',
                    color: 'var(--error-color)'
                },
                children: [
                    "Error loading photos: ",
                    fetchPhotosError
                ]
            }, void 0, true, {
                fileName: "PhotoGallery.jsx",
                lineNumber: 24,
                columnNumber: 9
            }, _this)
        }, void 0, false, {
            fileName: "PhotoGallery.jsx",
            lineNumber: 23,
            columnNumber: 7
        }, _this);
    }
    if (photos.length === 0) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "photo-gallery-container",
            children: /*#__PURE__*/ _jsxDEV("p", {
                style: {
                    textAlign: 'center',
                    padding: '20px'
                },
                children: "No photos yet. Upload some memories!"
            }, void 0, false, {
                fileName: "PhotoGallery.jsx",
                lineNumber: 34,
                columnNumber: 9
            }, _this)
        }, void 0, false, {
            fileName: "PhotoGallery.jsx",
            lineNumber: 33,
            columnNumber: 7
        }, _this);
    }
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "photo-gallery-container",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "photo-grid",
                children: photos.map(function(photo) {
                    return /*#__PURE__*/ _jsxDEV(PhotoItem, {
                        fileId: photo.id,
                        alt: photo.alt,
                        onImageBlobReady: onImageBlobReady,
                        onImageRendered: onImageRendered,
                        // Pass down the preloaded blob if available for this photo
                        initialBlob: preloadedImageBlobs ? preloadedImageBlobs.get(photo.id) : null
                    }, photo.id, false, {
                        fileName: "PhotoGallery.jsx",
                        lineNumber: 43,
                        columnNumber: 13
                    }, _this);
                })
            }, void 0, false, {
                fileName: "PhotoGallery.jsx",
                lineNumber: 40,
                columnNumber: 7
            }, _this),
            hasMorePhotos && /*#__PURE__*/ _jsxDEV("div", {
                style: {
                    textAlign: 'center',
                    marginTop: '24px',
                    paddingBottom: '24px'
                },
                children: /*#__PURE__*/ _jsxDEV("button", {
                    onClick: loadMorePhotos,
                    className: "button-primary" // Re-use existing button style
                    ,
                    disabled: isFetchingPhotos,
                    children: isFetchingPhotos ? 'Loading...' : 'Load More Photos'
                }, void 0, false, {
                    fileName: "PhotoGallery.jsx",
                    lineNumber: 57,
                    columnNumber: 11
                }, _this)
            }, void 0, false, {
                fileName: "PhotoGallery.jsx",
                lineNumber: 56,
                columnNumber: 9
            }, _this)
        ]
    }, void 0, true, {
        fileName: "PhotoGallery.jsx",
        lineNumber: 39,
        columnNumber: 5
    }, _this);
};
export default PhotoGallery;
