/**
 * @author MW
 * Component with position and orientation info on the object.
 */

var Component = require('../core/Component');

function SpatialComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Position of the object.
     * @type {{x: number, y: number}}
     */
    this.position = {x: 0, y: 0};

    /**
     * Scale for the spatial.
     * @type {{x: number, y: number}}
     */
    this.scale = {x: 1, y: 1};

    /**
     * Rotation in radians.
     * @type {number}
     */
    this.rotation = 0;

    /**
     * Direction the entity is facing (does not have to match with rotation).
     * A direction less than 0 is left and greater than 0 is right.
     * @type {number}
     */
    this.direction = 0;

    this.setParams(params);
}
SpatialComponent.prototype = Object.create(Component.prototype);

SpatialComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        if (params.position) {
            this.position.x = params.position.x || this.position.x;
            this.position.y = params.position.y || this.position.y;
        }
        if (params.scale) {
            this.scale.x = params.scale.x || 1;
            this.scale.y = params.scale.y || 1;
        }
        this.rotation = Component.copyField(params.rotation, this.rotation);
        this.direction = Component.copyField(params.direction, this.direction);
    }
};

SpatialComponent.type = 'SpatialComponent';

module.exports = SpatialComponent;
module.exports.type = SpatialComponent.type;