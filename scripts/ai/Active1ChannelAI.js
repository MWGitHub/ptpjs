/**
 * @author MW
 * Have the AI constantly channel active action 1 (actions with hotkey of action 1).
 */
var HotKeys = require('../../src/client/HotKeys');
var AIScript = require('../../src/fejs/systems/ai/AIScript');
var ActionComponent = require('../../src/fejs/systems/actions/ActionComponent');

function Active1ChannelAI() {
    "use strict";
    AIScript.call(this);

}
Active1ChannelAI.prototype = Object.create(AIScript.prototype);

Active1ChannelAI.prototype.onStart = function(activeAI) {
    "use strict";

    var entity = activeAI.entity;
    var actionComponent = entity[ActionComponent.type];
    if (!actionComponent) return;

    var actions = actionComponent.actions;
    for (var i = 0; i < actions.length; i++) {
        if (actions[i].hotkey === HotKeys.ACTIVE1) {
            actionComponent.triggerActions.push(i);
        }
    }
};

Active1ChannelAI.prototype.update = function(activeAI) {
    "use strict";
};

Active1ChannelAI.type = 'Active1ChannelAI';
module.exports = Active1ChannelAI;