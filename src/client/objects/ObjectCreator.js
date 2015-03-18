/**
 * @author MW
 * Creates objects given input data.
 */
var ObjectTypes = require('../level/Level').ObjectTypes;
var RegionTypes = require('../level/Level').RegionTypes;
var Random = require('../../fejs/utility/Random');
var CollisionGroups = require('./CollisionGroups');
var Entity = require('../../fejs/entitysystem/Entity');

var AABBComponent = require('../../fejs/systems/physics/AABBComponent');
var ActionComponent = require('../../fejs/systems/actions/ActionComponent');
var AIComponent = require('../../fejs/systems/ai/AIComponent');
var AnimationComponent = require('../../fejs/systems/display/AnimationComponent');
var BodyComponent = require('../../fejs/systems/physics/BodyComponent');
var BoundsDebugComponent = require('../../fejs/systems/physics/BoundsDebugComponent');
var ChildComponent = require('../../fejs/systems/ChildComponent');
var CollisionComponent = require('../../fejs/systems/physics/CollisionComponent');
var DisplayComponent = require('../../fejs/systems/display/DisplayComponent');
var ModifierComponent = require('./ModifierComponent');
var MovementComponent = require('../../fejs/systems/physics/MovementComponent');
var NetworkComponent = require('../network/NetworkComponent');
var OwnerComponent = require('../objects/OwnerComponent');
var ParticleComponent = require('../../fejs/systems/display/ParticleComponent');
var ScriptsComponent = require('../systems/ScriptsComponent');
var SfxComponent = require('../../fejs/systems/display/SfxComponent');
var SpatialComponent = require('../../fejs/systems/SpatialComponent');
var StatsComponent = require('../objects/StatsComponent');
var StatusDisplayComponent = require('../gui/StatusDisplayComponent');
var TextComponent = require('../../fejs/systems/display/TextComponent');
var TimeComponent = require('../systems/TimeComponent');

/**
 * Initializes the creator.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @param {Object} actions the actions to add to entities.
 * @param {Object} aiScripts the AI scripts to add to entities.
 * @constructor
 */
function ObjectCreator(entitySystem,  actions, aiScripts) {
    "use strict";

    /**
     * Entity system to use.
     * @type {EntitySystem}
     */
    this.entitySystem = entitySystem;

    /**
     * Actions to add to the entities.
     * @type {Object}
     */
    this.actions = actions;

    /**
     * Scripts used for the AI objects.
     * @type {Object}
     */
    this.aiScripts = aiScripts;

    /**
     * True to show debug information on bounds.
     * @type {boolean}
     */
    this.debugBounds = false;

    /**
     * Cache for parsed JSON object data.
     * @dict
     * @private
     */
    this._objectDataCache = {};

    /**
     * Components store to create components from.
     * @dict
     * @private
     */
    this._componentStore = {};

    /**
     * Enemies to use for enemy type generation.
     * @type {Array.<Array.<String>>}
     */
    this.enemies = [];

    // Store all the default components.
    this.storeComponent(AABBComponent);
    this.storeComponent(ActionComponent);
    this.storeComponent(AIComponent);
    this.storeComponent(AnimationComponent);
    this.storeComponent(BodyComponent);
    this.storeComponent(BoundsDebugComponent);
    this.storeComponent(ChildComponent);
    this.storeComponent(CollisionComponent);
    this.storeComponent(DisplayComponent);
    this.storeComponent(ModifierComponent);
    this.storeComponent(MovementComponent);
    this.storeComponent(NetworkComponent);
    this.storeComponent(ParticleComponent);
    this.storeComponent(ScriptsComponent);
    this.storeComponent(SfxComponent);
    this.storeComponent(SpatialComponent);
    this.storeComponent(StatsComponent);
    this.storeComponent(StatusDisplayComponent);
    this.storeComponent(TextComponent);
    this.storeComponent(TimeComponent);
}

/**
 * Stores a component for use with the system.
 * @param {Component} componentClass the component class to store.
 */
ObjectCreator.prototype.storeComponent = function(componentClass) {
    "use strict";
    this._componentStore[componentClass.type] = componentClass;
};

/**
 * Creates a preset object from the gid.
 * @param {Number} id the id of the object.
 * @param {Object} obj the map object.
 * @returns {Entity} the created entity.
 */
