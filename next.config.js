/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,  // Ignore les erreurs TypeScript
    },
    eslint: {
        ignoreDuringBuilds: true,  // Ignore les erreurs ESLint
    }
}

module.exports = nextConfig