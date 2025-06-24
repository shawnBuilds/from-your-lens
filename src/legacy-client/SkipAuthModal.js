var _this = this;
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React from 'react';
var SkipAuthModal = function(param) {
    var onConfirm = param.onConfirm, onCancel = param.onCancel, onClose = param.onClose;
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "modal-overlay",
        children: /*#__PURE__*/ _jsxDEV("div", {
            className: "modal-content",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-header",
                    children: [
                        /*#__PURE__*/ _jsxDEV("h2", {
                            className: "modal-title",
                            children: "Development Mode"
                        }, void 0, false, {
                            fileName: "SkipAuthModal.jsx",
                            lineNumber: 8,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: onClose,
                            className: "modal-close-button",
                            children: "\xd7"
                        }, void 0, false, {
                            fileName: "SkipAuthModal.jsx",
                            lineNumber: 9,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "SkipAuthModal.jsx",
                    lineNumber: 7,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-body",
                    children: /*#__PURE__*/ _jsxDEV("p", {
                        children: "Use test data instead of logging in?"
                    }, void 0, false, {
                        fileName: "SkipAuthModal.jsx",
                        lineNumber: 12,
                        columnNumber: 11
                    }, _this)
                }, void 0, false, {
                    fileName: "SkipAuthModal.jsx",
                    lineNumber: 11,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-actions modal-actions-center",
                    children: [
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: onCancel,
                            className: "button-secondary",
                            children: "No, Log In"
                        }, void 0, false, {
                            fileName: "SkipAuthModal.jsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: onConfirm,
                            className: "button-primary",
                            children: "Yes, Use Test Data"
                        }, void 0, false, {
                            fileName: "SkipAuthModal.jsx",
                            lineNumber: 18,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "SkipAuthModal.jsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, _this)
            ]
        }, void 0, true, {
            fileName: "SkipAuthModal.jsx",
            lineNumber: 6,
            columnNumber: 7
        }, _this)
    }, void 0, false, {
        fileName: "SkipAuthModal.jsx",
        lineNumber: 5,
        columnNumber: 5
    }, _this);
};
export default SkipAuthModal;
