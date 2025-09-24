import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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