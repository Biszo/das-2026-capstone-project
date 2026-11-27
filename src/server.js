'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
};

function sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}

function serveStatic(pathname, res) {
    let requested;
    try {
        requested = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    } catch {
        return sendJson(res, 400, { error: { code: 'BAD_REQUEST', message: 'Bad URL.' } });
    }

    const filePath = path.join(PUBLIC_DIR, requested);
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
        return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Not found.' } });
    }

    return fs.readFile(filePath, (err, data) => {
        if (err) {
            return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Not found.' } });
        }
        const type = TYPES[path.extname(filePath)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        return res.end(data);
    });
}

function handleRequest(req, res) {
    const url = new URL(req.url, 'http://localhost');

    if (req.method !== 'GET') {
        return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } });
    }
    if (url.pathname === '/health') {
        return sendJson(res, 200, { status: 'ok' });
    }
    return serveStatic(url.pathname, res);
}

function createServer() {
    return http.createServer(handleRequest);
}

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    createServer().listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = { createServer };