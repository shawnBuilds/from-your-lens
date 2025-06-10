import { useEffect, useRef } from 'react';
/**
 * Custom hook to automatically scroll an element into view when dependencies change.
 * @param {Array} dependencies - The dependencies that trigger the scroll effect.
 * @returns {React.RefObject} - A ref object to attach to the scroll target element.
 */ export var useAutoScroll = function(dependencies) {
    var scrollTargetRef = useRef(null);
    useEffect(function() {
        if (scrollTargetRef.current) {
            scrollTargetRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [
        dependencies
    ]); // Rerun effect if any dependency in the array changes
    return scrollTargetRef;
};
