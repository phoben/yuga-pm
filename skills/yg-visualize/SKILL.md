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
    {"content": "章节填充：逐个处理所有 H2 章节", "status": "pending", "activeForm": "填充章节内容"},
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
python3 "${CLAUDE_SKILL_DIR}/scripts/extract-outline.py" "$doc_path"
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
| 文件格式 | 扩展名 `.md` | 拒绝执行 |
| 标题结构 | 包含 H1 + ≥2 个 H2 | 提示使用 `/yg-document-writing` |

---

## 阶段2: 框架生成

### 步骤1: 确定输出路径

```
output_path = "{doc_dir}/{doc_name}.html"
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
**项目名称：** 泽丰数字化建设技术选型及架构建议方案
**状态：** 待确认
```

### 步骤4: 生成框架文件

**填充区域对照表：**
| 区域 | data-fill | 内容 |
|------|-----------|------|
| 顶部标题栏 | header-title | 文档标题 |
| 侧边栏目录 | nav | H2 章节导航链接（带进度标记） |
| 文档头部 | header | H1 + 元信息 |
| 章节内容 | content | H2 章节占位符（带骨架屏） |

**生成导航项（带进度标记）：**
```html
<div class="nav-item-wrapper">
  <a href="#section-1" class="nav-item flex-1 block px-3 py-2 rounded-md text-sm hover:bg-accent">功能概述</a>
  <span class="nav-progress-badge" data-section="section-1">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
    </svg>
    编写中
  </span>
</div>
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
    {"content": "章节填充：逐个处理所有 H2 章节", "status": "in_progress", "activeForm": "填充章节内容"},
    {"content": "质量验证：检查占位符残留", "status": "pending", "activeForm": "验证 HTML 质量"}
  ]
})
```

### 步骤2: 动态创建章节子任务

**为每个 H2 章节创建 TodoWrite 任务：**

```
# 构建完整任务列表（包含章节子任务）
todos = [
  {"content": "文档预处理：执行脚本获取 outline", "status": "completed", "activeForm": "执行预处理脚本"},
  {"content": "框架生成：填充 H1 + 元信息，生成章节骨架", "status": "completed", "activeForm": "生成框架文件"},
  {"content": "章节填充：逐个处理所有 H2 章节", "status": "in_progress", "activeForm": "填充章节内容"}
]

# 添加章节子任务
for section in outline.sections:
    todos.append({
        "content": f"填充章节: {section.text}",
        "status": "pending",
        "activeForm": f"填充 {section.text}"
    })

todos.append({"content": "质量验证：检查占位符残留", "status": "pending", "activeForm": "验证 HTML 质量"})

TodoWrite({todos: todos})
```

### 步骤3: 顺序执行并更新状态

**逐个处理章节，每完成一个就更新 TodoWrite：**

```
for section in outline.sections:
    # 1. 标记当前章节 in_progress
    TodoWrite(更新当前章节状态为 in_progress)

    # 2. 启动 SubAgent (同步等待)
    Agent({
        subagent_type: "general-purpose",
        name: f"fill-{section.id}",
        description: f"填充章节 {section.text}",
        prompt: `
            参考 Agent 规范: ${CLAUDE_SKILL_DIR}/agents/fill-section.md

            ## 任务参数（仅路径，无内容）

            **源文档路径:** {source_doc_path}
            **目标文件路径:** {output_html_path}
            **章节 ID:** {section.id}
            **章节标题:** {section.text}
            **行号范围:** {section.startLine} - {section.endLine}

            ## 执行要求

            1. 自行读取源文档指定行号范围
            2. 调用 shadcn 技能获取组件指南
            3. 生成 HTML 片段
            4. 使用 Edit 工具替换占位符（同时删除骨架屏）
            5. 使用 Edit 工具更新导航状态（删除进度标记）

            ## 输出

            仅报告状态：DONE | BLOCKED
        `,
        run_in_background: false
    })

    # 3. 验证章节填充成功后，更新导航状态
    # 主Agent 使用 Edit 删除该章节的进度标记（如果 SubAgent 未执行）
    # 使用 grep 检查骨架屏是否已被替换
    grep -c "data-skeleton=\"{section.id}\"" {output_path}
    # 如果返回 0，表示骨架屏已被替换

    # 4. 标记当前章节 completed
    TodoWrite(更新当前章节状态为 completed)
```

### 步骤4: 更新导航进度标记

**SubAgent 完成后，更新导航状态（删除进度标记）：**

