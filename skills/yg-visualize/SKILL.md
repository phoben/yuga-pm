---
name: yg-visualize
description: "将Markdown文档转换为shadcn/ui风格的HTML可视化文档。"
---

# shadcn/ui 可视化文档

将 Markdown 文档转换为精美的 shadcn/ui 风格 HTML 页面。

<HARD-GATE>
禁止直接 Read 用户提供的文档，严格按照执行流程逐步进行。
</HARD-GATE>

---

## 核心设计原则

### SubAgent 自主读写模式

```
┌─────────────────────────────────────────────────────────────┐
│ 核心原则: 只传路径，自主读写                                   │
│                                                              │
│ ❌ 错误做法: 主 Agent 读取内容 → 传给 SubAgent → SubAgent 返回 │
│ ✅ 正确做法: 主 Agent 只传路径 → SubAgent 自行读取/写入        │
└─────────────────────────────────────────────────────────────┘
```

| 传递方式 | 上下文压力 | 推荐度 |
|----------|-----------|--------|
| 传递完整内容 | 高（内容在 prompt 中） | ❌ 禁止 |
| 传递路径 | 低（仅路径字符串） | ✅ 必须 |

### SubAgent 上下文优化策略

```
┌─────────────────────────────────────────────────────────────┐
│ 核心原则: Grep 预定位 + offset/limit 精准读取                  │
│                                                              │
│ ❌ 错误做法: Read(file_path) 全量读取                         │
│ ✅ 正确做法: Grep 定位行号 → Read(offset, limit=50) 精准读取   │
└─────────────────────────────────────────────────────────────┘
```

| 读取方式 | 上下文消耗 | 适用场景 |
|----------|-----------|---------|
| 全量读取 | 高（整个文件） | ❌ 禁止 |
| offset/limit | 低（指定行数） | ✅ 必须 |
| Grep + offset/limit | 最低（精准定位） | ✅ 推荐 |

---

## 执行流程

```
┌─────────────────────────────────────────────────────────────┐
│ 阶段1: 文档预处理                                            │
│  - TodoWrite 创建初始任务列表                               │
│  - 确定文档路径                                              │
│  - 执行脚本获取 outline（H1 + 元信息 + H2 结构）             │
│  - 校验文档规范                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 阶段2: 框架生成                                              │
│  - TodoWrite 标记任务2 in_progress                          │
│  - 主 Agent 读取 H1 + 元信息区域                            │
│  - 填充 header-title, nav, header 区域                      │
│  - 为每个 H2 章节生成占位符骨架                              │
│  - 写入框架文件，标记任务 completed                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 阶段3: 任务拆分与顺序执行                                    │
│  - TodoWrite 创建章节子任务                                 │
│  - 逐个启动 SubAgent 处理单个章节                           │
│  - SubAgent 完成后更新 TodoWrite 状态                       │
│  - 等待完成后再启动下一个                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 阶段4: 质量验证                                              │
│  - TodoWrite 标记任务4 in_progress                          │
│  - 使用 grep 检查占位符残留                                  │
│  - 使用工具验证 HTML（不读取内容）                           │
│  - 标记所有任务 completed                                    │
│  - 输出最终文件                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 阶段1: 文档预处理

### 步骤0: 创建可视化任务列表

**使用 TodoWrite 创建初始任务列表，让用户看到执行进度：**

```
TodoWrite({
  todos: [
    {"content": "文档预处理：执行脚本获取 outline", "status": "in_progress", "activeForm": "执行预处理脚本"},
    {"content": "框架生成：填充 H1 + 元信息，生成章节骨架", "status": "pending", "activeForm": "生成框架文件"},
    {"content": "章节编写：逐个处理所有 H2 章节", "status": "pending", "activeForm": "编写章节内容"},
    {"content": "质量验证：检查占位符残留", "status": "pending", "activeForm": "验证 HTML 质量"}
  ]
})
```

### 步骤1: 确定文档路径

```
if 用户指定路径:
    doc_path = 用户指定路径
elif 存在 .yg-pm/projects/ 目录:
    检查当前项目上下文，找到最新文档
else:
    询问用户文档路径
