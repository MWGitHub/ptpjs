/**
 * @author MW
 * API for the game to use.
 * Mainly used for handling events and callbacks.
 * Provides shortcuts for common functions.
 */

var ActionComponent = require('../fejs/systems/actions/ActionComponent');
var AnimationComponent = require('../fejs/systems/display/AnimationComponent');
var BodyComponent = require('../fejs/systems/physics/BodyComponent');
var CollisionComponent = require('../fejs/systems/physics/CollisionComponent');
var DisplayComponent = require('../fejs/systems/display/DisplayComponent');
var SpatialComponent = require('../fejs/systems/SpatialComponent');
var StatsComponent = require('./objects/StatsComponent');
var MovementComponent = require('../fejs/systems/physics/MovementComponent');
var ScriptsComponent = require('./systems/ScriptsComponent');
var SfxComponent = require('../fejs/systems/display/SfxComponent');
var TextComponent = require('../fejs/systems/display/TextComponent');
var TimeComponent = require('./systems/TimeComponent');
var ModifierSystem = require('./objects/ModifierSystem');
var TileTypes = require('./Level/Level').TileTypes;
var Level = require('./level/Level');
var FEMath = require('../fejs/utility/math');
var Random = require('../fejs/utility/Random');
var Collections = require('../fejs/utility/collections');

/**
 * Parameters for camera shake.
 * @constructor
 */
function ShakeParameters() {
    "use strict";

    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.bottom = 0;

    /**
     * Duration to shake the camera for.
     * @type {number}
     */
    this.duration = 0;

    /**
     * Counter for the camera shaking.
     * @type {number}
     */
    this.counter = 0;

    /**
     * Period between shakes.
     * @type {number}
     */
    this.period = 100;

    /**
     * Last period shaken.
     * @type {number}
     */
    this.periodCounter = 0;
}

function GameAPI() {
    "use strict";

    /**
     * Stage used for the game.
     * @type {PIXI.DisplayObjectContainer}
     */
    this.stage = null;

    /**
     * Viewport used for the game.
     * @type {Viewport}
     */
    this.viewport = null;

    /**
     * Resources used for the game.
     * @type {Resources}
     */
    this.resources = null;

    /**
     * Input to use for the game.
     * @type {Input}
     */
    this.input = null;

    /**
     * Entity system used for the game.
     * @type {EntitySystem}
     */
    this.entitySystem = null;

    /**
     * System for displaying hitpoints.
     * @type {StatusDisplaySystem}
     */
    this.statusDisplaySystem = null;

    /**
     * Action system used for the game.
     * @type {ActionSystem}
     */
    this.actionSystem = null;

    /**
     * AI system used for the game.
     * @type {AISystem}
     */
    this.aiSystem = null;

    /**
     * Layers for the game.
     * @type {Object}
     */
    this.layers = null;

    /**
     * Level used for the game.
     * @type {Level}
     */
    this.level = null;

    /**
     * Used for creating objects.
     * @type {ObjectCreator}
     */
    this.objectCreator = null;

    /**
     * Network used to send data.
     * A network can be either a server or client.
     * @type {BaseNetwork}
     */
    this.network = null;

    /**
     * Collider system to test collisions with bodies for events.
     * @type {BodyColliderSystem}
     */
    this.bodyColliderSystem = null;

    /**
     * Camera used for following entities.
     * @type {FollowerCamera}
     */
    this.followerCamera = null;

    /**
     * Main player characters.
     * @type {Array.<Entity>}
     */
    this.playerCharacters = [];

    /**
     * Script functions to store.
     * The type of script will be based on the ScriptsComponent variables.
     * @type {Object.<String, Function>}
     */
    this.scripts = {};

    /**
     * Global variables to use for scripts.
     * @type {Object}
     */
    this.globals = {};

    /**
     * Time that passed between frames in milliseconds.
     * Updates on every game API update.
     * @type {number}
     */
    this.timePerFrame = 16;

    /**
     * Time that has passed since the creation of the API in milliseconds.
     * @type {number}
     */
    this.timeElapsed = 0;

    /**
     * Parameters for camera shake.
     * @type {ShakeParameters}
     */
    this.shakeParameters = new ShakeParameters();

    /**
     * Set up the API and scripts.
     */
    this.setup();

    /**********************************************
     * Cached data for re-use.
     */
    this.cachedValues = {};
}

/**
 * Calls scripts for the given entity.
 * Scripts can have a maximum of eight arguments.
 * @param {String} name the name of the scripts to call.
 * @param {Entity} entity the entity to call the scripts with.
 */
