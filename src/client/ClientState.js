/**
 * @author MW
 * Starting point for the game level.
 * Handles dungeon layout creation.
 */

var CoreState = require('../fejs/core/CoreState');
var DungeonCreator = require('./level/DungeonCreator');
var Input = require('../fejs/core/input');
var HotKeys = require('./HotKeys');
var Level = require('./level/Level');
var LevelConfig = require('./level/LevelConfig');

var LocalServer = require('./network/LocalServer');
var LocalClient = require('./network/LocalClient');
var GameAPI = require('./GameAPI');
var LevelInstance = require('./LevelInstance');
var StatsComponent = require('./objects/StatsComponent');

var DebugGlobals = require('../fejs/debug/DebugGlobals');

/**
 * Creates the game.
 * @param {PIXI.Stage} stage the stage to attach scenes to.
 * @param {Viewport} viewport the viewport being used.
 * @param {Input} input the input for the game.
 * @param {Resources} resources the resources used for the game and the loader.
 * @constructor
 * @extends CoreState
 */
function ClientState(stage, viewport, input, resources) {
    "use strict";
    CoreState.call(this);

    this.type = 'ClientState';

    this.stage = stage;
    this.viewport = viewport;
    this.input = input;
    this.resources = resources;

    /**
     * Client to send messages to the server.
     * @type {BaseNetwork}
     */
    this.client = new LocalClient();

    /**
     * Dungeon creator for creating multiple linked levels with.
     * @type {DungeonCreator}
     */
    this.dungeonCreator = new DungeonCreator(resources);

    /**
     * Instance for a level.
     * Each instance has their own entity systems.
     * @type {LevelInstance}
     */
    this.levelInstance = null;

    /**
     * Data for the character in JSON form.
     * @type {Object}
     */
    this.characterData = null;
}
ClientState.prototype = Object.create(CoreState.prototype);

/**
 * Create the game API.
 * @returns {GameAPI}
 */
ClientState.prototype.createAPI = function() {
    "use strict";

    var gameAPI = new GameAPI();
    // Parameters to allow levels, scripts, and systems to use.
    gameAPI.viewport = this.viewport;
    gameAPI.input = this.input;
    gameAPI.resources = this.resources;
    gameAPI.stage = this.stage;
    gameAPI.network = this.client;
    // Hook into the game API.
    gameAPI.hooks.onLevelSwitch = this.switchLevel.bind(this);

    return gameAPI;
};

/**
 * Creates a level instance.
 * The name of the level will first be checked if it is in the level types then
 * checked if it is in the premade levels such as from the dungeon creator.
 * @param {String} name the name of the level to generate.
 * @returns {LevelInstance}
 */
ClientState.prototype._createLevel = function(name) {
    "use strict";

    // Check if a dungeon of the name exists.
    var dungeons = this.resources.getJson('./media/data/config/dungeons.json');
    var dungeonType = dungeons.types[name];
    if (dungeonType) {
        this.dungeonCreator.generate(dungeonType);
    }

    var gameAPI = this.createAPI();

    // Create or retrieve the level.
    var levels = this.resources.getJson('./media/data/config/levels.json');
    var type = levels.types[name];

    var instance = new LevelInstance(gameAPI, this.characterData);
    if (!type) {
        // Create an instance from the dungeon creator.
        instance.level = this.dungeonCreator.getNextLevel();
        // No level found, return to the hub.
        if (!instance.level) {
            type = levels.types['hub'];
        }
    }

    // Start the level.
    var config = null;
    if (type) {
        config = new LevelConfig(type);
    } else {
        config = instance.level.config;
    }
    instance.startLevel(config);

    DebugGlobals.variables.gameAPI = gameAPI;

    return instance;
};

