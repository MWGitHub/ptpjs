/**
 * @author MW
 * System to deal with moving an object.
 * In order for an object to move it must have a SpatialComponent
 */
var System = require('../../core/system');
var MovementComponent = require('./MovementComponent');
var SpatialComponent = require('../../systems/SpatialComponent');

/**
 * Initializes the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @extends System
 * @constructor
 */
function MovementSystem(entitySystem) {
    "use strict";
    System.call(this);

    this.entitySystem = entitySystem;
}
MovementSystem.prototype = Object.create(System.prototype);

MovementSystem.prototype.update = function(dt) {
    "use strict";

    // Move all spatials by the movement amount.
    var entities = this.entitySystem.getEntities(MovementComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var spatial = entity[SpatialComponent.type];
        if (!entity[SpatialComponent.type]) continue;

        var movement = entity[MovementComponent.type];
        spatial.position.x += movement.move.x;
        spatial.position.y += movement.move.y;
    }
};

MovementSystem.prototype.cleanup = function() {
    "use strict";

    // Reset all the movement for the entity.
    var entities = this.entitySystem.getEntities(MovementComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var movement = entity[MovementComponent.type];
        movement.move.x = 0;
        movement.move.y = 0;
    }
};

module.exports = MovementSystem;
