/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var StatsComponent = require('../../src/client/objects/StatsComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var MovementComponent = require('../../src/fejs/systems/physics/MovementComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var CollisionGroups = require('../../src/client/objects/CollisionGroups');
var FEMath = require('../../src/fejs/utility/math');
var Random = require('../../src/fejs/utility/Random');

/**
 * Shot attack that can shoot in random angles.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends ActionScript
 */
function Shoot(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Shoot.prototype = Object.create(ActionScript.prototype);

Shoot.prototype.onTrigger = function(entity, action) {
    "use strict";

    if (!action.userData.shots) {
        action.userData.shots = [];
    }

    var entityStats = entity[StatsComponent.type];
    if (!entityStats) return;
    var entityCollision = entity[CollisionComponent.type];
    if (!entityCollision) return;
    var entitySpatial = entity[SpatialComponent.type];
    if (!entitySpatial) return;

    // Check for entities that are removed.
    for (var i = 0; i < action.userData.shots.length; i++) {
        var shotEntity = action.userData.shots[i];
        if (!this.gameAPI.hasEntityById(shotEntity)) {
            action.userData.shots.splice(i, 1);
            i--;
        }
    }

    // Don't allow another shot if already over maximum.
    var maxShots = action.userData.maxShots || 0;
    if (maxShots > 0 && action.userData.shots.length >= maxShots) {
        return;
    }

    // Create the bullet.
    var shot = action.userData.shot;
    var bullet = this.gameAPI.objectCreator.createFromStore(shot);
    var spatial = bullet[SpatialComponent.type];
    var offsetX = action.userData.offsetX || 0;
    var offsetY = action.userData.offsetY || 0;
    if (entitySpatial.direction < 0) offsetX *= -1;

    spatial.position.x = entitySpatial.position.x + offsetX;
    spatial.position.y = entitySpatial.position.y;
    // Set the bullet damage.
    var bulletStats = bullet[StatsComponent.type];
    bulletStats.damage = entityStats.damage;
    // Set the bullet movement.
    var minAngle = action.userData.minAngle || 0;
    var maxAngle = action.userData.maxAngle || 0;
    var angle = minAngle + Random.pickRandomFloat() * (maxAngle - minAngle) || 0;
    angle *= FEMath.DEG_TO_RAD;
    angle = entitySpatial.direction < 0 ? FEMath.PI - angle : angle;
    var movement = bullet[MovementComponent.type];
    movement.speed.x = Math.cos(angle) * bulletStats.maxMoveSpeed.x;
    movement.speed.y = Math.sin(angle) * bulletStats.maxMoveSpeed.y;
    // Set the bullet facing direction.
    if (movement.speed.x < 0) {
        spatial.scale.x = -1;
    }
    // Set the bullet collision.
    var bulletCollision = bullet[CollisionComponent.type];
    if (entityCollision.groups.indexOf(CollisionGroups.ALLY) >= 0) {
        // Set the bullet to hit enemies.
        bulletCollision.targetOrGroups.push(CollisionGroups.ENEMY);
    } else {
        // Set the bullet to hit allies.
        bulletCollision.targetOrGroups.push(CollisionGroups.ALLY);
    }
    action.userData.shots.push(bullet.id);

    // Create particles.
    if (action.userData.particle) {
        var spread = action.userData.particleSpread || 0;
        var density = action.userData.particleDensity || 0;
        this.gameAPI.createPointParticles(action.userData.particle,
            spatial.position.x + offsetX, spatial.position.y + offsetY, spread, density);
    }

    // Play the shoot sound.
    this.gameAPI.playSound(action.userData.sound);
};

Shoot.type = 'Shoot';
module.exports = Shoot;