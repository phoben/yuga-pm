---
name: yg-create-html
description: "将 Markdown 文档转换为精美的 HTML 可视化报告。当用户要求将 Markdown 转换为 HTML、生成可视化报告、创建专业文档展示、需要图表/流程图渲染时触发。基于 shadcn/ui 组件体系，支持明暗主题切换，使用 Lucide Icons 图标系统，支持任意结构的 Markdown 文档。"
---

# Markdown 转 HTML 可视化报告

## 定位

本技能是一个**通用的** Markdown → HTML 可视化转换器，基于 **shadcn/ui** 组件体系构建。通过智能分析 Markdown 结构，自动生成专业的 HTML 报告，包含：

- 动态图表（Chart.js）
- 流程图/时序图/ER图（Mermaid）
- 代码高亮（highlight.js）
- 响应式布局与**明暗主题切换**
- 可折叠内容区块
- 基于 Lucide Icons 的图标系统

## 设计哲学

### 1. 内容优先，形式服务内容

HTML 输出的核心目标是**增强内容的可读性和信息传达效率**。遵循以下原则：

- **信息层级清晰**：通过字体大小、颜色、间距建立视觉层级
- **关键信息突出**：使用卡片、标签、徽章突出重要数据
- **减少认知负担**：合理分组、渐进披露（折叠详情）
- **一致性**：相同类型的内容使用相同的视觉表达

### 2. 技术栈

**核心组件库**：shadcn/ui（基于 Radix UI + Tailwind CSS）

```
shadcn/ui 组件映射：
├── Card → Section Card, Topic Card, Chart Card
├── Badge → 状态标签、优先级标记
├── Alert → 警告框、提示框
├── Collapsible → 可折叠区块
├── Tabs → 内容分组（可选）
├── Accordion → 问题/风险列表
├── Table → 数据表格
└── Button → 交互按钮
```

**图标系统**：Lucide Icons（通过 `better-icons` 选择）

```
图标选择工具：better-icons
使用场景：
- 侧边栏导航图标
- 状态指示图标
- 操作按钮图标
- 空状态图标
```

### 3. 明暗主题切换

报告**必须**支持明暗主题切换功能：

- **右上角主题切换按钮**：位于页面顶部 Header 右侧
- **默认主题**：深色主题（dark）
- **主题持久化**：使用 `localStorage` 记住用户选择
- **平滑过渡**：主题切换时使用 CSS transition 实现平滑过渡

#### 主题切换按钮设计

```html
<button id="theme-toggle" class="theme-toggle-btn" title="切换主题">
  <!-- 深色模式显示太阳图标，浅色模式显示月亮图标 -->
  <i data-lucide="sun" class="lucide"></i>   <!-- dark mode -->
  <i data-lucide="moon" class="lucide hidden"></i>  <!-- light mode -->
</button>
```

**按钮样式**：
- 位置：`.top-header .header-right`
- 尺寸：`36px × 36px`
- 圆角：`8px`
- 背景：`hsl(var(--secondary))`
- 悬停效果：`hsl(var(--muted))`
- 过渡动画：`0.2s ease`

#### CSS 变量系统

使用 CSS 自定义属性实现主题切换：

