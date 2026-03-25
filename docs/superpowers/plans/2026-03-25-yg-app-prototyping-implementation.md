# yg-app-prototyping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Reference Document:** Complete content for rules, workflows, and templates is in the spec:
> `docs/superpowers/specs/2026-03-25-yg-app-prototyping-skill-design.md`
> Each task below includes key excerpts; the spec has the full detailed content.

**Goal:** Create a new skill for generating functional application prototypes from requirements documents using Agent Team coordination.

**Architecture:** Master-slave agent pattern with Main Agent orchestrating Writer, Coder, and Reviewer agents. Each page becomes an independent development task with branch/PR workflow and review gates.

**Tech Stack:** Claude Code plugin architecture with skills, agents, rules, workflows, and templates.

---

## Spec Reference Map

| Plan Task | Spec Section | Content Reference |
|-----------|-------------|-------------------|
| Task 6: tech-stack-selection.md | Spec 4.1 Step 0.3 + 5.2-5.5 | Tech stack matrix, AskUserQuestion examples |
| Task 7: drd-handling.md | Spec 4.1 Step 0.2 | DRD detection/generation flow |
| Task 8: project-setup.md | Spec 4.1 Step 0.4 | Project scaffolding checklist |
| Task 9: task-planning.md | Spec 4.1 Step 0.5 + 4.2 | Task planning flow, Git branch strategy |
| Task 10: code-generation.md | Spec 6.2 + 6.4 | Agent dispatch strategy, context management |
| Task 11: review-workflow.md | Spec 4.3 | Review & merge flow, review report template |
| Task 12: mock-data.md | Spec 6.5 | Mock data strategy and standards |
| Task 13: master-workflow.md | Spec 4.1-4.4 | Complete workflow phases |
| Task 14: coder-workflow.md | Spec 3.4 + agents/page-coder.md | Coder agent workflow |
| Task 15: reviewer-workflow.md | Spec 3.5 + agents/pr-reviewer.md | Reviewer agent workflow |
| Tasks 16-19: Templates | Spec 5.1-5.6 | Tech stack configs, design tokens |

---

## File Structure

```
skills/yg-app-prototyping/
├── SKILL.md                    # Main skill definition
├── AGENTS.md                   # Compiled rules for agents
├── rules/
│   ├── tech-stack-selection.md # Tech stack decision logic
│   ├── drd-handling.md         # DRD detection/generation
│   ├── project-setup.md        # Project scaffolding
│   ├── task-planning.md        # Page-level task planning
│   ├── code-generation.md      # Code standards
│   ├── review-workflow.md      # Review & merge flow
│   └── mock-data.md            # Mock data guidelines
├── workflows/
│   ├── master-workflow.md      # Main agent flow
│   ├── coder-workflow.md       # Coder agent flow
│   └── reviewer-workflow.md    # Reviewer agent flow
└── templates/
    ├── nextjs-shadcn/          # Next.js template
    ├── react-element/          # React + Element UI template
    ├── vue-element/            # Vue + Element Plus template
    └── taro-miniprogram/       # Taro template

agents/
├── drd-writer.md               # DRD generation agent
├── page-coder.md               # Page coding agent
└── pr-reviewer.md              # PR review agent
```

---

## Phase 1: Core Skill Files

### Task 1: Create SKILL.md

**Files:**
- Create: `skills/yg-app-prototyping/SKILL.md`

- [ ] **Step 1: Create SKILL.md with frontmatter and overview**

```yaml
---
name: yg-app-prototyping
description: |
  从需求文档生成功能代码原型。支持 Next.js + shadcn/ui、React + Element UI、Vue + Element Plus、Taro。
  使用 Agent Team 进行并行开发，包含代码审查关卡。
  触发场景：创建应用原型、代码原型、功能原型、可运行原型。
  当用户提及：应用原型、代码原型、功能原型、可运行原型时使用此技能。
license: MIT
metadata:
  author: yuga-pm
  version: "1.0.0"
  supports_tech_stacks:
    - nextjs-shadcn
    - react-element
    - vue-element
    - taro-miniprogram
---

# 应用原型生成

你是一位专业的应用原型工程师，擅长从需求文档快速生成可运行的功能代码原型。你帮助产品经理验证需求、加速开发流程、减少沟通成本。

## 适用场景

使用此技能当：
- 从需求文档生成可运行代码原型
- 需要包含组件、路由、状态管理的完整项目
- 需要多页面应用而非静态 HTML
- 需要真实代码用于开发评审或演示

## 与 yg-prototyping 的区别

| 技能 | 输出 | 适用场景 |
|-----|------|---------|
| yg-prototyping | 静态 HTML | 快速验证、设计评审 |
| yg-app-prototyping | 功能代码 | 开发就绪、组件化项目 |

## 如何使用此技能

此技能包含详细规则在 `rules/` 目录中。

### 快速开始

1. 查阅 [AGENTS.md](AGENTS.md) 获取完整规则汇编
2. 参考具体规则深入了解特定主题
3. 遵循工作流顺序执行

### 可用规则

| 优先级 | 规则 | 描述 |
|-------|------|------|
| 🔵 前置 | [技术栈选择](rules/tech-stack-selection.md) | 技术栈决策、环境检查 |
| 🔵 前置 | [DRD处理](rules/drd-handling.md) | DRD检测、生成、验证 |
| 🔴 关键 | [项目搭建](rules/project-setup.md) | 项目脚手架、依赖安装 |
| 🔴 关键 | [任务规划](rules/task-planning.md) | 页面级任务、依赖管理 |
| 🟡 高 | [代码生成](rules/code-generation.md) | 组件模式、命名规范 |
| 🟡 高 | [审查流程](rules/review-workflow.md) | 审查检查、合并流程 |
| 🟢 中等 | [Mock数据](rules/mock-data.md) | 数据结构、生成规范 |

## 工作流模式

此技能采用主从协调模式：

```
┌─────────────────────────────────────────────────────────────┐
│                    主控 Agent                                │
│  ├── 阶段0: 初始化（环境检查、DRD处理、技术栈选择）           │
│  ├── 阶段1: 任务规划与并行开发                                │
│  ├── 阶段2: 审查与合并                                       │
│  └── 阶段3: 集成测试                                         │
└─────────────────────────────────────────────────────────────┘
```

详细工作流请参考 `workflows/` 目录。

## 使用方式

```bash
# 基本调用
/yg-app-prototyping

