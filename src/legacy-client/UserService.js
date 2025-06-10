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
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
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
import { BASE_API_URL, STORAGE_KEYS } from './constants.js';
import { logStorageEvent } from './localStorageUtils.js';
import { transformKeysToCamelCase } from './objectUtils.js';
export var UserService = {
    uploadProfilePicture: /*#__PURE__*/ function() {
        var _ref = _async_to_generator(function(file) {
            var token, formData, uploadUrl, response, responseData, rawUserData, finalUserData, error;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                        if (!token) {
                            console.error('[UserService] No auth token found for uploading profile picture.');
                            return [
                                2,
                                {
                                    success: false,
                                    error: 'Authentication required.'
                                }
                            ];
                        }
                        formData = new FormData();
                        formData.append('profilePicture', file);
                        uploadUrl = "".concat(BASE_API_URL, "/api/users/profile-picture");
                        console.log("[UserService] Attempting to upload profile picture to: ".concat(uploadUrl));
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            4,
                            ,
                            5
                        ]);
                        return [
                            4,
                            fetch(uploadUrl, {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(token)
                                },
                                body: formData
                            })
                        ];
                    case 2:
                        response = _state.sent();
                        return [
                            4,
                            response.json()
                        ];
                    case 3:
                        responseData = _state.sent();
                        if (response.ok) {
                            console.log('[UserService] Profile picture uploaded successfully. Server response:', responseData);
                            rawUserData = responseData.user || responseData;
                            finalUserData = transformKeysToCamelCase(rawUserData);
                            if (finalUserData && (typeof finalUserData === "undefined" ? "undefined" : _type_of(finalUserData)) === 'object') {
                                // The profilePicture to profilePictureUrl mapping should ideally happen
                                // after camelCasing if the original server keys are snake_case e.g. profile_picture
                                // Assuming transformKeysToCamelCase handles 'profile_picture' to 'profilePicture'
                                if (finalUserData.profilePicture && !finalUserData.profilePictureUrl) {
                                    finalUserData = _object_spread_props(_object_spread({}, finalUserData), {
                                        profilePictureUrl: finalUserData.profilePicture
                                    });
                                    delete finalUserData.profilePicture; // Remove the old key if it was just 'profilePicture'
                                    console.log('[UserService] Mapped profilePicture to profilePictureUrl after camelCasing.');
                                }
                            }
                            return [
                                2,
                                {
                                    success: true,
                                    user: finalUserData
                                }
                            ];
                        } else {
                            console.error('[UserService] Profile picture upload failed. Server response:', responseData);
                            return [
                                2,
                                {
                                    success: false,
                                    error: responseData.message || "Upload failed: ".concat(response.status)
                                }
                            ];
                        }
                        return [
                            3,
                            5
                        ];
                    case 4:
                        error = _state.sent();
                        console.error('[UserService] Network error during profile picture upload:', error);
                        return [
                            2,
                            {
                                success: false,
                                error: "Network error: ".concat(error.message)
                            }
                        ];
                    case 5:
                        return [
                            2
                        ];
                }
            });
        });
        return function(file) {
            return _ref.apply(this, arguments);
        };
    }()
};