```

### 步骤2: 执行脚本获取 outline

```bash
python "${CLAUDE_SKILL_DIR}/scripts/extract-outline.py" "$doc_path"
```

脚本输出格式：
```json
{
  "title": "技术需求文档(TRD)",
  "meta": {
    "startLine": 3,
    "endLine": 8
  },
  "sections": [
    {
      "id": "section-1",
      "text": "功能概述",
      "startLine": 12,
      "endLine": 50,
      "children": []
    },
    {
      "id": "section-2",
      "text": "技术架构",
      "startLine": 51,
      "endLine": 120,
      "children": [
        {"id": "section-2-1", "text": "前端架构", "startLine": 60, "endLine": 80},
        {"id": "section-2-2", "text": "后端架构", "startLine": 81, "endLine": 100}
      ]
    }
  ]
}
```

**ID 格式说明：**
| 层级 | ID 格式 | 示例 |
|------|---------|------|
| H2 章节 | `section-N` | section-1, section-2, section-3 |
| H3 子章节 | `section-N-M` | section-2-1, section-2-2 |

ID 按文档顺序递增，确保唯一且有序。

**关键字段说明：**
| 字段 | 用途 |
|------|------|
| `title` | 文档标题 (H1) |
| `meta.startLine` / `meta.endLine` | 元信息区域行号范围 |
| `sections[].id` | 章节唯一标识（用于生成占位符） |
| `sections[].text` | 章节标题 |
| `sections[].startLine` / `endLine` | 章节行号范围 |
| `sections[].children` | H3 子章节（如有） |

### 步骤3: 校验文档规范

| 校验项 | 规则 | 失败处理 |
|--------|------|----------|
| extract-outline.py | 调用失败 | 尝试解决无果后拒绝执行 |
| 文件格式 | 扩展名 `.md` | 拒绝执行 |
| 标题结构 | 包含 H1 + ≥2 个 H2 | 提示使用 `/yg-document-writing` |

---

## 阶段2: 框架生成

### 步骤1: 确定输出路径

```
output_path = ".yg-pm/projects/{project_name}/visualizations/{doc_name}.html"
```

### 步骤2: 读取框架模板

```
Read("${CLAUDE_SKILL_DIR}/templates/framework.html")
```

### 步骤3: 读取源文档头部

主 Agent 读取 H1 和元信息区域：
```
Read(file_path=doc_path, offset=meta.startLine, limit=meta.endLine - meta.startLine + 1)
```

**元信息内容示例：**
```markdown
**文档版本：** v1.0
**创建日期：** 2026-03-24
**项目名称：** XX公司数字化建设技术选型及架构建议方案
**状态：** 待确认
```

### 步骤4: 生成框架文件

**填充区域对照表：**
| 区域 | data-fill | 内容 |
|------|-----------|------|
| 顶部标题栏 | header-title | 文档标题 |
| 侧边栏目录 | nav | H2 章节导航链接 |
| 文档头部 | header | H1 + 元信息 |
| 章节内容 | content | H2 章节占位符（带骨架屏，跳过"目录"章节） |
| PDF封面标题 | pdf-cover-title | 文档标题（从H1提取） |
| PDF封面项目 | pdf-cover-project | 项目名称（从元信息提取） |
| PDF封面版本 | pdf-cover-version | 版本号（从元信息提取） |
| PDF封面日期 | pdf-cover-date | 日期（从元信息提取） |
| PDF目录内容 | pdf-toc-content | H2/H3 章节目录列表 |

**⚠️ 跳过规则：** 标题为"目录"、"目录导航"、"Table of Contents"的章节不生成占位符和导航项。

**生成导航项（禁用/正常状态）：**
```html
<!-- 禁用状态（内容未填充） -->
<a href="#section-1" class="nav-item" data-pending="true">功能概述</a>

<!-- 正常状态（内容已填充） -->
<a href="#section-2" class="nav-item" data-pending="false">技术架构</a>
```

**生成章节占位符（带骨架屏）：**
```html
<section id="section-1" data-region="true" class="scroll-mt-20">
  <h2 class="text-2xl font-bold tracking-tight mb-4 pb-2 border-b">章节标题</h2>
  <div class="space-y-6" data-fill="section-section-1" data-section-id="section-1">
    <div class="skeleton-container" data-skeleton="section-1">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text full"></div>
      <div class="skeleton skeleton-text medium"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-text full"></div>
      <div class="skeleton skeleton-text medium"></div>
    </div>
    <!-- SUBAGENT: FILL section-section-1 -->
  </div>
