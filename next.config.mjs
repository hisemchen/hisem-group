/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'admin.dh.hisem.com',
          },
        ],
        destination: '/admin/yipinshifu',
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
