---
name: yg-prototyping
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
| yg-prototyping | 功能代码 | 开发就绪、组件化项目 |

## 如何使用此技能

此技能包含详细规则在 `rules/` 目录中。

### 快速开始

1. 查阅 [AGENTS.md](AGENTS.md) 获取完整规则汇编
2. 参考具体规则深入了解特定主题
3. 遵循工作流顺序执行

### 可用规则

| 优先级 | 规则 | 描述 |
|-------|------|------|
| 前置 | [技术栈选择](rules/tech-stack-selection.md) | 技术栈决策、环境检查 |
| 前置 | [DRD处理](rules/drd-handling.md) | DRD检测、生成、验证 |
| 关键 | [项目搭建](rules/project-setup.md) | 项目脚手架、依赖安装 |
| 关键 | [任务规划](rules/task-planning.md) | 页面级任务、依赖管理 |
| 高 | [代码生成](rules/code-generation.md) | 组件模式、命名规范 |
| 高 | [审查流程](rules/review-workflow.md) | 审查检查、合并流程 |
| 中等 | [Mock数据](rules/mock-data.md) | 数据结构、生成规范 |

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
/yg-prototyping

# 指定文档
/yg-prototyping --doc ./docs/DRD.md

# 指定技术栈
/yg-prototyping --tech nextjs-shadcn

# 指定输出目录
/yg-prototyping --output ./prototypes/my-app

# 跳过 DRD 生成
/yg-prototyping --skip-drd
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