# 指定文档
/yg-app-prototyping --doc ./docs/DRD.md

# 指定技术栈
/yg-app-prototyping --tech nextjs-shadcn

# 指定输出目录
/yg-app-prototyping --output ./prototypes/my-app

# 跳过 DRD 生成
/yg-app-prototyping --skip-drd
```

### 命令参数说明

| 参数 | 说明 | 默认值 |
|-----|------|-------|
| `--doc` | 需求文档路径 | 当前上下文文档 |
| `--tech` | 技术栈 | 交互选择 |
| `--output` | 输出目录 | `./prototypes/{project-name}` |
| `--skip-drd` | 跳过 DRD 生成 | false |
| `--parallel` | 最大并行 Agent 数 | 5 |

## 注意事项

1. 确保环境满足要求（Node.js 18+、Git、GitHub CLI）
2. 建议先完成 DRD 再开始原型开发
3. 复杂项目建议分批开发
4. 每个 PR 必须通过审查才能合并
```

- [ ] **Step 2: Commit SKILL.md**

```bash
git add skills/yg-app-prototyping/SKILL.md
git commit -m "feat(yg-app-prototyping): add main skill definition"
```

---

### Task 2: Create AGENTS.md

**Files:**
- Create: `skills/yg-app-prototyping/AGENTS.md`

- [ ] **Step 1: Create AGENTS.md with compiled rules**

```markdown
# 应用原型生成 — 完整规则汇编

本文档整合了应用原型生成技能的所有规则、指南和最佳实践，按优先级组织。

---

## 前置：环境检查

### 环境检查清单

| 检查项 | 检查命令 | 要求 | 失败处理 |
|-------|---------|------|---------|
| Node.js | `node -v` | >= 18.0.0 | 提示安装 Node.js 18+ |
| Git | `git --version` | 已安装 | 提示安装 Git |
| GitHub CLI | `gh --version` | 已安装 | 提示安装 gh CLI |
| 包管理器 | `pnpm -v` | pnpm 优先 | 使用 npm 作为备选 |

### 环境处理策略

使用 AskUserQuestion 工具让用户选择：

```json
{
  "questions": [{
    "question": "环境检查失败：Node.js 版本过低。如何处理？",
    "header": "环境处理",
    "multiSelect": false,
    "options": [
      { "label": "安装新版本", "description": "执行 nvm install 18 安装 Node.js 18+" },
      { "label": "继续使用", "description": "继续使用当前环境（可能存在兼容性问题）" },
      { "label": "取消操作", "description": "等待环境准备就绪后再进行" }
    ]
  }]
}
```

**反模式：** 跳过环境检查导致后续报错 · 假设 GitHub CLI 必定安装 · 忽略远程仓库配置

---

## 优先级 0：技术栈选择

> 详细内容：[rules/tech-stack-selection.md](rules/tech-stack-selection.md)

### 技术栈决策矩阵

| 项目类型 | 推荐技术栈 | 说明 |
|---------|-----------|------|
| Web 后台管理系统 | React + Element UI / Vue + Element Plus | 组件丰富，表单处理强 |
| 营销/官网 | Next.js + shadcn/ui | SEO 友好，现代体验 |
| 移动端 H5 | React + Ant Design Mobile | 移动端优化 |
| 小程序 | Taro + Ant Design Mini | 跨端支持 |
| 简单原型 | Next.js + shadcn/ui | 快速搭建 |

### 技术栈确认流程

1. 检查 DRD 是否已指定技术栈
2. 如已指定，使用 AskUserQuestion 确认
3. 如未指定，让用户选择

**反模式：** 假设技术栈不确认 · 使用静态 HTML 技术栈处理复杂应用 · 忽略用户偏好

---

## 优先级 1：DRD 处理

> 详细内容：[rules/drd-handling.md](rules/drd-handling.md)

### DRD 智能处理流程

```
检测 DRD 文档
    │
    ├── 存在 → 验证格式 → 有效 → 使用 DRD
    │              └── 无效 → 重新生成
    │
    └── 不存在 → 检测 PRD → 存在 → 调用 Writer Agent 生成 DRD
                          └── 不存在 → 询问用户提供文档
