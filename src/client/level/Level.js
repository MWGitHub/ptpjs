/**
 * @author MW
 * Represents a playable level.
 */

var TileTypes = require('../../fejs/systems/physics/TileColliderSystem').TileTypes;
var Random = require('../../fejs/utility/Random');
var Collections = require('../../fejs/utility/collections');
var LevelConfig = require('./LevelConfig');

/**
 * Represents a background for the level.
 * @param {Object} data the data for the background.
 * @constructor
 */
function LevelBackground(data) {
    "use strict";

    /**
     * Image of the background.
     * @type {String}
     */
    this.image = data.image;

    /**
     * Sprite for the background.
     * @type {PIXI.Sprite}
     */
    this.sprite = null;

    /**
     * True to use a tiled sprite for the background.
     * @type {boolean}
     */
    this.isTiled = data.isTiled || false;

    /**
     * Scrolling speed in the X direction.
     * @type {number}
     */
    this.scrollX = data.scrollX || 0;

    /**
     * Scrolling speed in the Y direction.
     * @type {number}
     */
    this.scrollY = data.scrollY || 0;

    /**
     * Speed the X background scrolls at.
     * Speed will disable scroll.
     * @type {number}
     */
    this.speedX = data.speedX || 0;

    /**
     * Speed the Y background scrolls at.
     * Speed will disable scroll.
     * @type {number}
     */
    this.speedY = data.speedY || 0;

    /**
     * Width of the background for use when repeating.
     * @type {number}
     */
    this.width = data.width || 0;

    /**
     * Height of the background for use when repeating.
     * @type {number}
     */
    this.height = data.height || 0;
}

/**
 * Creates the level.
 * @param {LevelConfig} config the configuration for the level.
 * @constructor
 */
function Level(config) {
    "use strict";

    /**
     * Tiles for the level.
     * @type {Array.<Array.<Number>>}
     */
    this.tiles = [];

    /**
     * Tiles for the background.
     * @type {Array.<Array.<Number>>}
     */
    this.backgroundTiles = [];

    /**
     * Tiles for the foreground.
     * @type {Array.<Array.<Number>>}
     * @type {Array}
     */
    this.foregroundTiles = [];

    /**
     * Tiles that can block the objects.
     * @type {Array.<Array.<Number>>}
     */
    this.staticTiles = [];

    /**
     * Tiles that are just checked against the objects.
     * @type {Array.<Array.<Number>>}
     */
    this.sensorTiles = [];

    /**
     * Background display tiles.
     * @type {Array.<Array.<Number>>}
     */
    this.displayTilesBackground = [];

    /**
     * Tiles used for the display.
     * @type {Array.<Array.<Number>>}
     */
    this.displayTiles = [];

    /**
     * Tiles used for the foreground display.
     * @type {Array.<Array.<Number>>}
     */
    this.displayTilesForeground = [];

    /**
     * Width of the level in tiles.
     * @type {number}
     */
    this.width = 0;
    /**
     * Height of the level in tiles.
     * @type {number}
     */
    this.height = 0;

    /**
     * Width of a tile.
     * @type {number}
     */
    this.tileWidth = 0;
    /**
     * Height of a tile.
     * @type {number}
     */
    this.tileHeight = 0;

    /**
     * Objects in the map.
     * @type {Array.<{
     *     gid: Number,
     *     x: Number,
     *     y: Number
     * }>}
     */
    this.objects = [];

    /**
     * Regions in the map.
     * @type {Array.<{
     *     name: String,
     *     type: String,
     *     x: Number,
     *     y: Number,
     *     width: Number,
     *     height: Number
     * }>}
     */
    this.regions = [];

    /**
     * Properties for the level.
     * @type {{}}
     */
    this.properties = {};

    /**
     * Type of level.
     * @type {LevelConfig}
     */
    this.config = config || new LevelConfig();

    /**
     * Enemies to use for enemy type generation.
     * @type {Array.<Array.<Number>>}
     */
    this.enemies = Collections.copyArray(this.config.enemies);

    /**
     * Container to hold all the background tiles.
     * @type {PIXI.DisplayObjectContainer}
     * @private
     */
    this._backgroundBase = new PIXI.DisplayObjectContainer();

    /**
     * Container to hold all the static tiles.
     * @type {PIXI.DisplayObjectContainer}
     * @private
     */
    this._staticBase = new PIXI.DisplayObjectContainer();

    /**
     * Container to hold all the foreground tiles.
     * @type {PIXI.DisplayObjectContainer}
     * @private
     */
    this._foregroundBase = new PIXI.DisplayObjectContainer();

    /**
     * Sprites for each background tile.
     * @type {Array.<Array.<PIXI.Sprite>>}
     */
    this.spriteBackgroundTiles = [];

    /**
     * Sprites for each tile.
     * @type {Array.<Array.<PIXI.Sprite>>}
     */
    this.spriteTiles = [];

    /**
     * Sprites for each foreground tile.
     * @type {Array.<Array.<PIXI.Sprite>>}
     */
    this.spriteForegroundTiles = [];

    /**
     * Background for the level that is not made of tiles.
     * @type {Array.<LevelBackground>}
     */
    this.backgrounds = [];

    /**
     * Tinting for each layer.
     * @type {{background: number, tiles: number, foreground: number}}
     */
    this.tints = {
        background: 0xFFFFFF,
        tiles: 0xFFFFFF,
        foreground: 0xFFFFFF
    };
}

