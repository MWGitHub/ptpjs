/**
 * @author MW
 */

var BaseNetwork = require('./BaseNetwork');

/**
 * Creates the local server.
 * @constructor
 * @extends BaseNetwork
 */
function LocalClient() {
    "use strict";
    BaseNetwork.call(this);

    /**
     * Sends messages every few milliseconds.
     * @type {number}
     */
    this.sendRate = 32;

    /**
     * Timer for sending messages.
     * @type {number}
     * @private
     */
    this._currentTimer = 0;

    /**
     * True to listen for messages.
     * @type {boolean}
     * @private
     */
    this._listening = true;

    /**
     * Server to connect to.
     * @type {LocalServer}
     */
    this.server = null;

    /**
     * Messages to send on the next send.
     * @type {Array}
     * @private
     */
    this._sendMessageQueue = [];

    /**
     * Received messages.
     * @type {Array}
     * @private
     */
    this._receivedMessages = [];
}
LocalClient.prototype = Object.create(BaseNetwork.prototype);

/**
 * Starts the network to allow listening for connections.
 * @param {String=} peer the ip, peer id, or null depending on the configuration.
 */
LocalClient.prototype.start = function(peer) {
    "use strict";

    this._listening = true;
    if (this.openCallback) {
        this.openCallback();
    }
};

/**
 * Sends a message by placing it in the queue.
 * @param {Object} data the data to send.
 */
LocalClient.prototype.sendMessage = function(data) {
    "use strict";
    this._sendMessageQueue.push(data);
};

/**
 * Simulates receiving a message as the callback will not be used automatically this way.
 * @param {Message} message the message to receive.
 */
LocalClient.prototype.receiveMessage = function(message) {
    "use strict";

    this._receivedMessages.push(message);
    if (this.receiveCallback) {
        this.receiveCallback(message);
    }
};

/**
 * Updates the network and sends messages when ready.
 * @param {number} dt time between updates.
 */
LocalClient.prototype.update = function(dt) {
    "use strict";

    this._currentTimer += dt;
    if (this._currentTimer >= this.sendRate) {
        this._currentTimer = 0;
        // Send messages to the server.
        if (this.server) {
            for (var i = 0; i < this._sendMessageQueue.length; i++) {
                var message = this._sendMessageQueue[i];
                this.server.receiveMessage(message);
            }
        }

        this.flushSendMessages();
    }
};

/**
 * Closes the connection.
 */
LocalClient.prototype.close = function() {
    "use strict";
    this._listening = false;
    if (this.closeCallback) {
        this.closeCallback();
    }
};

/**
 * @returns {Boolean} true if the local peer connection is open.
 */
LocalClient.prototype.isOpen = function() {
    "use strict";
    return this._listening;
};

/**
 * @returns {Array.<Message>} received messages.
 */
LocalClient.prototype.getReceivedMessages = function() {
    "use strict";
    return this._receivedMessages;
};

/**
 * Removes all the queued messages.
 */
LocalClient.prototype.flushSendMessages = function() {
    "use strict";
    this._sendMessageQueue = [];
};

/**
 * Removes received messages.
 */
LocalClient.prototype.flushReceivedMessages = function() {
    "use strict";
    this._receivedMessages = [];
};

module.exports = LocalClient;