GameAPI.prototype.callEntityScripts = function(name, entity, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    "use strict";

    var scriptComponent = entity[ScriptsComponent.type];
    if (!scriptComponent) return;

    var scripts = scriptComponent[name];
    for (var i = 0; i < scripts.length; i++) {
        var script = this.scripts[scripts[i]];
        if (!script) continue;

        script.call(this, entity, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    }
};

/**
 * Script signatures for scripts to use.
 * All entity scripts are bound to the GameAPI and have the calling entity as the first parameter.
 * (...) in parameters are the default parameters sent to all script functions.
 * Default parameter is entity.
 * ------ Entity Scripts ------
 * TileSensorCollide - function(..., Array.<{x: Number, y: Number, index: Number}> tileInfo)
 * TileStaticCollide - function(..., CollisionInfo collision, Number horizontalIndex, Number verticalIndex)
 * BodySensorCollide - function(..., Array.<Entity> targets)
 * BodyStaticCollide - function(..., CollisionInfo)
 * BodyStartCollide - function(..., Array.<Entity> targets)
 * BodyStopCollide - function(..., Array.<Entity> targets)
 * Timer - function(...)
 * JustDeath - function(..., Entity killer)
 * Update - function(..., Number dt)
 * JustLand - function(...)
 * LevelStart - function(...)
 * LevelEnd - function(...)
 */

/**
 * Sets up the API.
 */
GameAPI.prototype.setup = function() {
    "use strict";
};

/**
 * Adds a script to the game API.
 * @param {String} key the key to add the script as which is referenced by the script component.
 * @param {Function} script the script function to call when the script is triggered.
 */
GameAPI.prototype.addScript = function(key, script) {
    "use strict";

    this.scripts[key] = script;
};

/**
 * Updates the API and runs scripts.
 * @param {Number} dt the time between frames.
 */
GameAPI.prototype.update = function(dt) {
    "use strict";

    this.timePerFrame = dt;
    this.timeElapsed += dt;

    // Update all entity scripts.
    var entities = this.entitySystem.getEntities(ScriptsComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var scripts = entity[ScriptsComponent.type];
        // Run all the update scripts.
        this.callEntityScripts('update', entity, dt);

        // Run the just land scripts.
        if (scripts.justLand.length > 0) {
            var collision = entity[CollisionComponent.type];
            if (collision && !collision.wasCollidingWith.bottom && collision.isCollidingWith.bottom) {
                this.callEntityScripts('justLand', entity);
            }
        }
    }

    // Update camera shaking.
    if (this.shakeParameters.duration > 0) {
        this.shakeParameters.counter += dt;
        this.shakeParameters.periodCounter += dt;
        if (this.shakeParameters.counter < this.shakeParameters.duration) {
            if (this.shakeParameters.periodCounter >= this.shakeParameters.period) {
                this.cameraShake(this.shakeParameters.left, this.shakeParameters.right,
                    this.shakeParameters.top, this.shakeParameters.bottom);
                this.shakeParameters.periodCounter = 0;
            }
        } else {
            this.shakeParameters.duration = 0;
        }
    }
};

/****************************************************************************
 * Hooks to script into the Game API.
 ***************************************************************************/
GameAPI.prototype.hooks = {};
/**
 * Set as a callback for sensor tile collisions.
 * @param {Entity} entity the entity colliding with tiles.
 * @param {Array.<{x: Number, y:Number, index: Number}>} tiles the tile indices and position.
 */
GameAPI.prototype.hooks.onSensorTileCollide = function(entity, tiles) {
    "use strict";

    this.callEntityScripts('sensorTileCollide', entity, tiles);
};

/**
 * Set as a callback for static tile collisions.
 * @param {CollisionInfo} info the collision info.
 * @param {Number} horizontalIndex the index of the colliding horizontal tile.
 * @param {Number} verticalIndex the index of the colliding vertical tile.
 */
GameAPI.prototype.hooks.onStaticTileCollide = function(info, horizontalIndex, verticalIndex) {
    "use strict";

    this.callEntityScripts('staticTileCollide', info.colliderEntity, info, horizontalIndex, verticalIndex);
};

/**
 * Set as a callback for sensor body collisions.
 * @param {Entity} collider the colliders.
 * @param {Array.<Entity>} targets the targets that are collided with.
 */
GameAPI.prototype.hooks.onBodySensorCollide = function(collider, targets) {
    "use strict";

    this.callEntityScripts('sensorBodyCollide', collider, targets);
};

/**
 * Set as a callback for static body collisions.
 * @param {CollisionInfo} info the collision info used for collision resolution.
 */
GameAPI.prototype.hooks.onBodyStaticCollide = function(info) {
    "use strict";

    this.callEntityScripts('staticBodyCollide', info.colliderEntity, info);
};

/**
 * Set as a callback for sensor body collision start.
 * @param {Entity} collider the colliders.
 * @param {Entity} targets the targets that are collided with.
 */
GameAPI.prototype.hooks.onBodyStartCollide = function(collider, targets) {
    "use strict";

    this.callEntityScripts('bodyStartCollide', collider, targets);
};

/**
 * Set as a callback for when sensor body collision stops.
 * @param {Entity} collider the colliders.
 * @param {Entity} targets the targets that are no longer collided with.
 */
GameAPI.prototype.hooks.onBodyStopCollide = function(collider, targets) {
    "use strict";

    this.callEntityScripts('bodyStopCollide', collider, targets);
};

/**
 * Set as a callback for when an action is added to an entity.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.hooks.onActionAdd = function(entity, action, key) {
    "use strict";
};

/**
 * Set as a callback for action updates.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.hooks.onActionUpdate = function(entity, action, key) {
    "use strict";
};

/**
 * Set as a callback for action triggers.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.hooks.onActionTrigger = function(entity, action, key) {
    "use strict";
};

/**
 * Set as a callback for action channel starts.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.hooks.onActionStart = function(entity, action, key) {
    "use strict";
};

/**
 * Set as a callback for when an action activating but not completed yet.
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.hooks.onActionActive = function(entity, action, key) {
    "use strict";
};

/**
 * Set as a callback for action channel stops..
 * @param {Entity} entity the entity of the action.
 * @param {Action} action the action.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.hooks.onActionStop = function(entity, action, key) {
    "use strict";
};

/**
 * Function hook for switching levels.
 * @type {Function(Object)}
 */
GameAPI.prototype.hooks.onLevelSwitch = null;

/**
 * Function hook for when starting a level.
 */
GameAPI.prototype.hooks.onLevelStart = function() {
    "use strict";

    // Update all entity scripts.
    var entities = this.entitySystem.getEntities(ScriptsComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        // Run all the level start scripts.
        this.callEntityScripts('levelStart', entities[i]);
    }
};

/**
 * Function hook for when ending a level.
 */
GameAPI.prototype.hooks.onLevelEnd = function() {
    "use strict";

    // Update all entity scripts.
    var entities = this.entitySystem.getEntities(ScriptsComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        // Run all the level end scripts.
        this.callEntityScripts('levelEnd', entities[i]);
    }
};

/**
 * Function hook for handling timers on entities.
 * @param {Entity} entity the entity with the timer.
 * @param {Object} timer the timer object.
 */
GameAPI.prototype.hooks.onTimerComplete = function(entity, timer) {
    "use strict";

    var scriptComponent = entity[ScriptsComponent.type];
    if (!scriptComponent) return;

    var timerScripts = scriptComponent.timers[timer.name];
    if (!timerScripts) return;

    // Run each script that responds to the timer name.
    for (var i = 0; i < timerScripts.length; i++) {
        var script = this.scripts[timerScripts[i]];
        if (!script) continue;

        script.call(this, entity, timer);
    }
};

/****************************************************************************
 * API functions for use with scripts.
 ***************************************************************************/

/****************************************************************************
 * Scripts that deal with sounds.
 ***************************************************************************/

/**
 * Retrieves a sound.
 * @param {String} key the path for the sound.
 * @returns {Howl} the sound.
 */
GameAPI.prototype.getSound = function(key) {
    "use strict";

    return this.resources.sounds[key];
};

/**
 * Plays a sound.
 * @param {String} key the path for the sound.
 * @param {String=} id the id of the sound.
 * @returns {String} the played sound id.
 */
GameAPI.prototype.playSound = function(key, id) {
    "use strict";

    var sound = this.resources.sounds[key];
    if (!sound) return null;

    var soundId = null;
    function soundCallback(id) {
        soundId = id;
    }

    sound.play(id, soundCallback);
    return soundId;
};

/**
 * Pauses a sound.
 * @param {String} key the path for the sound.
 * @param {String=} id the id of the sound.
 * @returns {Howl} the paused sound.
 */
GameAPI.prototype.pauseSound = function(key, id) {
    "use strict";

    var sound = this.resources.sounds[key];
    if (!sound) return null;

    return sound.pause(id);
};

/**
 * Plays a sound.
 * @param {String} key the path for the sound.
 * @param {String=} id the id of the sound.
 * @returns {Howl} the played sound.
 */
GameAPI.prototype.stopSound = function(key, id) {
    "use strict";

    var sound = this.resources.sounds[key];
    if (!sound) return null;

    return sound.stop(id);
};

/****************************************************************************
 * Scripts that deal with the camera.
 ***************************************************************************/

/**
 * Shakes the camera in a random range given the bounds.
 * @param {Number} left the most the camera can shake left.
 * @param {Number} right the most the camera can shake right.
 * @param {Number} up the most the camera can shake up.
 * @param {Number} down the most the camera can shake down.
 * @param {Number=} duration the duration to shake the camera for.
 * @param {Number=} period the period between each shake.
 */
GameAPI.prototype.cameraShake = function(left, right, up, down, duration, period) {
    "use strict";

    var camera = this.viewport.camera;
    var x = left + Random.pickRandomFloat() * right;
    var y = up + Random.pickRandomFloat() * down;
    camera.position.x += x;
    camera.position.y += y;

    if (duration) {
        this.shakeParameters.left = left;
        this.shakeParameters.right = right;
        this.shakeParameters.top = up;
        this.shakeParameters.bottom = down;
        this.shakeParameters.counter = 0;
        this.shakeParameters.duration = duration;
        this.shakeParameters.period = period || 100;
        this.shakeParameters.periodCounter = 0;
    }
};

/**
 * Moves the camera immediately to the specified position.
 * @param {Number} x the x location of the camera.
 * @param {Number} y the y location of the camera.
 */
GameAPI.prototype.cameraMove = function(x, y) {
    "use strict";

    var camera = this.viewport.camera;
    camera.position.x = x;
    camera.position.y = y;
};

/**
 * Instantly moves the camera to the followed entity.
 */
GameAPI.prototype.cameraInstantFollow = function() {
    "use strict";

    this.followerCamera.instantMove();
};

/****************************************************************************
 * Scripts that deal with entity displays.
 ***************************************************************************/

/**
 * Sets a tint amount for an entity.
 * @param {Entity} entity the entity to set the tint for.
 * @param {Number} amount the amount to set.
 */
GameAPI.prototype.setEntityTint = function(entity, amount) {
    "use strict";

    var displayComponent = entity[DisplayComponent.type];
    if (!displayComponent) return;

    displayComponent.tint = amount;
};

/**
 * Calculates the animation time per frame to fit within the provided duration.
 * @param {Entity} entity the entity to calculate the time for.
 * @param {String} key the key of the animation.
 * @param {Number} duration the duration the animation will play for per cycle.
 * @returns {number} the animation time per frame.
 */
GameAPI.prototype.calculateAnimationTime = function(entity, key, duration) {
    "use strict";

    var tpf = 0;
    var aniCom = entity[AnimationComponent.type];
    if (!aniCom) return tpf;

    var animation = aniCom.animations[key];
    if (!animation) return tpf;


    return tpf;
};

/**
 * Plays an animation for an entity.
 * @param {Entity} entity the entity to play an animation for.
 * @param {String} key the key of the animation.
 */
GameAPI.prototype.entPlayAnimation = function(entity, key) {
    "use strict";

    var aniCom = entity[AnimationComponent.type];
    if (!aniCom) return;

    if (!key) return;

    aniCom.playAnimation = key;
};

/**
 * Stops animations for an entity.
 * @param {Entity} entity the entity to stop animations for.
 */
GameAPI.prototype.entStopAnimation = function(entity) {
    "use strict";

    var component = entity[AnimationComponent.type];
    if (!component) return;

    component.stopAnimation = true;
};

/****************************************************************************
 * Scripts that deal with entities.
 ***************************************************************************/

/**
 * Checks if the entity system has the entity.
 * @param {Entity} entity the entity to check.
 * @returns {boolean} true if the system has the entity.
 */
GameAPI.prototype.hasEntity = function(entity) {
    "use strict";

    return this.entitySystem.hasEntity(entity);
};

/**
 * Checks if the entity system has the entity by the ID.
 * @param {String} id the entity id to check.
 * @returns {boolean} true if the system has the entity.
 */
GameAPI.prototype.hasEntityById = function(id) {
    "use strict";

    return !!this.entitySystem.getEntityByID(id);
};

/**
 * Retrieves an entity by ID.
 * @param {String} id the id of the entity.
 * @returns {Entity} the entity or null if none found.
 */
GameAPI.prototype.getEntityById = function(id) {
    "use strict";

    return this.entitySystem.getEntityByID(id);
};

/**
 * Retrieves an entity by the name.
 * @param {String} name the name of the mapId.
 * @returns {Entity} the entity matching the name or null if none found.
 */
GameAPI.prototype.getEntityByName = function(name) {
    "use strict";

    return this.entitySystem.getEntityByName(name);
};

/**
 * Removes an entity from the game.
 * @param {Entity} entity the entity to remove.
 */
GameAPI.prototype.removeEntity = function(entity) {
    "use strict";

    this.entitySystem.removeEntity(entity);
};

/**
 * Retrieves all entities with userData matching the key and value.
 * @param {String} key the key of the userData.
 * @param {*} value the value of the property.
 * @returns {Array.<Entity>} the entities matching the key and value.
 */
GameAPI.prototype.getEntitiesByProperty = function(key, value) {
    "use strict";

    var entities = this.entitySystem.getAllEntities();
    var matches = [];
    for (var index in entities) {
        if (entities[index].userData[key] === value) {
            matches.push(entities[index]);
        }
    }

    return matches;
};

/**
 * Creates a game object given the key.
 * @param {String} key the key for the object co create.
 * @returns {Entity} the created entity or null if none found.
 */
GameAPI.prototype.createObject = function(key) {
    "use strict";

    return this.objectCreator.createFromStore(key);
};

/**
 * Creates fading text at the given position.
 * @param {Number} x the x position.
 * @param {Number} y the y position.
 * @param {String} text the text to display.
 * @returns {Entity} the fading text entity.
 */
GameAPI.prototype.createFadingText = function(x, y, text) {
    "use strict";

    var textEntity = this.objectCreator.createFromStore('./media/data/objects/fading-text.json');

    var spatial = textEntity[SpatialComponent.type];
    spatial.position.x = x;
    spatial.position.y = y;

    this.textSetString(textEntity, text);

    return textEntity;
};

/**
 * Sets the string of a text entity.
 * @param {Entity} entity the text entity.
 * @param {String} text the text to set.
 */
GameAPI.prototype.textSetString = function(entity, text) {
    "use strict";

    var component = entity[TextComponent.type];
    if (!component) return;

    component.text = text;
};

/**
 * Create particles from a point.
 * @param {String} key the key of the particle to create.
 * @param {Number} x the x location to spawn particles from.
 * @param {Number} y the y location to spawn particles from.
 * @param {Number} spread the speed the particles will spread out by.
 * @param {Number} density the number of particles to create.
 */
GameAPI.prototype.createPointParticles = function(key, x, y, spread, density) {
    "use strict";

    for (var i = 0; i < density; i++) {
        var particle = this.createObject(key);
        if (!particle) break;

        var movement = particle[MovementComponent.type];
        if (movement) {
            movement.speed.x = Random.pickRandomFloat() * spread - spread / 2;
            movement.speed.y = Random.pickRandomFloat() * spread - spread  / 2;
        }

        this.entSetPosition(particle, x, y);
        this.entSetRotation(particle, Random.pickRandomFloat() * Math.PI * 2);
    }
};

/**
 * Retrieves a modified stat.
 * @param {Entity} entity the entity to retrieve the modified stats for.
 * @param {String} key the field to retrieve the modified stats from.
 * @param {Number=} base the base number of the modified stat.
 * @returns {Number} the modified stat or 0 if none found.
 */
GameAPI.prototype.entGetModStat = function(entity, key, base) {
    "use strict";

    var stat = base;
    if (stat) {
        return ModifierSystem.getField(entity, key, stat);
    }

    // Handle the common stats.
    var comp;
    switch (key) {
        case GameAPI.StatFields.accelerationX:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.acceleration.x;
            break;
        case GameAPI.StatFields.accelerationY:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.acceleration.y;
            break;
        case GameAPI.StatFields.airAccelerationX:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.airAcceleration.x;
            break;
        case GameAPI.StatFields.airAccelerationY:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.airAcceleration.y;
            break;
        case GameAPI.StatFields.maxMoveSpeedX:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.maxMoveSpeed.x;
            break;
        case GameAPI.StatFields.maxMoveSpeedY:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.maxMoveSpeed.y;
            break;
        case GameAPI.StatFields.gravityX:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.gravity.x;
            break;
        case GameAPI.StatFields.gravityY:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.gravity.y;
            break;
        case GameAPI.StatFields.jumpAcceleration:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.jumpAcceleration;
            break;
        case GameAPI.StatFields.maxFallSpeed:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.maxFallSpeed;
            break;
        case GameAPI.StatFields.weight:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.weight;
            break;
        case GameAPI.StatFields.cooldown:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.cooldown;
            break;
        case GameAPI.StatFields.damage:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.damage;
            break;
        case GameAPI.StatFields.defense:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.defense;
            break;
        case GameAPI.StatFields.force:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.force;
            break;
        case GameAPI.StatFields.maxHitPoints:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.maxHitPoints;
            break;
        case GameAPI.StatFields.maxStamina:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.maxStamina;
            break;
        case GameAPI.StatFields.range:
            comp = entity[StatsComponent.type];
            if (comp) stat = comp.range;
            break;
    }
    if (!stat) stat = 0;

    return ModifierSystem.getField(entity, key, stat);
};

/**
 * Sets the modifiers for a stat.
 * @param {Entity} entity the entity to retrieve the modified stats for.
 * @param {Number} add the amount to set the add amount.
 * @param {String} key the field to retrieve from .
 * @param {Number} mult the amount to set the multiply amount.
 */
GameAPI.prototype.entSetModifier = function(entity, key, add, mult) {
    "use strict";

    ModifierSystem.setField(entity, key, add, mult);
};

/**
 * Adds the modifiers for a stat.
 * @param {Entity} entity the entity to retrieve the modified stats for.
 * @param {String} key the field to retrieve from.
 * @param {Number} add the amount to add to the modifier add amount.
 * @param {Number} mult the amount to add to the modified multiply amount.
 * @param {Boolean} increaseMult true to subtract 1 from the multiplier if multiplier already greater than 1.
 */
GameAPI.prototype.entAddModifier = function(entity, key, add, mult, increaseMult) {
    "use strict";

    var currentMult = ModifierSystem.getMultField(entity, key);
    var multAmount = 1;
    if (increaseMult && currentMult > 0) {
        if (mult >= 1) {
            multAmount = mult - 1;
        } else if (mult <= -1) {
            multAmount = mult + 1;
        }
    } else {
        multAmount = mult;
    }

    ModifierSystem.addField(entity, key, add, multAmount);
};

/**
 * Retrieves the add modifier.
 * @param {Entity} entity the entity to retrieve the field from.
 * @param {String} key the key of the field.
 * @returns {Number} the add modifier.
 */
GameAPI.prototype.entGetModifierAdd = function(entity, key) {
    "use strict";

    return ModifierSystem.getAddField(entity, key);
};

/**
 * Retrieves the multiply modifier.
 * @param {Entity} entity the entity to retrieve the field from.
 * @param {String} key the key of the field.
 * @returns {Number} the multiply modifier.
 */
GameAPI.prototype.entGetModifierMult = function(entity, key) {
    "use strict";

    return ModifierSystem.getMultField(entity, key);
};

/**
 * Set the state of a modifier.
 * @param {Entity} entity the entity to set the state for.
 * @param {String} key the key of the field.
 * @param {String} state the state to set.
 */
GameAPI.prototype.entSetModifierState = function(entity, key, state) {
    "use strict";

    ModifierSystem.setState(entity, key, state);
};

/**
 * Retrieves the state field in modifiers.
 * @param {Entity} entity the entity to retrieve the state field from.
 * @param {String} key the key for the modifier.
 * @returns {String} the modifier state.
 */
GameAPI.prototype.entGetModifierState = function(entity, key) {
    "use strict";

    return ModifierSystem.getState(entity, key);
};

/**
 * Applies force to the entity given the point to calculate the angle.
 * @param {Entity} entity the entity to apply the force to.
 * @param {{x: Number, y: Number}} point the point to apply the force from.
 * @param {Number} force the amount of force to apply.
 */
GameAPI.prototype.applyForce = function(entity, point, force) {
    "use strict";

    var stats = entity[StatsComponent.type];
    if (!stats || force === 0) return;

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var movement = entity[MovementComponent.type];
    if (movement) {
        movement.speed.x = 0;
        movement.speed.y = 0;
    }

    var angle = -Math.atan2(point.y - spatial.position.y, point.x - spatial.position.x);
    stats.appliedForce.x += -force * Math.cos(angle);
    stats.appliedForce.y += force * Math.sin(angle);
};

/**
 * Applies force to the entity diagonally upwards.
 * @param {Entity} entity the entity to apply the force to.
 * @param {{x: Number, y: Number}} point the point to apply the force from.
 * @param {Number} force the amount of force to apply.
 */
GameAPI.prototype.applyForceDiagonal = function(entity, point, force) {
    "use strict";

    var stats = entity[StatsComponent.type];
    if (!stats || force === 0) return;

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var movement = entity[MovementComponent.type];
    if (movement) {
        movement.speed.x = 0;
        movement.speed.y = 0;
    }
    if (spatial.position.x > point.x) {
        stats.appliedForce.x += force;
    } else {
        stats.appliedForce.x -= force;
    }
    stats.appliedForce.y -= force;
};

/**
 * Applies force to the entity given the point to calculate the direction to apply.
 * @param {Entity} entity the entity to apply the force to.
 * @param {{x: Number, y: Number}} point the point to apply the force from.
 * @param {Number} force the amount of force to apply.
 * @param {Boolean} isHorizontal true to apply force horizontally.
 * @param {Boolean} isVertical true to apply force vertically.
 */
GameAPI.prototype.applyForcePlane = function(entity, point, force, isHorizontal, isVertical) {
    "use strict";

    var stats = entity[StatsComponent.type];
    if (!stats || force === 0) return;

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var movement = entity[MovementComponent.type];
    if (isHorizontal) {
        if (movement) {
            movement.speed.x = 0;
        }
        if (spatial.position.x > point.x) {
            stats.appliedForce.x += force;
        } else {
            stats.appliedForce.x -= force;
        }
    }
    if (isVertical) {
        if (movement) {
            movement.speed.y = 0;
        }
        if (spatial.position.y > point.y) {
            stats.appliedForce.y += force;
        } else {
            stats.appliedForce.y -= force;
        }
    }
};

/**
 * Damages an entity that is not invincible.
 * @param {Entity} entity the entity receiving the damage.
 * @param {Number} amount the amount of damage to deal.
 * @param {Entity=} damager the damaging entity (used damage scripts but not required).
 * @param {Boolean=} showText true to show the damage text.
 * @return {Boolean} true if the entity was damaged.
 */
GameAPI.prototype.damage = function(entity, amount, damager, showText) {
    "use strict";

    var stats = entity[StatsComponent.type];
    if (!stats) return false;

    // Don't damage dead or invincible entities.
    if (stats.isDead) return false;
    if (stats.currentInvinciblity > 0) return false;

    // Apply damage and invincibility.
    var damage = amount - stats.defense;
    // Cap the minimum damage to 1.
    if (damage <= 0 && amount !== 0) damage = 1;
    stats.hitPoints -= damage;
    stats.currentInvinciblity = stats.invincibility;

    // Apply hurt effects.
    var sfx = entity[SfxComponent.type];
    if (sfx) {
        sfx.blinkingDuration = stats.currentInvinciblity;
        sfx.isBlinking = true;
        sfx.isFlashing = true;
    }

    // Check if the entity has died.
    if (stats.hitPoints <= 0) {
        var justDead = !stats.isDead;
        stats.isDead = true;

        if (justDead) {
            this.callEntityScripts('justDeath', entity, damager);
        }
    }

    // Display damage text.
    if (showText) {
        var entitySpatial = entity[SpatialComponent.type];
        if (entitySpatial) {
            this.createFadingText(entitySpatial.position.x, entitySpatial.position.y, damage.toString());
        }
    }

    return true;
};

/**
 * Revives an entity.
 * @param {Entity} entity the entity to revive.
 */
GameAPI.prototype.revive = function(entity) {
    "use strict";

    var stats = entity[StatsComponent.type];
    if (!stats) return;

    stats.hitPoints = stats.maxHitPoints;
    stats.isDead = false;
};

/**
 * Retrieves the closest player character.
 * @param {Number} x the x position to check from.
 * @param {Number} y the y position to check from.
 * @returns {Entity} the closest player character or null if none found.
 */
GameAPI.prototype.getClosestPlayerCharacter = function(x, y) {
    "use strict";

    var entity = null;
    var distance = Number.MAX_VALUE;
    for (var i = 0; i < this.playerCharacters.length; i++) {
        var spatial = this.playerCharacters[i][SpatialComponent.type];
        if (!spatial) continue;

        var newDistance = FEMath.calcDistancePointsNoRoot(spatial.position.x, spatial.position.y, x, y);
        if (newDistance < distance) {
            entity = this.playerCharacters[i];
        }
    }

    return entity;
};

/**
 * Set the position of an entity.
 * @param {Entity} entity the entity to set the position of.
 * @param {Number} x the x coordinate.
 * @param {Number} y the y coordinate.
 */
GameAPI.prototype.entSetPosition = function(entity, x, y) {
    "use strict";

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    spatial.position.x = x;
    spatial.position.y = y;
};

/**
 * Sets the rotation of an entity.
 * @param {Entity} entity the entity to set the rotation of.
 * @param {Number} v the rotation to set.
 */
GameAPI.prototype.entSetRotation = function(entity, v) {
    "use strict";

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    spatial.rotation = v;
};

/**
 * Stops the movement of an entity.
 * @param {Entity} entity the entity to stop the movement of.
 */
GameAPI.prototype.entStopMovement = function(entity) {
    "use strict";

    var movement = entity[MovementComponent.type];
    if (movement) {
        movement.speed.x = 0;
        movement.speed.y = 0;
        movement.acceleration.x = 0;
        movement.acceleration.y = 0;
        movement.move.x = 0;
        movement.move.y = 0;
    }
};

/**
 * Starts to cast an action.
 * @param {Entity} entity the entity to cast the action for.
 * @param {String} key the key of the cation.
 */
GameAPI.prototype.entCastAction = function(entity, key) {
    "use strict";

    var component = entity[ActionComponent.type];
    if (!component) return;

    component.triggerActions.push(key);
};

/**
 * Stops a channeling action.
 * @param {Entity} entity the entity to stop the action for.
 * @param {String} key the key of the action.
 */
GameAPI.prototype.entStopAction = function(entity, key) {
    "use strict";

    var component = entity[ActionComponent.type];
    if (!component) return;

    component.stopActions.push(key);
};

/**
 * Retrieves an action from an entity.
 * @param {Entity} entity the entity to retrieve the action from.
 * @param {String} key the key of the action.
 * @returns {Action} the action or null if none found.
 */
GameAPI.prototype.entGetAction = function(entity, key) {
    "use strict";

    var component = entity[ActionComponent.type];
    if (!component) return null;

    return component.actions[key];
};

/**
 * Gets if an action is active.
 * @param {Entity} entity the entity to check.
 * @param {String} key the key of the action.
 * @returns {boolean} true if the action is active.
 */
GameAPI.prototype.entIsActionActive = function(entity, key) {
    "use strict";

    var action = this.entGetAction(entity, key);
    if (!action) return false;
    return action.isActive;
};

/**
 * Checks if an entity is colliding with another entity by name.
 * @param {Entity} entity the entity to check collisions with.
 * @param {String} name the name of the colliding entity.
 * @returns {boolean} true if the entity is colliding with an entity matching the name.
 */
GameAPI.prototype.entIsCollidingWithName = function(entity, name) {
    "use strict";

    var component = entity[CollisionComponent.type];

    if (!component) return false;

    var i, collider;
    for (i = 0; i < component.previousColliders.length; i++) {
        collider = this.getEntityById(component.previousColliders[i]);
        if (collider && collider.name === name) {
            return true;
        }
    }
    for (i = 0; i < component.startColliding.length; i++) {
        collider = this.getEntityById(component.startColliding[i]);
        if (collider && collider.name === name) {
            return true;
        }
    }
    for (i = 0; i < component.colliding.length; i++) {
        collider = this.getEntityById(component.colliding[i]);
        if (collider && collider.name === name) {
            return true;
        }
    }
    return false;
};

/**
 * Checks if an entity is colliding with another entity by type.
 * Only objects created from within the store will have a type.
 * @param {Entity} entity the entity to check collisions with.
 * @param {String} type the type of the colliding entity.
 * @returns {boolean} true if the entity is colliding with an entity matching the type.
 */
GameAPI.prototype.entIsCollidingWithType = function(entity, type) {
    "use strict";

    var component = entity[CollisionComponent.type];

    if (!component) return false;

    var i, collider;
    for (i = 0; i < component.previousColliders.length; i++) {
        collider = this.getEntityById(component.previousColliders[i]);
        if (collider && collider.type === type) {
            return true;
        }
    }
    for (i = 0; i < component.startColliding.length; i++) {
        collider = this.getEntityById(component.startColliding[i]);
        if (collider && collider.type === type) {
            return true;
        }
    }
    for (i = 0; i < component.colliding.length; i++) {
        collider = this.getEntityById(component.colliding[i]);
        if (collider && collider.type === type) {
            return true;
        }
    }

    return false;
};


/****************************************************************************
 * Functions relating to collision and physics.
 ***************************************************************************/

/**
 * Retrieves a random point in a region.
 * @param {Entity} entity the entity region.
 * @return {Object} the x and y values or null if none found.
 */
GameAPI.prototype.getRandomPointInRegion = function(entity) {
    "use strict";

    var body = entity[BodyComponent.type];
    if (!body || body.shapes.length <= 0) return null;

    var shape = body.shapes[0];
    var box = shape.box;
    if (!box) return;

    var x1 = shape.position.x - box.width / 2;
    var x2 = shape.position.x + box.width / 2;
    var y1 = shape.position.y - box.height / 2;
    var y2 = shape.position.y + box.height / 2;


    this.cachedValues.x = x1 + Random.pickRandomFloat() * (x2 - x1);
    this.cachedValues.y = y1 + Random.pickRandomFloat() * (y2 - y1);

    return this.cachedValues;
};

/****************************************************************************
 * Functions relating to levels.
 ***************************************************************************/

/**
 * Switches to another level.
 * @param {String} name the name of the level to switch to.
 */
GameAPI.prototype.switchLevel = function(name) {
    "use strict";

    if (this.hooks.onLevelSwitch) {
        this.hooks.onLevelSwitch(name);
    }
};

/**
 * Retrieves a static tile given a world coordinate.
 * @param {Number} x the x location.
 * @param {Number} y the y location.
 * @returns {Number} the index of the tile or null|undefined if none found.
 */
GameAPI.prototype.getStaticTileAtPoint = function(x, y) {
    "use strict";

    if (!this.level) return null;

    var ix = Math.floor(x / this.level.tileWidth);
    var iy = Math.floor(y / this.level.tileHeight);

    if (this.level.staticTiles[iy]) {
        return this.level.staticTiles[iy][ix];
    }

    return null;
};

/**
 * Removes a non-background tile.
 * @param {Number} x the x location in the tile grid.
 * @param {Number} y the y location in the tile grid.
 */
GameAPI.prototype.removeTile = function(x, y) {
    "use strict";

    if (!this.level) return;

    this.level.removeTile(x, y);
};

module.exports = GameAPI;

/**
 * Fields for modifier use.
 */
module.exports.StatFields = {
    accelerationX: 'acceleration.x',
    accelerationY: 'acceleration.y',
    airAccelerationX: 'airAcceleration.x',
    airAccelerationY: 'airAcceleration.y',
    gravityX: 'gravity.x',
    gravityY: 'gravity.y',
    maxMoveSpeedX: 'maxMoveSpeed.x',
    maxMoveSpeedY: 'maxMoveSpeed.y',
    jumpAcceleration: 'jumpAcceleration',
    maxFallSpeed: 'maxFallSpeed',
    weight: 'weight',
    maxHitPoints: 'maxHitPoints',
    maxStamina: 'maxStamina',
    damage: 'damage',
    defense: 'defense',
    force: 'force',
    cooldown: 'cooldown',
    range: 'range'
};