/**
 * @author MW
 * Handles body collisions.
 */
var System = require('../../core/system');
var CollisionComponent = require('./CollisionComponent');
var BodyComponent = require('./BodyComponent');
var CollisionInfo = require('./CollisionInfo');
var AABBComponent = require('./AABBComponent');
var Bounds = require('./Bounds');
var SimpleResolver = require('./SimpleResolver');
var MovementComponent = require('./MovementComponent');

function BodyColliderSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    /**
     * Used for resolving static collisions.
     * @type {SimpleResolver}
     */
    this.simpleResolver = new SimpleResolver();

    /**
     * Callback function for when a static collision occurs.
     * Parameters are collision info, horizontal entity, vertical entity.
     * @type {Array.<Function(CollisionInfo, Entity, Entity)>}
     */
    this.staticCollisionCallbacks = [];

    /**
     * Callback function for when a sensor collision occurs.
     * @type {Array.<Function(Entity, Array.<Entity>)>}
     */
    this.sensorCollisionCallbacks = [];

    /**
     * Callback function for when a collision first occurs.
     * @type {Array.<Function(Entity, Entity)>}
     */
    this.startCollisionCallbacks = [];

    /**
     * Callback function for when a collision first occurs.
     * @type {Array.<Function(Entity, Array.<Entity>)>}
     */
    this.stopCollisionCallbacks = [];
}
BodyColliderSystem.prototype = Object.create(System.prototype);

/**
 * Creates shapes for the given entity.
 * @param {Entity} entity the entity to create the shapes of.
 * @returns {Array}
 */
function createShapes(entity) {
    "use strict";
    var body = entity[BodyComponent.type];
    var shapes = [];

    for (var i = 0; i < body.shapes.length; i++) {
        var shape = body.shapes[i];
        var physical;
        if (shape.circle) {
            physical = new SAT.Circle(new SAT.Vector(0, 0), shape.circle.radius);
            physical.pos.x = shape.position.x;
            physical.pos.y = shape.position.y;
        } else if (shape.box) {
            // Boxes are changed to polygons for collisions.
            physical = new SAT.Box(new SAT.Vector(0, 0), shape.box.width, shape.box.height);
            physical = physical.toPolygon();
            physical.pos.x = shape.position.x - shape.box.width / 2;
            physical.pos.y = shape.position.y - shape.box.height / 2;
        } else if (shape.polygon) {
            var vertices = [];
            for (var j = 0; j < shape.polygon.vertices.length; j++) {
                var vertex = shape.polygon.vertices[j];
                vertices.push(new SAT.Vector(vertex.x, vertex.y));
            }
            physical = new SAT.Polygon(new SAT.Vector(0, 0), vertices);
            physical.pos.x = shape.position.x;
            physical.pos.y = shape.position.y;
            physical.setAngle(shape.rotation);
        }
        physical.userData = entity;
        shapes.push(physical);
    }

    return shapes;
}

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
    bounds.userData.entity = entity;

    return bounds;
}

/**
 * Filters entities given the and and or groups and the targets as entities.
 * Empty groups will signify allowance.
 * @param {CollisionComponent} collisionComponent the collision component to check the "and" and "or" groups.
 * @param {CollisionComponent} targetComponent the component to use for the target groups.
 * @returns {Boolean} true if the entity is valid for collision.
 */
