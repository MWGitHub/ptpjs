/**
 * @author MW
 * Level creator used for creating a single level made of multiple levels.
 */

var Random = require('../../fejs/utility/Random');
var Collections = require('../../fejs/utility/collections');
var TiledMapData = require('./../../fejs/loaders/TiledMapData');
var TileTypes = require('./Level').TileTypes;
var ObjectTypes = require('./Level').ObjectTypes;
var TileLayers = require('./Level').TileLayers;
var ObjectLayers = require('./Level').ObjectLayers;

/**
 * Directions used for connecting.
 * @type {{Left: number, Top: number, Right: number, Bottom: number}}
 */
var Directions = {
    Left: 1,
    Top: 2,
    Right: 3,
    Bottom: 4
};

/**
 * Connection directions for maps that allows for multiple directions.
 * @type {{None: number, Left: number, Top: number, Right: number, Bottom: number}}
 */
var Connections = {
    None: 0,
    Left: 1 << 1,
    Top: 1 << 2,
    Right: 1 << 3,
    Bottom: 1 << 4
};

/**
 * Info for a map.
 * @constructor
 */
function MapInfo() {
    "use strict";

    /**
     * Data for a map.
     * @type {TiledMapData}
     */
    this.map = null;

    /**
     * Direction of the connections in the map.
     * @type {number}
     */
    this.direction = 0;

    /**
     * Locations of the connections.
     * @type {Array.<{x: Number, y:Number}>}
     */
    this.connections = [];
}

/**
 * Checks if a map connects to this map.
 * @param {MapInfo} mapInfo the map to check with.
 * @param {Number} direction the direction of the connection.
 * @returns {boolean} true if the maps connect.
 */
MapInfo.prototype.checkIfConnects = function(mapInfo, direction) {
    "use strict";

    var tiles = this.map.tileLayers[TileLayers.Tiles];
    var height = tiles.length;
    var width = tiles[0].length;
    for (var i = 0; i < this.connections.length; i++) {
        var c1 = this.connections[i];
        var edge = {
            x: 0,
            y: 0
        };
        if (direction === Directions.Left) {
            edge.x = c1.x + width - 1;
            edge.y = c1.y;
        }
        if (direction === Directions.Right) {
            edge.x = c1.x - (width - 1);
            edge.y = c1.y;
        }
        if (direction === Directions.Top) {
            edge.x = c1.x;
            edge.y = c1.y + height - 1;
        }
        if (direction === Directions.Bottom) {
            edge.x = c1.x;
            edge.y = c1.y - (height - 1);
        }
        for (var j = 0; j < mapInfo.connections.length; j++) {
            var c2 = mapInfo.connections[j];
            if (edge.x === c2.x && edge.y === c2.y) return true;
        }
    }

    return false;
};

/**
 * Initializes the level creator.
 * @constructor
 */
function LevelCreator() {
    "use strict";

    /**
     * Information for maps.
     * @type {Object.<String, MapInfo>}
     */
    this.mapInfos = {};
}

/**
 * Adds a map data into the level creator.
 * @param {String} name the name to store the map as.
 * @param {TiledMapData} mapData the map data.
 */
LevelCreator.prototype.addMapData = function(name, mapData) {
    "use strict";

    var mapInfo = new MapInfo();
    this.mapInfos[name] = mapInfo;
    mapInfo.map = mapData;

    // Place the map in categories.
    var tiles = mapInfo.map.tileLayers[TileLayers.Tiles];
    for (var y = 0; y < tiles.length; y++) {
        for (var x = 0; x < tiles[y].length; x++) {
            var index = tiles[y][x];
            if (index === TileTypes.Connector) {
                mapInfo.connections.push({x: x, y: y});
                if (x === 0) {
                    mapInfo.direction = mapInfo.direction | Connections.Left;
                }
                if (x === tiles[y].length - 1) {
                    mapInfo.direction = mapInfo.direction | Connections.Right;
                }
                if (y === 0) {
                    mapInfo.direction = mapInfo.direction | Connections.Top;
                } else if (y === tiles.length - 1) {
                    mapInfo.direction = mapInfo.direction | Connections.Bottom;
                }
            }
        }
    }
};

