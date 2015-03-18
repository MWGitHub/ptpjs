/**
 * Pads zeroes into a number for time use.
 * @param {Number} input the number to pad.
 * @returns {string} the input as a string with padding if needed.
 */
function timePadZeroes(input) {
    "use strict";

    if (input < 10) {
        return '0' + input.toString();
    }

    return input.toString();
}

/**
 * Provides measurement units for 2D and 3D scenes.
 * For 2D the units relate to pixels.
 */
module.exports = {
    /**
     * Number of units per meter for the game.
     * @type {number}
     */
    UnitsPerMeter: 100,

    /**
     * Number of units per centimeter.
     * @type {number}
     */
    UnitsPerCentimeter: 1,

    /**
     * Default value to make a zero variable a float.
     * Used to force dat.gui to display numbers as floats.
     * @type {number}
     */
    DefaultFloat: 0.001,

    /**
     * Amount to multiply to convert radians to degrees.
     * This is an estimated amount.
     * @type {number}
     */
    RAD_TO_DEG: 57.2957795,

    /**
     * Amount to multiply to convert degrees to radians.
     * This is an estimated amount.
     * @type {number}
     */
    DEG_TO_RAD: 0.01745329,

    /**
     * Estimated PI amount.
     * @type {number}
     */
    PI: Math.PI,

    /**
     * Clamp a number.
     * @param {Number} number the number to clamp.
     * @param {Number} min the minimum value.
     * @param {Number} max the maximum value.
     * @returns {number}
     */
    clamp: function(number, min, max) {
        "use strict";
        return Math.min(Math.max(number, min), max);
    },

    /**
     * Calculates the distance between two points.
     * @param {Number} x1 the first x point.
     * @param {Number} y1 the first y point.
     * @param {Number} x2 the second x point.
     * @param {Number} y2 the second y point.
     * @returns {number} the distance between two points.
     */
    calcDistancePoints: function(x1, y1, x2, y2) {
        "use strict";

        var xd = x1 - x2;
        var yd = y1 - y2;
        return Math.sqrt(xd * xd + yd * yd);
    },

    /**
     * Calculates the non square rooted distance between two points.
     * @param {Number} x1 the first x point.
     * @param {Number} y1 the first y point.
     * @param {Number} x2 the second x point.
     * @param {Number} y2 the second y point.
     * @returns {number} the non square rooted distance between two points.
     */
    calcDistancePointsNoRoot: function(x1, y1, x2, y2) {
        "use strict";

        var xd = x1 - x2;
        var yd = y1 - y2;
        return xd * xd + yd * yd;
    },

    /**
     * Converts milliseconds to hh:mm:ss format.
     * @param {Number} input the milliseconds to convert.
     * @returns {string}
     */
    msToTime: function(input) {
        "use strict";

        var time = input;

        time = (input - time % 1000) / 1000;
        var seconds = time % 60;

        time = (time - seconds) / 60;
        var minutes = time % 60;

        var hours = (time - minutes) / 60;

        return timePadZeroes(hours) + ':' + timePadZeroes(minutes) + ':' + timePadZeroes(seconds);
    },

    /**
     * Retrieves the sign of a number or 0 if invalid.
     * @param {Number} v the input to get the sign of.
     * @returns {number} the sign with -1 for negative numbers, 1 as positive, and 0 for invalid.
     */
    getSign: function(v) {
        "use strict";

        if (!v) return 0;

        return v < 0 ? -1 : 1;
    }
};