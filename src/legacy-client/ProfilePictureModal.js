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
import React, { useState, useEffect, useRef } from 'react';
var ProfilePictureModal = function(param) {
    var isOpen = param.isOpen, onClose = param.onClose, onUpload = param.onUpload, user = param.user;
    var _useState = _sliced_to_array(useState(null), 2), selectedFile = _useState[0], setSelectedFile = _useState[1];
    var _useState1 = _sliced_to_array(useState(null), 2), previewUrl = _useState1[0], setPreviewUrl = _useState1[1];
    var _useState2 = _sliced_to_array(useState(''), 2), error = _useState2[0], setError = _useState2[1];
    var fileInputRef = useRef(null);
    useEffect(function() {
        // Set initial preview to current user's profile picture if modal opens
        if (isOpen && user && user.profilePictureUrl) {
            setPreviewUrl(user.profilePictureUrl);
        }
        // Reset when modal closes or file is cleared
        if (!isOpen || !selectedFile) {
            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
            }
            if (isOpen && user && user.profilePictureUrl) {
                setPreviewUrl(user.profilePictureUrl);
            } else if (!selectedFile) {
                setPreviewUrl(null);
            }
        }
        // Cleanup object URL on component unmount or when previewUrl changes
        return function() {
            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [
        isOpen,
        selectedFile,
        user
    ]);
    var handleFileChange = function(event) {
        var file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File is too large. Maximum size is 5MB.');
                setSelectedFile(null);
                if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
                setPreviewUrl((user === null || user === void 0 ? void 0 : user.profilePictureUrl) || null); // Reset to current PFP or null
                return;
            }
            var allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif'
            ];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please select a JPG, PNG, or GIF image.');
                setSelectedFile(null);
                if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
                setPreviewUrl((user === null || user === void 0 ? void 0 : user.profilePictureUrl) || null); // Reset to current PFP or null
                return;
            }
            setError('');
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    var handleUpload = function() {
        if (selectedFile) {
            onUpload(selectedFile);
        } else {
            setError('Please select a file to upload.');
        }
    };
    var handleClose = function() {
        setSelectedFile(null);
        setError('');
        // Preview URL reset is handled by useEffect on isOpen change
        onClose();
    };
    var triggerFileInput = function() {
        fileInputRef.current.click();
    };
    if (!isOpen) {
        return null;
    }
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "modal-overlay profile-picture-modal-overlay",
        children: /*#__PURE__*/ _jsxDEV("div", {
            className: "modal-content profile-picture-modal-content",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-header",
                    children: [
                        /*#__PURE__*/ _jsxDEV("h2", {
                            children: "Update Profile Picture"
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: handleClose,
                            className: "modal-close-button",
                            children: "\xd7"
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "ProfilePictureModal.jsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-body",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "pfp-preview-container",
                            children: previewUrl ? /*#__PURE__*/ _jsxDEV("img", {
                                src: previewUrl,
                                alt: "Profile preview",
                                className: "pfp-preview-image"
                            }, void 0, false, {
                                fileName: "ProfilePictureModal.jsx",
                                lineNumber: 90,
                                columnNumber: 15
                            }, _this) : /*#__PURE__*/ _jsxDEV("div", {
                                className: "pfp-preview-placeholder",
                                children: /*#__PURE__*/ _jsxDEV("span", {
                                    children: "No Image Selected"
                                }, void 0, false, {
                                    fileName: "ProfilePictureModal.jsx",
                                    lineNumber: 93,
                                    columnNumber: 17
                                }, _this)
                            }, void 0, false, {
                                fileName: "ProfilePictureModal.jsx",
                                lineNumber: 92,
                                columnNumber: 15
                            }, _this)
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("input", {
                            type: "file",
                            accept: "image/jpeg,image/png,image/gif",
                            onChange: handleFileChange,
                            ref: fileInputRef,
                            className: "file-input-hidden",
                            id: "profilePictureInput"
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, _this),
                        error && /*#__PURE__*/ _jsxDEV("p", {
                            className: "error-message pfp-error",
                            children: error
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 110,
                            columnNumber: 21
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "ProfilePictureModal.jsx",
                    lineNumber: 87,
                    columnNumber: 9
                }, _this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "modal-actions",
                    children: [
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: triggerFileInput,
                            className: "button-secondary",
                            children: selectedFile ? 'Change File' : 'Choose File'
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, _this),
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: handleUpload,
                            className: "button-primary",
                            disabled: !selectedFile,
                            children: "Upload"
                        }, void 0, false, {
                            fileName: "ProfilePictureModal.jsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, _this)
                    ]
                }, void 0, true, {
                    fileName: "ProfilePictureModal.jsx",
                    lineNumber: 112,
                    columnNumber: 1
                }, _this)
            ]
        }, void 0, true, {
            fileName: "ProfilePictureModal.jsx",
            lineNumber: 82,
            columnNumber: 7
        }, _this)
    }, void 0, false, {
        fileName: "ProfilePictureModal.jsx",
        lineNumber: 81,
        columnNumber: 5
    }, _this);
};
export default ProfilePictureModal;
