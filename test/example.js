"use strict";
///<referance path="typings/node/node.d.ts"/>
var index_1 = require('../index');
var express = require('express');
var app = express();
var s = new index_1.server(app);
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
//# sourceMappingURL=example.js.map