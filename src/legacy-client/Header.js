function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
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
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var _this = this;
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
import React, { useState } from 'react';
import { PROFILE_PIC_URL } from './constants.js';
import ProfilePictureModal from './ProfilePictureModal.js'; // Import the modal
var Header = function(param) {
    var onLogout = param.onLogout, user = param.user, onProfilePictureUpdate = param.onProfilePictureUpdate;
    var _useState = _sliced_to_array(useState(false), 2), isPfpModalOpen = _useState[0], setIsPfpModalOpen = _useState[1];
    var profilePic = user && user.profilePictureUrl ? user.profilePictureUrl : PROFILE_PIC_URL;
    var handlePfpClick = function() {
        setIsPfpModalOpen(true);
    };
    var handleClosePfpModal = function() {
        setIsPfpModalOpen(false);
    };
    var handleUploadPfp = /*#__PURE__*/ function() {
        var _ref = _async_to_generator(function(file) {
            var dummyUpdatedUser;
            return _ts_generator(this, function(_state) {
                console.log('Header: Uploading pfp...', file.name);
                // Here, you would typically call a service to upload the file
                // For now, we'll simulate an update and call the parent callback
                // In a real app, this would involve an API call and then updating user state
                // Example: const updatedUser = await UserService.uploadProfilePicture(file);
                // onProfilePictureUpdate(updatedUser); 
                // For demonstration, let's assume upload is successful and new URL is available
                // This is a placeholder. Replace with actual upload logic.
                dummyUpdatedUser = _object_spread_props(_object_spread({}, user), {
                    profilePictureUrl: URL.createObjectURL(file) // Temporary: use object URL for immediate preview
                });
                if (onProfilePictureUpdate) {
                    onProfilePictureUpdate(dummyUpdatedUser, file); // Pass file for actual upload by parent
                }
                handleClosePfpModal();
                return [
                    2
                ];
            });
        // Note: The temporary object URL will be revoked by ProfilePictureModal's useEffect cleanup
        // if the modal is reopened without a new selection.
        // The parent (App.jsx) will be responsible for the actual API upload and persisting the URL.
        });
        return function handleUploadPfp(file) {
            return _ref.apply(this, arguments);
        };
    }();
    return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: [
            /*#__PURE__*/ _jsxDEV("header", {
                className: "header",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "header-left",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "window-dots",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "window-dot red-dot"
                                    }, void 0, false, {
                                        fileName: "Header.jsx",
                                        lineNumber: 42,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "window-dot yellow-dot"
                                    }, void 0, false, {
                                        fileName: "Header.jsx",
                                        lineNumber: 43,
                                        columnNumber: 13
                                    }, _this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "window-dot green-dot"
                                    }, void 0, false, {
                                        fileName: "Header.jsx",
                                        lineNumber: 44,
                                        columnNumber: 13
                                    }, _this)
                                ]
                            }, void 0, true, {
                                fileName: "Header.jsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ _jsxDEV("h1", {
                                className: "header-title",
                                children: "FromYourLens"
                            }, void 0, false, {
                                fileName: "Header.jsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "Header.jsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, _this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "header-right",
                        children: [
                            /*#__PURE__*/ _jsxDEV("img", {
                                src: profilePic,
                                alt: "User Profile",
                                className: "profile-pic",
                                onClick: handlePfpClick,
                                style: {
                                    cursor: 'pointer'
                                }
                            }, void 0, false, {
                                fileName: "Header.jsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, _this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: onLogout,
                                className: "logout-button",
                                children: "Logout"
                            }, void 0, false, {
                                fileName: "Header.jsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, _this)
                        ]
                    }, void 0, true, {
                        fileName: "Header.jsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, _this)
                ]
            }, void 0, true, {
                fileName: "Header.jsx",
                lineNumber: 39,
                columnNumber: 7
            }, _this),
            /*#__PURE__*/ _jsxDEV(ProfilePictureModal, {
                isOpen: isPfpModalOpen,
                onClose: handleClosePfpModal,
                onUpload: handleUploadPfp,
                user: user
            }, void 0, false, {
                fileName: "Header.jsx",
                lineNumber: 61,
                columnNumber: 7
            }, _this)
        ]
    }, void 0, true);
};
export default Header;