/**
 * Populates an 2D array with the given value.
 * @param {Number} width the width of a row.
 * @param {Number} height the number of rows.
 * @param {*} value the value to set each element to.
 * @returns {Array} the new array with the value as default.
 */
function createAndPopulate2D(width, height, value) {
    "use strict";

    var output = [];
    for (var y = 0; y < height; y++) {
        output.push([]);
        for (var x = 0; x < width; x++) {
            output[y][x] = value;
        }
    }

    return output;
}

/**
 * Creates the starting and ending points for the map.
 * @param {String} start the starting criteria.
 * @param {String} end the end criteria.
 * @param {Number} width the width of the map.
 * @param {Number} height the height of the map.
 * @returns {{start: {x: number, y: number}, end: {x: number, y: number}}}
 */
function createMapPoints(start, end, width, height) {
    "use strict";

    var output = {start: {x: 0, y: 0}, end: {x: 0, y: 0}};

    var entrance = {x: 0, y: 0};
    entrance.x = Math.floor(Math.random() * width);
    entrance.y = Math.floor(Math.random() * height);
    var exit = {x: 0, y: 0};
    exit.x = Math.floor(Math.random() * width);
    exit.y = Math.floor(Math.random() * height);
    if (start === 'top') {
        entrance.y = 0;
    }
    if (start === 'left') {
        entrance.x = 0;
    }
    if (end === 'bottom') {
        exit.y = height - 1;
    }
    if (end === 'right') {
        exit.x = width - 1;
    }
    output.start = entrance;
    output.end = exit;

    return output;
}

/**
 * Generates a map based on multiple maps.
 * @param {Object} type the type of map to create.
 * @param {String} exitName the name of the exit.
 * @returns {TiledMapData} the generated map data.
 */
