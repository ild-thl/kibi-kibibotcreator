// Minimaler Static-Server für dieses Projekt (ohne Dependencies).
// Wichtig: Lottie lädt die JSON per XHR und benötigt daher http/https,
// nicht file://.
//
// Start:
//   node server.js
// dann öffnen:
//   http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const port = 3000;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

function safePath(urlPath) {
  // Sehr einfaches Path-Traversal-Handling
  const decoded = decodeURIComponent(urlPath);
  const normalized = decoded.replace(/\\/g, '/');
  const clean = normalized.replace(/^\/+/, '');
  const full = path.join(rootDir, clean);
  if (!full.startsWith(rootDir)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = req.url || '/';
    const filePath = safePath(urlPath);
    if (!filePath) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    let target = filePath;
    if (req.url === '/' || req.url === '') {
      target = path.join(rootDir, 'index.html');
    }

    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      // Fallback: index.html (SPA-like), sonst 404
      const idx = path.join(rootDir, 'index.html');
      if (fs.existsSync(idx)) {
        target = idx;
      } else {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
    }

    const ext = path.extname(target).toLowerCase();
    const type = contentTypes[ext] || 'application/octet-stream';
    const data = fs.readFileSync(target);
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running: http://localhost:${port}`);
});

