/**
 * @author MW
 * System for handling children-parent relationships between entities.
 */
var System = require('../../fejs/core/system');
var ChildComponent = require('./ChildComponent');
var Collections = require('../utility/collections');

var AnimationComponent = require('./display/AnimationComponent');

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 * @extends System
 */
function ChildSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    var es = this.entitySystem.getEntities(ChildComponent.type);
    es.addAddedCallback(this.onAdded.bind(this));
    es.addChangedCallback(this.onChanged.bind(this));
    es.addRemovedCallback(this.onRemoved.bind(this));
}
ChildSystem.prototype = Object.create(System.prototype);

/**
 * Adds/removes children and maintains a 1-to-many relationship between parent and children.
 * @param {Entity} entity the entity to refresh./
 */
ChildSystem.prototype.refreshChildren = function(entity) {
    "use strict";

    var childComponent = entity[ChildComponent.type];
    for (var i = 0; i < childComponent.children.length; i++) {
        var child = this.entitySystem.getEntityByID(childComponent.children[i]);
        // Create a child component if none is available.
        var ccCom = child[ChildComponent.type];
        if (!ccCom) {
            ccCom = new ChildComponent();
            this.entitySystem.setComponent(child, ChildComponent.type, ccCom);
        }
        // Remove child form any parent.
        if (ccCom.parent) {
            var parent = this.entitySystem.getEntityByID(ccCom.parent);
            if (parent) {
                var pcCom = parent[ChildComponent.type];
                Collections.remove(pcCom.children, child.id);
            }
        }
        ccCom.parent = entity.id;
    }
};

/**
 * Adds an entity and updates the children and parents.
 * @param {Entity} entity the added entity.
 */
ChildSystem.prototype.onAdded = function(entity) {
    "use strict";

    this.refreshChildren(entity);
};

/**
 * Changes an entity and updates the children and parents.
 * @param {Entity} entity the changed entity.
 */
ChildSystem.prototype.onChanged = function(entity) {
    "use strict";

    this.refreshChildren(entity);
};

/**
 * Removes an entity and updates the children and parents.
 * @param {Entity} entity the removed entity.
 */
ChildSystem.prototype.onRemoved = function(entity) {
    "use strict";

    // Handle removal for children.
    var childComponent = entity[ChildComponent.type];
    for (var i = 0; i < childComponent.children.length; i++) {
        var child = this.entitySystem.getEntityByID(childComponent.children[i]);
        // Remove parent for the child.
        var ccCom = child[ChildComponent.type];
        if (ccCom) {
            ccCom.parent = null;
        }
        // Remove children from the entity system.
        if (childComponent.isLinkedRemove) {
            this.entitySystem.removeEntity(child);
        }
    }

    // Handle removal for parents.
    var parent = this.entitySystem.getEntityByID(childComponent.parent);
    if (parent) {
        var pcCom = parent[ChildComponent.type];
        Collections.remove(pcCom.children, entity.id);
    }
};

ChildSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(ChildComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var childCom = entity[ChildComponent.type];
        for (var j = 0; j < childCom.children.length; j++) {
            var childEntity = this.entitySystem.getEntityByID(childCom.children[j]);
            // Copy playing animations.
            var aniCom = entity[AnimationComponent.type];
            var childAniCom = childEntity[AnimationComponent.type];
            if (aniCom && childAniCom) {
                childAniCom.playAnimation = aniCom.playAnimation;
                childAniCom.stopAnimation = aniCom.stopAnimation;
            }
        }
    }
};

module.exports = ChildSystem;