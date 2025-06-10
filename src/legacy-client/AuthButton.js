var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect } from 'react';
import { AuthService } from './AuthService.js';
var GOOGLE_ICON_URL = "https://play.rosebud.ai/assets/google_icon.webp?phu5";
var AuthButton = function(param) {
    var onAuthSuccess = param.onAuthSuccess, _param_className = param.className, className = _param_className === void 0 ? "landing-button secondary google-auth-button" : _param_className, children = param.children;
    useEffect(function() {
        var handleMessage = function(event) {
            // TODO: Add origin check for security: if (event.origin !== BASE_API_URL or your auth provider's origin) return;
            console.log('[AuthButton] Received message:', event.data);
            var authResult = AuthService.handleGoogleAuthCallback(event.data);
            if (authResult.success) {
                console.log('[AuthButton] Authentication successful via AuthService:', authResult.user);
                if (onAuthSuccess) {
                    onAuthSuccess();
                }
            } else if (authResult.error) {
                console.error('[AuthButton] Authentication failed via AuthService:', authResult.error);
            // Optionally, display an error message to the user here
            }
        };
        window.addEventListener('message', handleMessage);
        return function() {
            return window.removeEventListener('message', handleMessage);
        };
    }, [
        onAuthSuccess
    ]);
    var openGoogleAuthPopup = function() {
        var windowName = 'googleAuthPopup';
        var popupWidth = 500;
        var popupHeight = 600;
        var screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        var screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
        var width = window.innerWidth || document.documentElement.clientWidth || window.screen.width;
        var height = window.innerHeight || document.documentElement.clientHeight || window.screen.height;
        var left = width / 2 - popupWidth / 2 + screenLeft;
        var top = height / 2 - popupHeight / 2 + screenTop;
        var windowFeatures = "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=".concat(popupWidth, ",height=").concat(popupHeight, ",top=").concat(top, ",left=").concat(left);
        var authUrl = AuthService.getGoogleAuthUrl();
        window.open(authUrl, windowName, windowFeatures);
    };
    return /*#__PURE__*/ _jsxDEV("button", {
        onClick: openGoogleAuthPopup,
        className: className,
        children: [
            /*#__PURE__*/ _jsxDEV("img", {
                src: GOOGLE_ICON_URL,
                alt: "Google G",
                className: "google-icon-img"
            }, void 0, false, {
                fileName: "AuthButton.jsx",
                lineNumber: 46,
                columnNumber: 7
            }, _this),
            children || /*#__PURE__*/ _jsxDEV("span", {
                children: "Continue with Google"
            }, void 0, false, {
                fileName: "AuthButton.jsx",
                lineNumber: 47,
                columnNumber: 20
            }, _this)
        ]
    }, void 0, true, {
        fileName: "AuthButton.jsx",
        lineNumber: 42,
        columnNumber: 5
    }, _this);
};
export default AuthButton;
