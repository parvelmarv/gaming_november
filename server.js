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

// Function to get content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath.replace('.br', ''));
  switch (ext) {
    case '.js':
      return 'application/javascript';
    case '.wasm':
      return 'application/wasm';
    case '.data':
      return 'application/vnd.unity';
    default:
      return 'application/octet-stream';
  }
}

// Function to serve brotli compressed files
async function serveBrotliFile(filePath, res) {
  try {
    const fileContent = await fs.promises.readFile(filePath);
    const contentType = getContentType(filePath);
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileContent.length,
      'Content-Encoding': 'br',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Accept-Encoding'
    });
    
    res.end(fileContent);
  } catch (error) {
    console.error(`Error serving file ${filePath}:`, error);
    res.writeHead(500);
    res.end('Error loading game files');
  }
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Handle Unity build files
    if (pathname.startsWith('/games/RolloRocket/Build/')) {
      const filePath = path.join(__dirname, 'public', pathname);
      
      // Check if file exists
      try {
        await fs.promises.access(filePath);
      } catch (error) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }

      // Handle brotli compressed files
      if (pathname.endsWith('.br')) {
        await serveBrotliFile(filePath, res);
        return;
      }

      // Handle loader.js
      if (pathname.endsWith('.js')) {
        const contentType = getContentType(filePath);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff'
        });
        
        const fileContent = await fs.promises.readFile(filePath);
        res.end(fileContent);
        return;
      }
    }

    // Handle all other requests with Next.js
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}); 