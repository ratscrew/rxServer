///<referance path="typings/node/node.d.ts"/>
import {server} from '../index'
var express = require('express');
var app = express();

let s = new server(app);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});