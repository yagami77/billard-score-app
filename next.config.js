/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        dirs: ['pages', 'components', 'hooks', 'lib', 'app'], // Linting for these directories
    },
    images: {
        domains: ['localhost'], // Allow images from localhost
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
                child_process: false,
            };
        }
        return config;
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/old-path',
                destination: '/new-path',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/old-path',
                destination: '/new-path',
            },
        ];
    },
    trailingSlash: true,
    basePath: '/billard-score',
    assetPrefix: '/billard-score/',
    i18n: {
        locales: ['fr', 'en'],
        defaultLocale: 'fr',
    },
    optimizeFonts: true,
    productionBrowserSourceMaps: true,
    experimental: {
        optimizeCss: true,
        optimizeImages: true,
        optimizeFonts: true,
        reactMode: 'legacy',
        workerThreads: true,
        externalDir: true,
    },
    serverRuntimeConfig: {
        mySecret: 'secret',
        secondSecret: process.env.SECOND_SECRET,
    },
    publicRuntimeConfig: {
        staticFolder: '/public',
    },
    env: {
        customKey: 'value',
        customKey2: process.env.CUSTOM_KEY_2,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;