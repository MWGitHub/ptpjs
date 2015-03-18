/**
 * @author MW
 * Represents an AABB bounding box.
 */

/**
 * Creates the bounds.
 * @param {Number} x the center x location of the bounds.
 * @param {Number} y the center y location of the bounds.
 * @param {Number} width the width of the bounds.
 * @param {Number} height the height of the bounds.
 * @constructor
 */
function Bounds(x, y, width, height) {
    "use strict";

    /**
     * Center x of the bounds.
     * @type {Number}
     */
    this.x = x;

    /**
     * Center y of the bounds.
     * @type {Number}
     */
    this.y = y;

    /**
     * Directions to resolve.
     * @type {{left: boolean, right: boolean, top: boolean, bottom: boolean}}
     */
    this.resolve = {
        left: true,
        right: true,
        top: true,
        bottom: true
    };

    /**
     * Width of the bounds.
     * @type {Number}
     */
    this.width = width;

    /**
     * Height of the bounds.
     * @type {Number}
     */
    this.height = height;

    /**
     * Data for the user to set.
     * @type {{}}
     */
    this.userData = {};
}

/**
 * Get the edges of the bounds.
 * @returns {number}
 */
Bounds.prototype.getLeft = function() {
    "use strict";
    return this.x - this.width / 2;
};
Bounds.prototype.getRight = function() {
    "use strict";
    return this.x + this.width / 2;
};
Bounds.prototype.getTop = function() {
    "use strict";
    return this.y - this.height / 2;
};
Bounds.prototype.getBottom = function() {
    "use strict";
    return this.y + this.height / 2;
};

/**
 * Copy the given bounds but not the user data.
 * @param {Bounds} bounds the bounds to copy.
 */
Bounds.prototype.copy = function(bounds) {
    "use strict";
    this.x = bounds.x;
    this.y = bounds.y;
    this.width = bounds.width;
    this.height = bounds.height;
};

/**
 * Adds to the width and height of the bounds without changing the top left location.
 * @param {Number} width the width to add.
 * @param {Number} height the height to add.
 */
Bounds.prototype.addToBounds = function(width, height) {
    "use strict";

    this.x = this.x + width / 2;
    this.y = this.y + height / 2;
    this.width += Math.abs(width);
    this.height += Math.abs(height);
};

module.exports = Bounds;