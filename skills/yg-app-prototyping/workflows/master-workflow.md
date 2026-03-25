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

- 审查通过 -> 合并 PR
- 审查不通过 -> 反馈给 Coder Agent 修复

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