var _this = this;
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
import React from 'react';
// Default border color is now defined here
var DEFAULT_BORDER_COLOR = 'var(--primary-color)';
var DetectionBoundingBoxes = function(param) {
    var faceDetails = param.faceDetails, imageDimensions = param.imageDimensions, _param_borderColor = param.borderColor, borderColor = _param_borderColor === void 0 ? DEFAULT_BORDER_COLOR : _param_borderColor;
    if (!faceDetails || !imageDimensions) {
        console.log('[BoundingBoxes] Missing faceDetails or imageDimensions, not rendering boxes.');
        return null;
    }
    // Ensure faceDetails is an array, even if a single object is passed for SourceImageFace
    var detailsArray = Array.isArray(faceDetails) ? faceDetails : [
        faceDetails
    ];
    console.log('[BoundingBoxes] Rendering with:', {
        numFaces: detailsArray.length,
        imageDimensions: imageDimensions,
        borderColor: borderColor
    });
    return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: detailsArray.map(function(faceDetail, index) {
            // Check if faceDetail itself is null or undefined, or if BoundingBox is missing
            if (!faceDetail || !faceDetail.BoundingBox) {
                console.log("[BoundingBoxes] Face ".concat(index, " or its BoundingBox is missing."));
                return null;
            }
            var BoundingBox = faceDetail.BoundingBox, Confidence = faceDetail.Confidence;
            // imageDimensions now contains { width: visualWidth, height: visualHeight, offsetX, offsetY }
            var imgVisualWidth = imageDimensions.width, imgVisualHeight = imageDimensions.height, _imageDimensions_offsetX = imageDimensions.offsetX, offsetX = _imageDimensions_offsetX === void 0 ? 0 : _imageDimensions_offsetX, _imageDimensions_offsetY = imageDimensions.offsetY, offsetY = _imageDimensions_offsetY === void 0 ? 0 : _imageDimensions_offsetY;
            // Ensure imageDimensions are valid numbers
            if (typeof imgVisualWidth !== 'number' || typeof imgVisualHeight !== 'number' || isNaN(imgVisualWidth) || isNaN(imgVisualHeight) || typeof offsetX !== 'number' || typeof offsetY !== 'number' || isNaN(offsetX) || isNaN(offsetY)) {
                console.warn('[BoundingBoxes] Invalid imageDimensions (visual or offset):', imageDimensions);
                return null;
            }
            var boxStyle = {
                position: 'absolute',
                left: "".concat(offsetX + BoundingBox.Left * imgVisualWidth, "px"),
                top: "".concat(offsetY + BoundingBox.Top * imgVisualHeight, "px"),
                width: "".concat(BoundingBox.Width * imgVisualWidth, "px"),
                height: "".concat(BoundingBox.Height * imgVisualHeight, "px"),
                border: "2px solid ".concat(borderColor),
                boxSizing: 'border-box',
                pointerEvents: 'none'
            };
            var title = Confidence ? "Confidence: ".concat((Confidence * 100).toFixed(2), "%") : 'Face Detection';
            return /*#__PURE__*/ _jsxDEV("div", {
                style: boxStyle,
                title: title
            }, "box-".concat(borderColor, "-").concat(index), false, {
                fileName: "DetectionBoundingBoxes.jsx",
                lineNumber: 45,
                columnNumber: 16
            }, _this);
        })
    }, void 0, false);
};
export default DetectionBoundingBoxes;
