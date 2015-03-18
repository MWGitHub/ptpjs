/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 10/29/13
 * Time: 8:42 PM
 * Entity system to create entities and handle component setting and removing.
 * Entities are given the same component as a key for ease of access. Removed
 * components from the entity will still keep all the components tied to it
 * when accessed through the entity.
 */

var Collections = require('../utility/collections');
var Entity = require('./entity');
var EntitySet = require('./entityset');

/**
 * Initializes the entity system.
 * @constructor
 */
function EntitySystem() {
    "use strict";

    /**
     * True to have sets be created lazily.
     * @type {boolean}
     */
    this.isLazySets = false;

    /**
     * True to use UUIDs.
     * @type {boolean}
     */
    this.useUUID = true;

    /**
     * UUID generator function.
     * @type {function}
     */
    this.generateUUID = FEJS.generateUUID || null;

    /**
     * Counter for assigning entity IDs.
     * @type {number}
     */
    var counter = 0;

    /**
     * @type {Object.<String, Entity>}
     * Entities in the system.
     */
    var entities = {};

    /**
     * Maps the component to entity relationship by entity ID.
     * @dict
     * Type is Map<String, Map<ComponentName, Component>>.
     */
    var entityComponentMap = {};

    /**
     * Maps the component to entity relationship for removed entities by entity ID.
     * @dict
     * Type is Map<String, Map<ComponentName, Component>>.
     */
    var removedEntityComponentMap = {};

    /**
     * Stores entity sets.
     * @dict
     * Type is Map<ComponentName, EntitySet>.
     */
    var entitySets = {};

    /**
     * Creates an entity.
     * @param {Number|String=} id the ID of the entity to set.
     * @return {Entity} the created entity.
     */
    this.createEntity = function(id) {
        var entity;
        if (id) {
            entity = new Entity(id);
        } else if (this.useUUID) {
            if (!this.generateUUID) {
                throw new Error('No UUID generator function set.');
            }
            entity = new Entity(this.generateUUID());
        } else {
            entity = new Entity(counter);
        }
        entities[entity.id] = entity;
        counter++;

        // Add the entity to the component map.
        entityComponentMap[entity.id] = {};

        return entity;
    };

    /**
     * Checks if the system has the specified entity.
     * @param {Entity} entity the entity to check for.
     * @return {boolean} true if the entity is in the system.
     */
    this.hasEntity = function(entity) {
        var ent = entities[entity.getID()];
        if (!ent) return false;
        return ent === entity;
    };

    /**
     * Retrieves an entity by ID.
     * @param {String|Number} id the ID of the entity.
     * @returns {Entity} the entity matching the ID or null if none found.
     */
    this.getEntityByID = function(id) {
        return entities[id] ? entities[id] : null;
    };

    /**
     * Retrieves an entity by name.
     * @param {string} name the name of the entity.
     * @returns {Entity} the entity or null if none found.
     */
    this.getEntityByName = function(name) {
        for (var key in entities) {
            if (entities.hasOwnProperty(key)) {
                if (entities[key].name === name) {
                    return entities[key];
                }
            }
        }
        return null;
    };

    /**
     * Removes an entity.
     * @param {Entity} entity the entity to remove.
     */
    this.removeEntity = function(entity) {
        var storedEntity = entities[entity.getID()];
        if (!storedEntity) {
            return;
        }

        // Move the entity's components to the removed map.
        removedEntityComponentMap[entity.getID()] = entityComponentMap[entity.getID()];

        // Notify all sets of the removed entity.
        for (var componentName in entitySets) {
            entitySets[componentName].remove(entity);
        }

        // Remove the entity.
        delete entities[entity.getID()];
    };

    /**
     * Retrieves a component.
     * @param {Entity} entity the entity to retrieve the component from.
     * @param {string} componentName the name of the component to retrieve.
     * @returns {*} the component.
     */
    this.getComponent = function(entity, componentName) {
        var componentList = null;
        // Get the component of the entity if the active version has it.
        if (Collections.objectContainsKey(entityComponentMap, entity.getID())) {
            componentList = entityComponentMap[entity.getID().toString()];
            if (Collections.objectContainsKey(componentList, componentName)) {
                return componentList[componentName];
            } else {
                componentList = null;
            }
        }
        // Get the component of the removed version if there is no active.
        if (componentList === null) {
            if (Collections.objectContainsKey(removedEntityComponentMap, entity.getID())) {
                componentList = removedEntityComponentMap[entity.getID()];
                if (Collections.objectContainsKey(componentList, componentName)) {
                    return componentList[componentName];
                }
            }
        }
        return null;
    };

    /**
     * Sets a component and updates the set to add to the added or changed list.
     * @param {Entity} entity the entity to set the component.
     * @param {string} componentName the name of the component.
     * @param {*} component the component.
     */
    this.setComponent = function(entity, componentName, component) {
        // Do not set components for entities outside of the system.
        if (!entities[entity.getID()]) {
            return;
        }
        var components = entityComponentMap[entity.getID().toString()];
        // Give a reference to the component into the entity for easy access but no callbacks.
        entity[componentName] = component;
        // Update the set that matches the component if created.
        var entitySet;
        // Create a new set if no sets are found.
        if (!Collections.objectContainsKey(entitySets, componentName)) {
            // Set does not exist so component will not be set.
            if (this.isLazySets) {
                // Set the component for the entity map for lazy setting.
                components[componentName] = component;
                return;
            }
            entitySet = new EntitySet();
            entitySets[componentName] = entitySet;
        } else {
            entitySet = entitySets[componentName];
        }
        // Update the set states.
        if (Collections.objectContainsKey(components, componentName)) {
            entitySet.change(entity);
        } else {
            entitySet.add(entity);
        }
        // Set the component for the entity map.
        components[componentName] = component;
    };

    /**
     * Checks if an entity has a component.
     * @param {Entity} entity the entity to check.
     * @param {string} componentName the name of the component.
     * @returns {boolean} true if the entity has the component matching the name.
     */
    this.hasComponent = function(entity, componentName) {
        // Entities not in the system will not be checked.
        if (!Collections.objectContainsKey(entityComponentMap, entity.getID())) {
            return false;
        }
        var components = entityComponentMap[entity.getID().toString()];
        return Collections.objectContainsKey(components, componentName);
    };

    /**
     * Removes a component from the entity.
     * @param {Entity} entity the entity to remove the component from.
     * @param {string} componentName the name of the component.
     */
    this.removeComponent = function(entity, componentName) {
        if (!Collections.objectContainsKey(entityComponentMap, entity.getID())) {
            return;
        }
        // Keep the component in case a system needs it before flush.
        var components = entityComponentMap[entity.getID().toString()];
        if (!Collections.objectContainsKey(removedEntityComponentMap, entity.getID())) {
            removedEntityComponentMap[entity.getID().toString()] = {};
        }
        removedEntityComponentMap[entity.getID()][componentName] = components[componentName];

        // Remove the component from the active component list.
        delete entityComponentMap[entity.getID()][componentName];

        // Update the sets that have the component.
        if (Collections.objectContainsKey(entitySets, componentName)) {
            entitySets[componentName].remove(entity);
        }
    };

    /**
     * Retrieves all the entities matching the component name.
     * @param {String} componentName the name of the component.
     * @returns {EntitySet} the set of entities with the given component.
     */
    this.getEntities = function(componentName) {
        // Lazy creation of entity sets do not support removal before retrieval.
        if (!Collections.objectContainsKey(entitySets, componentName)) {
            var entitySet = new EntitySet();
            // Add existing entities that match the component.
            for (var key in entities) {
                if (this.hasComponent(entities[key], componentName)) {
                    entitySet.add(entities[key]);
                }
            }
            entitySets[componentName] = entitySet;
        }

        return entitySets[componentName];
    };

    /**
     * Retrieves all entities.
     * @returns {Object.<String, Entity>}
     */
    this.getAllEntities = function() {
        return entities;
    };

    /**
     * Flushes the entity set changes.
     */
    this.flushChanges = function() {
        for (var componentName in entitySets) {
            if (entitySets.hasOwnProperty(componentName)) {
                entitySets[componentName].flush();
            }
        }
        removedEntityComponentMap = {};
    };

    /**
     * Removes all entities from the system.
     */
    this.removeAllEntities = function() {
        for (var key in entities) {
            if (entities.hasOwnProperty(key)) {
                this.removeEntity(entities[key]);
            }
        }
    };
}

module.exports = EntitySystem;
