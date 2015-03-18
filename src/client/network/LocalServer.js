/**
 * @author MW
 * A local server for single player mode.
 * Peers can only be local peers.
 */

var BaseNetwork = require('./BaseNetwork');
/**
 * Creates the local server.
 * @constructor
 * @extends BaseNetwork
 */
function LocalServer() {
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
     * Peers connected to the server.
     * @type {Array.<LocalClient>}
     */
    this.peers = [];

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
LocalServer.prototype = Object.create(BaseNetwork.prototype);

/**
 * Starts the network to allow listening for connections.
 * @param {String=} peer the ip, peer id, or null depending on the configuration.
 */
LocalServer.prototype.start = function(peer) {
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
LocalServer.prototype.sendMessage = function(data) {
    "use strict";
    this._sendMessageQueue.push(data);
};

/**
 * Simulates receiving a message as the callback will not be used automatically this way.
 * @param {Message} message the message to receive.
 */
LocalServer.prototype.receiveMessage = function(message) {
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
LocalServer.prototype.update = function(dt) {
    "use strict";

    this._currentTimer += dt;
    if (this._currentTimer >= this.sendRate) {
        this._currentTimer = 0;
        // Send messages to all peers.
        for (var i = 0; i < this._sendMessageQueue.length; i++) {
            var message = this._sendMessageQueue[i];
            for (var j = 0; j < this.peers.length; j++) {
                var peer = this.peers[j];
                peer.receiveMessage(message);
            }
        }
        this.flushSendMessages();
    }
};

/**
 * Closes the connection.
 */
LocalServer.prototype.close = function() {
    "use strict";
    this._listening = false;
    if (this.closeCallback) {
        this.closeCallback();
    }
};

/**
 * @returns {Boolean} true if the local peer connection is open.
 */
LocalServer.prototype.isOpen = function() {
    "use strict";
    return this._listening;
};

/**
 * @returns {Array.<Message>} received messages.
 */
LocalServer.prototype.getReceivedMessages = function() {
    "use strict";
    return this._receivedMessages;
};

/**
 * Removes all the queued messages.
 */
LocalServer.prototype.flushSendMessages = function() {
    "use strict";
    this._sendMessageQueue = [];
};

/**
 * Removes received messages.
 */
LocalServer.prototype.flushReceivedMessages = function() {
    "use strict";
    this._receivedMessages = [];
};

module.exports = LocalServer;