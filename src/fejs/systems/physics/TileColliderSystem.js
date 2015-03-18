/**
 * @author MW
 * Collides entities with tiles using AABB only.
 * Entities that collide must have a MovementComponent, AABBComponent, and CollisionComponent.
 */
var System = require('../../core/system');
var MovementComponent = require('./MovementComponent');
var AABBComponent = require('./AABBComponent');
var CollisionComponent = require('./CollisionComponent');
var SpatialComponent = require('../SpatialComponent');
var Bounds = require('./Bounds');
var SimpleResolver = require('./SimpleResolver');

/**
 * Initializes the tiles in the collider system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @param {{
 *     tiles: Array.<Array.<Number>>,
 *     staticTiles: Array.<Array.<Number>>,
 *     sensorTiles: Array.<Array.<Number>>,
 *     tileWidth: Number,
 *     tileHeight: Number
 * }} tileInfo the info for tiles.
 * @constructor
 */
function TileColliderSystem(entitySystem, tileInfo) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    /**
     * Resolves tile collisions.
     * @type {SimpleResolver}
     */
    this.simpleResolver = new SimpleResolver();

    /**
     * Tiles to test with.
     * @type {Array.<Array.<Number>>}
     */
    this.tiles = [];

    /**
     * Tiles to test static collisions with.
     * @type {Array.<Array.<Number>>}
     */
    this.staticTiles = [];

    /**
     * Tiles to test sensor collisions with (water, lava, etc).
     * @type {Array.<Array.<Number>>}
     */
    this.sensorTiles = [];

    /**
     * Tile width and height.
     */
    this.tileWidth = 32;
    this.tileHeight = 32;

    /**
     * Settings for tiles.
     */
    this.tileProperties = {
        oneWayHeight: 1
    };

    /**
     * Friction for tiles.
     * @type {{x: Number, y: Number}}
     */
    this.tileFriction = {x: 0.5, y: 0};

    /**
     * Bounds to use for collision calculations.
     * @type {Bounds}
     */
    this.bounds = new Bounds(0, 0, 1, 1);

    /**
     * Indices for tile retrieval.
     * @type {{minX: number, minY: number, maxX: number, maxY: number}}
     * @private
     */
    this._tileIndices = {minX: 0, minY: 0, maxX: 0, maxY: 0};

    /**
     * Callback function for when a static collision occurs.
     * The index favors tiles from the bottom and the left.
     * Parameters are collisionInfo, horizontalIndex, verticalIndex.
     * @type {Array.<Function(CollisionInfo, Number, Number)>}
     */
    this.staticCollisionCallbacks = [];

    /**
     * Callback function for when a sensor collision occurs.
     * @type {Array.<Function(Array.<{x: Number, y:Number, index: Number}>)>}
     */
    this.sensorCollisionCallbacks = [];

    // Set tile info if given.
    if (tileInfo) {
        this.tiles = tileInfo.tiles || this.tiles;
        this.staticTiles = tileInfo.staticTiles || this.staticTiles;
        this.sensorTiles = tileInfo.sensorTiles || this.sensorTiles;
        this.tileWidth = tileInfo.tileWidth || this.tileWidth;
        this.tileHeight = tileInfo.tileHeight || this.tileHeight;
    }
}
TileColliderSystem.prototype = Object.create(System.prototype);

/**
 * Checks if the bounds are within the tiles.
 * @param {Number} minX the left x of the bounds.
 * @param {Number} maxX the right x of the bounds.
 * @param {Number} minY the top of the bounds.
 * @param {Number} maxY the bottom of the bounds.
 * @param {Array.<Array.<Number>>} tiles the tiles to check against.
 * @return {Boolean} true if the bounds are within the tiles.
 */
TileColliderSystem.prototype.isBoundsInTiles = function(minX, maxX, minY, maxY, tiles) {
    "use strict";

    if (!tiles) return false;

    var isOutsideX = (minX < 0 && maxX < 0) ||
        (minX >= tiles[0].length * this.tileWidth && maxX >= tiles[0].length * this.tileWidth);
    var isOutsideY = (minY < 0 && maxY < 0) ||
        (minY >= tiles.length * this.tileHeight && maxY >= tiles.length * this.tileHeight);

    return !(isOutsideX || isOutsideY);
};

