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
import { photosService } from './PhotosService.js';
/**
 * Fetches the content of an image file as a Blob.
 * @param {string} fileId - The ID of the file to fetch.
 * @returns {Promise<Blob>} A promise that resolves with the image Blob.
 * @throws {Error} If fetching or processing fails.
 */ export var fetchImageBlob = /*#__PURE__*/ function() {
    var _ref = _async_to_generator(function(fileId) {
        var response, errorDetail, errorData, e, blob, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (!fileId) {
                        throw new Error('File ID is required to fetch image blob.');
                    }
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        10,
                        ,
                        11
                    ]);
                    return [
                        4,
                        photosService.getFileContent(fileId)
                    ];
                case 2:
                    response = _state.sent();
                    if (!!response.ok) return [
                        3,
                        8
                    ];
                    errorDetail = "Status: ".concat(response.status);
                    _state.label = 3;
                case 3:
                    _state.trys.push([
                        3,
                        5,
                        ,
                        7
                    ]);
                    return [
                        4,
                        response.json()
                    ];
                case 4:
                    errorData = _state.sent();
                    errorDetail = errorData.error || errorData.detail || errorDetail;
                    return [
                        3,
                        7
                    ];
                case 5:
                    e = _state.sent();
                    return [
                        4,
                        response.text().catch(function() {
                            return errorDetail;
                        })
                    ];
                case 6:
                    errorDetail = _state.sent();
                    return [
                        3,
                        7
                    ];
                case 7:
                    console.error("[fetchImageBlob] Error fetching file content for ".concat(fileId, ": ").concat(errorDetail));
                    throw new Error("Failed to load image blob. ".concat(errorDetail));
                case 8:
                    return [
                        4,
                        response.blob()
                    ];
                case 9:
                    blob = _state.sent();
                    if (!blob.type.startsWith('image/')) {
                        console.warn("[fetchImageBlob] Fetched content for ".concat(fileId, " might not be an image. MIME type: ").concat(blob.type));
                    // Potentially throw an error here if strict image type is required
                    // throw new Error(`Fetched content for ${fileId} is not an image. MIME type: ${blob.type}`);
                    }
                    return [
                        2,
                        blob
                    ];
                case 10:
                    error = _state.sent();
                    console.error("[fetchImageBlob] Exception fetching image blob for ".concat(fileId, ":"), error);
                    throw error; // Re-throw to be handled by the caller
                case 11:
                    return [
                        2
                    ];
            }
        });
    });
    return function fetchImageBlob(fileId) {
        return _ref.apply(this, arguments);
    };
}();
/**
 * Converts an image Blob to a File object.
 * @param {Blob} blob - The image Blob.
 * @param {string} fileName - The desired file name for the File object.
 * @returns {File} The created File object.
 */ export var blobToFile = function(blob, fileName) {
    return new File([
        blob
    ], fileName, {
        type: blob.type
    });
};