```

### DRD 验证清单

- [ ] 包含设计规范
- [ ] 包含页面结构
- [ ] 包含交互流程
- [ ] 包含组件清单

**反模式：** 跳过 DRD 直接开始编码 · 使用不完整的 DRD · 忽略 DRD 验证

---

## 优先级 2：项目搭建

> 详细内容：[rules/project-setup.md](rules/project-setup.md)

### 项目目录结构

```
{project-name}/
├── src/
│   ├── app/              # 页面路由
│   ├── components/       # 组件
│   │   ├── ui/           # 基础 UI 组件
│   │   └── business/     # 业务组件
│   ├── lib/              # 工具函数
│   ├── hooks/            # 自定义 hooks
│   ├── types/            # 类型定义
│   └── mock/             # Mock 数据
├── public/
├── styles/
├── package.json
└── tsconfig.json
```

### 项目初始化步骤

1. 创建项目目录
2. 初始化 Git 仓库
3. 生成设计令牌
4. 安装依赖

**反模式：** 目录结构不一致 · 忽略 Git 初始化 · 跳过依赖安装检查

---

## 优先级 3：任务规划

> 详细内容：[rules/task-planning.md](rules/task-planning.md)

### 任务规划流程

1. 提取页面清单（从 DRD）
2. 标记页面优先级
3. 识别页面依赖关系
4. 生成任务文档
5. 创建任务列表（TaskCreate）

### Git 分支策略

| 场景 | 分支命名模式 | 示例 |
|-----|-------------|------|
| 功能页面 | `feature/page-{name}` | `feature/page-user-list` |
| 共享组件 | `feature/component-{name}` | `feature/component-user-card` |
| Bug 修复 | `fix/{desc}` | `fix/login-validation` |

**反模式：** 忽略页面依赖 · 分支命名不一致 · 任务文档缺失

---

## 优先级 4：代码生成

> 详细内容：[rules/code-generation.md](rules/code-generation.md)

### 代码生成标准

- 遵循技术栈最佳实践
- 使用统一的命名规范
- 包含必要的类型定义
- 添加适当的注释

### Agent 分配策略

| 页面数 | 策略 | 并行数 |
|-------|------|-------|
| 1-3 页 | 全部并行 | 全部 |
| 4-8 页 | 分批并行 | 4/批 |
| 9+ 页 | 依赖优先 | 5/批 |

**反模式：** 超过 5 个 Agent 并行 · 忽略代码规范 · 缺少类型定义

---

## 优先级 5：审查流程

> 详细内容：[rules/review-workflow.md](rules/review-workflow.md)

### 审查流程

```
PR 就绪
    │
    ▼
审查者 Agent 审查
    │
    ├── 通过 → 合并 PR → 标记任务完成
    │
    └── 需修改 → 反馈给 Coder Agent → 修复 → 重新审查
```

### 审查检查项

| 检查项 | 说明 |
|-------|------|
| DRD 对齐 | 代码是否符合设计需求 |
| 代码质量 | 命名、结构、错误处理 |
| 组件规范 | 是否遵循 UI 库模式 |
| 无障碍 | ARIA 标签、键盘导航 |
| 性能 | 是否有明显瓶颈 |

**反模式：** Coder Agent 自我审查 · 跳过审查直接合并 · 忽略合并冲突

---

## 优先级 6：Mock 数据

> 详细内容：[rules/mock-data.md](rules/mock-data.md)

### Mock 数据策略

1. **全局 Mock**: 项目初始化时生成
2. **页面 Mock**: 每个页面任务时生成

### Mock 数据规范

- 使用 realistic 数据
- 覆盖边界情况
- 符合业务逻辑
- 中文场景使用中文假数据

**反模式：** 使用无意义测试数据 · 忽略边界情况 · 数据结构不一致
```

- [ ] **Step 2: Commit AGENTS.md**

```bash
git add skills/yg-app-prototyping/AGENTS.md
git commit -m "feat(yg-app-prototyping): add compiled rules document"
```

---

## Phase 2: Agent Definitions

### Task 3: Create drd-writer.md Agent

**Files:**
- Create: `agents/drd-writer.md`

- [ ] **Step 1: Create DRD Writer agent definition**

```yaml
---
description: DRD生成智能体 - 从需求文档生成设计需求文档
capabilities:
  - 需求文档解析
  - UI元素提取
  - 交互逻辑识别
  - DRD文档生成
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# DRD 生成智能体

你是一个 DRD 生成智能体，负责从 PRD 或需求文档生成结构化的设计需求文档（DRD）。

## 核心职责

1. **解析需求文档** - 读取 PRD 或系统设计文档
2. **提取设计要素** - 识别 UI 布局、组件、交互
3. **生成 DRD 文档** - 按照 DRD 模板输出完整文档

## 输入格式

由主控 Agent 传入：

```
## 任务: 生成 DRD 文档

