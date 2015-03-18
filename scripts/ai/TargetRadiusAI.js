/**
 * @author MW
 */
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AIComponent = require('../../src/fejs/systems/ai/AIComponent');
var FEMath = require('../../src/fejs/utility/math');

/**
 * @param {GameAPI} gameAPI the game API to use for finding targets.
 * @constructor
 * @extends AIScript
 */
function TargetRadiusAI(gameAPI) {
    "use strict";
    AIScript.call(this);

    this.gameAPI = gameAPI;
}
TargetRadiusAI.prototype = Object.create(AIScript.prototype);

/**
 * Runs on script start.
 * @param {ActiveAI} activeAI the active AI.
 */
TargetRadiusAI.prototype.onStart = function (activeAI) {
    "use strict";
};

/**
 * Runs when the AI targets an entity.
 * @param {ActiveAI} activeAI the active AI.
 * @param {Entity} previousTarget the previous target entity.
 * @param {Entity} target the target entity.
 */
TargetRadiusAI.prototype.onTarget = function (activeAI, previousTarget, target) {
    "use strict";
};

/**
 * Updates the AI for the entity.
 * @param {ActiveAI} activeAI the active AI script.
 */
TargetRadiusAI.prototype.update = function (activeAI) {
    "use strict";

    var entity = activeAI.entity;
    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var ai = entity[AIComponent.type];

    // Get the closest player character.
    var closest = this.gameAPI.getClosestPlayerCharacter(spatial.position.x, spatial.position.y);
    if (!closest) return;

    var closestSpatial = closest[SpatialComponent.type];
    if (!closestSpatial) return;

    var cp = closestSpatial.position;

    var radius = activeAI.script.userData.radius;
    var distance2 = FEMath.calcDistancePointsNoRoot(spatial.position.x, spatial.position.y, cp.x, cp.y);
    if (distance2 > radius * radius) {
        ai.target = null;
    } else {
        ai.target = closest.id;
    }
};

TargetRadiusAI.type = 'TargetRadiusAI';
module.exports = TargetRadiusAI;
module.exports.type = TargetRadiusAI.type;