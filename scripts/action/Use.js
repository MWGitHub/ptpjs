/**
 * @author MW
 * Walking action that is usually not synced with the server.
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var Level = require('../../src/client/level/Level');

/**
 * Script for using objects.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends ActionScript
 */
function Use(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
Use.prototype = Object.create(ActionScript.prototype);

Use.prototype.onTrigger = function(entity, action, key) {
    "use strict";

    var collision = entity[CollisionComponent.type];
    if (!collision) return;

    for (var i = 0; i < collision.colliding.length; i++) {
        var collider = this.gameAPI.entitySystem.getEntityByID(collision.colliding[i]);
        if (collider.userData.type === 'zone') {
            this.gameAPI.switchLevel(collider.name);
        }
    }
};

Use.type = 'Use';
module.exports = Use;