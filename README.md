# Yuga-PM (yg-pm)

<p align="center">
  <strong>从需求讨论到原型设计的产品经理工程化工具套件</strong>
</p>

<p align="center">
  <em>Claude Code Plugin for Product Managers</em>
</p>

---

## 📖 简介

**Yuga-PM** 是一款专为产品经理设计的 Claude Code 插件，提供从需求探索到原型设计的完整工作流程支持。通过结构化的方法论和 AI 辅助，帮助产品经理高效地完成需求分析、文档编写和原型设计工作。

### 核心特性

- **🎯 需求探索** - 使用苏格拉底式对话深入挖掘业务需求
- **📝 文档生成** - 支持多种需求文档模板（BRD/PRD/TRD/SRS/DRD）
- **✅ 质量保障** - 六阶段需求评审流程，确保文档质量
- **🎨 可视化** - Markdown 文档一键转换为精美 HTML
- **🚀 原型设计** - 从需求文档自动生成可交互原型

---

## 🚀 快速开始

### 前置要求

- Claude Code CLI 已安装
- Git 环境

### 安装

**方式一：通过 Marketplace 安装（推荐）**

```bash
# 1. 添加 Marketplace
/plugin marketplace add phoben/yg-pm

# 2. 安装插件
/plugin install yg-pm@yg-pm-marketplace
```

**方式二：全局安装**

```bash
# 克隆到 Claude Code 全局插件目录
git clone https://github.com/phoben/yg-pm.git ~/.claude/plugins/yg-pm
```

**方式三：项目级安装**

```bash
# 在你的项目根目录下
git clone https://github.com/phoben/yg-pm.git .claude/plugins/yg-pm
```

**方式四：临时加载**

```bash
# 启动时指定插件目录
cc --plugin-dir /path/to/yg-pm
```

### 验证安装

启动 Claude Code 后，使用以下命令验证插件是否加载成功：

```
/yg-list
```

---

## 📚 技能说明

Yuga-PM 提供 10 个核心技能，每个技能专注于产品工作流程的一个环节：

### 技能列表

| 技能 | 触发方式 | 用途 |
|------|----------|------|
| yg-brainstorming | `/yg-brainstorming` | 需求探索与头脑风暴 |
| yg-industry-survey | `/yg-industry-survey` | 行业调研与知识库管理 |
| yg-requirement-extraction | `/yg-requirement-extraction` | 结构化需求提取 |
| yg-document-writing | `/yg-document-writing` | 需求文档编写 |
| yg-requirement-reviewer | `/yg-requirement-reviewer` | 需求文档评审 |
| yg-question | `/yg-question` | 基于文档的智能问答与设计缺陷检测 |
| yg-visualize | `/yg-visualize` | 文档可视化 |
| yg-prototyping | `/yg-prototyping` | 原型生成 |
| yg-prototyping | `/yg-prototyping` | 功能代码原型生成 |
| yg-create-document-template | `/yg-create-document-template` | 创建自定义模板 |
| yg-forguncy-help | `/yg-forguncy-help` | Forguncy 知识库查询 |

### 技能详情

#### 1. yg-brainstorming - 需求探索

使用苏格拉底式对话方法，通过系统性提问引导用户深入思考业务需求。

**工作流程：**
1. 探索项目背景和上下文
2. 识别业务领域关键问题
3. 提供 2-3 个解决方案建议
4. 输出结构化需求设计文档

**适用场景：**
- 新项目启动阶段
- 需求不明确时
- 需要技术可行性评估

#### 2. yg-industry-survey - 行业调研

系统化调研特定行业，收集基本概念、业务特征、系统设计案例和最佳实践。

**工作流程：**
1. 解析调研意图，明确行业和方向
2. 检索知识库，评估现有知识覆盖度
3. 网络搜索补充信息（如需要）
4. 生成结构化调研报告
5. 可选：沉淀到知识库供复用

**适用场景：**
- 新行业/领域调研
- 系统设计前收集行业信息
- 最佳实践研究

#### 3. yg-requirement-extraction - 需求提取

从各种来源提取结构化需求，支持多种输入格式。

**支持的输入类型：**
- 会议纪要
- 用户故事
- 竞品分析报告
- 现有文档

**输出格式：**
- 用户需求列表
- 功能需求清单
- 非功能需求
- 约束条件

#### 4. yg-document-writing - 文档编写

根据模板自动生成专业的需求文档。

**支持的文档类型：**
| 类型 | 说明 |
|------|------|
| BRD | 业务需求文档 |
| PRD | 产品需求文档 |
| TRD | 技术需求文档 |
| SRS | 软件需求规格说明书 |
| DRD | 数据需求文档 |

**场景模板：**
- 自动化流程设计
- 权限矩阵设计
- 仪表盘/报表设计

#### 5. yg-requirement-reviewer - 需求评审

