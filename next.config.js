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

    // Handle gzipped files
    config.module.rules.push({
      test: /\.gz$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      ],
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
  // Disable compression for JavaScript files
  compress: true,
  // Add rewrites to handle Unity files
  async rewrites() {
    return [
      {
        source: '/games/RolloRocket/Build/ProductionGz.loader.js',
        destination: '/games/RolloRocket/Build/ProductionGz.loader.js',
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
  // Add headers for Unity files
  async headers() {
    return [
      {
        source: '/games/RolloRocket/Build/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/games/RolloRocket/Build/ProductionGz.loader.js',
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
        source: '/games/RolloRocket/Build/ProductionGz.wasm.gz',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/games/RolloRocket/Build/ProductionGz.data.gz',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/games/RolloRocket/Build/ProductionGz.framework.js.gz',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 