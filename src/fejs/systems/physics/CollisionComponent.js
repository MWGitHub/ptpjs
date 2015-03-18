/**
 * @author MW
 * Component for collisions.
 */
var Component = require('../../core/Component');

function CollisionComponent(params) {
    "use strict";
    Component.call(this);

    /**
     * Flags if the object can collide with the types.
     * @type {{tiles: boolean, objects: boolean}}
     */
    this.collidesWith = {
        tiles: false,
        objects: false
    };

    /**
     * Flags if the object resolves on collision.
     * @type {{tiles: boolean, objects: boolean}}
     */
    this.resolveFor = {
        tiles: false,
        objects: false
    };

    /**
     * True to allow this object to be used for object resolves.
     * @type {Boolean}
     */
    this.resolvable = false;

    /**
     * Groups the object is part of.
     * @type {Array.<String>}
     */
    this.groups = [];

    /**
     * Groups the object can target.
     * In order to pass collision tests all conditions must be met.
     * The "or" conditions do not need to be met if "and" is met.
     * @type {Array.<String>}
     */
    this.targetAndGroups = [];

    /**
     * Groups the object can target.
     * In order to pass collision tests only one condition must be met and all "and" conditions.
     * @type {Array}
     */
    this.targetOrGroups = [];

    /**
     * Friction to apply when an object is touching this object.
     * @type {{x: number, y: number}}
     */
    this.friction = {x: 0, y: 0};

    /**
     * Flags for each side for if an object was colliding with another static object.
     * @type {{top: boolean, bottom: boolean, left: boolean, right: boolean}}
     */
    this.wasCollidingWith = {
        top: false,
        bottom: false,
        left: false,
        right: false
    };

    /**
     * Flags for each side for if an object is touching a static object.
     * @type {{top: boolean, bottom: boolean, left: boolean, right: boolean}}
     */
    this.isCollidingWith = {
        top: false,
        bottom: false,
        left: false,
        right: false
    };

    /**
     * True to have the object zero speeds on collision.
     * @type {{x: boolean, y: boolean}}
     */
    this.stopsOnCollide = {x: true, y: true};

    /**
     * Entities that this object has targeted and begun colliding with.
     * This is usually reset each frame and used only for sensors.
     * @type {Array.<String>}
     */
    this.startColliding = [];

    /**
     * Entities that this object has targeted and colliding with.
     * Colliding objects are not placed here if they have just begun colliding.
     * This is used only for sensors.
     * @type {Array.<String>}
     */
    this.colliding = [];

    /**
     * Entities that this object is no longer colliding with.
     * This is usually reset each frame and used only for sensors.
     * @type {Array.<String>}
     */
    this.stopColliding = [];

    /**
     * Colliding entities in the previous frame.
     * @type {Array.<Entity>}
     */
    this.previousColliders = [];

    this.setParams(params);
}
CollisionComponent.prototype = Object.create(Component.prototype);

CollisionComponent.prototype.setParams = function(params) {
    "use strict";

    if (params) {
        if (params.collidesWith) {
            this.collidesWith.tiles = params.collidesWith.tiles || this.collidesWith.tiles;
            this.collidesWith.objects = params.collidesWith.objects || this.collidesWith.objects;
        }
        if (params.resolveFor) {
            this.resolveFor.tiles = params.resolveFor.tiles || this.resolveFor.tiles;
            this.resolveFor.objects = params.resolveFor.objects || this.resolveFor.objects;
        }
        this.resolvable = params.resolvable || this.resolvable;
        if (params.friction) {
            this.friction.x = params.friction.x || this.friction.x;
            this.friction.y = params.friction.y || this.friction.y;
        }
        if (params.wasCollidingWith) {
            this.wasCollidingWith.top = params.wasCollidingWith.top || this.wasCollidingWith.top;
            this.wasCollidingWith.bottom = params.wasCollidingWith.bottom || this.wasCollidingWith.bottom;
            this.wasCollidingWith.left = params.wasCollidingWith.left || this.wasCollidingWith.left;
            this.wasCollidingWith.right = params.wasCollidingWith.right || this.wasCollidingWith.right;
        }
        if (params.isCollidingWith) {
            this.isCollidingWith.top = params.isCollidingWith.top || this.isCollidingWith.top;
            this.isCollidingWith.bottom = params.isCollidingWith.bottom || this.isCollidingWith.bottom;
            this.isCollidingWith.left = params.isCollidingWith.left || this.isCollidingWith.left;
            this.isCollidingWith.right = params.isCollidingWith.right || this.isCollidingWith.right;
        }
        if (params.stopsOnCollide) {
            this.stopsOnCollide.x = Component.copyField(params.stopsOnCollide.x, this.stopsOnCollide.x);
            this.stopsOnCollide.y = Component.copyField(params.stopsOnCollide.y, this.stopsOnCollide.y);
        }
        this.groups = params.groups ? this.groups.concat(params.groups) : this.groups;
        if (params.targetAndGroups) {
            this.targetAndGroups = this.targetAndGroups.concat(params.targetAndGroups);
        }
        if (params.targetOrGroups) {
            this.targetOrGroups = this.targetOrGroups.concat(params.targetOrGroups);
        }
        this.startColliding = params.startColliding ? this.startColliding.concat(params.startColliding) : this.startColliding;
        this.colliding = params.colliding ? this.colliding.concat(params.colliding) : this.colliding;
        this.stopColliding = params.stopColliding ? this.stopColliding.concat(params.stopColliding) : this.stopColliding;
        this.previousColliders = Component.copyPrimitiveArray(this.previousColliders, params.previousColliders);
    }
};

CollisionComponent.type = 'CollisionComponent';

module.exports = CollisionComponent;
module.exports.type = CollisionComponent.type;