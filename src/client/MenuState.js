/**
 * @author MW
 * State for the main menu.
 */

var CoreState = require('../fejs/core/CoreState');
var ViewportScene = require('../fejs/pixi/Viewport').ViewportScene;

/**
 * Creates the menu.
 * @param {PIXI.Stage} stage the stage to attach scenes to.
 * @param {Viewport} viewport the viewport being used.
 * @param {Input} input the input for the game.
 * @param {Resources} resources the resources used for the game and the loader.
 * @constructor
 * @extends CoreState
 */
function MenuState(stage, viewport, input, resources) {
    "use strict";
    CoreState.call(this);

    this.type = 'MenuState';

    /**
     * @type {PIXI.Stage}
     */
    this.stage = stage;
    /**
     * @type {Viewport}
     */
    this.viewport = viewport;
    /**
     * @type {Input}
     */
    this.input = input;
    /**
     * @type {Resources}
     */
    this.resources = resources;

    /**
     * Layer to attach the state objects to.
     * @type {ViewportScene}
     */
    this.scene = new ViewportScene();

    /**
     * Layer to add elements to.
     * @type {PIXI.DisplayObjectContainer}
     */
    this.layer = new PIXI.DisplayObjectContainer();

    this.gridBack = null;

    this.gridFront = null;
}
MenuState.prototype = Object.create(CoreState.prototype);

MenuState.prototype.onEnter = function(params) {
    "use strict";

    this.viewport.camera.position.x = this.viewport.width / 2 / this.viewport.camera.scale.x;
    this.viewport.camera.position.y = this.viewport.height / 2 / this.viewport.camera.scale.y;

    // Create the scene and layer.
    this.scene = new ViewportScene();
    this.viewport.addScene(this.scene);
    this.scene.display.addChild(this.layer);

    var bg = new PIXI.TilingSprite(
        PIXI.Texture.fromImage('./media/images/background/GridBackgroundBack.png'),
        3000, 3000);
    this.layer.addChild(bg);

    this.gridBack = new PIXI.TilingSprite(
        PIXI.Texture.fromImage('./media/images/background/GridBackground.png'),
        3000, 3000);
    this.gridBack.anchor.x = 0.5;
    this.gridBack.anchor.y = 0.5;
    this.layer.addChild(this.gridBack);

    this.gridFront = new PIXI.TilingSprite(
        PIXI.Texture.fromImage('./media/images/background/GridBackgroundMid.png'),
        3000, 3000);
    this.gridFront.anchor.x = 0.5;
    this.gridFront.anchor.y = 0.5;
    this.layer.addChild(this.gridFront);

    var title = new PIXI.Text('Boss Prototype', {
        font: 'bold 48px Arial',
        align: 'center',
        stroke: 'white',
        strokeThickness: 3
    });
    title.anchor.x = 0.5;
    title.anchor.y = 0.5;
    title.scale.x = 0.5;
    title.scale.y = 0.5;
    title.position.x = this.viewport.width / 2 / this.viewport.camera.scale.x;
    title.position.y = this.viewport.height / 6 / this.viewport.camera.scale.y;
    this.layer.addChild(title);

    function mouseOver(e) {
        var button = e.target;
        button.style.fill = 'blue';
        button.setStyle(button.style);
    }
    function mouseOut(e) {
        var button = e.target;
        button.style.fill = 'black';
        button.setStyle(button.style);
    }

    var xOffset = 7;
    // Create the start button.
    var startGameButton = new PIXI.Text('Play', {
        font: 'bold 48px Arial',
        align: 'center',
        stroke: 'white',
        strokeThickness: 3
    });
    startGameButton.anchor.x = 0.5;
    startGameButton.anchor.y = 0.5;
    startGameButton.scale.x = 0.5;
    startGameButton.scale.y = 0.5;
    startGameButton.interactive = true;
    startGameButton.position.x = this.viewport.width / 2 / this.viewport.camera.scale.x + xOffset;
    startGameButton.position.y = 165;
    startGameButton.mouseover = mouseOver;
    startGameButton.mouseout = mouseOut;
    startGameButton.click = (function(e) {
        this.switcher.switchState(this, this.switcher.retrieveState('ClientState'));
    }).bind(this);
    this.layer.addChild(startGameButton);

    // Create the website button.
    var websiteButton = new PIXI.Text('Created by Mike W.', {
        font: 'bold 18px Arial',
        align: 'center',
        stroke: 'white',
        strokeThickness: 3
    });
    websiteButton.anchor.x = 0.5;
    websiteButton.anchor.y = 0.5;
    websiteButton.scale.x = 0.5;
    websiteButton.scale.y = 0.5;
    websiteButton.interactive = true;
    websiteButton.position.x = this.viewport.width / this.viewport.camera.scale.x - 50;
    websiteButton.position.y = this.viewport.height / this.viewport.camera.scale.x - 10;
    websiteButton.mouseover = mouseOver;
    websiteButton.mouseout = mouseOut;
    websiteButton.click = (function(e) {
        window.open('http://www.exploringlines.com','_blank');
    }).bind(this);
    this.layer.addChild(websiteButton);
};

MenuState.prototype.update = function(dt) {
    "use strict";

    this.gridBack.position.x += 0.5;
    this.gridBack.position.y += 0.25;

    if (this.gridBack.position.x >= 64) {
        this.gridBack.position.x -= 64;
    }
    if (this.gridBack.position.y >= 64) {
        this.gridBack.position.y -= 64;
    }

    this.gridFront.position.x += 0.75;
    this.gridFront.position.y += 0.35;

    if (this.gridFront.position.x >= 64) {
        this.gridFront.position.x -= 64;
    }
    if (this.gridFront.position.y >= 64) {
        this.gridFront.position.y -= 64;
    }
};

MenuState.prototype.onLeave = function(params) {
    "use strict";

    this.viewport.removeScene(this.scene);
};

module.exports = MenuState;