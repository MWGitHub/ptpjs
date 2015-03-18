/**
 * @author MW
 * Globals for debugging.
 */
var DebugGlobals = {
    /**
     * Debug to hook into dat gui.
     */
    debug: null,

    /**
     * Number of frames since the start of the game.
     */
    frame: 0,

    /**
     * Time elapsed since the start of the game.
     */
    timeElapsed: 0,

    /**
     * Variables to store (only use this for debugging).
     */
    variables: {}
};


module.exports = DebugGlobals;

global.DebugGlobals = DebugGlobals;