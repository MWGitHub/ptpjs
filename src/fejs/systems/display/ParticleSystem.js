/**
 * @author MW
 * System that updates particles.
 */
var System = require('../../core/system');
var ParticleComponent = require('./ParticleComponent');
var MovementComponent = require('../physics/MovementComponent');
var SpatialComponent = require('../SpatialComponent');

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 * @extends System
 */
function ParticleSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

}
ParticleSystem.prototype = Object.create(System.prototype);

ParticleSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(ParticleComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var particle = entity[ParticleComponent.type];

        // Set the angle of the particle to match the speed.
        if (particle.angleMatchSpeed) {
            var movement = entity[MovementComponent.type];
            var spatial = entity[SpatialComponent.type];

            var angle = Math.atan2(movement.speed.y, movement.speed.x);
            spatial.rotation = angle;
        }
    }
};

module.exports = ParticleSystem;