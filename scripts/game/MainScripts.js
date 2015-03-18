/**
 * @author MW
 * Main scripts for the game.
 */

var BodyComponent = require('../../src/fejs/systems/physics/BodyComponent');
var ChildComponent = require('../../src/fejs/systems/ChildComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var DisplayComponent = require('../../src/fejs/systems/display/DisplayComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var ScriptsComponent = require('../../src/client/systems/ScriptsComponent');
var SfxComponent = require('../../src/fejs/systems/display/SfxComponent');
var TextComponent = require('../../src/fejs/systems/display/TextComponent');
var TimeComponent = require('../../src/client/systems/TimeComponent');
var TileTypes = require('../../src/client/Level/Level').TileTypes;
var Level = require('../../src/client/level/Level');
var FEMath = require('../../src/fejs/utility/math');
var Random = require('../../src/fejs/utility/Random');
var Collections = require('../../src/fejs/utility/collections');

/**
 * Creates the main scripts and adds the scripts to the API.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 */
function MainScripts(gameAPI) {
    "use strict";

    /**
     * Game API to use with scripts.
     * @type {GameAPI}
     */
    this.gameAPI = gameAPI;

    // Add all the scripts to the game API and systems.
    MainScripts.addActions(this.gameAPI);
    MainScripts.addAI(this.gameAPI);
    MainScripts.addScripts(this.gameAPI);
}

/**
 * Adds actions to the API.
 * @param {GameAPI} gameAPI the game API to add actions to.
 */
MainScripts.addActions = function(gameAPI) {
    "use strict";

    // Load the action scripts.
    var actionSystem = gameAPI.actionSystem;

    var Jump = require('../action/Jump');
    actionSystem.addScript(Jump.type, new Jump(gameAPI));
    var WallJump = require('../action/WallJump');
    actionSystem.addScript(WallJump.type, new WallJump(gameAPI));
    var Turn = require('../action/Turn');
    actionSystem.addScript(Turn.type, new Turn(gameAPI));
    var Walk = require('../action/Walk');
    actionSystem.addScript(Walk.type, new Walk(gameAPI));
    var Sway = require('../action/Sway');
    actionSystem.addScript(Sway.type, new Sway(gameAPI));
    var Run = require('../action/Run');
    actionSystem.addScript(Run.type, new Run(gameAPI));
    var Use = require('../action/Use');
    actionSystem.addScript(Use.type, new Use(gameAPI));
    var Shoot = require('../action/Shoot');
    actionSystem.addScript(Shoot.type, new Shoot(gameAPI));
    var Fly = require('../action/Fly');
    actionSystem.addScript(Fly.type, new Fly(gameAPI));
    var Hop = require('../action/Hop');
    actionSystem.addScript(Hop.type, new Hop(gameAPI));
    var DropDown = require('../action/DropDown');
    actionSystem.addScript(DropDown.type, new DropDown(gameAPI));
    var Charge = require('../action/Charge');
    actionSystem.addScript(Charge.type, new Charge(gameAPI));
    var ConeAttack = require('../action/ConeAttack');
    actionSystem.addScript(ConeAttack.type, new ConeAttack(gameAPI));
    var Enrage = require('../action/Enrage');
    actionSystem.addScript(Enrage.type, new Enrage(gameAPI));
};

/**
 * Adds AI to the API.
 * @param {GameAPI} gameAPI the API to add the AI to.
 */
MainScripts.addAI = function(gameAPI) {
    "use strict";

    // Load the AI scripts.
    var aiSystem = gameAPI.aiSystem;

    var Active1Channel = require('../../scripts/ai/Active1ChannelAI');
    aiSystem.addScript(Active1Channel.type, new Active1Channel(gameAPI));
    var ZombieAI = require('../../scripts/ai/ZombieAI');
    aiSystem.addScript(ZombieAI.type, new ZombieAI(gameAPI));
    var PatrolDropAI = require('../../scripts/ai/PatrolDropAI');
    aiSystem.addScript(PatrolDropAI.type, new PatrolDropAI(gameAPI));
    var TargetRadiusAI = require('../../scripts/ai/TargetRadiusAI');
    aiSystem.addScript(TargetRadiusAI.type, new TargetRadiusAI(gameAPI));
    var ActiveTriggerAI = require('../../scripts/ai/ActiveTriggerAI');
    aiSystem.addScript(ActiveTriggerAI.type, new ActiveTriggerAI());
    var WispAI = require('../../scripts/ai/WispAI');
    aiSystem.addScript(WispAI.type, new WispAI(gameAPI));
    var SkeletonAI = require('../../scripts/ai/SkeletonAI');
    aiSystem.addScript(SkeletonAI.type, new SkeletonAI(gameAPI));

    var CommonAI = require('../ai/CommonAI');
    aiSystem.addScript(CommonAI.InverseDecorator.type, new CommonAI.InverseDecorator(gameAPI));

    aiSystem.addScript(CommonAI.HasTarget.type, new CommonAI.HasTarget(gameAPI));
    aiSystem.addScript(CommonAI.IsActionActive.type, new CommonAI.IsActionActive(gameAPI));
    aiSystem.addScript(CommonAI.IsTargetCollidingWith.type, new CommonAI.IsTargetCollidingWith(gameAPI));

    aiSystem.addScript(CommonAI.TargetPlayer.type, new CommonAI.TargetPlayer(gameAPI));
    aiSystem.addScript(CommonAI.WalkTarget.type, new CommonAI.WalkTarget(gameAPI));
    aiSystem.addScript(CommonAI.WalkWait.type, new CommonAI.WalkWait(gameAPI));
    aiSystem.addScript(CommonAI.WalkStop.type, new CommonAI.WalkStop(gameAPI));
    aiSystem.addScript(CommonAI.Wait.type, new CommonAI.Wait(gameAPI));
    aiSystem.addScript(CommonAI.FaceTarget.type, new CommonAI.FaceTarget(gameAPI));
    aiSystem.addScript(CommonAI.Cast.type, new CommonAI.Cast(gameAPI));
};

/**
 * Adds scripts to the API.
 * @param {GameAPI} gameAPI the API to add scripts to.
 */
MainScripts.addScripts = function(gameAPI) {
    "use strict";

    function bodyCollide(entity, targets) {
        var stats = entity[StatsComponent.type];
        if (!stats) return;

        for (var j = 0; j < targets.length; j++) {
            var damaged = gameAPI.damage(targets[j], stats.damage, entity, true);
            if (!damaged) return;

            // Apply force to the target.
            var spatial = entity[SpatialComponent.type];
            if (!spatial) continue;
            gameAPI.applyForcePlane(targets[j], spatial.position, stats.force, true, false);
        }
    }

    function regionSpawnStart(entity, targets) {
        var time = entity[TimeComponent.type];
        if (!time) return;

        var period = entity.userData.period || 1000;

        for (var i = 0; i < time.timers.length; i++) {
            var timer = time.timers[i];
            timer.duration = period;
        }
    }
    function regionSpawnStop(entity, targets) {
        var time = entity[TimeComponent.type];
        if (!time) return;


        for (var i = 0; i < time.timers.length; i++) {
            var timer = time.timers[i];
            timer.duration = Number.MAX_VALUE;
        }
    }
    function regionSpawnObject(entity) {
        var spatial = entity[SpatialComponent.type];
        if (!spatial) return;

        var objectName = entity.userData.object;
        if (!objectName) return;

        // Spawn at the region instead of the triggering region.
        var id = entity.userData[Level.ObjectData.MapId];
        var idEntity = id ? gameAPI.getEntityByName(id) : null;
        var body = null;
        if (id && idEntity) {
            body = idEntity[BodyComponent.type];
        } else {
            body = entity[BodyComponent.type];
        }

        var spawnedObject = gameAPI.objectCreator.createFromStore(objectName);


        // Try to spawn at a random location within the region or else the center.
        if (body && body.shapes.length > 0 && body.shapes[0].box) {
            var shape = body.shapes[0];
            var width = shape.box.width;
            var height = shape.box.height;
            var x = shape.position.x - width / 2 + Random.pickRandomFloat() * width;
            var y = shape.position.y - height / 2 + Random.pickRandomFloat() * height;
            gameAPI.entSetPosition(spawnedObject, x, y);
        } else {
            gameAPI.entSetPosition(spawnedObject, spatial.position.x, spatial.position.y);
        }
    }

    function removeOnTileCollide(entity, tileInfo) {
        for (var i = 0; i < tileInfo.length; i++) {
            var info = tileInfo[i];
            if (info.index === TileTypes.Static) {
                gameAPI.entitySystem.removeEntity(entity);
            }
        }
    }

    function playerDeath(entity, killer) {
        var x = gameAPI.globals[MainScripts.Keys.SpawnX];
        var y = gameAPI.globals[MainScripts.Keys.SpawnY];

        if (x && y) {
            gameAPI.entSetPosition(entity, x, y);
        }
        gameAPI.entStopMovement(entity);
        gameAPI.revive(entity);

        gameAPI.switchLevel('prototype-v03');
    }

    function timedLifeExpire(entity) {
        gameAPI.entitySystem.removeEntity(entity);
    }

    function removeOnCollide(entity, targets) {
        gameAPI.entitySystem.removeEntity(entity);
    }

    function removeOnDeath(entity, killer) {
        gameAPI.entitySystem.removeEntity(entity);
    }

    function zone1BossUpdate(entity, dt) {
        if (entity.userData.bossKilled) {
            return;
        }

        var boss = null;
        var entities = gameAPI.entitySystem.getEntities(SpatialComponent.type).getAllRaw();
        for (var i = 0; i < entities.length; i++) {
            var element = entities[i];
            if (element.userData[Level.ObjectData.MapId] === 'boss') {
                boss = element;
            }
        }
        if (!boss) {
            gameAPI.removeTile(31, 8);
            gameAPI.removeTile(31, 9);
            entity.userData.bossKilled = true;
        }
    }

    function zone1Start(entity) {
        gameAPI.removeTile(8, 8);
        gameAPI.removeTile(8, 9);

        // Find the boss entity.
        var boss = null;
        var entities = gameAPI.entitySystem.getEntities(SpatialComponent.type).getAllRaw();
        for (var i = 0; i < entities.length; i++) {
            var element = entities[i];
            if (element.userData[Level.ObjectData.MapId] === 'boss') {
                boss = element;
            }
        }
        gameAPI.statusDisplaySystem.bossEntity = boss;
    }

    function zone1End(entity) {

    }

    function justLand(entity) {
    }

    function hurtOnCollide(entity, targets) {
        var stats = entity[StatsComponent.type];
        if (!stats) return;

        gameAPI.damage(entity, stats.hitPoints, targets[0]);
    }

    function checkpointCollide(entity, targets) {
        // Turn off all other checkpoints and turn on the colliding one.
        var checkpoints = gameAPI.getEntitiesByProperty('type', './media/data/objects/checkpoint.json');
        for (var i = 0; i < checkpoints.length; i++) {
            var checkpoint = checkpoints[i];
            var display = checkpoint[DisplayComponent.type];
            if (!display) continue;

            if (checkpoint !== entity) {
                display.data.texture = './media/images/objects/CheckpointOff.png';
            } else {
                display.data.texture = './media/images/objects/CheckpointOn.png';
            }
            gameAPI.entitySystem.setComponent(checkpoint, DisplayComponent.type, display);
        }

        // Player touching checkpoint updates the spawn location.
        var spatial = entity[SpatialComponent.type];
        if (spatial && Collections.contains(targets, gameAPI.playerCharacters[0].id)) {
            gameAPI.globals[MainScripts.Keys.SpawnX] = spatial.position.x;
            gameAPI.globals[MainScripts.Keys.SpawnY] = spatial.position.y;
            gameAPI.createFadingText(spatial.position.x, spatial.position.y, 'Checkpoint Stored');
        }
    }

    function trinketCollide(entity, targets) {
        // Count all the trinkets in the game.
        var trinkets = gameAPI.getEntitiesByProperty('type', './media/data/objects/trinket.json');

        var progress = gameAPI.getEntityByName('progressText');
        var text = progress[TextComponent.type];
        if (text) {
            var found = gameAPI.globals[MainScripts.Keys.TrinketCount] - (trinkets.length - 1);
            text.text = found + ' of ' + gameAPI.globals[MainScripts.Keys.TrinketCount] + ' trinkets found.';
        }

        gameAPI.removeEntity(entity);
    }

    /**
     * Updates the time for a billboard.
     * @param {Entity} billboard the billboard entity,
     * @param {Number} time the time to set.
     */
    function updateBillboardTime(billboard, time) {
        var children = billboard[ChildComponent.type];

        if (children && children.children.length > 0) {
            var child = gameAPI.entitySystem.getEntityByID(children.children[0]);
            var text = child[TextComponent.type];
            if (text) {
                text.text = 'Timer\n' + FEMath.msToTime(time);
            }
        }
    }

    function stage1Start(entity) {
        // Set the initial spawn as the checkpoint.
        var character = gameAPI.playerCharacters[0];
        var spatial = character[SpatialComponent.type];

        if (spatial) {
            gameAPI.globals[MainScripts.Keys.SpawnX] = spatial.position.x;
            gameAPI.globals[MainScripts.Keys.SpawnY] = spatial.position.y;
        }

        // Set the initial state of the stage timer.
        gameAPI.globals[MainScripts.Keys.IsStageTimerActive] = false;
        gameAPI.globals[MainScripts.Keys.StageTimer] = 0;

        updateBillboardTime(gameAPI.entitySystem.getEntityByName('StartingBillboard'), 0);
        updateBillboardTime(gameAPI.entitySystem.getEntityByName('EndingBillboard'), 0);
    }

    function stage1Update(entity) {
        // Update the stage timer.
        var isActive = gameAPI.globals[MainScripts.Keys.IsStageTimerActive];

        if (isActive) {
            gameAPI.globals[MainScripts.Keys.StageTimer] += gameAPI.timePerFrame;

            updateBillboardTime(gameAPI.entitySystem.getEntityByName('StartingBillboard'),
                gameAPI.globals[MainScripts.Keys.StageTimer]);
            updateBillboardTime(gameAPI.entitySystem.getEntityByName('EndingBillboard'),
                gameAPI.globals[MainScripts.Keys.StageTimer]);
        }
    }

    function regionTimerStart(entity) {
        gameAPI.globals[MainScripts.Keys.IsStageTimerActive] = true;
        gameAPI.globals[MainScripts.Keys.StageTimer] = 0;

        updateBillboardTime(gameAPI.entitySystem.getEntityByName('StartingBillboard'), 0);
        updateBillboardTime(gameAPI.entitySystem.getEntityByName('EndingBillboard'), 0);
    }

    function regionTimerStop(entity) {
        gameAPI.globals[MainScripts.Keys.IsStageTimerActive] = false;
    }

    function regionCameraEnter(entity) {
        var position = entity[SpatialComponent.type].position;
        var width = entity.userData.width;
        var height = entity.userData.height;

        gameAPI.followerCamera.left = position.x - width / 2;
        gameAPI.followerCamera.right = position.x + width / 2;
        gameAPI.followerCamera.top = position.y - height / 2;
        gameAPI.followerCamera.bottom = position.y + height / 2;

        gameAPI.cameraInstantFollow();
    }

    function regionCameraLeave(entity) {
        if (gameAPI.entIsCollidingWithType(entity, 'Hero')) {
            return;
        }

        gameAPI.followerCamera.left = 0;
        gameAPI.followerCamera.top = 0;
        gameAPI.followerCamera.right = gameAPI.level.width * gameAPI.level.tileWidth;
        gameAPI.followerCamera.bottom = gameAPI.level.height * gameAPI.level.tileHeight;
    }

    function regionWarpEnter(entity, targets) {
        var locationName = entity.userData.location;
        var location = gameAPI.getEntityByName(locationName);

        if (location) {
            var spatial = location[SpatialComponent.type];
            if (spatial) {
                for (var i = 0; i < targets.length; i++) {
                    var target = gameAPI.getEntityById(targets[i]);
                    gameAPI.entSetPosition(target, spatial.position.x, spatial.position.y);
                    gameAPI.entStopMovement(target);
                }
            }
        }
    }

    function chargerLevelStart(entity) {
        gameAPI.statusDisplaySystem.bossEntity = entity;
    }

    function debrisOnCollide(entity, targets) {
        var spatial = entity[SpatialComponent.type];
        if (!spatial) return;

        var spread = 250;
        var density = 5;
        gameAPI.createPointParticles('./media/data/particles/bullet-remove-particle.json',
            spatial.position.x, spatial.position.y, spread, density);
    }

    function chargerDeath(entity, killer) {
        gameAPI.removeEntity(entity);

        var spatial = entity[SpatialComponent.type];
        if (!spatial) return;

        var text = gameAPI.createObject('./media/data/objects/victory-text.json');
        gameAPI.entSetPosition(text, spatial.position.x, spatial.position.y);
        gameAPI.textSetString(text, 'Game Complete!');
    }

    gameAPI.addScript('BodyAttack', bodyCollide);
    gameAPI.addScript('PlayerDeath', playerDeath);
    gameAPI.addScript('RemoveOnCollide', removeOnCollide);
    gameAPI.addScript('RemoveOnTileCollide', removeOnTileCollide);
    gameAPI.addScript('RemoveOnDeath', removeOnDeath);
    gameAPI.addScript('TimedLifeExpire', timedLifeExpire);
    gameAPI.addScript('RegionSpawnStart', regionSpawnStart);
    gameAPI.addScript('RegionSpawnStop', regionSpawnStop);
    gameAPI.addScript('RegionSpawnObject', regionSpawnObject);
    gameAPI.addScript('Zone-1-1-BossUpdate', zone1BossUpdate);
    gameAPI.addScript('Zone-1-1-Start', zone1Start);
    gameAPI.addScript('LandAnimation', justLand);
    gameAPI.addScript('HurtOnCollide', hurtOnCollide);
    gameAPI.addScript('checkpointCollide', checkpointCollide);
    gameAPI.addScript('trinketCollide', trinketCollide);
    gameAPI.addScript('Stage-1-Start', stage1Start);
    gameAPI.addScript('Stage-1-Update', stage1Update);
    gameAPI.addScript('RegionTimerStart', regionTimerStart);
    gameAPI.addScript('RegionTimerStop', regionTimerStop);
    gameAPI.addScript('RegionCameraEnter', regionCameraEnter);
    gameAPI.addScript('RegionCameraLeave', regionCameraLeave);
    gameAPI.addScript('RegionWarpEnter', regionWarpEnter);
    gameAPI.addScript('ChargerLevelStart', chargerLevelStart);
    gameAPI.addScript('DebrisOnCollide', debrisOnCollide);
    gameAPI.addScript('ChargerDeath', chargerDeath);
};

MainScripts.Keys = {
    SpawnX: 'SpawnX',
    SpawnY: 'SpawnY',
    TrinketCount: 'TrinketCount',
    StageTimer: 'StageTimer',
    StageRecord: 'StageRecord',
    IsStageTimerActive: 'IsStageTimerActive'
};

module.exports = MainScripts;