/**
 * @author MW
 * Represents the data for a single loaded tiled map.
 * The loaded map should not be modified but instead used in a copy or wrapper
 * that can be modified.
 * Supports loading from TMX files only.
 */

function TiledMapData() {
    "use strict";

    /**
     * Tile layers with keys as the name.
     * @type {Object.<String, {
     *  tiles: Array.<Array.<Number>>,
     *  properties: Object
     * }>}
     */
    this.tileLayers = {};

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
     * Properties of the map.
     * @type {{}}
     */
    this.properties = {};

    /**
     * Layers of objects in the map.
     * @type {Object.<String, Array.<{
     *     name: String,
     *     type: String,
     *     gid: Number,
     *     x: Number,
     *     y: Number,
     *     chance: Number
     * }>>}
     */
    this.objectLayers = {};

    /**
     * Layers of regions in the map.
     * Regions use the same key as the matching object layer.
     * @type {Object.<String, Array.<{
     *     name: String,
     *     type: String,
     *     x: Number,
     *     y: Number,
     *     width: Number,
     *     height: Number
     * }>>}
     */
    this.regionLayers = {};
}

/**
 * Parses a tile layer.
 * @param {Object} layer the layer to parse.
 * @returns {Array.<Array.<Number>>} the parsed tile layer.
 */
function parseTileLayerData(layer) {
    "use strict";

    var tiles = [];
    // Create an empty array.
    var width = parseInt(layer.attributes.width.nodeValue);
    var height = parseInt(layer.attributes.height.nodeValue);
    var h, w;
    for (h = 0; h < height; h++) {
        tiles.push([]);
        for (w = 0; w < width; w++) {
            tiles[h][w] = 0;
        }
    }
    // Read the data.
    var encodedData = (layer.getElementsByTagName('data')[0]).innerHTML;
    var unencodedData = atob(encodedData.replace(/\s/g, ''));
    unencodedData = unencodedData.split('').map(function(e) {
        return e.charCodeAt(0);
    });
    var inflate = new Zlib.Inflate(unencodedData);
    var output8b = inflate.decompress();
    var output = [];
    var j;
    for (j = 0; j < output8b.length; j++) {
        if (j % 4 === 0) output.push(output8b[j]);
    }
    // Set the tiles data.
    for (j = 0; j < output.length; j++) {
        var index = output[j];
        // Set all tile data.
        tiles[Math.floor(j / width)][j % width] = index;
    }

    return tiles;
}

/**
 * Parses a string property into a float or string.
 * @param {String} input the input to parse.
 * @returns {String|Number} the parsed output.
 */
function parseProperty(input) {
    "use strict";

    var output = input;
    // Convert to float if the value is a number type.
    var parsed = parseFloat(input);
    // Split decimal to check if it really is a float.
    if (input.split('.').length === 2 && !isNaN(parsed)) {
        output = parsed;
    }

    return output;
}

/**
 * Loads the level from a TMX file.
 * @param {String} data the data to load.
 */
TiledMapData.prototype.loadFromTMX = function(data) {
    "use strict";

    var parser = new DOMParser();
    var doc = parser.parseFromString(data, 'text/xml');
    // Parse the map info.
    var map = doc.getElementsByTagName('map')[0];
    this.width = parseInt(map.attributes.width.nodeValue);
    this.height = parseInt(map.attributes.height.nodeValue);
    this.tileWidth = parseInt(map.attributes.tilewidth.nodeValue);
    this.tileHeight = parseInt(map.attributes.tileheight.nodeValue);
    // Parse the tileset info.
    var tileset = doc.getElementsByTagName('tileset')[0];

    // Parse objects info.
    var firstObjectGID = doc.getElementsByTagName('tileset')[1].attributes.firstgid.nodeValue;
    // Parse each layer.
    var layers = doc.getElementsByTagName('layer');
    var name, properties, property, pname, pvalue, i, j, k;
    for (i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var layerObject = {
            tiles: [],
            properties: {}
        };
        name = layer.attributes.name.nodeValue;
        //this.tileLayers[name] = parseTileLayerData(layer);
        // Parse the properties.
        properties = layer.getElementsByTagName('properties');
        if (properties.length > 0) {
            properties = properties[0].getElementsByTagName('property');
            for (j = 0; j < properties.length; j++) {
                property = properties[j];
                pname = property.attributes.name.nodeValue;
                pvalue = property.attributes.value.nodeValue;
                pvalue = parseProperty(pvalue);
                layerObject.properties[pname] = pvalue;
            }
        }
        // Load the tile data.
        layerObject.tiles = parseTileLayerData(layer);
        this.tileLayers[name] = layerObject;
    }
    var objectGroups = doc.getElementsByTagName('objectgroup');
    var group;
    for (i = 0; i < objectGroups.length; i++) {
        group = objectGroups[i];
        name = group.attributes.name.nodeValue;
        var objects = [];
        var regions = [];
        this.objectLayers[name] = objects;
        this.regionLayers[name] = regions;
        // Parse the objects.
        var objectElements = group.getElementsByTagName('object');
        for (j = 0; j < objectElements.length; j++) {
            var obj = objectElements[j];
            // Center normal objects.
            var objectData = {
                x: parseFloat(obj.attributes.x.nodeValue) + this.tileWidth / 2,
                y: parseFloat(obj.attributes.y.nodeValue) - this.tileHeight / 2
            };
            // Parse optional data.
            if (obj.attributes.name) {
                objectData.name = obj.attributes.name.nodeValue;
            }
            if (obj.attributes.type) {
                objectData.type = obj.attributes.type.nodeValue;
            }
            // Parse placed objects.
            if (obj.attributes.gid) {
                objectData.gid = obj.attributes.gid.nodeValue - firstObjectGID;
                objects.push(objectData);
            } else {
                // Parse regions.
                objectData.width = parseFloat(obj.attributes.width.nodeValue);
                objectData.height = parseFloat(obj.attributes.height.nodeValue);
                // Center regions.
                objectData.x = parseFloat(obj.attributes.x.nodeValue) + objectData.width / 2;
                objectData.y = parseFloat(obj.attributes.y.nodeValue) + objectData.height / 2;
                regions.push(objectData);
            }
            // Parse object properties.
            properties = obj.getElementsByTagName('properties');
            if (properties.length > 0) {
                properties = properties[0].getElementsByTagName('property');
                for (k = 0; k < properties.length; k++) {
                    property = properties[k];
                    pname = property.attributes.name.nodeValue;
                    pvalue = property.attributes.value.nodeValue;
                    pvalue = parseProperty(pvalue);
                    objectData[pname] = pvalue;
                }
            }
        }
    }
    // Parse the map properties.
    group = doc.getElementsByTagName('properties')[0];
    if (group) {
        properties = group.getElementsByTagName('property');
        for (i = 0; i < properties.length; i++) {
            property = properties[i];
            pname = property.attributes.name.nodeValue;
            pvalue = property.attributes.value.nodeValue;
            pvalue = parseProperty(pvalue);
            this.properties[pname] = pvalue;
        }
    }
};

module.exports = TiledMapData;
