/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,  // Ignore les erreurs TypeScript
    },
    eslint: {
        ignoreDuringBuilds: true,  // Ignore les erreurs ESLint
    },
    images: {
        domains: [
            'localhost',          // Localhost pour le développement
            '5quilles.com',       // Domaine sans www
            'www.5quilles.com'    // Domaine avec www
        ]
    },
    async redirects() {
        return [
            {
                source: '/(.*)',
                has: [
                    {
                        type: 'host',
                        value: '5quilles.com'
                    }
                ],
                permanent: true,
                destination: 'https://www.5quilles.com/:1'
            },
            {
                source: '/(.*)',
                has: [
                    {
                        type: 'host',
                        value: 'http://www.5quilles.com'
                    }
                ],
                permanent: true,
                destination: 'https://www.5quilles.com/:1'
            }
        ];
    }
};

module.exports = nextConfig;