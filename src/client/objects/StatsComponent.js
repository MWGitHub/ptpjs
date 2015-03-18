/**
 * @author MW
 * Component that holds data for the entity statistics.
 * The statistics should represent the base statistics of an object.
 */

var Component = require('../../fejs/core/Component');

function StatsComponent(params) {
    "use strict";
    Component.call(this);

    /***********************************************
     * Movement stats
     ***********************************************/

    /**
     * Acceleration amount per frame.
     * @type {{x: number, y: number}}
     */
    this.acceleration = {x: 0, y: 0};

    /**
     * Air acceleration to add per frame.
     * @type {{x: number, y: number}}
     */
    this.airAcceleration = {x: 0, y: 0};

    /**
     * Maximum manual movement speed.
     * @type {{x: number, y: number}}
     */
    this.maxMoveSpeed = {x: 0, y: 0};

    /**
     * Acceleration to apply on jump.
     * @type {number}
     */
    this.jumpAcceleration = 0;

    /**
     * Gravity applied to the object each frame.
     * @type {{x: number, y: number}}
     */
    this.gravity = {x: 0, y: 0};

    /**
     * Maximum falling speed and object can have from gravity.
     * A value of 0 signifies unlimited fall speed.
     * @type {number}
     */
    this.maxFallSpeed = 0;

    /***********************************************
     * Knockback stats
     ***********************************************/

    /**
     * Weight of the object.
     * A weight of 0 signifies infinite weight.
     * @type {number}
     */
    this.weight = 0;

    /**
     * Apply an amount of force to the object.
     * The applied force is reset each frame.
     * @type {{x: number, y: number}}
     */
    this.appliedForce = {x: 0, y: 0};

    /***********************************************
     * Combat stats
     ***********************************************/

    /**
     * True to mark the entity as dead.
     * @type {boolean}
     */
    this.isDead = false;

    /**
     * Maximum hitpoints for the entity.
     * @type {number}
     */
    this.maxHitPoints = 0;

    /**
     * Hit points for the object.
     * @type {number}
     */
    this.hitPoints = this.maxHitPoints;

    /**
     * Maximum stamina for the entity.
     * @type {number}
     */
    this.maxStamina = 0;

    /**
     * Current stamina for the entity.
     * @type {number}
     */
    this.stamina = 0;

    /**
     * Damage the object can do.
     * @type {number}
     */
    this.damage = 0;

    /**
     * Damage mitigated when hurt.
     * @type {number}
     */
    this.defense = 0;

    /**
     * Amount of force to apply on hitting other objects.
     * @type {number}
     */
    this.force = 0;

    /**
     * Modifiers for ability cooldowns.
     * @type {number}
     */
    this.cooldown = 1;

    /**
     * Modifier to projectile range.
     * @type {number}
     */
    this.range = 1;

    /**
     * Invinciblity duration when hit.
     * @type {number}
     */
    this.invincibility = 0;

    /**
     * Current invincibility.
     * Zero means the object is not invincible.
     * @type {number}
     */
    this.currentInvinciblity = 0;

    /**
     * Current duration of the stun which prevents some actions to be taken.
     * @type {number}
     */
    this.currentStun = 0;

    this.setParams(params);
}
StatsComponent.prototype = Object.create(Component.prototype);

StatsComponent.prototype.setParams = function(params) {
    "use strict";
    if (params) {
        if (params.acceleration) {
            this.acceleration.x = params.acceleration.x || this.acceleration.x;
            this.acceleration.y = params.acceleration.y || this.acceleration.y;
        }
        if (params.airAcceleration) {
            this.airAcceleration.x = Component.copyField(params.airAcceleration.x, this.airAcceleration.x);
            this.airAcceleration.y = Component.copyField(params.airAcceleration.y, this.airAcceleration.y);
        }
        if (params.maxMoveSpeed) {
            this.maxMoveSpeed.x = params.maxMoveSpeed.x || this.maxMoveSpeed.x;
            this.maxMoveSpeed.y = params.maxMoveSpeed.y || this.maxMoveSpeed.y;
        }
        this.jumpAcceleration = params.jumpAcceleration || this.jumpAcceleration;
        if (params.gravity) {
            this.gravity.x = params.gravity.x || this.gravity.x;
            this.gravity.y = params.gravity.y || this.gravity.y;
        }
        this.maxFallSpeed = Component.copyField(params.maxFallSpeed, this.maxFallSpeed);
        this.weight = params.weight || this.weight;
        if (params.appliedForce) {
            this.appliedForce.x = params.appliedForce.x || this.appliedForce.x;
            this.appliedForce.y = params.appliedForce.y || this.appliedForce.y;
        }

        this.isDead = params.isDead || this.isDead;
        this.maxHitPoints = params.maxHitPoints || this.maxHitPoints;
        this.hitPoints = params.hitPoints || this.maxHitPoints;
        this.maxStamina = Component.copyField(params.maxStamina, this.maxStamina);
        this.stamina = Component.copyField(params.stamina, this.stamina);
        this.damage = params.damage || this.damage;
        this.defense = params.defense || this.defense;
        this.force = params.force || this.force;
        this.cooldown = params.cooldown || this.cooldown;
        this.range = params.range || this.range;
        this.invincibility = params.invincibility || this.invincibility;
        this.currentInvinciblity = params.currentInvinciblity || this.currentInvinciblity;
        this.currentStun = params.currentStun || this.currentStun;
    }
};

StatsComponent.type = 'StatsComponent';

module.exports = StatsComponent;