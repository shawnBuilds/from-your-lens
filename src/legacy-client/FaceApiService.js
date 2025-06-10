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
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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
import * as faceapi from 'https://esm.sh/@vladmandic/face-api@1.7.15?external=tfjs';
var FaceApiService = /*#__PURE__*/ function() {
    "use strict";
    function FaceApiService() {
        _class_call_check(this, FaceApiService);
    }
    _create_class(FaceApiService, [
        {
            key: "detectFaces",
            value: function detectFaces(imageElementOrUrl) {
                return _async_to_generator(function() {
                    var input, _tmp, detections, error;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _state.trys.push([
                                    0,
                                    5,
                                    ,
                                    6
                                ]);
                                if (!(typeof imageElementOrUrl === 'string')) return [
                                    3,
                                    2
                                ];
                                return [
                                    4,
                                    faceapi.fetchImage(imageElementOrUrl)
                                ];
                            case 1:
                                _tmp = _state.sent();
                                return [
                                    3,
                                    3
                                ];
                            case 2:
                                _tmp = imageElementOrUrl;
                                _state.label = 3;
                            case 3:
                                input = _tmp;
                                return [
                                    4,
                                    faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
                                ];
                            case 4:
                                detections = _state.sent();
                                return [
                                    2,
                                    detections
                                ];
                            case 5:
                                error = _state.sent();
                                console.error('[FaceApiService] Error detecting faces:', error);
                                throw new Error('Failed to detect faces.');
                            case 6:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "detectFacesWithApi",
            value: function detectFacesWithApi(imageFile) {
                return _async_to_generator(function() {
                    var formData, apiUrl, response, errorData, e, _tmp, result, error;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                if (!imageFile) {
                                    throw new Error('Image file is required for API detection.');
                                }
                                formData = new FormData();
                                formData.append('image', imageFile);
                                apiUrl = 'http://localhost:5000/api/face/detect';
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
                                    fetch(apiUrl, {
                                        method: 'POST',
                                        body: formData
                                    })
                                ];
                            case 2:
                                response = _state.sent();
                                if (!!response.ok) return [
                                    3,
                                    8
                                ];
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
                                return [
                                    3,
                                    7
                                ];
                            case 5:
                                e = _state.sent();
                                _tmp = {
                                    error: response.statusText
                                };
                                return [
                                    4,
                                    response.text().catch(function() {
                                        return 'Could not read error response text.';
                                    })
                                ];
                            case 6:
                                errorData = (_tmp.detail = _state.sent(), _tmp);
                                return [
                                    3,
                                    7
                                ];
                            case 7:
                                console.error("[FaceApiService] API Error (detectFacesWithApi): ".concat(response.status), errorData);
                                throw new Error(errorData.error || "API request failed: ".concat(response.status));
                            case 8:
                                return [
                                    4,
                                    response.json()
                                ];
                            case 9:
                                result = _state.sent();
                                return [
                                    2,
                                    result
                                ];
                            case 10:
                                error = _state.sent();
                                console.error('[FaceApiService] Error during API face detection:', error);
                                throw error;
                            case 11:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "compareFacesWithApi",
            value: function compareFacesWithApi(formData) {
                return _async_to_generator(function() {
                    var apiUrl, response, errorData, e, _tmp, result, error;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                if (!formData || !formData.has('source') || !formData.has('target')) {
                                    throw new Error('Source and target image files are required in FormData for API comparison.');
                                }
                                apiUrl = 'http://localhost:5000/api/face/compare';
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
                                    fetch(apiUrl, {
                                        method: 'POST',
                                        body: formData
                                    })
                                ];
                            case 2:
                                response = _state.sent();
                                if (!!response.ok) return [
                                    3,
                                    8
                                ];
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
                                return [
                                    3,
                                    7
                                ];
                            case 5:
                                e = _state.sent();
                                _tmp = {
                                    error: response.statusText
                                };
                                return [
                                    4,
                                    response.text().catch(function() {
                                        return 'Could not read error response text.';
                                    })
                                ];
                            case 6:
                                errorData = (_tmp.detail = _state.sent(), _tmp);
                                return [
                                    3,
                                    7
                                ];
                            case 7:
                                console.error("[FaceApiService] API Error (compareFacesWithApi): ".concat(response.status), errorData);
                                throw new Error(errorData.error || "API request failed: ".concat(response.status));
                            case 8:
                                return [
                                    4,
                                    response.json()
                                ];
                            case 9:
                                result = _state.sent();
                                return [
                                    2,
                                    result
                                ];
                            case 10:
                                error = _state.sent();
                                console.error('[FaceApiService] Error during API face comparison:', error);
                                throw error;
                            case 11:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return FaceApiService;
}();
export var faceApiService = new FaceApiService();
