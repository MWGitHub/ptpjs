/**
 * @author MW
 */
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var SpeedSystem = require('../../src/fejs/systems/physics/SpeedSystem');
var ActionComponent = require('../../src/fejs/systems/actions/ActionComponent');
var HotKeys = require('../../src/client/HotKeys');
var ActionSystem = require('../../src/fejs/systems/actions/ActionSystem');

/**
 * Creates the AI manager.
 * @constructor
 * @extends AIScript
 */
function WispAI() {
    "use strict";
    AIScript.call(this);
}
WispAI.prototype = Object.create(AIScript.prototype);

/**
 * Have the entity move in a direction at the start.
 * @param {ActiveAI} activeAI the active AI.
 */
WispAI.prototype.onStart = function(activeAI) {
    "use strict";

    activeAI.userData.direction = -1;
};

/**
 * Runs when the AI targets an entity.
 * @param {ActiveAI} activeAI the active AI.
 * @param {Entity} previousTarget the previous target entity.
 * @param {Entity} target the target entity.
 */
WispAI.prototype.onTarget = function(activeAI, previousTarget, target) {
    "use strict";

};

/**
 * Updates the AI for the entity.
 * @param {ActiveAI} activeAI the active AI script.
 */
WispAI.prototype.update = function(activeAI) {
    "use strict";

    var entity = activeAI.entity;
    var movement = entity[MovementComponent.type];
    if (!movement) return;

    var actions = entity[ActionComponent.type];
    // Stop movement if no target through damping.
    if (!activeAI.target) {
        movement.speed.x *= 0.8;
        movement.speed.y *= 0.8;
        // Stop any actions.
        if (actions) {
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT)
            );
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT)
            );
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.JUMP)
            );
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.DOWN)
            );
        }
        return;
    }

    var stats = entity[StatsComponent.type];
    if (!stats) return;
    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var targetSpatial = activeAI.target[SpatialComponent.type];
    if (!targetSpatial) return;
    var targetPosition = targetSpatial.position;
    var position = spatial.position;

    // Move in a horizontal direction.
    if (position.x - targetPosition.x < 0) {
        activeAI.userData.direction = 1;
    } else {
        activeAI.userData.direction = -1;
    }
    if (actions) {
        if (activeAI.userData.direction > 0) {
            // Trigger the direction.
            actions.triggerActions = actions.triggerActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT)
            );
            // Stop in the opposite direction.
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT)
            );
        } else {
            actions.triggerActions = actions.triggerActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.LEFT)
            );
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.RIGHT)
            );
        }
    } else {
        movement.acceleration.x = SpeedSystem.addAcceleration(stats.maxMoveSpeed.x, movement.speed.x,
            movement.acceleration.x, stats.acceleration.x, activeAI.userData.direction);
    }

    // Move in a vertical direction.
    var verticalDirection = 0;
    if (position.y - targetPosition.y < 0) {
        verticalDirection = 1;
    } else {
        verticalDirection = -1;
    }
    if (actions) {
        if (verticalDirection > 0) {
            actions.triggerActions = actions.triggerActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.DOWN)
            );
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.JUMP)
            );
        } else {
            actions.triggerActions = actions.triggerActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.JUMP)
            );
            actions.stopActions = actions.stopActions.concat(
                ActionSystem.getActionKeysByHotkey(actions, HotKeys.DOWN)
            );
        }
    } else {
        movement.acceleration.y = SpeedSystem.addAcceleration(stats.maxMoveSpeed.y, movement.speed.y,
            movement.acceleration.y, stats.acceleration.y, verticalDirection);
    }

    spatial.direction = activeAI.userData.direction;
};

WispAI.type = 'WispAI';
module.exports = WispAI;
module.exports.type = WispAI.type;