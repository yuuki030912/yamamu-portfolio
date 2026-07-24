const http = require('http');
const fs = require('fs');
const path = require('path');

const TEXTURES_DIR = path.join(__dirname, 'textures');
if (!fs.existsSync(TEXTURES_DIR)) fs.mkdirSync(TEXTURES_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        let count = 0;
        for (const [name, base64] of Object.entries(data)) {
          const buf = Buffer.from(base64, 'base64');
          fs.writeFileSync(path.join(TEXTURES_DIR, `${name}.png`), buf);
          count++;
        }
        console.log(`Saved ${count} textures`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ saved: count }));
      } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/done') {
    res.writeHead(200);
    res.end('bye');
    console.log('Done signal received, shutting down.');
    server.close();
  } else {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(9999, () => console.log('Texture save server on http://localhost:9999'));
