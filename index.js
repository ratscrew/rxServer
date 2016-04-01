"use strict";
var io = require('socket.io');
var server = (function () {
    function server(app) {
        this.io = io(app);
    }
    return server;
}());
exports.server = server;
//# sourceMappingURL=index.js.map