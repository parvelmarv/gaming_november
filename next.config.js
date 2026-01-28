/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Explicitly enable Turbopack (Next 16 default, but this makes intent clear)
  turbopack: {},
  // Enable compression for all files
  compress: true,
  // Add headers for Unity files
  async headers() {
    return [
      {
        source: '/games/RolloRocket/Build/ProductionBr.loader.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/games/RolloRocket/Build/ProductionBr.wasm.br',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
          {
            key: 'Content-Encoding',
            value: 'br',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/games/RolloRocket/Build/ProductionBr.data.br',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.unity',
          },
          {
            key: 'Content-Encoding',
            value: 'br',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/games/RolloRocket/Build/ProductionBr.framework.js.br',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Content-Encoding',
            value: 'br',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Add rewrites to handle Unity files
  async rewrites() {
    return [
      {
        source: '/games/RolloRocket/Build/:path*',
        destination: '/games/RolloRocket/Build/:path*',
        has: [
          {
            type: 'header',
            key: 'accept-encoding',
            value: '(.*?)',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 