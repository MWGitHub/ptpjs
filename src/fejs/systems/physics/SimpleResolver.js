/**
 * @author MW
 * Resolves collisions for AABB-AABB.
 */
var Bounds = require('./Bounds');
var CollisionInfo = require('./CollisionInfo');

/**
 * Tolerance amount when dealing with floats.
 * @type {Number}
 */
var TOLERANCE = 0.0;

function SimpleResolver() {
    "use strict";

    /**
     * Bounds to use for collision calculations.
     * @type {Bounds}
     */
    this.bounds = new Bounds(0, 0, 1, 1);

    /**
     * Information for the collision.
     * @type {CollisionInfo}
     */
    this.collisionInfo = new CollisionInfo();
}

/**
 * Retrieves the minimum distance between two lines and returns the minimum distance if greater than current.
 * @param {Number} min1 the minimum of the first line.
 * @param {Number} max1 the maxmimum of the first line.
 * @param {Number} min2 the minimum of the second line.
 * @param {Number} max2 the maximum of the second line.
 * @param {Number} currentDistance the current minimum distance.
 * @returns {number} the minimum distance.
 */
function getMinimumDistance(min1, max1, min2, max2, currentDistance) {
    "use strict";

    var distance;
    var minimum = currentDistance;
    // Check positive distances.
    if (currentDistance > 0 && max2 - TOLERANCE <= min1) {
        distance = min1 - max2;
        if (distance < currentDistance) {
            minimum = distance;
        }
    }
    // Check negative distances.
    if (currentDistance < 0 && min2 + TOLERANCE >= max1) {
        distance = max1 - min2;
        if (distance > currentDistance) {
            minimum = distance;
        }
    }

    return minimum;
}

/**
 * Checks if two lines are colliding.
 * @param {Number} min1 the minimum of the first line.
 * @param {Number} max1 the maximum of the first line.
 * @param {Number} min2 the minimum of the second line.
 * @param {Number} max2 the maximum of the second line.
 * @returns {Boolean} true if colliding.
 */
function isCollidingOnAxis(min1, max1, min2, max2) {
    "use strict";
    return max2 - TOLERANCE > min1 && min2 + TOLERANCE < max1;
}

/**
 * Resolves collisions for an AABB with a list of AABBs to collide against.
 * @param {Bounds} bounds the collider bounds in the original location.
 * @param {Number} moveX the amount to move in the X direction.
 * @param {Number} moveY the amount to move in the Y direction.
 * @param {Array.<Bounds>} colliders the bounds to test against.
 */
SimpleResolver.prototype.resolve = function(bounds, moveX, moveY, colliders) {
    "use strict";

    this.collisionInfo.reset();
    this.collisionInfo.colliderBounds = bounds;

    this.bounds.copy(bounds);
    var left = this.bounds.getLeft();
    var right = this.bounds.getRight();
    var top = this.bounds.getTop();
    var bottom = this.bounds.getBottom();
    // Calculate minimum Y movement amount.
    var i, cl, cr, cb, ct;
    var minimum = moveY;
    var collider;
    var testedMin;
    for (i = 0; i < colliders.length; i++) {
        collider = colliders[i];
        cl = collider.getLeft();
        cr = collider.getRight();
        ct = collider.getTop();
        cb = collider.getBottom();
        if (isCollidingOnAxis(left, right, cl, cr)) {
            testedMin = getMinimumDistance(ct, cb, top, bottom, minimum);
            // Minimum changed so make it a collider.
            if (testedMin !== minimum) {
                // Check if resolution is allowed in the direction.
                if (testedMin > 0 && !collider.resolve.top) {
                    continue;
                } else if (testedMin < 0 && !collider.resolve.bottom) {
                    continue;
                }
                minimum = testedMin;
                this.collisionInfo.verticalColliderBounds = collider;
            }
        }
    }
    this.collisionInfo.move.y = minimum;

    // Update the bounds center.
    this.bounds.y += this.collisionInfo.move.y;
    left = this.bounds.getLeft();
    right = this.bounds.getRight();
    top = this.bounds.getTop();
    bottom = this.bounds.getBottom();
    // Calculate minimum X movement amount.
    minimum = moveX;
    for (i = 0; i < colliders.length; i++) {
        collider = colliders[i];
        cl = collider.getLeft();
        cr = collider.getRight();
        ct = collider.getTop();
        cb = collider.getBottom();
        if (isCollidingOnAxis(top, bottom, ct, cb)) {
            testedMin = getMinimumDistance(cl, cr, left, right, minimum);
            // Minimum changed so make it a collider.
            if (testedMin !== minimum) {
                // Check if resolution is allowed in the direction.
                if (testedMin > 0 && !collider.resolve.left) {
                    continue;
                } else if (testedMin < 0 && !collider.resolve.right) {
                    continue;
                }
                minimum = testedMin;
                this.collisionInfo.horizontalColliderBounds = collider;
            }
        }
    }
    this.collisionInfo.move.x = minimum;

    return this.collisionInfo;
};

module.exports = SimpleResolver;