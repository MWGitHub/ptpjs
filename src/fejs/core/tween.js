/**
 * Created with IntelliJ IDEA.
 * User: MW
 * Date: 11/30/13
 * Time: 7:56 PM
 * Tween system updating through time steps.
 * Based on https://github.com/sole/tween.js
 */
var Collections = require('../utility/collections');

/**
 * Creates the tween system.
 * @constructor
 */
function TweenSystem() {
    "use strict";

    /**
     * Tweens in the system.
     * Any tween outside of the system will not be updated by the system.
     * @type {Array.<BCG.Tween>}
     */
    this._tweens = [];
}
module.exports.TweenSystem = TweenSystem;

/**
 * Adds a tween to the system.
 * @param {BCG.Tween} tween the tween to add.
 * @param {boolean=} reset true to reset the tween before starting.
 */
TweenSystem.prototype.add = function(tween, reset) {
    "use strict";

    // Reset the tween if needed.
    if (reset) {
        tween.reset();
    }
    // Do not add an already added tween.
    if (Collections.contains(this._tweens, tween)) {
        return;
    }

    // Check if the tween has any incomplete chains.
    if (tween.isComplete) {
        var chain = tween;
        while (chain && chain.isComplete) {
            chain = chain.chainedTween;
            // Add the first incomplete chain it finds.
            if (chain && !chain.isComplete) {
                this._tweens.push(chain);
                break;
            }
        }
    } else {
        this._tweens.push(tween);
    }
};

/**
 * Removes a tween from the system.
 * @param {BCG.Tween} tween the tween to remove.
 */
TweenSystem.prototype.remove = function(tween) {
    "use strict";

    Collections.remove(this._tweens, tween);
};

/**
 * Checks if a tween is in the system.
 * @param {BCG.Tween} tween the tween to check.
 * @returns {boolean} true if the tween is in the system.
 */
TweenSystem.prototype.contains = function(tween) {
    "use strict";

    return Collections.contains(this._tweens, tween);
};

/**
 * Updates all the tweens and removes completed tweens.
 * @param {number} step the amount of time to update in milliseconds.
 */
TweenSystem.prototype.update = function(step) {
    "use strict";

    var i = 0;
    var chainedTweens = [];
    while (i < this._tweens.length) {
        var tween = this._tweens[i];
        tween.update(step);
        if (tween.isComplete) {
            this._tweens.splice(i, 1);
            // Add a chained tween.
            if (tween.chainedTween) {
                chainedTweens.push(tween.chainedTween);
                tween.chainedTween.parent = tween;
            }
        } else {
            i++;
        }
    }
    // Add chained tweens at the end so they do not update on the same update step.
    for (i = 0; i < chainedTweens.length; i++) {
        this.add(chainedTweens[i]);
    }
};

/**
 * Tween for use with the system.
 * @constructor
 */
function Tween() {
    "use strict";

    /**
     * Completion status of the tween.
     * Set to true to stop the tween.
     * @type {boolean}
     */
    this.isComplete = false;

    /**
     * Starting value of the tween.
     * Only change with objects that have the same parameters.
     * @type {Object}
     */
    this._startValues = {};
    /**
     * Ending value of the tween.
     * Only change with objects that have the same parameters.
     * @type {Object}
     */
    this._endValues = {};
    /**
     * Current value of the tween.
     * Only change with objects that have the same parameters.
     * @type {Object}
     */
    this._currentValues = {};

    /**
     * Number of times to repeat.
     * @type {number}
     */
    this.repeat = 0;
    /**
     * Amount of times the tween has already repeated.
     * @type {number}
     */
    this.currentRepeat = 0;

    /**
     * Time before the tween starts.
     * @type {number}
     */
    this.delay = 0;

    /**
     * Duration in milliseconds of the tween.
     * @type {number}
     */
    this.duration = 1000;

    /**
     * Time the tween has been playing.
     * @type {number}
     */
    this.currentDuration = 0;

    /**
     * Function used for easing.
     * @type {function{number}}
     */
    this.easing = Tween.Easing.Linear.None;

    /**
     * Tween of the parent if chained.
     * @type {BCG.Tween}
     */
    this.parent = null;

    /**
     * A tween to be run on completion.
     * @type {BCG.Tween}
     */
    this.chainedTween = null;

    /**
     * Runs when the tween has started.
     * @type {function(BCG.Tween)}
     */
    this.onStartCallback = null;
    /**
     * Runs when the tween has updated.
     * @type {function(BCG.Tween)}
     */
    this.onUpdateCallback = null;
    /**
     * Runs when the tween has completed.
     * @type {function(BCG.Tween)}
     */
    this.onCompleteCallback = null;

    /**
     * Data for the user to use.
     * @dict
     */
    this.userData = {};
}
module.exports.Tween = Tween;

