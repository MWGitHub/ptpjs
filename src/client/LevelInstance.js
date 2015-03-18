/**
 * @author MW
 * Represents an instance for a single level.
 */
var CoreState = require('../fejs/core/CoreState');
var Input = require('../fejs/core/input');
var Input2D = require('../fejs/input/input2d');
var ViewportScene = require('../fejs/pixi/Viewport').ViewportScene;
var EntitySystem = require('../fejs/entitysystem/entitysystem');
var BoundsSystem = require('../fejs/systems/physics/BoundsSystem');
var BoundsDebugSystem = require('../fejs/systems/physics/BoundsDebugSystem');
var ChildSystem = require('../fejs/systems/ChildSystem');
var DisplaySystem = require('../fejs/systems/display/DisplaySystem');
var DisplayComponent = require('../fejs/systems/display/DisplayComponent');
var MovementComponent = require('../fejs/systems/physics/MovementComponent');
var SpatialComponent = require('../fejs/systems/SpatialComponent');
var StatsComponent = require('./objects/StatsComponent');
var MovementSystem = require('../fejs/systems/physics/MovementSystem');
var SpeedSystem = require('../fejs/systems/physics/SpeedSystem');
var TileColliderSystem = require('../fejs/systems/physics/TileColliderSystem');
var BodyColliderSystem = require('../fejs/systems/physics/BodyColliderSystem');
var StatusDisplaySystem = require('./gui/StatusDisplaySystem');
var AISystem = require('../fejs/systems/ai/AISystem');
var ActionComponent = require('../fejs/systems/actions/ActionComponent');
var ActionSystem = require('../fejs/systems/actions/ActionSystem');
var AnimationSystem = require('../fejs/systems/display/AnimationSystem');
var ForceSystem = require('./objects/ForceSystem');
var StatusSystem = require('./objects/StatusSystem');
var NetworkSystem = require('./network/NetworkSystem');
var TextSystem = require('../fejs/systems/display/TextSystem');
var ParticleSystem = require('../fejs/systems/display/ParticleSystem');
var LevelCreator = require('./level/LevelCreator');
var TiledMapData = require('../fejs/loaders/TiledMapData');
var Level = require('./level/Level');
var ObjectCreator = require('./objects/ObjectCreator');
var GameAPI = require('./GameAPI');
var TweenSystem = require('../fejs/core/tween').TweenSystem;
var FollowerCamera = require('./camera/FollowerCamera');
var HotKeys = require('./HotKeys');
var MainScripts = require('../../scripts/game/MainScripts');

/**
 * Height for one way platforms.
 * @type {number}
 */
var ONE_WAY_HEIGHT = 6;

/**
 * Creates the game.
 * @param {GameAPI} gameAPI the API to use for the game.
 * @param {String} characterData the data for the character.
 * @constructor
 */
