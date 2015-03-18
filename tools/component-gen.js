var readdirp = require('readdirp');
var path = require('path');
var fs = require('fs');

var folders = process.argv.slice(2, process.argv.length);
var showComments = false;

if (folders.length > 0) {
    var stream = readdirp({
        root: path.join(folders[0]),
        fileFilter: '*Component.js',
        directoryFilter: ['!.git', '!.hg']
    }, function(error, res) {
        "use strict";

        var output = "";

        var extensionLength = 3;
        var i, j;
        for (i = 0; i < res.files.length; i++) {
            var file = res.files[i];
            var path = file.fullPath;
            var name = file.name.slice(0, file.name.length - extensionLength);
            var data = fs.readFileSync(path, 'utf-8');
            var lines = data.split('\n');

            output += name + '\n';

            // Find the starting and ending line.
            var start = -1;
            var end = -1;
            var line;
            var result = -1;
            var re1 = new RegExp('function ' + name);
            var re2 = new RegExp('^}');
            for (j = 0; j < lines.length; j++) {
                line = lines[j];
                // Find the start.
                if (start < 0) {
                    result = line.search(re1);
                    if (result >= 0) {
                        start = j;
                    }
                }

                // Find the end.
                if (start >= 0 && end < 0) {
                    result = line.search(re2);
                    if (result >= 0) {
                        end = j;
                        break;
                    }
                }
            }
            // Find the variables.
            re1 = new RegExp('use strict');
            re2 = new RegExp('this.setParams');
            var re3 = new RegExp('[*]');
            for (j = start + 1; j < end; j++) {
                line = lines[j];

                result = line.search(re1);
                if (result >= 0) continue;
                result = line.search(re2);
                if (result >= 0) continue;
                result = line.search(/Component.call/);
                if (result >= 0) continue;
                result = line.search(/^\s$/);
                if (result >= 0) continue;
                if (!showComments) {
                    result = line.search(re3);
                    if (result >= 0) continue;
                }

                output += '\t' + line;
            }

            output += '\n\n';
        }

        fs.writeFile('components.txt', output, function(err) {
            console.log('Components file created.');
        });
    });
}