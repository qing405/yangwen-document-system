# 环境配置说明

## 云托管环境变量配置

在微信云托管部署时，建议添加以下环境变量：

### 必需的环境变量
- `WX_CLOUD_ENV=cloud1-6g1pgt8pc50014d6`
- `NODE_ENV=production`
- `PORT=80`

### 配置方法
在云托管界面的"高级设置" -> "环境变量"中添加：

| Key | Value |
|-----|-------|
| WX_CLOUD_ENV | cloud1-6g1pgt8pc50014d6 |
| NODE_ENV | production |
| PORT | 80 |

## 云函数环境配置

云函数中已正确配置环境ID：
```javascript
cloud.init({
  env: 'cloud1-6g1pgt8pc50014d6'
})
```