### 输入文档
[PRD 文档路径或内容]

### 输出路径
[DRD 文档保存路径]
```

## DRD 文档结构

生成的 DRD 应包含以下章节：

### 1. 文档信息
- 项目名称、版本、日期、来源 PRD

### 2. 设计规范
- 配色方案（CSS 变量）
- 字体规范
- 间距规范
- 交互动效

### 3. 页面结构
- 页面清单
- 导航结构
- 页面入口

### 4. 用户角色与权限
- 角色定义
- 权限矩阵

### 5. 功能需求
- 每个页面/模块的功能描述
- UI 元素列表
- 交互说明

### 6. 数据展示规范
- 数据表格/列表
- 表单字段与验证
- 状态显示（空状态、加载、错误、成功）

### 7. 交互流程
- 关键业务流程图

### 8. 组件清单
- 公共组件
- 业务组件

## 过滤规则

| 保留 | 丢弃 |
|-----|------|
| UI 布局和页面结构 | 后端 API 实现细节 |
| 用户交互和流程 | 数据库 schema 设计 |
| 表单字段和验证规则 | 服务端逻辑 |
| 数据展示要求 | 基础设施/DevOps 规范 |
| 错误状态和反馈 | 业务指标（除非在 UI 中展示） |
| 导航和路由 | 第三方服务集成（除非与 UI 相关） |

## 输出示例

```markdown
# 设计需求文档 (DRD)

## 1. 文档信息

| 字段 | 值 |
|-----|-----|
| 项目名称 | 用户管理系统 |
| 版本 | 1.0 |
| 创建日期 | 2026-03-25 |
| 来源 PRD | PRD_用户管理系统_v1.0.md |

## 2. 设计规范

### 2.1 配色方案

| Token | 值 | 用途 |
|-------|-----|------|
| --color-primary | #1890ff | 主要操作 |
| --color-success | #52c41a | 成功状态 |
| --color-error | #ff4d4f | 错误状态 |
...
```

## 注意事项

1. 严格区分前端可见需求和后端实现
2. 提取 UI 相关的所有细节
3. 保持 DRD 的完整性和可操作性
4. 使用中文撰写文档
```

- [ ] **Step 2: Commit drd-writer.md**

```bash
git add agents/drd-writer.md
git commit -m "feat(yg-app-prototyping): add DRD writer agent definition"
```

---

### Task 4: Create page-coder.md Agent

**Files:**
- Create: `agents/page-coder.md`

- [ ] **Step 1: Create Page Coder agent definition**

```yaml
---
description: 页面编码智能体 - 生成指定页面的完整代码
capabilities:
  - DRD解析
  - 页面代码生成
  - 组件开发
  - Lint检查
  - Git操作
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
---

# 页面编码智能体

你是一个页面编码智能体，负责生成指定页面的完整代码，包含组件、样式和 Mock 数据。

## 核心职责

1. **解析任务文档** - 读取页面级任务文档
2. **生成页面代码** - 组件、路由、样式
3. **创建 Mock 数据** - 页面相关数据
4. **运行 Lint 检查** - 代码风格验证
5. **提交代码** - Git 操作

## 重要区分

- **Lint/格式化**: 你运行 `npm run lint` 捕获语法和风格问题
- **代码审查**: 由独立的审查者 Agent 负责
- 永远不要自我审查代码质量

## 输入格式

```markdown
## 任务: 生成页面 [页面名称]

### 页面信息
- 页面ID: P001
- 页面类型: 列表页/详情页/表单页
- 所属模块: [模块名]
- 路由路径: /users/list

### 设计规范
[DRD 片段、组件规范、样式规范]

### 技术栈
- 框架: Next.js 14
- UI库: shadcn/ui
- 样式: Tailwind CSS

### 分支信息
- 目标分支: feature/page-users-list
- 基础分支: main

### 交付要求
1. 页面组件代码
2. Mock 数据
```

## 工作流程

### Step 1: 创建分支

```bash
git checkout main
git pull origin main
git checkout -b feature/page-{page-name}
```

### Step 2: 生成页面组件

根据页面类型生成代码：

| 页面类型 | 典型结构 |
|---------|---------|
| 列表页 | 筛选区 + 表格 + 分页 |
| 详情页 | 信息卡片组 |
| 表单页 | 表单字段 + 提交按钮 |
| 仪表盘 | 数据卡片 + 图表 |

### Step 3: 生成 Mock 数据

```typescript
// src/mock/users.ts
export const mockUsers = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: '2', name: '李四', email: 'lisi@example.com', status: 'inactive' },
];
```

### Step 4: 运行 Lint 检查

```bash
npm run lint
npm run lint -- --fix  # 自动修复
```

### Step 5: 提交代码

```bash
git add .
git commit -m "feat: add {page-name} page

- Add page component
- Add mock data
- Add styles"

