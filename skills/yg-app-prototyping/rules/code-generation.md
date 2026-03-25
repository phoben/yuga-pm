# 代码生成规则

本文档定义代码生成标准、Agent 分配策略和上下文优化策略。

---

## 代码生成标准

### 基本原则

- 遵循所选技术栈的最佳实践
- 使用统一的命名规范
- 包含必要的类型定义
- 添加适当的代码注释
- 保持代码风格一致

### 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件文件 | PascalCase | `UserList.tsx` |
| 页面文件 | kebab-case | `user-list/page.tsx` |
| Hook 文件 | camelCase + use 前缀 | `useUserData.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型文件 | PascalCase | `UserTypes.ts` |
| Mock 文件 | camelCase + mock 前缀 | `mockUsers.ts` |

### 组件规范

**Next.js + shadcn/ui:**

```tsx
// src/app/users/page.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function UsersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">用户列表</h1>
      {/* 组件内容 */}
    </div>
  );
}
```

**React + Element UI:**

```tsx
// src/pages/users/index.tsx
import { ElButton, ElTable } from 'element-plus';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function UsersPage() {
  return (
    <div className="page-container">
      <h1>用户列表</h1>
      {/* 组件内容 */}
    </div>
  );
}
```

### 类型定义要求

- 所有 Props 必须定义 TypeScript 接口
- API 响应数据必须有类型定义
- 避免使用 `any` 类型
- 优先使用类型推断

---

## Agent 分配策略

### 并行 vs 顺序决策矩阵

| 场景 | 策略 | 原因 |
|-----|------|------|
| 独立页面（无依赖） | 全部并行 | 最大化效率 |
| 有依赖的页面 | 依赖完成后并行 | 保持顺序 |
| 共享组件的页面 | 先生成共享组件 | 避免重复 |

### 并行数量策略

| 页面数 | 策略 | 并行数量 |
|-------|------|---------|
| 1-3 页 | 全部并行 | 全部 |
| 4-8 页 | 分批并行 | 4/批 |
| 9+ 页 | 依赖优先 | 5/批 |

### 并行限制

**最大并行 Agent 数：5**

超过限制时按优先级分批处理。

**原因：**
- 上下文窗口限制
- 内存消耗
- 系统稳定性

### 并行启动示例

```javascript
// 在单次消息中启动多个 Agent（后台模式）
Agent({
  subagent_type: "general-purpose",
  description: "生成用户列表页面",
  prompt: `
    ## 任务: 生成页面 [用户列表]
    ... 任务文档内容 ...
  `,
  run_in_background: true
})

Agent({
  subagent_type: "general-purpose",
  description: "生成设置页面",
  prompt: `
    ## 任务: 生成页面 [设置]
    ... 任务文档内容 ...
  `,
  run_in_background: true
})
```

---

## 上下文优化策略

### 策略 1: 独立任务文档

每个页面任务文档包含完整的设计规范：

```markdown
# 任务: [页面名称]

## 元信息
- 任务 ID: T001
- 页面 ID: P001
- 类型: 列表页
- 优先级: High
- 依赖: []

## 设计规范
[完整的 DRD 片段，无需引用外部文档]

## 组件清单
| 组件 | 类型 | 说明 |
|-----|------|------|

## 交付标准
- [ ] 页面渲染正确
- [ ] 交互功能完整
- [ ] Mock 数据展示
```

**优势：** Agent 无需访问原始 DRD，减少上下文切换。

### 策略 2: 模板引用

代码模板通过路径引用，不重复内容：

```javascript
// 正确做法
import { Button } from '@/components/ui/button';
// 模板位置: templates/nextjs-shadcn/src/components/ui/button.tsx

// 错误做法
// 在任务文档中复制整个 Button 组件代码
```

**优势：** 减少文档体积，保持模板一致性。

### 策略 3: 增量输出

Agent 完成任务后立即释放上下文：

```
Coder Agent 完成流程:
1. 接收任务文档
2. 生成代码
3. 运行 Lint
4. 提交 PR
5. 发送完成通知 ← 此后上下文释放
```

**优势：** 防止上下文累积，保持高效。

### 策略 4: 结果摘要

主控 Agent 只接收关键结果：

```javascript
// 正确做法：发送摘要
SendMessage({
  to: "main-agent",
  message: "页面 [用户列表] 完成。PR #1 已创建。",
  summary: "生成完成: 用户列表页面"
})

// 错误做法：发送完整代码
SendMessage({
  to: "main-agent",
  message: `
    // 500行代码...
    export default function UsersPage() { ... }
  `,
  summary: "用户列表代码"
})
```

**优势：** 主控 Agent 上下文不会因代码量而膨胀。

---

## 超时配置

| 操作 | 超时时间 | 原因 |
|-----|---------|------|
| 单页面代码生成 | 3 分钟 | 复杂页面需要时间 |
| Lint 检查 | 1 分钟 | 快速检查 |
| Git 操作 | 30 秒 | 依赖网络 |
| PR 创建 | 1 分钟 | 依赖 API |

---

## 错误处理

| 错误类型 | 处理方式 | 重试限制 |
|---------|---------|---------|
| Agent 超时 | 重新分配任务，缩小范围 | 2 次 |
| 代码生成失败 | 回退到模板填充 | 1 次 |
| Lint 失败 | 自动修复 (`--fix`) | 1 次 |
| Git 推送失败 | 检查凭证，重新认证 | 1 次 |
| PR 创建失败 | 检查 gh CLI 配置 | 1 次 |

---

## 反模式

### 不要这样做

- 超过 5 个 Agent 并行运行
- Coder Agent 自我审查代码
- 在任务文档中复制完整代码模板
- 主控 Agent 接收完整代码输出
- 忽略页面依赖关系

### 应该这样做

- 控制并行数量在 5 个以内
- 由独立的 Reviewer Agent 审查代码
- 任务文档包含完整设计规范
- 主控 Agent 只接收结果摘要
- 按依赖关系顺序派发任务