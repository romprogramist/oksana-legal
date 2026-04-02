module.exports = {
  apps: [
    {
      name: "oksana-legal",
      script: "server.js",
      cwd: "/var/www/spisanie/nextjs",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
        DATABASE_URL:
          "postgresql://postgres@localhost:5432/oksana_legal_db",
      },
    },
  ],
};
