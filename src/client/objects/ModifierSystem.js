/**
 * @author MW
 * System to apply modifiers, buffs, debuffs, and modified skills.
 */
var System = require('../../fejs/core/system');
var ModifierComponent = require('./ModifierComponent');

ModifierSystem.States = {
    Normal: 'normal',
    Zero: 'zero'
};

/**
 * Modifiers to apply to keys.
 * @type {{Add: string, Multiply: string}}
 */
ModifierSystem.Modifiers = {
    Add: 'add',
    Multiply: 'multiply',
    State: 'normal'
};

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 * @extends System
 */
function ModifierSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

}
ModifierSystem.prototype = Object.create(System.prototype);

ModifierSystem.prototype.update = function(dt) {
    "use strict";

};

/**
 * Creates a modifier field.
 * @param {Entity} entity the entity to give the modified fields.
 * @param {String} key the key for the field.
 */
ModifierSystem.createModField = function(entity, key) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return;

    // Create the field if none exists.
    if (modifier[ModifierSystem.Modifiers.Add + key] === undefined) {
        modifier[ModifierSystem.Modifiers.Add + key] = 0;
    }
    if (modifier[ModifierSystem.Modifiers.Multiply + key] === undefined) {
        modifier[ModifierSystem.Modifiers.Multiply + key] = 0;
    }
    if (modifier[ModifierSystem.Modifiers.State + key] === undefined) {
        modifier[ModifierSystem.Modifiers.State + key] = ModifierSystem.States.Normal;
    }
};

/**
 * Calculates and retrieves the modified field.
 * @param {Entity} entity the entity to retrieve the modifiers from.
 * @param {String} key the key of the field.
 * @param {Number} base the base value of the field.
 * @returns {number} the calculated field.
 */
ModifierSystem.getField = function(entity, key, base) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return base;

    var state = modifier[ModifierSystem.Modifiers.State + key];
    if (state && state === ModifierSystem.States.Zero) {
        return 0;
    }

    var add = modifier[ModifierSystem.Modifiers.Add + key];
    if (add === undefined) {
        add = 0;
    }
    // Multiply has a special case where when it is zero it does nothing.
    var mult = modifier[ModifierSystem.Modifiers.Multiply + key];
    if (mult === undefined || mult === 0) {
        mult = 1;
    }

    return (base + add) * mult;
};

/**
 * Sets the modifier for a field.
 * @param {Entity} entity the entity to set the modifiers for.
 * @param {String} key the key of the field.
 * @param {Number} add the value to set for the additive modifiers.
 * @param {Number} mult the value to set for the multiplicative modifiers.
 */
ModifierSystem.setField = function(entity, key, add, mult) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return;

    ModifierSystem.createModField(entity, key);

    modifier[ModifierSystem.Modifiers.Add + key] = add;
    modifier[ModifierSystem.Modifiers.Multiply + key] = mult;
};

/**
 * Adds to the modifier for a field.
 * @param {Entity} entity the entity to add the modifiers for.
 * @param {String} key the key of the field.
 * @param {Number} add the value to add for the additive modifiers.
 * @param {Number} mult the value to add for the multiplicative modifiers.
 */
ModifierSystem.addField = function(entity, key, add, mult) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return;

    ModifierSystem.createModField(entity, key);

    modifier[ModifierSystem.Modifiers.Add + key] += add;
    modifier[ModifierSystem.Modifiers.Multiply + key] += mult;
};

/**
 * Set the state of a modifier.
 * @param {Entity} entity the entity to set the state for.
 * @param {String} key the key of the field.
 * @param {String} state the state to set.
 */
ModifierSystem.setState = function(entity, key, state) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return;

    ModifierSystem.createModField(entity, key);

    modifier[ModifierSystem.Modifiers.State + key] = state;
};

/**
 * Retrieves the add field in modifiers.
 * @param {Entity} entity the entity to retrieve the field from.
 * @param {String} key the key for the modifier.
 * @returns {Number} the modifier add amount.
 */
ModifierSystem.getAddField = function(entity, key) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return 0;

    return modifier[ModifierSystem.Modifiers.Add + key];
};

/**
 * Retrieves the multiply field in modifiers.
 * @param {Entity} entity the entity to retrieve the field from.
 * @param {String} key the key for the modifier.
 * @returns {Number} the modifier multiply amount.
 */
ModifierSystem.getMultField = function(entity, key) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return 0;

    return modifier[ModifierSystem.Modifiers.Multiply + key];
};

/**
 * Retrieves the state field in modifiers.
 * @param {Entity} entity the entity to retrieve the state field from.
 * @param {String} key the key for the modifier.
 * @returns {String} the modifier state.
 */
ModifierSystem.getState = function(entity, key) {
    "use strict";

    var modifier = entity[ModifierComponent.type];
    if (!modifier) return null;

    return modifier[ModifierSystem.Modifiers.State + key];
};

module.exports = ModifierSystem;
module.exports.Modifiers = ModifierSystem.Modifiers;
module.exports.States = ModifierSystem.States;
module.exports.getField = ModifierSystem.getField;
module.exports.setField = ModifierSystem.setField;
module.exports.addField = ModifierSystem.addField;
module.exports.getAddField = ModifierSystem.getAddField;
module.exports.getMultField = ModifierSystem.getMultField;
module.exports.setState = ModifierSystem.setState;
module.exports.getState = ModifierSystem.getState;