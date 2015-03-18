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
 * Main attack for the starter suit.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends ActionScript
 */
function ConeAttack(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
ConeAttack.prototype = Object.create(ActionScript.prototype);

ConeAttack.prototype.onTrigger = function(entity, action) {
    "use strict";

    var entityStats = entity[StatsComponent.type];
    if (!entityStats) return;
    var entityCollision = entity[CollisionComponent.type];
    if (!entityCollision) return;
    var entitySpatial = entity[SpatialComponent.type];
    if (!entitySpatial) return;

    // Create the bullets.
    var startAngle = action.userData.angle || 0;
    var increment = action.userData.increment || 0;
    var shots = action.userData.shots || 0;
    var offsetY = action.userData.offsetY || 0;

    for (var i = 0; i < shots; i++) {
        var shot = action.userData.shot;
        var bullet = this.gameAPI.objectCreator.createFromStore(shot);
        var spatial = bullet[SpatialComponent.type];

        spatial.position.x = entitySpatial.position.x;
        spatial.position.y = entitySpatial.position.y + offsetY;
        // Set the bullet damage.
        var bulletStats = bullet[StatsComponent.type];
        bulletStats.damage = entityStats.damage;
        // Set the bullet movement.
        var angle = startAngle + increment * i;
        angle *= FEMath.DEG_TO_RAD;
        angle = entitySpatial.direction < 0 ? FEMath.PI - angle : angle;
        var movement = bullet[MovementComponent.type];
        movement.speed.x = Math.cos(angle) * bulletStats.maxMoveSpeed.x;
        movement.speed.y = Math.sin(angle) * bulletStats.maxMoveSpeed.y;
        spatial.rotation = angle;
        // Set the bullet collision.
        var bulletCollision = bullet[CollisionComponent.type];
        if (entityCollision.groups.indexOf(CollisionGroups.ALLY) >= 0) {
            // Set the bullet to hit enemies.
            bulletCollision.targetOrGroups.push(CollisionGroups.ENEMY);
        } else {
            // Set the bullet to hit allies.
            bulletCollision.targetOrGroups.push(CollisionGroups.ALLY);
        }
    }

    // Play the shoot sound.
    this.gameAPI.playSound(action.userData.sound);
};

ConeAttack.type = 'ConeAttack';
module.exports = ConeAttack;