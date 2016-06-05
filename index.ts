import express = require('express');
import http = require('http');
import jade = require('jade');
import mfo = require('mf-obj');
var debug = require('debug')('thready');

var app = express();
app.disable('x-powered-by');
app.set('views', './template');
app.set('view engine', 'jade');

var server = http.createServer(app);

server.listen(8000);