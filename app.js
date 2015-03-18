/**
 * Main application to enter to game from.
 */

// Check if running in the browser or nw.
var isBrowser = true;
if (process && process.argv.length !== 0) {
    isBrowser = false;
}

var Core = require('./src/fejs/core/core');
var Resources = require('./src/fejs/core/resources');
var PixiRenderer = require('./src/fejs/pixi/PixiLayer');
var Input = require('./src/fejs/core/input');
var Debug = require('./src/fejs/debug/debug');
var DebugGlobals = require('./src/fejs/debug/DebugGlobals');
var Viewport = require('./src/fejs/pixi/viewport');
var Camera = require('./src/fejs/pixi/camera');
var StateSwitcher = require('./src/fejs/core/StateSwitcher');
var Input2D = require('./src/fejs/input/input2d');

var ClientState = require('./src/client/ClientState');
var ServerState = require('./src/server/ServerState');
var MenuState = require('./src/client/MenuState');



// TODO: Fix crash on node-webkit font use before loading.
/**
 * Initializes the game.
 * @param {HTMLElement} window the window to use for creating the canvas.
 * @param {function(Core)} onComplete the callback function to run when initialization is complete.
 * @param {function(Number, Number)} onProgress the callback function for the progress bar.
 */
module.exports.initialize = function(window, onComplete, onProgress) {
    "use strict";

    var resources = new Resources();
    // Loads the resources.
    function loadResources(complete) {
        resources.loadFromResourcesFile('./resources.json', complete);
        if (onProgress) {
            resources.progressCallbacks.push(onProgress);
        }
    }

    // Starts the game.
    function setupEngine() {
        var width = 683, height = 384;

        var core = new Core(window);
        core.stepSize = 16;
        var pixi = new PixiRenderer(window.document.getElementById('game'));
        core.addRenderLayer(pixi);
        var input = new Input(window, pixi.renderer.view);
        var debug = new Debug();
        DebugGlobals.debug = debug;

        var camera = new Camera();
        var viewport = new Viewport(camera, width, height);
        viewport.addTo(pixi.stage);
        viewport.isFloored = false;
        camera.scale.x = 1;
        camera.scale.y = 1;

        // Update the viewport.
        core.addPreRenderCallback(function render(dt) {
            viewport.update();
        });

        // Create and update the game.
        var switcher = new StateSwitcher();
        core.addUpdateCallback(switcher.update.bind(switcher));
        core.addPreRenderCallback(switcher.preRender.bind(switcher));
        core.addPostRenderCallback(switcher.postRender.bind(switcher));
        // Create and enter states.
        var clientState = new ClientState(pixi.stage, viewport, input, resources);
        switcher.addState(clientState);
        var menuState = new MenuState(pixi.stage, viewport, input, resources);
        switcher.addState(menuState);
        // Enter the initial states.
        switcher.enterState(menuState);
        //switcher.enterState(clientState);

        // Add debug info.
        var debugOptions;
        // Frame debug.
        debugOptions = {folder: 'Time', step: 0.05, listen: true};
        var debugTime = {frame: 0, elapsed: 0};
        debug.addControl(debugTime, 'frame', debugOptions);
        debug.addControl(debugTime, 'elapsed', debugOptions);


        // Input debug.
        var input2D = new Input2D(viewport, input);
        var debugInput = {x: 0, y: 0};
        debugOptions = {folder: 'Input', step: 0.05, listen: true};
        debug.addControl(debugInput, 'x', debugOptions);
        debug.addControl(debugInput, 'y', debugOptions);
        var debugMouse = {cx: 0, cy: 0, vx: 0, vy: 0};
        debug.addControl(debugMouse, 'cx', debugOptions);
        debug.addControl(debugMouse, 'cy', debugOptions);
        debug.addControl(debugMouse, 'vx', debugOptions);
        debug.addControl(debugMouse, 'vy', debugOptions);

        // Camera debug.
        debugOptions = {folder: 'Camera', step: 0.05, listen: true};
        debug.addControl(camera.position, 'x', {folder: 'Camera', step: 1, listen: true});
        debug.addControl(camera.position, 'y', {folder: 'Camera', step: 1, listen: true});
        debug.addControl(camera, 'rotation', debugOptions);
        debug.addControl(camera.scale, 'x', {folder: 'Camera', step: 0.05, listen: true, name: 'sx', min: 0.25});
        debug.addControl(camera.scale, 'y', {folder: 'Camera', step: 0.05, listen: true, name: 'sy', min: 0.25});

        // Update the debug info.
        core.addUpdateCallback(function update(dt) {
            input2D.update();
            debugInput.x = input.mouseX;
            debugInput.y = input.mouseY;

            debugMouse.cx = input2D.mouseCanvasPosition.x;
            debugMouse.cy = input2D.mouseCanvasPosition.y;
            debugMouse.vx = input2D.mouseViewPosition.x;
            debugMouse.vy = input2D.mouseViewPosition.y;

            DebugGlobals.frame++;
            DebugGlobals.timeElapsed += dt;
            debugTime.frame = DebugGlobals.frame;
            debugTime.elapsed = DebugGlobals.timeElapsed;
        });

        onComplete(core);
    }

    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    loadResources(setupEngine);
};