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
import React, { useState, useEffect } from 'react';
import { AuthService } from './AuthService.js';
import { ENABLE_SKIP_AUTH_FLOW } from './constants.js';
import SkipAuthModal from './SkipAuthModal.js';
var AUTH_ICON_URL = "https://rosebud.ai/assets/google_icon.webp?phu5";
var AuthButton = function(param) {
    var onAuthSuccess = param.onAuthSuccess, _param_className = param.className, className = _param_className === void 0 ? "landing-button primary icloud-auth-button" : _param_className, children = param.children;
    var _useState = _sliced_to_array(useState(false), 2), showSkipModal = _useState[0], setShowSkipModal = _useState[1];
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
    var openAuthPopup = function() {
        var windowName = 'authPopup';
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
    var handleClick = function() {
        if (ENABLE_SKIP_AUTH_FLOW) {
            setShowSkipModal(true);
        } else {
            openAuthPopup();
        }
    };
    var handleSkipConfirm = function() {
        setShowSkipModal(false);
        if (onAuthSuccess) {
            onAuthSuccess({
                isSkipped: true
            }); // Pass a flag to indicate skip
        }
    };
    var handleSkipCancel = function() {
        setShowSkipModal(false);
        openAuthPopup();
    };
    return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: [
            /*#__PURE__*/ _jsxDEV("button", {
                onClick: handleClick,
                className: className,
                children: [
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: AUTH_ICON_URL,
                        alt: "Google icon",
                        className: "auth-icon-img"
                    }, void 0, false, {
                        fileName: "AuthButton.jsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, _this),
                    children || /*#__PURE__*/ _jsxDEV("span", {
                        children: "Continue with Google"
                    }, void 0, false, {
                        fileName: "AuthButton.jsx",
                        lineNumber: 64,
                        columnNumber: 22
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "AuthButton.jsx",
                lineNumber: 59,
                columnNumber: 7
            }, _this),
            showSkipModal && /*#__PURE__*/ _jsxDEV(SkipAuthModal, {
                onConfirm: handleSkipConfirm,
                onCancel: handleSkipCancel,
                onClose: function() {
                    return setShowSkipModal(false);
                }
            }, void 0, false, {
                fileName: "AuthButton.jsx",
                lineNumber: 67,
                columnNumber: 9
            }, _this)
        ]
    }, void 0, true);
};
export default AuthButton;
