/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 11/16/13
 * Time: 5:55 PM
 * Base system class.
 */

/**
 * Initializes the class.
 * @constructor
 */
function System() {
    "use strict";
}
module.exports = System;

/**
 * Updates the system before the normal update.
 * Used before game logic updates.
 * @param {number} dt the time between updates.
 */
System.prototype.preUpdate = function(dt) {
    "use strict";
};

/**
 * Updates the system.
 * Used after game logic updates.
 * @param dt the time between updates.
 */
System.prototype.update = function(dt) {
    "use strict";
};

/**
 * Cleans up the system.
 * Keep cleanup system independent as in other systems should not depend on the
 * cleanup of another.
 */
System.prototype.cleanup = function() {
    "use strict";
};

/**
 * Destroys the system.
 */
System.prototype.destroy = function() {
    "use strict";
};
