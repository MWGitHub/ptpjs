/**
 * @author MW
 * The modifier component does not have any fields. Instead it is referenced by
 * the type of modifier and the field name.
 */

var Component = require('../../fejs/core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function ModifierComponent(params) {
    "use strict";
    Component.call(this);


    this.setParams(params);
}
ModifierComponent.prototype = Object.create(Component.prototype);

ModifierComponent.prototype.setParams = function(params) {
    "use strict";

    if (params) {

    }
};

ModifierComponent.type = 'ModifierComponent';

module.exports = ModifierComponent;
module.exports.type = ModifierComponent.type;