/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize build performance
  swcMinify: true,
  poweredByHeader: false,
  webpack: (config, { dev, isServer }) => {
    // Handle Unity files
    config.module.rules.push({
      test: /\.(wasm|data|framework|loader)\.(js)?$/,
      type: 'asset/resource',
    });

    // Handle brotli compressed files
    config.module.rules.push({
      test: /\.br$/,
      type: 'asset/resource',
    });

    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Optimize for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
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