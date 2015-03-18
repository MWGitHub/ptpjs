/**
 * @author MW
 * Script for wall jumping.
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
var AnimationComponent = require('../../src/fejs/systems/display/AnimationComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');

var Random = require('../../src/fejs/utility/Random');

var TileTypes = require('../../src/fejs/systems/physics/TileColliderSystem').TileTypes;
var ModifierState = require('../../src/client/objects/ModifierSystem').States;

var Fields = require('../../src/client/GameAPI').StatFields;

/**
 * Allows an entity to wall jump.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 */
function WallJump(gameAPI) {
    "use strict";
    ActionScript.call(this);

    /**
     * Game API to use.
     * @type {GameAPI}
     */
    this.gameAPI = gameAPI;
}
WallJump.prototype = Object.create(ActionScript.prototype);

WallJump.prototype.onAdd = function(entity, action) {
    "use strict";

    // Last collided direction.
    action.userData.lastDirection = 0;
    // Set the grace period.
    action.userData.counter = 0;
    // Counter for clinging to the wall.
    action.userData.clingCounter = 0;
};

WallJump.prototype.onUpdate = function(entity, action) {
    "use strict";

    // Update the grace counter.
    var collision = entity[CollisionComponent.type];

    var isTouchingWall = collision.isCollidingWith.left || collision.isCollidingWith.right;
    if (collision.isCollidingWith.left) {
        action.userData.lastDirection = -1;
    } else if (collision.isCollidingWith.right) {
        action.userData.lastDirection = 1;
    }
    if (!isTouchingWall) {
        var aabb = entity[AABBComponent.type];
        if (aabb) {
            var left = aabb.center.x - aabb.width / 2 - 1;
            var right = aabb.center.x + aabb.width / 2 + 1;
            var tileLeft = this.gameAPI.getStaticTileAtPoint(left, aabb.center.y);
            var tileRight = this.gameAPI.getStaticTileAtPoint(right, aabb.center.y);
            if (tileLeft === TileTypes.Static) {
                action.userData.lastDirection = -1;
                isTouchingWall = true;
            } else if (tileRight === TileTypes.Static) {
                action.userData.lastDirection = 1;
                isTouchingWall = true;
            }
        }
    }

    var clingTime = action.userData.clingTime;
    if (isTouchingWall) {
        // Reset the grace counter.
        action.userData.counter = 0;

        if (clingTime > 0) {
            // Cling to the wall.
            if (action.userData.clingCounter < clingTime &&
                !collision.isCollidingWith.bottom) {
                this.gameAPI.entSetModifierState(entity, Fields.accelerationX, ModifierState.Zero);
            }
            // Update the cling counter only if the player is moving downwards.
            var movement = entity[MovementComponent.type];
            if (!movement || movement.speed.y >= 0) {
                action.userData.clingCounter += action.timePerFrame;
            }
        }
    } else {
        // Update the grace counter.
        action.userData.counter += action.timePerFrame;
    }

    // Check if should stop clinging to the wall.
    if (clingTime > 0 && (!isTouchingWall || collision.isCollidingWith.bottom ||
        action.userData.clingCounter >= action.userData.clingTime)) {
        this.gameAPI.entSetModifierState(entity, Fields.accelerationX, ModifierState.Normal);
        action.userData.clingCounter = 0;
    }
};

WallJump.prototype.onTrigger = function(entity, action) {
    "use strict";
};

WallJump.prototype.onStart = function(entity, action) {
    "use strict";

    if (!entity) return;
    var movement = entity[MovementComponent.type];
    if (!movement) return;
    var collision = entity[CollisionComponent.type];
    if (!collision) return;

    // Check collisions or a pixel left and right for wall checking.
    var isTouchingWall = collision.isCollidingWith.left || collision.isCollidingWith.right;
    var direction = collision.isCollidingWith.left ? -1 : 1;
    if (!isTouchingWall) {
        var aabb = entity[AABBComponent.type];
        if (aabb) {
            var left = aabb.center.x - aabb.width / 2 - 1;
            var right = aabb.center.x + aabb.width / 2 + 1;
            var tileLeft = this.gameAPI.getStaticTileAtPoint(left, aabb.center.y);
            var tileRight = this.gameAPI.getStaticTileAtPoint(right, aabb.center.y);
            if (tileLeft === TileTypes.Static) {
                direction = -1;
                isTouchingWall = true;
            } else if (tileRight === TileTypes.Static) {
                direction = 1;
                isTouchingWall = true;
            }
        }
    }

    var grace = action.userData.grace || 0;
    if (!isTouchingWall && grace) {
        isTouchingWall = action.userData.counter < grace;
    }

    // Make sure the player isn't able to jump and wall jump at the same time (grace check).
    var isJumping = this.gameAPI.actionSystem.isActionActive(entity, 'Jump');
    if (isTouchingWall && !collision.isCollidingWith.bottom && !isJumping) {
        movement.speed.y = 0;
        movement.speed.x = 0;

        var heightMulti = action.userData.heightMulti || 1;
        var speedMulti = action.userData.speedMulti || 1;
        movement.acceleration.y += this.gameAPI.entGetModStat(entity, Fields.jumpAcceleration) * heightMulti;
        // Use the last direction if available.
        direction = action.userData.lastDirection || direction;
        movement.acceleration.x += this.gameAPI.entGetModStat(entity, Fields.maxMoveSpeedX) * -direction * speedMulti;

        // Play the jump animation.
        var aniCom = entity[AnimationComponent.type];
        if (aniCom) {
            aniCom.playAnimation = 'jump';
            aniCom.loop = false;
        }

        // Reset the grace period.
        action.userData.counter = Number.MAX_VALUE;
    } else {
        action.isStopped = true;
    }
};

WallJump.prototype.onActive = function(entity, action) {
    "use strict";

    if (!entity) return;
    var movement = entity[MovementComponent.type];
    if (!movement) return;

    // Negate some gravity while holding jump unless head hits ceiling.
    if (movement.speed.y < 0) {
        movement.acceleration.y -= this.gameAPI.entGetModStat(entity, Fields.gravityY) / 2;
    }

    // Create jumping particles.
    if (action.userData.particle) {
        var particle = this.gameAPI.createObject(action.userData.particle);
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
            var particleStats = particle[StatsComponent.type];
            particleStats.gravity.x = Random.pickRandomFloat() * 2 - 1;
            particleStats.gravity.y = Random.pickRandomFloat() * 0.5 - 0.25;
            this.gameAPI.entSetPosition(particle, x, y);
            this.gameAPI.entSetRotation(particle, Random.pickRandomFloat() * Math.PI * 2);
        }
    }
};

WallJump.prototype.onStop = function(entity, action) {
    "use strict";
};

WallJump.type = 'WallJump';
module.exports = WallJump;