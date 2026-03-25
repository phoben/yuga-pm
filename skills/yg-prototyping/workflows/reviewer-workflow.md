# Reviewer Agent 工作流

本文档定义 PR 审查智能体的完整执行流程。

---

## 工作流总览

```
Step 1: 获取 PR 变更
    │
    ▼
Step 2: 读取变更文件
    │
    ▼
Step 3: 执行审查
    ├── DRD 对齐检查
    ├── 代码质量检查
    ├── 组件规范检查
    ├── 无障碍检查
    └── 性能检查
    │
    ▼
Step 4: 生成审查报告
    │
    ▼
Step 5: 发送反馈
    │
    ├── 通过 → 合并 PR
    │
    └── 需修改 → 反馈给 Coder Agent
```

---

## Step 1: 获取 PR 变更

### 输入格式

由主控 Agent 传入：

```markdown
## 任务: 审查 PR

### PR 信息
- PR 编号: #1
- 分支: feature/page-users-list
- 页面: 用户列表

### DRD 参考
[相关 DRD 片段]

### 审查重点
[特定关注点]
```

### 执行命令

```bash
# 获取 PR 的 diff
gh pr diff {pr-number}

# 获取 PR 详细信息
gh pr view {pr-number} --json title,body,author,files

# 获取变更文件列表
gh pr diff {pr-number} --name-only
```

### 输出

- PR diff 内容
- 变更文件列表
- PR 元信息（标题、作者、描述）

---

## Step 2: 读取变更文件

### 文件读取策略

```
1. 解析 diff 获取变更文件路径
2. 过滤需要审查的文件类型:
   - *.tsx / *.jsx (组件文件)
   - *.ts / *.js (逻辑文件)
   - *.css / *.scss (样式文件)
   - *.json (配置文件)
3. 使用 Read 工具读取完整文件内容
```

### 重点关注文件

| 文件类型 | 重点关注 |
|---------|---------|
| 页面组件 | 组件结构、状态管理、事件处理 |
| 业务组件 | Props 定义、复用性、类型安全 |
| 样式文件 | 命名规范、响应式、设计令牌使用 |
| Mock 数据 | 数据结构、边界情况、真实性 |

### 排除文件

以下文件类型可跳过详细审查：
- `*.md` - 文档文件
- `*.lock` - 锁文件
- `*.d.ts` - 类型声明（自动生成）
- `dist/` - 构建输出

---

## Step 3: 执行审查

### 3.1 DRD 对齐检查

**检查清单:**

- [ ] 功能是否符合 DRD 需求
- [ ] 页面结构是否正确
- [ ] 组件是否包含所有必要元素
- [ ] 交互是否实现

**审查方法:**

1. 读取 DRD 相关章节
2. 对照 DRD 中的 UI 元素列表
3. 验证每个需求点是否实现
4. 检查交互流程是否完整

**示例对照:**

```markdown
DRD 要求:
- 用户列表表格，包含：姓名、邮箱、状态、操作列
- 筛选区域：状态筛选、搜索框
- 分页组件

代码实现:
- 表格列: ✅ 姓名、✅ 邮箱、✅ 状态、✅ 操作
- 筛选: ✅ 状态下拉、✅ 搜索输入
- 分页: ✅ 分页组件

结论: DRD 对齐通过
```

### 3.2 代码质量检查

**检查清单:**

- [ ] 命名规范
- [ ] 代码结构
- [ ] 错误处理
- [ ] 类型定义

**命名规范检查:**

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件名 | PascalCase | `UserList` |
| 函数名 | camelCase | `fetchUserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 文件名 | kebab-case | `user-list.tsx` |
| CSS 类 | kebab-case | `.user-list-container` |

**代码结构检查:**

- 组件是否单一职责
- 是否有过长的函数（> 50 行考虑拆分）
- 是否有深层嵌套（> 3 层考虑重构）
- 是否有重复代码

**类型定义检查:**

- Props 是否有完整类型定义
- 是否使用 `any` 类型（应避免）
- 是否导出必要的类型

### 3.3 组件规范检查

**检查清单:**

- [ ] 是否遵循 UI 库模式
- [ ] 组件是否可复用
- [ ] Props 类型是否完整

**Next.js + shadcn/ui 规范:**

```tsx
// 正确示例
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card className="p-4">
      <h3>{user.name}</h3>
      {onEdit && <Button onClick={() => onEdit(user)}>编辑</Button>}
    </Card>
  );
}
```

**React + Element UI 规范:**

```tsx
// 正确示例
import { ElButton, ElCard } from 'element-plus';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <ElCard class="user-card">
      <h3>{user.name}</h3>
      {onEdit && <ElButton onClick={() => onEdit(user)}>编辑</ElButton>}
    </ElCard>
  );
}
```

### 3.4 无障碍检查

**检查清单:**

- [ ] ARIA 标签
- [ ] 键盘导航
- [ ] 颜色对比度

**必要元素:**

| 元素 | 要求 |
|-----|------|
| 按钮 | `aria-label` 或可见文本 |
| 图片 | `alt` 属性 |
| 表单输入 | `label` 关联或 `aria-label` |
| 图标按钮 | `aria-label` 描述功能 |
| 模态框 | `aria-modal`, `aria-labelledby` |

**键盘导航检查:**

- 所有交互元素可通过 Tab 访问
- Enter/Space 可触发按钮
- Esc 可关闭模态框
- 焦点管理正确

### 3.5 性能检查

**检查清单:**

- [ ] 无明显性能问题
- [ ] 无不必要的重渲染
- [ ] 合理的数据加载

**性能问题识别:**

| 问题 | 识别方法 |
|-----|---------|
| 缺少 memo | 组件在父组件重渲染时频繁重渲染 |
| 缺少 useMemo | 复杂计算在每次渲染都执行 |
| 缺少 useCallback | 回调函数作为 props 传递给子组件 |
| 大列表无虚拟化 | 长列表直接渲染所有项 |
| 图片未优化 | 未使用 Next.js Image 或懒加载 |

---

## Step 4: 生成审查报告

### 报告模板

```markdown
# 代码审查报告