/**
 * Copies an array of tiles.
 * @param {Array.<Array.<Number>>} array the array to copy.
 * @returns {Array.<Array.<Number>>} the copied array or an empty array if none is given.
 */
Level.copyTiles = function(array) {
    "use strict";

    if (!array) return [];

    var copy = [];
    for (var row = 0; row < array.length; row++) {
        var rowTiles = [].concat(array[row]);
        copy.push(rowTiles);
    }

    return copy;
};

/**
 * Copies map objects.
 * @param {Array.<{
 *   name: String,
 *   type: String,
 *   gid: Number,
 *   x: Number,
 *   y: Number
 * }>} array the objects to copy.
 * @returns {Array} the array of objects.
 */
Level.copyObjects = function(array) {
    "use strict";

    var objects = [];
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        // Skip objects that do not pass the chance amount.
        if (obj.chance && Random.pickRandomFloat() > obj.chance) {
            continue;
        }
        var copy = Collections.shallowCopyObject(obj);
        objects.push(copy);
    }

    return objects;
};

/**
 * Copies regions in the map.
 * @param {Array} array the region array.
 */
Level.copyRegions = function(array) {
    "use strict";

    var regions = [];
    for (var i = 0; i < array.length; i++) {
        var region = array[i];
        // Skip regions that do not pass the chance amount.
        if (region.chance && Random.pickRandomFloat() > region.chance) {
            continue;
        }
        regions.push(Collections.shallowCopyObject(region));
    }
    return regions;
};

/**
 * Copy the properties of an object.
 * @param {Object} properties the object properties to copy.
 * @returns {Object} the copied properties.
 */
Level.copyProperties = function(properties) {
    "use strict";

    var copy = {};

    for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
            copy[key] = properties[key];
        }
    }

    return copy;
};

/**
 * Generate the static tiles for the level.
 * @param {Array.<Array.<Number>>} tiles the raw tiles to generate off of.
 * @returns {Array.<Array.<Number>>} the static tiles.
 */
