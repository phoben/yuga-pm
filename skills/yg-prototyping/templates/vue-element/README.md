# Vue + Element Plus 模板

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | ^3.4.0 |
| UI 组件库 | Element Plus | ^2.5.0 |
| 构建工具 | Vite | ^5.0.0 |
| 路由 | Vue Router | ^4.3.0 |
| 状态管理 | Pinia | ^2.1.0 |
| HTTP 客户端 | Axios | ^1.6.0 |
| 工具库 | VueUse | ^10.9.0 |
| 类型检查 | TypeScript | ^5.4.0 |

## 项目结构

```
{project-name}/
├── src/
│   ├── views/              # 页面组件
│   ├── components/
│   │   ├── ui/             # 基础 UI 组件
│   │   └── business/       # 业务组件
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── api/                # API 请求
│   ├── hooks/              # 组合式函数
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── mock/               # Mock 数据
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── public/                 # 静态资源
├── styles/
│   ├── globals.css         # 全局样式
│   └── tokens.css          # 设计令牌
├── index.html
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── package.json
```

## 使用方式

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:5173 启动。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 4. 代码检查

```bash
npm run lint
```

### 5. 类型检查

```bash
npm run type-check
```

## 模板特性

- **Vue 3 Composition API**: 使用 `<script setup>` 语法糖，代码更简洁
- **Element Plus**: 企业级 UI 组件库，开箱即用
- **Pinia**: 新一代状态管理，支持 TypeScript
- **Vue Router 4**: 完整的路由解决方案
- **Vite**: 极速开发体验，HMR 热更新
- **TypeScript**: 完整的类型支持
- **Axios**: HTTP 请求封装
- **VueUse**: 实用的组合式函数库

## 目录说明

| 目录 | 用途 |
|------|------|
| `src/views/` | 页面级组件，对应路由 |
| `src/components/ui/` | 通用 UI 组件，可复用 |
| `src/components/business/` | 业务组件，包含业务逻辑 |
| `src/layouts/` | 页面布局组件 |
| `src/stores/` | Pinia store 定义 |
| `src/api/` | API 请求封装 |
| `src/hooks/` | 自定义组合式函数 |
| `src/types/` | TypeScript 类型定义 |
| `src/mock/` | 模拟数据 |