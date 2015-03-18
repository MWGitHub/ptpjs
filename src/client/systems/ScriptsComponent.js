/**
 * @author MW
 * Holds which scripts to be run on an event.
 */

var Component = require('../../fejs/core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function ScriptsComponent(params) {
    "use strict";
    Component.call(this);

    /************************************************************************
     * Collision related scripts.
     ************************************************************************/

    /**
     * Script name to run when colliding with sensor tiles.
     * @type {Array.<String>}
     */
    this.sensorTileCollide = [];

    /**
     * Script name to run when colliding with static tiles.
     * @type {Array.<String>}
     */
    this.staticTileCollide = [];

    /**
     * Script name to run when colliding with static bodies.
     * @type {Array.<String>}
     */
    this.staticBodyCollide = [];

    /**
     * Script names to run when colliding with sensor bodies.
     * @type {Array.<String>}
     */
    this.sensorBodyCollide = [];

    /**
     * Script names to run when just starting to collide with sensor bodies.
     * @type {Array.<String>}
     */
    this.bodyStartCollide = [];

    /**
     * Script names to run when just stopping to collide with sensor bodies.
     * @type {Array.<String>}
     */
    this.bodyStopCollide = [];

    /************************************************************************
     * Combat related scripts.
     ************************************************************************/

    /**
     * Scripts to run when the entity first 0 hitpoints (re-runs when no longer dead).
     * @type {Array.<String>}
     */
    this.justDeath = [];

    /**
     * Scripts to run when an entity has just landed on the floor.
     * @type {Array.<String>}
     */
    this.justLand = [];

    /************************************************************************
     * Time related scripts.
     ************************************************************************/

    /**
     * Scripts to run when timed life expires.
     * Timer scripts are mapped to a name with an array of scripts to run.
     * @type {Object.<String, Array.<String>>}
     */
    this.timers = {};

    /**
     * Scripts to run on each update.
     * @type {Array.<String>}
     */
    this.update = [];

    /************************************************************************
     * Level related scripts.
     ************************************************************************/

    /**
     * Scripts to run when the level has started.
     * @type {Array.<String>}
     */
    this.levelStart = [];

    /**
     * Scripts to run when the level has ended.
     * @type {Array.<String>}
     */
    this.levelEnd = [];

    this.setParams(params);
}
ScriptsComponent.prototype = Object.create(Component.prototype);

ScriptsComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.sensorTileCollide = Component.copyPrimitiveArray(this.sensorTileCollide, params.sensorTileCollide);
        this.staticTileCollide = Component.copyPrimitiveArray(this.staticTileCollide, params.staticTileCollide);
        this.sensorBodyCollide = Component.copyPrimitiveArray(this.sensorBodyCollide, params.sensorBodyCollide);
        this.staticBodyCollide = Component.copyPrimitiveArray(this.staticBodyCollide, params.staticBodyCollide);
        this.bodyStartCollide = Component.copyPrimitiveArray(this.bodyStartCollide, params.bodyStartCollide);
        this.bodyStopCollide = Component.copyPrimitiveArray(this.bodyStopCollide, params.bodyStopCollide);
        this.justDeath = Component.copyPrimitiveArray(this.justDeath, params.justDeath);
        this.justLand = Component.copyPrimitiveArray(this.justLand, params.justLand);
        if (params.timers) {
            for (var key in params.timers) {
                if (params.timers.hasOwnProperty(key)) {
                    this.timers[key] = Component.copyPrimitiveArray([], params.timers[key]);
                }
            }
        }
        this.update = Component.copyPrimitiveArray(this.update, params.update);
        this.levelStart = Component.copyPrimitiveArray(this.levelStart, params.levelStart);
        this.levelEnd = Component.copyPrimitiveArray(this.levelEnd, params.levelEnd);
    }
};

ScriptsComponent.type = 'ScriptsComponent';

module.exports = ScriptsComponent;
module.exports.type = ScriptsComponent.type;