/**
 * Normalizes the given tile indices.
 * @param indices the indices to normalize.
 * @param tiles the tiles to normalize to.
 * @returns {{minX: number, minY: number, maxX: number, maxY: number}}
 */
TileColliderSystem.prototype.normalizeIndices = function(indices, tiles) {
    "use strict";
    if (indices.minX < 0) {
        indices.minX = 0;
    }
    if (indices.maxX >= tiles[0].length) {
        indices.maxX = tiles[0].length - 1;
    }
    if (indices.minY < 0) {
        indices.minY = 0;
    }
    if (indices.maxY >= tiles.length) {
        indices.maxY = tiles.length - 1;
    }

    return this._tileIndices;
};

/**
 * Retrieves the tile indices from the bounds.
 * The indices are shared so use the indices before getting bounds again.
 * @param {Number} minX the left x of the bounds.
 * @param {Number} maxX the right x of the bounds.
 * @param {Number} minY the top of the bounds.
 * @param {Number} maxY the bottom of the bounds.
 * @return {{minX: number, minY: number, maxX: number, maxY: number}} the tile indices.
 */
TileColliderSystem.prototype.getTileIndicesFromBounds = function(minX, maxX, minY, maxY) {
    "use strict";

    this._tileIndices.minX = Math.floor(minX / this.tileWidth);
    this._tileIndices.maxX = Math.floor(maxX / this.tileWidth);
    this._tileIndices.minY = Math.floor(minY / this.tileHeight);
    this._tileIndices.maxY = Math.floor(maxY / this.tileHeight);

    return this._tileIndices;
};

/**
 * Sets the bounds to be the same as the given entity.
 * @param {Entity} entity the entity to get the bounds of.
 * @param {Bounds} bounds the bounds ot modify.
 * @returns {Bounds} the modified bounds.
 */
function setBoundsForEntity(entity, bounds) {
    "use strict";

    var boundsComponent = entity[AABBComponent.type];
    if (!boundsComponent) return bounds;

    bounds.x = boundsComponent.center.x;
    bounds.y = boundsComponent.center.y;
    bounds.width = boundsComponent.width;
    bounds.height = boundsComponent.height;

    return bounds;
}

/**
 * Collides an entity with the given tiles without resolving.
 * @param {Entity} entity the entity to test collisions with.
 * @param {Array.<Array.<Number>>} tiles the tiles to test against.
 */
TileColliderSystem.prototype.collideSensor = function(entity, tiles) {
    "use strict";

    // Check if the entity is valid.
    var boundsComponent = entity[AABBComponent.type];
    if (!boundsComponent) return;

    // Create a temporary bounds.
    this.bounds = setBoundsForEntity(entity, this.bounds);

    // Calculate the tile indices it overlaps.
    var left = this.bounds.getLeft();
    var right = this.bounds.getRight();
    var top = this.bounds.getTop();
    var bottom = this.bounds.getBottom();

    // Ignore entity if outside of bounds.
    if (!this.isBoundsInTiles(left, right, top, bottom, tiles)) return;

    // Create an array of bounds.
    var collisions = [];
    this._tileIndices = this.normalizeIndices(this.getTileIndicesFromBounds(left, right, top, bottom), tiles);
    for (var y = this._tileIndices.minY; y <= this._tileIndices.maxY; y++) {
        for (var x = this._tileIndices.minX; x <= this._tileIndices.maxX; x++) {
            var tileIndex = tiles[y][x];
            // Ignore blank tiles.
            if (tileIndex === 0) continue;

            var info = {
                x: x * this.tileWidth + this.tileWidth / 2,
                y: y * this.tileWidth + this.tileWidth / 2,
                index: tileIndex
            };
            collisions.push(info);
        }
    }
    if (collisions.length > 0) {
        for (var i = 0; i < this.sensorCollisionCallbacks.length; i++) {
            this.sensorCollisionCallbacks[i](entity, collisions);
        }
    }
};

/**
 * Collides an entity with the given tiles.
 * @param {Entity} entity the entity to test collisions with.
 * @param {Array.<Array.<Number>>} tiles the tiles to test against.
 */
