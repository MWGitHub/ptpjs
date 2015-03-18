/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');

/**
 * @constructor
 * @extends ActionScript
 */
function Turn(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Turn.prototype = Object.create(ActionScript.prototype);

/**
 * Runs even when the action is added to the entity.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Turn.prototype.onAdd = function (entity, action, key) {
    "use strict";

};

/**
 * Runs even when the action is not triggered or channeled.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Turn.prototype.onUpdate = function (entity, action, key) {
    "use strict";

};

/**
 * Runs when the action is first triggered or when channeling is complete.
 * Analog actions that are not channeled are always first triggered.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Turn.prototype.onTrigger = function (entity, action, key) {
    "use strict";
};

/**
 * Runs when the action is started.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Turn.prototype.onStart = function (entity, action, key) {
    "use strict";

};

/**
 * Runs when the action is channeled each frame.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Turn.prototype.onActive = function (entity, action, key) {
    "use strict";

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    // Do not allow turning when another turn is active.
    var opposite = action.userData.opposite;
    if (opposite) {
        if (this.gameAPI.entIsActionActive(entity, opposite)) {
            this.gameAPI.entStopAction(entity, key);
            return;
        }
    }

    // Flip the entity if needed.
    if (action.userData.flip) {
        spatial.direction = action.userData.direction;
    }
};

/**
 * Runs when the channeling is stopped before completion.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Turn.prototype.onStop = function (entity, action, key) {
    "use strict";

};

Turn.type = 'Turn';
module.exports = Turn;
module.exports.type = Turn.type;