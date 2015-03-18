var dgram = require('dgram');

var server = dgram.createSocket('udp4');

server.on('error', function(err) {
    "use strict";
    console.log('server error:\n' + err.stack);
    server.close();
});

server.on('message', function(msg, rinfo) {
    "use strict";
    console.log('server got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port);
});

server.on('listening', function() {
    "use strict";
    var address = server.address();
    console.log('server listening ' + address.address + ':' + address.port);
});

server.bind(41234);