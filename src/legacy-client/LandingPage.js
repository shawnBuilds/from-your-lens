var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React from 'react';
import AuthButton from './AuthButton.js'; // Import the new AuthButton component
import LandingGalleryCard from './LandingGalleryCard.js';
// onNavigateToAuth prop is no longer needed if auth is handled directly
var LandingPage = function(param) {
    var onAuthSuccess = param.onAuthSuccess;
    // Removed handleAddMyPhotos and handleRequestPhotos as they are replaced by direct auth
    var galleryImages = [
        {
            id: 'gallery-1',
            src: "https://play.rosebud.ai/assets/jules-01.jpg?P9o9",
            alt: "Scenic adventure photo",
            friendPfp: "https://play.rosebud.ai/assets/friend-1-p4-v2.png?43Aq",
            userPfp: 'https://rosebud.ai/assets/jules-pfp.jpg?zlHT'
        },
        {
            id: 'gallery-2',
            src: "https://play.rosebud.ai/assets/jules-02.jpg?8JqA",
            alt: "Group fun photo",
            friendPfp: "https://play.rosebud.ai/assets/friend-2-v2.png?itRQ",
            userPfp: 'https://rosebud.ai/assets/jules-pfp.jpg?zlHT'
        },
        {
            id: 'gallery-3',
            src: "https://play.rosebud.ai/assets/jules-3-v3.jpg.png?6xGJ",
            alt: "Travel moment photo",
            friendPfp: "https://play.rosebud.ai/assets/friend-3-pfp-v2.png?RfB4",
            userPfp: 'https://rosebud.ai/assets/jules-pfp.jpg?zlHT'
        }
    ];
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "landing-page-container",
        children: /*#__PURE__*/ _jsxDEV("div", {
            className: "landing-page-content",
            children: [
                /*#__PURE__*/ _jsxDEV("h1", {
                    className: "landing-title",
                    children: "FromYourLens"
                }, void 0, false, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("p", {
                    className: "landing-subtitle",
                    children: "Collect photos from friends and share your own, all in one place."
                }, void 0, false, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "landing-actions",
                    children: /*#__PURE__*/ _jsxDEV(AuthButton, {
                        onAuthSuccess: onAuthSuccess
                    }, void 0, false, {
                        fileName: "LandingPage.jsx",
                        lineNumber: 20,
                        columnNumber: 11
                    }, _this)
                }, void 0, false, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "landing-mini-gallery",
                    children: galleryImages.map(function(image, index) {
                        return /*#__PURE__*/ _jsxDEV(LandingGalleryCard, {
                            image: image,
                            index: index
                        }, image.id, false, {
                            fileName: "LandingPage.jsx",
                            lineNumber: 24,
                            columnNumber: 13
                        }, _this);
                    })
                }, void 0, false, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, _this)
            ]
        }, void 0, true, {
            fileName: "LandingPage.jsx",
            lineNumber: 14,
            columnNumber: 7
        }, _this)
    }, void 0, false, {
        fileName: "LandingPage.jsx",
        lineNumber: 13,
        columnNumber: 5
    }, _this);
};
export default LandingPage;