```css
/* 深色主题（默认） */
:root, :root.dark {
  --background: 0 0% 3.9%;           /* #09090b */
  --foreground: 0 0% 98%;            /* #fafafa */
  --card: 0 0% 3.9%;                 /* #09090b */
  --card-foreground: 0 0% 98%;       /* #fafafa */
  --primary: 0 0% 98%;               /* #fafafa */
  --primary-foreground: 0 0% 9%;     /* #171717 */
  --secondary: 0 0% 14.9%;           /* #27272a */
  --secondary-foreground: 0 0% 98%;  /* #fafafa */
  --muted: 0 0% 14.9%;               /* #27272a */
  --muted-foreground: 0 0% 63.9%;    /* #a1a1aa */
  --border: 0 0% 14.9%;              /* #27272a */
}

/* 浅色主题 */
:root.light {
  --background: 0 0% 100%;           /* #ffffff */
  --foreground: 0 0% 3.9%;           /* #09090b */
  --card: 0 0% 100%;                 /* #ffffff */
  --card-foreground: 0 0% 3.9%;      /* #09090b */
  --primary: 0 0% 9%;                /* #171717 */
  --primary-foreground: 0 0% 98%;    /* #fafafa */
  --secondary: 0 0% 96.1%;           /* #f4f4f5 */
  --secondary-foreground: 0 0% 9%;   /* #171717 */
  --muted: 0 0% 96.1%;               /* #f4f4f5 */
  --muted-foreground: 0 0% 45.1%;    /* #71717a */
  --border: 0 0% 89.8%;              /* #e4e4e7 */
}
```

#### 主题切换 JavaScript

```javascript
// 主题切换逻辑
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  html.classList.remove('dark', 'light');
  html.classList.add(isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');

  // 切换图标显示
  document.querySelectorAll('#theme-toggle .lucide').forEach(icon => {
    icon.classList.toggle('hidden');
  });

  // 更新 Mermaid 主题
  updateMermaidTheme(!isDark);

  // 更新 Chart.js 图表颜色
  updateChartColors(!isDark);
}

// 初始化主题（从 localStorage 读取）
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  document.documentElement.classList.add(theme);

  // 设置正确的图标
  const isDark = theme === 'dark';
  document.querySelector('#theme-toggle [data-lucide="sun"]').classList.toggle('hidden', !isDark);
  document.querySelector('#theme-toggle [data-lucide="moon"]').classList.toggle('hidden', isDark);
}
```

#### Mermaid 主题适配

主题切换时同步更新 Mermaid 图表主题：

```javascript
const mermaidThemes = {
  dark: {
    theme: 'dark',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#fafafa',
      background: '#09090b',
      mainBkg: '#27272a',
      nodeBorder: '#3b82f6',
    }
  },
  light: {
    theme: 'default',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#09090b',
      background: '#ffffff',
      mainBkg: '#f4f4f5',
      nodeBorder: '#3b82f6',
    }
  }
};

function updateMermaidTheme(isDark) {
  const config = isDark ? mermaidThemes.dark : mermaidThemes.light;
  mermaid.initialize(config);
  // 重新渲染所有 Mermaid 图表
  document.querySelectorAll('.mermaid').forEach(el => {
    mermaid.init(undefined, el);
  });
}
```

#### Chart.js 图表颜色适配

```javascript
const chartColors = {
  dark: {
    text: '#fafafa',
    grid: '#27272a',
    background: '#09090b'
  },
  light: {
    text: '#09090b',
    grid: '#e4e4e7',
    background: '#ffffff'
  }
};

function updateChartColors(isDark) {
  const colors = isDark ? chartColors.dark : chartColors.light;
  Chart.defaults.color = colors.text;
  Chart.defaults.borderColor = colors.grid;
  // 更新现有图表
  Chart.instances.forEach(chart => chart.update());
}
```

### 4. 解耦设计

```
┌─────────────────────────────────────────────────────────┐
│  输入层：Markdown 源文档                                  │
│  - 任意结构的 Markdown                                    │
│  - 不假设特定字段或格式                                    │
└───────────────────────┬─────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  解析层：内容分析与模式识别                                │
│  - 结构提取（标题层级、列表、表格）                        │
│  - 数据识别（数值、评分、状态）                            │
│  - 图表推荐（根据数据类型选择最佳可视化）                   │
│  - 图标匹配（通过 better-icons 语义匹配）                 │
└───────────────────────┬─────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  输出层：HTML 渲染（shadcn/ui 风格）                      │
│  - CSS 变量系统（明暗主题切换）                           │
│  - 组件样式（Card, Badge, Alert 等）                     │
│  - Lucide Icons 图标                                    │
│  - 交互功能（折叠、导航、缩放）                            │
└─────────────────────────────────────────────────────────┘
```

