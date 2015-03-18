/**
 * Utility for native collections.
 */

/**********************************************************
 * Array functions.
 *********************************************************/

/**
 * Checks if an array contains and object.
 * @param {Array.<*>} array the array to check in.
 * @param {*} object the object to find.
 * @returns {boolean} true if the array contains the object.
 */
module.exports.contains = function(array, object) {
    "use strict";
    return (array.indexOf(object) > -1);
};

/**
 * Shuffles an array.
 * @param {Array} array the array to shuffle.
 */
module.exports.shuffle = function(array) {
    "use strict";

    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = array[j];
        array[j] = array[i];
        array[i] = t;
    }
};

/**
 * Removes an element from the array.
 * @param {Array} array the array to remove the object out of.
 * @param element the element to remove.
 * @return {boolean} true if the element has been removed.
 */
module.exports.remove = function(array, element) {
    "use strict";

    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Takes an array and outputs it as a string.
 * @param {Array.<Array<*>>} array the array to output as a string.
 * @returns {string} the array as a string.
 */
module.exports.array2dToString = function(array) {
    "use strict";

    var output = '';
    for (var i = 0; i < array.length; i++) {
        output += '[';
        for (var j = 0; j < array[i].length; j++) {
            output += array[i][j];
            if (j !== array[i].length - 1) {
                output += '\t';
            }
        }
        output += ']';
        if (i !== array.length - 1) {
            output += '\n';
        }
    }

    return output;
};

/**
 * Deep copies all primitive elements in an array while shallow copying objects.
 * @param {Array} array the array to copy.
 * @returns {Array} the new array.
 */
module.exports.copyArray = function(array) {
    "use strict";

    var output = array.slice(0);
    for (var i = 0; i < output.length; i++) {
        if (output[i] instanceof Array) {
            output[i] = this.copyArray(output[i]);
        }
    }

    return output;
};

/**********************************************************
 * Object functions.
 *********************************************************/

/**
 * Checks if an object contains a value.
 * Does not recursively check objects.
 * @param {*} object the object to check in.
 * @param {*} value the value to check for.
 * @returns {boolean} true if the object contains the value.
 */
module.exports.objectContainsValue = function(object, value) {
    "use strict";
    for (var key in object) {
        if (object[key] === value) {
            return true;
        }
    }
    return false;
};

/**
 * Checks if an object contains a value.
 * @param {*} object the object to check in.
 * @param {*} key the key to check for.
 * @returns {boolean} true if the object contains the key.
 */
module.exports.objectContainsKey = function(object, key) {
    "use strict";
    return object[key] ? true : false;
};

/**
 * Retrieves the size of an object.
 * @param {Object} obj the object to get the size of.
 * @returns {number} the size of the object.
 */
module.exports.objectSize = function(obj) {
    "use strict";
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Copies an object down one level.
 * @param {Object} input the input to copy.
 * @returns {Object} the copied object.
 */
module.exports.shallowCopyObject = function(input) {
    "use strict";

    var obj = {};
    for (var key in input) {
        obj[key] = input[key];
    }

    return obj;
};

/**
 * Retrieves and object's property by key.
 * @param {Object} obj the object to retrieve the property of.
 * @param {String keys... the keys to traverse the object with a maximum of five.
 * @returns {*} the retrieved value.
 */
module.exports.getPropertyByKey = function(obj, key1, key2, key3, key4, key5) {
    "use strict";

    var base = obj[key1];
    if (key2) {
        base = base[key2];
        if (key3) {
            base = base[key3];
            if (key4) {
                base = base[key4];
                if (key5) {
                    base = base[key5];
                }
            }
        }
    }

    return base;
};