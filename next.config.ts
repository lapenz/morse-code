/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export", // Enable static export
    trailingSlash: true, // Add trailing slashes to paths
    basePath: "/morse-code", // Use your GitHub repo name
    assetPrefix: "/morse-code/", // Prefix for static assets (ensure the trailing slash)
};

module.exports = nextConfig;
