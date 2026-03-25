# Coder Agent 工作流

本文档定义 Coder Agent 的完整执行流程。

---

## 工作流总览

```
Coder Agent 工作流
│
├── Step 1: 创建分支
│   ├── 切换到基础分支
│   ├── 拉取最新代码
│   └── 创建功能分支
│
├── Step 2: 生成页面组件
│   ├── 分析任务文档
│   ├── 读取 DRD 设计规范
│   └── 生成页面代码
│
├── Step 3: 生成 Mock 数据
│   ├── 创建数据结构
│   ├── 生成测试数据
│   └── 导出数据模块
│
├── Step 4: 运行 Lint 检查
│   ├── 执行 lint 命令
│   ├── 自动修复问题
│   └── 验证通过
│
├── Step 5: 提交代码
│   ├── 暂存变更
│   ├── 创建提交
│   └── 推送分支
│
└── Step 6: 创建 PR
    ├── 生成 PR 标题
    ├── 填写 PR 描述
    └── 提交 PR
```

---

## 重要区分

> **注意：** Coder Agent 只负责 linting/formatting，**不负责代码审查**。

| 职责 | 负责方 | 说明 |
|------|--------|------|
| Lint/格式化 | Coder Agent | 捕获语法和风格问题 |
| 代码审查 | Reviewer Agent | 审查代码质量、架构、DRD 对齐 |

**反模式：**
- ❌ Coder Agent 自我审查代码质量
- ❌ 跳过 lint 检查直接提交
- ✅ 严格区分 lint 检查和代码审查

---

## Step 1: 创建分支

### 操作流程

```bash
# 1. 切换到基础分支
git checkout main

# 2. 拉取最新代码
git pull origin main

# 3. 创建功能分支
git checkout -b feature/page-{page-name}
```

### 分支命名规范

| 场景 | 分支命名模式 | 示例 |
|------|-------------|------|
| 功能页面 | `feature/page-{name}` | `feature/page-user-list` |
| 共享组件 | `feature/component-{name}` | `feature/component-user-card` |
| Bug 修复 | `fix/{desc}` | `fix/login-validation` |

### 错误处理

| 错误 | 处理方式 |
|------|---------|
| 分支已存在 | 切换到现有分支或报告冲突 |
| 拉取失败 | 检查网络连接，重试一次 |
| 权限问题 | 报告给 Main Agent |

---

## Step 2: 生成页面组件

### 输入解析

从任务文档中提取：
- 页面 ID 和名称
- 页面类型（列表页/详情页/表单页/仪表盘）
- 路由路径
- DRD 设计规范片段

### 页面类型模板

| 页面类型 | 典型结构 | 关键组件 |
|---------|---------|---------|
| 列表页 | 筛选区 + 表格 + 分页 | Filter, Table, Pagination |
| 详情页 | 信息卡片组 | Card, Descriptions, Avatar |
| 表单页 | 表单字段 + 提交按钮 | Form, Input, Select, Button |
| 仪表盘 | 数据卡片 + 图表 | StatCard, Chart, Progress |

### 代码生成规范

#### Next.js + shadcn/ui

```tsx
// src/app/users/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">用户列表</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

#### React + Element UI

```tsx
// src/pages/users/index.tsx
import { ElButton, ElTable } from 'element-plus';

