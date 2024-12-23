/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,  // Ignore les erreurs TypeScript
    },
    eslint: {
        ignoreDuringBuilds: true,  // Ignore les erreurs ESLint
    },
    experimental: {
        optimizeCss: true,
        externalDir: true,
        workerThreads: true
    }
};

module.exports = nextConfig;