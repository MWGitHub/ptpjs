/**
 * @author MW
 * System for updating AI.
 */
var System = require('../../core/system');
var AIComponent = require('./AIComponent');
var Collections = require('../../utility/collections');

/**
 * Node types for behaviors.
 * @type {{random: string, priority: string, sequence: string, concurrent: string}}
 */
AISystem.BehaviorTypes = {
    // Chooses a random child, stops on success, continues on fail, skips to running.
    random: 'random',
    // Chooses the first child, stops on success, continues on fail, ignores running.
    priority: 'priority',
    // Chooses the first child, continues on success, stops on fail, skips to running.
    sequence: 'sequence',
    // Chooses every child, continues on success, continues on fail, ignores running.
    concurrent: 'concurrent',
    // Modifies the return value of the child. Only one child per decorator.
    decorator: 'decorator'
};

/**
 * Represents a behavior.
 * A behavior can have other parameters as custom fields.
 * @constructor
 */
function Behavior() {
    "use strict";

    /**
     * Type of behavior.
     * @type {BehaviorTypes}
     */
    this.type = null;

    /**
     * Script to run for the behavior.
     * Scripts are ignored if the node has children.
     * @type {String}
     */
    this.script = null;

    /**
     * Children of the behavior node.
     * This is not used for actions.
     * @type {Array.<Behavior>}
     */
    this.children = [];

    /**
     * Flag for if the behavior is running.
     * A complete flag is unneeded as searching for the running node can already do that.
     * The action must set and unset the running flag as needed.
     * @type {boolean}
     */
    this.isRunning = false;

    /**
     * Flag for if the node should cancel running actions when successful.
     * Only used for priority nodes.
     * @type {boolean}
     */
    this.cancelsRunning = true;

    /**
     * Flag for if the node should skip to running nodes.
     * Sequences always follows running.
     * @type {boolean}
     */
    this.followsRunning = true;
}

function AISystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

    /**
     * True to show debug messages for the AI.
     * @type {boolean}
     */
    this.showDebug = true;

    /**
     * Scripts that can be run.
     * @type {Object.<String, AIScript|AIDecorator>}
     */
    this.scripts = {};

    var es = entitySystem.getEntities(AIComponent.type);
}
AISystem.prototype = Object.create(System.prototype);

/**
 * Clears all running nodes on a tree.
 * @param {Entity} entity the checked entity.
 * @param {AI} ai the AI being run.
 * @param {Behavior} behavior the behavior tree to clear.
 */
AISystem.prototype.clearRunning = function(entity, ai, behavior) {
    "use strict";

    // This will only be run when the given behavior is an action and
    // outside of the normal update phase.
    if (behavior.isRunning && behavior.script) {
        var script = this.scripts[behavior.script];
        if (script) {
            script.cancel(entity, ai, behavior);
        }
    }

    behavior.isRunning = false;
    // Clear all children behavior.
    if (behavior.children) {
        for (var i = 0; i < behavior.children.length; i++) {
            if (behavior.children[i].isRunning) {
                this.clearRunning(entity, ai, behavior.children[i]);
            }
        }
    }
};

/**
 * Check behaviors through a stack.
 * @param {Entity} entity the checked entity.
 * @param {AI} ai the AI being run.
 * @param {Behavior} behavior the behavior tree to update.
 * @return {Boolean} true if successful, false if not.
 */
