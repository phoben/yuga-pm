# Next.js + shadcn/ui 模板

## 技术栈

- Next.js 14 (App Router)
- shadcn/ui 组件库
- Tailwind CSS
- TypeScript
- Zustand (可选状态管理)

## 项目结构

```
src/
├── app/              # 页面路由
├── components/
│   ├── ui/           # shadcn/ui 组件
│   └── layout/       # 布局组件
├── lib/              # 工具函数
├── hooks/            # 自定义 hooks
├── types/            # 类型定义
└── mock/             # Mock 数据
```

## 使用方式

1. 复制模板文件到目标目录
2. 安装依赖: `pnpm install`
3. 启动开发: `pnpm dev`

## 基础组件

| 组件 | 来源 | 用途 |
|------|------|------|
| Button | shadcn/ui | 主要/次要/幽灵/危险按钮 |
| Input | shadcn/ui | 文本输入、文本域 |
| Card | shadcn/ui | 内容容器 |
| Table | shadcn/ui | 数据表格 |
| Dialog | shadcn/ui | 模态框 |
| Form | shadcn/ui | 表单处理 (配合 react-hook-form) |
| Select | shadcn/ui | 下拉选择 |
| Toast | shadcn/ui | 通知提示 |

## 环境要求

- Node.js >= 18
- pnpm >= 8 (推荐)