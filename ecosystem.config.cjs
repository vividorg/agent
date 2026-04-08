module.exports = {
  apps: [
    {
      name: "vivid-service",
      script: "dist/index.js",
      args: "service --port 3100",
      cwd: __dirname,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        VIVID_HOME: process.env.VIVID_HOME || `${__dirname}/.vivid`,
        PORT: "3100",
      },
    },
  ],
};