### 5. 自适应策略

| 检测到的内容 | 生成的组件 | shadcn/ui 对应 |
|-------------|-----------|---------------|
| 带评分的数据表 | 评分柱状图/雷达图 | Card + Chart |
| 分布/占比数据 | 饼图/环形图 | Card + Chart |
| 时间序列数据 | 折线图/面积图 | Card + Chart |
| 对比数据 | 条形图/分组柱状图 | Card + Chart |
| Mermaid 代码块 | 流程图/时序图 | Card + Mermaid |
| 代码块 | 语法高亮代码区 | Card + Code |
| 问题/风险列表 | 可折叠问题卡片 | Accordion |
| 步骤/流程描述 | 步骤指示器 | Card + Steps |

---

## 执行流程

### Step 1: 读取 Markdown 文档

使用 Read 工具读取 Markdown 文件完整内容。

### Step 2: 智能分析文档结构

**不要假设文档结构**，而是动态分析：

#### 2.1 提取元信息

从文档开头提取可能的元信息：
- 文档标题（第一个 H1 或 title）
- 日期（匹配日期格式的文本）
- 版本号（VX.X 或 version 字样）
- 作者/来源

#### 2.2 分析文档大纲

遍历所有标题，建立层级结构：
```javascript
outline: [
  { level: 1, text: "文档标题", id: "doc-title" },
  { level: 2, text: "第一章", id: "chapter-1", children: [...] },
  { level: 2, text: "第二章", id: "chapter-2", children: [...] }
]
```

#### 2.3 识别数据模式

扫描文档内容，识别可可视化的数据：

**评分/指标数据**：
- 格式：表格中的数值列，带分值描述（如 "85分"、"85%"、"85/100"）
- 可视化：柱状图、雷达图、仪表盘

**分布/占比数据**：
- 格式：带数量或百分比的分类列表
- 可视化：饼图、环形图、树图

**时间/趋势数据**：
- 格式：日期关联的数值
- 可视化：折线图、面积图

**对比数据**：
- 格式：多行多列的数值表格
- 可视化：分组柱状图、热力图

**状态/结果数据**：
- 格式：通过/失败、完成/待办、正常/异常
- 可视化：状态条、进度条、状态矩阵

#### 2.4 提取特殊块

- **Mermaid 代码块**：提取所有 ````mermaid` 内容
- **代码块**：识别语言类型（sql、json、python 等）
- **表格**：解析表格结构和数据
- **列表**：识别有序/无序列表，提取层级

#### 2.5 识别问题/风险项

如果文档包含问题、风险、待办等条目：
- 提取优先级标识（P0/P1/P2、高/中/低、严重/重要/建议）
- 提取标题、描述、影响范围

### Step 3: 选择图标

使用 `better-icons` 根据内容语义选择合适的 Lucide 图标：

#### 图标选择指南

| 内容类型 | 推荐 Lucide 图标 | 避免使用 |
|---------|-----------------|---------|
| 总览/摘要 | `layout-dashboard`, `file-text`, `clipboard-list` | emoji |
| 分析/评估 | `bar-chart-2`, `trending-up`, `search` | emoji |
| 问题/风险 | `alert-triangle`, `alert-circle`, `alert-octagon` | emoji |
| 解决方案 | `lightbulb`, `check-circle`, `wrench` | emoji |
| 数据/表格 | `table`, `database`, `hash` | emoji |
| 流程/步骤 | `git-branch`, `play`, `arrow-right` | emoji |
| 代码/技术 | `code`, `terminal`, `cpu` | emoji |
| 测试/验证 | `flask-conical`, `check`, `target` | emoji |
| 时间/日期 | `calendar`, `clock`, `history` | emoji |
| 文档/说明 | `file`, `book-open`, `file-check` | emoji |
| 成功/完成 | `check-circle-2`, `badge-check` | emoji |
| 警告/注意 | `alert-triangle`, `info` | emoji |
| 错误/失败 | `x-circle`, `octagon-x` | emoji |
| 用户/角色 | `user`, `users`, `user-circle` | emoji |
| 设置/配置 | `settings`, `sliders-horizontal` | emoji |

**图标使用原则**：
- 优先使用 Lucide Icons SVG
- 图标尺寸：16px（默认）、20px（强调）、24px（大图标）
- 颜色继承父元素或使用语义颜色
- 避免在标题中混用 emoji 和 Lucide 图标

### Step 4: 选择图表类型

根据识别的数据模式，选择合适的图表：

```
数据类型？
├─ 单维度评分/指标 → 柱状图（Bar Chart）
├─ 多维度评分 → 雷达图（Radar Chart）
├─ 分类占比 → 环形图（Doughnut）
├─ 时间趋势 → 折线图（Line）
├─ 多组对比 → 分组柱状图（Grouped Bar）
├─ 状态分布 → 条形图（Horizontal Bar）
└─ 层级结构 → 树图（Treemap）
```

**图表数量控制**：最多 3-4 个图表

### Step 5: 准备填充数据

根据分析结果，准备数据结构：

```javascript
// 1. 文档元信息
{
  report_title: "文档标题",
  report_date: "YYYY-MM-DD",
  report_meta: [
    { label: "版本", value: "V2.0" },
    { label: "类型", value: "需求文档" }
  ]
}

