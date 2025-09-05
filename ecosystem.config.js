module.exports = {
  apps: [
    {
      name: 'soulsync-backend',
      script: 'src/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001
      },
      // Performance and reliability settings
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      autorestart: true,
      watch: false, // Set to true for development if you want file watching
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        '.env',
        '*.log',
        'uploads'
      ],
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Additional PM2 settings
      kill_timeout: 3000,
      listen_timeout: 3000,
      
      // Health check
      health_check_url: 'http://localhost:5001/health',
      
      // Environment-specific configurations
      node_args: '--max-old-space-size=1024'
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/soulsync-backend.git',
      path: '/var/www/soulsync-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/soulsync-backend.git',
      path: '/var/www/soulsync-backend-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};