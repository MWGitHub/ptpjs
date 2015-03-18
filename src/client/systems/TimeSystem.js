/**
 * @author MW
 * System for handling time events.
 */
var System = require('../../fejs/core/system');
var TimeComponent = require('./TimeComponent');

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 * @extends System
 */
function TimeSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    /**
     * Callbacks when a timer is completed.
     * Function passes in the entity with the timer and the timer object.
     * @type {Array.<Function(Entity, Object)>}
     */
    this.timerCompleteCallbacks = [];
}
TimeSystem.prototype = Object.create(System.prototype);

TimeSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(TimeComponent.type);
    entities.each(function(entity, context) {
        var component = entity[TimeComponent.type];
        var timers = component.timers;

        var i = 0;
        while (i < timers.length) {
            var timer = timers[i];
            timer.current += dt;
            if (timer.current >= timer.duration) {
                if (timer.resetOnComplete) timer.current = 0;
                // Trigger any callbacks for the timer.
                for (var j = 0; j < context.timerCompleteCallbacks.length; j++) {
                    context.timerCompleteCallbacks[j](entity, timer);
                }
                // Remove the timer if needed.
                if (timer.removeOnComplete) {
                    // Re-check if the timer is in the array in case a script removed it.
                    var index = timers.indexOf(timer);
                    if (index >= 0) {
                        timers.splice(i, 1);
                        continue;
                    }
                }
            }
            i++;
        }
    }, this);
};

module.exports = TimeSystem;