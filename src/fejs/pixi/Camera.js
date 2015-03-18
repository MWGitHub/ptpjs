/**
 * @author MW
 * Represents a camera.
 */

/**
 * Creates the camera.
 * @constructor
 */
function Camera() {
    "use strict";

    /**
     * Camera that is wrapped if any.
     */
    this.camera = null;

    /**
     * Position of the camera.
     */
    this.position = {x: 0, y: 0};

    /**
     * Rotation in radians.
     */
    this.rotation = 0;

    /**
     * Scale for the camera.
     */
    this.scale = {x: 1.0, y: 1.0};
}

/**
 * Updates the wrapped camera to sync with the set values.
 */
Camera.prototype.update = function() {
    "use strict";
};

module.exports = Camera;