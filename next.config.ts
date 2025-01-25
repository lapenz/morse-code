import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    basePath: '/morse-code',
    assetPrefix: '/morse-code/',
    images: {
        unoptimized: true, // Required if you are using Next.js Image Optimization
    }
};

export default nextConfig;
