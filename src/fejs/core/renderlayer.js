/**
 * Base class for rendering layers.
 * @author MW
 */

function RenderLayer() {
    "use strict";
}

/**
 * Renders the layer.
 * @param {Number} dt time between updates.
 */
RenderLayer.prototype.render = function(dt) {
    "use strict";

};

/**
 * Resizes the rendering layer.
 * @param {Number} width the width of the layer.
 * @param {Number} height the height of the layer.
 */
RenderLayer.prototype.resize = function(width, height) {
    "use strict";

};

module.exports = RenderLayer;