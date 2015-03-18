/**
 * @author MW
 * Handles loading of resources.
 * Loaded resources that PIXI can handle will be cached as the path.
 */

var Collections = require('./../utility/collections');
function Resources() {
    "use strict";

    /**
     * Paths for data that the PIXI.AssetLoader can load.
     * @type {Array}
     */
    this.images = [];

    /**
     * Sprite sheets to parse.
     * @type {Array.<{
     *     name: String,
     *     texture: String,
     *     width: Number,
     *     height: Number
     * }>}
     */
    this.spritesheets = [];

    /**
     * Bitmap fonts to load.
     * @type {Array}
     */
    this.fonts = [];

    /**
     * Sounds as Howl objects.
     * @type {Object.<String, Howl>}
     */
    this.sounds = {};

    /**
     * Data as strings.
     * The key will be used for loading the data.
     * @dict
     */
    this.data = {};

    /**
     * Data parsed with the JSON parser.
     * @dict
     */
    this.jsonData = {};

    /**
     * Callbacks for when the loader progresses.
     * Functon parameters are current files loaded and total files.
     * @type {Array.<Function(Number, Number)>}
     */
    this.progressCallbacks = [];
}

/**
 * Loads a file with the paths to resources and loads those resources.
 * @param {String} path the path of the resource file.
 * @param {function=} onComplete the callback function when the load is completed.
 * @param {function(String)=} onError the callback function to run when an error has occurred.
 */
Resources.prototype.loadFromResourcesFile = function(path, onComplete, onError) {
    "use strict";

    var instance = this;
    function loadData(request) {
        return function() {
            // Error on loading the file.
            if (request.status === 404) {
                if (onError) onError(path);
            }
            if (request.readyState !== 4) return;
            if (request.status !== 200 && window.location.protocol.indexOf('http') !== -1) return;

            var data = JSON.parse(request.responseText);
            // Copy the image paths.
            instance.images = instance.images.concat(data.images);
            instance.fonts = instance.fonts.concat(data.fonts);
            instance.spritesheets = instance.spritesheets.concat(data.spritesheets);
            // Copy the sound paths.
            var i;
            for (i = 0; i < data.sounds.length; i++) {
                instance.sounds[data.sounds[i]] = null;
            }
            // Copy the data into the data object.
            for (i = 0; i < data.data.length; i++) {
                instance.data[data.data[i]] = null;
            }
            // Load all the resources.
            instance.loadAll(onComplete);
        };
    }

    var request = new PIXI.AjaxRequest();
    request.onreadystatechange = loadData(request);
    request.open('GET', path, true);
    request.send();
};

/**
 * Loads all the textures in the resource paths.
 * @param {function=} onComplete the callback function when the load is completed.
 * @param {function(String)=} onError the callback function to run when an error has occurred.
 */
Resources.prototype.loadAll = function(onComplete, onError) {
    "use strict";

    var instance = this;

    // Manage callbacks and complete when all loading is done (should probably use Q).
    var assetCounter = 0;
    var totalAssets = this.images.length + this.fonts.length + Collections.objectSize(this.data) +
        Collections.objectSize(this.sounds);
    // Number of assets loaded with PIXI loaders.
    var pixiAssetsCount = this.images.length + this.fonts.length;
    var dataCounter = 0;
    var size = Collections.objectSize(this.data) + Collections.objectSize(this.sounds);
    // Set the default progress at 0.
    var i;
    for (i = 0; i < instance.progressCallbacks.length; i++) {
        instance.progressCallbacks[i](assetCounter, totalAssets);
    }

    // Runs when any item has been loaded.
    function loadProgress() {
        for (var i = 0; i < instance.progressCallbacks.length; i++) {
            instance.progressCallbacks[i](assetCounter, totalAssets);
        }
    }

    // Runs when an image has been loaded.
    function loadPixi(key) {
        return function() {
            assetCounter++;
            loadProgress();
            if (assetCounter === pixiAssetsCount) {
                loadGeneric();
            }
        };
    }
    function loadPixiError(key) {
        return function() {
            assetCounter++;
            loadProgress();
            if (assetCounter === pixiAssetsCount) {
                loadGeneric();
            }
        };
    }

    // Runs when data is being loaded.
    function loadData(request, key) {
        return function() {
            // Error on loading the file.
            if (request.status === 404) {
                if (onError) onError(key);
            }
            if (request.readyState !== 4) return;
            if (request.status !== 200 && window.location.protocol.indexOf('http') !== -1) return;
            instance.data[key] = request.responseText;
            dataCounter++;
            assetCounter++;
            loadProgress();
            if (dataCounter >= size) {
                if (onComplete) onComplete();
            }
        };
    }

    // Runs when a sound has been loaded or has an error loading.
    function loadSound() {
        dataCounter++;
        assetCounter++;
        loadProgress();
        if (dataCounter >= size) {
            if (onComplete) onComplete();
        }
    }
    function loadSoundError(path) {
        return function() {
            onError(path);
        };
    }

    // Load non-pixi loaded files.
    function loadGeneric() {
        // Load sprite sheets that are not in JSON files.
        // Textures are already loaded so it will not need to reload.
        instance.spritesheets.forEach(function(data) {
            var loader = new PIXI.ImageLoader(data.texture);
            loader.loadFramedSpriteSheet(data.width, data.height, data.name);
        });

        // Load the sounds.
        var key;
        for (key in instance.sounds) {
            if (instance.sounds.hasOwnProperty(key)) {
                // Load the sound and count as a load even if the sound has an error.
                instance.sounds[key] = new Howl({
                    urls: [key],
                    onload: loadSound,
                    onloaderror: loadSoundError(key)
                });
            }
        }

        // Finish loading if no other data.
        if (size === 0) {
            if (onComplete) onComplete();
            return;
        }

        // Load data files.
        for (key in instance.data) {
            if (instance.data.hasOwnProperty(key)) {
                var request = new PIXI.AjaxRequest();
                request.onreadystatechange = loadData(request, key);
                request.open('GET', key, true);
                request.send();
            }
        }
    }

    // Load all assets.
    var loader;
    for (i = 0; i < this.images.length; i++) {
        loader = PIXI.BaseTexture.fromImage(this.images[i]);
        if (!loader.hasLoaded) {
            loader.addEventListener('loaded', loadPixi(this.images[i]));
            loader.addEventListener('error', loadPixiError(this.images[i]));
        } else {
            loadPixi(this.images[i])();
        }
    }
    for (i = 0; i < this.fonts.length; i++) {
        loader = new PIXI.BitmapFontLoader(this.fonts[i]);
        loader.addEventListener('loaded', loadPixi(this.fonts[i]));
        try {
            loader.load();
        } catch (e) {
            console.log('e');
        }
    }
};

/**
 * Retrieves data and parses it if needed.
 * Retrieval only happens once and the data is then stored in the resources.
 * @param {String} key the key for the data.
 * @return {Object} the parsed data or null if none found.
 */
Resources.prototype.getJson = function(key) {
    "use strict";

    if (!this.jsonData[key]) {
        if (!this.data[key]) return null;
        // Parse and store the data.
        this.jsonData[key] = JSON.parse(this.data[key]);
    }
    return this.jsonData[key];
};

module.exports = Resources;