AISystem.prototype.checkBehaviorTree = function(entity, ai, behavior) {
    "use strict";

    var type = behavior.type;
    // Node type behavior.
    if (type) {
        if (this.showDebug) {
            console.log('Running node of type %s.', type);
        }
        var i, runningIndex, result;
        var children = behavior.children;
        switch (type) {
            case AISystem.BehaviorTypes.random:
                // Check for running children.
                if (behavior.followsRunning) {
                    for (i = 0; i < children.length; i++) {
                        if (children[i].isRunning) {
                            result = this.checkBehaviorTree(entity, ai, children[i]);
                            behavior.isRunning = children[i].isRunning;
                            if (result) {
                                return result;
                            }
                        }
                    }
                }
                // Choose a random child if no nodes are running.
                var indices = [].concat(behavior.children);
                Collections.shuffle(indices);
                for (i = 0; i < indices.length; i++) {
                    result = this.checkBehaviorTree(entity, ai, indices[i]);
                    behavior.isRunning = indices[i].isRunning;
                    if (result) {
                        return result;
                    }
                }
                break;
            case AISystem.BehaviorTypes.priority:
                if (behavior.followsRunning) {
                    // Check for any running nodes.
                    runningIndex = -1;
                    for (i = 0; i < children.length; i++) {
                        if (children[i].isRunning) {
                            runningIndex = i;
                            break;
                        }
                    }
                    runningIndex = runningIndex === -1 ? 0 : runningIndex;
                    for (i = runningIndex; i < children.length; i++) {
                        result = this.checkBehaviorTree(entity, ai, children[i]);
                        behavior.isRunning = children[i].isRunning;
                        if (result) {
                            return result;
                        } else if (behavior.isRunning && behavior.cancelsRunning) {
                            this.clearRunning(entity, ai, behavior);
                        }
                        if (behavior.isRunning) return true;
                    }
                } else {
                    for (i = 0; i < children.length; i++) {
                        result = this.checkBehaviorTree(entity, ai, children[i]);
                        // Reset running nodes if traversed into a successful non-running node.
                        if (result && behavior.isRunning && behavior.cancelsRunning) {
                            this.clearRunning(entity, ai, behavior);
                        }
                        behavior.isRunning = children[i].isRunning;
                        if (result) {
                            return result;
                        }
                    }
                }
                break;
            case AISystem.BehaviorTypes.sequence:
                // Check for any running nodes.
                runningIndex = -1;
                for (i = 0; i < children.length; i++) {
                    if (children[i].isRunning) {
                        runningIndex = i;
                        break;
                    }
                }
                runningIndex = runningIndex === -1 ? 0 : runningIndex;
                for (i = runningIndex; i < children.length; i++) {
                    result = this.checkBehaviorTree(entity, ai, children[i]);
                    behavior.isRunning = children[i].isRunning;
                    if (!result) {
                        return false;
                    }
                    if (behavior.isRunning) return true;
                }
                return true;
            case AISystem.BehaviorTypes.concurrent:
                for (i = 0; i < children.length; i++) {
                    result = this.checkBehaviorTree(entity, ai, children[i]);
                    behavior.isRunning = children[i].isRunning;
                }
                return true;
            case AISystem.BehaviorTypes.decorator:
                var child = children[0];
                if (!child) return false;
                result = this.checkBehaviorTree(entity, ai, child);
                behavior.isRunning = child.isRunning;
                var decoratorScript = this.scripts[behavior.script];
                if (this.showDebug) {
                    console.log('Attempting to run decorator %s.', behavior.script);
                }
                if (decoratorScript) {
                    return decoratorScript.run(entity, ai, behavior, result);
                } else {
                    return result;
                }
                break;
            default:
                return false;
        }
    } else {
        // Action type behavior.
        if (this.showDebug) {
            console.log('Attempting to run %s.', behavior.script);
        }
        var script = this.scripts[behavior.script];
        var status = false;
        if (script) {
            if (!behavior.isRunning) {
                script.start(entity, ai, behavior);
            }
            var previousRunning = behavior.isRunning;
            status = script.update(entity, ai, behavior);
            // If the behavior was running before and is no longer running cancel it.
            if (previousRunning && !behavior.isRunning) {
                script.cancel(entity, ai, behavior);
            }
            if (!behavior.isRunning) {
                script.end(entity, ai, behavior);
            }
        } else {
            console.warn(behavior.script + ' not found.');
        }
        return status;
    }

    return false;
};

AISystem.prototype.update = function(dt) {
    "use strict";

    var entitySet = this.entitySystem.getEntities(AIComponent.type);

    // Update all the scripts.
    var entities = entitySet.getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var component = entity[AIComponent.type];

        // Update each behavior tree.
        for (var j = 0; j < component.scripts.length; j++) {
            var ai = component.scripts[j];

            ai.duration += dt;
            ai.counter += dt;
            ai.period = ai.counter;
            if (ai.counter >= ai.rate) {
                var behaviors = ai.behaviors;
                if (this.showDebug) {
                    console.log('Running scripts for %s.', entity.id);
                }
                this.checkBehaviorTree(entity, ai, behaviors);

                ai.counter = 0;
            }
        }
        component.shouldRebuild = false;
    }
};

AISystem.prototype.addScript = function(key, script) {
    "use strict";
    this.scripts[key] = script;
};

module.exports = AISystem;