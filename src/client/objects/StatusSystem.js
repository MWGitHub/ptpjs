/**
 * @author MW
 * Handles status effects, invincibility, and stats.
 */
var System = require('../../fejs/core/system');
var StatsComponent = require('./StatsComponent');
var DisplayComponent = require('../../fejs/systems/display/DisplayComponent');
var ActionComponent = require('../../fejs/systems/actions/ActionComponent');

function StatusSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;
}
StatusSystem.prototype = Object.create(System.prototype);

StatusSystem.prototype.updateStun = function(dt, entity) {
    "use strict";

    var stats = entity[StatsComponent.type];

    if (stats.currentStun > 0) {
        stats.currentStun -= dt;
    } else {
        stats.currentStun = 0;
    }

    // Stop all actions from being cast.
    if (stats.currentStun <= 0) return;
    var actionComponent = entity[ActionComponent.type];
    if (!actionComponent) return;

    var actions = actionComponent.actions;
    // Stop any new action casts.
    var i = 0;
    var action;
    while (i < actionComponent.triggerActions.length) {
        action = actions[actionComponent.triggerActions[i]];
        if (!action.unblockable) {
            actionComponent.triggerActions.splice(i, 1);
        } else {
            i++;
        }
    }
    // Stop any current actions.
    for (i = 0; i < actions.length; i++) {
        action = actions[i];
        if (!action.unblockable) {
            actionComponent.stopActions.push(i);
        }
    }
};

StatusSystem.prototype.updateInvincibility = function(dt, entity) {
    "use strict";

    var stats = entity[StatsComponent.type];
    if (stats.currentInvinciblity > 0) {
        stats.currentInvinciblity -= dt;
    } else {
        stats.currentInvinciblity = 0;
    }
};

StatusSystem.prototype.update = function(dt) {
    "use strict";

    // Update common status effects.
    var es = this.entitySystem.getEntities(StatsComponent.type);
    var entities = es.getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];

        this.updateStun(dt, entity);
        this.updateInvincibility(dt, entity);
    }
};

module.exports = StatusSystem;