LevelCreator.prototype.generateMap = function(type, exitName) {
    "use strict";

    var config = LevelCreator.MapConfigs[type.generator];
    var width = type.width;
    var height = type.height;

    var combinedMapData = new TiledMapData();
    combinedMapData.tileWidth = config.tileWidth;
    combinedMapData.tileHeight = config.tileHeight;

    // Create empty tiles.
    combinedMapData.tileLayers[TileLayers.Tiles] =
        createAndPopulate2D(width * config.colsPerMap, height * config.rowsPerMap, 0);
    combinedMapData.tileLayers[TileLayers.Background] =
        createAndPopulate2D(width * config.colsPerMap, height * config.rowsPerMap, 0);

    // Create empty object and region layers.
    combinedMapData.objectLayers[ObjectLayers.Objects] = [];
    combinedMapData.regionLayers[ObjectLayers.Objects] = [];

    var row, col, i, y, x;
    // Generate the connection map.
    var connections = createAndPopulate2D(width, height, 0);
    // Set the entrance and the exit.
    var mapPoints = createMapPoints(config.start, config.end, width, height);
    var entrance = mapPoints.start;
    var exit = mapPoints.end;

    // Create a path from the start to the end with directions logged.
    // Directions are 1 - left, 2 - top, 3 - right, 4 - bottom.
    connections[entrance.y][entrance.x] = 1;
    var done = false;
    var walks = [{x: entrance.x, y: entrance.y}];
    var direction = 0;
    while (!done) {
        var valid = false;
        while (!valid) {
            var currentIndex = {x: walks[walks.length - 1].x, y: walks[walks.length - 1].y};
            // Check if already at the exit (for 1 room dungeons case).
            if (currentIndex.x === exit.x && currentIndex.y === exit.y) {
                done = true;
                break;
            }
            direction = Math.floor(Math.random() * 4) + 1;
            if (direction === Directions.Left && currentIndex.x > 0 && connections[currentIndex.y][currentIndex.x - 1] === 0) {
                valid = true;
                connections[currentIndex.y][currentIndex.x - 1] = 1;
                currentIndex.x--;
            }
            if (direction === Directions.Top && currentIndex.y > 0 && connections[currentIndex.y - 1][currentIndex.x] === 0) {
                valid = true;
                connections[currentIndex.y - 1][currentIndex.x] = 1;
                currentIndex.y--;
            }
            if (direction === Directions.Right && currentIndex.x < width - 1 && connections[currentIndex.y][currentIndex.x + 1] === 0) {
                valid = true;
                connections[currentIndex.y][currentIndex.x + 1] = 1;
                currentIndex.x++;
            }
            if (direction === Directions.Bottom && currentIndex.y < height - 1 && connections[currentIndex.y + 1][currentIndex.x] === 0) {
                valid = true;
                connections[currentIndex.y + 1][currentIndex.x] = 1;
                currentIndex.y++;
            }
            if (valid) {
                walks.push({x: currentIndex.x, y: currentIndex.y});
            }
            if (currentIndex.x === exit.x && currentIndex.y === exit.y) {
                done = true;
            } else {
                // Check if surrounded by tiles and backtrack.
                var shouldBacktrack = true;
                if (currentIndex.y > 0 && connections[currentIndex.y - 1][currentIndex.x] === 0) {
                    shouldBacktrack = false;
                }
                if (currentIndex.y < height - 1 && connections[currentIndex.y + 1][currentIndex.x] === 0) {
                    shouldBacktrack = false;
                }
                if (currentIndex.x > 0 && connections[currentIndex.y][currentIndex.x - 1] === 0) {
                    shouldBacktrack = false;
                }
                if (currentIndex.x < width - 1 && connections[currentIndex.y][currentIndex.x + 1] === 0) {
                    shouldBacktrack = false;
                }
                if (shouldBacktrack) {
                    walks.pop();
                }
            }
        }
    }
    // Set the path with the required directions per map.
    var walk, prev, next;
    for (i = 0; i < walks.length; i++) {
        prev = walks[i - 1];
        walk = walks[i];
        next = walks[i + 1];
        walk.direction = 0;
        if (prev) {
            if (walk.x - prev.x < 0) {
                walk.direction = walk.direction | Connections.Right;
            } else if (walk.x - prev.x > 0) {
                walk.direction = walk.direction | Connections.Left;
            }
            if (walk.y - prev.y < 0) {
                walk.direction = walk.direction | Connections.Bottom;
            } else if (walk.y - prev.y > 0) {
                walk.direction = walk.direction | Connections.Top;
            }
        }
        if (next) {
            if (walk.x - next.x < 0) {
                walk.direction = walk.direction | Connections.Right;
            } else if (walk.x - next.x > 0) {
                walk.direction = walk.direction | Connections.Left;
            }
            if (walk.y - next.y < 0) {
                walk.direction = walk.direction | Connections.Bottom;
            } else if (walk.y - next.y > 0) {
                walk.direction = walk.direction | Connections.Top;
            }
        }
    }
    console.log('Entrance (x: %d, y: %d)', entrance.x, entrance.y);
    console.log('Exit (x: %d, y: %d)', exit.x, exit.y);
    console.log(walks);
    console.log(Collections.array2dToString(connections));

    // Create the map connections with maps that fit the directions and connectors.
    var pieces = createAndPopulate2D(width, height, null);
    var previousMap = null;
    for (i = 0; i < walks.length; i++) {
        prev = walks[i - 1];
        walk = walks[i];

        var validMaps = [];
        // Get all maps that can connect.
        for (var key in this.mapInfos) {
            if (this.mapInfos.hasOwnProperty(key)) {
                var map = this.mapInfos[key];
                // Check if the map direction matches all the walking directions.
                if ((walk.direction & map.direction) === walk.direction) {
                    if (previousMap) {
                        if (prev) {
                            // Get the direction of the previous tile to connect to.
                            direction = 0;
                            if (walk.x - prev.x < 0) direction = Directions.Right;
                            if (walk.x - prev.x > 0) direction = Directions.Left;
                            if (walk.y - prev.y < 0) direction = Directions.Bottom;
                            if (walk.y - prev.y > 0) direction = Directions.Top;
                            if (map.checkIfConnects(previousMap, direction)) {
                                validMaps.push(map);
                            }
                        }
                    } else {
                        validMaps.push(map);
                    }
                }
            }
        }
        // Choose a random map from the valid list.
        pieces[walk.y][walk.x] = Random.pickRandomElement(validMaps);
        previousMap = pieces[walk.y][walk.x];
        if (!previousMap) {
            console.log('Pieces:');
            console.log(pieces);
            console.log('Pieces Print:');
            console.log(Collections.array2dToString(pieces));
            console.log('Valid maps:');
            console.log(validMaps);
            throw new Error('Invalid map generated.');
        }
    }
    // Populate the unused parts of the map.
    for (row = 0; row < pieces.length; row++) {
        for (col = 0; col < pieces[row].length; col++) {
            if (!pieces[row][col]) {
                pieces[row][col] = Random.pickRandomProperty(this.mapInfos);
            }
        }
    }

    // Piece together maps.
    var tileLayer = combinedMapData.tileLayers[TileLayers.Tiles];
    var backgroundLayer = combinedMapData.tileLayers[TileLayers.Background];
    var objectLayer = combinedMapData.objectLayers[ObjectLayers.Objects];
    var regionLayer = combinedMapData.regionLayers[ObjectLayers.Objects];
    for (row = 0; row < pieces.length; row++) {
        for (col = 0; col < pieces[row].length; col++) {
            var mapInfo = pieces[row][col];
            var data = mapInfo.map;
            combinedMapData.properties = data.properties;

            var bgTiles = data.tileLayers[TileLayers.Background];
            var dataTiles = data.tileLayers[TileLayers.Tiles];
            var dataObjects = data.objectLayers[ObjectLayers.Objects];
            var dataRegions = data.regionLayers[ObjectLayers.Objects];

            // Add the map to the master map.
            for (y = 0; y < bgTiles.length; y++) {
                for (x = 0; x < bgTiles[y].length; x++) {
                    backgroundLayer[row * bgTiles.length + y][col * bgTiles[y].length + x] =
                        bgTiles[y][x];
                }
            }
            // Add the map to the master map.
            for (y = 0; y < dataTiles.length; y++) {
                for (x = 0; x < dataTiles[y].length; x++) {
                    tileLayer[row * dataTiles.length + y][col * dataTiles[y].length + x] =
                        dataTiles[y][x];
                }
            }
            for (i = 0; i < dataObjects.length; i++) {
                // Create a copy of the object.
                var obj = Collections.shallowCopyObject(dataObjects[i]);
                obj.x = dataObjects[i].x + col * combinedMapData.tileWidth * data.width;
                obj.y = dataObjects[i].y + row * combinedMapData.tileHeight * data.height;
                // Only add one type of some objects.
                switch (obj.gid) {
                    case ObjectTypes.Spawn:
                        if (row === entrance.y && col === entrance.x) {
                            objectLayer.push(obj);
                        }
                        break;
                    case ObjectTypes.Exit:
                        // TODO: Have the exit just go back to hub for now.
                        if (row === exit.y && col === exit.x) {
                            objectLayer.push({
                                gid: ObjectTypes.Exit,
                                x: obj.x,
                                y: obj.y,
                                name: exitName || 'hub',
                                type: 'zone'
                            });
                        }
                        break;
                    default:
                        if (row === entrance.y && col === entrance.x &&
                            (obj.gid === ObjectTypes.Enemy || obj.gid === ObjectTypes.RangedEnemy ||
                             obj.gid === ObjectTypes.MeleeEnemy || obj.gid === ObjectTypes.FlyingEnemy ||
                             obj.gid === ObjectTypes.GroundEnemy || obj.gid === ObjectTypes.PresetEnemy))
                        {
                            // Do not spawn enemies in the spawn zone.
                        } else {
                            objectLayer.push(obj);
                        }
                }
            }
            for (i = 0; i < dataRegions.length; i++) {
                // Create a copy of the region.
                var dataRegion = dataRegions[i];
                var region = Collections.shallowCopyObject(dataRegion);
                region.x = dataRegion.x + col * combinedMapData.tileWidth * data.width;
                region.y = dataRegion.y + row * combinedMapData.tileHeight * data.height;
                regionLayer.push(region);
            }
        }
    }

    combinedMapData.height = tileLayer.length;
    combinedMapData.width = tileLayer[0].length;

    return combinedMapData;
};

/**
 * Configurations for maps.
 */
LevelCreator.MapConfigs = {
    leftToRight: {
        rowsPerMap: 10,
        colsPerMap: 10,
        tileWidth: 32,
        tileHeight: 32,
        start: 'left',
        end: 'right'
    },
    standard: {
        rowsPerMap: 10,
        colsPerMap: 10,
        tileWidth: 32,
        tileHeight: 32,
        start: 'top',
        end: 'bottom'
    }
};

module.exports = LevelCreator;
module.exports.MapConfigs = LevelCreator.MapConfigs;