执行六阶段全面评审，确保需求文档质量。

**评审阶段：**
1. **格式审查** - 文档结构完整性
2. **规模适配** - 复杂度与项目匹配
3. **一致性检查** - 逻辑自洽性
4. **流程验证** - 业务流程闭环
5. **模拟测试** - 表结构支持功能验证
6. **输出报告** - 问题清单与改进建议

#### 6. yg-visualize - 文档可视化

将 Markdown 文档转换为精美的 HTML 页面。

**特性：**
- 多种主题选择
- 自动生成目录
- 支持 PDF 导出
- 响应式布局

#### 7. yg-prototyping - 原型生成

从需求文档生成可交互的原型代码。

**支持的技术栈：**
- React + Element UI
- Taro（小程序/H5）
- Ant Design Mobile
- shadcn/ui
- 原生 HTML + CSS

**生成内容：**
- 页面布局代码
- 组件配置
- 交互逻辑
- 样式文件

#### 8. yg-prototyping - 功能代码原型生成

从需求文档生成可运行的功能代码原型，适用于需要完整项目代码的场景。

**与 yg-prototyping 的区别：**
| 技能 | 输出 | 适用场景 |
|-----|------|---------|
| yg-prototyping | 静态 HTML | 快速验证、设计评审 |
| yg-prototyping | 功能代码 | 开发就绪、组件化项目 |

**支持的技术栈：**
- Next.js + shadcn/ui（官网/营销页）
- React + Element UI（后台管理系统）
- Vue + Element Plus（Vue生态后台）
- Taro（跨端小程序）

**核心特性：**
- Agent Team 架构，并行开发
- 智能处理 DRD 文档
- 代码审查关卡，确保质量
- 多分支 PR 工作流

#### 9. yg-question - 智能问答与设计缺陷检测

基于项目文档的智能问答，通过用户提问检测产品设计缺陷。

**核心特性：**
- 🎯 **自动项目识别** - 从问题内容或上下文自动定位目标项目
- 📚 **文档事实调查** - 以项目文档为唯一事实来源
- 🔍 **SEAR方法论** - 来源、证据、分析、结果的严谨推理框架
- ⚠️ **缺陷检测** - 每个问题都是对设计的一次检验

**问题类型支持：**
| 类型 | 示例问题 |
|------|---------|
| 功能实现 | "如何进行批量导入？" |
| 能力边界 | "系统支持多少并发用户？" |
| 业务场景 | "多人同时编辑如何处理冲突？" |
| 数据查询 | "如何查询某员工的审批记录？" |
| 权限流程 | "谁可以审批这个订单？" |

---

## ⌨️ 自定义命令

Yuga-PM 提供 8 个项目管理命令：

### 项目管理命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/yg-new <项目名>` | 创建新项目 | `/yg-new WMS优化需求` |
| `/yg-list` | 列出所有项目 | `/yg-list` |
| `/yg-status [项目名]` | 查看项目进度 | `/yg-status WMS优化` |
| `/yg-hold <项目名>` | 暂停项目 | `/yg-hold WMS优化` |
| `/yg-resume <项目名>` | 恢复项目 | `/yg-resume WMS优化` |
| `/yg-archive <项目名>` | 归档项目 | `/yg-archive WMS优化` |

### 快捷命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/yg-doc [类型]` | 快速创建文档 | `/yg-doc prd` |
| `/yg-visualize` | 生成可视化文档 | `/yg-visualize --theme tech` |

---

## 🔄 工作流程最佳实践

### 推荐工作流程

```
┌─────────────────────────┐
│   用户提供基础需求       │
└───────────┬─────────────┘
            ↓
    ┌───────┴───────┐
    │ 需求完善程度？ │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    ↓               ↓
需求简单/模糊    需求详细/明确
    ↓               ↓
┌─────────────┐ ┌─────────────────────┐
│ yg-         │ │ yg-requirement-     │
│ brainstorming│ │ extraction          │
│ 头脑风暴完善 │ │ 提取结构化需求       │
└──────┬──────┘ └──────────┬──────────┘
       │                   │
       └─────────┬─────────┘
                 ↓
   ┌──────────────────────┐
   │ yg-document-writing   │  编写需求文档
   └──────────┬───────────┘
              ↓
   ┌─────────────────────────┐
   │ yg-requirement-reviewer │  评审文档质量
   └──────────┬──────────────┘
              ↓
         ┌────┴────┐
         ↓         ↓
   ┌──────────┐ ┌─────────────┐
   │ yg-      │ │ yg-         │
   │ visualize│ │ prototyping │
   │ 文档可视化│ │ 原型生成    │
   └──────────┘ └─────────────┘
```

### 典型使用场景

#### 场景一：新项目启动（需求简单/模糊）

