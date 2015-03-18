/**
 * @author MW
 * Component for use with collisions that require resolving.
 */
var Component = require('../../core/Component');

function AABBComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Center of the bounds.
     * @type {{x: number, y: number}}
     */
    this.center = {x: 0, y: 0};

    /**
     * Offset amount for the bounds.
     * @type {{x: number, y: number}}
     */
    this.offset = {x: 0, y: 0};

    /**
     * Width of the bounds.
     * @type {number}
     */
    this.width = 1;

    /**
     * Height of the bounds.
     * @type {number}
     */
    this.height = 1;

    this.setParams(params);
}
AABBComponent.prototype = Object.create(Component.prototype);

AABBComponent.prototype.setParams = function(params) {
    "use strict";
    if (params) {
        if (params.center) {
            this.center.x = params.center.x || 0;
            this.center.y = params.center.y || 0;
        }
        if (params.offset) {
            this.offset.x = params.offset.x || 0;
            this.offset.y = params.offset.y || 0;
        }
        this.width = params.width || 1;
        this.height = params.height || 1;
    }
};

AABBComponent.type = 'AABBComponent';

module.exports = AABBComponent;
module.exports.type = AABBComponent.type;