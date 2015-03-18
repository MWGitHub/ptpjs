/**
 * @author MW
 * Handles calculation of movement.
 */
var System = require('../../core/system');
var CollisionComponent = require('./CollisionComponent');
var MovementComponent = require('./MovementComponent');
var SpatialComponent = require('../../systems/SpatialComponent');
var FEMath = require('../../utility/math');

/**
 * Creates the speed system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @extends System
 * @constructor
 */
function SpeedSystem(entitySystem) {
    "use strict";
    System.call(this);

    this.entitySystem = entitySystem;
}
SpeedSystem.prototype = Object.create(System.prototype);

/**
 * Applies damping to an entity only if it is not accelerating.
 * @param {Entity} entity the entity to damp if possible.
 */
SpeedSystem.prototype.applyDamping = function(entity) {
    "use strict";

    var movement = entity[MovementComponent.type];
    if (!movement) return;

    if (movement.isDamped.x && movement.acceleration.x === 0 &&
        movement.dampingCounter.x > movement.dampingDelay) {
        movement.speed.x *= movement.damping;
    }
    if (movement.isDamped.y && movement.acceleration.y === 0 &&
        movement.dampingCounter.y > movement.dampingDelay) {
        movement.speed.y *= movement.damping;
    }
};

/**
 * Applies deceleration to an entity.
 * @param {Entity} entity the entity to decelerate.
 */
SpeedSystem.prototype.applyDeceleration = function(entity) {
    "use strict";

    var movement = entity[MovementComponent.type];
    if (!movement) return;

    var sign = 0;
    var newSign = 0;
    if (movement.acceleration.x === 0) {
        sign = FEMath.getSign(movement.speed.x);
        movement.speed.x -= sign * movement.deceleration.x;
        newSign = FEMath.getSign(movement.speed.x);
        if (sign !== newSign) {
            movement.speed.x = 0;
        }
    }
    if (movement.acceleration.y === 0) {
        sign = FEMath.getSign(movement.speed.y);
        movement.speed.y -= sign * movement.deceleration.y;
        newSign = FEMath.getSign(movement.speed.y);
        if (sign !== newSign) {
            movement.speed.y = 0;
        }
    }
};

/**
 * Applies acceleration friction to an entity.
 * Acceleration friction is only applied to entities that are accelerating and
 * only modifies the acceleration amount.
 * @param {Entity} entity the entity to apply the friction to.
 */
SpeedSystem.prototype.applyAccelerationFriction = function(entity) {
    "use strict";

    var movement = entity[MovementComponent.type];
    if (!movement) return;

    // Calculate the X friction.
    var friction = 1 - (movement.friction.x + movement.calculatedFriction.x) / 2;
    friction = FEMath.clamp(friction, 0, 1);
    movement.acceleration.x *= friction;
    // Calculate the Y friction.
    friction = 1 - (movement.friction.y + movement.calculatedFriction.y) / 2;
    friction = FEMath.clamp(friction, 0, 1);
    movement.acceleration.y *= friction;
};

/**
 * Applies friction to an entity if the entity is touching a wall..
 * @param {Entity} entity the entity to apply the friction to.
 */
SpeedSystem.prototype.applyFriction = function(entity) {
    "use strict";

    var movement = entity[MovementComponent.type];
    if (!movement) return;

    var collision = entity[CollisionComponent.type];
    if (!collision) return;

    var friction = 0;
    // Calculate the X friction if the bottom or top is being collided with.
    if (movement.acceleration.x === 0 &&
        (collision.isCollidingWith.bottom || collision.isCollidingWith.top)) {
        friction = 1 - (movement.friction.x + movement.calculatedFriction.x) / 2;
        friction = FEMath.clamp(friction, 0, 1);
        movement.speed.x *= friction;
    }
    // Calculate the Y friction if the left or right is being collided with.
    if (movement.acceleration.y === 0 &&
        (collision.isCollidingWith.left || collision.isCollidingWith.right)) {
        friction = 1 - (movement.friction.y + movement.calculatedFriction.y) / 2;
        friction = FEMath.clamp(friction, 0, 1);
        movement.speed.y *= friction;
    }
};

