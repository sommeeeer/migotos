/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
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
        'next-superjson-plugin',
        {
          excluded: [],
        },
      ],
    ],
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
  },
};

export default config;
