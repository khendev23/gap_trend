import type { NextConfig } from 'next';

// 개발/운영 공통: 프록시 타겟 결정 (환경변수 없으면 dev는 localhost:4000)
const API_PROXY_TARGET = (
    process.env.NEXT_PUBLIC_API_PROXY_TARGET ??
    (process.env.NODE_ENV === 'production'
        ? 'https://api.yourdomain.com' // ← 운영 백엔드 도메인으로 바꿔주세요
        : 'http://localhost:8080')
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/server-api/:path*',
                destination: `${API_PROXY_TARGET}/api/:path*`,
            },
        ];
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        // 또는 간단히:
        // domains: ['images.unsplash.com'],
    },
};

export default nextConfig;