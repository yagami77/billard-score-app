module.exports = {
  apps: [
    {
      name: 'billard-nextjs',
      script: 'server.js',
      cwd: '/var/www/billard-score-app/.next/standalone',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      out_file: '/var/www/billard-score-app/logs/nextjs-out.log',
      error_file: '/var/www/billard-score-app/logs/nextjs-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'billard-socket',
      script: 'npm',
      args: 'run socket-start',
      cwd: '/var/www/billard-score-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '256M',
      out_file: '/var/www/billard-score-app/logs/socket-out.log',
      error_file: '/var/www/billard-score-app/logs/socket-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
