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

async function getThreadFromUrl(seed: string, options?: mfo.Options, includeErr?: boolean) {
    var boundary: string[] = [];
    var seen: Set<string> = new Set();
    var entries: Map<string, mfo.Entry> = new Map();
    boundary.push(seed);
    seen.add(seed);
    while (boundary.length > 0) {
        let url = boundary.shift();
        try {
            let entry = await mfo.getEntryFromUrl(url, options);
            entries.set(url, entry);
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
            if (includeErr === true || includeErr === undefined) {
                let entry = new mfo.Entry(url);
                entry.content = {value: '[Error fetching post]', html: '[Error fetching post]'};
                entries.set(url, entry);
            }
        }
    }
    return Array.from(entries.values());
}

app.get('/', async (req, res) => {
    try {
        if (req.query.url) {
            debug('%s %s', req.ip, req.query.url);
            var thread = await getThreadFromUrl(req.query.url, {strategies: ['entry', 'event']}, false);
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