function LevelInstance(gameAPI, characterData) {
    "use strict";

    /**
     * Game API for use with scripts.
     * @type {GameAPI}
     */
    this.gameAPI = gameAPI;

    this.stage = gameAPI.stage;
    this.viewport = gameAPI.viewport;
    this.resources = gameAPI.resources;
    this.input = gameAPI.input;

    // Create a scene to use.
    this.scene = new ViewportScene();
    this.viewport.addScene(this.scene);

    /**
     * Layers to add to.
     */
    this.layers = {
        /**
         * Background to add background tiles to and background objects.
         * @type {PIXI.DisplayObjectContainer}
         */
        background: new PIXI.DisplayObjectContainer(),

        /**
         * Layer to add tiles to.
         * @type {PIXI.DisplayObjectContainer}
         */
        tile: new PIXI.DisplayObjectContainer(),

        /**
         * Foreground layer for tiles.
         * @type {PIXI.DisplayObjectContainer}
         */
        tileForeground: new PIXI.DisplayObjectContainer(),

        /**
         * Object back layer which is in front of the background but below normal
         * objects.
         * @type {PIXI.DisplayObjectContainer}
         */
        objectBack: new PIXI.DisplayObjectContainer(),

        /**
         * Layer to add objects to.
         * @type {PIXI.DisplayObjectContainer}
         */
        object: new PIXI.DisplayObjectContainer(),

        /**
         * Object front layer which is in front of the objects but below projectiles.
         * @type {PIXI.DisplayObjectContainer}
         */
        objectFront: new PIXI.DisplayObjectContainer(),

        /**
         * Layer to add projectiles to.
         * @type {PIXI.DisplayObjectContainer}
         */
        projectile: new PIXI.DisplayObjectContainer(),

        /**
         * Layer to add foreground elements to.
         */
        foreground: new PIXI.DisplayObjectContainer(),

        /**
         * GUI that scrolls with the game.
         */
        scrollingGUI: new PIXI.DisplayObjectContainer(),

        /**
         * Layer to add GUI elements and effects to.
         * @type {PIXI.DisplayObjectContainer}
         */
        gui: null
    };
    this.scene.display.addChild(this.layers.background);
    this.scene.display.addChild(this.layers.tile);
    this.scene.display.addChild(this.layers.tileForeground);
    this.scene.display.addChild(this.layers.objectBack);
    this.scene.display.addChild(this.layers.object);
    this.scene.display.addChild(this.layers.objectFront);
    this.scene.display.addChild(this.layers.projectile);
    this.scene.display.addChild(this.layers.foreground);
    this.scene.display.addChild(this.layers.scrollingGUI);

    /**
     * A special layer for the GUI.
     * @type {ViewportScene}
     */
    this.gui = new ViewportScene();
    this.gui.isLocked = true;
    this.layers.gui = this.gui.display;
    this.viewport.addScene(this.gui);


    /**
     * Entity system to use for the game.
     * @type {EntitySystem}
     */
    this.entitySystem = new EntitySystem();

    /**
     * Systems that process entity components.
     * @type {System}
     */
    this.systems = [];

    /**
     * Helper for handling 2D inputs.
     * @type {Input2D}
     */
    this.input2D = new Input2D(this.viewport, this.input);

    /**
     * Tweening system for updating tweens.
     * @type {TweenSystem}
     */
    this.tweenSystem = new TweenSystem();

    /**
     * Handles object creation.
     * @type {ObjectCreator}
     */
    this.objectCreator = new ObjectCreator(this.entitySystem,
        this.resources.getJson('./media/data/config/actions.json'),
        this.resources.getJson('./media/data/config/ai.json'));

    /**
     * Level of the game.
     * Set the level if auto-generation is not used.
     * @type {Level}
     */
    this.level = null;

    /**
     * Character data to use for creating the character.
     * @type {Object}
     */
    this.characterData = characterData;

    /**
     * Character for the game.
     * @type {Entity}
     */
    this.character = null;

    /**
     * Follower camera for following the player character.
     * @type {FollowerCamera}
     */
    this.followerCamera = null;
}

/**
 * Starts a level given the generated level parameters.
 * @param {LevelConfig} config the parameters to use for loading the level.
 */
