/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: "export", // Enable static export
    trailingSlash: true, // Add trailing slashes to paths
    basePath: isProd ? '/morse-code' : '', // Use '/morse-code' for GitHub Pages, nothing for local
    assetPrefix: isProd ? '/morse-code/' : '', // Use '/morse-code/' for GitHub Pages, nothing for local
};

module.exports = nextConfig;