// 2. 侧边栏导航（从大纲自动生成，含 Lucide 图标）
sidebar_nav: [
  { id: "sec-1", label: "第一章", icon: "layout-dashboard", level: 0 },
  { id: "sec-1-1", label: "1.1 子节", icon: null, level: 1 }
]

// 3. 图表数据
charts: [
  {
    id: "chart-scores",
    type: "bar",
    title: "评分分析",
    data: { labels: [...], values: [...], colors: [...] }
  }
]

// 4. 内容区块
sections: [
  {
    id: "sec-1",
    title: "第一章",
    badges: [...],
    content: "...",
    collapsible: false
  }
]
```

### Step 6: 渲染 HTML

#### 6.1 读取模板

模板文件：`\report.html`

#### 6.2 替换占位符

| 占位符 | 说明 |
|--------|------|
| `__REPORT_TITLE__` | 文档标题 |
| `__REPORT_DATE__` | 文档日期 |
| `__REPORT_META__` | 元信息标签组 |
| `__SIDEBAR_NAV__` | 侧边栏导航 HTML |
| `__QUICK_CONCLUSION__` | 文档摘要 |
| `__CHARTS_HTML__` | 图表区域 HTML |
| `__CHART_DATA__` | 图表数据 JSON |
| `__MD_CONTENT__` | Markdown 渲染后的内容 |

### Step 7: 保存输出

使用 Write 工具保存 HTML 文件，路径默认与 MD 文件同目录。

---

## 内容范式识别与样式规范

根据 Markdown 内容的结构特征，自动识别并应用对应的 shadcn/ui 风格组件。

---

### 1. 线性流程类（Linear Process）

**识别特征**：有序编号的步骤，步骤之间有先后依赖关系

**推荐组件**：**Step Cards**（shadcn/ui Card 风格）

```html
<div class="step-cards">
  <div class="step-card">
    <div class="step-num">
      <!-- Lucide: circle-dot or number badge -->
      <span class="num">1</span>
    </div>
    <div class="step-content">
      <h4>步骤标题</h4>
      <p>步骤描述内容...</p>
    </div>
  </div>
</div>
```

**样式要点**（shadcn/ui Card）：
- 卡片：`bg-card border border-border rounded-lg p-4`
- 数字徽章：`w-8 h-8 rounded-full bg-primary text-primary-foreground`
- 间距：`space-y-3`

---

### 2. 时间线类（Timeline）

**识别特征**：带日期/时间节点的事件序列

**推荐组件**：**Vertical Timeline**

```html
<div class="timeline">
  <div class="timeline-item external">
    <div class="timeline-dot">
      <!-- Lucide: circle -->
    </div>
    <div class="timeline-content">
      <div class="timeline-header">
        <span class="timeline-date">2024-01-15</span>
        <!-- Lucide: external-link for external events -->
        <svg class="lucide-icon external-link"><!-- ... --></svg>
      </div>
      <h4>事件标题</h4>
      <p>事件描述...</p>
    </div>
  </div>