function filterEntity(collisionComponent, targetComponent) {
    "use strict";

    // Filter the entities.
    var i;
    if (targetComponent && targetComponent.groups.length !== 0 &&
        (collisionComponent.targetAndGroups.length !== 0 || collisionComponent.targetOrGroups !== 0)) {
        // Passed and is used when and is passed but or is not.
        var passedAnd = false;
        var canCollide = true;
        var group;
        if (collisionComponent.targetAndGroups.length !== 0) {
            // Check if and is working.
            for (i = 0; i < collisionComponent.targetAndGroups.length; i++) {
                group = collisionComponent.targetAndGroups[i];
                if (targetComponent.groups.indexOf(group) === -1) {
                    canCollide = false;
                    break;
                }
            }
            passedAnd = true;
        }
        if (!canCollide) return false;

        if (!passedAnd && collisionComponent.targetOrGroups.length !== 0) {
            // Check if or is working.
            canCollide = false;
            for (i = 0; i < collisionComponent.targetOrGroups.length; i++) {
                group = collisionComponent.targetOrGroups[i];
                if (targetComponent.groups.indexOf(group) !== -1) {
                    canCollide = true;
                    break;
                }
            }
            if (!canCollide) return false;
        }
    }

    return true;
}

BodyColliderSystem.prototype.collideSensor = function(entity) {
    "use strict";

    // Ignore entities without a body component.
    var bodyComponent = entity[BodyComponent.type];
    if (!bodyComponent) return;

    // Do collision in a naive way for now.
    // Create the shapes for the entity.
    var shapes = createShapes(entity);
    if (shapes.length === 0) return;

    var entities = this.entitySystem.getEntities(BodyComponent.type).getAllRaw();
    // Create shapes for other entities.
    var targetShapes = [];
    var i, j, targetComponent;
    var collisionComponent = entity[CollisionComponent.type];
    for (i = 0; i < entities.length; i++) {
        var targetEntity = entities[i];
        // Do not target self.
        if (targetEntity.getID() === entity.getID()) continue;

        targetComponent = targetEntity[CollisionComponent.type];
        if (!targetComponent) continue;

        // Filter the entities.
        if (!filterEntity(collisionComponent, targetComponent)) continue;

        targetShapes = targetShapes.concat(createShapes(targetEntity));
    }
    if (targetShapes.length === 0) return;

    var collided;
    var collisions = [];
    var lastTarget = null;
    for (i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        for (j = 0; j < targetShapes.length; j++) {
            // Skip already collided entities if needed.
            var targetShape = targetShapes[j];
            if (!bodyComponent.allowMultipleCollide) {
                if (lastTarget === targetShape.userData) continue;
            }
            collided = false;
            // Test each shape collision.
            if (shape instanceof SAT.Circle && targetShape instanceof SAT.Circle) {
                collided = SAT.testCircleCircle(shape, targetShape);
            }
            if (shape instanceof SAT.Circle && targetShape instanceof SAT.Polygon) {
                collided = SAT.testCirclePolygon(shape, targetShape);
            }
            if (shape instanceof SAT.Polygon && targetShape instanceof SAT.Circle) {
                collided = SAT.testPolygonCircle(shape, targetShape);
            }
            if (shape instanceof SAT.Polygon && targetShape instanceof SAT.Polygon) {
                collided = SAT.testPolygonPolygon(shape, targetShape);
            }
            if (collided) {
                // Store the last target to prevent multiple shape collisions if required.
                lastTarget = targetShape.userData;
                collisions.push(targetShape.userData);
            }
        }
    }
    if (collisions.length > 0) {
        // Check which collisions have just started colliding.
        var collision;
        for (i = 0; i < collisions.length; i++) {
            collision = collisions[i].getID();
            if (collisionComponent.colliding.indexOf(collision) === -1) {
                collisionComponent.startColliding.push(collision);
            }
        }
        // Check which collisions are no longer colliding.
        i = 0;
        while (i < collisionComponent.colliding.length) {
            // Possible crashes because of this loop
            collision = collisionComponent.colliding[i];
            var found = false;
            for (j = 0; j < collisions.length; j++) {
                if (collisions[j].getID() === collision) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                collisionComponent.stopColliding.push(collision);
                // Remove from colliders.
                collisionComponent.colliding.splice(i, 1);
            } else {
                i++;
            }
        }

        // Run the callbacks for collisions.
        for (i = 0; i < this.sensorCollisionCallbacks.length; i++) {
            this.sensorCollisionCallbacks[i](entity, collisions);
        }
    } else {
        // All are no longer colliding so set all to stop colliding.
        collisionComponent.stopColliding = collisionComponent.stopColliding.concat(collisionComponent.colliding);
        collisionComponent.colliding = [];
    }
    // Run the callbacks for start and stop collisions.
    if (collisionComponent.startColliding.length > 0) {
        for (i = 0; i < this.startCollisionCallbacks.length; i++) {
            this.startCollisionCallbacks[i](entity, collisionComponent.startColliding);
        }
    }
    if (collisionComponent.stopColliding.length > 0) {
        for (i = 0; i < this.startCollisionCallbacks.length; i++) {
            this.stopCollisionCallbacks[i](entity, collisionComponent.stopColliding);
        }
    }
};

