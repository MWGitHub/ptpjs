/**
 * @author MW
 * Wrapper for displayable objects.
 * Displayable objects should not be used for any logic unless during rendering.
 */
var Component = require('../../core/Component');

/**
 * Sprite display type.
 * @constructor
 */
function Sprite() {
    "use strict";

    /**
     * Texture to use for the sprite.
     * @type {String}
     */
    this.texture = null;

    /**
     * Anchor of the sprite.
     * @type {{x: number, y: number}}
     */
    this.anchor = {x: 0.5, y: 0.5};
}

/**
 * Text display type.
 * Use the text component to modify text.
 * @constructor
 */
function Text() {
    "use strict";

    /**
     * Anchor of the text.
     * @type {{x: number, y: number}}
     */
    this.anchor = {x: 0.5, y: 0.5};
}


/**
 * Character display type.
 * Type can be any displayable type except character.
 * @constructor
 */
function Character() {
    "use strict";

    /**
     * Parts for the character.
     * @type {Array.<{
     *  type: String,
     *  name: String,
     *  anchor: {x: Number, y:Number},
     *  position: {x: Number, y:Number},
     *  rotation: Number,
     *  scale: {x: Number, y: Number},
     *  defaultTexture: String,
     *  animations: Object.<String, Array.<String>>
     * }>}
     */
    this.parts = [];
}

/**
 * Spine display type.
 * @constructor
 */
function Spine() {
    "use strict";

    this.anchor = {x: 0, y: 0};
}

function DisplayComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Type of display (Sprite, Text, Character, Spine).
     * @type {String}
     */
    this.type = null;

    /**
     * Data to use for the display creation.
     * Copied raw so any changes made to this will change others.
     * @type {Sprite|Character|Spine}
     */
    this.data = null;

    /**
     * Displayable object for either PIXI objects or THREEJS objects.
     * @type {PIXI.DisplayObject|THREE.Object3D}
     */
    this.displayable = null;

    /**
     * Position for the displayable.
     * @type {{x: number, y: number, z: number}}
     */
    this.position = {x: 0, y: 0, z: 0};

    /**
     * Scale for the displayable.
     * @type {{x: number, y: number, z: number}}
     */
    this.scale = {x: 1, y: 1, z: 1};

    /**
     * Rotation to use for 2D objects.
     * @type {number}
     */
    this.rotation = 0;

    /**
     * Tint for the object.
     * @type {number}
     */
    this.tint = 0xFFFFFF;

    /**
     * Blend mode for the display.
     * @type {number}
     */
    this.blendMode = 0;

    /**
     * Scale mode for the display.
     * @type {number}
     */
    this.scaleMode = 0;

    /**
     * Parent name to add the display to.
     * Entity names will be based on id.
     * @type {String}
     */
    this.parent = null;

    this.setParams(params);
}
DisplayComponent.prototype = Object.create(Component.prototype);

DisplayComponent.prototype.setParams = function(params) {
    "use strict";

    if (params) {
        this.type = Component.copyField(params.type, this.type);
        this.data = Component.copyField(params.data, this.data);
        this.displayable = Component.copyField(params.displayable, this.displayable);
        if (params.position) {
            this.position.x = Component.copyField(params.position.x, this.position.x);
            this.position.y = Component.copyField(params.position.y, this.position.y);
            this.position.z = Component.copyField(params.position.z, this.position.z);
        }
        if (params.scale) {
            this.scale.x = Component.copyField(params.scale.x, this.scale.x);
            this.scale.y = Component.copyField(params.scale.y, this.scale.y);
            this.scale.z = Component.copyField(params.scale.z, this.scale.z);
        }
        this.rotation = Component.copyField(params.rotation, this.rotation);
        this.tint = Component.copyField(params.tint, this.tint);
        this.blendMode = Component.copyField(params.blendMode, this.blendMode);
        this.scaleMode = Component.copyField(params.scaleMode, this.scaleMode);
        this.parent = Component.copyField(params.parent, this.parent);
    }
};

DisplayComponent.type = 'DisplayComponent';

module.exports = DisplayComponent;
module.exports.type = DisplayComponent.type;