ClientState.prototype.onEnter = function(params) {
    "use strict";

    var config = this.resources.getJson('./media/data/config/main.json');

    // Load the character data with a new JSON object.
    this.characterData = JSON.parse(this.resources.data['./media/data/characters/hero.json']);

    // Start at the hub level.
    this.levelInstance = this._createLevel(config.startingLevel);

    // Add hotkeys for character control.
    this.input.addHotkey(Input.CharCodes.Up, HotKeys.JUMP);
    this.input.addHotkey(Input.CharCodes.Left, HotKeys.LEFT);
    this.input.addHotkey(Input.CharCodes.Down, HotKeys.DOWN);
    this.input.addHotkey(Input.CharCodes.Right, HotKeys.RIGHT);
    this.input.addHotkey(Input.CharCodes.Space, HotKeys.JUMP);
    this.input.addHotkey(Input.CharToKeyCode('W'), HotKeys.JUMP);
    this.input.addHotkey(Input.CharToKeyCode('A'), HotKeys.LEFT);
    this.input.addHotkey(Input.CharToKeyCode('S'), HotKeys.DOWN);
    this.input.addHotkey(Input.CharToKeyCode('D'), HotKeys.RIGHT);
    this.input.addHotkey(Input.CharCodes.Shift, HotKeys.EVADE);
    this.input.addHotkey(Input.CharToKeyCode('E'), HotKeys.USE);
    // Pad hotkeys
    this.input.addHotkey(Input.P1PadCodes.ButtonDown, HotKeys.JUMP);
    this.input.addHotkey(Input.P1PadCodes.Left, HotKeys.LEFT);
    this.input.addHotkey(Input.P1PadCodes.Down, HotKeys.DOWN);
    this.input.addHotkey(Input.P1PadCodes.Right, HotKeys.RIGHT);
    this.input.addHotkey(Input.P1PadCodes.ButtonLeft, HotKeys.ACTIVE1);
    this.input.addHotkey(Input.P1PadCodes.ButtonUp, HotKeys.ACTIVE2);
    this.input.addHotkey(Input.P1PadCodes.ButtonRight, HotKeys.ACTIVE3);
    this.input.addHotkey(Input.P1PadCodes.R2, HotKeys.EVADE);
    // Keyboard action hotkeys.
    this.input.addHotkey(Input.CharToKeyCode('Z'), HotKeys.ACTIVE1);
    this.input.addHotkey(Input.CharToKeyCode('X'), HotKeys.ACTIVE2);
    this.input.addHotkey(Input.CharToKeyCode('C'), HotKeys.ACTIVE3);
    this.input.addHotkey(Input.CharToKeyCode('V'), HotKeys.ACTIVE4);
    this.input.addHotkey(Input.CharToKeyCode('J'), HotKeys.ACTIVE1);
    this.input.addHotkey(Input.CharToKeyCode('K'), HotKeys.ACTIVE2);
    this.input.addHotkey(Input.CharToKeyCode('L'), HotKeys.ACTIVE3);
    this.input.addHotkey(Input.CharToKeyCode(';'), HotKeys.ACTIVE4);
    // Mouse action hotkeys.
    this.input.addHotkey(Input.MouseCodes.Left, HotKeys.ACTIVE1);
    this.input.addHotkey(Input.MouseCodes.Right, HotKeys.ACTIVE2);
    this.input.addHotkey(Input.MouseCodes.Middle, HotKeys.ACTIVE3);
};

/**
 * Update the game.
 * @param {Number} dt the time between updates in ms.
 */
ClientState.prototype.update = function(dt) {
    "use strict";

    this.input.update(dt);

    if (this.levelInstance) {
        this.levelInstance.update(dt);
    }

    this.input.flush();
};

ClientState.prototype.preRender = function(dt) {
    "use strict";

};

ClientState.prototype.postRender = function(dt) {
    "use strict";

};

/**
 * Switches the level to another.
 * The name of the level will first be checked if it is in the level types then
 * checked if it is in the premade levels such as from the dungeon creator.
 * @param {String} name the name of the level to switch to.
 */
ClientState.prototype.switchLevel = function(name) {
    "use strict";

    // Transfer over some character stats to the next level.
    var character = this.levelInstance.character;
    var stats = character[StatsComponent.type];
    if (stats) {
        if (stats.hitPoints <= 0) {
            stats.hitPoints = stats.maxHitPoints;
        }
        this.characterData.components.StatsComponent.hitPoints = stats.hitPoints;
    }

    this.levelInstance.destroy();
    this.levelInstance = this._createLevel(name);
};

ClientState.prototype.onLeave = function(params) {
    "use strict";

    this.levelInstance.destroy();
    this.input.removeAllHotkeys();
};

module.exports = ClientState;