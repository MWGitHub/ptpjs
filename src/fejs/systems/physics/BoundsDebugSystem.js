/**
 * @author MW
 * Shows bounds for all collidables on an entity.
 */
var System = require('../../core/system');
var BoundsDebugComponent = require('./BoundsDebugComponent');
var AABBComponent = require('./AABBComponent');
var BodyComponent = require('./BodyComponent');

/**
 * Shows debug info for bounds.
 * @param entitySystem the entity system to use.
 * @param scene the scene to attach debug bounds to.
 * @constructor
 */
function BoundsDebugSystem(entitySystem, scene) {
    "use strict";
    System.call(this);

    this.entitySystem = entitySystem;
    this.scene = scene;

    /**
     * Maps entities to bound graphics.
     * @type {Object.<String, PIXI.Graphics>}
     */
    this.aabbMap = {};

    /**
     * Maps entities with shapes.
     * Shapes are mapped by order of the array.
     * @type {Object.<String, Array.<{
     *     shape: Object,
     *     display: PIXI.Graphics
     * }>>}
     */
    this.bodyMap = {};

    var es = entitySystem.getEntities(BoundsDebugComponent.type);
    es.addAddedCallback(this.addAABBDebug.bind(this));
    es.addRemovedCallback(this.removeAABBDebug.bind(this));
    es.addAddedCallback(this.addBodyDebug.bind(this));
    es.addRemovedCallback(this.removeBodyDebug.bind(this));
}
BoundsDebugSystem.prototype = Object.create(System.prototype);

/**
 * Add debug for AABB.
 * @param {Entity} entity the entity to get the components from.
 */
BoundsDebugSystem.prototype.addAABBDebug = function(entity) {
    "use strict";

    var bounds = entity[AABBComponent.type];
    if (!bounds) return;

    var debug = entity[BoundsDebugComponent.type];
    if (!debug.showFor.aabb) return;

    // Create a rectangle.
    var graphics = new PIXI.Graphics();
    graphics.beginFill(debug.color);
    graphics.moveTo(-bounds.width / 2, -bounds.height / 2);
    graphics.lineTo(-bounds.width / 2, bounds.height / 2);
    graphics.lineTo(bounds.width / 2, bounds.height / 2);
    graphics.lineTo(bounds.width / 2, -bounds.height / 2);
    graphics.endFill();

    graphics.alpha = debug.alpha;

    graphics.position.x = bounds.center.x;
    graphics.position.y = bounds.center.y;

    // Add the graphics to the map and scene.
    this.aabbMap[entity.getID()] = graphics;
    this.scene.addChild(graphics);
};

/**
 * Update the AABB debug position.
 * @param {Entity} entity the entity to update.
 * @param context
 */
function updateAABBDebug(entity, context) {
    "use strict";

    var bounds = entity[AABBComponent.type];
    if (!bounds) return;

    var graphics = context.aabbMap[entity.getID()];
    if (!graphics) return;
    graphics.position.x = bounds.center.x;
    graphics.position.y = bounds.center.y;
}

/**
 * Remove AABB debug display for the entity.
 * @param {Entity} entity the entity to remove the display from.
 */
BoundsDebugSystem.prototype.removeAABBDebug = function(entity) {
    "use strict";

    var graphics = this.aabbMap[entity.getID()];
    if (graphics) {
        this.scene.removeChild(graphics);
        delete this.aabbMap[entity.getID()];
    }
};

/**
 * Create body debug graphics.
 * @param {Entity} entity the entity to create the graphics for.
 */
BoundsDebugSystem.prototype.addBodyDebug = function(entity) {
    "use strict";

    var body = entity[BodyComponent.type];
    if (!body) return;

    var debug = entity[BoundsDebugComponent.type];
    if (!debug.showFor.body) return;

    this.bodyMap[entity.getID()] = [];
    var map = this.bodyMap[entity.getID()];
    for (var i = 0; i < body.shapes.length; i++) {
        var shape = body.shapes[i];
        // No shape associated.
        if (!shape.circle && !shape.box && !shape.polygon) continue;

        var graphics = new PIXI.Graphics();
        graphics.beginFill(debug.color);
        if (shape.circle) {
            graphics.drawCircle(0, 0, shape.circle.radius);
        } else if (shape.box) {
            graphics.moveTo(-shape.box.width / 2, -shape.box.height / 2);
            graphics.lineTo(-shape.box.width / 2, shape.box.height / 2);
            graphics.lineTo(shape.box.width / 2, shape.box.height / 2);
            graphics.lineTo(shape.box.width / 2, -shape.box.height / 2);
        } else if (shape.polygon) {
            var vertices = shape.polygon.vertices;
            for (var j = 0; j < vertices.length; j++) {
                var vertex = vertices[j];
                if (j === 0) {
                    graphics.moveTo(vertex.x, vertex.y);
                } else {
                    graphics.lineTo(vertex.x, vertex.y);
                }
            }
        }
        graphics.endFill();
        graphics.alpha = debug.alpha;
        graphics.position.x = shape.position.x;
        graphics.position.y = shape.position.y;
        map.push({shape: shape, display: graphics});
        this.scene.addChild(graphics);
    }
};

function updateBodyDebug(entity, context) {
    "use strict";

    var map = context.bodyMap[entity.getID()];
    for (var i = 0; i < map.length; i++) {
        var shape = map[i].shape;
        var display = map[i].display;

        display.position.x = shape.position.x;
        display.position.y = shape.position.y;
        if (shape.polygon) {
            display.rotation = shape.rotation;
        }
    }
}

BoundsDebugSystem.prototype.removeBodyDebug = function(entity) {
    "use strict";

    var map = this.bodyMap[entity.getID()];
    for (var i = 0; i < map.length; i++) {
        var display = map[i].display;
        this.scene.removeChild(display);
    }
    delete this.bodyMap[entity.getID()];
};

BoundsDebugSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(BoundsDebugComponent.type);

    // Update the graphics position.
    entities.each(updateAABBDebug, this);

    // Update the graphics position.
    entities.each(updateBodyDebug, this);

};

module.exports = BoundsDebugSystem;