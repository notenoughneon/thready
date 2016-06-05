import express = require('express');
import http = require('http');
import jade = require('jade');
import mfo = require('mf-obj');
var debug = require('debug')('thready');
import util = require('./util');

var app = express();
app.disable('x-powered-by');
app.set('views', './template');
app.set('view engine', 'jade');
app.use(express.static('static', {extensions: ['html']}));

app.get('/', async (req, res) => {
    try {
        if (req.query.url) {
            var thread = await mfo.getThreadFromUrl(req.query.url);
            thread = thread.filter(e => !e.isLike() && !e.isRepost());
            thread.sort(mfo.Entry.byDate);
            res.render('threadpage', {thread:thread, util: util});
        } else {
            res.render('querypage');
        }        
    } catch (err) {
        debug('Server error: ' + err);
        res.sendStatus(500);
    }
});

var server = http.createServer(app);

server.listen(8000);