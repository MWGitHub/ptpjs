/**
 * @author MW
 * Walking action that is usually not synced with the server.
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AnimationComponent = require('../../src/fejs/systems/display/AnimationComponent');

var Fields = require('../../src/client/GameAPI').StatFields;

/**
 * Script for running.
 * @constructor
 * @extends ActionScript
 */
function Run(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Run.prototype = Object.create(ActionScript.prototype);

Run.prototype.onStart = function(entity, action) {
    "use strict";

    var multiplier = action.userData.multiplier;
    this.gameAPI.entAddModifier(entity, Fields.accelerationX, 0, multiplier);
    this.gameAPI.entAddModifier(entity, Fields.maxMoveSpeedX, 0, multiplier);

    action.userData.multiplier = multiplier;
};

Run.prototype.onStop = function(entity, action) {
    "use strict";

    var multiplier = action.userData.multiplier;
    this.gameAPI.entAddModifier(entity, Fields.accelerationX, 0, -multiplier);
    this.gameAPI.entAddModifier(entity, Fields.maxMoveSpeedX, 0, -multiplier);
};

Run.type = 'Run';
module.exports = Run;