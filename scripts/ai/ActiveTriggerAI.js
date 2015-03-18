/**
 * @author MW
 */
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var ActionComponent = require('../../src/fejs/systems/actions/ActionComponent');
var HotKeys = require('../../src/client/HotKeys');
var ActionSystem = require('../../src/fejs/systems/actions/ActionSystem');

/**
 * @constructor
 * @extends AIScript
 */
function ActiveTriggerAI() {
    "use strict";
    AIScript.call(this);

}
ActiveTriggerAI.prototype = Object.create(AIScript.prototype);

/**
 * Runs on script start.
 * @param {ActiveAI} activeAI the active AI.
 */
ActiveTriggerAI.prototype.onStart = function (activeAI) {
    "use strict";

};

/**
 * Runs when the AI targets an entity.
 * @param {ActiveAI} activeAI the active AI.
 * @param {Entity} previousTarget the previously targeted entity.
 * @param {Entity} target the target entity.
 */
ActiveTriggerAI.prototype.onTarget = function (activeAI, previousTarget, target) {
    "use strict";
};

/**
 * Updates the AI for the entity.
 * @param {ActiveAI} activeAI the active AI script.
 */
ActiveTriggerAI.prototype.update = function (activeAI) {
    "use strict";

    if (!activeAI.target) return;

    var entity = activeAI.entity;
    var actionComponent = entity[ActionComponent.type];
    if (!actionComponent) return;

    var actions = ActionSystem.getActionKeysByHotkey(actionComponent, HotKeys.ACTIVE1);
    actionComponent.triggerActions = actionComponent.triggerActions.concat(actions);
};

ActiveTriggerAI.type = 'ActiveTriggerAI';
module.exports = ActiveTriggerAI;
module.exports.type = ActiveTriggerAI.type;