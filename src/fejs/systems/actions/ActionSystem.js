/**
 * @author MW
 * Handles actions such as movement, abilities, and AI triggering times.
 */
var System = require('../../core/system');
var ActionComponent = require('./ActionComponent');
var SpatialComponent = require('../SpatialComponent');

/**
 * Status for an action.
 * @type {{Idle: number, Running: number, Complete: number, Stopped: number}}
 */
ActionSystem.Status = {
    Idle: 0,
    Running: 1,
    Complete: 2,
    Stopped: -1
};

/**
 * Initializes the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 */
function ActionSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    /**
     * Holds scripts for available actions.
     * @dict
     */
    this.scripts = {};

    /**
     * Callbacks for actions.
     * @type {Array.<Function(entity, Action, String)>}
     */
    this.actionAddCallbacks = [];
    this.actionTriggerCallbacks = [];
    this.actionUpdateCallbacks = [];
    this.actionStartCallbacks = [];
    this.actionStopCallbacks = [];
    this.actionActiveCallbacks = [];

    // Set the add callbacks.
    var es = this.entitySystem.getEntities(ActionComponent.type);
    es.addAddedCallback(this.onAdd.bind(this));
    es.addChangedCallback(this.onAdd.bind(this));
}
ActionSystem.prototype = Object.create(System.prototype);

/**
 * Function to run when an entity is added to the set.
 * @param {Entity} entity the entity that is added.
 */
ActionSystem.prototype.onAdd = function(entity) {
    "use strict";

    var actions = entity[ActionComponent.type].actions;
    for (var key in actions) {
        if (!actions.hasOwnProperty(key)) continue;

        // Create a new active for the action.
        var action = actions[key];
        action.currentCooldown = action.currentCooldown || 0;

        // Run the add script.
        var script = this.scripts[action.script];
        // Ignore actions without scripts.
        if (!script) {
            continue;
        }

        // Always update actions even if not started.
        script.onAdd(entity, action, key);
        for (var j = 0; j < this.actionAddCallbacks.length; j++) {
            this.actionAddCallbacks[j](entity, action, key);
        }
    }
};

/**
 * Resets an active action to the starting state with the same script and entity.
 * @param {Action} action the action to reset.
 */
ActionSystem.prototype.resetAction = function(action) {
    "use strict";

    action.isActive = false;
    action.currentCooldown = action.cooldown;
    action.isStopped = false;
    action.duration = 0;
};

/**
 * Checks if the action should unblock actions for the entity.
 * This allows for multiple blocking actions to be blocking at the same time.
 * @param {Entity} entity the entity to check actions with.
 * @param {Action} unblockingAction the action trying to unblock other actions.
 */
ActionSystem.prototype.unblockActions = function(entity, unblockingAction) {
    "use strict";

    var actionComponent = entity[ActionComponent.type];
    if (!actionComponent) return;

    // Check if there are any blocking active actions.
    var actions = actionComponent.actions;
    var unblock = true;
    for (var actionKey in actions) {
        if (!actions.hasOwnProperty(actionKey)) continue;

        var action = actions[actionKey];
        if (action === unblockingAction) continue;

        if (!action.isActive) continue;

        if (action.blockActions) {
            unblock = false;
            break;
        }
    }

    // No other blocking actions, allow the unblock.
    if (unblock) {
        actionComponent.areActionsBlocked = false;
    }
};

