/**
 * @author MW
 * Walking action that is usually not synced with the server.
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var SpeedSystem = require('../../src/fejs/systems/physics/SpeedSystem');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AnimationComponent = require('../../src/fejs/systems/display/AnimationComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var FEMath = require('../../src/fejs/utility/math');
var Random = require('../../src/fejs/utility/Random');

var Fields = require('../../src/client/GameAPI').StatFields;

function Walk(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Walk.prototype = Object.create(ActionScript.prototype);

Walk.prototype.onActive = function(entity, action, key) {
    "use strict";

    var movement = entity[MovementComponent.type];
    if (!movement) return;

    // Do not allow walk when another walk is active.
    var opposite = action.userData.opposite;
    if (opposite) {
        if (this.gameAPI.entIsActionActive(entity, opposite)) {
            this.gameAPI.entStopAction(entity, key);
            return;
        }
    }

    var speed = movement.speed;
    var acceleration = movement.acceleration;
    var statsMaxX = this.gameAPI.entGetModStat(entity, Fields.maxMoveSpeedX);

    // Figure out if the acceleration should be air or ground.
    var collision = entity[CollisionComponent.type];
    var statsAccX = 0;
    var direction = action.userData.direction;
    if (collision) {
        if (collision.isCollidingWith.bottom) {
            statsAccX = this.gameAPI.entGetModStat(entity, Fields.accelerationX);
            var moveSign = FEMath.getSign(speed.x);
            if (action.userData.instantSwitch && direction !== moveSign) {
                speed.x = 0;
            }
        } else {
            statsAccX = this.gameAPI.entGetModStat(entity, Fields.airAccelerationX);
        }
    } else {
        statsAccX = this.gameAPI.entGetModStat(entity, Fields.accelerationX);
    }

    // Move the entity with the maximum manual walk speed.
    acceleration.x += SpeedSystem.addAcceleration(statsMaxX, speed.x, acceleration.x,
        statsAccX * direction);
    // No friction when moving.
    movement.calculatedFriction.x = 0;

    // Flip the entity if needed.
    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    if (action.userData.flip) {
        spatial.direction = direction;
    }

    // Show walking particles.
    if (action.userData.particle && collision.isCollidingWith.bottom) {
        var x = spatial.position.x;
        var y = spatial.position.y;
        var aabb = entity[AABBComponent.type];
        if (aabb) {
            if (direction < 0) {
                x -= aabb.width / 2;
            } else {
                x += aabb.width / 2;
            }
            y += aabb.height / 2;
        }
        this.gameAPI.createPointParticles(action.userData.particle, x, y, 10, 1);
    }

    // Play the walking animation.
    var animation = entity[AnimationComponent.type];
    if (!animation) return;
    if (!animation.playAnimation) {

        var allowAnimation = false;
        if (!collision) {
            allowAnimation = true;
        } else {
            if (collision.isCollidingWith.bottom) {
                allowAnimation = true;
            }
        }

        if (allowAnimation) {
            animation.playAnimation = 'walk';
            animation.loop = true;
        }
    }
};

Walk.prototype.onStop = function(entity, action) {
    "use strict";

    var animation = entity[AnimationComponent.type];
    if (!animation) return;

    if (animation.currentAnimation === 'walk') {
        animation.stopAnimation = true;
    }
};

Walk.type = 'Walk';
module.exports = Walk;