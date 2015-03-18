/**
 * @author MW
 * Information about a collision.
 * Not all inputs will be used depending on the type of collision.
 */

function CollisionInfo() {
    "use strict";

    /**
     * Collider entity targeting other entities.
     * @type {Entity}
     */
    this.colliderEntity = null;

    /**
     * Target entity being collided against.
     * @type {Entity}
     */
    this.targetEntity = null;

    /**
     * Colliding bounds for the collision.
     * @type {Bounds}
     */
    this.colliderBounds = null;

    /**
     * Collider in the vertical direction.
     * @type {Bounds}
     */
    this.verticalColliderBounds = null;

    /**
     * Collider in the horizontal direction.
     * @type {Bounds}
     */
    this.horizontalColliderBounds = null;

    /**
     * Amount of valid movement.
     * @type {{x: number, y: number}}
     */
    this.move = {x: 0, y: 0};
}

/**
 * Resets the collision info.
 */
CollisionInfo.prototype.reset = function() {
    "use strict";
    this.colliderEntity = null;
    this.targetEntity = null;
    this.colliderBounds = null;
    this.verticalColliderBounds = null;
    this.horizontalColliderBounds = null;
    this.move.x = 0;
    this.move.y = 0;
};

module.exports = CollisionInfo;