/**
 * @author MW
 */
var System = require('../../fejs/core/system');
var StatusDisplayComponent = require('./StatusDisplayComponent');
var Statscomponent = require('../objects/StatsComponent');

/**
 * Initializes the HP bar information.
 * @constructor
 */
function HPBarGroup() {
    "use strict";

    /**
     * Amount of hit points each bar represents.
     * @type {number}
     */
    this.hitPointsPerBar = 3;

    /**
     * Width of a bar.
     * @type {number}
     */
    this.barWidth = 6;

    /**
     * Outer image to use for the HP bar.
     * @type {string}
     */
    this.outerBarImage = './media/images/gui/outer-hp-bar.png';

    /**
     * True to enable the bar frame.
     * @type {boolean}
     */
    this.barFrameEnabled = false;

    /**
     * True to center the bar.
     * @type {boolean}
     */
    this.centered = false;

    /**
     * Images to use for the inner bar depending on health left.
     * @type {Array.<String>}
     */
    this.innerBarImages = [
        './media/images/gui/full-hp-bar.png',
        './media/images/gui/1-3-hp-bar.png',
        './media/images/gui/2-3-hp-bar.png'
    ];

    /**
     * Empty HP bar image.
     * @type {string}
     */
    this.emptyBarImage = './media/images/gui/empty-hp-bar.png';

    /**
     * Base container to attach all HP bars to.
     * @type {PIXI.DisplayObjectContainer}
     */
    this.base = new PIXI.DisplayObjectContainer();

    /**
     * Outer bar to attach the frames to.
     * @type {PIXI.DisplayObjectContainer}
     */
    this._barsOuterLayer = new PIXI.DisplayObjectContainer();
    this.base.addChild(this._barsOuterLayer);

    /**
     * Inner bar layer.
     * @type {PIXI.DisplayObjectContainer}
     * @private
     */
    this._barsInnerLayer = new PIXI.DisplayObjectContainer();
    this.base.addChild((this._barsInnerLayer));

    /**
     * Bar outlines.
     * @type {Array.<PIXI.Sprite>}
     * @private
     */
    this._barsOuter = [];

    /**
     * Inner bar colors.
     * @type {Array.<PIXI.Graphics>}
     * @private
     */
    this._barsInner = [];

    /**
     * HP since the last set HP.
     * @type {number}
     * @private
     */
    this._lastHP = 0;

    /**
     * Maximum HP to display missing HP for.
     * @type {number}
     * @private
     */
    this._maxHp = 0;
}

/**
 * Set the HP of an HP bar.
 * @param {Number} amount the amount of HP to set.
 */
HPBarGroup.prototype.setHP = function(amount) {
    "use strict";
    if (amount === this.lastHP) return;

    this.lastHP = amount;
    var i;
    // Remove previous bars.
    for (i = 0; i < this._barsInner.length; i++) {
        this._barsInnerLayer.removeChild(this._barsInner[i]);
    }
    this._barsInner = [];
    // Create bars matching the hp.
    var totalBarsAmount = Math.ceil(this._maxHp / this.hitPointsPerBar);
    var usedBarsAmount = Math.ceil(amount / this.hitPointsPerBar);
    for (i = 0; i < totalBarsAmount; i++) {
        var bar;
        // Create a partial bar if needed.
        if (i === usedBarsAmount - 1 && amount % this.hitPointsPerBar !== 0) {
            var remaining = amount % this.hitPointsPerBar;
            if (remaining >= this.innerBarImages.length) {
                bar = new PIXI.Sprite(PIXI.Texture.fromImage(this.innerBarImages[this.innerBarImages.length - 1]));
            } else {
                bar = new PIXI.Sprite(PIXI.Texture.fromImage(this.innerBarImages[remaining]));
            }
        } else if (i > usedBarsAmount - 1) {
            // Fill in an empty bar.
            bar = new PIXI.Sprite(PIXI.Texture.fromImage(this.emptyBarImage));
        } else {
            bar = new PIXI.Sprite(PIXI.Texture.fromImage(this.innerBarImages[0]));
        }
        if (this.centered) {
            bar.position.x = -(totalBarsAmount * this.barWidth + 1) / 2 +
                i * (this.barWidth + 1);
        } else {
            bar.position.x = i * (this.barWidth + 1);
        }
        this._barsInnerLayer.addChild(bar);
        this._barsInner.push(bar);
    }
};

/**
 * Set the max HP for an HP bar.
 * @param {Number} amount the max hp amount.
 */
