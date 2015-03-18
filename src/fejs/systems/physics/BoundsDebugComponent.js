/**
 * @author MW
 * Component for debugging bounds.
 */
var Component = require('../../core/Component');


function BoundsDebugComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Show the bounds for the type of bounds.
     * @type {{resolved: boolean, body: boolean}}
     */
    this.showFor = {
        aabb: true,
        body: true
    };

    /**
     * Color of the graphics fill.
     * @type {number}
     */
    this.color = 0xFFFF00;

    /**
     * Alpha of the graphics.
     * @type {number}
     */
    this.alpha = 0.5;

    this.setParams(params);
}
BoundsDebugComponent.prototype = Object.create(Component.prototype);

BoundsDebugComponent.prototype.setParams = function(params) {
    "use strict";
    if (params) {
        this.color = params.color || this.color;
        this.alpha = params.alpha || this.alpha;
        if (params.showFor) {
            this.showFor.aabb = params.showFor.aabb || this.showFor.aabb;
            this.showFor.body = params.showFor.body || this.showFor.body;
        }
    }
};

BoundsDebugComponent.type = 'BoundsDebugComponent';

module.exports = BoundsDebugComponent;
module.exports.type = BoundsDebugComponent.type;