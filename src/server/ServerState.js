/**
 * @author MW
 * State for the server game state.
 * The server state handles all entities that are not in player control.
 * Collisions that involve player controlled entities are ignored.
 */

var CoreState = require('../fejs/core/CoreState');
var Input = require('../fejs/core/input');
var LocalServer = require('../client/network/LocalServer');
var Viewport = require('../fejs/pixi/Viewport');

/**
 * Creates the server.
 * @constructor
 * @extends CoreState
 */
function ServerState(stage, viewport, input, resources) {
    "use strict";
    CoreState.call(this);

    /**
     * Create a dummy stage to not display anything.
     * @type {PIXI.DisplayObjectContainer}
     */
    this.stage = new PIXI.DisplayObjectContainer();

    /**
     * Create a dummy viewport.
     * @type {Viewport}
     */
    this.viewport = new Viewport(new Camera());
    this.viewport.width = viewport.width;
    this.viewport.height = viewport.height;

    /**
     * Create a dummy input.
     * @type {Input}
     */
    this.input = new Input();

    /**
     * Resources for the server to load from.
     * @type {Resources}
     */
    this.resources = resources;

    /**
     * Server to connect the game to if required.
     * @type {BaseNetwork}
     */
    this.server = new LocalServer();
}
ServerState.prototype = Object.create(CoreState.prototype);

ServerState.prototype.onAdd = function(params) {
    "use strict";
};

/**
 * Update the game.
 * @param {Number} dt the time between updates in ms.
 */
ServerState.prototype.update = function(dt) {
    "use strict";
};

ServerState.prototype.preRender = function(dt) {
    "use strict";

};

ServerState.prototype.postRender = function(dt) {
    "use strict";

};

module.exports = ServerState;