function generateStaticTiles(tiles) {
    "use strict";

    var staticTiles = Level.copyTiles(tiles);
    for (var y = 0; y < staticTiles.length; y++) {
        for (var x = 0; x < staticTiles[y].length; x++) {
            var index = staticTiles[y][x];

            if (index === Level.TileTypes.Empty) continue;
            if (index === Level.TileTypes.Static) continue;
            if (index === Level.TileTypes.OneWayTop) continue;
            if (index === Level.TileTypes.OneWayBottom) continue;
            if (index === Level.TileTypes.OneWayCenter) continue;
            if (index === Level.TileTypes.RampBottomLeft) continue;
            if (index === Level.TileTypes.RampBottomRight) continue;
            if (index === Level.TileTypes.RampTopLeft) continue;
            if (index === Level.TileTypes.RampTopRight) continue;

            if (index === Level.TileTypes.Connector) {
                staticTiles[y][x] = 0;
                continue;
            }

            // Default tiles should be static.
            staticTiles[y][x] = TileTypes.Static;
        }
    }

    return staticTiles;
}

/**
 * Generate the sensor tiles for the level.
 * @param Array.<Array.<Number>> tiles the tiles to generate the sensor tiles from.
 * @returns {Array.<Array.<Number>>} the generated sensor tiles.
 */
function generateSensorTiles(tiles) {
    "use strict";

    var sensorTiles = Level.copyTiles(tiles);

    return sensorTiles;
}

/**
 * Create edges if needed.
 * @param type the type of level.
 * @param {Array.<Array.<Number>>} tiles the tiles to modify for the edges.
 * @return {Array.<Array.<Number>>} the sealed tiles.
 */
function sealEdge(type, tiles) {
    "use strict";

    // Do not seal invalid layers.
    if (tiles.length === 0) return tiles;

    var output = Level.copyTiles(tiles);

    var row, workingTiles, h, w;

    // Add a row of static tiles to the top of the level.
    if (type.closeEdge.top) {
        row = [];
        workingTiles = [];
        for (w = 0; w < output[0].length; w++) {
            row.push(Level.TileTypes.Static);
        }
        workingTiles.push(row);
        for (h = 0; h < output.length; h++) {
            workingTiles.push(output[h]);
        }
        output = workingTiles;
    }
    // Add a row of static tiles to the bottom of the level.
    if (type.closeEdge.top) {
        row = [];
        for (w = 0; w < output[0].length; w++) {
            row.push(Level.TileTypes.Static);
        }
        output.push(row);
    }
    // Add columns to the left of the level.
    if (type.closeEdge.left) {
        for (h = 0; h < output.length; h++) {
            workingTiles = [Level.TileTypes.Static].concat(output[h]);
            output[h] = workingTiles;
        }
    }
    // Add columns to the right of the level.
    if (type.closeEdge.left) {
        for (h = 0; h < output.length; h++) {
            output[h][output[h].length] = Level.TileTypes.Static;
        }
    }

    return output;
}

/**
 * Creates the level from a single map.
 * @param {TiledMapData} map the map data to load from.
 */
