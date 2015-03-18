/**
 * @author MW
 * Base script for actions.
 */
function AIScript() {
    "use strict";
}

/**
 * Runs when a behavior is started.
 * A running behavior will not call this.
 * @param {Entity} entity the entity running the AI.
 * @param {AI} ai the AI being run.
 * @param {Behavior} behavior the behavior that is running.
 */
AIScript.prototype.start = function(entity, ai, behavior) {
    "use strict";

};

/**
 * Updates the AI for the entity.
 * @param {Entity} entity the entity running the AI.
 * @param {AI} ai the AI being run.
 * @param {Behavior} behavior the behavior that is running.
 * @return {Boolean} true to signify success and false for failure.
 */
AIScript.prototype.update = function(entity, ai, behavior) {
    "use strict";

    return true;
};

/**
 * Runs when a behavior is finished.
 * A canceled running behavior will also call this.
 * @param {Entity} entity the entity running the AI.
 * @param {AI} ai the AI being run.
 * @param {Behavior} behavior the behavior that is running.
 */
AIScript.prototype.end = function(entity, ai, behavior) {
    "use strict";

};

/**
 * Runs when a running behavior is cancelled.
 * A canceled running behavior will also call this.
 * @param {Entity} entity the entity running the AI.
 * @param {AI} ai the AI being run.
 * @param {Behavior} behavior the behavior that is running.
 */
AIScript.prototype.cancel = function(entity, ai, behavior) {
    "use strict";

};

/**
 * Type used for loading scripts.
 * @type {string}
 */
AIScript.type = 'AIScript';

module.exports = AIScript;