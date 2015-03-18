/**
 * Causes the entity to charge in a direction.
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var ModiferSystem = require('../../src/client/objects/ModifierSystem');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');
var Random = require('../../src/fejs/utility/Random');

/**
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends ActionScript
 */
function Charge(gameAPI) {
    "use strict";
    ActionScript.call(this);

    /**
     * Game API to use.
     * @type {GameAPI}
     */
    this.gameAPI = gameAPI;
}
Charge.prototype = Object.create(ActionScript.prototype);

/**
 * Runs even when the action is added to the entity.
 * @param {Entity} entity the entity casting the action.
 * @param {Action} action the active action.
 */
Charge.prototype.onAdd = function (entity, action) {
    "use strict";

};

/**
 * Runs even when the action is not triggered or channeled.
 * @param {Entity} entity the entity casting the action.
 * @param {Action} action the active action.
 */
Charge.prototype.onUpdate = function (entity, action) {
    "use strict";

};

/**
 * Runs when the action is first triggered or when channeling is complete.
 * Analog actions that are not channeled are always first triggered.
 * @param {Entity} entity the entity casting the action.
 * @param {Action} action the active action.
 */
Charge.prototype.onTrigger = function (entity, action) {
    "use strict";

    action.userData.windupCounter = 0;
};

/**
 * Runs when the action is first channeled.
 * @param {Entity} entity the entity casting the action.
 * @param {Action} action the active action.
 */
Charge.prototype.onStart = function (entity, action) {
    "use strict";

    action.userData.windupCounter = 0;

    var animation = action.userData.animation;
    if (animation) {
        this.gameAPI.entPlayAnimation(entity, animation);
    }
};

function createParticles(gameAPI, entity, action, direction) {
    "use strict";

    if (!action.userData.particle) return;

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var aabb = entity[AABBComponent.type];
    if (!aabb) return;

    var x = spatial.position.x;
    var y = spatial.position.y;

    if (direction < 0) {
        x -= aabb.width / 2;
    } else {
        x += aabb.width / 2;
    }
    y -= aabb.height / 2;

    var density = action.userData.density || 1;
    var i;
    for (i = 0; i < aabb.height / density; i++) {
        var particle = gameAPI.createObject(action.userData.particle);
        if (!particle) return;
        var particleStats = particle[StatsComponent.type];
        particleStats.gravity.x = Random.pickRandomFloat() * 2 - 1;
        particleStats.gravity.y = Random.pickRandomFloat() * 0.5 - 0.25;
        gameAPI.entSetPosition(particle, x, y);
        gameAPI.entSetRotation(particle, Random.pickRandomFloat() * Math.PI * 2);

        y += density;
    }

    // Create falling debris
    var debrisSpawn = gameAPI.getEntityByName(action.userData.debrisSpawn);
    if (debrisSpawn) {
        var debrisAmount = action.userData.debrisDensity || 0;
        for (i = 0; i < debrisAmount; i++) {
            var position = gameAPI.getRandomPointInRegion(debrisSpawn);
            var debris = gameAPI.createObject('./media/data/hazards/falling-debris.json');
            gameAPI.entSetPosition(debris, position.x, position.y);
        }
    }
}

/**
 * Runs when the action is channeled each frame.
 * @param {Entity} entity the entity casting the action.
 * @param {Action} action the active action.
 * @param {String} key the key of the action.
 */
Charge.prototype.onActive = function (entity, action, key) {
    "use strict";

    action.userData.windupCounter += action.timePerFrame;
    var windupTime = action.userData.windupTime || 0;
    if (action.userData.windupCounter < windupTime) {
        return;
    }

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var movement = entity[MovementComponent.type];
    if (!movement) return;

    var stats = entity[StatsComponent.type];
    if (!stats) return;

    var max = ModiferSystem.getField(entity, 'maxMoveSpeed.x', stats.maxMoveSpeed.x);
    movement.speed.x = spatial.direction * action.userData.multiplier * max;

    // Stop on wall hit.
    var collision = entity[CollisionComponent.type];
    if (!collision) return;

    var shake = action.userData.shakeAmount || 0;
    if (spatial.direction < 0) {
        if (collision.isCollidingWith.left) {
            this.gameAPI.entStopAction(entity, key);
            this.gameAPI.cameraShake(-shake, shake, -shake, shake);
            if (action.userData.quakeSound) {
                this.gameAPI.playSound(action.userData.quakeSound);
            }
            // Show collision particle.
            createParticles(this.gameAPI, entity, action, spatial.direction);
        }
    } else {
        if (collision.isCollidingWith.right) {
            this.gameAPI.entStopAction(entity, key);
            this.gameAPI.cameraShake(-shake, shake, -shake, shake);
            if (action.userData.quakeSound) {
                this.gameAPI.playSound(action.userData.quakeSound);
            }
            // Show collision particle.
            createParticles(this.gameAPI, entity, action, spatial.direction);
        }
    }
};

/**
 * Runs when the channeling is stopped before completion.
 * @param {Entity} entity the entity casting the action.
 * @param {Action} action the active action.
 */
Charge.prototype.onStop = function (entity, action) {
    "use strict";

    action.userData.windupCounter = 0;

    this.gameAPI.entStopAnimation(entity);
};

Charge.type = 'Charge';
module.exports = Charge;
module.exports.type = Charge.type;