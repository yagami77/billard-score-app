/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,  // Ignore les erreurs TypeScript
    },
    eslint: {
        ignoreDuringBuilds: true,  // Ignore les erreurs ESLint
    },
    experimental: {
        missingSuspenseWithCSRBailout: false  // Désactive l'avertissement pour useSearchParams
    }
}

module.exports = nextConfig