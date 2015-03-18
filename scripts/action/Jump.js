/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AnimationComponent = require('../../src/fejs/systems/display/AnimationComponent');
var Random = require('../../src/fejs/utility/Random');

function Jump(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Jump.prototype = Object.create(ActionScript.prototype);

Jump.prototype.onAdd = function(entity, action) {
    "use strict";

    // Set the grace period.
    action.userData.counter = 0;
    action.userData.jumpCounter = 0;
    action.userData.multiJumpGraceCounter = 0;
};

Jump.prototype.onUpdate = function(entity, action) {
    "use strict";

    // Update the grace counter.
    var collision = entity[CollisionComponent.type];
    if (collision.isCollidingWith.bottom) {
        action.userData.counter = 0;

        // Update the multi jumping.
        action.userData.multiJumpGraceCounter += action.timePerFrame;
    } else {
        action.userData.counter += action.timePerFrame;
    }

    // Reset the multiple jumps if timer is past.
    var multiJumpGrace = action.userData.multiJumpGrace || 0;
    if (action.userData.multiJumpGraceCounter >= multiJumpGrace) {
        action.userData.jumpCounter = 0;
    }
};

Jump.prototype.onTrigger = function(entity, action) {
    "use strict";
};

Jump.prototype.onStart = function(entity, action) {
    "use strict";

    if (!entity) return;
    var stats = entity[StatsComponent.type];
    if (!stats) return;
    var movement = entity[MovementComponent.type];
    if (!movement) return;
    var collision = entity[CollisionComponent.type];
    if (!collision) return;

    var isOnGround = collision.isCollidingWith.bottom;
    var grace = action.userData.grace;
    if (!isOnGround && grace) {
        isOnGround = action.userData.counter < grace;
    }

    if (isOnGround) {
        movement.speed.y = 0;
        movement.acceleration.y += this.gameAPI.entGetModStat(entity, 'jumpAcceleration',
            stats.jumpAcceleration);
        // Reset the grace period.
        action.userData.counter = Number.MAX_VALUE;

        // Play the jump animation.
        var aniCom = entity[AnimationComponent.type];
        if (aniCom) {
            aniCom.playAnimation = 'jump';
            aniCom.loop = false;
        }
    } else {
        action.isStopped = true;
    }
};

Jump.prototype.onActive = function(entity, action) {
    "use strict";

    if (!entity) return;
    var stats = entity[StatsComponent.type];
    if (!stats) return;
    var movement = entity[MovementComponent.type];
    if (!movement) return;

    // Negate some gravity while holding jump unless head hits ceiling.
    if (movement.speed.y < 0) {
        movement.acceleration.y -= this.gameAPI.entGetModStat(entity, 'gravity.y',
            stats.gravity.y / 2);
    }

    // Create jumping particles.
    if (action.userData.particle) {
        var spatial = entity[SpatialComponent.type];
        var aabb = entity[AABBComponent.type];
        if (spatial && aabb) {
            var x = spatial.position.x;
            var y = spatial.position.y;
            if (aabb) {
                if (spatial.direction < 0) {
                    x += aabb.width / 2;
                } else {
                    x -= aabb.width / 2;
                }
                //y += aabb.height / 2;
            }
            this.gameAPI.createPointParticles(action.userData.particle, x, y, 50, 1);
        }
    }
};

Jump.prototype.onStop = function(entity, action) {
    "use strict";
};

Jump.type = 'Jump';
module.exports = Jump;