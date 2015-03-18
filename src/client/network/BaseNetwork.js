/**
 * @author MW
 * Base network class for both the server and client.
 */

/**
 * Represents a message.
 * @typedef {{
 *  id: Number,
 *  peer: String,
 *  time: Number,
 *  data: Object,
 * }}
 */
var Message;

function BaseNetwork() {
    "use strict";

    /**
     * Callback that runs when the connection is opened.
     * The ID or IP is the callback parameter.
     * @type {Function(String)}
     */
    this.openCallback = null;

    /**
     * Callback that runs when a peer connects (Only valid for servers).
     * The ID or IP is the callback parameter.
     * @type {Function(String)}
     */
    this.connectCallback = null;

    /**
     * Callback that runs when a message is received.
     * @type {Function(Message)}
     */
    this.receiveCallback = null;

    /**
     * Callback that runs when a connection is lost.
     * The lost peer ID or IP is the callback parameter.
     * @type {Function(String)}
     */
    this.connectionLostCallback = null;

    /**
     * Callback that runs when the connection is closed.
     * @type {Function()}
     */
    this.closeCallback = null;
}

/**
 * Starts the network to allow listening for connections.
 * @param {String=} peer the ip, peer id, or null depending on the configuration.
 */
BaseNetwork.prototype.start = function(peer) {
    "use strict";
};

/**
 * Connects to a server.
 * @param {String=} peer the ip or peer id to connect to depending on the configuration.
 */
BaseNetwork.prototype.connect = function(peer) {
    "use strict";
};

/**
 * Sends a message.
 * @param {Object} data the data to send.
 */
BaseNetwork.prototype.sendMessage = function(data) {
    "use strict";
};

/**
 * Updates the network and sends messages when ready.
 * @param {number} dt time between updates.
 */
BaseNetwork.prototype.update = function(dt) {
    "use strict";
};

/**
 * Closes the connection.
 */
BaseNetwork.prototype.close = function() {
    "use strict";
};

/**
 * @returns {Boolean} true if the local peer connection is open.
 */
BaseNetwork.prototype.isOpen = function() {
    "use strict";
    return false;
};

/**
 * @returns {String} the id of the local network.
 */
BaseNetwork.prototype.getLocalID = function() {
    "use strict";
    return null;
};

/**
 * @returns {Array.<Message>} received messages.
 */
BaseNetwork.prototype.getReceivedMessages = function() {
    "use strict";
    return [];
};

/**
 * Removes all the queued messages.
 */
BaseNetwork.prototype.flushSendMessages = function() {
    "use strict";
};

/**
 * Removes received messages.
 */
BaseNetwork.prototype.flushReceivedMessages = function() {
    "use strict";
};

/**
 * Creates a message.
 * Messages do not have to follow this format.
 * @param {String} type the type of message.
 * @param {Object=} values the values for the message.
 * @param {Object=} options options for the message when sending.
 * @returns {Object} the message.
 */
BaseNetwork.createMessage = function(type, values, options) {
    "use strict";
    var userValues = values || {};
    return {type: type, values: userValues, options: options};
};

module.exports = BaseNetwork;