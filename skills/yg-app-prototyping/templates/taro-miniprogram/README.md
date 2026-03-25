# Taro + Ant Design Mini 模板

## 技术栈

- **框架**: Taro 3
- **UI 库**: Ant Design Mini
- **开发语言**: TypeScript
- **状态管理**: Zustand (可选)
- **HTTP 请求**: Taro.request / Axios

## 项目结构

```
src/
├── app.config.ts        # 全局配置
├── app.tsx              # 入口文件
├── index.html           # H5 入口
├── pages/               # 页面目录
│   ├── index/           # 首页
│   │   ├── index.tsx
│   │   ├── index.config.ts
│   │   └── index.scss
│   └── ...              # 其他页面
├── components/          # 组件目录
│   ├── ui/              # 基础 UI 组件
│   └── business/        # 业务组件
├── services/            # API 服务
├── store/               # 状态管理
├── utils/               # 工具函数
├── types/               # 类型定义
└── mock/                # Mock 数据
```

## 使用方式

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发命令

```bash
# 微信小程序
pnpm dev:weapp

# 支付宝小程序
pnpm dev:alipay

# 字节跳动小程序
pnpm dev:swan

# H5
pnpm dev:h5
```

### 构建命令

```bash
# 微信小程序
pnpm build:weapp

# 支付宝小程序
pnpm build:alipay

# 字节跳动小程序
pnpm build:swan

# H5
pnpm build:h5
```

### 代码检查

```bash
pnpm lint
pnpm lint:fix
```

## 支持平台

| 平台 | 命令 | 说明 |
|-----|------|------|
| 微信小程序 | `dev:weapp` / `build:weapp` | 主要支持平台 |
| 支付宝小程序 | `dev:alipay` / `build:alipay` | 完整支持 |
| 字节跳动小程序 | `dev:swan` / `build:swan` | 完整支持 |
| H5 | `dev:h5` / `build:h5` | 用于开发调试 |

## 注意事项

1. 小程序开发需要安装对应的开发者工具
2. 微信小程序需要在 `project.config.json` 中配置 AppID
3. 使用 Ant Design Mini 组件前需要确保已在 `app.tsx` 中引入样式
4. Mock 数据仅用于原型演示，生产环境需替换为真实 API

## 相关链接

- [Taro 官方文档](https://taro.zone/docs)
- [Ant Design Mini 文档](https://mini.ant.design/)