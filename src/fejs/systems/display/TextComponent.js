/**
 * @author MW
 * Component for texts which handles changing text properties.
 * A text component does not have a display itself.
 */

var Component = require('../../core/Component');

/**
 * Creates the component.
 * @param {Object} params the default parameters to set for the component.
 * @constructor
 * @extends Component
 */
function TextComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Text to display.
     * @type {string}
     */
    this.text = '';

    /**
     * Style of the font.
     * @type {string}
     */
    this.style = 'bold';

    /**
     * Font to use.
     * @type {string}
     */
    this.font = 'Arial';

    /**
     * Size of the text.
     * @type {string}
     */
    this.size = '16';

    /**
     * Color for filling the text.
     * @type {String}
     */
    this.fill = '#FFFFFF';

    /**
     * Color of the stroke.
     * @type {String}
     */
    this.stroke = '#000000';

    /**
     * Thickness of the stroke.
     * @type {number}
     */
    this.strokeThickness = 3;

    /**
     * Alignment of the text.
     * @type {string}
     */
    this.align = 'left';

    /**
     * True to allow word wrapping.
     * @type {boolean}
     */
    this.wordWrap = false;

    /**
     * Width for word wrapping to occur.
     * @type {number}
     */
    this.wordWrapWidth = 100;


    this.setParams(params);
}
TextComponent.prototype = Object.create(Component.prototype);

TextComponent.prototype.setParams = function (params) {
    "use strict";

    if (params) {
        this.text = Component.copyField(params.text, this.text);
        this.style = Component.copyField(params.style, this.style);
        this.font = Component.copyField(params.font, this.font);
        this.size = Component.copyField(params.size, this.size);
        this.fill = Component.copyField(params.fill, this.fill);
        this.stroke = Component.copyField(params.stroke, this.stroke);
        this.strokeThickness = Component.copyField(params.strokeThickness, this.strokeThickness);
        this.align = Component.copyField(params.align, this.align);
        this.wordWrap = Component.copyField(params.wordWrap, this.wordWrap);
        this.wordWrapWidth = Component.copyField(params.wordWrapWidth, this.wordWrapWidth);
    }
};

TextComponent.type = 'TextComponent';

module.exports = TextComponent;
module.exports.type = TextComponent.type;