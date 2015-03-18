/**
 * @author MW
 * Represents a viewport for pixi.
 * A viewport is not shown until added to a displayable object such as stage.
 * Any scenes added to the viewport will change parents to the viewport's display object.
 * If a width and height is provided the viewport will center at the halves.
 */

/**
 * Represents a scene for the viewport.
 * @constructor
 */
function ViewportScene() {
    "use strict";

    /**
     * Display used for updating with the camera.
     * @type {PIXI.DisplayObjectContainer}
     */
    this.display = new PIXI.DisplayObjectContainer();

    /**
     * True to lock the scene to no longer be scrollable.
     * @type {boolean}
     */
    this.isLocked = false;
}

/**
 * Creates a viewport.
 * @param {Camera} camera the camera to use with the scenes.
 * @param {Number} width the width of the viewport.
 * @param {Number} height the height of the viewport.
 * @constructor
 */
function Viewport(camera, width, height) {
    "use strict";

    /**
     * Main display of the viewport.
     * @type {PIXI.DisplayObjectContainer}
     */
    this.display = new PIXI.DisplayObjectContainer();

    /**
     * Scenes for the viewport.
     * @type {Array.<ViewportScene>}
     */
    this.scenes = [];

    /**
     * Camera to use for offsetting the scenes.
     * @type {Camera}
     */
    this.camera = camera;

    /**
     * Width of the viewport.
     * @type {number}
     */
    this.width = width;

    /**
     * Height of the viewport.
     * @type {number}
     */
    this.height = height;

    /**
     * True to floor the camera.
     * @type {boolean}
     */
    this.isFloored = true;
}

/**
 * Retrieves the calculated camera X position.
 * @returns {number}
 */
Viewport.prototype.getCalculatedCameraX = function() {
    "use strict";

    var x = -this.camera.position.x * this.camera.scale.x + this.width / 2;
    if (this.isFloored) {
        return Math.floor(x);
    } else {
        return x;
    }
};

/**
 * Retrieves the calculated camera Y position.
 * @returns {number}
 */
Viewport.prototype.getCalculatedCameraY = function() {
    "use strict";

    var y = -this.camera.position.y * this.camera.scale.y + this.height / 2;
    if (this.isFloored) {
        return Math.floor(y);
    } else {
        return y;
    }
};

/**
 * Floors all displays and children positions.
 * @param {PIXI.DisplayObjectContainer|PIXI.DisplayObject} display the display to floor.
 */
function floorDisplays(display) {
    "use strict";

    display.position.x = Math.floor(display.position.x);
    display.position.y = Math.floor(display.position.y);

    if (display instanceof PIXI.DisplayObjectContainer) {
        for (var i = 0; i < display.children.length; i++) {
            floorDisplays(display.children[i]);
        }
    }
}

/**
 * Updates the viewport.
 */
Viewport.prototype.update = function() {
    "use strict";

    if (!this.camera) return;

    // Update the view properties.
    for (var i = 0; i < this.scenes.length; i++) {
        var scene = this.scenes[i];
        var display = scene.display;
        display.position.x = this.getCalculatedCameraX();
        display.position.y = this.getCalculatedCameraY();
        display.scale.x = this.camera.scale.x;
        display.scale.y = this.camera.scale.y;
        display.rotation = this.camera.rotation;

        if (scene.isLocked) {
            display.position.x = this.width / 2;
            display.position.y = this.height / 2;
        }
    }
};

/**
 * Add a scene to the viewport.
 * Scenes added will have their parent changed to the viewport display.
 * @param {ViewportScene} scene the scene to add.
 */
Viewport.prototype.addScene = function(scene) {
    "use strict";

    this.display.addChild(scene.display);
    this.scenes.push(scene);
};

/**
 * Remove a scene from the viewport.
 * Scenes removed will no longer have a parent.
 * @param {ViewportScene} scene the scene to remove.
 */
Viewport.prototype.removeScene = function(scene) {
    "use strict";

    this.display.removeChild(scene.display);
    var index = this.scenes.indexOf(scene);
    if (index !== -1) {
        this.scenes.splice(index, 1);
    }
};

Viewport.prototype.addTo = function(object) {
    "use strict";
    object.addChild(this.display);
};

Viewport.prototype.removeFromParent = function() {
    "use strict";
    if (this.display.parent) this.display.parent.removeChild(this.display);
};

module.exports = Viewport;
module.exports.ViewportScene = ViewportScene;
