/**
 * @author MW
 * System for updating entities with TextComponent.
 * The system works by updating the display object.
 */
var System = require('../../core/system');
var TextComponent = require('./TextComponent');
var DisplayComponent = require('./DisplayComponent');

/**
 * Creates the system.
 * @param {EntitySystem} entitySystem the entity system to use.
 * @constructor
 * @extends System
 */
function TextSystem(entitySystem) {
    "use strict";
    System.call(this);
    this.entitySystem = entitySystem;

}
TextSystem.prototype = Object.create(System.prototype);

TextSystem.prototype.update = function(dt) {
    "use strict";

    // Update the text properties.
    var entities = this.entitySystem.getEntities(TextComponent.type).getAllRaw();
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var display = entity[DisplayComponent.type];
        if (!display) return;

        var displayable = display.displayable;
        if (!displayable) return;

        var textComponent = entity[TextComponent.type];

        // Update the text.
        if (textComponent.text !== displayable.text) {
            displayable.setText(textComponent.text);
        }

        // Update the style.
        var requiresUpdate = false;
        var font = textComponent.style + ' ' + textComponent.size + 'px ' + textComponent.font;
        if (displayable.style.font !== font) {
            requiresUpdate = true;
        }
        if (displayable.style.fill !== textComponent.fill) requiresUpdate = true;
        if (displayable.style.stroke !== textComponent.stroke) requiresUpdate = true;
        if (displayable.style.strokeThickness !== textComponent.strokeThickness) requiresUpdate = true;
        if (displayable.style.align !== textComponent.align) requiresUpdate = true;
        if (displayable.style.wordWrap !== textComponent.wordWrap) requiresUpdate = true;
        if (displayable.style.wordWrapWidth !== textComponent.wordWrapWidth) requiresUpdate = true;

        if (requiresUpdate) {
            displayable.style.font = font;
            displayable.style.fill = textComponent.fill;
            displayable.style.stroke = textComponent.stroke;
            displayable.style.strokeThickness = textComponent.strokeThickness;
            displayable.style.align = textComponent.align;
            displayable.style.wordWrap = textComponent.wordWrap;
            displayable.style.wordWrapWidth = textComponent.wordWrapWidth;
            displayable.setStyle(displayable.style);
        }
    }
};

module.exports = TextSystem;