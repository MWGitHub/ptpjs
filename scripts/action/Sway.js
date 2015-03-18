/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');

function Sway() {
    "use strict";
    ActionScript.call(this);

}
Sway.prototype = Object.create(ActionScript.prototype);

Sway.prototype.onActive = function(activeAction) {
    "use strict";

    var entity = activeAction.entity;
    var movement = entity[MovementComponent.type];
    if (!movement) return;

    var action = activeAction.action;
    var userData = action.userData;

    // Flip edges and change duration if over period.
    if (activeAction.duration > userData.period) {
        userData.edge *= -1;
        activeAction.duration = 0;
        if (userData.vertical) {
            movement.speed.y = 0;
        }
        if (userData.horizontal) {
            movement.speed.x = 0;
        }
    }
    // Accelerate in the swaying direction.
    if (userData.vertical) {
        movement.acceleration.y += userData.edge * userData.acceleration;
    }
    if (userData.horizontal) {
        movement.acceleration.x += userData.edge * userData.acceleration;
    }

    // Move in the specified action direction.
    var stats = entity[StatsComponent.type];
    if (!stats) return;
    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;
    if (userData.moveHorizontal) {
        movement.speed.x = stats.maxMoveSpeed.x * spatial.direction;
    }
    if (userData.moveVertical) {
        movement.speed.y = stats.maxMoveSpeed.y * spatial.direction;
    }

};

Sway.type = 'Sway';
module.exports = Sway;