HPBarGroup.prototype.setMaxHP = function(amount) {
    "use strict";
    if (this._maxHp === amount) return;

    this._maxHp = amount;

    if (this.barFrameEnabled) {
        var i;
        // Remove previous bars.
        for (i = 0; i < this._barsOuter.length; i++) {
            this._barsOuterLayer.removeChild(this._barsOuter[i]);
        }
        this._barsOuter = [];
        // Create bar outlines matching the hp per bar.
        var barsAmount = Math.ceil(amount / this.hitPointsPerBar);
        for (i = 0; i < barsAmount; i++) {
            var empty = new PIXI.Sprite(PIXI.Texture.fromImage(this.outerBarImage));
            empty.position.x = i * (this.barWidth + 1);
            this._barsOuterLayer.addChild(empty);
            this._barsOuter.push(empty);
        }
    }

    // Refresh the inner HP display.
    this.setHP(this._lastHP + 1);
    this.setHP(this._lastHP - 1);
};

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @param {Viewport} viewport the viewport to use for retrieving the width and height of the screen.
 * @param {PIXI.DisplayObjectContainer} layer the layer to attach the GUI elements to.
 * @constructor
 * @extends System
 */
function StatusDisplaySystem(entitySystem, viewport, layer) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;
    this.viewport = viewport;
    this.layer = layer;

    /**
     * Main entity to display the status of.
     * @type {Entity}
     */
    this.mainEntity = null;

    /**
     * Party entities to display the status of.
     * @type {Array.<Entity>}
     */
    this.partyEntities = [];

    /**
     * Target entity to display the status of.
     * @type {Entity}
     */
    this.targetEntity = null;

    /**
     * Boss entity to display the status of.
     * @type {Entity}
     */
    this.bossEntity = null;

    /**
     * Container to display the main entity status.
     * @type {PIXI.DisplayObjectContainer}
     * @private
     */
    this._mainDisplay = new PIXI.DisplayObjectContainer();
    var buffer = 0.05;
    var scaledWidth = viewport.width / viewport.camera.scale.x;
    var scaledHeight = viewport.height / viewport.camera.scale.y;
    this._mainDisplay.position.x = -scaledWidth / 2 + scaledWidth * buffer;
    this._mainDisplay.position.y = -scaledHeight / 2 + scaledHeight * buffer;
    this.layer.addChild(this._mainDisplay);

    // Create the HP display.
    this._mainHpBars = new HPBarGroup();
    this._mainDisplay.addChild(this._mainHpBars.base);

    /**
     * Container to display the main entity status.
     * @type {PIXI.DisplayObjectContainer}
     * @private
     */
    this._bossDisplay = new PIXI.DisplayObjectContainer();
    this._bossDisplay.position.y = scaledHeight / 2 - scaledHeight * buffer;
    this.layer.addChild(this._bossDisplay);

    // Create the HP display.
    this._bossHpBars = new HPBarGroup();
    this._bossHpBars.centered = true;
    this._bossDisplay.addChild(this._bossHpBars.base);
}
StatusDisplaySystem.prototype = Object.create(System.prototype);

/**
 * Update the main entity status.
 * @private
 */
StatusDisplaySystem.prototype._updateMainStatus = function() {
    "use strict";

    if (!this.mainEntity || !this.mainEntity[StatusDisplayComponent.type]) {
        this._mainDisplay.visible = false;
        return;
    }

    this._mainDisplay.visible = true;
    var displayComponent = this.mainEntity[StatusDisplayComponent.type];

    var statsComponent = this.mainEntity[Statscomponent.type];
    if (displayComponent.displayHp && statsComponent) {
        this._mainHpBars.base.visible = true;
        this._mainHpBars.setMaxHP(statsComponent.maxHitPoints);
        this._mainHpBars.setHP(statsComponent.hitPoints);
    } else {
        this._mainHpBars.base.visible = false;
    }
};

StatusDisplaySystem.prototype._updateBossStatus = function() {
    "use strict";

    if (!this.bossEntity || !this.bossEntity[Statscomponent.type]) {
        this._bossDisplay.visible = false;
        return;
    }

    this._bossDisplay.visible = true;

    var statsComponent = this.bossEntity[Statscomponent.type];
    if (statsComponent) {
        this._bossHpBars.setMaxHP(statsComponent.maxHitPoints);
        this._bossHpBars.setHP(statsComponent.hitPoints);
    }
};

StatusDisplaySystem.prototype.update = function(dt) {
    "use strict";

    this._updateMainStatus();
    this._updateBossStatus();
};

module.exports = StatusDisplaySystem;