/**
 * @author MW
 * Base script for actions.
 */
function ActionScript() {
    "use strict";

}

/**
 * Runs when the entity just had the action added in.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
ActionScript.prototype.onAdd = function(entity, action, key) {
    "use strict";

};

/**
 * Runs even when the action is not triggered or channeled.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
ActionScript.prototype.onUpdate = function(entity, action, key) {
    "use strict";

};

/**
 * Runs when an action has started.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
ActionScript.prototype.onStart = function(entity, action, key) {
    "use strict";

};

/**
 * Runs when the action is first triggered or when channeling is complete.
 * Analog actions that are not channeled are always first triggered.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
ActionScript.prototype.onTrigger = function(entity, action, key) {
    "use strict";

};

/**
 * Runs when the action is active each frame.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
ActionScript.prototype.onActive = function(entity, action, key) {
    "use strict";

};

/**
 * Runs when the action is stopped before completion.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
ActionScript.prototype.onStop = function(entity, action, key) {
    "use strict";

};

/**
 * Type used for loading scripts.
 * @type {string}
 */
ActionScript.type = 'ActionScript';

module.exports = ActionScript;