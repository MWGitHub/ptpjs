/**
 * @author MW
 * Component to handle displaying of status for an entity.
 */

var Component = require('../../fejs/core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function StatusDisplayComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * True to display hitpoints.
     * @type {boolean}
     */
    this.displayHp = false;


    this.setParams(params);
}
StatusDisplayComponent.prototype = Object.create(Component.prototype);

StatusDisplayComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.displayHp = params.displayHp || this.displayHp;
    }
};

StatusDisplayComponent.type = 'StatusDisplayComponent';

module.exports = StatusDisplayComponent;