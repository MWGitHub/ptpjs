/**
 * @author MW
 */
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var AIDecorator = require('../../src/fejs/systems/ai/AIDecorator');
var AIComponent = require('../../src/fejs/systems/ai/AIComponent');
var ActionComponent = require('../../src/fejs/systems/actions/ActionComponent');
var SpatialComponent = require('../../src/fejs/systems/SpatialComponent');
var CollisionComponent = require('../../src/fejs/systems/physics/CollisionComponent');
var ActionStatus = require('../../src/fejs/systems/actions/ActionSystem').Status;

var CommonAI = {};

/**********************************************************************************
 * Decorators
 **********************************************************************************/

/*******************************************************
 * Decorator for inversing an output.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIDecorator
 *******************************************************/
CommonAI.InverseDecorator = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.InverseDecorator.prototype = Object.create(AIDecorator.prototype);

CommonAI.InverseDecorator.prototype.run = function (entity, ai, behavior, input) {
    "use strict";

    return !input;
};
CommonAI.InverseDecorator.type = 'InverseDecorator';

/**********************************************************************************
 * Conditions
 **********************************************************************************/

/*******************************************************
 * Check if a target is found.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.HasTarget = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.HasTarget.prototype = Object.create(AIScript.prototype);

CommonAI.HasTarget.prototype.update = function (entity, ai, behavior) {
    "use strict";

    return !!ai.behaviors[behavior.target];
};
CommonAI.HasTarget.type = 'HasTarget';

/*******************************************************
 * Check if an action is active.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.IsActionActive = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.IsActionActive.prototype = Object.create(AIScript.prototype);

CommonAI.IsActionActive.prototype.update = function (entity, ai, behavior) {
    "use strict";

    var key = behavior.action;
    var component = entity[ActionComponent.type];
    if (!component) return false;

    if (!component.actions[key]) return false;

    return component.actions[key].isActive;
};
CommonAI.IsActionActive.type = 'IsActionActive';

/*******************************************************
 * Check if a target is colliding with a specified entity.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.IsTargetCollidingWith = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.IsTargetCollidingWith.prototype = Object.create(AIScript.prototype);

CommonAI.IsTargetCollidingWith.prototype.update = function (entity, ai, behavior) {
    "use strict";

    var target = this.gameAPI.getEntityById(ai.behaviors[behavior.target]);
    return this.gameAPI.entIsCollidingWithName(target, behavior.name);
};
CommonAI.IsTargetCollidingWith.type = 'IsTargetCollidingWith';


/**********************************************************************************
 * AI
 **********************************************************************************/

