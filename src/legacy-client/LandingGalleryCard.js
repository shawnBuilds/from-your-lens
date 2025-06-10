var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React from 'react';
import { PROFILE_PIC_URL } from './constants.js';
var LandingGalleryCard = function(param) {
    var image = param.image, index = param.index;
    var animationDelayBase = 0.3; // Base delay in seconds
    var animationDelayIncrement = 0.7; // Increment per card in seconds
    var calculatedDelay = "".concat(animationDelayBase + index * animationDelayIncrement, "s");
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "landing-gallery-item",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "landing-gallery-image-wrapper",
                children: [
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: image.src,
                        alt: image.alt,
                        className: "landing-gallery-image"
                    }, void 0, false, {
                        fileName: "LandingGalleryCard.jsx",
                        lineNumber: 10,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: "https://play.rosebud.ai/assets/arrow-white.png?EJbv",
                        alt: "Transfer arrow",
                        className: "transfer-arrow-img fade-in-on-load",
                        style: {
                            animationDelay: calculatedDelay
                        }
                    }, void 0, false, {
                        fileName: "LandingGalleryCard.jsx",
                        lineNumber: 11,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "LandingGalleryCard.jsx",
                lineNumber: 9,
                columnNumber: 7
            }, _this),
            image.friendPfp && /*#__PURE__*/ _jsxDEV("img", {
                src: image.friendPfp,
                alt: "Friend avatar",
                className: "landing-gallery-friend-avatar"
            }, void 0, false, {
                fileName: "LandingGalleryCard.jsx",
                lineNumber: 19,
                columnNumber: 9
            }, _this),
            image.userPfp && /*#__PURE__*/ _jsxDEV("img", {
                src: image.userPfp,
                alt: "User avatar",
                className: "landing-gallery-user-avatar fade-in-on-load",
                style: {
                    animationDelay: calculatedDelay
                }
            }, void 0, false, {
                fileName: "LandingGalleryCard.jsx",
                lineNumber: 22,
                columnNumber: 9
            }, _this)
        ]
    }, image.id, true, {
        fileName: "LandingGalleryCard.jsx",
        lineNumber: 8,
        columnNumber: 5
    }, _this);
};
export default LandingGalleryCard;
