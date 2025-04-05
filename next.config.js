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
    // Bloc experimental corrigé selon les messages d'erreur
    experimental: {
        // appDir est déjà activé par défaut dans Next.js 15
        // serverComponentsExternalPackages a été déplacé hors de experimental
    },
    // Paquets externes pour les composants serveur
    serverExternalPackages: [],
    // Ajoutez ce bloc pour gérer les redirections
    async rewrites() {
        return [
            {
                source: '/overlay',
                destination: '/overlay/',
            },
            {
                source: '/dashboard',
                destination: '/dashboard/',
            },
            // Ajoutez d'autres redirections si nécessaire
        ];
    },
    images: {
        domains: [
            'localhost',
            '5quilles.com',
            'www.5quilles.com'
        ]
    },
    // Config pour le routage
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

module.exports = nextConfig;