var isBrowser = true;
if (process && process.argv.length !== 0) {
    isBrowser = false;
}

/**
 * Initializes the main updating loop.
 * @param {Window} window the window to use for updating the frame.
 * @constructor
 */
function Core(window) {
    "use strict";

    /**
     * Cross platform request animation frame.
     * @type {*|Function}
     */
    this.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };

    var instance = this;

    /**
     * Size of each update step or keep zero to make it variable.
     * @type {number}
     */
    this.stepSize = 0;

    /**
     * Rendering layers.
     * @type {Array.<RenderLayer>}
     */
    var renderLayers = [];

    /**
     * Called when the logic updates.
     * @type {Array.<function(number)>}
     */
    var onUpdate = [];

    /**
     * Called before the renderer updates.
     * @type {Array.<function(number)>}
     */
    var onPreRender = [];

    /**
     * Called after the renderer updates.
     * @type {Array.<function(number)>}
     */
    var onPostRender = [];

    /**
     * True to run the loop.
     * @type {boolean}
     */
    var isRunning = false;

    /**
     * Last logic update time.
     * @type {number}
     */
    var lastTime = 0;

    /**
     * Callbacks for the beginning of the update loop.
     * @type {Array.<Function(Number)>}
     */
    var beginCallbacks = [];
    /**
     * Callbacks for the end of the update loop.
     * @type {Array.<Function(Number)>}
     */
    var endCallbacks = [];

    /**
     * Renders the scene.
     * @param {Number} dt time between updates.
     */
    function render(dt) {
        onPreRender.forEach(function(element) {
            element(dt);
        });
        renderLayers.forEach(function(element) {
            element.render(dt);
        });
        onPostRender.forEach(function(element) {
            element(dt);
        });
    }

    /**
     * Updates the game.
     * @param {number} dt the time step of the update.
     */
    function update(dt) {
        onUpdate.forEach(function(element) {
            element(dt);
        });
    }

    /**
     * Updates the game logic and renders the scene.
     */
    function gameLoop() {
        if (!isRunning) {
            return;
        }

        var now = Date.now();
        var dt = (now - lastTime);

        var i;
        // Update the loop depending on if it is the browser or node-webkit.
        if (isBrowser) {
            if (instance.stepSize) {
                dt = instance.stepSize;
            }

            // Run the loop begin callbacks.
            for (i = 0; i < beginCallbacks.length; i++) {
                beginCallbacks[i](dt);
            }

            update(dt);
            render(dt);

            // Run the loop end callbacks.
            for (i = 0; i < beginCallbacks.length; i++) {
                endCallbacks[i](dt);
            }

            lastTime = now;
        } else if (dt >= 1000 / 60) {
            if (instance.stepSize) {
                dt = instance.stepSize;
            }

            // Run the loop begin callbacks.
            for (i = 0; i < beginCallbacks.length; i++) {
                beginCallbacks[i](dt);
            }

            update(dt);
            render(dt);

            // Run the loop end callbacks.
            for (i = 0; i < beginCallbacks.length; i++) {
                endCallbacks[i](dt);
            }

            lastTime = now;
        }

        if (isBrowser) {
            requestAnimFrame(gameLoop);
        } else {
            setImmediate(gameLoop);
        }
    }

    /**
     * Starts the game.
     */
    this.start = function() {
        isRunning = true;
        lastTime = Date.now();
        gameLoop();
    };

    /**
     * Stops the game.
     */
    this.stop = function() {
        isRunning = false;
    };

    /**
     * Resizes each rendering layer.
     * @param {Number} width the width to resize the renderers.
     * @param {Number} height the height to resize the renderers.
     */
    this.resize = function(width, height) {
        renderLayers.forEach(function(element) {
            element.resize(width, height);
        });
    };

    /**
     * Add and remove render layers.
     */
    this.addRenderLayer = function(layer) {
        renderLayers.push(layer);
    };
    this.removeRenderLayer = function(layer) {
        var index = onPostRender.indexOf(layer);
        if (index > -1) {
            renderLayers.splice(index, 1);
        }
    };
    /**
     * Add and remove callbacks from the arrays.
     */
    this.addUpdateCallback = function(cb) {
        onUpdate.push(cb);
    };
    this.removeUpdateCallback = function(cb) {
        var index = onUpdate.indexOf(cb);
        if (index > -1) {
            onUpdate.splice(index, 1);
        }
    };
    this.addPreRenderCallback = function(cb) {
        onPreRender.push(cb);
    };
    this.removePreRenderCallback = function(cb) {
        var index = onPostRender.indexOf(cb);
        if (index > -1) {
            onPreRender.splice(index, 1);
        }
    };
    this.addPostRenderCallback = function(cb) {
        onPostRender.push(cb);
    };
    this.removePostRenderCallback = function(cb) {
        var index = onPostRender.indexOf(cb);
        if (index > -1) {
            onPostRender.splice(index, 1);
        }
    };
    /**
     * Add and remove callbacks for beginning and end of an update loop.
     */
    this.addBeginCallback = function(cb) {
        beginCallbacks.push(cb);
    };
    this.removeBeginCallback = function(cb) {
        var index = beginCallbacks.indexOf(cb);
        if (index > -1) {
            beginCallbacks.splice(index, 1);
        }
    };
    this.addEndCallback = function(cb) {
        endCallbacks.push(cb);
    };
    this.removeEndCallback = function(cb) {
        var index = endCallbacks.indexOf(cb);
        if (index > -1) {
            endCallbacks.splice(index, 1);
        }
    };

    /**
     * Retrieves if the core is running.
     * @returns {boolean}
     */
    this.getIsRunning = function() {
        return isRunning;
    };
}

module.exports = Core;