git push origin feature/page-{page-name}
```

### Step 6: 创建 PR

```bash
gh pr create --title "feat: add {page-name} page" --body "
## Summary
- Add {page-name} page component
- Add mock data for the page
- Follow design specs from DRD

## Test plan
- [ ] Page renders correctly
- [ ] Mock data displays
- [ ] Interactions work
"
```

## 代码规范

### Next.js + shadcn/ui

```tsx
// src/app/users/page.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">用户列表</h1>
      {/* ... */}
    </div>
  );
}
```

### React + Element UI

```tsx
// src/pages/users/index.tsx
import { ElButton, ElTable } from 'element-plus';

export default function UsersPage() {
  return (
    <div className="page-container">
      <h1>用户列表</h1>
      {/* ... */}
    </div>
  );
}
```

## 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| Lint 失败 | 尝试 `--fix`，无法修复则报告 |
| Git 推送失败 | 检查凭证，重新认证 |
| PR 创建失败 | 检查 gh CLI 配置 |

## 超时设置

| 操作 | 超时时间 |
|-----|---------|
| 代码生成 | 3 分钟 |
| Lint 检查 | 1 分钟 |
| Git 操作 | 30 秒 |
| PR 创建 | 1 分钟 |
```

- [ ] **Step 2: Commit page-coder.md**

```bash
git add agents/page-coder.md
git commit -m "feat(yg-app-prototyping): add page coder agent definition"
```

---

### Task 5: Create pr-reviewer.md Agent

**Files:**
- Create: `agents/pr-reviewer.md`

- [ ] **Step 1: Create PR Reviewer agent definition**

```yaml
---
description: PR审查智能体 - 审查代码PR并提供反馈
capabilities:
  - 代码审查
  - 计划对齐检查
  - 规范验证
  - 反馈生成
tools:
  - Read
  - Bash
  - SendMessage
  - Glob
  - Grep
---

# PR 审查智能体

你是一个 PR 审查智能体，负责审查代码变更并提供结构化反馈。

## 核心职责

1. **获取 PR 变更** - 使用 gh CLI 获取 diff
2. **执行审查检查** - 对照 DRD 和代码规范
3. **生成审查报告** - 结构化反馈
4. **提供批准或修改建议**

## 审查检查项

### 1. DRD 对齐检查

- [ ] 功能是否符合 DRD 需求
- [ ] 页面结构是否正确
- [ ] 组件是否包含所有必要元素
- [ ] 交互是否实现

### 2. 代码质量检查

- [ ] 命名规范
- [ ] 代码结构
- [ ] 错误处理
- [ ] 类型定义

### 3. 组件规范检查

- [ ] 是否遵循 UI 库模式
- [ ] 组件是否可复用
- [ ] Props 类型是否完整

### 4. 无障碍检查

- [ ] ARIA 标签
- [ ] 键盘导航
- [ ] 颜色对比度

### 5. 性能检查

- [ ] 无明显性能问题
- [ ] 无不必要的重渲染
- [ ] 合理的数据加载

## 输入格式

```
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

## 工作流程

### Step 1: 获取 PR 变更

```bash
gh pr diff {pr-number}
```

### Step 2: 读取变更文件

```
Read 工具读取变更的文件内容
```

### Step 3: 执行审查

对照检查项逐一审查。

### Step 4: 生成审查报告

```markdown
# 代码审查报告

## PR 信息
- PR: #1 - Feature: 用户列表页面
- 作者: Coder Agent
- 审查者: Reviewer Agent

## 审查结果: ✅ 通过 / ❌ 需要修改

## 检查项

| 检查项 | 状态 | 说明 |
|-------|------|------|
| DRD 对齐 | ✅ | 功能符合设计要求 |
| 代码质量 | ⚠️ | 见下方建议 |
| 组件规范 | ✅ | 符合 shadcn/ui 规范 |
| 无障碍 | ❌ | 缺少 aria-label |

## 问题列表

### Critical (必须修复)
- [ ] 按钮缺少 aria-label

### Important (建议修复)
- [ ] 建议将 fetchData 提取到 hook

### Suggestions
- 可考虑使用 React Query 进行数据管理

## 详细反馈

[具体代码位置和修改建议]
```

### Step 5: 发送反馈

```javascript
SendMessage({
  to: "coder-agent",
  message: "审查完成，需要修复以下问题：...",
  summary: "审查反馈"
})
```

## 问题分类

| 级别 | 说明 | 处理 |
|-----|------|------|
| Critical | 必须修复 | 阻止合并 |
| Important | 建议修复 | 可选合并 |
| Suggestion | 改进建议 | 仅记录 |

## 反模式

- ❌ 过于宽松的审查
- ❌ 忽略无障碍问题
- ❌ 不检查 DRD 对齐
- ✅ 严格的审查标准
```

- [ ] **Step 2: Commit pr-reviewer.md**

```bash
git add agents/pr-reviewer.md
git commit -m "feat(yg-app-prototyping): add PR reviewer agent definition"
```

---

## Phase 3: Rules Files

### Task 6: Create tech-stack-selection.md

**Files:**
- Create: `skills/yg-app-prototyping/rules/tech-stack-selection.md`

- [ ] **Step 1: Create tech stack selection rule**

```markdown
# 技术栈选择规则