</div>
```

**样式要点**：
- 轴线：`border-l-2 border-border`
- 节点：`w-3 h-3 rounded-full bg-primary`
- 外部事件：`text-muted-foreground`

---

### 3. 顺序带主题内容（Sequential with Topics）

**识别特征**：有编号且每个编号下有独立标题和详细内容

**推荐组件**：**Topic Cards**（shadcn/ui Card + Badge）

```html
<div class="topic-cards">
  <div class="topic-card">
    <div class="topic-header">
      <span class="topic-num">01</span>
      <h3>主题标题</h3>
      <!-- shadcn/ui Badge -->
      <span class="badge badge-secondary">标签</span>
    </div>
    <div class="topic-body">
      <p>详细内容...</p>
      <!-- shadcn/ui Alert -->
      <div class="alert alert-info">
        <svg class="lucide-icon info"><!-- ... --></svg>
        <span>重点提示</span>
      </div>
    </div>
  </div>
</div>
```

**样式要点**：
- 头部：`bg-muted rounded-t-lg p-4 flex items-center gap-3`
- 编号：`text-primary font-mono text-sm`
- Badge：`bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs`

---

### 4. 无序带主题内容（Unordered with Topics）

**识别特征**：无序列表项，但每项有标题+描述结构

**推荐组件**：**Feature Grid**（shadcn/ui Card grid）

```html
<div class="feature-grid">
  <div class="feature-item">
    <div class="feature-icon">
      <!-- Lucide icon based on content -->
      <svg class="lucide-icon"><!-- package, database, etc. --></svg>
    </div>
    <div class="feature-content">
      <h4>特性名称</h4>
      <p>特性描述...</p>
    </div>
  </div>
</div>
```

**样式要点**：
- 图标：根据内容语义选择 Lucide 图标（使用 better-icons）
- 网格：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- 卡片：`bg-card border border-border rounded-lg p-4`

---

### 5. 矩阵型内容（Matrix）

**识别特征**：结构化表格数据，属性-值对应关系

**推荐组件**：**shadcn/ui Table / KV Grid**

```html
<!-- Property Table -->
<div class="table-container border border-border rounded-lg overflow-hidden">
  <table class="data-table w-full">
    <thead>
      <tr class="border-b border-border bg-muted/50">
        <th class="text-left p-3 font-medium">属性</th>
        <th class="text-left p-3 font-medium">值</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-border">
        <td class="p-3 font-medium">名称</td>
        <td class="p-3">值内容</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- KV Grid -->
<div class="kv-grid grid grid-cols-2 md:grid-cols-3 gap-4">
  <div class="kv-item bg-muted/50 border border-border rounded-lg p-3">
    <div class="kv-label text-muted-foreground text-xs uppercase tracking-wide mb-1">
      <svg class="lucide-icon label inline w-3 h-3"><!-- ... --></svg>
      <span>标签</span>
    </div>
    <div class="kv-value font-semibold">值</div>
    <div class="kv-desc text-muted-foreground text-sm mt-1">补充说明</div>
  </div>
</div>
```

---

### 6. 核心短句内容（Key Points）

**识别特征**：简短的要点列表，强调快速阅读

**推荐组件**：**Stat Chips / Point Cards**

```html
<!-- Stat Chips -->
<div class="stat-chips flex flex-wrap gap-3">
  <div class="stat-chip bg-muted border border-border rounded-full px-4 py-2 flex items-center gap-2">
    <svg class="lucide-icon check-circle text-success"><!-- ... --></svg>
    <div>
      <div class="stat-label text-muted-foreground text-xs">标签</div>
      <div class="stat-value font-bold">核心内容</div>
    </div>
  </div>
