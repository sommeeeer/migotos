/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.mjs';

import { type NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.migotos.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'migotos.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    swcPlugins: [
      [
        'superjson-next',
        {
          excluded: [],
        },
      ],
    ],
  },
  outputFileTracingExcludes: {
    '*': [
      './.prisma/client/libquery_engine-debian*', // prisma ubuntu binary
      './@swc/core-linux-x64-gnu*',
      './@swc/core-linux-x64-musl*',
      './@esbuild*',
      './webpack/',
      './rollup*',
      './terser*',
      './sharp*',
    ],
  },
  poweredByHeader: false,
};

export default config;