</section>
```

### 步骤5: 写入框架文件

```
Write(output_path, framework_html)
```

---

## 阶段3: 任务拆分与顺序执行

### 步骤1: 更新主任务状态

```
TodoWrite({
  todos: [
    {"content": "文档预处理：执行脚本获取 outline", "status": "completed", "activeForm": "执行预处理脚本"},
    {"content": "框架生成：填充 H1 + 元信息，生成章节骨架", "status": "completed", "activeForm": "生成框架文件"},
    {"content": "章节编写：逐个处理所有 H2 章节", "status": "in_progress", "activeForm": "编写章节内容"},
    {"content": "质量验证：检查占位符残留", "status": "pending", "activeForm": "验证 HTML 质量"}
  ]
})
```

### 步骤2: 动态创建章节子任务

**为每个 H2 章节创建 TodoWrite 任务（跳过"目录"章节）：**

```
# 构建完整任务列表（包含章节子任务）
todos = [
  {"content": "文档预处理：执行脚本获取 outline", "status": "completed", "activeForm": "执行预处理脚本"},
  {"content": "框架生成：填充 H1 + 元信息，生成章节骨架", "status": "completed", "activeForm": "生成框架文件"},
  {"content": "章节编写：逐个处理所有 H2 章节", "status": "in_progress", "activeForm": "编写章节内容"}
]

# ⚠️ 跳过规则：标题为"目录"的章节不创建任务（左侧导航栏已提供目录功能）
SKIP_SECTION_TITLES = ["目录", "目录导航", "Table of Contents"]

# 添加章节子任务
for section in outline.sections:
    # 跳过目录章节
    if section.text in SKIP_SECTION_TITLES:
        continue
    todos.append({
        "content": f"编写章节: {section.text}",
        "status": "pending",
        "activeForm": f"编写 {section.text}"
    })

todos.append({"content": "质量验证：检查占位符残留", "status": "pending", "activeForm": "验证 HTML 质量"})

TodoWrite({todos: todos})
```

**⚠️ 跳过规则说明：**

| 规则 | 说明 |
|------|------|
| 跳过"目录"章节 | 标题为"目录"、"目录导航"、"Table of Contents"的 H2 章节不创建任务 |
| 原因 | 左侧导航栏已提供目录功能，无需重复生成 |

### 步骤3: 顺序执行并更新状态

**逐个处理章节（跳过目录章节），每完成一个就更新 TodoWrite：**

```
# 跳过规则
SKIP_SECTION_TITLES = ["目录", "目录导航", "Table of Contents"]

for section in outline.sections:
    # 跳过目录章节
    if section.text in SKIP_SECTION_TITLES:
        continue
    # 1. 标记当前章节 in_progress
    TodoWrite(更新当前章节状态为 in_progress)

    # 2. 启动 SubAgent (同步等待)
    Agent({
        subagent_type: "general-purpose",
        name: f"fill-{section.id}",
        description: f"编写章节 {section.text}",
        prompt: `
            参考 Agent 规范: ${CLAUDE_SKILL_DIR}/agents/fill-section.md

            ## 任务参数（仅路径，无内容）

            **源文档路径:** {source_doc_path}
            **目标文件路径:** {output_html_path}
            **章节 ID:** {section.id}
            **章节标题:** {section.text}
            **行号范围:** {section.startLine} - {section.endLine}

            ## 执行要求

            1. 自行读取源文档指定行号范围（使用 offset/limit）
            2. 调用 shadcn 技能获取组件指南
            3. 生成 HTML 片段
            4. **使用 Grep 预定位章节占位符行号**
            5. **使用 offset/limit 精准读取占位符区域（禁止全量读取）**
            6. 使用 Edit 工具替换占位符（同时删除骨架屏）
            7. **使用 Grep 预定位导航项行号**
            8. **使用 offset/limit 精准读取导航区域**
            9. 使用 Edit 工具更新导航状态（data-pending="true" → data-pending="false"）

            ## 上下文优化要求

            - ❌ 禁止全量读取 HTML 文件
            - ✅ 每次读取限制在 50 行以内
            - ✅ 使用 Grep 定位，再用 Read 的 offset/limit 精准读取

            ## 输出

            仅报告状态：DONE | BLOCKED
        `,
        run_in_background: false
    })

    # 3. 验证章节编写成功后，更新导航状态
    # 主Agent 使用 Edit 更新导航项状态（如果 SubAgent 未执行）
    # 使用 grep 检查骨架屏是否已被替换
    grep -c "data-skeleton=\"{section.id}\"" {output_path}
    # 如果返回 0，表示骨架屏已被替换

    # 4. 标记当前章节 completed
    TodoWrite(更新当前章节状态为 completed)
