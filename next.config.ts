/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    basePath: '/morse-code', // GitHub repository name
    assetPrefix: '/morse-code/', // Prefix for static assets
};

export default nextConfig;
