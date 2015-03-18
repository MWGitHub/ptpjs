/**
 * @author MW
 * Component with flags and duration of effects on the entity.
 * Setting a flag to true plays the effect and is set to false at the end of the frame.
 * Replaying an effect overwrites the old effect.
 */

var Component = require('../../core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function SfxComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * True to make the entity blink.
     * @type {boolean}
     */
    this.isBlinking = false;
    /**
     * Duration to blink.
     * @type {number}
     */
    this.blinkingDuration = 0;

    /**
     * True to make the entity flash.
     * @type {boolean}
     */
    this.isFlashing = false;
    /**
     * Duration to flash.
     * @type {number}
     */
    this.flashDuration = 200;
    /**
     * Number of times to flash.
     * @type {number}
     */
    this.timesToFlash = 3;
    /**
     * Color of the flash.
     * @type {{r: number, g: number, b: number}}
     */
    this.flashColor = {
        r: 35.0,
        g: 35.0,
        b: 35.0
    };

    this.setParams(params);
}
SfxComponent.prototype = Object.create(Component.prototype);

SfxComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.isBlinking = Component.copyField(params.isBlinking, this.isBlinking);
        this.blinkingDuration = Component.copyField(params.blinkingDuration, this.blinkingDuration);
        this.isFlashing = Component.copyField(params.isFlashing, this.isFlashing);
        this.flashDuration = Component.copyField(params.flashDuration, this.flashDuration);
        this.timesToFlash = Component.copyField(params.timesToFlash, this.timesToFlash);
        if (params.flashColor) {
            this.flashColor.r = Component.copyField(params.flashColor.r, this.flashColor.r);
            this.flashColor.g = Component.copyField(params.flashColor.g, this.flashColor.g);
            this.flashColor.b = Component.copyField(params.flashColor.b, this.flashColor.b);
        }
    }
};

SfxComponent.type = 'SfxComponent';

module.exports = SfxComponent;
module.exports.type = SfxComponent.type;