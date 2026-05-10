module.exports = {
  apps: [
    {
      name: "PMCare",
      script: "npm",
      args: "start",
      env: {
        HOST: "127.0.0.1",
        PORT: 3002
      }
    }
  ]
}
