var readdirp = require('readdirp');
var path = require('path');
var fs = require('fs');

// Make sure a config file is in the arguments.
var args = process.argv.slice(2, process.argv.length);
if (args.length <= 0) {
    throw new Error('Config file path not given.');
}

// Load the config file.
var data = fs.readFileSync(args[0]);
var config = JSON.parse(data);
var imageExtensions = config.imageExtensions;
var fontExtensions = config.fontExtensions;
var soundExtensions = config.soundExtensions;


var folders = config.folders;

if (folders.length > 0) {
    var stream = readdirp({
        root: path.join(folders[0]),
        //fileFilter: '*Component.js',
        directoryFilter: ['!.git', '!.hg']
    }, function(error, res) {
        "use strict";

        var images = [];
        var fonts = [];
        var sounds = [];
        var data = [];

        var outputObject = {
            images: images,
            spritesheets: config.spritesheets,
            fonts: fonts,
            sounds: sounds,
            data: data
        };

        var i;
        for (i = 0; i < res.files.length; i++) {
            var file = res.files[i];
            var filePath = './' + path.join(folders[0], file.path);
            var ext = file.name.split('.').pop();

            var index = imageExtensions.indexOf(ext);
            if (index >= 0) {
                images.push(filePath);
                continue;
            }

            index = fontExtensions.indexOf(ext);
            if (index >= 0) {
                fonts.push(filePath);
                continue;
            }

            index = soundExtensions.indexOf(ext);
            if (index >= 0) {
                sounds.push(filePath);
                continue;
            }

            data.push(filePath);
        }

        var output = JSON.stringify(outputObject, null, '    ');
        output = output.replace(/\\\\/g, '/');

        fs.writeFile('resources.json', output, function(err) {
            console.log('Resources file created.');
        });
    });
}