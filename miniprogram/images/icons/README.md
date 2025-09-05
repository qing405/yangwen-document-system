# 图标系统使用说明

## 概述

本项目采用专业的SVG图标系统，基于您提供的设计方案实现。所有图标都遵循统一的设计规范，确保视觉一致性和专业性。

## 色彩系统

### 主色调
- **主色**: `#0D1F3C` - 用于导航栏背景、重要文字
- **辅助色**: `#1E3A68` - 用于功能图标、次要文字
- **强调色**: `#007BFF` - 用于激活状态、按钮、链接

### 状态色
- **成功色**: `#52C41A` - 成功状态图标
- **警告色**: `#FAAD14` - 警告状态图标
- **错误色**: `#FF4D4F` - 错误状态图标
- **默认色**: `#959595` - 导航图标默认状态

## 图标分类

### 1. 导航栏图标
用于底部导航栏，包含默认和激活两种状态：

- `home.svg` / `home-active.svg` - 首页
- `documents.svg` / `documents-active.svg` - 文档
- `forms.svg` / `forms-active.svg` - 表单
- `profile.svg` / `profile-active.svg` - 个人中心

### 2. 功能图标
用于功能卡片和操作按钮：

- `document-center.svg` - 文档中心
- `records.svg` - 台账管理
- `user-management.svg` - 用户管理
- `statistics.svg` - 数据统计
- `form-fill.svg` - 表单填写

### 3. 状态图标
用于表示不同状态：

- `success.svg` - 成功状态
- `warning.svg` - 警告状态
- `error.svg` - 错误状态

## 使用方法

### 方法一：使用图标组件（推荐）

```xml
<!-- 在WXML中使用 -->
<icon name="documents" size="32" color="#1E3A68"></icon>
<icon name="success" size="24" color="#52C41A"></icon>
```

### 方法二：直接使用image标签

```xml
<!-- 在WXML中使用 -->
<image src="/images/icons/documents.svg" mode="aspectFit" style="width: 32px; height: 32px;"></image>
```

### 方法三：在CSS中使用

```css
/* 在WXSS中使用 */
.icon {
  background-image: url('/images/icons/documents.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 32px;
  height: 32px;
}
```

## 图标组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | String | '' | 图标名称 |
| size | Number | 24 | 图标大小（像素） |
| color | String | '#1E3A68' | 图标颜色 |

## 支持的图标名称

### 导航图标
- `home` / `home-active`
- `documents` / `documents-active`
- `forms` / `forms-active`
- `profile` / `profile-active`

### 功能图标
- `document-center`
- `records`
- `user-management`
- `statistics`
- `form-fill`

### 状态图标
- `success`
- `warning`
- `error`

## 设计规范

### 尺寸规范
- **导航图标**: 24x24px
- **功能图标**: 24x24px
- **状态图标**: 24x24px
- **可缩放**: 所有图标都是SVG格式，支持无损缩放

### 线条规范
- **线条粗细**: 2px
- **圆角**: 统一使用圆角设计
- **风格**: 简洁、现代、专业

### 颜色规范
- **默认状态**: 使用 `#959595`
- **激活状态**: 使用 `#007BFF`
- **功能图标**: 使用 `#1E3A68`
- **状态图标**: 使用对应的状态色

## 最佳实践

1. **保持一致性**: 在同一个页面中使用相同尺寸的图标
2. **合理使用颜色**: 根据功能选择合适的颜色
3. **考虑可访问性**: 确保图标有足够的对比度
4. **响应式设计**: 在不同设备上保持图标清晰度

## 扩展指南

如需添加新图标：

1. 创建SVG文件，遵循现有设计规范
2. 在 `components/icon/icon.js` 中添加图标映射
3. 更新此文档，添加新图标说明
4. 测试图标在不同尺寸下的显示效果

## 注意事项

- 所有图标都是SVG格式，确保兼容性
- 图标颜色可以通过CSS或组件属性自定义
- 建议使用图标组件，便于统一管理和维护
- 避免在图标上添加额外的装饰元素
