/**
 * @author MW
 * Syncs entities with the server.
 * This does not sync actions as those are done outside the server.
 */
var System = require('../../fejs/core/system');
var NetworkComponent = require('./NetworkComponent');

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @param {BaseNetwork} network the network to send data through.
 * @constructor
 * @extends System
 */
function NetworkSystem(entitySystem, network) {
    "use strict";
    System.call(this);

    this.entitySystem = entitySystem;
    this.network = network;
}
NetworkSystem.prototype = Object.create(System.prototype);

NetworkSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(NetworkComponent.type).getAllRaw();
    var id = this.network.getLocalID();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var networkComponent = entity[NetworkComponent.type];
        if (networkComponent.owner === id) {
            // Sync entity data.
        }
    }
};

module.exports = NetworkSystem;