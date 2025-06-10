function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
import { STORAGE_KEYS } from './constants.js';
var LOG_PREFIX_SUCCESS = '%c[LocalStorage]';
var LOG_STYLE_SUCCESS = 'color: #28a745; font-weight: bold;'; // Green
var LOG_PREFIX_ERROR = '%c[LocalStorage]';
var LOG_STYLE_ERROR = 'color: #dc3545; font-weight: bold;'; // Red
var LOG_PREFIX_INFO = '%c[LocalStorage]';
var LOG_STYLE_INFO = 'color: #17a2b8; font-weight: bold;'; // Teal/Info Blue
export function logStorageEvent(action, itemName, key, data) {
    var success = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true, error = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : null;
    var icon = success ? '✔️' : '❌';
    var groupTitle, groupStyle;
    switch(action){
        case 'SAVE':
            groupStyle = success ? LOG_STYLE_SUCCESS : LOG_STYLE_ERROR;
            groupTitle = "".concat(icon, " ").concat(success ? 'SAVED' : 'SAVE FAILED', ": ").concat(itemName, " (Key: ").concat(key, ")");
            console.groupCollapsed(success ? LOG_PREFIX_SUCCESS : LOG_PREFIX_ERROR, groupStyle, groupTitle);
            if (success) {
                console.log('💾 Stored Value:', data); // `data` is the stringified value here
            } else {
                console.error('💣 Error:', error);
                console.log('💔 Attempted Value:', data); // `data` is the original value that failed to save/stringify
            }
            console.groupEnd();
            break;
        case 'LOAD':
            groupStyle = success ? LOG_STYLE_INFO : LOG_STYLE_ERROR;
            if (success && data !== null) {} else if (success && data === null) {
                groupTitle = "\uD83E\uDD14 KEY NOT FOUND: ".concat(itemName, " (Key: ").concat(key, ")");
                console.groupCollapsed(LOG_PREFIX_INFO, LOG_STYLE_INFO, groupTitle);
            } else {
                groupTitle = "❌ LOAD FAILED: ".concat(itemName, " (Key: ").concat(key, ")");
                console.groupCollapsed(LOG_PREFIX_ERROR, groupStyle, groupTitle);
                console.error('💣 Error:', error);
            }
            console.groupEnd();
            break;
        case 'REMOVE':
            groupStyle = LOG_STYLE_INFO; // Use info style for removal
            groupTitle = "\uD83D\uDDD1️ REMOVED: ".concat(itemName, " (Key: ").concat(key, ")");
            console.groupCollapsed(LOG_PREFIX_INFO, groupStyle, groupTitle);
            // No specific data to log for removal other than key and item name
            console.groupEnd();
            break;
        case 'SAVE_INITIATED':
            break;
        case 'SAVE_COMPLETED':
            break;
        case 'PARSE':
            if (success) {
                console.log('🧩 Parsed Value:', data);
            } else {
                console.error('💣 Error:', error);
                console.log('📄 Failed to parse raw value:', data);
            }
            console.groupEnd();
            break;
        default:
            console.log('[LocalStorage] Unknown log event:', action, itemName, key, data);
    }
}
export var saveToLocalStorage = function(key, value, itemName) {
    try {
        var isObject = (typeof value === "undefined" ? "undefined" : _type_of(value)) === 'object' && value !== null;
        var stringValue = isObject ? JSON.stringify(value) : String(value);
        localStorage.setItem(key, stringValue);
        logStorageEvent('SAVE', itemName, key, stringValue, true);
    } catch (error) {
        logStorageEvent('SAVE', itemName, key, value, false, error); // Pass original value for error logging
    }
};
export var loadFromLocalStorage = function(key, itemName) {
    var isJSON = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    var rawValue;
    try {
        rawValue = localStorage.getItem(key);
        logStorageEvent('LOAD', itemName, key, rawValue, true);
        if (rawValue === null) {
            return null;
        }
        if (isJSON) {
            try {
                var parsedValue = JSON.parse(rawValue);
                return parsedValue;
            } catch (error) {
                logStorageEvent('PARSE', itemName, key, rawValue, false, error);
                return null;
            }
        }
        return rawValue;
    } catch (error) {
        logStorageEvent('LOAD', itemName, key, null, false, error);
        return null;
    }
};
