module.exports = {
  apps: [
    {
      name: "motopecas-api",
      cwd: "./backend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "../logs/err.log",
      out_file: "../logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
      max_restarts: 10,
      watch: false,
    },
  ],
};
