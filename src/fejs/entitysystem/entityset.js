/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 10/31/13
 * Time: 11:03 AM
 * A set of entities with components in common.
 */

var FESet = require('../datastructures/set');
function EntitySet() {
    "use strict";

    /**
     * All the entities in the set.
     * @type {FESet.<Entity>}
     */
    var entities = new FESet();

    /**
     * Newly added entities to the set.
     * @type {FESet.<Entity>}
     */
    var addedEntities = new FESet();

    /**
     * Newly changed entities in the set.
     * @type {FESet.<Entity>}
     */
    var changedEntities = new FESet();

    /**
     * Newly removed entities from the set.
     * @type {FESet.<Entity>}
     */
    var removedEntities = new FESet();

    /**
     * Callbacks to run when an entity is added.
     * @type {Array.<Function(Entity)>}
     */
    var addedCallbacks = [];

    /**
     * Callbacks to run when an entity is changed.
     * @type {Array.<Function(Entity)>}
     */
    var changedCallbacks = [];

    /**
     * Callbacks to run when an entity is removed.
     * @type {Array.<Function(Entity)>}
     */
    var removedCallbacks = [];

    /**
     * Adds an entity.
     * An added entity will not be in the removed or changed sets unless set to change also.
     * @param {Entity} entity the entity to add.
     */
    this.add = function(entity) {
        if (entities.add(entity)) {
            removedEntities.remove(entity);
            changedEntities.remove(entity);
            addedEntities.add(entity);

            // Run the callback functions.
            for (var i = 0; i < addedCallbacks.length; i++) {
                addedCallbacks[i](entity);
            }
        }
    };

    /**
     * Add a changed entity.
     * @param {Entity} entity the entity to change.
     */
    this.change = function(entity) {
        if (entities.contains(entity)) {
            changedEntities.add(entity);

            // Run the callback functions.
            for (var i = 0; i < changedCallbacks.length; i++) {
                changedCallbacks[i](entity);
            }
        }
    };

    /**
     * Removes an entity.
     * A removed entity will not longer be in the added or changed sets.
     * @param {Entity} entity the entity to remove.
     */
    this.remove = function(entity) {
        if (entities.remove(entity)) {
            addedEntities.remove(entity);
            changedEntities.remove(entity);
            removedEntities.add(entity);

            // Run the callback functions.
            for (var i = 0; i < removedCallbacks.length; i++) {
                removedCallbacks[i](entity);
            }
        }
    };

    /**
     * Iterates over all entities.
     * @param {function(T, *)} func the function to call on each iteration.
     * @param {*=} context context variables to pass in.
     */
    this.each = function(func, context) {
        entities.each(func, context);
    };

    /**
     * Iterates over the newly added entities.
     * @param {function(T, *)} func the function to call on each iteration.
     * @param {*=} context context variables to pass in.
     */
    this.eachAdded = function(func, context) {
        addedEntities.each(func, context);
    };

    /**
     * Iterates over the newly changed entities.
     * @param {function(T, *)} func the function to call on each iteration.
     * @param {*=} context context variables to pass in.
     */
    this.eachChanged = function(func, context) {
        changedEntities.each(func, context);
    };

    /**
     * Iterates over the newly removed entities.
     * @param {function(T, *)} func the function to call on each iteration.
     * @param {*=} context context variables to pass in.
     */
    this.eachRemoved = function(func, context) {
        removedEntities.each(func, context);
    };

    /**
     * Checks if the set contains an entity.
     * @param {Entity} entity the entity to check if the set contains.
     * @return {boolean} true if the set contains the entity.
     */
    this.contains = function(entity) {
        return entities.contains(entity);
    };

    /**
     * Retrieves the number of entities in the set.
     * @returns {Number} the number of entities in the set.
     */
    this.size = function() {
        return entities.size();
    };

    /**
     * Flushes all the sets.
     */
    this.flush = function() {
        addedEntities.clear();
        changedEntities.clear();
        removedEntities.clear();
    };

    /**
     * Retrieves all the entities in the set as a new array.
     * @returns {Array.<Entity>}
     */
    this.getAll = function() {
        return entities.getAll();
    };

    /**
     * Retrieves all the entities in the set.
     * Do not modify the array directly.
     * @returns {Array.<Entity>}
     */
    this.getAllRaw = function() {
        return entities._objects;
    };

    /**
     * Adds an add callback.
     * @param {function(Entity)} func the callback function.
     */
    this.addAddedCallback = function(func) {
        addedCallbacks.push(func);
    };
    /**
     * Removes an add callback.
     * @param {function(Entity)} func the callback function to remove.
     */
    this.removeAddedCallback = function(func) {
        var index = addedCallbacks.indexOf(func);
        if (index >= 0) {
            addedCallbacks.splice(index, 1);
        }
    };
    /**
     * Adds a changed callback.
     * @param {function(Entity)} func the callback function.
     */
    this.addChangedCallback = function(func) {
        changedCallbacks.push(func);
    };
    /**
     * Removes a changed callback.
     * @param {function(Entity)} func the callback function to remove.
     */
    this.removeChangedCallback = function(func) {
        var index = changedCallbacks.indexOf(func);
        if (index >= 0) {
            changedCallbacks.splice(index, 1);
        }
    };
    /**
     * Adds a removed callback.
     * @param {function(Entity)} func the callback function.
     */
    this.addRemovedCallback = function(func) {
        removedCallbacks.push(func);
    };
    /**
     * Removes a removed callback.
     * @param {function(Entity)} func the callback function to remove.
     */
    this.removeRemovedCallback = function(func) {
        var index = removedCallbacks.indexOf(func);
        if (index >= 0) {
            removedCallbacks.splice(index, 1);
        }
    };

    /**
     * Clears the set and all the callbacks.
     */
    this.clear = function() {
        entities.clear();
        this.flush();
        addedCallbacks = [];
        changedCallbacks = [];
        removedCallbacks = [];
    };
}

module.exports = EntitySet;