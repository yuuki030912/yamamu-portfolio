const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'textures');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

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
        const data = JSON.parse(body);
        let saved = 0;
        for (const [id, dataUrl] of Object.entries(data)) {
          const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
          fs.writeFileSync(path.join(dir, id + '.png'), Buffer.from(base64, 'base64'));
          saved++;
        }
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({saved}));
        console.log('Saved ' + saved + ' textures');
        setTimeout(() => { console.log('Done. Shutting down.'); process.exit(0); }, 1000);
      } catch(e) {
        res.writeHead(500); res.end(e.message);
      }
    });
  } else {
    res.writeHead(404); res.end('not found');
  }
});
server.listen(9999, () => console.log('Save server on http://localhost:9999'));
