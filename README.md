# 思维导图系统

这是一个基于Vue 3的思维导图系统，提供思维导图创建、编辑、标签搜索等功能。

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

## GitHub Pages部署说明

本项目已配置为可以直接部署到GitHub Pages：

1. 项目已在vite.config.js中设置了正确的base路径：`/mindfile_v3/`
2. 已安装gh-pages包并在package.json中添加了deploy脚本
3. 已配置GitHub Actions自动部署工作流（.github/workflows/deploy.yml）

当推送代码到main分支时，GitHub Actions会自动构建项目并部署到gh-pages分支。

访问地址：https://[用户名].github.io/mindfile_v3/

## 许可证

MIT