Level.prototype.createFromMap = function(map) {
    "use strict";

    // Copy the tiles and seal edges of the map if needed.
    var layer = map.tileLayers[Level.TileLayers.Tiles];
    this.tiles = layer.tiles;
    this.tiles = sealEdge(this.config, this.tiles);
    // Set the properties of the layer.
    var tint = 0xFFFFFF;
    if (layer.properties.r !== 'undefined' && layer.properties.g !== 'undefined'&& layer.properties.b !== 'undefined') {
        tint = (parseFloat(layer.properties.r) << 16) +
            (parseFloat(layer.properties.g) << 8) +
            (parseFloat(layer.properties.b));
        this.tints.tiles = tint || 0xFFFFFF;
    }

    layer = map.tileLayers[Level.TileLayers.Background];
    this.backgroundTiles = layer.tiles;
    this.backgroundTiles = sealEdge(this.config, this.backgroundTiles);
    // Set the properties of the layer.
    if (layer.properties.r !== 'undefined' && layer.properties.g !== 'undefined'&& layer.properties.b !== 'undefined') {
        tint = (parseFloat(layer.properties.r) << 16) +
            (parseFloat(layer.properties.g) << 8) +
            (parseFloat(layer.properties.b));
        this.tints.background = tint || 0xFFFFFF;
    }

    layer = map.tileLayers[Level.TileLayers.Foreground];
    this.foregroundTiles = layer.tiles;
    this.foregroundTiles = sealEdge(this.config, this.foregroundTiles);
    // Set the properties of the layer.
    if (layer.properties.r !== 'undefined' && layer.properties.g !== 'undefined'&& layer.properties.b !== 'undefined') {
        tint = (parseFloat(layer.properties.r) << 16) +
            (parseFloat(layer.properties.g) << 8) +
            (parseFloat(layer.properties.b));
        this.tints.foreground = tint || 0xFFFFFF;
    }

    this.sensorTiles = generateStaticTiles(this.tiles);
    this.staticTiles = generateStaticTiles(this.tiles);

    // Create the default display tiles.
    this.displayTiles = Level.copyTiles(this.tiles);
    this.displayTilesBackground = Level.copyTiles(this.backgroundTiles);
    this.displayTilesForeground = Level.copyTiles(this.foregroundTiles);

    this.width = this.tiles[0].length;
    this.height = this.tiles.length;
    this.tileWidth = map.tileWidth;
    this.tileHeight = map.tileHeight;

    this.objects = Level.copyObjects(map.objectLayers[Level.ObjectLayers.Objects]);
    // Push objects if needed due to sealing.
    var i;
    if (this.config.closeEdge.top) {
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].y += this.tileHeight;
        }
    }
    if (this.config.closeEdge.left) {
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].x += this.tileWidth;
        }
    }

    this.regions = Level.copyRegions(map.regionLayers[Level.ObjectLayers.Objects]);
    // Push regions if needed due to sealing.
    if (this.config.closeEdge.top) {
        for (i = 0; i < this.regions.length; i++) {
            this.regions[i].y += this.tileHeight;
        }
    }
    if (this.config.closeEdge.left) {
        for (i = 0; i < this.regions.length; i++) {
            this.regions[i].x += this.tileWidth;
        }
    }

    this.properties = Level.copyProperties(map.properties);
};

/**
 * Retrieves the first object matching the ID.
 * @param {Number} id the ID of the object.
 * @returns {Object} the object matching the GID or null if none found.
 */
Level.prototype.getFirstObjectOfID = function(id) {
    "use strict";

    for (var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        if (object.gid === id) {
            return object;
        }
    }
    return null;
};

/**
 * Generates random display tile indices for the given tiles.
 * @param type the type for generating tiles.
 * @param {Array.<Array.<Number>>} tiles the tiles to retrieve the values from.
 * @return {Array.<Array.<Number>>} the display array by indices.
 */
function generateDisplayTiles(type, tiles) {
    "use strict";

    // TODO: Make sure tile groups are able to fit exactly.

    var generatedTiles = [];
    var h, w, y, x, hy, wx;
    for (h = 0; h < tiles.length; h++) {
        generatedTiles.push([]);
    }
    var tileIndex;
    for (h = 0; h < tiles.length; h++) {
        for (w = 0; w < tiles[h].length; w++) {
            tileIndex = tiles[h][w];

            // Ignore non-displayable tiles.
            if (tileIndex <= Level.TileTypes.Empty) {
                generatedTiles[h][w] = tileIndex;
                continue;
            }
            if (tileIndex === Level.TileTypes.Connector) {
                generatedTiles[h][w] = Level.TileTypes.Empty;
                continue;
            }

            if (generatedTiles[h][w]) continue;

            switch (tileIndex) {
                // Create a random texture.
                case Level.TileTypes.Static:
                    var index = type.tiles[Math.floor(Math.random() * type.tiles.length)];
                    var width, height;
                    // Check if group.
                    if (index instanceof Array) {
                        if (index[0] instanceof Array) {
                            // 2D group.
                            height = index.length;
                            width = index[0].length;
                            for (y = 0; y < height; y++) {
                                for (x = 0; x < width; x++) {
                                    hy = h + y;
                                    wx = w + x;
                                    // Only set tiles in the group if the others are also random type.
                                    if (tiles[hy] && tiles[hy][wx] === Level.TileTypes.Static) {
                                        // Do not set index if already used.
                                        if (generatedTiles[hy][wx]) continue;

                                        generatedTiles[hy][wx] = index[y][x];
                                    }
                                }
                            }
                        } else {
                            // Row group.
                            width = index.length;
                            for (x = 0; x < width; x++) {
                                wx = w + x;
                                if (tiles[h][wx] === Level.TileTypes.Static) {
                                    if (generatedTiles[h][wx]) continue;

                                    generatedTiles[h][wx] = index[x];
                                }
                            }
                        }
                    } else {
                        // Single random tile.
                        generatedTiles[h][w] = index;
                    }
                    break;
                default:
                    generatedTiles[h][w] = tileIndex - 1;
            }
        }
    }
    return generatedTiles;
}

