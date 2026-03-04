/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_PUBLIC_BASE_PATH !== undefined;

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: 'export',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  }),
  images: {
    unoptimized: true,
  },
  ...(!isStaticExport && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
        },
      ];
    },
  }),
};

module.exports = nextConfig;
