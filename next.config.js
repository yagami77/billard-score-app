/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    trailingSlash: true,
    output: 'standalone',
    reactStrictMode: false,
    images: {
        domains: [
            'localhost',
            '5quilles.com',
            'www.5quilles.com'
        ]
    },
    // Suppression totale du bloc redirects() ici
};

module.exports = nextConfig;