/**
 * Generates the display for the level.
 * @param {PIXI.DisplayObjectContainer} backgroundLayer the background tile layer.
 * @param {PIXI.DisplayObjectContainer} tileLayer the tile layer.
 * @param {PIXI.DisplayObjectContainer} foregroundLayer the foreground tile layer.
 */
Level.prototype.generateDisplay = function(backgroundLayer, tileLayer, foregroundLayer) {
    "use strict";

    // Remove the previous display if available.
    if (this._backgroundBase.parent !== null) {
        this._backgroundBase.parent.removeChild(this._backgroundBase);
    }
    this._backgroundBase = new PIXI.DisplayObjectContainer();
    backgroundLayer.addChild(this._backgroundBase);

    if (this._staticBase.parent !== null) {
        this._staticBase.parent.removeChild(this._staticBase);
    }
    this._staticBase = new PIXI.DisplayObjectContainer();
    tileLayer.addChild(this._staticBase);

    if (this._foregroundBase.parent !== null) {
        this._foregroundBase.parent.removeChild(this._foregroundBase);
    }
    this._foregroundBase = new PIXI.DisplayObjectContainer();
    foregroundLayer.addChild(this._foregroundBase);

    // Display background.
    var bgConfigs = this.config.backgrounds;
    for (var i = 0; i < bgConfigs.length; i++) {
        var bgConfig = bgConfigs[i];
        var levelBg = new LevelBackground(bgConfig);
        var image = levelBg.image;
        var texture = PIXI.Texture.fromImage(image);
        if (!texture) continue;

        var sprite;
        if (bgConfig.isTiled) {
            sprite = new PIXI.TilingSprite(texture, this.width * this.tileWidth * 2, this.height * this.tileHeight * 2);
            sprite.anchor.x = 0.3;
            sprite.anchor.y = 0.3;
        } else {
            sprite = new PIXI.Sprite(texture);
        }
        levelBg.sprite = sprite;
        this.backgrounds.push(levelBg);
        this._backgroundBase.addChild(sprite);
    }

    // Generate the display tile indices.
    this.displayTiles = generateDisplayTiles(this.config, this.tiles);
    this.displayTilesBackground = generateDisplayTiles(this.config, this.backgroundTiles);
    this.displayTilesForeground = generateDisplayTiles(this.config, this.foregroundTiles);

    // Display edges of tiles.
    if (!this.config.generateEdges) return;

    var index;
    var tileIndex;
    var TileTypes = Level.TileTypes;
    var tiles = this.tiles;
    var edges = this.config.edges;
    // Edged tiles (change to array if needed later).
    var edged = TileTypes.Static;
    // Only need to check non map edge tiles.
    for (var h = 0; h < tiles.length; h++) {
        for (var w = 0; w < tiles[h].length; w++) {
            tileIndex = tiles[h][w];
            if (tileIndex !== TileTypes.Static) continue;

            index = 0;

            var left = w - 1 < 0 ? edged : tiles[h][w - 1];
            var right = w + 1 >= tiles[h].length ? edged : tiles[h][w + 1];
            var top = h - 1 < 0 ? edged : tiles[h - 1][w];
            var bottom = h + 1 >= tiles.length ? edged : tiles[h + 1][w];

            if (left !== edged && top !== edged && right !== edged && bottom !== edged) {
                // Center edge.
                index = edges.center[Math.floor(Math.random() * edges.center.length)];
            }
            if (left === edged && top !== edged && right !== edged && bottom !== edged) {
                // Center right edge.
                index = edges.centerRight[Math.floor(Math.random() * edges.centerRight.length)];
            }
            if (right === edged && left !== edged && top !== edged && bottom !== edged) {
                // Center left edge.
                index = edges.centerLeft[Math.floor(Math.random() * edges.centerLeft.length)];
            }
            if (left !== edged && top === edged && right !== edged && bottom !== edged) {
                // Center bottom edge.
                index = edges.centerBottom[Math.floor(Math.random() * edges.centerBottom.length)];
            }
            if (left !== edged && top !== edged && right !== edged && bottom === edged) {
                // Center top edge.
                index = edges.centerTop[Math.floor(Math.random() * edges.centerTop.length)];
            }
            if (left === edged && top !== edged && right === edged && bottom !== edged) {
                // Top bottom edge.
                index = edges.topBottom[Math.floor(Math.random() * edges.topBottom.length)];
            }
            if (left !== edged && top === edged && right !== edged && bottom === edged) {
                // Left right edge.
                index = edges.leftRight[Math.floor(Math.random() * edges.leftRight.length)];
            }
            if (left !== edged && top !== edged && right === edged && bottom === edged) {
                // Top left edge.
                index = edges.topLeft[Math.floor(Math.random() * edges.topLeft.length)];
            }
            if (left === edged && top !== edged && right !== edged && bottom === edged) {
                // Top right edge.
                index = edges.topRight[Math.floor(Math.random() * edges.topRight.length)];
            }
            if (left === edged && top === edged && right !== edged && bottom !== edged) {
                // Bottom right edge.
                index = edges.bottomRight[Math.floor(Math.random() * edges.bottomRight.length)];
            }
            if (left !== edged && top === edged && right === edged && bottom !== edged) {
                // Bottom left edge.
                index = edges.bottomLeft[Math.floor(Math.random() * edges.bottomLeft.length)];
            }
            if (left === edged && top === edged && right !== edged && bottom === edged) {
                // Right edge.
                index = edges.right[Math.floor(Math.random() * edges.right.length)];
            }
            if (left !== edged && top === edged && right === edged && bottom === edged) {
                // Left edge.
                index = edges.left[Math.floor(Math.random() * edges.left.length)];
            }
            if (left === edged && top === edged && right === edged && bottom !== edged) {
                // Bottom edge.
                index = edges.bottom[Math.floor(Math.random() * edges.bottom.length)];
            }
            if (left === edged && top !== edged && right === edged && bottom === edged) {
                // Top edge.
                index = edges.top[Math.floor(Math.random() * edges.top.length)];
            }

            if (index > 0) {
                this.displayTilesForeground[h][w] = index;
            }
        }
    }
};