```
# 1. 创建新项目
/yg-new 订单管理系统优化

# 2. 通过头脑风暴完善需求
/yg-brainstorming

# 3. 编写文档
/yg-document-writing

# 4. 评审文档
/yg-requirement-reviewer

# 5. 生成原型
/yg-prototyping
```

#### 场景二：新项目启动（需求详细/明确）

```
# 1. 创建新项目
/yg-new 订单管理系统优化

# 2. 直接提取结构化需求
/yg-requirement-extraction

# 3. 编写文档
/yg-document-writing

# 4. 评审文档
/yg-requirement-reviewer

# 5. 生成原型
/yg-prototyping
```

#### 场景三：快速文档生成

```
# 直接创建 PRD 文档
/yg-doc prd

# 编写完成后可视化
/yg-visualize --theme modern
```

#### 场景四：项目状态管理

```
# 查看所有项目
/yg-list

# 暂停进行中的项目
/yg-hold 订单系统

# 恢复项目工作
/yg-resume 订单系统

# 完成后归档
/yg-archive 订单系统
```

### 项目状态流转

```
draft → collecting → writing → reviewing → final
                    ↓
                on_hold ←→ (可恢复)
                    ↓
                archived (最终状态)
```

---

## 🤖 智能代理

插件内置 3 个专业代理，提供深度分析能力：

| 代理 | 用途 | 调用时机 |
|------|------|----------|
| industry-survey | 行业调研与最佳实践分析 | 需要行业背景知识时 |
| prototyping | 原型代码生成 | 从需求生成原型时 |
| requirement-exploration-reviewer | 需求探索文档验证 | 需求探索完成后 |

这些代理会在技能执行过程中自动调用，无需手动触发。

---

## 📁 项目结构

```
yg-pm/
├── .claude-plugin/
│   └── plugin.json           # 插件配置清单
├── skills/                    # 技能定义
│   ├── yg-brainstorming.md
│   ├── yg-requirement-extraction.md
│   ├── yg-document-writing.md
│   ├── yg-requirement-reviewer.md
│   ├── yg-visualize.md
│   ├── yg-prototyping.md
│   ├── yg-create-document-template.md
│   └── yg-forguncy-help.md
├── commands/                  # 命令定义
│   ├── yg-new.md
│   ├── yg-list.md
│   ├── yg-status.md
│   ├── yg-hold.md
│   ├── yg-resume.md
│   ├── yg-archive.md
│   ├── yg-doc.md
│   └── yg-visualize.md
├── agents/                    # 代理定义
│   ├── industry-survey.md
│   ├── prototyping.md
│   └── requirement-exploration-reviewer.md
├── hooks/                     # 钩子配置
│   └── hooks.json
├── references/                # 参考模板
│   ├── brd-template.md
│   ├── prd-template.md
│   ├── trd-template.md
│   ├── srs-template.md
│   ├── automation-template.md
│   ├── permission-matrix-template.md
│   ├── view-dashboard-template.md
│   └── high-quality-standard.md
└── README.md                  # 本文档
```

### 项目数据目录

```
.yg-pm/
├── projects/                  # 活跃项目
│   └── {project-name}/
│       ├── project.json      # 项目元数据
│       ├── drafts/           # 草稿文档
│       ├── documents/        # 正式文档
│       ├── visualizations/   # 可视化文档
│       └── prototypes/       # 原型文件
├── archive/                   # 已归档项目
└── config.json               # 全局配置
```

---

## 🎯 使用建议

### 1. 项目命名规范

使用清晰、有意义的项目名称：
- ✅ `WMS库存优化需求`
- ✅ `用户权限系统重构`
- ❌ `项目1`、`需求文档`

### 2. 文档编写建议

- 先完成需求探索，再编写文档
- 使用评审技能确保文档质量
- 定期使用 `/yg-status` 检查进度

### 3. 原型设计建议

- 确保需求文档已通过评审
- 选择合适的技术栈
- 原型生成后进行人工微调

### 4. 协作建议

- 使用 `/yg-hold` 暂停进行中的工作
- 使用 `/yg-list` 查看团队项目状态
- 完成的项目及时归档

---

## ❓ 常见问题

### Q: 技能无法执行？

确保在项目目录下执行，或使用 `/yg-new` 先创建项目。

### Q: 如何创建自定义文档模板？

使用 `/yg-create-document-template` 技能，按提示创建新模板。

### Q: 支持哪些文档输出格式？

- Markdown (.md)
- HTML (通过 yg-visualize)
- PDF (通过 yg-visualize 导出)

### Q: 原型代码如何运行？

生成的原型代码会包含运行说明，通常需要：
- 安装对应框架依赖
- 配置开发环境
- 按生成的 README 操作

---

## 📄 许可证

MIT License

---

## 👤 作者

XiaChao

---

<p align="center">
  <strong>让需求管理更高效，让产品设计更专业</strong>
</p>