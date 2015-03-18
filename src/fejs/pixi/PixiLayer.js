/**
 * @author MW
 */
var RenderLayer = require('../core/renderlayer');

/**
 * Pixi rendering layer which will use WebGL.
 * @param {HTMLElement} element the element to attach the renderer to.
 * @constructor
 * @extends RenderLayer
 */
function PixiRenderer(element) {
    "use strict";
    RenderLayer.call(this);

    // Renderer for the layer.
    this.renderer = new PIXI.WebGLRenderer(1366, 768);

    /**
     * Stage to add objects to.
     * @type {PIXI.Stage}
     */
    this.stage = new PIXI.Stage();

    element.appendChild(this.renderer.view);
}
PixiRenderer.prototype = Object.create(RenderLayer.prototype);

PixiRenderer.prototype.render = function(dt) {
    "use strict";

    this.renderer.render(this.stage);
};

PixiRenderer.prototype.resize = function(width, height) {
    "use strict";
    this.renderer.resize(width, height);
};

module.exports = PixiRenderer;