/**
 * Hides the given sprites.
 * @param {Array.<Array.<PIXI.Sprite>>} spriteTiles the sprites to hide.
 * @private
 */
Level.prototype._hideSpriteTiles = function(spriteTiles) {
    "use strict";

    // Hide the tile and background sprites before setting new ones.
    for (var y = 0; y < spriteTiles.length; y++) {
        for (var x = 0; x < spriteTiles[y].length; x++) {
            var sprite = spriteTiles[y][x];
            if (sprite) {
                sprite.visible = false;
            }
        }
    }
};

/**
 * Updates the given sprite tiles.
 * @param {Number} x1 the starting x index.
 * @param {Number} x2 the ending x index.
 * @param {Number} y1 the starting y index.
 * @param {Number} y2 the ending y index.
 * @param {Array.<Array.<Number>>} tileIndices the display tiles to retrieve the indices from.
 * @param {Array.<Array.<PIXI.Sprite>>} spriteTiles the sprites to update.
 * @param {PIXI.DisplayObjectContainer} layer the layer to add new sprites to.
 * @private
 */
Level.prototype._updateSpriteTiles = function(x1, x2, y1, y2, tileIndices, spriteTiles, layer) {
    "use strict";

    // Do not allow invalid views.
    if (x2 - x1 <= 0 || y2 - y1 <= 0) return;

    // Do not show empty tile arrays.
    if (tileIndices.length === 0) return;

    var width = Math.abs(x2 - x1);
    var height = Math.abs(y2 - y1);

    // Set the texture of the new sprites.
    var texture, index;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            // Create a new sprite row if needed.
            if (!spriteTiles[y]) {
                spriteTiles.push([]);
            }

            // Skip tiles outside of the view.
            if (!tileIndices[y1 + y]) continue;
            if (!tileIndices[y1 + y][x1 + x]) continue;

            // Skip non-displayable tiles.
            index = tileIndices[y1 + y][x1 + x];
            if (index === TileTypes.Empty || index === TileTypes.Connector) {
                continue;
            }

            texture = PIXI.Texture.fromImage('./media/images/tileset.png-' + index);
            if (!texture) continue;

            var sprite = spriteTiles[y][x];
            if (sprite) {
                sprite.visible = true;
                sprite.setTexture(texture);
            } else {
                texture = PIXI.Texture.fromImage('./media/images/tileset.png-' + index);

                sprite = new PIXI.Sprite(texture);
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                spriteTiles[y][x] = sprite;
                layer.addChild(sprite);
            }

            sprite.position.x = this.tileWidth / 2 + this.tileWidth * (x + x1);
            sprite.position.y = this.tileHeight / 2 + this.tileHeight * (y + y1);
        }
    }
};

