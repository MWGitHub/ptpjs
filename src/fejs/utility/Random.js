/**
 * @author MW
 */

/**
 * Picks a random float from 0 to 1 excluding 1.
 * @returns {number}
 */
module.exports.pickRandomFloat = function() {
    "use strict";

    return Math.random();
};

/**
 * Picks a random property in an object.
 * @param {Object} obj the object to pick the property from.
 * @returns {*} the random property.
 */
module.exports.pickRandomProperty = function(obj) {
    "use strict";

    var keys = Object.keys(obj);
    if (keys.length === 0) {
        return null;
    }
    return obj[keys[Math.floor(keys.length * Math.random())]];
};

/**
 * Picks a random element from an array.
 * @param {Array} array the array to retrieve an element from.
 * @returns {*} the random array element or null if the array is invalid.
 */
module.exports.pickRandomElement = function(array) {
    "use strict";

    if (!array) return null;

    return array[Math.floor(Math.random() * array.length)];
};