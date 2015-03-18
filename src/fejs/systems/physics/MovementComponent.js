/**
 * @author MW
 * Component which stores movement information.
 */
var Component = require('../../core/Component');

function MovementComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Amount to move when the movement system is updated.
     * This value is usually calculated instead of setting.
     * @type {{x: number, y: number}}
     */
    this.move = {x: 0, y: 0};

    /**
     * Speed to move during an update.
     * @type {{x: number, y: number}}
     */
    this.speed = {x: 0, y: 0};

    /**
     * Amount to accelerate the speed by per update.
     * @type {{x: number, y: number}}
     */
    this.acceleration = {x: 0, y: 0};

    /**
     * Amount to decelerate by in the opposite direction per update.
     * @type {{x: number, y: number}}
     */
    this.deceleration = {
        x: 0,
        y: 0
    };

    /**
     * Amount to damp the speed by per update.
     * @type {number}
     */
    this.damping = 1.0;

    /**
     * Time before damping starts.
     * @type {number}
     */
    this.dampingDelay = 0;

    /**
     * Counter for starting the damping.
     * @type {{x: number, y: number}}
     */
    this.dampingCounter = {
        x: 0,
        y: 0
    };

    /**
     * Flags for if a direction is damped.
     * @type {{x: boolean, y: boolean}}
     */
    this.isDamped = {x: false, y: false};

    /**
     * Base friction to apply when calculating friction (on the ground, on objects, etc)
     * @type {{x: number, y: number}}
     */
    this.friction = {x: 0, y: 0};

    /**
     * Friction to add other object's friction to for calculations.
     * This value is calculated and is the final friction of the object for the frame.
     * @type {{x: number, y: number}}
     */
    this.calculatedFriction = {x: 0, y: 0};

    /**
     * Absolute maximum movement speed. The entity will never go above this speed.
     * A value of 0 signifies that it has no max.
     * @type {{x: number, y: number}}
     */
    this.maxSpeed = {x: 0, y: 0};

    /**
     * Amount to rotate by per second in radians.
     * @type {number}
     */
    this.angularSpeed = 0;

    this.setParams(params);
}
MovementComponent.prototype = Object.create(Component.prototype);

MovementComponent.prototype.setParams = function(params) {
    "use strict";
    if (params) {
        if (params.move) {
            this.move.x = params.move.x || this.move.x;
            this.move.y = params.move.y || this.move.y;
        }
        if (params.speed) {
            this.speed.x = params.speed.x || this.speed.x;
            this.speed.y = params.speed.y || this.speed.y;
        }
        if (params.acceleration) {
            this.acceleration.x = params.acceleration.x || this.acceleration.x;
            this.acceleration.y = params.acceleration.y || this.acceleration.y;
        }
        if (params.deceleration) {
            this.deceleration.x = Component.copyField(params.deceleration.x, this.deceleration.x);
            this.deceleration.y = Component.copyField(params.deceleration.y, this.deceleration.y);
        }
        this.damping = Component.copyField(params.damping, this.damping);
        this.dampingDelay = Component.copyField(params.dampingDelay, this.dampingDelay);
        if (params.dampingCounter) {
            this.dampingCounter.x = Component.copyField(params.dampingCounter.x, this.dampingCounter.x);
            this.dampingCounter.y = Component.copyField(params.dampingCounter.y, this.dampingCounter.y);
        }
        if (params.isDamped) {
            this.isDamped.x = Component.copyField(params.isDamped.x, this.isDamped.x);
            this.isDamped.y = Component.copyField(params.isDamped.y, this.isDamped.y);
        }
        if (params.friction) {
            this.friction.x = Component.copyField(params.friction.x, this.friction.x);
            this.friction.y = Component.copyField(params.friction.y, this.friction.y);
        }
        if (params.calculatedFriction) {
            this.calculatedFriction.x = params.calculatedFriction.x || 0;
            this.calculatedFriction.y = params.calculatedFriction.x || 0;
        }
        if (params.maxSpeed) {
            this.maxSpeed.x = params.maxSpeed.x || this.maxSpeed.x;
            this.maxSpeed.y = params.maxSpeed.y || this.maxSpeed.y;
        }
        this.angularSpeed = Component.copyField(params.angularSpeed, this.angularSpeed);
    }
};

MovementComponent.type = 'MovementComponent';

module.exports = MovementComponent;
module.exports.type = MovementComponent.type;