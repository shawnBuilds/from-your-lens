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
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React, { useState } from 'react';
import { ICON_URLS } from './constants.js'; // Import the icon URLs
var TAB_OPTIONS = {
    MY_DRIVE: "My Drive",
    PHOTOS_OF_YOU: "Photos of You"
};
// Added style prop to accept inline styles for visibility control
var Tabs = function(param) {
    var onComparePhotosClick = param.onComparePhotosClick, onTabChange = param.onTabChange, style = param.style;
    var _useState = _sliced_to_array(useState(TAB_OPTIONS.MY_DRIVE), 2), activeTab = _useState[0], setActiveTab = _useState[1];
    var handleTabClick = function(tabName) {
        setActiveTab(tabName);
        if (onTabChange) {
            onTabChange(tabName);
        }
    };
    return(// Apply the passed-in style to the main container
    /*#__PURE__*/ _jsxDEV("div", {
        className: "tabs-container",
        style: style,
        children: [
            /*#__PURE__*/ _jsxDEV("button", {
                className: "tab-button ".concat(activeTab === TAB_OPTIONS.MY_DRIVE ? 'active' : ''),
                onClick: function() {
                    return handleTabClick(TAB_OPTIONS.MY_DRIVE);
                },
                children: [
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: ICON_URLS.MY_DRIVE,
                        alt: "My Drive",
                        className: "tab-icon"
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("span", {
                        children: TAB_OPTIONS.MY_DRIVE
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "Tabs.jsx",
                lineNumber: 19,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV("button", {
                className: "tab-button ".concat(activeTab === TAB_OPTIONS.PHOTOS_OF_YOU ? 'active' : ''),
                onClick: function() {
                    return handleTabClick(TAB_OPTIONS.PHOTOS_OF_YOU);
                },
                children: [
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: ICON_URLS.PHOTOS_OF_YOU,
                        alt: "Photos of You",
                        className: "tab-icon"
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("span", {
                        children: TAB_OPTIONS.PHOTOS_OF_YOU
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "Tabs.jsx",
                lineNumber: 26,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV("button", {
                className: "tab-button",
                onClick: onComparePhotosClick,
                children: [
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: ICON_URLS.FIND_PHOTOS,
                        alt: "Find photos of me",
                        className: "tab-icon"
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("span", {
                        children: "Find photos of me"
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "Tabs.jsx",
                lineNumber: 33,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV("button", {
                className: "tab-button",
                onClick: onComparePhotosClick,
                children: [
                    /*#__PURE__*/ _jsxDEV("img", {
                        src: ICON_URLS.SEND_PHOTOS,
                        alt: "Send photos to a friend",
                        className: "tab-icon"
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("span", {
                        children: "Send photos to a friend"
                    }, void 0, false, {
                        fileName: "Tabs.jsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "Tabs.jsx",
                lineNumber: 40,
                columnNumber: 7
            }, _this)
        ]
    }, void 0, true, {
        fileName: "Tabs.jsx",
        lineNumber: 18,
        columnNumber: 5
    }, _this));
};
export { Tabs as default, TAB_OPTIONS };
