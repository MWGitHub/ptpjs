/**
 * @author MW
 */
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var Level = require('../../src/client/level/Level');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var ActionComponent = require('../../src/fejs/systems/actions/ActionComponent');
var HotKeys = require('../../src/client/HotKeys');
var ActionSystem = require('../../src/fejs/systems/actions/ActionSystem');

/**
 * Creates the AI manager.
 * @param {GameAPI} gameAPI the API used for the game.
 * @constructor
 * @extends AIScript
 */
function ZombieAI(gameAPI) {
    "use strict";
    AIScript.call(this);

    this.gameAPI = gameAPI;
}
ZombieAI.prototype = Object.create(AIScript.prototype);

/**
 * Have the entity move in a direction at the start.
 * @param {ActiveAI} activeAI the active AI.
 */
ZombieAI.prototype.onStart = function(activeAI) {
    "use strict";

    activeAI.userData.direction = -1;

    // Move in a direction.
    var entity = activeAI.entity;
    var actions = entity[ActionComponent.type];
    if (actions) {
        var walks = [];
        if (activeAI.userData.direction < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.triggerActions = actions.triggerActions.concat(walks);
    }
};

/**
 * Runs when the AI targets an entity.
 * @param {ActiveAI} activeAI the active AI.
 * @param {Entity} previousTarget the previous target entity.
 * @param {Entity} target the target entity.
 */
ZombieAI.prototype.onTarget = function(activeAI, previousTarget, target) {
    "use strict";

};

/**
 * Updates the AI for the entity.
 * @param {ActiveAI} activeAI the active AI script.
 */
ZombieAI.prototype.update = function(activeAI) {
    "use strict";

    var entity = activeAI.entity;
    var movement = entity[MovementComponent.type];
    if (!movement) return;
    var stats = entity[StatsComponent.type];
    if (!stats) return;

    // Move in a direction.
    var actions = entity[ActionComponent.type];
    if (!actions) {
        movement.acceleration.x = activeAI.userData.direction * stats.acceleration.x;
    }

    var collision = entity[CollisionComponent.type];
    if (!collision) return;
    // Switch directions if touching a certain side.
    var aabb = entity[AABBComponent.type];
    if (!aabb) return;

    var previousDirection = activeAI.userData.direction;

    // Move right if a wall is hit on the left.
    if (collision.isCollidingWith.left) {
        activeAI.userData.direction = 1;
    }
    // Move left if a wall is hit on the right.
    if (collision.isCollidingWith.right) {
        activeAI.userData.direction = -1;
    }

    var index;
    // Move right if there is no floor on the bottom left edge.
    index = this.gameAPI.getStaticTileAtPoint(aabb.center.x - aabb.width / 2 - 1, aabb.center.y + aabb.height / 2 + 1);
    if (index === Level.TileTypes.Empty) {
        activeAI.userData.direction = 1;
    }
    // Move left if there is no floor on the bottom right edge.
    index = this.gameAPI.getStaticTileAtPoint(aabb.center.x + aabb.width / 2 + 1, aabb.center.y + aabb.height / 2 + 1);
    if (index === Level.TileTypes.Empty) {
        activeAI.userData.direction = -1;
    }

    var walks;
    // Walk in the current direction if the entity has stopped.
    if (actions && Math.abs(movement.speed.x) <= 1) {
        walks = [];
        if (activeAI.userData.direction < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.triggerActions = actions.triggerActions.concat(walks);
    }

    // Direction has changed, change movement action if needed.
    if (actions && previousDirection !== activeAI.userData.direction) {
        // Stop previous walking.
        walks = [];
        if (previousDirection < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.stopActions = actions.stopActions.concat(walks);
        // Start walking in the new direction.
        walks = [];
        if (activeAI.userData.direction < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.triggerActions = actions.triggerActions.concat(walks);
    }

    // Face the correct direction.
    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    spatial.direction = activeAI.userData.direction;

    if (activeAI.userData.direction < 0) {
        if (spatial.scale.x > 0) {
            spatial.scale.x *= -1;
        }
    } else {
        if (spatial.scale.x < 0) {
            spatial.scale.x *= -1;
        }
    }
};

ZombieAI.type = 'ZombieAI';
module.exports = ZombieAI;
module.exports.type = ZombieAI.type;