LevelInstance.prototype.startLevel = function(config) {
    "use strict";

    var i;
    var mainConfig = this.resources.getJson('./media/data/config/main.json');
    this.objectCreator.debugBounds = mainConfig.showDebugBounds;

    // Load objects required for the game into the store.
    for (var key in this.resources.data) {
        // Only allow json files.
        var extension = key.split('.');
        extension = extension[extension.length - 1];
        if (extension !== 'json') continue;

        this.objectCreator.storeObject(key, this.resources.data[key]);
    }

    // Load the map depending on type.
    var mapData, path;
    if (!this.level) {
        // Set the level type.
        this.level = new Level(config);

        if (config.generator === 'single') {
            mapData = new TiledMapData();
            path = config.maps[0];
            mapData.loadFromTMX(this.resources.data[path]);
            this.level.createFromMap(mapData);
        } else {
            var levelCreator = new LevelCreator();
            for (i = 0; i < config.maps.length; i++) {
                mapData = new TiledMapData();
                path = config.maps[i];
                mapData.loadFromTMX(this.resources.data[path]);
                levelCreator.addMapData(path, mapData);
            }
            var multiMap = levelCreator.generateMap(config);
            this.level.createFromMap(multiMap);
        }
    }

    // Generate the level display.
    this.level.generateDisplay(this.layers.background, this.layers.tile, this.layers.tileForeground);

    // Set the enemy types.
    this.objectCreator.enemies = this.level.enemies;

    // Create the systems.
    this.systems.push(new NetworkSystem(this.entitySystem, this.gameAPI.network));
    this.systems.push(new (require('./objects/ModifierSystem'))(this.entitySystem));
    this.systems.push(new StatusSystem(this.entitySystem));
    var actionSystem = new ActionSystem(this.entitySystem);
    this.systems.push(actionSystem);
    var aiSystem = new AISystem(this.entitySystem);
    this.systems.push(aiSystem);
    var timeSystem = new (require('./systems/TimeSystem'))(this.entitySystem);
    this.systems.push(timeSystem);
    this.systems.push(new ForceSystem(this.entitySystem));
    this.systems.push(new SpeedSystem(this.entitySystem));
    this.systems.push(new BoundsSystem(this.entitySystem));
    this.systems.push(new BoundsDebugSystem(this.entitySystem, this.scene.display));

    var tileColliderSystem = new TileColliderSystem(this.entitySystem, {
        tiles: this.level.tiles,
        staticTiles: this.level.staticTiles,
        sensorTiles: this.level.sensorTiles,
        tileWidth: this.level.tileWidth,
        tileHeight: this.level.tileHeight
    });
    tileColliderSystem.tileProperties.oneWayHeight = ONE_WAY_HEIGHT;
    this.systems.push(tileColliderSystem);

    var bodyColliderSystem = new BodyColliderSystem(this.entitySystem);
    this.systems.push(bodyColliderSystem);
    this.systems.push(new MovementSystem(this.entitySystem));
    this.systems.push(new ChildSystem(this.entitySystem));
    var statusDisplaySystem = new StatusDisplaySystem(this.entitySystem, this.viewport, this.layers.gui);
    this.systems.push(statusDisplaySystem);
    this.systems.push(new AnimationSystem(this.entitySystem));
    this.systems.push(new (require('../fejs/systems/display/SfxSystem'))(this.entitySystem));
    this.systems.push(new TextSystem(this.entitySystem));
    var displaySystem = new DisplaySystem(this.entitySystem);
    this.systems.push(displaySystem);
    this.systems.push(new ParticleSystem(this.entitySystem));

    // Set up the display layers.
    displaySystem.addDisplay('background', this.layers.background);
    displaySystem.addDisplay('tile', this.layers.tile);
    displaySystem.addDisplay('tileForeground', this.layers.tileForeground);
    displaySystem.addDisplay('objectBack', this.layers.objectBack);
    displaySystem.addDisplay('object', this.layers.object);
    displaySystem.addDisplay('objectFront', this.layers.objectFront);
    displaySystem.addDisplay('projectile', this.layers.projectile);
    displaySystem.addDisplay('foreground', this.layers.foreground);
    displaySystem.addDisplay('scrollingGUI', this.layers.scrollingGUI);
    displaySystem.addDisplay('gui', this.layers.gui);


    // Set up the API
    this.gameAPI.entitySystem = this.entitySystem;
    this.gameAPI.level = this.level;
    this.gameAPI.objectCreator = this.objectCreator;
    this.gameAPI.statusDisplaySystem = statusDisplaySystem;
    this.gameAPI.layers = this.layers;
    this.gameAPI.bodyColliderSystem = bodyColliderSystem;
    this.gameAPI.actionSystem = actionSystem;
    this.gameAPI.aiSystem = aiSystem;
    tileColliderSystem.sensorCollisionCallbacks.push(this.gameAPI.hooks.onSensorTileCollide.bind(this.gameAPI));
    tileColliderSystem.staticCollisionCallbacks.push(this.gameAPI.hooks.onStaticTileCollide.bind(this.gameAPI));
    bodyColliderSystem.sensorCollisionCallbacks.push(this.gameAPI.hooks.onBodySensorCollide.bind(this.gameAPI));
    bodyColliderSystem.staticCollisionCallbacks.push(this.gameAPI.hooks.onBodyStaticCollide.bind(this.gameAPI));
    bodyColliderSystem.startCollisionCallbacks.push(this.gameAPI.hooks.onBodyStartCollide.bind(this.gameAPI));
    bodyColliderSystem.stopCollisionCallbacks.push(this.gameAPI.hooks.onBodyStopCollide.bind(this.gameAPI));
    actionSystem.actionAddCallbacks.push(this.gameAPI.hooks.onActionAdd.bind(this.gameAPI));
    actionSystem.actionUpdateCallbacks.push(this.gameAPI.hooks.onActionUpdate.bind(this.gameAPI));
    actionSystem.actionTriggerCallbacks.push(this.gameAPI.hooks.onActionTrigger.bind(this.gameAPI));
    actionSystem.actionStartCallbacks.push(this.gameAPI.hooks.onActionStart.bind(this.gameAPI));
    actionSystem.actionActiveCallbacks.push(this.gameAPI.hooks.onActionActive.bind(this.gameAPI));
    actionSystem.actionStopCallbacks.push(this.gameAPI.hooks.onActionStop.bind(this.gameAPI));
    timeSystem.timerCompleteCallbacks.push(this.gameAPI.hooks.onTimerComplete.bind(this.gameAPI));

    // Add scripts to the API.
    var mainScripts = new MainScripts(this.gameAPI);



    // Create the objects in the level.
    var spatial;
    var objects = this.level.objects;
    for (i = 0; i < objects.length; i++) {
        var objData = objects[i];
        var entity = this.objectCreator.createFromID(objData.gid, objData);
        // Skip if not an object.
        if (!entity) continue;

        spatial = entity[SpatialComponent.type];
        if (spatial) {
            spatial.position.x = objData.x;
            spatial.position.y = objData.y;
        }
    }

    // Create the regions in the level.
    var regions = this.level.regions;
    for (i = 0; i < regions.length; i++) {
        var regionData = regions[i];
        this.objectCreator.createRegion(regionData);
    }

    // Create the character in the level.
    this.character = this.objectCreator.createFromData(this.characterData);
    var spawn = this.level.getFirstObjectOfID(0);
    if (!spawn) spawn = {x: 0, y: 0};
    spatial = this.character[SpatialComponent.type];
    spatial.position.x = spawn.x;
    spatial.position.y = spawn.y;
    statusDisplaySystem.mainEntity = this.character;


    // Set up the camera.
    this.followerCamera = new FollowerCamera(this.viewport, this.character);
    this.followerCamera.right = this.level.width * this.level.tileWidth;
    this.followerCamera.bottom = this.level.height * this.level.tileHeight;
    this.followerCamera.isSimple = false;
    this.gameAPI.followerCamera = this.followerCamera;
    // Move the camera to the character.
    this.viewport.camera.position.x = this.followerCamera.calculateCameraX(spatial.position.x);
    this.viewport.camera.position.y = this.followerCamera.calculateCameraY(spatial.position.y);

    // Set up objects for the Game API.
    this.gameAPI.playerCharacters.push(this.character);

    // Run the level start scripts.
    this.gameAPI.hooks.onLevelStart.call(this.gameAPI);


    aiSystem.showDebug = false;
};

