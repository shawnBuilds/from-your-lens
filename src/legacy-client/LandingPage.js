var _this = this;
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
import React from 'react';
import AuthButton from './AuthButton.js'; // Import the new AuthButton component
import LandingGalleryCard from './LandingGalleryCard.js';
// onNavigateToAuth prop is no longer needed if auth is handled directly
var LandingPage = function(param) {
    var onAuthSuccess = param.onAuthSuccess;
    // Removed handleAddMyPhotos and handleRequestPhotos as they are replaced by direct auth
    var galleryImages = [
        {
            id: 'gallery-3',
            src: "https://play.rosebud.ai/assets/jules-3-v3.jpg.png?6xGJ",
            alt: "Travel moment photo",
            friendPfp: "https://play.rosebud.ai/assets/friend-3-pfp-v2.png?RfB4",
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
            id: 'gallery-1',
            src: "https://play.rosebud.ai/assets/jules-01.jpg?P9o9",
            alt: "Scenic adventure photo",
            friendPfp: "https://play.rosebud.ai/assets/friend-1-p4-v2.png?43Aq",
            userPfp: 'https://rosebud.ai/assets/jules-pfp.jpg?zlHT'
        }
    ];
    var howItWorksSteps = [
        {
            iconUrl: 'https://play.rosebud.ai/assets/icon-invite.png?4HL1',
            text: 'Invite a friend'
        },
        {
            iconUrl: 'https://rosebud.ai/assets/icon-share.png?3ynl',
            text: /*#__PURE__*/ _jsxDEV(_Fragment, {
                children: [
                    "They share photos ",
                    /*#__PURE__*/ _jsxDEV("strong", {
                        children: "fast"
                    }, void 0, false, {
                        fileName: "LandingPage.jsx",
                        lineNumber: 14,
                        columnNumber: 91
                    }, _this)
                ]
            }, void 0, true)
        },
        {
            iconUrl: 'https://rosebud.ai/assets/icon-image-add.png?wXV4',
            text: /*#__PURE__*/ _jsxDEV(_Fragment, {
                children: [
                    "Get the ",
                    /*#__PURE__*/ _jsxDEV("strong", {
                        children: "photos of you"
                    }, void 0, false, {
                        fileName: "LandingPage.jsx",
                        lineNumber: 15,
                        columnNumber: 85
                    }, _this)
                ]
            }, void 0, true)
        }
    ];
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "landing-page-container",
        children: /*#__PURE__*/ _jsxDEV("div", {
            className: "landing-page-content",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "landing-text-content",
                    children: [
                        /*#__PURE__*/ _jsxDEV("h1", {
                            className: "landing-title",
                            children: "From Your Lens"
                        }, void 0, false, {
                            fileName: "LandingPage.jsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "landing-subtitle",
                            children: [
                                /*#__PURE__*/ _jsxDEV("strong", {
                                    children: "Collect photos"
                                }, void 0, false, {
                                    fileName: "LandingPage.jsx",
                                    lineNumber: 23,
                                    columnNumber: 13
                                }, _this),
                                " from friends and ",
                                /*#__PURE__*/ _jsxDEV("strong", {
                                    children: "share your own"
                                }, void 0, false, {
                                    fileName: "LandingPage.jsx",
                                    lineNumber: 23,
                                    columnNumber: 62
                                }, _this),
                                ", all in ",
                                /*#__PURE__*/ _jsxDEV("strong", {
                                    children: "one place"
                                }, void 0, false, {
                                    fileName: "LandingPage.jsx",
                                    lineNumber: 23,
                                    columnNumber: 102
                                }, _this),
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "LandingPage.jsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "landing-gallery-content",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "landing-mini-gallery",
                        children: galleryImages.map(function(image, index) {
                            return /*#__PURE__*/ _jsxDEV(LandingGalleryCard, {
                                image: image,
                                index: index
                            }, image.id, false, {
                                fileName: "LandingPage.jsx",
                                lineNumber: 29,
                                columnNumber: 15
                            }, _this);
                        })
                    }, void 0, false, {
                        fileName: "LandingPage.jsx",
                        lineNumber: 27,
                        columnNumber: 11
                    }, _this)
                }, void 0, false, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "landing-steps-content",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "how-it-works-section",
                            children: howItWorksSteps.map(function(step, index) {
                                return /*#__PURE__*/ _jsxDEV("div", {
                                    className: "how-it-works-step",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("img", {
                                            src: step.iconUrl,
                                            alt: "",
                                            className: "how-it-works-icon"
                                        }, void 0, false, {
                                            fileName: "LandingPage.jsx",
                                            lineNumber: 37,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "how-it-works-text",
                                            children: step.text
                                        }, void 0, false, {
                                            fileName: "LandingPage.jsx",
                                            lineNumber: 38,
                                            columnNumber: 17
                                        }, _this)
                                    ]
                                }, index, true, {
                                    fileName: "LandingPage.jsx",
                                    lineNumber: 36,
                                    columnNumber: 15
                                }, _this);
                            })
                        }, void 0, false, {
                            fileName: "LandingPage.jsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "landing-actions",
                            children: /*#__PURE__*/ _jsxDEV(AuthButton, {
                                onAuthSuccess: onAuthSuccess
                            }, void 0, false, {
                                fileName: "LandingPage.jsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, _this)
                        }, void 0, false, {
                            fileName: "LandingPage.jsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "LandingPage.jsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, _this)
            ]
        }, void 0, true, {
            fileName: "LandingPage.jsx",
            lineNumber: 19,
            columnNumber: 7
        }, _this)
    }, void 0, false, {
        fileName: "LandingPage.jsx",
        lineNumber: 18,
        columnNumber: 5
    }, _this);
};
export default LandingPage;
