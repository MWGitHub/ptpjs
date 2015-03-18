/**
 * @author MW
 */

var Component = require('../../fejs/core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function NetworkComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Owner of the component that references the peer.
     * @type {String}
     */
    this.owner = null;

    this.setParams(params);
}
NetworkComponent.prototype = Object.create(Component.prototype);

NetworkComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.owner = params.owner || this.owner;
    }
};

NetworkComponent.type = 'NetworkComponent';

module.exports = NetworkComponent;