/**
 * @author MW
 * System for animating characters.
 * Animations are set on character creation and not on the animation component.
 */
var System = require('../../core/system');
var DisplayComponent = require('./DisplayComponent');
var AnimationComponent = require('./AnimationComponent');

function AnimationSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

}
AnimationSystem.prototype = Object.create(System.prototype);

/**
 * Updates a sprite's animation.
 * @param {Number} dt the time per frame.
 * @param {Entity} entity the entity to update.
 */
AnimationSystem.prototype.updateSprite = function(dt, entity) {
    "use strict";

    var display = entity[DisplayComponent.type].displayable;
    if (!display) return;

    var aniCom = entity[AnimationComponent.type];
    if (!aniCom) return;

    var aniData = aniCom.animations[aniCom.currentAnimation];
    var texture = null;

    // Update the animation.
    // Only allow valid animations.
    if (aniData) {
        var timePerFrame = aniData.timePerFrame;
        // Animation is completed, no need to update.
        if (!aniData.loop && aniCom.currentTime > aniData.frames.length * timePerFrame) {
            aniCom.stopAnimation = true;
        }

        // Update the displayed image if needed.
        source = aniData.frames[Math.floor(aniCom.currentTime / timePerFrame) % aniData.frames.length];
        texture = PIXI.Texture.fromImage(source);
        display.setTexture(texture);
        aniCom.currentTime += dt;
    }


    // Switch or play animations if needed.
    if (!aniCom.stopAnimation && aniCom.currentAnimation !== aniCom.playAnimation) {
        // Only allow a valid animation to be played.
        var playedAnimation = aniCom.animations[aniCom.playAnimation];
        if (playedAnimation) {
            aniData = playedAnimation;
            var allowedPriority = aniData.priority === undefined ||
                aniData.priority === null ||
                aniData.priority >= aniCom.currentPriority;
            if (allowedPriority) {
                aniCom.currentAnimation = aniCom.playAnimation;
                aniCom.currentPriority = aniData.priority || 0;
                aniCom.currentTime = aniCom.startTime;
            }
        }
    }
    // Stop animations if needed.
    if (aniCom.stopAnimation && aniData) {
        aniCom.currentAnimation = null;
        aniCom.currentPriority = 0;

        // Find the texture to stop at.
        var stopTexture = aniData.stopTexture || aniCom.stopTexture;
        var source = null;
        if (stopTexture) {
            source = stopTexture;
        } else {
            var stopFrame = aniData.stopFrame >= 0 ? aniData.stopFrame : aniCom.stopFrame;
            if (stopFrame >= 0) {
                source = aniData.frames[stopFrame];
            }
        }
        if (source) {
            texture = PIXI.Texture.fromImage(source);
            display.setTexture(texture);
        }
    }
};

AnimationSystem.prototype.update = function(dt) {
    "use strict";

    var entities = this.entitySystem.getEntities(AnimationComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var display = entity[DisplayComponent.type];
        if (!display) continue;
        display = display.displayable;

        if (display instanceof PIXI.Sprite) {
            this.updateSprite(dt, entity);
        }
    }
};

AnimationSystem.prototype.cleanup = function() {
    "use strict";

    var entities = this.entitySystem.getEntities(AnimationComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var animationComponent = entity[AnimationComponent.type];

        animationComponent.playAnimation = null;
        animationComponent.stopAnimation = false;
    }
};

module.exports = AnimationSystem;