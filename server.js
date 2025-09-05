const express = require('express');
const app = express();
const port = process.env.PORT || 80;

// 导入云函数
const cloudFunction = require('./index.js');

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 云函数接口
app.post('/cloudfunction', async (req, res) => {
  try {
    const result = await cloudFunction.main(req.body, {});
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('云函数执行错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '微信小程序云函数服务',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      cloudfunction: '/cloudfunction'
    }
  });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${port}`);
});
