module.exports = {
  apps: [
    {
      name: 'next-app',
      script: 'npm',
      args: 'run start',  // Runs `next start`
      instances: 1,       // Or "max" for multi-core
      exec_mode: 'fork',  // Keep "fork" for Next.js unless using a custom server
      env: {
        NODE_ENV: 'development',
        PORT: 3008
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3008
      }
    }
  ]
};
