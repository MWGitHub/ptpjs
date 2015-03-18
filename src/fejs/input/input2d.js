/**
 * @author MW
 * Provides helpers for handling 2D input.
 */

/**
 * Creates the input.
 * @param {Viewport} viewport the viewport to use for calculating input.
 * @param {Input} input the input to use for calculating input.
 * @constructor
 */
function Input2D(viewport, input) {
    "use strict";

    this.viewport = viewport;
    this.input = input;

    /**
     * Position of the mouse relative to the canvas.
     * @type {{x: number, y: number}}
     */
    this.mouseCanvasPosition = {x: 0, y: 0};

    /**
     * Position of the mouse relative to the viewport.
     * @type {{x: number, y: number}}
     */
    this.mouseViewPosition = {x: 0, y: 0};
}

Input2D.prototype.update = function() {
    "use strict";

    // Update the mouse position.
    var camera = this.viewport.camera;
    this.mouseCanvasPosition.x = this.input.mouseX * this.viewport.width / 2;
    this.mouseCanvasPosition.y = -this.input.mouseY * this.viewport.height / 2;

    this.mouseViewPosition.x = camera.position.x + this.input.mouseX * this.viewport.width / 2 / camera.scale.x;
    this.mouseViewPosition.y = camera.position.y - this.input.mouseY * this.viewport.height / 2 / camera.scale.y;
};

module.exports = Input2D;