```html
<!-- 处理前（编写中状态） -->
<div class="nav-item-wrapper">
  <a href="#section-1" class="nav-item flex-1 block px-3 py-2 rounded-md text-sm hover:bg-accent">功能概述</a>
  <span class="nav-progress-badge" data-section="section-1">
    <svg>...</svg>
    编写中
  </span>
</div>

<!-- 处理后（完成状态） -->
<div class="nav-item-wrapper">
  <a href="#section-1" class="nav-item flex-1 block px-3 py-2 rounded-md text-sm hover:bg-accent">功能概述</a>
</div>
```

**使用 Edit 工具更新：**
```
Edit(
  file_path="{output_html_path}",
  old_string='<div class="nav-item-wrapper">\n          <a href="#section-1" class="nav-item flex-1 block px-3 py-2 rounded-md text-sm hover:bg-accent">功能概述</a>\n          <span class="nav-progress-badge" data-section="section-1">...</span>\n        </div>',
  new_string='<div class="nav-item-wrapper">\n          <a href="#section-1" class="nav-item flex-1 block px-3 py-2 rounded-md text-sm hover:bg-accent">功能概述</a>\n        </div>'
)
```

### CLI 显示效果

**用户将看到可视化进度：**

```
☑ 文档预处理：执行脚本获取 outline
☑ 框架生成：填充 H1 + 元信息，生成章节骨架
► 章节填充：逐个处理所有 H2 章节
  ☐ 填充章节: 功能概述
  ☐ 填充章节: 技术架构
  ☐ 填充章节: 实施计划
☐ 质量验证：检查占位符残留
```

**章节完成后：**
```
► 章节填充：逐个处理所有 H2 章节
  ☑ 填充章节: 功能概述
  ► 填充章节: 技术架构    ← 当前执行
  ☐ 填充章节: 实施计划
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
    {"content": "章节填充：逐个处理所有 H2 章节", "status": "completed", "activeForm": "填充章节内容"},
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
│  看到初始页面：所有导航项显示"编写中"，内容区显示骨架屏        │
│                    ↓                                        │
│  SubAgent 完成章节1 → 文件保存 → 浏览器自动刷新              │
│                    ↓                                        │
│  用户看到：导航项1的"编写中"消失，内容1显示真实内容           │
│                    ↓                                        │
│  依次看到其他章节逐步完成...                                  │
└─────────────────────────────────────────────────────────────┘
```

### 视觉反馈设计

**导航栏进度标记：**
- 编写中：显示旋转图标 + "编写中" 文字（脉冲动画）
- 已完成：标记消失，仅保留导航链接

**内容区骨架屏：**
- 加载中：显示渐变动画的骨架占位符
- 已完成：显示真实 HTML 内容

**整体进度感知：**
```
初始状态：
  ☐ 功能概述     [编写中]
  ☐ 技术架构     [编写中]
  ☐ 实施计划     [编写中]

50% 完成时：
  ✓ 功能概述
  ☐ 技术架构     [编写中]  ← 当前正在处理
  ☐ 实施计划     [编写中]

全部完成：
  ✓ 功能概述
  ✓ 技术架构
  ✓ 实施计划
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

## 关键规则

### 红色警戒

- ❌ 在 SubAgent prompt 中传递完整章节内容
- ❌ 让 SubAgent 返回生成的 HTML（应直接写入文件）
- ❌ 跳过 shadcn 技能调用
- ❌ 使用非 shadcn 风格的自定义 CSS
- ❌ **保留 ASCII 字符串图表（必须转换为 HTML 组件）**
- ❌ **使用 `<pre>` 包裹 ASCII 图表**

### 图表转换规范

| 图表类型 | ASCII 特征 | 转换目标 |
|---------|-----------|----------|
| 流程图 | `┌───┐` `│` `▼` `►` | HTML flowchart 组件 |
| 架构图 | 多层结构，分层标签 | HTML architecture 组件 |
| 决策树 | `├─` `└─` 树形结构 | HTML flowchart 组件 |

**转换规则详见:** `${CLAUDE_SKILL_DIR}/agents/fill-section.md` 中「图表转换规则」章节

### 图表渲染方案

yg-visualize 支持两种图表渲染方案：

| 方案 | 技术 | 适用场景 |
|------|------|---------|
| **yg-diagram Canvas** | Konva.js | 复杂图表、多节点、需要交互（推荐） |
| HTML 组件 | CSS | 简单图表、无需交互 |

**优先使用 yg-diagram Canvas 方案。**

详细规范见：`${CLAUDE_SKILL_DIR}/references/yg-diagram-spec.md`

### 最佳实践

- ✅ 主 Agent 只传递路径和定位信息
- ✅ SubAgent 自行 Read 源文档
- ✅ SubAgent 自行 Edit 目标文件
- ✅ SubAgent 只报告状态，不返回大段内容
- ✅ 使用 `data-fill` 属性定位占位符
- ✅ **识别并转换所有 ASCII 图表为 HTML 组件**

---