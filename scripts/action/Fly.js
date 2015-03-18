/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var SpeedSystem = require('../../src/fejs/systems/physics/SpeedSystem');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AnimationComponent = require('../../src/fejs/systems/display/AnimationComponent');
var TileType = require('../../src/fejs/systems/physics/TileColliderSystem').TileTypes;
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');

/**
 * @param {GameAPI} gameAPI the game API to use for checking platforms.
 * @constructor
 * @extends ActionScript
 */
function Fly(gameAPI) {
    "use strict";
    ActionScript.call(this);

    /**
     * Game API for checking for platforms.
     * @type {GameAPI}
     */
    this.gameAPI = gameAPI;
}
Fly.prototype = Object.create(ActionScript.prototype);

/**
 * Runs even when the action is not triggered or channeled.
 * @param {ActiveAction} activeAction the active action.
 */
Fly.prototype.onUpdate = function (activeAction) {
    "use strict";

};

/**
 * Runs when the action is first triggered or when channeling is complete.
 * Analog actions that are not channeled are always first triggered.
 * @param {ActiveAction} activeAction the active action.
 */
Fly.prototype.onTrigger = function (activeAction) {
    "use strict";

};

/**
 * Runs when the action is first channeled.
 * @param {ActiveAction} activeAction the active action.
 */
Fly.prototype.onStart = function (activeAction) {
    "use strict";

};

/**
 * Runs when the action is channeled each frame.
 * @param {ActiveAction} activeAction the active action.
 */
Fly.prototype.onActive = function (activeAction) {
    "use strict";

    var entity = activeAction.entity;

    var movement = entity[MovementComponent.type];
    if (!movement) return;
    var stats = entity[StatsComponent.type];
    if (!stats) return;

    var speed = movement.speed;
    var acceleration = movement.acceleration;
    var statsMax = stats.maxMoveSpeed;
    var statsAcc = stats.acceleration;

    // Move the entity with the maximum manual walk speed.
    acceleration.y += SpeedSystem.addAcceleration(statsMax.y, speed.y, acceleration.y, statsAcc.y,
        activeAction.action.userData.direction);
    // No friction when moving.
    movement.calculatedFriction.y = 0;

    // Check if entity can pass through one way tiles.
    var spatial = entity[SpatialComponent.type];
    var collision = entity[CollisionComponent.type];
    if (spatial && collision && collision.resolveFor.tiles && activeAction.action.userData.direction > 0) {
        var aabb = entity[AABBComponent.type];
        if (aabb) {
            var index = this.gameAPI.getStaticTileAtPoint(aabb.center.x, aabb.center.y + aabb.height / 2 + 1);
            if (index === TileType.OneWayTop ||
                index === TileType.OneWayBottom ||
                index === TileType.OneWayCenter) {
                spatial.position.y++;
            }
        }
    }

    // Play the walking animation.
    var animation = entity[AnimationComponent.type];
    if (!animation) return;
    animation.playAnimation = 'walk';
    animation.loop = true;
};

/**
 * Runs when the channeling is stopped before completion.
 * @param {ActiveAction} activeAction the active action.
 */
Fly.prototype.onStop = function (activeAction) {
    "use strict";

    var entity = activeAction.entity;

    var animation = entity[AnimationComponent.type];
    if (!animation) return;

    if (animation.currentAnimation === 'walk') {
        animation.stopAnimation = true;
    }
};

Fly.type = 'Fly';
module.exports = Fly;
module.exports.type = Fly.type;