/*******************************************************
 * AI for targeting a player.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.TargetPlayer = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.TargetPlayer.prototype = Object.create(AIScript.prototype);

CommonAI.TargetPlayer.prototype.update = function (entity, ai, behavior) {
    "use strict";

    var x = 0, y = 0;
    var spatial = entity[SpatialComponent.type];
    if (spatial) {
        x = spatial.position.x;
        y = spatial.position.y;
    }

    var target = this.gameAPI.getClosestPlayerCharacter(x, y).id;

    if (!target) return false;

    ai.behaviors[behavior.target] = target;

    return true;
};
CommonAI.TargetPlayer.type = 'TargetPlayer';



/*******************************************************
 * Walk towards a target.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.WalkTarget = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.WalkTarget.prototype = Object.create(AIScript.prototype);

CommonAI.WalkTarget.prototype.update = function (entity, ai, behavior) {
    "use strict";

    var spatial = entity[SpatialComponent.type];
    var target = this.gameAPI.getEntityById(ai.behaviors[behavior.target]);
    var targetSpatial = target[SpatialComponent.type];

    var actions = entity[ActionComponent.type];
    if (!actions) return false;

    if (targetSpatial.position.x < spatial.position.x) {
        actions.triggerActions.push('WalkLeft');
        actions.stopActions.push('WalkRight');
    } else {
        actions.triggerActions.push('WalkRight');
        actions.stopActions.push('WalkLeft');
    }

    return true;
};
CommonAI.WalkTarget.type = 'WalkTarget';

/*******************************************************
 * Makes the script wait while walking.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.WalkWait = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.WalkWait.prototype = Object.create(AIScript.prototype);

CommonAI.WalkWait.prototype.start = function(entity, ai, behavior) {
    "use strict";

    delete behavior.counter;
};

CommonAI.WalkWait.prototype.update = function(entity, ai, behavior) {
    "use strict";

    behavior.isRunning = true;

    if (behavior.counter === undefined || behavior.counter === null) {
        behavior.counter = 0;
    } else {
        behavior.counter += ai.period;
    }
    if (behavior.counter >= behavior.duration) {
        behavior.isRunning = false;
    }
    if (behavior.stopAtWall) {
        var collision = entity[CollisionComponent.type];
        if (collision) {
            if (collision.isCollidingWith.left || collision.isCollidingWith.right) {
                behavior.isRunning = false;
                return false;
            }
        }
    }

    return true;
};

CommonAI.WalkWait.prototype.end = function(entity, ai, behavior) {
    "use strict";

    delete behavior.counter;
};

CommonAI.WalkWait.prototype.cancel = function(entity, ai, behavior) {
    "use strict";

    delete behavior.counter;
    var actions = entity[ActionComponent.type];
    if (actions) {
        actions.stopActions.push('WalkLeft');
        actions.stopActions.push('WalkRight');
    }
};
CommonAI.WalkWait.type = 'WalkWait';

/*******************************************************
 * Makes the AI stop walking.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.WalkStop = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.WalkStop.prototype = Object.create(AIScript.prototype);

CommonAI.WalkStop.prototype.update = function (entity, ai, behavior) {
    "use strict";

    var actions = entity[ActionComponent.type];
    if (actions) {
        actions.stopActions.push('WalkLeft');
        actions.stopActions.push('WalkRight');
    }

    return true;
};
CommonAI.WalkStop.type = 'WalkStop';

/*******************************************************
 * Makes the script wait.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.Wait = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.Wait.prototype = Object.create(AIScript.prototype);

CommonAI.Wait.prototype.start = function(entity, ai, behavior) {
    "use strict";

    delete behavior.counter;
};

CommonAI.Wait.prototype.update = function(entity, ai, behavior) {
    "use strict";

    behavior.isRunning = true;

    if (behavior.counter === undefined || behavior.counter === null) {
        behavior.counter = 0;
    } else {
        behavior.counter += ai.period;
    }
    if (behavior.counter >= behavior.duration) {
        behavior.isRunning = false;
    }

    return true;
};

CommonAI.Wait.prototype.end = function(entity, ai, behavior) {
    "use strict";

    delete behavior.counter;
};
CommonAI.Wait.type = 'Wait';;

/*******************************************************
 * Makes the AI cast an action.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.Cast = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.Cast.prototype = Object.create(AIScript.prototype);

CommonAI.Cast.prototype.start = function(entity, ai, behavior) {
    "use strict";

    this.gameAPI.entCastAction(entity, behavior.action);

    if (behavior.requireComplete) {
        behavior.isCasting = false;
        behavior.isRunning = true;
    }
};

CommonAI.Cast.prototype.update = function(entity, ai, behavior) {
    "use strict";

    if (!behavior.requireComplete) return true;

    if (behavior.isCasting) {
        var action = this.gameAPI.entGetAction(entity, behavior.action);
        if (action.status !== ActionStatus.Running) {
            behavior.isRunning = false;
        }
    }

    behavior.isCasting = true;

    return true;
};
CommonAI.Cast.type = 'Cast';

/*******************************************************
 * Makes the AI direction face the target.
 * @param {GameAPI} gameAPI the game API to use.
 * @constructor
 * @extends AIScript
 *******************************************************/
CommonAI.FaceTarget = function(gameAPI) {
    "use strict";
    AIScript.call(this);
    this.gameAPI = gameAPI;
};
CommonAI.FaceTarget.prototype = Object.create(AIScript.prototype);

CommonAI.FaceTarget.prototype.update = function (entity, ai, behavior) {
    "use strict";

    var spatial = entity[SpatialComponent.type];
    var target = this.gameAPI.getEntityById(ai.behaviors[behavior.target]);
    var targetSpatial = target[SpatialComponent.type];

    if (targetSpatial.position.x < spatial.position.x) {
        spatial.direction = -1;
    } else {
        spatial.direction = 1;
    }

    return true;
};
CommonAI.FaceTarget.type = 'FaceTarget';

module.exports = CommonAI;
module.exports.type = CommonAI.type;