BodyColliderSystem.prototype.collide = function(entity) {
    "use strict";

    // Check if the entity is valid.
    var movement = entity[MovementComponent.type];
    if (!movement) return;
    var boundsComponent = entity[AABBComponent.type];
    if (!boundsComponent) return;

    var collision = entity[CollisionComponent.type];

    var bounds = new Bounds();

    var entities = this.entitySystem.getEntities(AABBComponent.type).getAllRaw();
    var i;
    var targets = [];
    for (i = 0; i < entities.length; i++) {
        if (entity.getID() === entities[i].getID()) continue;

        var target = entities[i];
        var targetComponent = target[CollisionComponent.type];
        if (targetComponent && targetComponent.resolvable) {
            // Filter the entities.
            if (!filterEntity(collision, targetComponent)) continue;

            targets.push(setBoundsForEntity(target, new Bounds()));
        }
    }

    // No targets, no need to resolve.
    if (targets.length === 0) return;

    // Use the original non-added bounds for resolution.
    bounds = setBoundsForEntity(entity, bounds);
    var info = this.simpleResolver.resolve(bounds, movement.move.x, movement.move.y, targets);
    info.colliderEntity = entity;
    movement.move.x = info.move.x;
    movement.move.y = info.move.y;

    var targetCollisionComponent;
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
        targetCollisionComponent = info.verticalColliderBounds.userData.entity[CollisionComponent.type];
        if (targetCollisionComponent) {
            movement.calculatedFriction.x += targetCollisionComponent.friction.x;
        }
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
        targetCollisionComponent = info.horizontalColliderBounds.userData.entity[CollisionComponent.type];
        if (targetCollisionComponent) {
            movement.calculatedFriction.y += targetCollisionComponent.friction.y;
        }
    }
    if (info.verticalColliderBounds || info.horizontalColliderBounds) {
        var verticalEntity = null;
        if (info.verticalColliderBounds) verticalEntity = info.verticalColliderBounds.userData.entity;
        var horizontalEntity = null;
        if (info.horizontalColliderBounds) horizontalEntity = info.horizontalColliderBounds.userData.entity;
        for (i = 0; i < this.staticCollisionCallbacks.length; i++) {
            this.staticCollisionCallbacks[i](info, horizontalEntity, verticalEntity);
        }
    }
};

BodyColliderSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(CollisionComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var collision = entity[CollisionComponent.type];
        // Ignore if unable to collide with objects.
        if (!collision.collidesWith.objects) continue;

        // Move previous start colliding into collisions.
        collision.previousColliders = [].concat(collision.colliding);
        collision.colliding = collision.colliding.concat(collision.startColliding);
        // Reset object collisions.
        collision.startColliding = [];
        collision.stopColliding = [];

        // Resolve the object collisions.
        if (collision.resolveFor.objects && entity[AABBComponent.type]) {
            this.collide(entity);
        }
        // Collide as a sensor.
        if (entity[BodyComponent.type]) {
            this.collideSensor(entity);
        }
    }
};

module.exports = BodyColliderSystem;