/**
 * Update game logic before any systems update.
 * @param {Number} dt the time between updates in ms.
 */
LevelInstance.prototype.updatePreLogic = function(dt) {
    "use strict";

};

/**
 * Update only the game logic.
 * @param {Number} dt the time between updates in ms.
 */
LevelInstance.prototype.updateLogic = function(dt) {
    "use strict";

    // Update the action hotkeys for the controlled character.
    var actions = this.character[ActionComponent.type];
    var spatial = this.character[SpatialComponent.type];
    for (var key in actions.actions) {
        var action = actions.actions[key];
        // Check the mouse for directions.
        if (spatial) {
            if (action.hotkey === HotKeys.ACTIVE1) {
                if (this.input.isMouseClicked.left) {
                    if (this.input2D.mouseViewPosition.x < spatial.position.x) {
                        spatial.direction = -1;
                    } else {
                        spatial.direction = 1;
                    }
                }
            }
            if (action.hotkey === HotKeys.ACTIVE2) {
                if (this.input.isMouseClicked.right) {
                    if (this.input2D.mouseViewPosition.x < spatial.position.x) {
                        spatial.direction = -1;
                    } else {
                        spatial.direction = 1;
                    }
                }
            }
            if (action.hotkey === HotKeys.ACTIVE3) {
                if (this.input.isMouseClicked.middle) {
                    if (this.input2D.mouseViewPosition.x < spatial.position.x) {
                        spatial.direction = -1;
                    } else {
                        spatial.direction = 1;
                    }
                }
            }
        }

        // Check the keyboard actions.
        if (action.justDownOnly) {
            if (this.input.keysJustDown[action.hotkey]) {
                actions.triggerActions.push(key);
            }
        } else {
            if (this.input.keysDown[action.hotkey]) {
                actions.triggerActions.push(key);
            }
        }
        // Only allow channeled actions to be stopped manually.
        if (action.isChanneled && this.input.keysUp[action.hotkey]) {
            actions.stopActions.push(key);
        }
    }

    this.gameAPI.update(dt);
};

/**
 * Update game logic after systems update.
 * @param {Number} dt the time between updates in ms.
 */
LevelInstance.prototype.updatePostLogic = function(dt) {
    "use strict";

    if (this.followerCamera) {
        this.followerCamera.update(dt);
    }

    var camera = this.viewport.camera;

    this.level.updateView(
        camera.position.x - this.viewport.width / 2 / camera.scale.x,
        camera.position.x + this.viewport.width / 2 / camera.scale.x,
        camera.position.y - this.viewport.height / 2 / camera.scale.y,
        camera.position.y + this.viewport.height / 2 / camera.scale.y
    );

    this.tweenSystem.update(dt);
};

/**
 * Update the game.
 * @param {Number} dt the time between updates in ms.
 */
LevelInstance.prototype.update = function(dt) {
    "use strict";


    this.input2D.update();

    this.updatePreLogic(dt);
    // Update the systems before the game.
    this.systems.forEach(function(system) {
        system.preUpdate(dt);
    });

    this.updateLogic(dt);
    // Update the systems after the game.
    this.systems.forEach(function(system) {
        system.update(dt);
    });

    this.updatePostLogic(dt);
    // Clean up the systems.
    this.systems.forEach(function(system) {
        system.cleanup();
    });


    this.entitySystem.flushChanges();
};

/**
 * Destroys the level.
 */
LevelInstance.prototype.destroy = function() {
    "use strict";

    // Run the level end scripts.
    this.gameAPI.hooks.onLevelEnd.call(this.gameAPI);

    this.systems.forEach(function(system) {
        system.destroy();
    });
    this.entitySystem.removeAllEntities();
    this.viewport.removeScene(this.scene);
};

module.exports = LevelInstance;