ActionSystem.prototype.update = function(dt) {
    "use strict";

    var entitySet = this.entitySystem.getEntities(ActionComponent.type);

    var actionComponent;
    var entities = entitySet.getAllRaw();
    var i, j, actionKey, entity, action, active;
    for (i = 0; i < entities.length; i++) {
        entity = entities[i];
        actionComponent = entity[ActionComponent.type];
        var actions = actionComponent.actions;
        for (actionKey in actions) {
            action = actions[actionKey];
            // Update the cooldown of each action.
            action.currentCooldown -= dt;
            if (action.currentCooldown < 0) {
                action.currentCooldown = 0;
            }
            // Reset the status of each action.
            action.status = ActionSystem.Status.Idle;
        }

        // Trigger or stop any actions.
        for (j = 0; j < actionComponent.triggerActions.length; j++) {
            if (actionComponent.triggerActions[j] !== -1) {
                this.activateAction(entity, actionComponent.triggerActions[j]);
            }
        }
        for (j = 0; j < actionComponent.stopActions.length; j++) {
            if (actionComponent.stopActions[j] !== -1) {
                this.stopAction(entity, actionComponent.stopActions[j]);
            }
        }
        if (actionComponent.triggerActions.length > 0) {
            actionComponent.triggerActions = [];
        }
        if (actionComponent.stopActions.length > 0) {
            actionComponent.stopActions = [];
        }

        // Update each active action.
        for (actionKey in actions) {
            action = actions[actionKey];
            action.timePerFrame = dt;

            var script = this.scripts[action.script];
            // Ignore actions without scripts.
            if (!script) {
                continue;
            }

            // Always update actions even if not started.
            script.onUpdate(entity, action, actionKey);
            for (j = 0; j < this.actionUpdateCallbacks.length; j++) {
                this.actionUpdateCallbacks[j](entity, action, actionKey);
            }

            // Only active actions will trigger and be activating.
            if (!action.isActive) continue;

            var initialDuration = action.duration;
            action.duration += dt;

            // Run when the action is first started.
            // Started actions will always call this callback unless initial duration is not 0.
            if (initialDuration === 0) {
                script.onStart(entity, action, actionKey);
                for (j = 0; j < this.actionStartCallbacks.length; j++) {
                    this.actionStartCallbacks[j](entity, action, actionKey);
                }
            }

            // Action is ready to be triggered.
            if (action.duration >= action.castTime) {
                // Unblock actions.
                this.unblockActions(entity, action);
                // Trigger the action.
                action.status = ActionSystem.Status.Complete;
                script.onTrigger(entity, action, actionKey);
                for (j = 0; j < this.actionTriggerCallbacks.length; j++) {
                    this.actionTriggerCallbacks[j](entity, action, actionKey);
                }
                this.resetAction(action);
            } else if (action.isStopped) {
                // Stop action immediately (triggered actions will still be triggered).
                this.unblockActions(entity, action);
                // Stop the ability without completing the trigger.
                action.status = ActionSystem.Status.Stopped;
                script.onStop(entity, action, actionKey);
                for (j = 0; j < this.actionStopCallbacks.length; j++) {
                    this.actionStopCallbacks[j](entity, action, actionKey);
                }
                this.resetAction(action);
            } else {
                // Action is active and updated.
                action.status = ActionSystem.Status.Running;
                script.onActive(entity, action, actionKey);
                for (j = 0; j < this.actionActiveCallbacks.length; j++) {
                    this.actionActiveCallbacks[j](entity, action, actionKey);
                }
            }
        }
    }
};

/**
 * Checks if an action should be stopped based on the action key.
 * @param {Entity} entity the entity to check the actions of.
 * @param {Number} key the key of the action.
 */
ActionSystem.prototype.stopAction = function(entity, key) {
    "use strict";

    var actCom = entity[ActionComponent.type];
    if (!actCom) return;

    var action = actCom.actions[key];
    if (!action) return;

    // Only active actions can be stopped.
    if (action.isActive) {
        action.isStopped = true;
    }
};

/**
 * Checks if an action should be triggered based on the active key for the entity.
 * @param {Entity} entity the entity to check the actions of.
 * @param {Number} key the key of the action.
 */
ActionSystem.prototype.activateAction = function(entity, key) {
    "use strict";

    var component = entity[ActionComponent.type];
    if (!component) return;

    var action = component.actions[key];
    if (!action) return;

    // Don't allow an already active action to be activated again.
    if (action.isActive) return;

    // Don't allow actions when blocking other actions.
    if (!action.unblockable && component.areActionsBlocked) return;

    // Handle triggers for standard actions
    if (action.currentCooldown <= 0) {
        // Block actions if needed.
        if (action.blockActions) {
            component.areActionsBlocked = true;
            // Stop all currently blockable actions.
            for (var actionKey in component.actions) {
                // Do not block itself.
                if (component.actions[actionKey] === action) continue;

                component.actions[actionKey].isStopped = true;
            }
        }
        action.duration = 0;
        action.isActive = true;
    }
};

ActionSystem.prototype.addScript = function(key, script) {
    "use strict";
    this.scripts[key] = script;
};

/**
 * Retrieves if an action is active by first action matching the name.
 * @param {Entity} entity the entity to check.
 * @param {String} name the name of the action.
 * @returns {boolean} true if the action is active.
 */
ActionSystem.prototype.isActionActive = function(entity, name) {
    "use strict";

    var isActive = false;

    var actCom = entity[ActionComponent.type];
    if (!actCom) return isActive;

    var action = actCom.actions[name];
    if (!action) return isActive;

    return action.isActive;
};

/**
 * Retrieves actions by string for the given hotkey.
 * @param {ActionComponent} actionComponent the action component to retrieve the indices from.
 * @param {String} hotkey the action hotkey.
 * @returns {Array.<String>} the action keys matching the hotkey.
 */
ActionSystem.getActionKeysByHotkey = function(actionComponent, hotkey) {
    "use strict";

    var keys = [];
    for (var key in actionComponent.actions) {
        if (!actionComponent.actions.hasOwnProperty(key)) continue;

        var action = actionComponent.actions[key];
        if (action.hotkey === hotkey) {
            keys.push(key);
        }
    }

    return keys;
};

module.exports = ActionSystem;
module.exports.getActionKeysByHotkey = ActionSystem.getActionKeysByHotkey;

/**
 * @type {{Idle: number, Running: number, Complete: number, Stopped: number}}
 */
module.exports.Status = ActionSystem.Status;