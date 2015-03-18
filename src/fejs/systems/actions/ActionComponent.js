/**
 * @author MW
 * Component for holding available actions and information.
 */

var Component = require('../../core/Component');

/**
 * Structure of an action.
 * This action class is never created and is used only for typing.
 * @param params the parameters to set for the action.
 * @constructor
 */
function Action(params) {
    "use strict";

    /**
     * Status of the action.
     * @type {number}
     */
    this.status = 0;

    /**
     * True to mark the action as active.
     * @type {boolean}
     */
    this.isActive = false;

    /**
     * Hotkey for the action.
     * @type {null}
     */
    this.hotkey = null;

    /**
     * True to only trigger when the hotkey is just down.
     * @type {boolean}
     */
    this.justDownOnly = false;

    /**
     * Script to run when the action is triggered.
     * @type {null}
     */
    this.script = null;

    /**
     * Time before the action is triggered in milliseconds (like channeling).
     * @type {number}
     */
    this.castTime = 0;

    /**
     * Duration the action is being cast.
     * @type {number}
     */
    this.duration = 0;

    /**
     * Cooldown of the action in milliseconds.
     * @type {number}
     */
    this.cooldown = 0;

    /**
     * Starting cooldown for the action.
     * @type {number}
     */
    this.currentCooldown = 0;

    /**
     * True to set that the action is channeled which allows it to be stopped manually.
     * @type {boolean}
     */
    this.isChanneled = false;

    /**
     * True to block other actions while casting.
     * @type {boolean}
     */
    this.blockActions = false;

    /**
     * True to make the action unblockable.
     * @type {boolean}
     */
    this.unblockable = false;

    /**
     * True to stop the action.
     * @type {boolean}
     */
    this.isStopped = false;

    /**
     * Time per frame for the action updates.
     * @type {number}
     */
    this.timePerFrame = 16;

    /**
     * Data specific to the action.
     * @type {Object}
     */
    this.userData = {};

    // Copy the parameters into the action.
    for (var prop in params) {
        this[prop] = params[prop];
    }
}

function ActionComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Available actions for use.
     * @type {Object.<String, Action>}
     */
    this.actions = {};

    /**
     * True to prevent actions from being cast while blocked.
     * @type {Boolean}
     */
    this.areActionsBlocked = false;

    /**
     * Actions to trigger by action name.
     * @type {Array.<String>}
     */
    this.triggerActions = [];

    /**
     * Actions to stop by action name.
     * @type {Array.<String>}
     */
    this.stopActions = [];

    this.setParams(params);
}
ActionComponent.prototype = Object.create(Component.prototype);

ActionComponent.prototype.setParams = function(params) {
    "use strict";

    if (params) {
        // Copy the action without changing the input.
        if (params.actions) {
            for (var actionKey in params.actions) {
                if (!params.actions.hasOwnProperty(actionKey)) continue;

                var action = params.actions[actionKey];
                // Ignore string actions.
                if (typeof action === 'string') continue;
                // Clone object actions.
                this.actions[actionKey] = new Action(JSON.parse(JSON.stringify(action)));
            }
        }
        this.areActionsBlocked = false;
        this.triggerActions = params.triggerActions ? this.triggerActions.concat(params.triggerActions) : [];
        this.stopActions = params.stopActions ? this.stopActions.concat(params.stopActions) : [];
    }
};

ActionComponent.type = 'ActionComponent';

module.exports = ActionComponent;
module.exports.type = ActionComponent.type;