var toCamel = function(s) {
    return s.replace(/([-_][a-z])/ig, function($1) {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
};
var isObject = function(o) {
    return o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
};
export var transformKeysToCamelCase = function(o) {
    if (isObject(o)) {
        var n = {};
        Object.keys(o).forEach(function(k) {
            n[toCamel(k)] = transformKeysToCamelCase(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map(function(i) {
            return transformKeysToCamelCase(i);
        });
    }
    return o;
};
