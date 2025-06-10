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
import { logStorageEvent, loadFromLocalStorage } from './localStorageUtils.js';
export var AuthService = {
    logout: /*#__PURE__*/ _async_to_generator(function() {
        var logoutUrl, response, responseText, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    console.log('[AuthService] Logging out...');
                    logoutUrl = "".concat(BASE_API_URL, "/auth/logout");
                    console.log("[AuthService] Attempting to logout via GET request to: ".concat(logoutUrl));
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        6,
                        ,
                        7
                    ]);
                    return [
                        4,
                        fetch(logoutUrl, {
                            method: 'GET'
                        })
                    ];
                case 2:
                    response = _state.sent();
                    console.log("[AuthService] Logout response status: ".concat(response.status));
                    if (!response.ok) return [
                        3,
                        3
                    ];
                    console.log('[AuthService] Logout successful on server.');
                    return [
                        2,
                        {
                            success: true
                        }
                    ];
                case 3:
                    return [
                        4,
                        response.text().catch(function() {
                            return 'Could not read response text.';
                        })
                    ];
                case 4:
                    responseText = _state.sent();
                    console.warn("[AuthService] Server logout failed or not reachable (Status: ".concat(response.status, "). Body: ").concat(responseText));
                    return [
                        2,
                        {
                            success: false,
                            error: "Server logout failed: ".concat(response.status)
                        }
                    ];
                case 5:
                    return [
                        3,
                        7
                    ];
                case 6:
                    error = _state.sent();
                    console.error('[AuthService] Network error during server logout:', error);
                    return [
                        2,
                        {
                            success: false,
                            error: "Network error: ".concat(error.message)
                        }
                    ];
                case 7:
                    return [
                        2
                    ];
            }
        });
    }),
    getGoogleAuthUrl: function() {
        return "".concat(BASE_API_URL, "/auth/google");
    },
    handleGoogleAuthCallback: function(eventData) {
        console.log('[AuthService] Handling Google Auth Callback:', eventData);
        // Accept both GOOGLE_AUTH_SUCCESS (for Drive, if still used) and GOOGLE_PHOTOS_AUTH_SUCCESS
        if (eventData && eventData.type === 'GOOGLE_PHOTOS_AUTH_SUCCESS' && eventData.token && eventData.user) {
            logStorageEvent('SAVE_INITIATED', 'Auth Token (from callback)', STORAGE_KEYS.AUTH_TOKEN, null);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, eventData.token);
            logStorageEvent('SAVE_COMPLETED', 'Auth Token (from callback)', STORAGE_KEYS.AUTH_TOKEN, eventData.token);
            logStorageEvent('SAVE_INITIATED', 'User Data (from callback)', STORAGE_KEYS.USER_DATA, null);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(eventData.user));
            logStorageEvent('SAVE_COMPLETED', 'User Data (from callback)', STORAGE_KEYS.USER_DATA, eventData.user);
            return {
                success: true,
                user: eventData.user
            };
        } else if (eventData && eventData.type === 'GOOGLE_PHOTOS_AUTH_FAILURE') {
            console.error('[AuthService] Google authentication failed:', eventData.error, 'Type:', eventData.type);
            return {
                success: false,
                error: eventData.error
            };
        } else {
            console.warn('[AuthService] Received unhandled or malformed message for auth callback:', eventData);
            return {
                success: false,
                error: 'Malformed callback data'
            };
        }
    },
    handleReturningUser: /*#__PURE__*/ _async_to_generator(function() {
        var token, verifyTokenUrl, response, verificationData, userId, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                    if (!token) {
                        console.log('[AuthService] No token found in localStorage for returning user.');
                        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                        logStorageEvent('REMOVE', 'Stale User Data (no token)', STORAGE_KEYS.USER_DATA, null);
                        return [
                            2,
                            {
                                sessionValid: false
                            }
                        ];
                    }
                    verifyTokenUrl = "".concat(BASE_API_URL, "/auth/verify-token");
                    console.log("[AuthService] Verifying token at: ".concat(verifyTokenUrl));
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        6,
                        ,
                        7
                    ]);
                    return [
                        4,
                        fetch(verifyTokenUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': "Bearer ".concat(token)
                            }
                        })
                    ];
                case 2:
                    response = _state.sent();
                    if (!response.ok) return [
                        3,
                        4
                    ];
                    return [
                        4,
                        response.json()
                    ];
                case 3:
                    verificationData = _state.sent();
                    console.groupCollapsed('%c[AuthService]%c Verification Response (from server)', 'color: #007bff; font-weight: bold;', 'color: #007bff;');
                    console.log(verificationData);
                    console.groupEnd();
                    if (verificationData.valid && (verificationData.userId || verificationData.user && verificationData.user.id)) {
                        userId = verificationData.userId || verificationData.user.id;
                        console.log("[AuthService] Token is valid. User ID from server: ".concat(userId));
                        return [
                            2,
                            {
                                sessionValid: true,
                                userId: userId,
                                userFromServer: verificationData.user
                            }
                        ];
                    } else {
                        console.log('[AuthService] Token verification failed or essential user ID missing from server response.', verificationData);
                        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                        logStorageEvent('REMOVE', 'Invalid Auth Token (Verification)', STORAGE_KEYS.AUTH_TOKEN, null);
                        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                        logStorageEvent('REMOVE', 'Stale User Data (Invalid Token Verification)', STORAGE_KEYS.USER_DATA, null);
                        return [
                            2,
                            {
                                sessionValid: false
                            }
                        ];
                    }
                    return [
                        3,
                        5
                    ];
                case 4:
                    console.log('[AuthService] Token verification request returned not ok. Status:', response.status);
                    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                    logStorageEvent('REMOVE', 'Rejected Auth Token (Verification)', STORAGE_KEYS.AUTH_TOKEN, null);
                    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                    logStorageEvent('REMOVE', 'Stale User Data (Rejected Token Verification)', STORAGE_KEYS.USER_DATA, null);
                    return [
                        2,
                        {
                            sessionValid: false
                        }
                    ];
                case 5:
                    return [
                        3,
                        7
                    ];
                case 6:
                    error = _state.sent();
                    console.error('[AuthService] Error during token verification:', error);
                    return [
                        2,
                        {
                            sessionValid: false,
                            error: "Network error during token verification: ".concat(error.message)
                        }
                    ];
                case 7:
                    return [
                        2
                    ];
            }
        });
    })
};
