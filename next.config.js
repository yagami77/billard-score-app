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
    async redirects() {
        return [
            {
                source: '/(.*)',
                has: [
                    {
                        type: 'host',
                        value: '^5quilles\\.com$',  // Correction ici : regex précise
                    }
                ],
                permanent: true,
                destination: 'https://www.5quilles.com/:1'
            }
        ];
    }
};

module.exports = nextConfig;