/**
 * @author MW
 * Handles special effects on individual entities.
 */
var System = require('../../core/system');
var SfxComponent = require('./SfxComponent');
var DisplayComponent = require('./DisplayComponent');
var OverlayFilter = require('../../pixi/filters/OverlayFilter');

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 * @extends System
 */
function SfxSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    /**
     * Maps entities to their effects.
     * Key for the map is the Entity ID and the key for the sfx map is the sfx name.
     * Value for the sfx is the current duration the effect has been playing.
     * @type {Object.<String, Object.<String, Number>>}
     */
    this.entityEffectMap = {};

    /**
     * Period for flickering invincibility.
     * @type {number}
     */
    this.flickerPeriod = 50;

    var es = entitySystem.getEntities(SfxComponent.type);
    es.addAddedCallback(this.onAdded.bind(this));
    es.addRemovedCallback(this.onRemoved.bind(this));
}
SfxSystem.prototype = Object.create(System.prototype);

/**
 * Update blinking effects.
 * @param {Entity} entity the entity to blink.
 * @param {Number} dt the time per frame.
 */
SfxSystem.prototype.updateBlinking = function(entity, dt) {
    "use strict";

    // Update invincibility effects.
    var displayComponent = entity[DisplayComponent.type];
    if (!displayComponent) return;

    var entityEffects = this.entityEffectMap[entity.id];
    var effectsComponent = entity[SfxComponent.type];

    // Start the blinking effect if needed.
    if (effectsComponent.isBlinking) entityEffects['isBlinking'] = 0;

    // Update the blink effect if needed.
    var current = entityEffects['isBlinking'];
    if (typeof current === 'undefined' || current === null) return;

    var displayable = displayComponent.displayable;
    if (current < effectsComponent.blinkingDuration) {
        displayable.visible = current % (this.flickerPeriod * 2) >= this.flickerPeriod;
        entityEffects['isBlinking'] += dt;
    } else {
        displayable.visible = true;
        delete entityEffects['isBlinking'];
    }
};

/**
 * Update flashing effects.
 * @param {Entity} entity the entity to flash.
 * @param {Number} dt the time per frame.
 */
SfxSystem.prototype.updateFlashing = function(entity, dt) {
    "use strict";

    // Update flashing effects.
    var displayComponent = entity[DisplayComponent.type];
    if (!displayComponent) return;

    var entityEffects = this.entityEffectMap[entity.id];
    var effectsComponent = entity[SfxComponent.type];

    var displayable = displayComponent.displayable;
    // Start the flashing effect if needed.
    if (effectsComponent.isFlashing) entityEffects['isFlashing'] = 0;

    // Update the flashing effect if needed.
    var current = entityEffects['isFlashing'];
    if (typeof current === 'undefined' || current === null) return;

    var filtersChanged = false;
    var filters = displayable.filters;
    if (!filters) {
        filters = [];
        filtersChanged = true;
    }

    // Find the OverlayFilter
    var overlay;
    for (var i = 0; i < filters.length; i++) {
        if (filters[i] instanceof OverlayFilter) {
            overlay = filters[i];
        }
    }
    if (!overlay) {
        overlay = new OverlayFilter();
        filtersChanged = true;
        filters.push(overlay);
    }

    if (current < effectsComponent.flashDuration) {
        var colors = effectsComponent.flashColor;
        var timePerFlash = effectsComponent.flashDuration / effectsComponent.timesToFlash;
        var modifier = 1 - (current % timePerFlash) / timePerFlash;
        if (modifier <= 0) modifier = 0.01;
        overlay.setColor(colors.r * modifier, colors.g * modifier, colors.b * modifier);
        entityEffects['isFlashing'] += dt;
    } else {
        delete entityEffects['isFlashing'];
        filtersChanged = true;

        // Reset and remove the filter.
        overlay.setColor(1.0, 1.0, 1.0);
        var overlayIndex = filters.indexOf(overlay);
        if (overlayIndex >= 0) {
            filters.splice(overlayIndex, 1);
        }
        if (filters.length === 0) {
            filters = null;
        }
    }

    if (filtersChanged) {
        displayable.filters = filters;
    }
};

SfxSystem.prototype.onAdded = function(entity) {
    "use strict";

    this.entityEffectMap[entity.id] = {};
};

SfxSystem.prototype.onRemoved = function(entity) {
    "use strict";

    delete this.entityEffectMap[entity.id];
};

SfxSystem.prototype.update = function(dt) {
    "use strict";

    var es = this.entitySystem.getEntities(SfxComponent.type);

    // Update all the effects on the entity.
    var entities = es.getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        // Update and/or start the effects.
        this.updateBlinking(entity, dt);
        this.updateFlashing(entity, dt);
    }
};

SfxSystem.prototype.cleanup = function() {
    "use strict";

    // Reset all the effect flags.
    var entities = this.entitySystem.getEntities(SfxComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var effectsComponent = entity[SfxComponent.type];
        effectsComponent.isBlinking = false;
        effectsComponent.isFlashing = false;
    }
};

module.exports = SfxSystem;