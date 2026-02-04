/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 환경변수
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 이미지 최적화
  images: {
    domains: ['api.emes.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // 성능 최적화
  experimental: {
    optimizeCss: true,
  },

  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