</div>

<!-- Point Cards -->
<div class="point-cards grid grid-cols-2 md:grid-cols-3 gap-3">
  <div class="point-card bg-card border border-border rounded-lg p-3 flex items-start gap-2">
    <svg class="lucide-icon check-circle-2 text-success w-5 h-5 flex-shrink-0"><!-- ... --></svg>
    <div class="point-text text-sm">核心要点</div>
  </div>
</div>
```

---

### 7. 问题/风险列表（Issues/Risks）

**识别特征**：包含问题、风险、待办等条目，有优先级标识

**推荐组件**：**shadcn/ui Accordion**

```html
<div class="accordion space-y-2">
  <div class="accordion-item border-l-4 border-l-destructive bg-card border border-border rounded-lg">
    <div class="accordion-header p-4 flex items-center justify-between cursor-pointer">
      <div class="flex items-center gap-3">
        <svg class="lucide-icon alert-triangle text-destructive"><!-- ... --></svg>
        <span class="badge badge-destructive">P0</span>
        <span class="font-medium">问题标题</span>
      </div>
      <svg class="lucide-icon chevron-down text-muted-foreground"><!-- ... --></svg>
    </div>
    <div class="accordion-content px-4 pb-4 text-muted-foreground">
      <p>问题描述...</p>
    </div>
  </div>
</div>
```

**优先级图标与颜色**：

| 优先级 | Lucide 图标 | 颜色类 |
|-------|------------|--------|
| P0/严重 | `alert-octagon` | `text-destructive` |
| P1/重要 | `alert-triangle` | `text-warning` |
| P2/建议 | `info` | `text-info` |
| 完成 | `check-circle-2` | `text-success` |

---

### 8. 代码块（Code Blocks）

**推荐组件**：**shadcn/ui Code Block**

```html
<div class="code-block-wrapper bg-muted border border-border rounded-lg overflow-hidden">
  <div class="code-header bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border">
    <span class="code-lang text-muted-foreground text-xs font-mono">sql</span>
    <button class="copy-btn text-muted-foreground hover:text-foreground">
      <svg class="lucide-icon copy w-4 h-4"><!-- ... --></svg>
    </button>
  </div>
  <pre class="code-content p-4 overflow-x-auto"><code class="language-sql">-- SQL code</code></pre>
</div>
```

---

### 9. Mermaid 图表

**推荐组件**：**Card with zoom modal**

```html
<div class="mermaid-card bg-card border border-border rounded-lg overflow-hidden">
  <div class="mermaid-header px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
    <h4 class="font-medium flex items-center gap-2">
      <svg class="lucide-icon git-branch w-4 h-4"><!-- ... --></svg>
      流程图
    </h4>
    <button class="zoom-btn text-muted-foreground hover:text-foreground">
      <svg class="lucide-icon maximize-2 w-4 h-4"><!-- ... --></svg>
    </button>
  </div>
  <div class="mermaid-content p-4">
    <pre class="mermaid">graph TD...</pre>
  </div>
</div>
```

---

## 内容范式识别流程

```
1. 是否为有序编号 + 有标题结构？
   → 是：Topic Cards（shadcn/ui Card）
   → 否：继续判断

2. 是否为有序编号 + 步骤/动作描述？
   → 是：Step Cards
   → 否：继续判断

3. 是否带时间节点/日期？
   → 是：Timeline
   → 否：继续判断

4. 是否为无序列表 + 每项有加粗主题？
   → 是：Feature Grid
   → 否：继续判断

5. 是否为表格结构？
   → 是：Table / KV Grid
   → 否：继续判断

6. 是否为问题/风险列表？
   → 是：Accordion（带优先级图标）
   → 否：继续判断

7. 是否为简短短语列表？
   → 是：Stat Chips / Point Cards
   → 否：使用默认样式