本文档定义如何为应用原型选择合适的技术栈。

---

## 技术栈决策矩阵

| 项目类型 | 推荐技术栈 | 备选方案 | 选择理由 |
|---------|-----------|---------|---------|
| Web 后台管理系统 | React + Element UI | Vue + Element Plus | 组件丰富，表单处理强 |
| 营销/官网 | Next.js + shadcn/ui | - | SEO 友好，现代体验 |
| 移动端 H5 | React + Ant Design Mobile | - | 移动端优化 |
| 小程序 | Taro + Ant Design Mini | - | 跨端支持 |
| 简单原型 | Next.js + shadcn/ui | HTML + CSS | 快速搭建 |

---

## 技术栈详解

### Next.js + shadcn/ui

**适用场景:**
- 官网、营销页
- SEO 要求高的项目
- 现代化 UI 体验

**技术组件:**
- 框架: Next.js 14 (App Router)
- UI 库: shadcn/ui (基于 Radix UI)
- 样式: Tailwind CSS
- 状态: Zustand (可选)

**环境要求:**
- Node.js >= 18
- pnpm >= 8 (推荐)

### React + Element UI

**适用场景:**
- 后台管理系统
- 企业级应用
- 复杂表单场景

**技术组件:**
- 框架: React 18
- UI 库: Element Plus
- 构建: Vite
- 路由: React Router
- 状态: Zustand

### Vue + Element Plus

**适用场景:**
- Vue 技术栈后台
- 企业级应用

**技术组件:**
- 框架: Vue 3 (Composition API)
- UI 库: Element Plus
- 构建: Vite
- 路由: Vue Router
- 状态: Pinia

### Taro (小程序)

**适用场景:**
- 微信/支付宝/字节小程序
- 跨端小程序需求

**技术组件:**
- 框架: Taro 3
- UI 库: Ant Design Mini
- 状态: Taro 自带 / Zustand

---

## 选择流程

```
开始
  │
  ├── 检查 DRD 是否指定技术栈
  │     ├── 是 → 使用 AskUserQuestion 确认
  │     └── 否 → 继续
  │
  ├── 确定项目类型
  │     ├── 后台管理 → React + Element UI
  │     ├── 营销官网 → Next.js + shadcn/ui
  │     ├── 移动 H5 → React + Ant Design Mobile
  │     └── 小程序 → Taro
  │
  └── 使用 AskUserQuestion 确认选择
```

---

## AskUserQuestion 示例

```json
{
  "questions": [{
    "question": "请选择原型技术栈：",
    "header": "技术栈",
    "multiSelect": false,
    "options": [
      { "label": "Next.js + shadcn/ui (推荐)", "description": "现代全栈方案，SEO友好" },
      { "label": "React + Element UI", "description": "后台管理系统首选" },
      { "label": "Vue + Element Plus", "description": "Vue 生态后台方案" },
      { "label": "Taro (小程序)", "description": "跨端小程序方案" }
    ]
  }]
}
```

---

## 反模式

- ❌ 假设技术栈不确认
- ❌ 使用静态 HTML 技术栈处理复杂应用
- ❌ 忽略用户的团队技术栈偏好
- ❌ 不考虑项目的 SEO 需求
```

- [ ] **Step 2: Commit tech-stack-selection.md**

```bash
git add skills/yg-app-prototyping/rules/tech-stack-selection.md
git commit -m "feat(yg-app-prototyping): add tech stack selection rule"
```

---

### Task 7-12: Create remaining rules files

> **Reference:** See spec sections 4.1-4.4, 6.1-6.5 for complete content.
> Each file should follow the structure in `tech-stack-selection.md` (Task 6).

**Task 7: Create drd-handling.md**
- File: `skills/yg-app-prototyping/rules/drd-handling.md`
- Content: DRD detection flow (spec 4.1 Step 0.2), validation checklist
- Commit: `feat(yg-app-prototyping): add DRD handling rule`

**Task 8: Create project-setup.md**
- File: `skills/yg-app-prototyping/rules/project-setup.md`
- Content: Project scaffolding checklist (spec 4.1 Step 0.4), directory structure
- Commit: `feat(yg-app-prototyping): add project setup rule`

**Task 9: Create task-planning.md**
- File: `skills/yg-app-prototyping/rules/task-planning.md`
- Content: Task planning flow (spec 4.1 Step 0.5), Git branch strategy (spec 4.2)
- Commit: `feat(yg-app-prototyping): add task planning rule`

**Task 10: Create code-generation.md**
- File: `skills/yg-app-prototyping/rules/code-generation.md`
- Content: Agent dispatch strategy (spec 6.2), context management (spec 6.4)
- Commit: `feat(yg-app-prototyping): add code generation rule`

**Task 11: Create review-workflow.md**
- File: `skills/yg-app-prototyping/rules/review-workflow.md`
- Content: Review & merge flow (spec 4.3), review report template
- Commit: `feat(yg-app-prototyping): add review workflow rule`

**Task 12: Create mock-data.md**
- File: `skills/yg-app-prototyping/rules/mock-data.md`
- Content: Mock data strategy (spec 6.5), data standards
- Commit: `feat(yg-app-prototyping): add mock data rule`

**Commit each file separately.**

---

## Phase 4: Workflow Files

### Task 13: Create master-workflow.md

**Files:**
- Create: `skills/yg-app-prototyping/workflows/master-workflow.md`

- [ ] **Step 1: Create master workflow document**

```markdown
# 主控工作流

