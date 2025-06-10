import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { globalStyles } from './styles.js'; // Import the global styles string
// import * as faceapi from 'https://esm.sh/@vladmandic/face-api@1.7.15?external=tfjs'; // Removed face-api import
import { faceApiService } from './FaceApiService.js'; // Keep FaceApiService for backend calls
// Create a style element
var styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
// Append the style element to the document head
document.head.appendChild(styleElement);
// Create root and render the application
var renderDiv = document.getElementById('renderDiv');
if (renderDiv && renderDiv.parentElement) {
    renderDiv.parentElement.style.overflow = 'auto';
}
// Client-side model loading for face-api.js is no longer needed.
// console.log('[main.jsx] Face API Models pre-loading (client-side) removed.');
var root = createRoot(document.getElementById('renderDiv'));
root.render(/*#__PURE__*/ _jsxDEV(App, {}, void 0, false, {
    fileName: "main.jsx",
    lineNumber: 20,
    columnNumber: 13
}, this));