/**
 * Sets the tint for a layer.
 * @param {String} layerName the name of the layer.
 * @param {NumbeR} tint the tint for the layer.
 */
Level.prototype.setLayerTint = function(layerName, tint) {
    "use strict";

    var sprites;
    if (layerName === Level.TileLayers.Background) sprites = this.spriteBackgroundTiles;
    if (layerName === Level.TileLayers.Tiles) sprites = this.spriteTiles;
    if (layerName === Level.TileLayers.Foreground) sprites = this.spriteForegroundTiles;

    if (sprites) {
        for (var y = 0; y < sprites.length; y++) {
            for (var x = 0; x < sprites[y].length; x++) {
                var sprite = sprites[y][x];

                if (!sprite) continue;

                if (sprite.tint !== tint) sprite.tint = tint;
            }
        }
    }
};

/**
 * Updates the viewable tiles of the level.
 * @param {Number} left the left coordinates of the view.
 * @param {Number} right the right coordinates of the view.
 * @param {Number} top the top of the view.
 * @param {Number} bottom the bottom of the view.
 */
Level.prototype.updateView = function(left, right, top, bottom) {
    "use strict";

    // Do not allow invalid views.
    if (right - left <= 0 || bottom - top <= 0) return;

    // Center of the view.
    var cx = (left + right) / 2;
    var cy = (top + bottom) / 2;

    // Update the background images.
    for (var i = 0; i < this.backgrounds.length; i++) {
        var background = this.backgrounds[i];

        var sprite = background.sprite;

        // Move the background or scroll it.
        if (background.speedX) {
            sprite.position.x += background.speedX;
            if (sprite.position.x > background.width) {
                sprite.position.x -= background.width;
            }
        } else {
            sprite.position.x = background.scrollX * cx;
        }

        if (background.speedY) {
            sprite.position.y += background.speedY;
            if (sprite.position.y > background.height) {
                sprite.position.y -= background.height;
            }
        } else {
            sprite.position.y = background.scrollY * cy;
        }
    }

    // Get the tiles to display.
    var x1 = Math.floor(left / this.tileWidth);
    var x2 = Math.ceil(right / this.tileWidth);
    var y1 = Math.floor(top / this.tileHeight);
    var y2 = Math.ceil(bottom / this.tileHeight);

    this._hideSpriteTiles(this.spriteTiles);
    this._hideSpriteTiles(this.spriteBackgroundTiles);
    this._hideSpriteTiles(this.spriteForegroundTiles);

    this._updateSpriteTiles(x1, x2, y1, y2,
        this.displayTiles, this.spriteTiles, this._staticBase);
    this._updateSpriteTiles(x1, x2, y1, y2,
        this.displayTilesBackground, this.spriteBackgroundTiles, this._backgroundBase);
    this._updateSpriteTiles(x1, x2, y1, y2,
        this.displayTilesForeground, this.spriteForegroundTiles, this._foregroundBase);

    this.setLayerTint(Level.TileLayers.Tiles, this.tints.tiles);
    this.setLayerTint(Level.TileLayers.Background, this.tints.background);
    this.setLayerTint(Level.TileLayers.Foreground, this.tints.foreground);
};

