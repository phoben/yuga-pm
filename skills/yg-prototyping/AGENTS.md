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