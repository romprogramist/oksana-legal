module.exports = {
  apps: [
    {
      name: 'oksana-legal',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      cwd: '/var/www/spisanie/nextjs',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
