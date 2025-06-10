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
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { faceApiService } from './FaceApiService.js';
import DetectionBoundingBoxes from './DetectionBoundingBoxes.js';
import BatchCompareForm from './BatchCompareForm.js';
var API_TEST_MODES = {
    BATCH_COMPARE: 'BATCH_COMPARE'
};
var TestingForm = function() {
    var _useState = _sliced_to_array(useState(API_TEST_MODES.BATCH_COMPARE), 2), currentMode = _useState[0], setCurrentMode = _useState[1];
    var _useState1 = _sliced_to_array(useState(false), 2), isLoading = _useState1[0], setIsLoading = _useState1[1];
    var _useState2 = _sliced_to_array(useState(null), 2), error = _useState2[0], setError = _useState2[1];
    var _useState3 = _sliced_to_array(useState(null), 2), batchCompareResultForDisplay = _useState3[0], setBatchCompareResultForDisplay = _useState3[1];
    // handleBatchCompareSubmitFromComponent is removed from TestingForm.
    // TestingForm will now simply pass down isLoading, onResults, and onError.
    // The API call logic is now entirely within BatchCompareForm.
    var currentFormTitle = "Batch Face Comparison API Test";
    var apiEndpointInfo = {
        text: "Endpoint:",
        code: "POST /api/face/batch-compare"
    };
    return /*#__PURE__*/ _jsxDEV(BatchCompareForm, {
        title: currentFormTitle,
        onClose: function() {
            return console.log("TestingForm: Close button clicked - no action implemented yet");
        },
        onResults: function(results, newIsLoadingState) {
            console.log('[TestingForm] BatchCompareForm results received:', results);
            setBatchCompareResultForDisplay(results);
            setIsLoading(newIsLoadingState);
        },
        onError: function(errorMessage) {
            setError(errorMessage);
            setIsLoading(false);
        },
        externalErrorToDisplay: error,
        apiEndpointInfo: apiEndpointInfo
    }, void 0, false, {
        fileName: "TestingForm.jsx",
        lineNumber: 23,
        columnNumber: 3
    }, _this);
};
export default TestingForm;