/**
 * Clamps the speed of an entity.
 * @param {Entity} entity the entity to clamp.
 */
SpeedSystem.prototype.clampSpeed = function(entity) {
    "use strict";
    var movement = entity[MovementComponent.type];
    if (!movement) return;

    if (movement.maxSpeed.x !== 0) {
        movement.speed.x = FEMath.clamp(movement.speed.x, -movement.maxSpeed.x, movement.maxSpeed.x);
    }
    if (movement.maxSpeed.y !== 0) {
        movement.speed.y = FEMath.clamp(movement.speed.y, -movement.maxSpeed.y, movement.maxSpeed.y);
    }
};

SpeedSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(MovementComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        // Modify acceleration if needed.
        //this.applyAccelerationFriction(entity);
        var movement = entity[MovementComponent.type];
        // Add the acceleration to the speed.
        movement.speed.x += movement.acceleration.x;
        movement.speed.y += movement.acceleration.y;

        // Update the damping counter.
        if (movement.acceleration.x === 0) {
            movement.dampingCounter.x += dt;
        } else {
            movement.dampingCounter.x = 0;
        }
        if (movement.acceleration.y === 0) {
            movement.dampingCounter.y += dt;
        } else {
            movement.dampingCounter.y = 0;
        }

        // Damp the speed of the entity.
        this.applyDamping(entity);

        // Normally only apply friction when touching things.
        this.applyFriction(entity);

        // Decelerate the entity.
        this.applyDeceleration(entity);

        // Clamp the speed if needed.
        this.clampSpeed(entity);

        // Add the movement amount relative to the update time.
        movement.move.x += movement.speed.x * dt / 1000;
        movement.move.y += movement.speed.y * dt / 1000;

        // Rotate the entity.
        if (movement.angularSpeed !== 0) {
            var spatial = entity[SpatialComponent.type];
            spatial.rotation += movement.angularSpeed * dt / 1000;
        }
    }
};

SpeedSystem.prototype.cleanup = function() {
    "use strict";

    // Reset the acceleration of entities.
    var entities = this.entitySystem.getEntities(MovementComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var movement = entity[MovementComponent.type];
        movement.acceleration.x = 0;
        movement.acceleration.y = 0;

        // Reset the calculated friction.
        movement.calculatedFriction.x = 0;
        movement.calculatedFriction.y = 0;
    }
};

/**
 * Calculates the acceleration for walking without going over manual movement speed.
 * @param {Number} max the maximum movement speed.
 * @param {Number} speed the current speed.
 * @param {Number} currentAcceleration the current acceleration.
 * @param {Number} addedAcceleration the acceleration amount.
 * @returns {number} the amount to accelerate by.
 */
SpeedSystem.addAcceleration = function(max, speed, currentAcceleration, addedAcceleration) {
    "use strict";

    // Do not move without a direction.
    //if (!direction) return 0;
    if (addedAcceleration === 0) return 0;

    var direction = addedAcceleration < 0 ? -1 : 1;

    // Do not need to find limits if there is no movement speed cap.
    if (max === 0) {
        return addedAcceleration;
    }

    // Calculate the next speed before added acceleration.
    var nextSpeed = speed + currentAcceleration;
    // Do nothing if the speed is in the same direction and already faster than max.
    if ((direction > 0 && nextSpeed > max) || (direction < 0 && nextSpeed < -max)) {
        return 0;
    }
    // If the speed after adding acceleration isn't greater than the max then accelerate normally.
    if (direction > 0) {
        if (nextSpeed + addedAcceleration <= max) {
            return addedAcceleration;
        }
    } else {
        if (nextSpeed + addedAcceleration >= -max) {
            return addedAcceleration;
        }
    }

    // Find the limit to make the speed the same as the max movement speed.
    return direction * max - speed - currentAcceleration;
};

module.exports = SpeedSystem;
module.exports.addAcceleration = SpeedSystem.addAcceleration;
