/**
 * @author MW
 */
var ActionScript = require('../../src/fejs/systems/actions/ActionScript');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var TileType = require('../../src/fejs/systems/physics/TileColliderSystem').TileTypes;
var AABBComponent = require('../../src/fejs/systems/physics/AABBComponent');

function DropDown(gameAPI) {
    "use strict";
    ActionScript.call(this);

    this.gameAPI = gameAPI;
}
DropDown.prototype = Object.create(ActionScript.prototype);

DropDown.prototype.onAdd = function(activeAction) {
    "use strict";
};

DropDown.prototype.onUpdate = function(activeAction) {
    "use strict";
};

DropDown.prototype.onTrigger = function(activeAction) {
    "use strict";
};

DropDown.prototype.onStart = function(activeAction) {
    "use strict";

    var entity = activeAction.entity;
    if (!entity) return;

    // Check if entity can pass through one way tiles.
    var spatial = entity[SpatialComponent.type];
    if (spatial) {
        var aabb = entity[AABBComponent.type];
        if (aabb) {
            var index = this.gameAPI.getStaticTileAtPoint(aabb.center.x, aabb.center.y + aabb.height / 2 + 1);
            if (index === TileType.OneWayTop ||
                index === TileType.OneWayBottom ||
                index === TileType.OneWayCenter) {
                spatial.position.y++;
            }
        }
    }
};

DropDown.prototype.onActive = function(activeAction) {
    "use strict";
};

DropDown.prototype.onStop = function(activeAction) {
    "use strict";
};

DropDown.type = 'DropDown';
module.exports = DropDown;