ObjectCreator.prototype.createFromID = function(id, obj) {
    "use strict";

    var entity = null;
    var spatial = null;
    // Use a map of object -> gid to create the right object.
    switch (id) {
        case ObjectTypes.Spawn:
            entity = this.createFromStore('./media/data/objects/spawn.json');
            break;
        case ObjectTypes.SpikeTop:
            entity = this.createFromStore('./media/data/hazards/triangle-spike.json');
            break;
        case ObjectTypes.SpikeLeft:
            entity = this.createFromStore('./media/data/hazards/triangle-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = -Math.PI / 2;
            break;
        case ObjectTypes.SpikeDown:
            entity = this.createFromStore('./media/data/hazards/triangle-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = Math.PI;
            break;
        case ObjectTypes.SpikeRight:
            entity = this.createFromStore('./media/data/hazards/triangle-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = Math.PI / 2;
            break;
        case ObjectTypes.PresetEnemy:
            entity = this.createFromStore(obj.type);
            break;
        case ObjectTypes.SolidSpikeTop:
            entity = this.createFromStore('./media/data/hazards/solid-spike.json');
            break;
        case ObjectTypes.SolidSpikeLeft:
            entity = this.createFromStore('./media/data/hazards/solid-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = -Math.PI / 2;
            break;
        case ObjectTypes.SolidSpikeDown:
            entity = this.createFromStore('./media/data/hazards/solid-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = Math.PI;
            break;
        case ObjectTypes.SolidSpikeRight:
            entity = this.createFromStore('./media/data/hazards/solid-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = Math.PI / 2;
            break;
        case ObjectTypes.TinySpikeTop:
            entity = this.createFromStore('./media/data/hazards/tiny-spike.json');
            break;
        case ObjectTypes.TinySpikeLeft:
            entity = this.createFromStore('./media/data/hazards/tiny-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = -Math.PI / 2;
            break;
        case ObjectTypes.TinySpikeDown:
            entity = this.createFromStore('./media/data/hazards/tiny-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = Math.PI;
            break;
        case ObjectTypes.TinySpikeRight:
            entity = this.createFromStore('./media/data/hazards/tiny-spike.json');
            spatial = entity[SpatialComponent.type];
            spatial.rotation = Math.PI / 2;
            break;
        case ObjectTypes.Exit:
            entity = this.createFromStore('./media/data/objects/exit.json');
            entity.name = obj.name;
            entity.userData.type = obj.type;
            break;
        case ObjectTypes.Text:
            entity = this.createFromStore('./media/data/objects/text-object.json');
            var textComponent = entity[TextComponent.type];
            if (obj.text) textComponent.text = obj.text;
            if (obj.size) textComponent.size = parseFloat(obj.size);
            if (obj.font) textComponent.font = obj.font;
            if (obj.style) textComponent.style = obj.style;
            if (obj.fill) textComponent.fill = obj.fill;
            if (obj.stroke) textComponent.stroke = obj.stroke;
            if (obj.strokeThickness) textComponent.strokeThickness = parseFloat(obj.strokeThickness);
            break;
        default:
            return null;
    }

    if (!entity) return null;

    entity.name = obj.name;
    entity.userData.type = obj.type;

    // Copy the object data into the entity user data.
    if (entity) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                entity.userData[key] = obj[key];
            }
        }
    }

    return entity;
};

/**
 * Creates a region entity.
 * @param {{
 *   name: String,
 *   type: String,
 *   x: Number,
 *   y: Number,
 *   width: Number,
 *   height: Number,
 *   userData: Object
 * }} data the region data.
 * @returns {Entity} the entity representing the region.
 */
ObjectCreator.prototype.createRegion = function(data) {
    "use strict";

    var entity = null;

    // Try to create the region based off an object type if given.
    if (data.type) {
        entity = this.createFromStore(data.type);
    }

    // Create a region entity with only bounds.
    if (!entity) {
        entity = this.entitySystem.createEntity();
        entity.userData.type = data.type;

        this.entitySystem.setComponent(entity, CollisionComponent.type, new CollisionComponent({
            resolvesFor: {
                tiles: false,
                objects: false
            },
            collidesWith: {
                tiles: false,
                objects: false
            },
            resolvable: false,
            groups: [CollisionGroups.REGION]
        }));
    }

    if (entity) {
        // Position of the region.
        this.entitySystem.setComponent(entity, SpatialComponent.type, new SpatialComponent({
            position: {
                x: data.x,
                y: data.y
            }
        }));
        // Create bounds for the region.
        this.entitySystem.setComponent(entity, BodyComponent.type, new BodyComponent({
            allowMultipleCollide: false,
            shapes: [
                {
                    name: data.name,
                    box: {
                        width: data.width,
                        height: data.height
                    }
                }
            ]
        }));
        if (this.debugBounds) {
            this.entitySystem.setComponent(entity, BoundsDebugComponent.type, new BoundsDebugComponent());
        }
    }

    // Copy the region data into the entity user data.
    if (entity) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                entity.userData[key] = data[key];
            }
        }
    }

    if (data.name) {
        entity.name = data.name;
    }

    return entity;
};

/**
 * Stores a data object for use with store creation.
 * @param {String} key the key to store the object as.
 * @param {Object} data the data to store in raw JSON form.
 */
ObjectCreator.prototype.storeObject = function(key, data) {
    "use strict";
    if (!data) return;

    this._objectDataCache[key] = JSON.parse(data);
};

/**
 * Creates an object from JSON data.
 * @param {Object} data the data to create from.
 * @returns {Entity} the created entity.
 */
ObjectCreator.prototype.createFromData = function(data) {
    "use strict";

    var i;
    var entity = this.entitySystem.createEntity();

    // Copy non component data.
    for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;

        if (key === 'components') continue;

        entity[key] = data[key];
    }


    // Set values of components.
    var components = data.components;
    for (var objectKey in components) {
        if (!components.hasOwnProperty(objectKey)) continue;

        var componentData = components[objectKey];
        var componentClass = this._componentStore[objectKey];
        if (!componentClass) continue;

        var type = componentClass.type;
        var component = entity[type];
        if (!component) {
            component = new componentClass(componentData);
        } else {
            component.setParams(componentData);
        }

        // Special setting for actions by loading from actions.
        if (type === ActionComponent.type) {
            var actions = componentData.actions;
            var addedActions = {};
            for (var actionKey in actions) {
                var actionData = this.actions[actions[actionKey]];
                if (!actionData) continue;
                addedActions[actionKey] = actionData;
            }
            component.setParams({actions: addedActions});
        }

        // Special setting for AI scripts by loading from ai.
        if (type === AIComponent.type) {
            var scripts = componentData.scripts;
            var addedScripts = [];
            for (i = 0; i < scripts.length; i++) {
                var scriptData = this.aiScripts[scripts[i]];
                if (!scriptData) continue;
                addedScripts.push(scriptData);
            }
            component.setParams({scripts: addedScripts});
        }

        this.entitySystem.setComponent(entity, type, component);
    }

    // Create children parts if available.
    if (data.parts) {
        var childComponent = entity[ChildComponent.type];
        if (!childComponent) {
            childComponent = new ChildComponent();
        }
        this.entitySystem.setComponent(entity, ChildComponent.type, childComponent);
        for (i = 0; i < data.parts.length; i++) {
            var part = data.parts[i];

            var partEntity = this.createFromData(part);

            if (!partEntity) continue;

            // Add the part as a child.
            childComponent.children.push(partEntity.id);
            var partChild = partEntity[ChildComponent.type];
            if (!partChild) {
                partChild = new ChildComponent();
            }
            partChild.parent = entity.id;
            this.entitySystem.setComponent(partEntity, ChildComponent.type, partChild);

            // Set the display to the parent if needed.
            var partDisplay = partEntity[DisplayComponent.type];
            if (partDisplay && partDisplay.parent === '%this%') {
                partDisplay.parent = entity.id;
            }
            this.entitySystem.setComponent(partEntity, DisplayComponent.type, partDisplay);
        }
    }

    // Enable debugging.
    if (this.debugBounds && (entity[AABBComponent.type] || entity[BodyComponent.type])) {
        this.entitySystem.setComponent(entity, BoundsDebugComponent.type, new BoundsDebugComponent());
    }

    return entity;
};

/**
 * Creates an object from stored data.
 * @param {String} key the key to load from the data store.
 * @returns {Entity} the created entity.
 */
ObjectCreator.prototype.createFromStore = function(key) {
    "use strict";

    var data = this._objectDataCache[key];

    if (!data) {
        console.warn('No object with key "' + key + '" found.');
        return null;
    }

    var entity = this.createFromData(data);
    if (!entity.type) {
        entity.type = key;
    }

    return entity;
};

module.exports = ObjectCreator;