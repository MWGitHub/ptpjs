/**
 * @author MW
 * Represents a body that is collidable with non-resolved collisions.
 * A body may have multiple shapes attached to it.
 * To change shape properties you must use setComponent.
 * Circles and Boxes have greater performance than polygons as they do not need to be recalculated.
 */

var Component = require('../../core/Component');

function BodyComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Shapes for the bounds.
     * Shapes take in objects with three different formats.
     * Polygons are created counter-clockwise.
     * Omit any of the shape bases to exclude them.
     * If multiple shape types are provided there will be no guarantee on which is created.
     * {
     *  name: String - name of the shape to reference on collisions,
     *  position: {
     *      x: Number,
     *      y: Number
     *  }, - calculated position of the shape.
     *  offset: {
     *      x: Number,
     *      y: Number
     *  }, - Used for offsetting from the Spatial position.
     *  rotation: Number - calculated rotation.
     *  offsetRotation: Number - added to the Spatial rotation if applicable,
     *  circle: {
     *      radius: Number
     *  }
     *  box: {
     *      width: Number,
     *      height: Number
     *  }
     *  polygon: {
     *      vertices: Array.<{
     *          x: Number,
     *          y: Number
     *      }>
     *  }
     * }
     * @type {Array}
     */
    this.shapes = [];

    /**
     * True to allow an entity to collide multiple times with another entity.
     * @type {boolean}
     */
    this.allowMultipleCollide = false;

    this.setParams(params);
}
BodyComponent.prototype = Object.create(Component.prototype);

BodyComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        if (params.shapes) {
            // Copy each individual shape.
            for (var i = 0; i < params.shapes.length; i++) {
                var shape = params.shapes[i];
                var input = {};
                input.name = shape.name;
                input.position = {x: 0, y: 0};
                input.offset = {x: 0, y: 0};
                input.rotation = shape.rotation || 0;
                input.offsetRotation = shape.offsetRotation || 0;
                if (shape.position) {
                    input.position.x = shape.position.x || input.position.x;
                    input.position.y = shape.position.y || input.position.y;
                }
                if (shape.offset) {
                    input.offset.x = shape.offset.x || input.offset.x;
                    input.offset.y = shape.offset.y || input.offset.y;
                }
                if (shape.circle) {
                    input.circle = {radius: 1};
                    input.circle.radius = shape.circle.radius || input.circle.radius;
                }
                if (shape.box) {
                    input.box = {width: 1, height: 1};
                    input.box.width = shape.box.width || input.box.width;
                    input.box.height = shape.box.height || input.box.height;
                }
                if (shape.polygon && shape.polygon.vertices) {
                    if (shape.polygon.vertices.length === 0) continue;
                    input.polygon = {vertices: []};
                    for (var j = 0; j < shape.polygon.vertices.length; j++) {
                        var point = shape.polygon.vertices[j];
                        input.polygon.vertices.push({x: point.x || 0, y: point.y || 0});
                    }
                }
                this.shapes.push(input);
            }
        }
        this.allowMultipleCollide = params.allowMultipleCollide || this.allowMultipleCollide;
    }
};

BodyComponent.type = 'BodyComponent';

module.exports = BodyComponent;
module.exports.type = BodyComponent.type;