export default function UsersPage() {
  return (
    <div className="page-container">
      <h1>用户列表</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

#### Vue + Element Plus

```vue
<!-- src/views/users/index.vue -->
<template>
  <div class="page-container">
    <h1>用户列表</h1>
    <!-- 页面内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>
```

### 代码质量要求

- [ ] 使用 TypeScript 类型定义
- [ ] 遵循技术栈最佳实践
- [ ] 组件命名使用 PascalCase
- [ ] 添加必要的注释
- [ ] 处理错误状态和空状态

---

## Step 3: 生成 Mock 数据

### Mock 数据结构

```typescript
// src/mock/{entity}.ts

// 类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Mock 数据
export const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    status: 'inactive',
    createdAt: '2024-02-20',
  },
  // ... 更多数据
];
```

### Mock 数据规范

| 规范 | 说明 |
|------|------|
| 真实性 | 使用真实可信的中文数据 |
| 完整性 | 覆盖所有必要字段 |
| 边界情况 | 包含空值、边界值等 |
| 数量 | 每种类型至少 5-10 条记录 |

### Mock 数据位置

```
src/mock/
├── index.ts          # 统一导出
├── users.ts          # 用户数据
├── products.ts       # 产品数据
└── orders.ts         # 订单数据
```

---

## Step 4: 运行 Lint 检查

### 执行流程

```bash
# 1. 执行 lint 检查
npm run lint

# 2. 如果有错误，尝试自动修复
npm run lint -- --fix

# 3. 再次检查确认通过
npm run lint
```

### Lint 检查项

| 检查项 | 说明 |
|--------|------|
| 语法错误 | 捕获 TypeScript/ESLint 错误 |
| 代码风格 | 缩进、引号、分号等 |
| 未使用变量 | 检测未使用的导入和变量 |
| 类型错误 | TypeScript 类型检查 |

### 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 可自动修复 | 运行 `--fix` 自动修复 |
| 无法自动修复 | 记录错误，报告给 Main Agent |
| 超时 | 设置 1 分钟超时，超时则报告 |

### 超时设置

```yaml
lint_timeout: 1 minute
```

---

## Step 5: 提交代码

### 提交流程

```bash
# 1. 暂存所有变更
git add .

# 2. 创建提交
git commit -m "feat: add {page-name} page

- Add page component with {tech-stack}
- Add mock data for the page
- Implement UI according to DRD specs"

# 3. 推送到远程
git push origin feature/page-{page-name}
```

### Commit 消息规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### 错误处理

| 错误 | 处理方式 |
|------|---------|
| 推送失败 | 检查凭证，尝试重新认证 |
| 冲突 | 报告给 Main Agent 处理 |
| 权限问题 | 报告给 Main Agent |

---

## Step 6: 创建 PR

### PR 创建命令

```bash
gh pr create --title "feat: add {page-name} page" --body "
## Summary
- Add {page-name} page component
- Add mock data for the page
- Follow design specs from DRD

## Changes
- \`src/app/{route}/page.tsx\` - Page component
- \`src/mock/{entity}.ts\` - Mock data

## Test plan
- [ ] Page renders correctly
- [ ] Mock data displays properly
- [ ] Interactions work as expected
- [ ] Responsive design verified

## Related
- Task ID: T001
- Page ID: P001
"
```

### PR 描述模板

```markdown
## Summary
<!-- 简要描述此 PR 的目的 -->

## Changes
<!-- 列出变更的文件和内容 -->

## Test plan
<!-- 测试检查清单 -->

## Related
<!-- 关联的任务 ID、页面 ID -->
```

### 错误处理

| 错误 | 处理方式 |
|------|---------|
| gh CLI 未安装 | 报告给 Main Agent |
| 认证失败 | 提示重新认证 |
| 远程仓库未配置 | 报告给 Main Agent |

---

## 完成通知

PR 创建成功后，通过 SendMessage 通知 Main Agent：

```javascript
SendMessage({
  to: "main-agent",
  message: "PR created successfully: #{pr-number}",
  summary: {
    taskId: "T001",
    pageId: "P001",
    branch: "feature/page-users-list",
    prNumber: 1,
    status: "ready_for_review"
  }
})
```

---

## 超时配置汇总

| 操作 | 超时时间 | 说明 |
|------|---------|------|
| 代码生成 | 3 分钟 | 复杂页面可能需要更多时间 |
| Lint 检查 | 1 分钟 | 快速检查 |
| Git 操作 | 30 秒 | 网络依赖 |
| PR 创建 | 1 分钟 | API 依赖 |

---

## 反模式汇总

- ❌ 跳过环境检查
- ❌ 跳过 lint 检查
- ❌ 自我审查代码质量（应由 Reviewer Agent 负责）
- ❌ 忽略错误继续执行
- ❌ 无超时限制的操作
- ❌ 假设远程仓库已配置

---

## 最佳实践

1. **始终从最新代码创建分支** - 避免冲突
2. **lint 通过后再提交** - 保证代码质量
3. **使用语义化 commit 消息** - 便于追踪
4. **PR 描述清晰完整** - 方便审查
5. **及时通知完成状态** - 保持同步