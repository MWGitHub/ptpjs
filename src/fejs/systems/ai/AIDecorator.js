/**
 * @author MW
 * Decorator for the behavior system.
 */

function AIDecorator() {
    "use strict";
}

/**
 * Runs the decorator.
 * @param {Entity} entity the entity for the AI.
 * @param {AI} ai the AI being run.
 * @param {AI} behavior the behavior being run.
 * @param {Boolean} input the result of the child.
 * @returns {Boolean} the modified result.
 */
AIDecorator.prototype.run = function(entity, ai, input) {
    "use strict";

    return input;
};

module.exports = AIDecorator;