本文档定义主控 Agent 的完整执行流程。

---

## 工作流总览

```
阶段 0: 初始化
├── 环境检查
├── 文档输入
├── DRD 处理
├── 技术栈选择
└── 项目搭建

阶段 1: 任务规划与开发
├── 提取页面清单
├── 生成任务文档
├── 创建任务列表
└── 并行启动 Coder Agents

阶段 2: 审查与合并
├── 收集 PR
├── 派发审查任务
├── 处理反馈
└── 合并 PR

阶段 3: 集成测试
├── 启动项目
├── 冒烟测试
└── 生成报告
```

---

## 阶段 0: 初始化

### Step 0.0: 环境检查

```bash
# 检查 Node.js
node -v  # 需要 >= 18

# 检查 Git
git --version

# 检查 GitHub CLI
gh --version

# 检查远程仓库
git remote -v
```

使用 AskUserQuestion 处理环境问题。

### Step 0.1: 文档输入

```
IF 用户指定文档路径:
    读取文档
ELSE IF 上下文存在 DRD:
    使用 DRD
ELSE IF 上下文存在 PRD:
    调用 Writer Agent 生成 DRD
ELSE:
    询问用户
```

### Step 0.2: DRD 处理

参考 `rules/drd-handling.md`

### Step 0.3: 技术栈选择

参考 `rules/tech-stack-selection.md`

### Step 0.4: 项目搭建

参考 `rules/project-setup.md`

---

## 阶段 1: 任务规划与开发

### Step 1.1: 提取页面清单

从 DRD 读取所有页面：
- 页面名称
- 页面类型
- 页面优先级
- 页面依赖

### Step 1.2: 生成任务文档

```markdown
# 任务: [页面名称]

## 元信息
- 任务 ID: T001
- 页面 ID: P001
- 类型: 列表页
- 优先级: High
- 依赖: []

## 设计规范
[从 DRD 提取]

## 组件清单
| 组件 | 类型 | 说明 |

## 交付标准
- [ ] 页面渲染正确
- [ ] 交互功能完整
- [ ] Mock 数据展示
```

### Step 1.3: 创建任务列表

使用 TaskCreate 创建任务，设置依赖关系。

### Step 1.4: 并行启动 Coder Agents

```javascript
// 在单次消息中启动多个 Agent
Agent({
  subagent_type: "general-purpose",
  description: "生成用户列表页面",
  prompt: "...",
  run_in_background: true
})
Agent({
  subagent_type: "general-purpose",
  description: "生成设置页面",
  prompt: "...",
  run_in_background: true
})
```

---

## 阶段 2: 审查与合并

### Step 2.1: 收集 PR

使用 TaskOutput 或 SendMessage 接收 Coder Agent 完成通知。

### Step 2.2: 派发审查任务

```javascript
Agent({
  subagent_type: "general-purpose",
  description: "审查用户列表 PR",
  prompt: "...",
  run_in_background: true
})
```

### Step 2.3: 处理反馈

- 审查通过 → 合并 PR
- 审查不通过 → 反馈给 Coder Agent 修复

### Step 2.4: 合并 PR

```bash
gh pr merge {pr-number} --squash
```

---

## 阶段 3: 集成测试

### Step 3.1: 启动项目

```bash
npm run dev
# 或
pnpm dev
```

### Step 3.2: 冒烟测试

检查清单：
- [ ] 项目启动成功
- [ ] 首页显示正常
- [ ] 导航跳转正常
- [ ] 表单提交正常
- [ ] Mock 数据正确

### Step 3.3: 生成报告

