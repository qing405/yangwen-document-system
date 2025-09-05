# 使用Node.js官方镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制云函数相关文件
COPY cloudfunctions/quickstartFunctions/package*.json ./
COPY cloudfunctions/quickstartFunctions/index.js ./

# 安装依赖
RUN npm install

# 创建简单的HTTP服务器来提供云函数服务
RUN npm install express

# 创建服务器入口文件
COPY server.js ./

# 暴露端口（微信云托管默认使用80端口）
EXPOSE 80

# 启动命令
CMD ["node", "server.js"]
