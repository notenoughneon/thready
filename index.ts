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

async function getThreadFromUrl(seed: string) {
    var boundary: string[] = [];
    var seen: Set<string> = new Set();
    var entries: Map<string, mfo.Entry> = new Map();
    boundary.push(seed);
    seen.add(seed);
    while (boundary.length > 0) {
        let url = boundary.shift();
        try {
            let entry = await mfo.getEntryFromUrl(url, {strategies: ['entry', 'event']});
            entries.set(url, entry);
            for (let child of entry.getChildren()) {
                if (!entries.has(child.url))
                    entries.set(child.url, child);
            }
            let references = entry.getChildren()
            .filter(c => !c.isLike() && !c.isRepost())
            .map(c => c.url);
            if (entry.isReply())
                references.push(entry.replyTo.url);
            for (let ref of references) {
                if (!seen.has(ref)) {
                    if (seen.size > 25)
                        throw new Error('Exceeded max thread size');
                    boundary.push(ref);
                    seen.add(ref);
                }
            }
        } catch (err) {
            debug('Error fetching post: ' + err);
            // let entry = new mfo.Entry(url);
            // entry.content = {value: '[Error fetching post]', html: '[Error fetching post]'};
            // entries.set(url, entry);
        }
    }
    return Array.from(entries.values());
}

function _getTime(entry: mfo.Entry) {
    if (entry.published != null)
        return entry.published.getTime();
    return Number.MAX_SAFE_INTEGER;
}

app.get('/', async (req, res) => {
    try {
        if (req.query.url) {
            debug('%s %s', req.ip, req.query.url);
            var thread = await getThreadFromUrl(req.query.url);
            thread = thread.filter(e => !e.isLike() && !e.isRepost());
            thread.sort((a, b) => _getTime(a) - _getTime(b));
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

server.listen(process.argv[2], function() {
    var address = server.address();
    debug('Listening on %s:%s', address.address, address.port);
});