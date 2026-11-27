'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('./server');

function start(t) {
    return new Promise((resolve) => {
        const server = createServer();
        server.listen(0, '127.0.0.1', () => {
            t.after(() => {
                server.closeAllConnections();
                server.close();
            });
            resolve(`http://127.0.0.1:${server.address().port}`);
        });
    });
}

// Sends the path exactly as written (fetch would tidy it up first).
function rawStatus(baseUrl, rawPath) {
    const { hostname, port } = new URL(baseUrl);
    return new Promise((resolve, reject) => {
        http
            .get({ hostname, port, path: rawPath, agent: false }, (res) => {
                res.resume();
                res.on('end', () => resolve(res.statusCode));
            })
            .on('error', reject);
    });
}

test('/health answers ok', async (t) => {
    const base = await start(t);
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok' });
});

test('the home page is served as HTML', async (t) => {
    const base = await start(t);
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(await res.text(), /Event Ticketing/);
});

test('an unknown page gives 404', async (t) => {
    const base = await start(t);
    const res = await fetch(`${base}/nope.html`);
    assert.equal(res.status, 404);
});

test('only GET is allowed', async (t) => {
    const base = await start(t);
    const res = await fetch(`${base}/health`, { method: 'POST' });
    assert.equal(res.status, 405);
});

test('files outside the public folder cannot be read', async (t) => {
    const base = await start(t);
    assert.equal(await rawStatus(base, '/..%2fpackage.json'), 404);
    assert.equal(await rawStatus(base, '/../package.json'), 404);
});