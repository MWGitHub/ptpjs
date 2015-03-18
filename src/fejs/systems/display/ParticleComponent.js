/**
 * @author MW
 * Component for particle parameters.
 */

var Component = require('../../core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function ParticleComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * True to have the angle of the particle match the speed.
     * @type {boolean}
     */
    this.angleMatchSpeed = false;

    this.setParams(params);
}
ParticleComponent.prototype = Object.create(Component.prototype);

ParticleComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.angleMatchSpeed = Component.copyField(params.angleMatchSpeed, this.angleMatchSpeed);
    }
};

ParticleComponent.type = 'ParticleComponent';

module.exports = ParticleComponent;
module.exports.type = ParticleComponent.type;