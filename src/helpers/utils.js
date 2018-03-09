// TYPES

exports.isNumeric = function (x) {
    return !isNaN(parseFloat(x)) && isFinite(x);
};

exports.isArray = function (x) {
    return Array.isArray(x);
};

exports.isString = function (x) {
    return Object.prototype.toString.call(x) === "[object String]";
};

exports.isObject = function (x) {
    return x !== null && typeof x === 'object';
};

exports.toObjectId = function (x) {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(x.toString());
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

exports.isObjectEmpty = function (obj) {
    if (obj == null) return true;
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;
    if (typeof obj !== "object") return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};

// ARRAYS

exports.arrayIsEmpty = function (A) {
    return !Array.isArray(A) || !A.length;
};

exports.arrayDiff = function (A, B) {
    return A.filter(x => B.indexOf(x) < 0);
};

exports.flattenArray = function (A) {
    return A.reduce(function (a, b) {
        return a.concat(b);
    }, []);
};

exports.arraysEqual = function (A, B) {
    return JSON.stringify(A) == JSON.stringify(B);
};

exports.sum = function (A) {
    return A.reduce((a, b) => a + b, 0);
};

exports.average = function (A) {
    return A.reduce((a, b) => a + b, 0) / A.length;
};

// RANDOM

exports.randomIntFromInterval = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

// PROPERTIES

exports.propMap = function (A, prop) {
    return A
        .map(function (a) {
            return eval("a." + prop)
        })
        .filter(function (a) {
            return typeof a !== "undefined"
        });
};

exports.propAny = function (obj) {
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
        throw "Bad request. Body is empty."
    }
};

exports.propRequire = function (body, required) {
    if (!exports.isArray(required)) {
        required = [required];
    }
    required.map(function (prop) {
        if (!body.hasOwnProperty(prop)) {
            throw "Bad request. Property " + prop + " is missing.";
        }
    })
};

exports.propSanitize = function (body, required = [], optional = []) {
    var newBody = {};
    required.map(function (prop) {
        exports.propRequire(body, prop);
        newBody[prop] = body[prop];
    });
    optional.map(function (prop) {
        if (body.hasOwnProperty(prop)) {
            newBody[prop] = body[prop];
        }
    });
    return newBody;
};
