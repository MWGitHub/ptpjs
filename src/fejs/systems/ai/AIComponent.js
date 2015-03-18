/**
 * @author MW
 * Component for holding AI information.
 */

var Component = require('../../core/Component');

/**
 * Represents a single AI instance.
 * Each AI instance is separate from one another and runs concurrently.
 * Each AI has their own behavior tree.
 * @param params the parameters to set for the AI.
 * @constructor
 */
function AI(params) {
    "use strict";

    /**
     * Behaviors for the AI.
     * @type {Behavior}
     */
    this.behaviors = null;

    /**
     * Rate the script runs at.
     * @type {number}
     */
    this.rate = 0;

    /**
     * Duration the script has run for.
     * @type {Number}
     */
    this.duration = 0;

    /**
     * Counter for when the script should update again.
     * @type {number}
     */
    this.counter = 0;

    /**
     * Amount of time between each update.
     * The period matches the time of the counter before the counter is reset.
     * @type {number}
     */
    this.period = 0;

    /**
     * User data for the AI.
     * @type {Object}
     */
    this.userData = {};

    // Copy the parameters into the action.
    for (var prop in params) {
        this[prop] = params[prop];
    }
}

/**
 * Creates the AI component.
 * @param {Object} params the default parameters.
 * @constructor
 * An AI script has the following layout:
 * {
 *  script: String - Script to run when the script is triggered,
 *  rate: Number - Rate at which the scripts are run.
 *  userData: Object - Data specific to the script,
 * }
 */
function AIComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Scripts to run for the AI as a string.
     * @type {Array.<AI>}
     */
    this.scripts = [];

    /**
     * True to rebuild the behavior tree once.
     * @type {boolean}
     */
    this.shouldRebuild = true;

    this.setParams(params);
}
AIComponent.prototype = Object.create(Component.prototype);

AIComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        // Copy the script without changing the input.
        if (params.scripts) {
            for (var i = 0; i < params.scripts.length; i++) {
                var script = params.scripts[i];
                // Ignore string actions.
                if (typeof script === 'string') continue;
                // Create an instance of the AI (data only).
                this.scripts.push(new AI(JSON.parse(JSON.stringify(script))));
            }
        }
        this.shouldRebuild = Component.copyField(params.shouldRebuild, this.shouldRebuild);
    }
};

AIComponent.type = 'AIComponent';

module.exports = AIComponent;