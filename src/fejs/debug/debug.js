var Collections = require('../utility/collections');

/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 11/13/13
 * Time: 11:30 AM
 * To change this template use File | Settings | File Templates.
 */
function Debug() {
    "use strict";

    /**
     * Debug GUI.
     * @type {dat.GUI}
     */
    this.gui = new dat.GUI();

    /**
     * Folders for the gui.
     * @dict
     */
    this.folders = {};

    // Create a default folder.
    this.folders.Debug = this.gui.addFolder('Debug');
    this.folders.Debug.open();
}

/**
 * User created global debug values.
 * @dict
 */
Debug.Globals = {};

/**
 * Adds a control to the gui.
 * @param {*} object the object containing the variable.
 * @param {string} variable the name of the variable.
 * @param {Object} options the folder to place the control in.
 * options = {
 *  folder: String,
 *  listen: Boolean,
 *  step: Number,
 *  min: Number,
 *  max: Number,
 *  name: String
 * }
 */
Debug.prototype.addControl = function(object, variable, options) {
    "use strict";
    var folder;
    options = options || {};
    if (!options.folder) {
        folder = this.folders.Debug;
    } else {
        if (!Collections.objectContainsKey(this.folders, options.folder)) {
            this.folders[options.folder] = this.gui.addFolder(options.folder);
        }
        folder = this.folders[options.folder];
        folder.open();
    }
    var controller = folder.add(object, variable);
    if (options.name) controller.name(options.name);
    if (options.min) controller.min(options.min);
    if (options.max) controller.max(options.max);
    if (options.step) controller.step(options.step);
    if (options.listen) controller.listen();
};

module.exports = Debug;