/**
 * Updates the tween.
 * @param {number} step the amount of time to update in milliseconds.
 */
Tween.prototype.update = function(step) {
    "use strict";

    // Do not update completed tweens or invalid tweens.
    if (this.isComplete || !this._startValues || !this._endValues) {
        return;
    }

    // Only call the start callback at the beginning of a tween.
    if (this.currentDuration === 0 && this.onStartCallback) {
        this.onStartCallback(this);
    }

    this.currentDuration += step;
    var delayedTime = this.currentDuration - this.delay;
    // Tween has completed one cycle.
    if (delayedTime >= this.duration) {
        // Set all the values to the end values.
        for (var field in this._endValues) {
            this._currentValues[field] = parseFloat(this._endValues[field]);
        }
        // Tween is fully completed.
        if (this.repeat === 0 || this.currentRepeat >= this.repeat) {
            if (this.onCompleteCallback) {
                this.onCompleteCallback(this);
            }
            this.isComplete = true;
        } else {
            // Tween requires a repeat.
            this.currentRepeat++;
            this.currentDuration = 0;
        }
    }
    // Update the tween.
    if (!this.isComplete) {
        // Only start updating a tween after delay.
        if (delayedTime >= 0) {
            var ratio = delayedTime / this.duration;
            var easedValue = this.easing(ratio);
            // Set all the values to the end values.
            for (var field in this._currentValues) {
                var start = this._startValues[field] || 0;
                var end = this._endValues[field] || 0;
                this._currentValues[field] = start + (end - start) * easedValue;
            }
        }
        if (this.onUpdateCallback) {
            this.onUpdateCallback(this);
        }
    }
};

/**
 * Resets a tween.
 */
Tween.prototype.reset = function() {
    "use strict";
    this.isComplete = false;
    this.currentRepeat = 0;
    this.currentTime = 0;

    if (this._startValues && this._endValues) {
        this.from(this._startValues);
    }
};

/**
 * @returns {Object} the starting values of the tween.
 */
Tween.prototype.getStartValues = function() {
    "use strict";
    return this._startValues;
};
/**
 * @returns {Object} the end values of the tween.
 */
Tween.prototype.getEndValues = function() {
    "use strict";
    return this._endValues;
};
/**
 * @returns {Object} the current values of the tween.
 */
Tween.prototype.getCurrentValues = function() {
    "use strict";
    return this._currentValues;
};

/**
 * Functions to help set up the tween.
 */
Tween.prototype.from = function(startValues) {
    "use strict";
    for (var field in startValues) {
        this._currentValues[field] = parseFloat(startValues[field]);
    }
    this._startValues = startValues;
    return this;
};
Tween.prototype.to = function(endValues) {
    "use strict";
    this._endValues = endValues;
    return this;
};
Tween.prototype.withRepeat = function(times) {
    "use strict";
    this.repeat = times;
    return this;
};
Tween.prototype.withDuration = function(time) {
    "use strict";
    this.duration = time;
    return this;
};
Tween.prototype.withDelay = function(time) {
    "use strict";
    this.delay = time;
    return this;
};
Tween.prototype.withEasing = function(easing) {
    "use strict";
    this.easing = easing;
    return this;
};
Tween.prototype.chain = function(tween) {
    "use strict";
    this.chainedTween = tween;
    return this;
};
Tween.prototype.onStart = function(callback) {
    "use strict";
    this.onStartCallback = callback;
    return this;
};
Tween.prototype.onUpdate = function(callback) {
    "use strict";
    this.onUpdateCallback = callback;
    return this;
};
Tween.prototype.onComplete = function(callback) {
    "use strict";
    this.onCompleteCallback = callback;
    return this;
};