```

---

## 图标使用规范

### Lucide Icons 图标选择

使用 `better-icons` 工具辅助选择图标：

```
调用方式：
better-icons --query "描述语义" --limit 5

示例：
better-icons --query "database storage" --limit 5
→ database, hard-drive, server, container, archive
```

### 图标渲染格式

```html
<!-- 内联 SVG（推荐） -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-[name]">
  <path d="..."/>
</svg>

<!-- 图标尺寸类 -->
.lucide-sm { width: 14px; height: 14px; }
.lucide-md { width: 16px; height: 16px; }
.lucide-lg { width: 20px; height: 20px; }
.lucide-xl { width: 24px; height: 24px; }
```

### 图标颜色语义

| 语义 | CSS 类 | 颜色值 |
|-----|--------|--------|
| 主要/默认 | `text-foreground` | `#fafafa` |
| 次要/辅助 | `text-muted-foreground` | `#a1a1aa` |
| 成功 | `text-success` | `#22c55e` |
| 警告 | `text-warning` | `#f59e0b` |
| 错误/危险 | `text-destructive` | `#ef4444` |
| 信息 | `text-info` | `#3b82f6` |

### 禁止使用 Emoji 的场景

- 侧边栏导航图标
- 状态标签图标
- 按钮/交互元素
- 表格/列表标记
- 卡片装饰图标

**允许使用 Emoji 的场景**（仅当无法用 Lucide 表达时）：
- 文档内的示例内容
- 用户原始 Markdown 中的 emoji

---

## 颜色系统（明暗主题切换）

### shadcn/ui 主题变量

```css
/* 深色主题（默认） */
:root, :root.dark {
  /* Background & Foreground */
  --background: 0 0% 3.9%;          /* #09090b */
  --foreground: 0 0% 98%;           /* #fafafa */

  /* Card */
  --card: 0 0% 3.9%;                /* #09090b */
  --card-foreground: 0 0% 98%;      /* #fafafa */

  /* Primary */
  --primary: 0 0% 98%;              /* #fafafa */
  --primary-foreground: 0 0% 9%;    /* #171717 */

  /* Secondary */
  --secondary: 0 0% 14.9%;          /* #27272a */
  --secondary-foreground: 0 0% 98%; /* #fafafa */

  /* Muted */
  --muted: 0 0% 14.9%;              /* #27272a */
  --muted-foreground: 0 0% 63.9%;   /* #a1a1aa */

  /* Accent */
  --accent: 0 0% 14.9%;             /* #27272a */
  --accent-foreground: 0 0% 98%;    /* #fafafa */

  /* Destructive */
  --destructive: 0 62.8% 30.6%;     /* #991b1b */

  /* Border & Ring */
  --border: 0 0% 14.9%;             /* #27272a */
  --ring: 0 0% 83.1%;               /* #d4d4d8 */

  /* Radius */
  --radius: 0.5rem;

  /* 语义颜色 */
  --success: 142 76% 36%;           /* #22c55e */
  --warning: 38 92% 50%;            /* #f59e0b */
  --info: 217 91% 60%;              /* #3b82f6 */
}

/* 浅色主题 */
:root.light {
  /* Background & Foreground */
  --background: 0 0% 100%;          /* #ffffff */
  --foreground: 0 0% 3.9%;          /* #09090b */

  /* Card */
  --card: 0 0% 100%;                /* #ffffff */
  --card-foreground: 0 0% 3.9%;     /* #09090b */

  /* Primary */
  --primary: 0 0% 9%;               /* #171717 */
  --primary-foreground: 0 0% 98%;   /* #fafafa */

  /* Secondary */
  --secondary: 0 0% 96.1%;          /* #f4f4f5 */
  --secondary-foreground: 0 0% 9%;  /* #171717 */

  /* Muted */
  --muted: 0 0% 96.1%;              /* #f4f4f5 */
  --muted-foreground: 0 0% 45.1%;   /* #71717a */

  /* Accent */
  --accent: 0 0% 96.1%;             /* #f4f4f5 */
  --accent-foreground: 0 0% 9%;     /* #171717 */

  /* Destructive */
  --destructive: 0 84.2% 60.2%;     /* #ef4444 */

  /* Border & Ring */
  --border: 0 0% 89.8%;             /* #e4e4e7 */
  --ring: 0 0% 3.9%;                /* #09090b */

  /* 语义颜色保持不变 */
  --success: 142 76% 36%;           /* #22c55e */
  --warning: 38 92% 50%;            /* #f59e0b */
  --info: 217 91% 60%;              /* #3b82f6 */
}
```

