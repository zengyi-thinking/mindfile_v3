# 思维导图系统

这是一个基于 Vue 3 的思维导图系统，提供思维导图创建、编辑、标签搜索等功能。

## 功能特点

- 思维导图创建与编辑
- 标签化思维导图搜索
- 资料管理与关联
- 讨论交流
- 用户个人中心
- 管理员资料管理

## 技术栈

- Vue 3
- Vue Router
- Element Plus
- Vite
- Simple Mind Map
- D3.js
- ECharts

## 开发与部署

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建与部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

## GitHub Pages 部署说明

本项目已配置为可以直接部署到 GitHub Pages：

1. 项目已在 vite.config.js 中设置了正确的 base 路径：`/mindfile_v3/`
2. 已安装 gh-pages 包并在 package.json 中添加了 deploy 脚本
3. 已配置 GitHub Actions 自动部署工作流（.github/workflows/deploy.yml）

当推送代码到 main 分支时，GitHub Actions 会自动构建项目并部署到 gh-pages 分支。

访问地址：https://zengyi-thinking.github.io/mindfile_v3/

## 许可证

MIT