```markdown
# 集成测试报告

## 测试结果

| 功能 | 状态 | 说明 |
|-----|------|------|

## 问题列表
1. [问题描述]

## 建议
[改进建议]
```
```

- [ ] **Step 2: Commit master-workflow.md**

```bash
git add skills/yg-app-prototyping/workflows/master-workflow.md
git commit -m "feat(yg-app-prototyping): add master workflow"
```

---

### Task 14-15: Create remaining workflow files

> **Reference:** See spec sections 3.4, 3.5 and agents/*.md for complete content.
> Each file should follow the structure in `master-workflow.md` (Task 13).

**Task 14: Create coder-workflow.md**
- File: `skills/yg-app-prototyping/workflows/coder-workflow.md`
- Content: Coder agent workflow from `agents/page-coder.md`
- Key steps: Create branch → Generate code → Lint → Commit → Create PR
- Commit: `feat(yg-app-prototyping): add coder workflow`

**Task 15: Create reviewer-workflow.md**
- File: `skills/yg-app-prototyping/workflows/reviewer-workflow.md`
- Content: Reviewer agent workflow from `agents/pr-reviewer.md`
- Key steps: Fetch PR → Review checklist → Generate report → Send feedback
- Commit: `feat(yg-app-prototyping): add reviewer workflow`

---

## Phase 5: Templates

### Task 16: Create Next.js + shadcn/ui template

**Files:**
- Create: `skills/yg-app-prototyping/templates/nextjs-shadcn/README.md`
- Create: `skills/yg-app-prototyping/templates/nextjs-shadcn/package.json.tmpl`
- Create: `skills/yg-app-prototyping/templates/nextjs-shadcn/tailwind.config.js.tmpl`

- [ ] **Step 1: Create template README**

```markdown
# Next.js + shadcn/ui 模板

## 技术栈

- Next.js 14 (App Router)
- shadcn/ui 组件库
- Tailwind CSS
- TypeScript

## 项目结构

\`\`\`
src/
├── app/              # 页面路由
├── components/
│   ├── ui/           # shadcn/ui 组件
│   └── layout/       # 布局组件
├── lib/              # 工具函数
├── hooks/            # 自定义 hooks
├── types/            # 类型定义
└── mock/             # Mock 数据
\`\`\`

## 使用方式

1. 复制模板文件到目标目录
2. 安装依赖: \`pnpm install\`
3. 启动开发: \`pnpm dev\`
```

- [ ] **Step 2: Create package.json.tmpl**

```json
{
  "name": "{{project-name}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "lint:fix": "next lint --fix"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-slot": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

- [ ] **Step 3: Commit template files**

```bash
git add skills/yg-app-prototyping/templates/nextjs-shadcn/
git commit -m "feat(yg-app-prototyping): add Next.js + shadcn/ui template"
```

---

### Task 17-19: Create remaining templates

> **Reference:** See spec sections 5.1-5.6 for complete configs and design tokens.
> Each template should follow the structure in `nextjs-shadcn/` (Task 16).

**Task 17: Create React + Element UI template**
- Directory: `skills/yg-app-prototyping/templates/react-element/`
- Files: README.md, package.json.tmpl
- Config from spec 5.3: React 18, Element Plus, Vite, React Router
- Dependencies: react, react-dom, element-plus, react-router-dom, zustand
- Commit: `feat(yg-app-prototyping): add React + Element UI template`

**Task 18: Create Vue + Element Plus template**
- Directory: `skills/yg-app-prototyping/templates/vue-element/`
- Files: README.md, package.json.tmpl
- Config from spec 5.4: Vue 3, Element Plus, Vite, Vue Router, Pinia
- Dependencies: vue, vue-router, pinia, element-plus
- Commit: `feat(yg-app-prototyping): add Vue + Element Plus template`

**Task 19: Create Taro (小程序) template**
- Directory: `skills/yg-app-prototyping/templates/taro-miniprogram/`
- Files: README.md, package.json.tmpl
- Config from spec 5.5: Taro 3, Ant Design Mini
- Dependencies: @tarojs/taro, @tarojs/components, antd-mini
- Commit: `feat(yg-app-prototyping): add Taro template`

---

## Phase 6: Final Steps

### Task 20: Update README

**Files:**
- Modify: `README.md` (if exists)

- [ ] **Step 1: Add skill to README**

Add the new skill to the skills table in README.md.

- [ ] **Step 2: Commit README update**

```bash
git add README.md
git commit -m "docs: add yg-app-prototyping to skills table"
```

---

### Task 21: Final verification

- [ ] **Step 1: Verify file structure**

```bash
# Check all files exist
ls -la skills/yg-app-prototyping/
ls -la skills/yg-app-prototyping/rules/
ls -la skills/yg-app-prototyping/workflows/
ls -la skills/yg-app-prototyping/templates/
ls -la agents/drd-writer.md agents/page-coder.md agents/pr-reviewer.md
```

- [ ] **Step 2: Verify skill is loadable**

```bash
# Check SKILL.md syntax
head -20 skills/yg-app-prototyping/SKILL.md
```

- [ ] **Step 3: Create summary commit**

```bash
git add .
git commit -m "feat(yg-app-prototyping): complete skill implementation

- Add main skill files (SKILL.md, AGENTS.md)
- Add agent definitions (drd-writer, page-coder, pr-reviewer)
- Add rules files (7 rules)
- Add workflow files (3 workflows)
- Add tech stack templates (4 templates)

This skill generates functional application prototypes from requirements
documents using Agent Team coordination with code review gates."
```

---

## Estimated Completion

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Core Files | 2 | 30 min |
| Phase 2: Agents | 3 | 45 min |
| Phase 3: Rules | 6 | 1.5 hrs |
| Phase 4: Workflows | 3 | 45 min |
| Phase 5: Templates | 4 | 1 hr |
| Phase 6: Final | 2 | 15 min |
| **Total** | **21** | **~4.5 hrs** |