```

### 步骤4: 更新导航状态

**SubAgent 完成后，更新导航项状态（禁用 → 正常）：**

```html
<!-- 处理前（禁用状态） -->
<a href="#section-1" class="nav-item" data-pending="true">功能概述</a>

<!-- 处理后（正常状态） -->
<a href="#section-1" class="nav-item" data-pending="false">功能概述</a>
```

**使用 Edit 工具更新：**
```
Edit(
  file_path="{output_html_path}",
  old_string='<a href="#section-1" class="nav-item" data-pending="true">功能概述</a>',
  new_string='<a href="#section-1" class="nav-item" data-pending="false">功能概述</a>'
)
```

### CLI 显示效果

**用户将看到可视化进度：**

```
☑ 文档预处理：执行脚本获取 outline
☑ 框架生成：编写 H1 + 元信息，生成章节骨架
► 章节编写：逐个处理所有 H2 章节
  ☐ 编写章节: 功能概述
  ☐ 编写章节: 技术架构
  ☐ 编写章节: 实施计划
☐ 质量验证：检查占位符残留
```

**章节完成后：**
```
► 章节编写：逐个处理所有 H2 章节
  ☑ 编写章节: 功能概述
  ► 编写章节: 技术架构    ← 当前执行
  ☐ 编写章节: 实施计划
```

---

## 阶段4: 质量验证

**使用工具检查，不读取内容：**

### 步骤1: 检查占位符残留

```bash
grep -c "<!-- SUBAGENT: FILL" {output_path}
# 期望返回: 0（无残留占位符）
```

### 步骤2: HTML 格式验证（可选）

```bash
# 使用 htmlhint 验证 HTML 结构
npx htmlhint {output_path}
```

### 步骤3: 标记所有任务完成

```
TodoWrite({
  todos: [
    {"content": "文档预处理：执行脚本获取 outline", "status": "completed", "activeForm": "执行预处理脚本"},
    {"content": "框架生成：填充 H1 + 元信息，生成章节骨架", "status": "completed", "activeForm": "生成框架文件"},
    {"content": "章节编写：逐个处理所有 H2 章节", "status": "completed", "activeForm": "编写章节内容"},
    {"content": "质量验证：检查占位符残留", "status": "completed", "activeForm": "验证 HTML 质量"}
  ]
})
```

### 步骤4: 输出最终文件

```
输出路径: {output_path}
```

---

## 实时进度感知方案

用户如何在页面中实时感知生成进度：

### 方案对比

| 方案 | 实时性 | 复杂度 | 推荐场景 |
|------|--------|--------|----------|
| 手动刷新 | 低 | 零 | 简单场景 |
| VS Code Live Server | 高 | 低 | **推荐** |
| 自定义 SSE 服务 | 最高 | 中 | 专业需求 |

### 推荐方案：VS Code Live Server

**使用步骤：**

1. 安装 VS Code 扩展：Live Server (ritwickdey)
2. 右键点击生成的 HTML 文件 → "Open with Live Server"
3. 浏览器自动打开，文件变化时自动刷新

**用户体验：**

```
┌─────────────────────────────────────────────────────────────┐
│  用户打开 Live Server                                        │
│                    ↓                                        │
│  看到初始页面：导航项禁用状态，内容区显示骨架屏                │
│                    ↓                                        │
│  SubAgent 完成章节1 → 文件保存 → 浏览器自动刷新              │
│                    ↓                                        │
│  用户看到：导航项1恢复正常，内容1显示真实内容                  │
│                    ↓                                        │
│  依次看到其他章节逐步完成...                                  │
└─────────────────────────────────────────────────────────────┘
```

### 视觉反馈设计

**导航栏状态：**
- 禁用状态（未填充）：灰色文字，不可点击，透明度降低
- 正常状态（已填充）：正常颜色，可点击，hover 效果

**内容区骨架屏：**
- 加载中：显示渐变动画的骨架占位符
- 已完成：显示真实 HTML 内容

**整体进度感知：**
```
初始状态：
  功能概述     （禁用状态，灰色）
  技术架构     （禁用状态，灰色）
  实施计划     （禁用状态，灰色）

50% 完成时：
  功能概述     （正常状态，可点击）
  技术架构     （禁用状态，灰色）  ← 当前正在处理
  实施计划     （禁用状态，灰色）

