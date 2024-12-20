/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // ⚠️ Attention : Ceci désactive la vérification des types lors du build
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,  // Ignore les erreurs ESLint
    }
}

module.exports = nextConfig