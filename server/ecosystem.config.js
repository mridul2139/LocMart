module.exports = {
  apps: [{
    name: 'lokmart-backend',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 4000,
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
      DATABASE_PATH: './data.sqlite'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      DATABASE_PATH: process.env.DATABASE_PATH || './data.sqlite',
      CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
    }
  }]
};
