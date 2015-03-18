/**
 * @author MW
 * Component for triggering animations.
 * Only one animation may be triggered per frame.
 */

var Component = require('../../core/Component');

/**
 * Structure of an animation.
 * @constructor
 */
function Animation() {
    "use strict";

    /**
     * Frames of the animation.
     * @type {Array.<String>}
     */
    this.frames = [];

    /**
     * Time to stay on each frame.
     * @type {number}
     */
    this.timePerFrame = 32;

    /**
     * Priority of the animation.
     * @type {number}
     */
    this.priority = 0;

    /**
     * Texture to use on stop, overrides stop frame.
     * @type {String}
     */
    this.stopTexture = null;

    /**
     * Frame to switch to when stopped.
     * A negative number will stop on whatever frame the animation was on.
     * @type {number}
     */
    this.stopFrame = 0;

    /**
     * True to loop the animation.
     * @type {boolean}
     */
    this.loop = false;
}

/**
 * Initializes the component.
 * @param params the optional parameters to pass in.
 * @constructor
 * @extends Component
 */
function AnimationComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Animations that can be played.
     * @type {Object.<String, Animation>}
     */
    this.animations = {};

    /**
     * Currently playing animation name.
     * @type {String}
     */
    this.currentAnimation = null;

    /**
     * True to keep looping the animation.
     * @type {Number}
     */
    this.loop = false;

    /**
     * Play the set animation on next update.
     * @type {String}
     */
    this.playAnimation = null;

    /**
     * Set to true to stop the animation.
     * @type {Boolean}
     */
    this.stopAnimation = false;

    /**
     * Texture to display when the animation has stopped playing.
     * This texture is overridden by the currently playing animation stop texture if provided.
     * @type {String}
     */
    this.stopTexture = null;

    /**
     * Frame to go to when stopped.
     * Setting a stopTexture overrides the stop frame.
     * This frame is overridden by the currently playing animation stop frame if provided.
     * @type {Number}
     */
    this.stopFrame = 0;

    /**
     * Animation time to start at.
     * @type {Number}
     */
    this.startTime = 0;

    /**
     * Current priority of the animation.
     * Animations played with lower priority will not be played if one is playing with higher.
     * @type {Number}
     */
    this.currentPriority = 0;

    /**
     * Current time of the playing animation.
     * @type {number}
     */
    this.currentTime = 0;

    this.setParams(params);
}
AnimationComponent.prototype = Object.create(Component.prototype);

AnimationComponent.prototype.setParams = function(params) {
    "use strict";

    if (params) {
        if (params.animations) {
            this.animations = {};
            for (var key in params.animations) {
                var animation = params.animations[key];
                this.animations[key] = {
                    frames: Component.copyPrimitiveArray([], animation.frames),
                    timePerFrame: Component.copyField(animation.timePerFrame, 16),
                    priority: Component.copyField(animation.priority, 0),
                    stopTexture: Component.copyField(animation.stopTexture, null),
                    stopFrame: Component.copyField(animation.stopFrame, 0),
                    loop: Component.copyField(animation.loop, false)
                };
            }
        }
        this.currentAnimation = Component.copyField(params.currentAnimation, this.currentAnimation);
        this.timePerFrame = params.timePerFrame || this.timePerFrame;
        this.loop = params.loop || this.loop;
        this.playAnimation = params.playAnimation || this.playAnimation;
        this.stopAnimation = params.stopAnimation || this.stopAnimation;
        this.stopTexture = params.stopTexture || this.stopTexture;
        this.startTime = params.startTime || this.startTime;
        this.currentPriority = params.currentPriority || this.currentPriority;
        this.stopFrame = params.stopFrame || this.stopFrame;
        this.currentTime = Component.copyField(params.currentTime, this.currentTime);
    }
};

AnimationComponent.type = 'AnimationComponent';

module.exports = AnimationComponent;