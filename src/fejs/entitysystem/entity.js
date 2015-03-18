/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 10/29/13
 * Time: 8:38 PM
 * Basic entity for the entity system.
 */
/**
 * Initializes an entity.
 * @param {number} permID permanent ID to assign to the entity.
 * @constructor
 */
function Entity(permID) {
    "use strict";

    /**
     * ID of the entity which can be either a number or unique string.
     * @type {Number|String}
     */
    var _id = permID;

    /**
     * Name of the entity.
     * @type {string}
     */
    this.name = "";

    /**
     * Data that systems do not need to keep track of.
     * Allows for quick setting and retrieval.
     * @dict
     */
    this.userData = {};

    if (_id === undefined || _id === null || (typeof _id !== 'number' && typeof _id !== 'string')) {
        throw new TypeError("Invalid ID");
    }

    /**
     * Retrieves the entity's ID.
     * @returns {number} the ID of the entity.
     */
    this.getID = function() {
        return _id;
    };

    /**
     * String representation of the entity.
     * @returns {string}
     */
    this.toString = function() {
        return "entity" + _id;
    };

    Object.defineProperty(this, 'id', {
        get: function() {
            return _id;
        },
        set: function(val) {
            throw new Error('Cannot set entity ID after creation.');
        }
    });
}

module.exports = Entity;