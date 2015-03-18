/**
 * @author MW
 * Applies force or acceleration to an object.
 */
var System = require('../../fejs/core/system');
var StatsComponent = require('./StatsComponent');
var MovementComponent = require('../../fejs/systems/physics/MovementComponent');
var SpeedSystem = require('../../fejs/systems/physics/SpeedSystem');
var FEMath = require('../../fejs/utility/math');

function ForceSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

}
ForceSystem.prototype = Object.create(System.prototype);

ForceSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(StatsComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var movement = entity[MovementComponent.type];
        if (!movement) continue;

        var stats = entity[StatsComponent.type];

        // Apply gravity only when the gravity is slower than the max movement speed.
        movement.acceleration.x += stats.gravity.x;
        movement.acceleration.y += SpeedSystem.addAcceleration(stats.maxFallSpeed, movement.speed.y,
            movement.acceleration.y, stats.gravity.y, FEMath.getSign(stats.gravity.y));

        // Apply force.
        if (stats.weight > 0) {
            movement.acceleration.x += stats.appliedForce.x / stats.weight;
            movement.acceleration.y += stats.appliedForce.y / stats.weight;
        }

        // Reset forces.
        stats.appliedForce.x = 0;
        stats.appliedForce.y = 0;
    }
};

module.exports = ForceSystem;