### 图表配色

```javascript
const chartColors = {
  primary: '#fafafa',
  secondary: '#a1a1aa',
  success: '#22c55e',
  warning: '#f59e0b',
  destructive: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  // 调色板
  palette: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4']
};
```

---

## 排版规范

- **主字体**：`ui-sans-serif, system-ui, sans-serif`（shadcn/ui 默认）
- **代码字体**：`ui-monospace, SFMono-Regular, Menlo, monospace`
- **行高**：1.6-1.75（正文），1.3-1.4（标题）
- **字号层级**：
  - H1: 24px / 1.5rem
  - H2: 20px / 1.25rem
  - H3: 16px / 1rem
  - 正文: 14px / 0.875rem
  - 辅助: 12px / 0.75rem

---

## 交互功能

### 可折叠区块

使用 `collapsible` 组件模式：

```html
<div class="collapsible">
  <button class="collapsible-trigger w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
    <span class="font-medium">标题</span>
    <svg class="lucide-icon chevron-down transition-transform duration-200"><!-- ... --></svg>
  </button>
  <div class="collapsible-content overflow-hidden" hidden>
    <!-- 内容 -->
  </div>
</div>
```

### 侧边栏导航

- 滚动监听：IntersectionObserver
- 平滑滚动：`scroll-behavior: smooth`
- 当前项高亮：`text-primary bg-muted`

### 图表交互

- Tooltip：Chart.js 默认 tooltip
- 图例：可点击切换
- Mermaid 放大：Modal 组件

### 代码复制

```html
<button class="copy-btn text-muted-foreground hover:text-foreground transition-colors" onclick="copyCode(this)">
  <svg class="lucide-icon copy w-4 h-4"><!-- ... --></svg>
  <svg class="lucide-icon check w-4 h-4 hidden"><!-- ... --></svg>
</button>
```

---

## 模板占位符详解

### 必需占位符

| 占位符 | 类型 | 说明 |
|--------|------|------|
| `__REPORT_TITLE__` | string | 报告标题 |
| `__SIDEBAR_NAV__` | HTML | 侧边栏导航（含 Lucide 图标） |
| `__MD_CONTENT__` | HTML | Markdown 渲染后的主内容 |

### 可选占位符

| 占位符 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `__REPORT_DATE__` | string | 当前日期 | 报告日期 |
| `__REPORT_META__` | HTML | 空 | 元信息标签组 |
| `__QUICK_SUMMARY__` | HTML | 空 | 快速摘要区 |
| `__CHARTS_HTML__` | HTML | 空 | 图表区域 |
| `__CHART_DATA__` | JSON | `{}` | 图表数据 |

---

## 依赖说明

所有依赖通过 CDN 加载：

| 库 | 版本 | 用途 |
|----|------|------|
| Lucide Icons | latest | 图标系统 |
| Mermaid.js | v10 | 流程图渲染 |
| Chart.js | latest | 数据图表 |
| highlight.js | v11 | 代码高亮 |

---

## 使用示例

### 示例1：需求文档转换

```
输入：DDR需求文档.md
输出：带侧边栏导航、流程图、shadcn/ui 风格卡片的 HTML 报告
```

### 示例2：审查报告转换

```
输入：review.md
输出：带评分图表、Accordion 问题列表、状态统计的 HTML 报告
```

### 示例3：技术文档转换

```
输入：api-docs.md
输出：带代码高亮、目录导航的 HTML 文档
```