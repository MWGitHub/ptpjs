/**
 * @author MW
 * Hopping action that is usually not synced with the server.
 * Makes the character hop in a given direction using their movement speed and jump height.
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var SpeedSystem = require('../../src/fejs/systems/physics/SpeedSystem');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var AnimationComponent = require('../../src/fejs/systems/display/AnimationComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');

var Random = require('../../src/fejs/utility/Random');

function Hop(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Hop.prototype = Object.create(ActionScript.prototype);

Hop.prototype.onAdd = function(entity, action, key) {
    "use strict";

    action.userData.groundCounter = 0;
    action.userData.jumps = 0;
};

function createParticles(gameAPI, entity, action) {
    "use strict";

    if (!action.userData.particle) return;

    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var aabb = entity[AABBComponent.type];
    if (!aabb) return;

    var x = spatial.position.x;
    var y = spatial.position.y;

    x -= aabb.width / 2;
    y += aabb.height / 2;

    var density = action.userData.density || 1;
    for (var i = 0; i < aabb.width / density; i++) {
        var particle = gameAPI.createObject(action.userData.particle);
        if (!particle) return;
        var particleStats = particle[StatsComponent.type];
        particleStats.gravity.x = Random.pickRandomFloat() * 2 - 1;
        particleStats.gravity.y = Random.pickRandomFloat() * 0.5 - 0.25;
        gameAPI.entSetPosition(particle, x, y);
        gameAPI.entSetRotation(particle, Random.pickRandomFloat() * Math.PI * 2);

        x += density;
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

Hop.prototype.onStart = function(entity, action, key) {
    "use strict";

    action.userData.windupCounter = 0;
    this.gameAPI.entPlayAnimation(entity, action.userData.animation);
};

Hop.prototype.onActive = function(entity, action, key) {
    "use strict";

    action.userData.windupCounter += action.timePerFrame;
    var windupTime = action.userData.windupTime || 0;
    if (action.userData.windupCounter < windupTime) {
        return;
    }

    var movement = entity[MovementComponent.type];
    if (!movement) return;
    var stats = entity[StatsComponent.type];
    if (!stats) return;
    var collision = entity[CollisionComponent.type];
    if (!collision) return;
    var spatial = entity[SpatialComponent.type];
    if (!spatial) return;

    var speedMultilpier = action.userData.speedMultiplier || 1;
    var speed = movement.speed;
    var acceleration = movement.acceleration;
    var statsMax = stats.maxMoveSpeed;
    var statsAcc = stats.acceleration;

    var direction = action.userData.direction || spatial.direction;

    // Only allow hopping when on the floor or else accelerate in the hop direction.
    if (!collision.isCollidingWith.bottom) {
        // Move the entity with the maximum manual walk speed.
        acceleration.x += SpeedSystem.addAcceleration(statsMax.x * speedMultilpier, speed.x * speedMultilpier,
            acceleration.x * speedMultilpier, statsAcc.x * speedMultilpier * direction);

        // No friction when moving.
        movement.calculatedFriction.x = 0;
    } else {
        action.userData.groundCounter += action.timePerFrame;
        var groundCooldown = action.userData.groundCooldown || 0;
        var timesToJump = action.userData.timesToJump || Number.MAX_VALUE;
        // Make the entity jump when cooldown is completed.
        if (action.userData.jumps >= timesToJump) {
            if (action.userData.quakeSound) {
                this.gameAPI.playSound(action.userData.quakeSound);
            }
            this.gameAPI.cameraShake(-25, 25, -25, 25);
            this.gameAPI.entStopAction(entity, key);
            // Create the dust particles.
            createParticles(this.gameAPI, entity, action);
        } else if (action.userData.groundCounter >= groundCooldown) {
            acceleration.y += stats.jumpAcceleration;
            action.userData.groundCounter = 0;
            action.userData.jumps += 1;
        }
    }

    // Flip the entity if needed.
    if (spatial && action.userData.flip && action.userData.direction) {
        spatial.direction = direction;
    }

    // Play the walking animation.
    this.gameAPI.entStopAnimation(entity);
};

Hop.prototype.onStop = function(entity, action, key) {
    "use strict";

    this.gameAPI.entStopAnimation(entity);

    action.userData.jumps = 0;
    action.userData.groundCounter = 0;
};

Hop.type = 'Hop';
module.exports = Hop;