全部完成：
  功能概述     （正常状态，可点击）
  技术架构     （正常状态，可点击）
  实施计划     （正常状态，可点击）
```

### 执行提示

在生成开始时，向用户提示：

```
📄 文档生成中...

💡 提示：使用 VS Code Live Server 打开文件可实时查看进度
   右键 HTML 文件 → Open with Live Server

进度: [████████░░░░░░░░] 50% (2/4 章节)
```

---

## PDF导出功能

模板内置PDF导出功能，用户可在浏览器中一键导出PDF文档。

### 导出按钮位置

顶栏右侧，主题切换按钮左侧，使用打印图标。

### PDF结构

| 页面 | 内容 |
|------|------|
| 第1页 | 封面页：标题、项目名、版本、日期 |
| 第2页 | 目录页：H2/H3层级结构 |
| 第3页+ | 正文内容 |

### 封面页数据填充

主Agent在框架生成阶段，从源文档元信息区域提取数据并填充：

```html
<h1 class="pdf-cover-title" data-fill="pdf-cover-title">文档标题</h1>
<div class="pdf-cover-subtitle" data-fill="pdf-cover-project">项目名称</div>
<span class="pdf-cover-value" data-fill="pdf-cover-version">v1.0</span>
<span class="pdf-cover-value" data-fill="pdf-cover-date">2026-03-26</span>
```

### 目录页生成

主Agent根据outline结构，在 `data-fill="pdf-toc-content"` 区域生成目录项：

```html
<!-- H2 章节 -->
<div class="pdf-toc-item pdf-toc-h2">
  <span class="pdf-toc-text">功能概述</span>
</div>
<!-- H3 子章节 -->
<div class="pdf-toc-item pdf-toc-h3">
  <span class="pdf-toc-text">前端架构</span>
</div>
```

**跳过规则：** 标题为"目录"、"目录导航"、"Table of Contents"的章节不生成目录项。

---

## 关键规则

### 红色警戒

- ❌ 在 SubAgent prompt 中传递完整章节内容
- ❌ 让 SubAgent 返回生成的 HTML（应直接写入文件）
- ❌ 跳过 shadcn 技能调用
- ❌ 使用非 shadcn 风格的自定义 CSS
- ❌ **为"目录"章节生成占位符或任务** - 左侧导航栏已提供目录功能
- ❌ **全量读取 HTML 文件（必须使用 Grep 预定位 + offset/limit）**
- ❌ **保留 ASCII 字符串图表（必须转换为 Mermaid 或 HTML 组件）**
- ❌ **使用 `<pre>` 包裹 ASCII 图表**
- ❌ **为简单图表使用 Canvas（优先 Mermaid）**

### 图表转换规范

| 图表类型 | 转换目标 |
|---------|----------|
| 流程图 | Mermaid `flowchart` |
| 时序图 | Mermaid `sequenceDiagram` |
| 状态图 | Mermaid `stateDiagram` |
| ER 图 | Mermaid `erDiagram` |
| 甘特图 | Mermaid `gantt` |
| 思维导图 | Mermaid `mindmap` |
| 架构图/蓝图 | Canvas 原生绘制 |

**转换规则详见:** `${CLAUDE_SKILL_DIR}/references/diagram-conversion.md` 中「Mermaid 语法参考」章节

### 图表渲染方案

yg-visualize 支持三种图表渲染方案：

| 方案 | 技术 | 适用场景 |
|------|------|---------|
| **Mermaid** | Mermaid.js | 流程图、时序图、状态图、ER图、甘特图、思维导图 |
| **Canvas 原生** | HTML Canvas | 系统架构图、网络拓扑图、蓝图 |
| **HTML 组件** | CSS + HTML | 简单数据展示、打印场景 |

**优先使用 Mermaid 方案。**

详细规范见：`${CLAUDE_SKILL_DIR}/references/diagram-conversion.md`

### 最佳实践

- ✅ 主 Agent 只传递路径和定位信息
- ✅ SubAgent 自行 Read 源文档
- ✅ SubAgent 自行 Edit 目标文件
- ✅ SubAgent 只报告状态，不返回大段内容
- ✅ 使用 `data-fill` 属性定位占位符
- ✅ **跳过"目录"章节，不生成占位符和任务**
- ✅ **识别并转换所有 ASCII 图表为 HTML 组件**
- ✅ **使用 Grep 预定位行号，再用 offset/limit 精准读取**
- ✅ **每次读取限制在 50 行以内**

---