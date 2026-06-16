// PM2 Process Configuration — Option B: Shared Hosting
// Usage: pm2 start ecosystem.config.js --env production
// Prerequisites: npm i -g pm2 tsx

module.exports = {
  apps: [
    {
      name: 'football-web',
      script: '.next/standalone/server.js',
      instances: 'max',       // one per CPU core
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1', // Nginx reverse-proxies; never bind to 0.0.0.0 in prod
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/football/web-error.log',
      out_file:   '/var/log/football/web-out.log',
      merge_logs: true,
      max_memory_restart: '1G',
      kill_timeout:    5000,
      wait_ready:      true,
      listen_timeout:  10000,
      restart_delay:   3000,
    },
    {
      name: 'football-worker',
      script: 'workers/scoring-worker.ts',
      interpreter: 'node',
      interpreter_args: '--import=tsx/esm',
      instances: 1,
      exec_mode: 'fork',      // MUST be fork — BullMQ manages its own concurrency internally
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/football/worker-error.log',
      out_file:   '/var/log/football/worker-out.log',
      max_memory_restart: '512M',
      autorestart:   true,
      restart_delay: 5000,
      max_restarts:  10,
    },
  ],
}
