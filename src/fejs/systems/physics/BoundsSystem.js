/**
 * @author MW
 * Handles the updating of collidable bounds.
 * Entities with spatials are automatically moved to the spatial position in addition ot offsets for bounds.
 */
var System = require('../../core/system');
var SpatialComponent = require('../../systems/SpatialComponent');
var AABBComponent = require('./AABBComponent');
var BodyComponent = require('./BodyComponent');

function BoundsSystem(entitySystem) {
    "use strict";
    System.call(this);

    this.entitySystem = entitySystem;
}
BoundsSystem.prototype = Object.create(System.prototype);

BoundsSystem.prototype.update = function() {
    "use strict";

    // Update all the AABB bounds.
    var es = this.entitySystem.getEntities(AABBComponent.type);
    var entities = es.getAllRaw();
    var i, entity, spatial;
    for (i = 0; i < entities.length; i++) {
        entity = entities[i];
        spatial = entity[SpatialComponent.type];
        if (!spatial) continue;

        var bounds = entity[AABBComponent.type];
        bounds.center.x = spatial.position.x + bounds.offset.x;
        bounds.center.y = spatial.position.y + bounds.offset.y;
    }

    // Update all the body bounds.
    es = this.entitySystem.getEntities(BodyComponent.type);
    entities = es.getAllRaw();
    var j;
    for (i = 0; i < entities.length; i++) {
        entity = entities[i];
        spatial = entity[SpatialComponent.type];
        if (!spatial) continue;

        var body = entity[BodyComponent.type];
        for (j = 0; j < body.shapes.length; j++) {
            var shape = body.shapes[j];
            shape.position.x = spatial.position.x + shape.offset.x;
            shape.position.y = spatial.position.y + shape.offset.y;
            shape.rotation = spatial.rotation + shape.offsetRotation;
        }
    }
};

module.exports = BoundsSystem;
