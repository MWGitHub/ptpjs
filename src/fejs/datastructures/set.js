/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 10/31/13
 * Time: 11:29 AM
 * A set of objects.
 */

/**
 * Initializes the set.
 * @constructor
 * @template T
 */
function FESet() {
    "use strict";

    /**
     * Objects in the set.
     * Retrieval of the objects is safe but modifying it directly will not check
     * for duplicates.
     * @type {Array.<T>}
     * @private
     */
    this._objects = [];
}

/**
 * Adds an object to the set as long as it is unique.
 * @param {T} object the object to add.
 * @return {boolean} true if the object was added.
 */
FESet.prototype.add = function(object) {
    "use strict";
    if (!this.contains(object)) {
        this._objects.push(object);
        return true;
    }
    return false;
};

/**
 * Removes an object from the set.
 * @param {T} object the object to remove.
 * @return {boolean} true if the object was removed.
 */
FESet.prototype.remove = function(object) {
    "use strict";
    var index = this._objects.indexOf(object);
    if (index > -1) {
        this._objects.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Iterates over the objects and calls the given function.
 * @param {function(T, *)} func the function to call on each iteration.
 * @param {*=} context context variables to pass.
 */
FESet.prototype.each = function(func, context) {
    "use strict";
    for (var i = 0; i < this._objects.length; i++) {
        func(this._objects[i], context);
    }
};

/**
 * Checks if the set contains an object.
 * @param {T} object the object to check if the set contains.
 * @return {boolean} true if the set contains the object.
 */
FESet.prototype.contains = function(object) {
    "use strict";
    return this._objects.indexOf(object) > -1;
};

/**
 * Retrieves the number of objects in the set.
 * @returns {Number} the number of objects in the set.
 */
FESet.prototype.size = function() {
    "use strict";
    return this._objects.length;
};

/**
 * Retrieves the objects in the set as a new array.
 * Modifications to the array does not affect the set.
 * @returns {Array.<T>}
 */
FESet.prototype.getAll = function() {
    "use strict";

    var objects = [];
    objects = objects.concat(this._objects);
    return objects;
};

/**
 * Clears the set.
 */
FESet.prototype.clear = function() {
    "use strict";
    this._objects = [];
};

module.exports = FESet;