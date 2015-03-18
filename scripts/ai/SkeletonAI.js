/**
 * @author MW
 */
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
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
function SkeletonAI(gameAPI) {
    "use strict";
    AIScript.call(this);

    this.gameAPI = gameAPI;
}
SkeletonAI.prototype = Object.create(AIScript.prototype);

/**
 * Have the entity move in a direction at the start.
 * @param {ActiveAI} activeAI the active AI.
 */
SkeletonAI.prototype.onStart = function(activeAI) {
    "use strict";

    activeAI.userData.moveDirection = -1;

    // Move in a direction.
    var entity = activeAI.entity;
    var actions = entity[ActionComponent.type];
    if (actions) {
        var walks = [];
        if (activeAI.userData.moveDirection < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.triggerActions = actions.triggerActions.concat(walks);
    }

    // Counter for changing directions.
    activeAI.userData.counter = 0;
};

/**
 * Runs when the AI targets an entity.
 * @param {ActiveAI} activeAI the active AI.
 * @param {Entity} previousTarget the previous target entity.
 * @param {Entity} target the target entity.
 */
SkeletonAI.prototype.onTarget = function(activeAI, previousTarget, target) {
    "use strict";

};

/**
 * Updates the AI for the entity.
 * @param {ActiveAI} activeAI the active AI script.
 */
SkeletonAI.prototype.update = function(activeAI) {
    "use strict";

    var entity = activeAI.entity;
    var movement = entity[MovementComponent.type];
    if (!movement) return;

    var actions = entity[ActionComponent.type];
    var previousDirection = activeAI.userData.moveDirection;

    // Move in a random direction after the period.
    var period = activeAI.script.userData.directionPeriod;
    if (period) {
        activeAI.userData.counter += activeAI.period;
        if (activeAI.userData.counter >= period) {
            activeAI.userData.moveDirection *= -1;
            activeAI.userData.counter = 0;
        }
    }

    // Switch directions if touching a certain side.
    var aabb = entity[AABBComponent.type];
    // Move right if a wall is hit on the left.
    var index = this.gameAPI.getStaticTileAtPoint(aabb.center.x - aabb.width / 2 - 1, aabb.center.y);
    if (index === Level.TileTypes.Static) {
        activeAI.userData.moveDirection = 1;
    }
    // Move left if a wall is hit on the right.
    index = this.gameAPI.getStaticTileAtPoint(aabb.center.x + aabb.width / 2 + 1, aabb.center.y);
    if (index === Level.TileTypes.Static) {
        activeAI.userData.moveDirection = -1;
    }
    // Move right if there is no floor on the bottom left edge.
    index = this.gameAPI.getStaticTileAtPoint(aabb.center.x - aabb.width / 2 - 1, aabb.center.y + aabb.height / 2 + 1);
    if (index === Level.TileTypes.Empty) {
        activeAI.userData.moveDirection = 1;
    }
    // Move left if there is no floor on the bottom right edge.
    index = this.gameAPI.getStaticTileAtPoint(aabb.center.x + aabb.width / 2 + 1, aabb.center.y + aabb.height / 2 + 1);
    if (index === Level.TileTypes.Empty) {
        activeAI.userData.moveDirection = -1;
    }

    var walks;
    // Walk in the current direction if the entity has stopped.
    if (actions && Math.abs(movement.speed.x) <= 1) {
        walks = [];
        if (activeAI.userData.moveDirection < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.triggerActions = actions.triggerActions.concat(walks);
    }

    // Direction has changed, change movement action if needed.
    if (actions && previousDirection !== activeAI.userData.moveDirection) {
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
        if (activeAI.userData.moveDirection < 0) {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT);
        } else {
            walks = ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT);
        }
        actions.triggerActions = actions.triggerActions.concat(walks);
    }

    var spatial = activeAI.entity[SpatialComponent.type];
    var targetDirection = activeAI.userData.moveDirection;
    if (spatial && activeAI.target) {
        var targetSpatial = activeAI.target[SpatialComponent.type];
        if (spatial.position.x < targetSpatial.position.x) {
            targetDirection = 1;
        } else {
            targetDirection = -1;
        }
    }
    spatial.direction = targetDirection;

    // Face the correct direction.
    if (!spatial) return;

    if (targetDirection < 0) {
        if (spatial.scale.x > 0) {
            spatial.scale.x *= -1;
        }
    } else {
        if (spatial.scale.x < 0) {
            spatial.scale.x *= -1;
        }
    }
};

SkeletonAI.type = 'SkeletonAI';
module.exports = SkeletonAI;
module.exports.type = SkeletonAI.type;