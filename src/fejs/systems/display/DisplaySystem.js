/**
 * @author MW
 * Entities with both a DisplayComponent and SpatialComponent will use the SpatialComponent values.
 * Updates the position of the spatial.
 */

var System = require('../../core/system');
var DisplayComponent = require('./DisplayComponent');
var SpatialComponent = require('./../SpatialComponent');

/**
 * Handles removal of spatials when an entity is removed.
 * This system does not handle the adding of entities.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 */
function DisplaySystem(entitySystem) {
    "use strict";
    System.call(this);

    this.entitySystem = entitySystem;

    /**
     * Displays mapping entities to displayables.
     * @type {Object.<String, PIXI.DisplayObjectContainer>}
     */
    this.displayMap = {};

    /**
     * True to floor all displays.
     * @type {boolean}
     */
    this.isFloored = false;

    var es = this.entitySystem.getEntities(DisplayComponent.type);
    es.addAddedCallback(this.onEntityAdded.bind(this));
    es.addChangedCallback(this.onEntityChanged.bind(this));
    es.addRemovedCallback(this.onEntityRemoved.bind(this));
}
DisplaySystem.prototype = Object.create(System.prototype);

/**
 * Creates a displayable given the display data.
 * @param {String} type the type of displayable to create.
 * @param {Object} data the data to use to create the displayable.
 * @returns {PIXI.DisplayObject}
 */
DisplaySystem.prototype.createDisplayable = function(type, data) {
    "use strict";

    if (!type || !data) return null;
    var displayable = null;

    switch (type) {
        case DisplaySystem.Types.Sprite:
            displayable = new PIXI.Sprite(PIXI.Texture.fromImage(data.texture));
            displayable.anchor.x = data.anchor.x;
            displayable.anchor.y = data.anchor.y;
            break;
        case DisplaySystem.Types.Text:
            displayable = new PIXI.Text('');
            displayable.anchor.x = data.anchor.x;
            displayable.anchor.y = data.anchor.y;
            break;
        case DisplaySystem.Types.Spine:
            break;
    }

    return displayable;
};

/**
 * Adds a displayable to a valid display in the map.
 * @param {Entity} entity the entity to attach to a parent.
 */
DisplaySystem.prototype.onEntityAdded = function(entity) {
    "use strict";

    var display = entity[DisplayComponent.type];
    var displayable = display.displayable;
    // Create a displayable if none provided.
    if (!displayable) {
        displayable = this.createDisplayable(display.type, display.data);
        display.displayable = displayable;
    }

    if (displayable) {
        this.displayMap[entity.id] = displayable;
        var parent = this.displayMap[display.parent];
        if (parent && parent instanceof PIXI.DisplayObjectContainer) {
            parent.addChild(displayable);
        }
    }
};

/**
 * Change the parent of an entity if needed or create a new displayable if none is provided.
 * @param {Entity} entity the entity to change the parent of.
 */
DisplaySystem.prototype.onEntityChanged = function(entity) {
    "use strict";

    var display = entity[DisplayComponent.type];
    var displayable = display.displayable;
    // Create a new displayable if data is provided.
    if (!displayable) {
        displayable = this.createDisplayable(display.type, display.data);
        display.displayable = displayable;
    }
    // Attach to the parent.
    if (displayable) {
        var parent = this.displayMap[display.parent];
        if (parent && parent instanceof PIXI.DisplayObjectContainer) {
            // Remove the previous parent if needed.
            if (displayable.parent) {
                displayable.parent.removeChild(displayable);
            }
            parent.addChild(displayable);
        }
        // Update the texture and anchor if needed.
        if (display.type === DisplaySystem.Types.Sprite || display.type === DisplaySystem.Types.Text) {
            displayable.anchor.x = display.data.anchor.x;
            displayable.anchor.y = display.data.anchor.y;
        }
        if (display.type === DisplaySystem.Types.Sprite) {
            displayable.texture = PIXI.Texture.fromImage(display.data.texture);
        }
    }
};

/**
 * Removes a displayable from the map and the parent.
 * @param {Entity} entity the entity to remove from the parent.
 */
DisplaySystem.prototype.onEntityRemoved = function(entity) {
    "use strict";

    var display = entity[DisplayComponent.type];
    delete this.displayMap[entity.id];

    var displayable = display.displayable;
    if (!displayable) return;

    var parent = this.displayMap[display.parent];
    if (parent && parent instanceof PIXI.DisplayObjectContainer) {
        parent.removeChild(displayable);
    }
};

/**
 * Update PIXI spatials.
 * @param {Entity} entity the entity to retrieve components from.
 * @param {DisplayComponent} displayComponent the component wrapping the displayable.
 */
function updatePIXI(entity, displayComponent) {
    "use strict";

    var spatial = entity[SpatialComponent.type];
    var displayable = displayComponent.displayable;
    var px = 0;
    var py = 0;
    var sx = 1;
    var sy = 1;
    var r = 0;
    // The spatial parameters will be added or multiplied with the display component.
    if (spatial) {
        px += spatial.position.x;
        py += spatial.position.y;
        sx *= spatial.scale.x;
        sy *= spatial.scale.y;
        r += spatial.rotation;
        if (spatial.direction < 0 && sx > 0) {
            sx *= -1;
        } else if (spatial.direction > 0 && sx < 0) {
            sx *= -1;
        }
    }
    px += displayComponent.position.x;
    py += displayComponent.position.y;
    sx *= displayComponent.scale.x;
    sy *= displayComponent.scale.y;
    r += displayComponent.rotation;

    // Update the actual displayable.
    displayable.position.x = px;
    displayable.position.y = py;
    displayable.scale.x = sx;
    displayable.scale.y = sy;
    displayable.rotation = r;

    displayable.tint = displayComponent.tint;
    displayable.blendMode = displayComponent.blendMode;
    displayable.texture.scaleMode = displayComponent.scaleMode;
}

DisplaySystem.prototype.update = function(dt) {
    "use strict";

    // Update every entity position.
    var es = this.entitySystem.getEntities(DisplayComponent.type);
    var entities = es.getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var component = entities[i][DisplayComponent.type];
        var displayable = component.displayable;
        if (displayable) {
            if (displayable instanceof PIXI.DisplayObject) {
                updatePIXI(entities[i], component);
                if (this.isFloored) {
                    displayable.position.x = Math.floor(component.position.x);
                    displayable.position.y = Math.floor(component.position.y);
                }
            }
        }
    }

    // Remove spatials from parent that are on removed entities.
    es.eachRemoved(function(entity) {
        var displayable = entity[DisplayComponent.type].displayable;
        if (displayable) {
            if (displayable instanceof PIXI.DisplayObject) {
                // All displayable parents are containers so they can remove.
                if (displayable.parent) {
                    displayable.parent.removeChild(displayable);
                }
            }
        }
    });
};

/**
 * Adds a display to the map.
 * @param {String} name the name of the display.
 * @param {PIXI.DisplayObject} display the display to add to the map.
 */
DisplaySystem.prototype.addDisplay = function(name, display) {
    "use strict";

    this.displayMap[name] = display;
};

/**
 * Removes a display from the map.
 * This does not remove the display from their parents.
 * @param {String} name the name of the display.
 */
DisplaySystem.prototype.removeDisplay = function(name) {
    "use strict";

    delete this.displayMap[name];
};

/**
 * Types of displays that can be created.
 * @type {{Sprite: string, Text: string, Spine: string}}
 */
DisplaySystem.Types = {
    Sprite: 'sprite',
    Text: 'text'
};

module.exports = DisplaySystem;
module.exports.Types = DisplaySystem.Types;