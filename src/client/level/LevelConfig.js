/**
 * @author MW
 * Configuration for single levels and generated levels.
 */

var Component = require('../../fejs/core/Component');

/**
 * Initializes the level configuration.
 * @param {Object=} params the parameters to set.
 * @constructor
 */
function LevelConfig(params) {
    "use strict";

    /**
     * Generator to use for a random level.
     * @type {string}
     */
    this.generator = 'single';

    /**
     * Maps to use in automatic generation or for single maps.
     * @type {Array.<String>}
     */
    this.maps = [];

    /**
     * Required maps in a randomized level.
     * @type {Array.<String>}
     */
    this.requiredMaps = [];

    /**
     * True to close edges of the map with static tiles.
     * @type {{left: boolean, right: boolean, top: boolean, bottom: boolean}}
     */
    this.closeEdge = {
        left: false,
        right: false,
        top: false,
        bottom: false
    };

    /**
     * Random tiles to choose from when using static tiles.
     * Tiles can be as a single element, array, or a 2D array.
     * @type {Array.<Object>}
     */
    this.tiles = [];

    /**
     * Automatically generate edges on static tiles (applies only for the tile layer).
     * @type {boolean}
     */
    this.generateEdges = true;

    /**
     * Edge tiles to select from.
     */
    this.edges = {
        top:  [],
        bottom: [],
        left: [],
        right: [],
        topLeft: [],
        topRight: [],
        bottomLeft: [],
        bottomRight: [],
        centerLeft: [],
        centerRight: [],
        centerTop: [],
        centerBottom: [],
        topBottom: [],
        leftRight: [],
        center: []
    };

    /**
     * Number of maps to make up a generated level in width.
     * @type {number}
     */
    this.width = 1;

    /**
     * Number of maps to make up a generated level in height.
     * @type {number}
     */
    this.height = 1;

    /**
     * Backgrounds for the level.
     * @type {Array.<{
     *  image: String,
     *  isTiled: Boolean,
     *  scrollX: Number,
     *  scrollY: Number,
     *  speedX: Number,
     *  speedY: Number
     * }>}
     */
    this.backgrounds = [];

    /**
     * Random enemies to choose from given the index for the group.
     * @type {Array.<Array.<String>>}
     */
    this.enemies = [];

    this.setParams(params);
}

LevelConfig.prototype.setParams = function(params) {
    "use strict";

    this.generator = Component.copyField(params.generator, this.generator);
    this.maps = Component.copyPrimitiveArray(params.maps, this.maps);
    this.requiredMaps = Component.copyPrimitiveArray(params.requiredMaps, this.requiredMaps);

    if (params.closeEdge) {
        this.closeEdge.left = Component.copyField(params.closeEdge.left, this.closeEdge.left);
        this.closeEdge.right = Component.copyField(params.closeEdge.right, this.closeEdge.right);
        this.closeEdge.top = Component.copyField(params.closeEdge.top, this.closeEdge.top);
        this.closeEdge.bottom = Component.copyField(params.closeEdge.left, this.closeEdge.bottom);
    }

    // Does not get rid of references to loaded arrays.
    this.tiles = Component.copyPrimitiveArray(params.tiles, this.tiles);
    this.generateEdges = Component.copyField(params.generateEdges, this.generateEdges);
    if (params.edges) {
        this.edges.top = Component.copyPrimitiveArray(params.edges.top, this.edges.top);
        this.edges.bottom = Component.copyPrimitiveArray(params.edges.bottom, this.edges.bottom);
        this.edges.left = Component.copyPrimitiveArray(params.edges.left, this.edges.left);
        this.edges.right = Component.copyPrimitiveArray(params.edges.right, this.edges.right);
        this.edges.topLeft = Component.copyPrimitiveArray(params.edges.topLeft, this.edges.topLeft);
        this.edges.topRight = Component.copyPrimitiveArray(params.edges.topRight, this.edges.topRight);
        this.edges.bottomLeft = Component.copyPrimitiveArray(params.edges.bottomLeft, this.edges.bottomLeft);
        this.edges.bottomRight = Component.copyPrimitiveArray(params.edges.bottomRight, this.edges.bottomRight);
        this.edges.centerLeft = Component.copyPrimitiveArray(params.edges.centerLeft, this.edges.centerLeft);
        this.edges.centerRight = Component.copyPrimitiveArray(params.edges.centerRight, this.edges.centerRight);
        this.edges.centerTop = Component.copyPrimitiveArray(params.edges.centerTop, this.edges.centerTop);
        this.edges.centerBottom = Component.copyPrimitiveArray(params.edges.centerBottom, this.edges.centerBottom);
        this.edges.topBottom = Component.copyPrimitiveArray(params.edges.topBottom, this.edges.topBottom);
        this.edges.leftRight = Component.copyPrimitiveArray(params.edges.leftRight, this.edges.leftRight);
        this.edges.center = Component.copyPrimitiveArray(params.edges.center, this.edges.center);
    }

    this.width = Component.copyField(params.width, this.width);
    this.height = Component.copyField(params.height, this.height);
    this.backgrounds = Component.copyPrimitiveArray(this.backgrounds, params.backgrounds);

    if (params.enemies) {
        for (var i = 0; i < params.enemies.length; i++) {
            this.enemies.push[i] = [].concat(params.enemies[i]);
        }
    }
};


module.exports = LevelConfig;