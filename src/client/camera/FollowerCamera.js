/**
 * @author MW
 * Camera which follows an entity.
 */

var SpatialComponent = require('../../fejs/systems/SpatialComponent');

/**
 * Creates the camera entity follower.
 * @param {Viewport} viewport the viewport to retrieve the camera from.
 * @param {Entity} entity the entity to follow.
 * @constructor
 */
function FollowerCamera(viewport, entity) {
    "use strict";

    /**
     * Viewport to use for view dimensions and camera.
     * @type {Viewport}
     */
    this.viewport = viewport;

    /**
     * Entity to follow.
     * @type {Entity}
     */
    this.entity = entity;

    /**
     * Edges of where the camera can move.
     * @type {number}
     */
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.bottom = 0;

    /**
     * True to just follow the player without smoothing.
     * @type {boolean}
     */
    this.isSimple = false;

    /**
     * Amount to look ahead of the entity.
     * @type {number}
     */
    this.lookAhead = 0;

    /**
     * Amount to increment the camera by per frame to reach the destination.
     * @type {number}
     */
    this.increment = 2;

    /**
     * True to make the X movement smooth.
     * @type {boolean}
     */
    this.smoothX = true;

    /**
     * Rate to smooth the X and Y directions.
     * @type {{x: number, y: number}}
     */
    this.smoothRate = {
        x: 0.1,
        y: 0.1
    };

    /**
     * Amount to offset the camera by.
     * @type {{x: number, y: number}}
     */
    this.offset = {
        x: 0,
        y: 0
    };

    /**
     * Enables the camera.
     * @type {boolean}
     * @private
     */
    this._isEnabled = true;

    /**
     * Facing direction.
     * @type {number}
     * @private
     */
    this._direction = 1;

    /**
     * Position of the camera's scrolling in the X axis.
     * @type {number}
     * @private
     */
    this._positionX = 0;
}

/**
 * Calculates the camera position without going out of bounds given a point.
 * @param {Number} x the x position to calculate the camera position from.
 * @returns {Number} the calculated x position.
 */
FollowerCamera.prototype.calculateCameraX = function(x) {
    "use strict";

    var camera = this.viewport.camera;
    var cx = x;

    // Make sure the camera does not go out of bounds.
    var width = this.right - this.left;
    var viewWidth = this.viewport.width / camera.scale.x;
    if (viewWidth > width) {
        cx = this.left + width / 2;
    } else if (cx - viewWidth / 2 <= this.left) {
        cx = this.left + viewWidth / 2;
    } else if (cx + viewWidth / 2 >= this.right) {
        cx = this.right - viewWidth / 2;
    }

    return cx;
};

/**
 * Calculates the camera position without going out of bounds given a point.
 * @param {Number} y the y position to calculate the camera position from.
 * @returns {Number} the calculated y position.
 */
FollowerCamera.prototype.calculateCameraY = function(y) {
    "use strict";

    var camera = this.viewport.camera;
    var cy = y;

    // Make sure the camera does not go out of bounds.
    var height = this.bottom - this.top;
    var viewHeight = this.viewport.height / camera.scale.y;
    if (viewHeight > height) {
        cy = this.top + height / 2;
    } else if (cy - viewHeight / 2 <= this.top) {
        cy = this.top + viewHeight / 2;
    } else if (cy + viewHeight / 2 >= this.bottom) {
        cy = this.bottom - viewHeight / 2;
    }

    return cy;
};

/**
 * Updates the camera.
 * @param {Number} dt the time between frames.
 */
FollowerCamera.prototype.update = function(dt) {
    "use strict";

    if (!this._isEnabled) return;

    var spatial = this.entity[SpatialComponent.type];
    if (!spatial) return;

    var camera = this.viewport.camera;

    // Simple camera (easy, no stuttering, and no nausea).
    if (this.isSimple) {
        camera.position.x = this.calculateCameraX(spatial.position.x + this.offset.x);
        camera.position.y = this.calculateCameraY(spatial.position.y + this.offset.y);
        return;
    }

    // Update the direction looking.
    if (spatial.direction !== 0) {
        this._direction = spatial.direction;
    }

    // Move the camera X direction by increments to keep it smooth.
    // Prevent the camera from scrolling when at the edges until further than the edge + center view.
    if (this._direction > 0 && spatial.position.x > this.left + this.viewport.width / 2 / camera.scale.x) {
        if (this._positionX < this.lookAhead) {
            this._positionX += this.increment;
        }
        if (this._positionX > this.lookAhead) {
            this._positionX = this.lookAhead;
        }
    } else if (this._direction < 0 && spatial.position.x < this.right - this.viewport.width / 2 / camera.scale.x) {
        if (this._positionX > -this.lookAhead) {
            this._positionX -= this.increment;
        }
        if (this._positionX < -this.lookAhead) {
            this._positionX = -this.lookAhead;
        }
    }
    if (this.smoothX) {
        var cx = this.calculateCameraX(spatial.position.x + this._positionX);
        var dx = cx - camera.position.x;
        camera.position.x += dx * this.smoothRate.x;
    } else {
        camera.position.x = spatial.position.x + this._positionX;
        // Prevent the camera from moving outside of the bounds.
        camera.position.x = this.calculateCameraX(camera.position.x);
    }

    // Interpolate the camera to the player's Y position.
    var cy = this.calculateCameraY(spatial.position.y);
    var dy = cy - camera.position.y;
    camera.position.y += dy * this.smoothRate.y;
};

/**
 * Instantly moves the camera to the followed entity.
 */
FollowerCamera.prototype.instantMove = function() {
    "use strict";

    if (!this.entity) return;
    var spatial = this.entity[SpatialComponent.type];
    if (!spatial) return;

    var cx = this.calculateCameraX(spatial.position.x);
    var cy = this.calculateCameraY(spatial.position.y);

    this.viewport.camera.position.x = cx;
    this.viewport.camera.position.y = cy;
};

/**
 * Enables the camera.
 */
FollowerCamera.prototype.enable = function() {
    "use strict";

    this._isEnabled = true;
};

/**
 * Disables the camera.
 */
FollowerCamera.prototype.disable = function() {
    "use strict";

    this._isEnabled = false;
};

module.exports = FollowerCamera;