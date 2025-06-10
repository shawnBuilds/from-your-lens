var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React from 'react';
var LoadingIndicator = function(param) {
    var _param_mainText = param.mainText, mainText = _param_mainText === void 0 ? "Checking your photos..." : _param_mainText, _param_subText = param.subText, subText = _param_subText === void 0 ? "This may take a few seconds." : _param_subText;
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "loading-indicator-container",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "loading-spinner"
            }, void 0, false, {
                fileName: "LoadingIndicator.jsx",
                lineNumber: 8,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV("p", {
                className: "loading-main-text",
                children: mainText
            }, void 0, false, {
                fileName: "LoadingIndicator.jsx",
                lineNumber: 9,
                columnNumber: 7
            }, _this),
            subText && /*#__PURE__*/ _jsxDEV("p", {
                className: "loading-sub-text",
                children: subText
            }, void 0, false, {
                fileName: "LoadingIndicator.jsx",
                lineNumber: 10,
                columnNumber: 19
            }, _this)
        ]
    }, void 0, true, {
        fileName: "LoadingIndicator.jsx",
        lineNumber: 7,
        columnNumber: 5
    }, _this);
};
export default LoadingIndicator;
