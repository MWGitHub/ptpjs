/**
 * @author MW
 */

var Component = require('../../fejs/core/Component');

/**
 * Valid owners.
 * @type {Object}
 */
var Owners = {
    // Neutral owner.
    NEUTRAL: 'neutral',
    // Enemy owner.
    ENEMY: 'enemy',
    // Local player owner.
    PLAYER: 'player'
};

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function OwnerComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Name of the owning player.
     * @type {String}
     */
    this.owner = null;

    /**
     * Optional entity that created this entity.
     * @type {String}
     */
    this.creator = null;

    this.setParams(params);
}
OwnerComponent.prototype = Object.create(Component.prototype);

OwnerComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.owner = params.owner || this.owner;
        this.creator = params.creator || this.creator;
    }
};

OwnerComponent.type = 'OwnerComponent';

module.exports = OwnerComponent;
module.exports.type = OwnerComponent.type;