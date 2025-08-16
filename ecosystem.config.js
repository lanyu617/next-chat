module.exports = {
  apps : [{
    name: "next-chat-app",
    script: "npm",
    args: "start",
    env_file: ".env.local", // 指定环境变量文件
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
