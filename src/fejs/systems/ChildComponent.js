/**
 * @author MW
 * Component to represent child-parent relationships.
 * A child may only have one parent.
 */

var Component = require('../../fejs/core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function ChildComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Parent entity ID.
     * A parent is set automatically when set as a child.
     * Setting a parent does not update other entity's children.
     * @type {String}
     */
    this.parent = null;

    /**
     * Children of the entity by entity ID.
     * @type {Array.<String>}
     */
    this.children = [];

    /**
     * True to remove all children from the entity system if the parent is removed.
     * @type {boolean}
     */
    this.isLinkedRemove = true;

    this.setParams(params);
}
ChildComponent.prototype = Object.create(Component.prototype);

ChildComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.parent = Component.copyField(params.parent, this.parent);
        this.children = Component.copyPrimitiveArray(this.children, params.children);
        this.isLinkedRemove = Component.copyField(params.isLinkedRemove, this.isLinkedRemove);
    }
};

ChildComponent.type = 'ChildComponent';

module.exports = ChildComponent;
module.exports.type = ChildComponent.type;