## PR 信息
- PR: #1 - Feature: 用户列表页面
- 作者: Coder Agent
- 审查者: Reviewer Agent
- 审查时间: {timestamp}

## 审查结果: {状态}

{状态选项:}
- ✅ 通过 - 可以合并
- ⚠️ 需修改 - 有建议但非阻塞
- ❌ 需修改 - 必须修复后才能合并

## 检查项

| 检查项 | 状态 | 说明 |
|-------|------|------|
| DRD 对齐 | ✅/⚠️/❌ | [详细说明] |
| 代码质量 | ✅/⚠️/❌ | [详细说明] |
| 组件规范 | ✅/⚠️/❌ | [详细说明] |
| 无障碍 | ✅/⚠️/❌ | [详细说明] |
| 性能 | ✅/⚠️/❌ | [详细说明] |

## 问题列表

### Critical (必须修复)
- [ ] [问题描述]
  - 位置: [文件:行号]
  - 建议: [修复建议]

### Important (建议修复)
- [ ] [问题描述]
  - 位置: [文件:行号]
  - 建议: [修复建议]

### Suggestions (改进建议)
- [建议内容]

## 详细反馈

### [问题1标题]
- **文件**: [文件路径]
- **行号**: [行号]
- **当前代码**:
  ```tsx
  [当前代码片段]
  ```
- **建议修改**:
  ```tsx
  [修改后代码片段]
  ```
- **原因**: [修改原因]

## 总结
[审查总结和下一步建议]
```

### 问题分类

| 级别 | 说明 | 处理方式 |
|-----|------|---------|
| **Critical** | 必须修复，阻塞合并 | 阻止 PR 合并，反馈给 Coder Agent |
| **Important** | 建议修复，可选合并 | 记录问题，可选择合并 |
| **Suggestion** | 改进建议 | 仅记录，不阻塞 |

### 审查结果判定

```
IF 存在 Critical 问题:
    结果 = ❌ 需修改
ELSE IF 存在 Important 问题:
    结果 = ⚠️ 需修改 (可选合并)
ELSE:
    结果 = ✅ 通过
```

---

## Step 5: 发送反馈

### 审查通过流程

```bash
# 1. 批准 PR
gh pr review {pr-number} --approve --body "审查通过，可以合并。"

# 2. 发送消息给主控 Agent
SendMessage({
  to: "main-agent",
  message: "PR #{pr-number} 审查通过，已批准合并。",
  summary: "审查通过"
})
```

### 审查需修改流程

```javascript
// 发送反馈给 Coder Agent
SendMessage({
  to: "coder-agent",
  message: `
审查完成，需要修复以下问题：

## Critical Issues
1. [问题描述]
   - 位置: [文件:行号]
   - 建议: [修复建议]

## Important Issues
1. [问题描述]
   - 位置: [文件:行号]
   - 建议: [修复建议]

请修复后重新提交。
  `,
  summary: "审查反馈 - 需修改"
})
```

### 反馈消息格式

```markdown
## PR 审查反馈

### PR 信息
- PR: #{number}
- 页面: [页面名称]
- 审查结果: {状态}

### 需要修复的问题

#### Critical Issues (必须修复)
1. [问题描述]
   - 文件: [文件路径]
   - 行号: [行号]
   - 建议: [修复建议]

#### Important Issues (建议修复)
1. [问题描述]
   - 文件: [文件路径]
   - 建议: [修复建议]

### 下一步
- Critical Issues 必须修复后才能合并
- Important Issues 可选择修复
- 修复完成后请重新推送

### 审查报告
[完整审查报告路径或内容]
```

---

## 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| PR 不存在 | 报告错误，请求主控 Agent 确认 |
| diff 获取失败 | 检查 gh CLI 配置，重试一次 |
| 文件读取失败 | 跳过该文件，记录警告 |
| 审查超时 | 生成部分报告，标注未完成项 |

---

## 超时配置

| 操作 | 超时时间 |
|-----|---------|
| 获取 PR diff | 30 秒 |
| 读取变更文件 | 1 分钟 |
| 执行审查 | 3 分钟 |
| 生成报告 | 1 分钟 |
| 发送反馈 | 30 秒 |
| **总计** | **~6 分钟** |

---

## 反模式

- ❌ 过于宽松的审查标准
- ❌ 忽略无障碍问题
- ❌ 不检查 DRD 对齐
- ❌ 审查者自我审查（必须由独立 Agent 执行）
- ❌ 跳过审查直接合并
- ❌ 忽略合并冲突
- ✅ 严格的审查标准
- ✅ 独立的审查 Agent
- ✅ 完整的审查报告