/**
 * Removes a non-background tile.
 * @param {Number} x the x location in the tile grid.
 * @param {Number} y the y location in the tile grid.
 */
Level.prototype.removeTile = function(x, y) {
    "use strict";

    // Remove the tiles from every array.
    this.staticTiles[y][x] = Level.TileTypes.Empty;
    this.sensorTiles[y][x] = Level.TileTypes.Empty;
    this.tiles[y][x] = Level.TileTypes.Empty;
    this.displayTiles[y][x] = Level.TileTypes.Empty;
};

/**
 * Removes a background tile.
 * @param {Number} x the x location in the tile grid.
 * @param {Number} y the y location in the tile grid.
 */
Level.prototype.removeBackgroundTile = function(x, y) {
    "use strict";

    // Remove the tiles from every array.
    this.backgroundTiles[y][x] = Level.TileTypes.Empty;
    this.displayTilesBackground[y][x] = Level.TileTypes.Empty;
};

/**
 * Layer names for tiles.
 */
Level.TileLayers = {
    Tiles: 'tiles',
    Background: 'background',
    Foreground: 'foreground'
};

/**
 * Layer names for objects.
 */
Level.ObjectLayers = {
    Objects: 'objects'
};

/**
 * Properties for tile layers.
 * @type {Object}
 */
Level.TileLayerProperties = {
    r: 'r',
    g: 'g',
    b: 'b'
};

/**
 * Special tiles.
 */
Level.TileTypes = {
    Empty: 0,
    Static: 1,
    OneWayTop: 2,
    OneWayBottom: 3,
    OneWayCenter: 4,
    Connector: 31,
    RampBottomLeft: 5,
    RampBottomRight: 6,
    RampTopLeft: 7,
    RampTopRight: 8
};

/**
 * Types of objects.
 */
Level.ObjectTypes = {
    Spawn: 0,
    SpikeTop: 1,
    SpikeLeft: 2,
    SpikeDown: 3,
    SpikeRight: 4,
    Exit: 5,
    PresetEnemy: 32,
    SolidSpikeTop: 33,
    SolidSpikeLeft: 34,
    SolidSpikeDown: 35,
    SolidSpikeRight: 36,
    Text: 64,
    TinySpikeTop: 65,
    TinySpikeLeft: 66,
    TinySpikeDown: 67,
    TinySpikeRight: 68
};

/**
 * Common data in objects.
 */
Level.ObjectData = {
    MapId: 'mapId',
    Period: 'period',
    Object: 'object'
};

/**
 * Types of regions.
 */
Level.RegionTypes = {
    Object: 'object'
};

module.exports = Level;
module.exports.TileLayers = Level.TileLayers;
module.exports.ObjectLayers = Level.ObjectLayers;
module.exports.TileLayerProperties = Level.TileLayerProperties;
module.exports.TileTypes = Level.TileTypes;
module.exports.ObjectTypes = Level.ObjectTypes;
module.exports.ObjectData = Level.ObjectData;
module.exports.RegionTypes = Level.RegionTypes;