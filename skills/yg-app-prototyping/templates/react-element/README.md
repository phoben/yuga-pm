# React + Element UI 模板

## 技术栈

- **框架**: React 18
- **UI 库**: Element Plus
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **样式**: SCSS Modules
- **语言**: TypeScript

## 项目结构

```
src/
├── app/              # 应用入口和路由配置
├── components/
│   ├── ui/           # 基础 UI 组件
│   └── business/     # 业务组件
├── layouts/          # 布局组件
├── hooks/            # 自定义 Hooks
├── lib/              # 工具函数
├── types/            # TypeScript 类型定义
├── mock/             # Mock 数据
└── styles/           # 全局样式
    ├── globals.scss
    └── tokens.scss   # 设计令牌
```

## 使用方式

### 1. 初始化项目

```bash
# 复制模板文件到目标目录
cp -r templates/react-element/* /path/to/your-project

# 进入项目目录
cd /path/to/your-project

# 安装依赖
pnpm install
# 或
npm install
```

### 2. 开发

```bash
# 启动开发服务器
pnpm dev
# 或
npm run dev
```

### 3. 构建

```bash
# 生产构建
pnpm build
# 或
npm run build
```

### 4. 代码检查

```bash
# 运行 lint
pnpm lint
# 或
npm run lint
```

## 目录说明

### components/ui/

存放基于 Element Plus 封装的基础 UI 组件，保持与 Element Plus API 的一致性。

### components/business/

存放业务相关的组件，可复用的业务逻辑组件。

### layouts/

存放页面布局组件，如：
- `MainLayout` - 主布局（侧边栏 + 内容区）
- `BlankLayout` - 空白布局

### hooks/

存放自定义 React Hooks，如：
- `useRequest` - 数据请求封装
- `useTable` - 表格数据管理
- `useForm` - 表单处理

### lib/

存放工具函数：
- `utils.ts` - 通用工具函数
- `request.ts` - Axios 请求封装
- `constants.ts` - 常量定义

### mock/

存放 Mock 数据文件，每个模块一个文件：
- `users.ts` - 用户相关 Mock
- `products.ts` - 产品相关 Mock

## Element Plus 配置

### 按需引入

项目使用 `unplugin-vue-components` 和 `unplugin-auto-import` 实现按需引入：

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

### 主题定制

在 `src/styles/tokens.scss` 中定义 CSS 变量：

```scss
:root {
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-info: #909399;
}
```

## 状态管理

使用 Zustand 进行状态管理：

```typescript
// src/stores/useUserStore.ts
import { create } from 'zustand'

interface UserState {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

## 路由配置

使用 React Router v6：

```typescript
// src/app/routes.tsx
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'users', element: <UserList /> },
      { path: 'users/:id', element: <UserDetail /> },
    ],
  },
])
```

## 注意事项

1. 确保安装了 Node.js 18+ 版本
2. 推荐使用 pnpm 作为包管理器
3. 组件命名使用 PascalCase
4. 样式文件使用 kebab-case
5. Mock 数据应使用 realistic 数据