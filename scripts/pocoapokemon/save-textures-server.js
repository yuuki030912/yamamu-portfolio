const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'textures');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

let saved = 0;
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const items = JSON.parse(body);
        for (const [name, b64] of Object.entries(items)) {
          fs.writeFileSync(path.join(DIR, name + '.png'), Buffer.from(b64, 'base64'));
          saved++;
        }
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ saved, total: Object.keys(items).length }));
      } catch(e) {
        res.writeHead(500); res.end(e.message);
      }
    });
  } else if (req.method === 'GET' && req.url === '/done') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ saved }));
    setTimeout(() => { server.close(); process.exit(0); }, 500);
  } else {
    res.writeHead(404); res.end();
  }
});

server.listen(9999, () => console.log('Texture save server on :9999, saved so far:', saved));