TileColliderSystem.prototype.collide = function(entity, tiles) {
    "use strict";

    // Check if the entity is valid.
    var boundsComponent = entity[AABBComponent.type];
    if (!boundsComponent) return;
    var movement = entity[MovementComponent.type];
    if (!movement) return;
    // Reset the ground state.
    var collision = entity[CollisionComponent.type];
    if (!collision.resolveFor.tiles) return;
    // Update the collision side flags.
    collision.wasCollidingWith.top = collision.isCollidingWith.top;
    collision.wasCollidingWith.bottom = collision.isCollidingWith.bottom;
    collision.wasCollidingWith.left = collision.isCollidingWith.left;
    collision.wasCollidingWith.right = collision.isCollidingWith.right;
    collision.isCollidingWith.top = false;
    collision.isCollidingWith.bottom = false;
    collision.isCollidingWith.left = false;
    collision.isCollidingWith.right = false;

    // Create a temporary bounds.
    this.bounds = setBoundsForEntity(entity, this.bounds);
    this.bounds.addToBounds(movement.move.x, movement.move.y);

    // Calculate the tile indices it overlaps.
    var left = this.bounds.getLeft();
    var right = this.bounds.getRight();
    var top = this.bounds.getTop();
    var bottom = this.bounds.getBottom();

    // Ignore entity if outside of bounds.
    if (!this.isBoundsInTiles(left, right, top, bottom, tiles)) return;

    // Create an array of bounds.
    this._tileIndices = this.normalizeIndices(this.getTileIndicesFromBounds(left, right, top, bottom), tiles);
    var tileBounds = [];
    var box, x, y, tileIndex;
    for (y = this._tileIndices.minY; y <= this._tileIndices.maxY; y++) {
        for (x = this._tileIndices.minX; x <= this._tileIndices.maxX; x++) {
            tileIndex = tiles[y][x];
            // Ignore blank tiles.
            if (tileIndex === TileColliderSystem.TileTypes.Empty ||
                tileIndex === TileColliderSystem.TileTypes.RampBottomLeft ||
                tileIndex === TileColliderSystem.TileTypes.RampBottomRight ||
                tileIndex === TileColliderSystem.TileTypes.RampTopLeft ||
                tileIndex === TileColliderSystem.TileTypes.RampTopRight) continue;

            box = null;
            // Use a pool if required.
            switch (tileIndex) {
                case TileColliderSystem.TileTypes.OneWayTop:
                    // Only allow one way for resolution.
                    box = new Bounds(
                        x * this.tileWidth + this.tileWidth / 2,
                        y * this.tileHeight + this.tileProperties.oneWayHeight / 2,
                        this.tileWidth, this.tileProperties.oneWayHeight);
                    box.resolve.left = false;
                    box.resolve.right = false;
                    box.resolve.bottom = false;
                    break;
                case TileColliderSystem.TileTypes.OneWayBottom:
                    // Only allow one way for resolution.
                    box = new Bounds(
                        x * this.tileWidth + this.tileWidth / 2,
                        y * this.tileHeight + this.tileHeight - this.tileProperties.oneWayHeight / 2,
                        this.tileWidth, this.tileProperties.oneWayHeight);
                    box.resolve.left = false;
                    box.resolve.right = false;
                    box.resolve.bottom = false;
                    break;
                case TileColliderSystem.TileTypes.OneWayCenter:
                    // Only allow one way for resolution.
                    box = new Bounds(
                        x * this.tileWidth + this.tileWidth / 2,
                        y * this.tileHeight + this.tileHeight / 2,
                        this.tileWidth, this.tileProperties.oneWayHeight);
                    box.resolve.left = false;
                    box.resolve.right = false;
                    box.resolve.bottom = false;
                    break;
                default:
                    box = new Bounds(
                        x * this.tileWidth + this.tileWidth / 2,
                        y * this.tileHeight + this.tileHeight / 2,
                        this.tileWidth, this.tileHeight);
            }

            if (box) {
                box.userData.index = tileIndex;
                tileBounds.push(box);
            }
        }
    }

    // Use the original non-added bounds for resolution.
    this.bounds = setBoundsForEntity(entity, this.bounds);
    var info = this.simpleResolver.resolve(this.bounds, movement.move.x, movement.move.y, tileBounds);
    info.colliderEntity = entity;

    var verticalIndex = 0;
    if (info.verticalColliderBounds) verticalIndex = info.verticalColliderBounds.userData.index;
    var horizontalIndex = 0;
    if (info.horizontalColliderBounds) horizontalIndex = info.horizontalColliderBounds.userData.index;

    movement.move.x = info.move.x;
    movement.move.y = info.move.y;

    // Check for ramp using the adjusted movement bounds and getting the midpoint.
    this.bounds.x += info.move.x;
    this.bounds.y += info.move.y;
    // Calculate the feet point.
    var px = this.bounds.x;
    var py = this.bounds.y + this.bounds.height / 2 - boundsComponent.offset.y;
    // Get the index of the feet point.
    var ix = Math.floor(px / this.tileWidth);
    var iy = Math.floor(py / this.tileHeight);
    // Get the tile coordinates from the top left point of a tile.
    var tx = iy * this.tileWidth;
    var ty = iy * this.tileHeight;

    tileIndex = tiles[iy][ix];
    var spatial = entity[SpatialComponent.type];
    if (spatial) {
        var amount = 0;
        switch (tileIndex) {
            case TileColliderSystem.TileTypes.RampBottomLeft:
                // Only handle slopes if going downwards.
                if (movement.speed.y < 0) break;

                // Only handle slopes if the midpoint is colliding on the line or below the line.
                if (py < ty + px % this.tileWidth) break;

                movement.move.y = 0;
                if (collision.stopsOnCollide.y) {
                    movement.speed.y = 0;
                }

                amount = ty - this.bounds.height / 2 + px % this.tileWidth;
                spatial.position.y = amount;
                collision.isCollidingWith.bottom = true;
                break;
            case TileColliderSystem.TileTypes.RampBottomRight:
                // Only handle slopes if going downwards.
                if (movement.speed.y < 0) break;

                // Only handle slopes if the midpoint is colliding on the line or below the line.
                if (py < ty + this.tileWidth - (px % this.tileWidth)) break;

                movement.move.y = 0;
                if (collision.stopsOnCollide.y) {
                    movement.speed.y = 0;
                }

                amount = ty - this.bounds.height / 2 + (this.tileWidth - px % this.tileWidth);
                spatial.position.y = amount;
                collision.isCollidingWith.bottom = true;
                break;
            case TileColliderSystem.TileTypes.RampTopLeft:
                break;
            case TileColliderSystem.TileTypes.RampTopRight:
                break;
        }
    }

    // Flag sides that have collided.
    var i;
    if (info.verticalColliderBounds) {
        if (movement.speed.y > 0) {
            collision.isCollidingWith.bottom = true;
        } else if (movement.speed.y < 0) {
            collision.isCollidingWith.top = true;
        }
        if (collision.stopsOnCollide.y) {
            movement.speed.y = 0;
        }
        // Apply friction in the X direction.
        movement.calculatedFriction.x += this.tileFriction.x;
    }
    if (info.horizontalColliderBounds) {
        if (movement.speed.x < 0) {
            collision.isCollidingWith.left = true;
        } else if (movement.speed.x > 0) {
            collision.isCollidingWith.right = true;
        }
        if (collision.stopsOnCollide.x) {
            movement.speed.x = 0;
        }
        // Apply friction in the Y direction.
        movement.calculatedFriction.y += this.tileFriction.y;
    }
    if (info.verticalColliderBounds || info.horizontalColliderBounds) {
        for (i = 0; i < this.staticCollisionCallbacks.length; i++) {
            this.staticCollisionCallbacks[i](info, horizontalIndex, verticalIndex);
        }
    }
};

TileColliderSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(CollisionComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var collision = entity[CollisionComponent.type];
        // Ignore if unable to collide with tiles.
        if (!collision.collidesWith.tiles) continue;

        // Resolve the tile collisions.
        if (collision.resolveFor.tiles) {
            this.collide(entity, this.staticTiles);
        }
        // Collide as a sensor.
        this.collideSensor(entity, this.sensorTiles);
    }
};

/**
 * Tile types used for collision resolution.
 */
TileColliderSystem.TileTypes = {
    Empty: 0,
    Static: 1,
    OneWayTop: 2,
    OneWayBottom: 3,
    OneWayCenter: 4,
    RampBottomLeft: 5,
    RampBottomRight: 6,
    RampTopLeft: 7,
    RampTopRight: 8
};

module.exports = TileColliderSystem;
module.exports.TileTypes = TileColliderSystem.TileTypes;