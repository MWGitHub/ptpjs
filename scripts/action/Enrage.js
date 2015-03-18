/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var StatFields = require('../../src/client/GameAPI').StatFields;

/**
 * @constructor
 * @extends ActionScript
 */
function Enrage(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Enrage.prototype = Object.create(ActionScript.prototype);

/**
 * Runs even when the action is added to the entity.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Enrage.prototype.onAdd = function (entity, action, key) {
    "use strict";

};

/**
 * Runs even when the action is not triggered or channeled.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Enrage.prototype.onUpdate = function (entity, action, key) {
    "use strict";

    if (action.isActive) return;

    var stats = entity[StatsComponent.type];
    if (!stats) return;

    var hp = stats.hitPoints;
    var maxHp = this.gameAPI.entGetModStat(entity, StatFields.maxHitPoints);

    var percent = action.userData.hitPointsPercent;

    if (hp / maxHp <= percent) {
        this.gameAPI.entCastAction(entity, key);
    }
};

/**
 * Runs when the action is first triggered or when channeling is complete.
 * Analog actions that are not channeled are always first triggered.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Enrage.prototype.onTrigger = function (entity, action, key) {
    "use strict";
};

/**
 * Runs when the action is started.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Enrage.prototype.onStart = function (entity, action, key) {
    "use strict";

    var speedMult = action.userData.speedMultiplier || 0;
    this.gameAPI.entAddModifier(entity, StatFields.maxMoveSpeedX, 0, speedMult, true);
    this.gameAPI.entAddModifier(entity, StatFields.accelerationX, 0, speedMult, true);
};

/**
 * Runs when the action is channeled each frame.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Enrage.prototype.onActive = function (entity, action, key) {
    "use strict";

};

/**
 * Runs when the channeling is stopped before completion.
 * @param {Entity} entity the entity with the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
Enrage.prototype.onStop = function (entity, action, key) {
    "use strict";

};

Enrage.type = 'Enrage';
module.exports = Enrage;
module.exports.type = Enrage.type;