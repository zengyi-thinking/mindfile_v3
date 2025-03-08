# MindFile 知识管理系统

## 项目介绍

MindFile 是一个基于标签的知识管理系统，支持多级标签分类和思维导图可视化。用户可以通过多级标签快速查找和组织知识内容，系统会自动生成对应的思维导图。

## 主要功能

* 多级标签分类管理
* 标签搜索与过滤
* 自动生成思维导图
* 知识内容管理
* 用户自定义标签
* 标签推荐系统

## 技术栈

* 前端：Vue 3 + Vite
* 后端：Node.js + Express
* 数据库：MongoDB
* 思维导图：MindMap.js
* 样式：SCSS
* 构建工具：Webpack

## 项目结构

```javascript
mindfile_v3/
├── src/
│   ├── api/            # API接口
│   ├── assets/         # 静态资源
│   ├── components/     # 通用组件
│   ├── config/         # 配置文件
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .gitignore          # Git忽略配置
├── package.json        # 项目依赖
├── webpack.config.js   # Webpack配置
├── vite.config.js      # Vite配置
└── README.md           # 项目说明
```

## 安装与运行

1. 克隆项目

```bash
git clone https://github.com/your-repo/mindfile_v3.git
cd mindfile_v3
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 贡献指南

欢迎提交Pull Request，请遵循以下规范：

* 使用ESLint规范代码风格
* 提交信息遵循Conventional Commits规范
* 新功能需提供单元测试
