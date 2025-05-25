const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Cache for compressed files
const compressionCache = new Map();

// Function to compress and cache files
async function compressAndCache(filePath) {
  if (compressionCache.has(filePath)) {
    return compressionCache.get(filePath);
  }

  const fileContent = await fs.promises.readFile(filePath);
  const compressed = await new Promise((resolve, reject) => {
    zlib.brotliCompress(fileContent, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  compressionCache.set(filePath, compressed);
  return compressed;
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Special handling for the loader.js file
    if (pathname === '/games/RolloRocket/Build/ProductionGz.loader.js') {
      const filePath = path.join(__dirname, 'public', pathname);
      
      try {
        const compressed = await compressAndCache(filePath);
        
        res.writeHead(200, {
          'Content-Type': 'application/javascript',
          'Content-Length': compressed.length,
          'Content-Encoding': 'br',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Vary': 'Accept-Encoding'
        });
        
        res.end(compressed);
      } catch (error) {
        console.error('Error serving loader.js:', error);
        res.writeHead(500);
        res.end('Error loading game files');
      }
      return;
    }

    // Handle all other requests with Next.js
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}); 