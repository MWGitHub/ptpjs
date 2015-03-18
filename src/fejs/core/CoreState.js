/**
 * @author MW
 * Base core state class.
 */

function CoreState() {
    "use strict";

    /**
     * Name of the state used for switching to.
     * @type {string}
     */
    this.type = 'default';

    /**
     * Switcher for switching states.
     * Switcher must be set manually or will be set automatically when added to a switcher.
     * @type {StateSwitcher}
     */
    this.switcher = null;
}

/**
 * Runs when the state is added to a switcher.
 * @param {{}=} params parameters to pass on the add.
 */
CoreState.prototype.onAdd = function(params) {
    "use strict";

};

/**
 * Runs when the state is entered.
 * @param {{}=} params parameters to pass on entering.
 */
CoreState.prototype.onEnter = function(params) {
    "use strict";
};

/**
 * Updates the state.
 * @param {Number} dt the time between updates in ms.
 */
CoreState.prototype.update = function(dt) {
    "use strict";
};

/**
 * Updates before rendering.
 * @param {Number} dt the time between updates in ms.
 */
CoreState.prototype.preRender = function(dt) {
    "use strict";
};

/**
 * Updates after rendering.
 * @param {Number} dt the time between updates in ms.
 */
CoreState.prototype.postRender = function(dt) {
    "use strict";
};

/**
 * Runs when the state is left.
 * @param {{}=} params parameters to pass on leaving.
 */
CoreState.prototype.onLeave = function(params) {
    "use strict";
};

/**
 * Runs when the state is removed from a switcher.
 * @param {{}=} params parameters to pass on leaving.
 */
CoreState.prototype.onRemove = function(params) {
    "use strict";
};

/**
 * Runs on destruction.
 */
CoreState.prototype.destroy = function() {
    "use strict";
};

module.exports = CoreState;