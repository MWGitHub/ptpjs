/**
 * @author MW
 * Holds information on the connections between levels and the data of the levels.
 */
var Level = require('./Level');
var LevelConfig = require('./LevelConfig');
var LevelCreator = require('./LevelCreator');
var TiledMapData = require('./../../fejs/loaders/TiledMapData');
var Random = require('../../fejs/utility/Random');

/**
 * Type for a dungeon.
 * @constructor
 */
function DungeonType() {
    "use strict";

    /**
     * Level groups of the dungeon to choose levels from.
     * @type {Array.<String>}
     */
    this.levels = [];

    /**
     * Groups of levels to choose levels from.
     * Types represents the types of levels.
     * SpecialChance represents the chance of a special level being used instead of one in the group.
     * @type {{
     *     types: Array.<String>,
     *     specialChance: Number
     * }}
     */
    this.groups = {};
}

/**
 * Initializes the creator.
 * @param {Resources} resources the resources to load map files and data files from.
 * @constructor
 */
function DungeonCreator(resources) {
    "use strict";

    /**
     * Resources to load from.
     * @type {Resources}
     */
    this.resources = resources;

    /**
     * Levels for the dungeon creator.
     * @type {Array.<Level>}
     */
    this.levels = [];

    /**
     * Index of the current level.
     * @type {number}
     */
    this.levelIndex = 0;
}

/**
 * Generates the dungeon.
 * @param {DungeonType} type the type of dungeon to generate.
 */
DungeonCreator.prototype.generate = function(type) {
    "use strict";

    this.levels = [];
    this.levelIndex = 0;

    var levelTypes = this.resources.getJson('./media/data/config/levels.json');

    // Generate the levels.
    for (var i = 0; i < type.levels.length; i++) {
        var group = type.groups[type.levels[i]];
        var params = levelTypes.types[Random.pickRandomElement(group.types)];
        var config = new LevelConfig(params);
        var level = new Level(config);

        var mapData;
        var path;
        if (params.generator === 'single') {
            mapData = new TiledMapData();
            path = params.maps[0];
            mapData.loadFromTMX(this.resources.data[path]);
            level.createFromMap(mapData);
        } else {
            var levelCreator = new LevelCreator();
            for (var j = 0; j < params.maps.length; j++) {
                mapData = new TiledMapData();
                path = params.maps[j];
                mapData.loadFromTMX(this.resources.data[path]);
                levelCreator.addMapData(path, mapData);
            }
            var multiMap = levelCreator.generateMap(params, 'generated');
            level.createFromMap(multiMap);
        }

        this.levels.push(level);
    }
};

/**
 * Retrieves the next level.
 * @returns {Level} the level or null if none available.
 */
DungeonCreator.prototype.getNextLevel = function() {
    "use strict";

    var level = this.levels[this.levelIndex];
    this.levelIndex++;

    return level;
};

module.exports = DungeonCreator;