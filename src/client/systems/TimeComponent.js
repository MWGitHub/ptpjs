/**
 * @author MW
 * Component with timers.
 */

var Component = require('../../fejs/core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function TimeComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Timers for the entity.
     * Timer calculations are done on the component itself.
     * @type {Array.<{
     *     name: String,
     *     current: Number,
     *     duration: Number,
     *     removeOnComplete: Boolean,
     *     resetOnComplete: Boolean
     * }>}
     */
    this.timers = [];

    this.setParams(params);
}
TimeComponent.prototype = Object.create(Component.prototype);

TimeComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        // Copy all the timers.
        if (params.timers) {
            for (var i = 0; i < params.timers.length; i++) {
                var values = params.timers[i];
                this.timers.push({
                    name: values.name,
                    current: values.current || 0,
                    duration: values.duration || 0,
                    removeOnComplete: values.removeOnComplete,
                    resetOnComplete: values.resetOnComplete
                });
            }
        }
    }
};

TimeComponent.type = 'TimeComponent';

module.exports = TimeComponent;
module.exports.type = TimeComponent.type;