# 项目搭建规则

本文档定义如何为应用原型项目搭建基础结构。

---

## 项目目录结构

```
{project-name}/
├── src/
│   ├── app/              # 页面路由 (Next.js)
│   ├── pages/            # 页面路由 (React/Vue)
│   ├── components/
│   │   ├── ui/           # 基础 UI 组件
│   │   └── business/     # 业务组件
│   ├── lib/              # 工具函数
│   ├── hooks/            # 自定义 hooks
│   ├── types/            # 类型定义
│   ├── mock/             # Mock 数据
│   └── styles/           # 全局样式
├── public/               # 静态资源
├── package.json
├── tsconfig.json
└── README.md
```

---

## 项目初始化步骤

### Step 1: 创建项目目录

```bash
mkdir {project-name}
cd {project-name}
```

### Step 2: 初始化 Git 仓库

```bash
git init
echo "node_modules/\n.next/\ndist/\n.env.local" > .gitignore
git add .gitignore
git commit -m "chore: initialize project"
```

### Step 3: 生成设计令牌

根据技术栈创建设计令牌文件：

**Tailwind CSS (Next.js):**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
    },
  },
}
```

**CSS Variables (通用):**
```css
/* styles/tokens.css */
:root {
  /* Colors */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### Step 4: 安装依赖

根据技术栈安装依赖：

**Next.js + shadcn/ui:**
```bash
pnpm create next-app@latest . --typescript --tailwind --eslint
pnpm add lucide-react zustand
```

**React + Element UI:**
```bash
pnpm create vite@latest . --template react-ts
pnpm add element-plus react-router-dom zustand
```

**Vue + Element Plus:**
```bash
pnpm create vite@latest . --template vue-ts
pnpm add element-plus vue-router pinia
```

**Taro:**
```bash
pnpm create taro@latest .
pnpm add antd-mini
```

---

## Scaffolding 检查清单

### 基础结构

- [ ] 项目目录已创建
- [ ] Git 仓库已初始化
- [ ] .gitignore 已配置
- [ ] README.md 已创建

### 源码结构

- [ ] src/ 目录已创建
- [ ] components/ 目录已创建 (ui/, business/)
- [ ] lib/ 目录已创建
- [ ] hooks/ 目录已创建
- [ ] types/ 目录已创建
- [ ] mock/ 目录已创建

### 配置文件

- [ ] package.json 已创建
- [ ] tsconfig.json 已配置
- [ ] ESLint 配置已添加
- [ ] 设计令牌已配置

### 依赖安装

- [ ] 核心依赖已安装
- [ ] UI 库已安装
- [ ] 开发依赖已安装
- [ ] 项目可以正常启动

---

## 初始化验证

完成初始化后，运行以下命令验证：

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行 lint
pnpm lint
```

---

## 反模式

- ❌ 目录结构不一致
- ❌ 忽略 Git 初始化
- ❌ 跳过依赖安装检查
- ❌ 未配置设计令牌
- ❌ 缺少 README 文档