/**
 * Easing functions.
 */
Tween.Easing = {
    Linear: {
        None: function ( k ) {
            "use strict";
            return k;
        }
    },
    Quadratic: {
        In: function ( k ) {
            "use strict";
            return k * k;
        },
        Out: function ( k ) {
            "use strict";
            return k * ( 2 - k );
        },
        InOut: function ( k ) {
            "use strict";
            if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
            return - 0.5 * ( --k * ( k - 2 ) - 1 );
        }
    },
    Cubic: {
        In: function ( k ) {
            "use strict";
            return k * k * k;

        },
        Out: function ( k ) {
            "use strict";
            return --k * k * k + 1;
        },
        InOut: function ( k ) {
            "use strict";
            if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
            return 0.5 * ( ( k -= 2 ) * k * k + 2 );
        }
    },
    Quartic: {
        In: function ( k ) {
            "use strict";
            return k * k * k * k;
        },
        Out: function ( k ) {
            "use strict";
            return 1 - ( --k * k * k * k );
        },

        InOut: function ( k ) {
            "use strict";
            if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
            return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
        }
    },
    Quintic: {
        In: function ( k ) {
            "use strict";
            return k * k * k * k * k;
        },
        Out: function ( k ) {
            "use strict";
            return --k * k * k * k * k + 1;
        },
        InOut: function ( k ) {
            "use strict";
            if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
            return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
        }
    },
    Sinusoidal: {
        In: function ( k ) {
            "use strict";
            return 1 - Math.cos( k * Math.PI / 2 );
        },
        Out: function ( k ) {
            "use strict";
            return Math.sin( k * Math.PI / 2 );
        },
        InOut: function ( k ) {
            "use strict";
            return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
        }
    },
    Exponential: {
        In: function ( k ) {
            "use strict";
            return k === 0 ? 0 : Math.pow( 1024, k - 1 );
        },
        Out: function ( k ) {
            "use strict";
            return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
        },
        InOut: function ( k ) {
            "use strict";
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
            return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
        }
    },
    Circular: {
        In: function ( k ) {
            "use strict";
            return 1 - Math.sqrt( 1 - k * k );
        },
        Out: function ( k ) {
            "use strict";
            return Math.sqrt( 1 - ( --k * k ) );
        },
        InOut: function ( k ) {
            "use strict";
            if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
            return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
        }
    },
    Elastic: {
        In: function ( k ) {
            "use strict";
            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        },
        Out: function ( k ) {
            "use strict";
            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
        },
        InOut: function ( k ) {
            "use strict";
            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
            return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
        }
    },
    Back: {
        In: function ( k ) {
            "use strict";
            var s = 1.70158;
            return k * k * ( ( s + 1 ) * k - s );
        },
        Out: function ( k ) {
            "use strict";
            var s = 1.70158;
            return --k * k * ( ( s + 1 ) * k + s ) + 1;
        },
        InOut: function ( k ) {
            "use strict";
            var s = 1.70158 * 1.525;
            if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
            return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
        }
    },
    Bounce: {
        In: function ( k ) {
            "use strict";
            return 1 - Tween.Easing.Bounce.Out( 1 - k );
        },
        Out: function ( k ) {
            "use strict";
            if ( k < ( 1 / 2.75 ) ) {
                return 7.5625 * k * k;
            } else if ( k < ( 2 / 2.75 ) ) {
                return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
            } else if ( k < ( 2.5 / 2.75 ) ) {
                return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
            } else {
                return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
            }
        },
        InOut: function ( k ) {
            "use strict";
            if ( k < 0.5 ) return Tween.Easing.Bounce.In( k * 2 ) * 0.5;
            return Tween.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;
        }
    }
};