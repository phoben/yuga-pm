# yg-visualize 模板化重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 yg-visualize 技能从运行时动态生成改为模板预设模式，减少上下文负载。

**Architecture:** 预创建 HTML 框架模板和组件模板，运行时只需复制模板并填充内容区域。使用 `data-fill` 属性标记可填充区域，SubAgent 读取组件模板替换占位符后填充到指定 region。

**Tech Stack:** HTML5, CSS3 (CSS Variables), Chart.js, Mermaid.js, Lucide Icons

---

## 文件结构

### 新建文件

| 文件 | 职责 |
|-----|------|
| `templates/framework-light.html` | 亮色主题框架模板，包含完整布局和样式 |
| `templates/framework-dark.html` | 暗色主题框架模板 |
| `templates/components/step-cards.html` | 步骤卡片组件 |
| `templates/components/timeline.html` | 时间线组件 |
| `templates/components/topic-cards.html` | 主题卡片组件 |
| `templates/components/feature-grid.html` | 特性网格组件 |
| `templates/components/data-table.html` | 数据表格组件 |
| `templates/components/stat-chips.html` | 统计芯片组件 |
| `templates/components/accordion.html` | 折叠面板组件 |
| `templates/components/code-block.html` | 代码块组件 |
| `templates/components/chart-card.html` | 图表卡片组件 |
| `templates/components/architecture-diagram.html` | 架构图组件 |
| `templates/components/flowchart.html` | 流程图组件 |

### 修改文件

| 文件 | 改动 |
|-----|------|
| `SKILL.md` | 移除 ui-ux-pro-max 调用，添加文档校验步骤，简化流程 |
| `agents/visualize-page.md` | 更新职责：读取组件模板 → 替换占位符 → 填充区域 |
| `references/yg-create-html.md` | 精简为模板使用说明 |
| `references/chart-specs.md` | 移除组件结构，保留图表类型选择规则 |

### 删除文件

| 文件 | 原因 |
|-----|------|
| `references/component-specs.md` | 内容已转为组件模板 |

---

## Task 1: 创建框架模板目录结构

**Files:**
- Create: `skills/yg-visualize/templates/`
- Create: `skills/yg-visualize/templates/components/`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/components"
```

- [ ] **Step 2: 验证目录创建成功**

```bash
ls -la "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/"
```
Expected: 显示 `components` 目录

---

## Task 2: 创建亮色框架模板

**Files:**
- Create: `skills/yg-visualize/templates/framework-light.html`

- [ ] **Step 1: 创建框架模板文件**

创建包含完整结构的亮色主题框架：
- HTML 基础结构
- CDN 依赖引入（Chart.js, Mermaid, highlight.js, Lucide）
- CSS 变量定义（亮色主题）
- 侧边栏导航区（data-fill="sidebar", data-fill="nav"）
- 主内容区（data-fill="header", data-fill="section-N"）
- 交互脚本（目录高亮、平滑滚动）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{doc-title}}</title>

  <!-- CDN Dependencies -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11"></script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    :root {
      /* Colors */
      --primary: #3b82f6;
      --primary-foreground: #ffffff;
      --secondary: #64748b;
      --secondary-foreground: #ffffff;
      --background: #ffffff;
      --foreground: #1f2937;
      --card-bg: #ffffff;
      --card-border: #e5e7eb;
      --border: #e5e7eb;
      --muted: #f3f4f6;
      --muted-foreground: #6b7280;

      /* Chart Colors */
      --chart-color-1: #3b82f6;
      --chart-color-2: #10b981;
      --chart-color-3: #f59e0b;
      --chart-color-4: #ef4444;
      --chart-color-5: #8b5cf6;

      /* Typography */
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;

      /* Spacing */
      --radius: 8px;
      --sidebar-width: 260px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      background: var(--background);
      color: var(--foreground);
      line-height: 1.6;
    }

    .app-container {
      display: flex;
      min-height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--muted);
      border-right: 1px solid var(--border);
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      overflow-y: auto;
      padding: 24px 16px;
    }

    .sidebar-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }

    .doc-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--foreground);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: block;
      padding: 8px 12px;
      border-radius: var(--radius);
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s;
    }

    .nav-item:hover,
    .nav-item[data-active="true"] {
      background: var(--background);
      color: var(--foreground);
    }

    .nav-item[data-level="1"] { padding-left: 12px; font-weight: 500; }
    .nav-item[data-level="2"] { padding-left: 24px; font-size: 13px; }
    .nav-item[data-level="3"] { padding-left: 36px; font-size: 12px; }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: 32px 48px;
      max-width: 900px;
    }

    .content-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .content-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .content-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--muted-foreground);
    }

    .content-body {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    section[data-region="true"] {
      scroll-margin-top: 24px;
    }

    section h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    section h3 {
      font-size: 18px;
      font-weight: 500;
      margin: 24px 0 12px;
    }

    section p {
      margin-bottom: 12px;
    }

    section ul, section ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    section li {
      margin-bottom: 6px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      .sidebar.open { transform: translateX(0); }
      .main-content {
        margin-left: 0;
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" data-fill="sidebar">
      <div class="sidebar-header">
        <h1 class="doc-title" data-fill="doc-title">{{doc-title}}</h1>
      </div>
      <nav class="sidebar-nav" data-fill="nav">
        <!-- Main Agent fills navigation items -->
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="content-header" data-fill="header">
        <!-- Main Agent fills document meta info -->
      </header>

      <article class="content-body" data-fill="content">
        <!-- Sections generated dynamically -->
      </article>
    </main>
  </div>

  <!-- Interaction Scripts -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize Mermaid
    mermaid.initialize({ startOnLoad: true, theme: 'default' });

    // Initialize Highlight.js
    hljs.highlightAll();

    // Scroll spy for navigation
    const sections = document.querySelectorAll('section[data-region="true"]');
    const navItems = document.querySelectorAll('.nav-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(item => {
            item.dataset.active = item.getAttribute('href') === '#' + entry.target.id;
          });
        }
      });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));

    // Smooth scroll
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: 验证文件创建成功**

```bash
wc -l "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/framework-light.html"
```
Expected: 文件行数 > 100

---

## Task 3: 创建暗色框架模板

**Files:**
- Create: `skills/yg-visualize/templates/framework-dark.html`

- [ ] **Step 1: 复制亮色模板并修改 CSS 变量**

基于 framework-light.html，修改颜色变量为暗色主题：

```css
:root {
  /* Colors - Dark Theme */
  --primary: #60a5fa;
  --primary-foreground: #0f172a;
  --secondary: #475569;
  --secondary-foreground: #f1f5f9;
  --background: #0f172a;
  --foreground: #f1f5f9;
  --card-bg: #1e293b;
  --card-border: #334155;
  --border: #334155;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;

  /* Chart Colors - Adjusted for dark bg */
  --chart-color-1: #60a5fa;
  --chart-color-2: #34d399;
  --chart-color-3: #fbbf24;
  --chart-color-4: #f87171;
  --chart-color-5: #a78bfa;

  /* Keep other variables same */
  --font-sans: ...;
  --font-mono: ...;
  --radius: 8px;
  --sidebar-width: 260px;
}
```

同时修改 Mermaid 初始化为 `theme: 'dark'`。

- [ ] **Step 2: 验证文件创建成功**

```bash
wc -l "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/framework-dark.html"
```
Expected: 文件行数 > 100

---

## Task 4: 创建 step-cards 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/step-cards.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Step Cards: 有序步骤流程 -->
<!-- 用于展示有先后依赖关系的步骤序列 -->
<div class="step-cards">
  <style>
    .step-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .step-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: var(--muted);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: var(--primary-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }
    .step-content {
      flex: 1;
    }
    .step-content h4 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: var(--foreground);
    }
    .step-content p {
      margin: 0;
      font-size: 14px;
      color: var(--muted-foreground);
    }
  </style>

  <div class="step-card">
    <div class="step-num"><span class="num">1</span></div>
    <div class="step-content">
      <h4>{{step-title}}</h4>
      <p>{{step-desc}}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

```bash
ls -la "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/components/step-cards.html"
```
Expected: 文件存在

---

## Task 5: 创建 timeline 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/timeline.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Timeline: 时间线组件 -->
<!-- 用于展示带日期/时间节点的事件序列 -->
<div class="timeline">
  <style>
    .timeline {
      position: relative;
      padding-left: 24px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border);
    }
    .timeline-item {
      position: relative;
      padding-bottom: 24px;
    }
    .timeline-item:last-child {
      padding-bottom: 0;
    }
    .timeline-dot {
      position: absolute;
      left: -20px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      border: 2px solid var(--background);
    }
    .timeline-content {
      padding: 12px 16px;
      background: var(--muted);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .timeline-date {
      font-size: 12px;
      color: var(--primary);
      font-weight: 500;
      margin-bottom: 4px;
    }
    .timeline-content h4 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 600;
    }
    .timeline-content p {
      margin: 0;
      font-size: 14px;
      color: var(--muted-foreground);
    }
  </style>

  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-date">{{timeline-date}}</div>
      <h4>{{timeline-title}}</h4>
      <p>{{timeline-desc}}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 6: 创建 topic-cards 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/topic-cards.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Topic Cards: 主题卡片组件 -->
<!-- 用于有编号且每个编号下有独立标题和详细内容 -->
<div class="topic-cards">
  <style>
    .topic-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .topic-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .topic-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--muted);
      border-bottom: 1px solid var(--border);
    }
    .topic-num {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--primary);
      color: var(--primary-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
    }
    .topic-header h3 {
      flex: 1;
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .topic-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: var(--primary);
      color: var(--primary-foreground);
    }
    .topic-body {
      padding: 16px;
    }
    .topic-body p {
      margin: 0;
      font-size: 14px;
      color: var(--muted-foreground);
    }
  </style>

  <div class="topic-card">
    <div class="topic-header">
      <span class="topic-num">01</span>
      <h3>{{topic-title}}</h3>
      <span class="topic-badge">{{topic-badge}}</span>
    </div>
    <div class="topic-body">
      <p>{{topic-content}}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 7: 创建 feature-grid 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/feature-grid.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Feature Grid: 特性网格组件 -->
<!-- 用于无序列表项，每项有标题+描述结构 -->
<div class="feature-grid">
  <style>
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .feature-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: var(--muted);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--primary);
      color: var(--primary-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .feature-icon svg {
      width: 20px;
      height: 20px;
    }
    .feature-content h4 {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 600;
    }
    .feature-content p {
      margin: 0;
      font-size: 13px;
      color: var(--muted-foreground);
    }
  </style>

  <div class="feature-item">
    <div class="feature-icon">
      <!-- Lucide icon: {{icon-name}} -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
    </div>
    <div class="feature-content">
      <h4>{{feature-title}}</h4>
      <p>{{feature-desc}}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 8: 创建 data-table 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/data-table.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Data Table: 数据表格组件 -->
<!-- 用于结构化表格数据 -->
<div class="table-container">
  <style>
    .table-container {
      overflow-x: auto;
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .data-table thead {
      background: var(--muted);
    }
    .data-table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: var(--foreground);
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      color: var(--muted-foreground);
    }
    .data-table tbody tr:last-child td {
      border-bottom: none;
    }
    .data-table tbody tr:hover {
      background: var(--muted);
    }
  </style>

  <table class="data-table">
    <thead>
      <tr>
        <th>{{col-header-1}}</th>
        <th>{{col-header-2}}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{cell-1-1}}</td>
        <td>{{cell-1-2}}</td>
      </tr>
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 9: 创建 stat-chips 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/stat-chips.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Stat Chips: 统计芯片组件 -->
<!-- 用于简短要点列表，强调快速阅读 -->
<div class="stat-chips">
  <style>
    .stat-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .stat-chip {
      padding: 12px 16px;
      background: var(--muted);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      text-align: center;
      min-width: 120px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--muted-foreground);
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--foreground);
    }
  </style>

  <div class="stat-chip">
    <div class="stat-label">{{stat-label}}</div>
    <div class="stat-value">{{stat-value}}</div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 10: 创建 accordion 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/accordion.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Accordion: 折叠面板组件 -->
<!-- 用于问题/风险列表，有优先级标识 -->
<div class="accordion">
  <style>
    .accordion {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .accordion-item {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .accordion-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--muted);
      cursor: pointer;
      user-select: none;
    }
    .accordion-header:hover {
      background: var(--border);
    }
    .accordion-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .accordion-badge.priority-critical { background: #ef4444; color: white; }
    .accordion-badge.priority-high { background: #f59e0b; color: white; }
    .accordion-badge.priority-medium { background: #3b82f6; color: white; }
    .accordion-badge.status-complete { background: #10b981; color: white; }
    .accordion-title {
      flex: 1;
      font-weight: 500;
    }
    .accordion-chevron {
      transition: transform 0.2s;
    }
    .accordion-item[data-open="true"] .accordion-chevron {
      transform: rotate(180deg);
    }
    .accordion-content {
      padding: 16px;
      border-top: 1px solid var(--border);
      display: none;
    }
    .accordion-item[data-open="true"] .accordion-content {
      display: block;
    }
    .accordion-content p {
      margin: 0;
      font-size: 14px;
      color: var(--muted-foreground);
    }
  </style>

  <div class="accordion-item" data-open="false">
    <div class="accordion-header" onclick="this.parentElement.dataset.open = this.parentElement.dataset.open === 'true' ? 'false' : 'true'">
      <span class="accordion-badge priority-critical">{{priority}}</span>
      <span class="accordion-title">{{accordion-title}}</span>
      <svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="accordion-content">
      <p>{{accordion-content}}</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 11: 创建 code-block 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/code-block.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Code Block: 代码块组件 -->
<!-- 用于代码展示，带复制按钮 -->
<div class="code-block-wrapper">
  <style>
    .code-block-wrapper {
      border-radius: var(--radius);
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--muted);
      border-bottom: 1px solid var(--border);
    }
    .code-lang {
      font-size: 12px;
      font-weight: 500;
      color: var(--muted-foreground);
      text-transform: uppercase;
    }
    .copy-btn {
      padding: 4px 8px;
      font-size: 12px;
      background: var(--primary);
      color: var(--primary-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .copy-btn:hover {
      opacity: 0.9;
    }
    .code-content {
      margin: 0;
      padding: 16px;
      background: var(--card-bg);
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.5;
    }
    .code-content code {
      background: transparent;
    }
  </style>

  <div class="code-block-wrapper">
    <div class="code-header">
      <span class="code-lang">{{code-lang}}</span>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').textContent); this.textContent='已复制'">复制</button>
    </div>
    <pre class="code-content"><code class="language-{{code-lang}}">{{code-content}}</code></pre>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 12: 创建 chart-card 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/chart-card.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Chart Card: 图表卡片组件 -->
<!-- 用于 Chart.js 数据图表容器 -->
<div class="chart-card" data-chart-type="{{chart-type}}">
  <style>
    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 20px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .chart-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .chart-body {
      position: relative;
      height: 250px;
    }
    .chart-footer {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  </style>

  <div class="chart-card">
    <div class="chart-header">
      <h4>{{chart-title}}</h4>
    </div>
    <div class="chart-body">
      <canvas id="{{chart-id}}"></canvas>
    </div>
  </div>

  <!-- Chart.js configuration (SubAgent generates) -->
  <script>
    new Chart(document.getElementById('{{chart-id}}'), {
      type: '{{chart-type}}',
      data: {
        labels: {{chart-labels}},
        datasets: [{
          label: '{{chart-label}}',
          data: {{chart-data}},
          backgroundColor: ['var(--chart-color-1)', 'var(--chart-color-2)', 'var(--chart-color-3)', 'var(--chart-color-4)']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } }
      }
    });
  </script>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 13: 创建 architecture-diagram 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/architecture-diagram.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Architecture Diagram: 架构图组件 -->
<!-- 用于大型架构图、系统蓝图 -->
<div class="architecture-diagram">
  <style>
    .architecture-diagram {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 24px;
    }
    .arch-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .arch-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .arch-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .legend-dot.primary { background: var(--primary); }
    .legend-dot.secondary { background: var(--secondary); }
    .legend-dot.database { background: #10b981; }
    .legend-dot.cache { background: #f59e0b; }

    .arch-canvas {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .arch-layer {
      padding: 16px;
      background: var(--muted);
      border-radius: var(--radius);
    }
    .layer-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted-foreground);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .layer-nodes {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .arch-node {
      padding: 12px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }
    .arch-node[data-type="primary"] {
      border-color: var(--primary);
      background: var(--primary);
      color: var(--primary-foreground);
    }
    .arch-node[data-type="secondary"] {
      border-color: var(--secondary);
    }
    .arch-node[data-type="database"] {
      border-color: #10b981;
    }
    .arch-node[data-type="cache"] {
      border-color: #f59e0b;
    }
  </style>

  <div class="architecture-diagram">
    <div class="arch-header">
      <h4>{{arch-title}}</h4>
      <div class="arch-legend">
        <span class="legend-item"><span class="legend-dot primary"></span>核心服务</span>
        <span class="legend-item"><span class="legend-dot secondary"></span>支撑服务</span>
      </div>
    </div>
    <div class="arch-canvas">
      <!-- SubAgent generates layers based on architecture -->
      <div class="arch-layer" data-layer="frontend">
        <div class="layer-label">前端层</div>
        <div class="layer-nodes">
          <div class="arch-node" data-type="primary">{{node-name}}</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 14: 创建 flowchart 组件模板

**Files:**
- Create: `skills/yg-visualize/templates/components/flowchart.html`

- [ ] **Step 1: 创建组件文件**

```html
<!-- Flowchart: 流程图组件 -->
<!-- 用于 HTML 绘制的复杂流程图 -->
<div class="flowchart-diagram">
  <style>
    .flowchart-diagram {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 24px;
    }
    .flowchart-header {
      margin-bottom: 20px;
    }
    .flowchart-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .flowchart-canvas {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .flow-node {
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      min-width: 80px;
    }
    .flow-node.start {
      background: #10b981;
      color: white;
      border-radius: 20px;
    }
    .flow-node.end {
      background: #ef4444;
      color: white;
      border-radius: 20px;
    }
    .flow-node.process {
      background: var(--primary);
      color: var(--primary-foreground);
    }
    .flow-node.decision {
      background: var(--muted);
      border: 2px solid var(--primary);
      transform: rotate(0deg);
    }
    .flow-arrow {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted-foreground);
    }
    .flow-arrow svg {
      width: 20px;
      height: 20px;
    }
  </style>

  <div class="flowchart-diagram">
    <div class="flowchart-header">
      <h4>{{flow-title}}</h4>
    </div>
    <div class="flowchart-canvas">
      <div class="flow-node start">开始</div>
      <div class="flow-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
      <div class="flow-node process">{{process-name}}</div>
      <div class="flow-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
      <div class="flow-node end">结束</div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 验证文件创建成功**

---

## Task 15: 验证所有组件模板创建完成

**Files:**
- Verify: `skills/yg-visualize/templates/components/`

- [ ] **Step 1: 列出所有组件模板文件**

```bash
ls -la "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/components/"
```
Expected: 11 个 .html 文件

- [ ] **Step 2: 提交组件模板**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add skills/yg-visualize/templates/ && git commit -m "feat(yg-visualize): add framework and component templates

- Add framework-light.html and framework-dark.html
- Add 11 component templates with inline styles
- Templates use data-fill attributes for region marking
- Includes Chart.js, Mermaid, highlight.js, Lucide integration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 16: 重构 SKILL.md

**Files:**
- Modify: `skills/yg-visualize/SKILL.md`

- [ ] **Step 1: 重写 SKILL.md 内容**

移除：
- `ui-ux-pro-max` 相关调用
- 动态样式生成流程

添加：
- 文档校验规则
- 模板使用说明

精简后核心流程：

```markdown
---
name: yg-visualize
description: "将Markdown文档转换为可视化HTML。执行步骤：1) 确定文档路径；2) 执行 extract-outline.sh 获取元信息并校验；3) 根据charCount选择模式（<30000直接处理，>=30000主从协调）；4) 复制框架模板并填充内容。禁止跳过步骤2！"
---

# 可视化文档

<HARD-GATE>
在读取任何文档内容之前，**必须**先执行预处理脚本进行校验。
</HARD-GATE>

## 预处理步骤

### 步骤1: 确定文档路径
- 用户指定路径 → 使用该路径
- 用户未指定 → 检查 `.yg-pm/projects/` 目录
- 无项目上下文 → 询问用户

### 步骤2: 执行脚本获取元信息

```bash
bash scripts/extract-outline.sh "$doc_path"
```

### 步骤3: 校验文档规范

| 校验项 | 规则 | 失败处理 |
|-------|------|---------|
| 文件格式 | 扩展名 `.md` | 拒绝执行 |
| 标题结构 | 包含 H1 + ≥2 个 H2 | 提示使用 /yg-requirement-extraction 或 /yg-document-writing |
| 章节长度 | 每章节 > 200 字符 | 警告，询问是否继续 |

### 步骤4: 选择处理模式

- `charCount < 30000` → 直接处理模式
- `charCount >= 30000` → 主从协调模式

---

## 执行流程

### 阶段1: 预处理与校验
执行 extract-outline.sh 获取文档元信息
校验文件格式和标题结构

### 阶段2: 准备模板
1. 选择框架模板（light/dark，默认 light）
2. 复制到目标目录
3. 填充文档元信息（title、nav、header）
4. 根据 outline 生成 section 结构

### 阶段3: 内容生成
- 小文档：主Agent直接填充
- 大文档：启动 SubAgent 并行填充

### 阶段4: 验证
检查区域填充完整性，浏览器测试

---

## 模板说明

### 框架模板
- `templates/framework-light.html` - 亮色主题
- `templates/framework-dark.html` - 暗色主题

### 组件模板
位于 `templates/components/`，共 11 个：
- step-cards.html - 步骤卡片
- timeline.html - 时间线
- topic-cards.html - 主题卡片
- feature-grid.html - 特性网格
- data-table.html - 数据表格
- stat-chips.html - 统计芯片
- accordion.html - 折叠面板
- code-block.html - 代码块
- chart-card.html - 图表卡片
- architecture-diagram.html - 架构图
- flowchart.html - 流程图

### 占位符约定
- `{{title}}` - 标题文本
- `{{desc}}` - 描述文本
- `{{chart-type}}` - 图表类型
- `{{chart-id}}` - 唯一ID

---

## 参考文件

| 文件 | 用途 |
|------|------|
| references/chart-specs.md | 图表类型选择规则 |
| references/mermaid-specs.md | Mermaid 使用规范 |
| references/icon-system.md | 图标映射表 |

## 验收标准
- SKILL.md 行数 ≤ 300
- 框架模板包含完整布局
- 11 个组件模板可用
- 文档校验正常工作
```

- [ ] **Step 2: 验证 SKILL.md 行数**

```bash
wc -l "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/SKILL.md"
```
Expected: ≤ 300 行

- [ ] **Step 3: 提交修改**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add skills/yg-visualize/SKILL.md && git commit -m "refactor(yg-visualize): simplify SKILL.md with template-based approach

- Remove ui-ux-pro-max runtime dependency
- Add document validation rules
- Simplify execution flow to 4 stages
- Document template usage and placeholders

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 17: 更新 visualize-page Agent

**Files:**
- Modify: `skills/yg-visualize/agents/visualize-page.md`

- [ ] **Step 1: 重写 Agent 定义**

```markdown
---
description: 页面生成智能体 - 负责生成指定文档片段的HTML原型片段，由主控Agent调度
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# 页面生成智能体 (visualize-page)

你是一个专门处理文档片段的可视化页面生成智能体。

## 核心职责

1. 读取指定章节内容（使用 offset/limit）
2. 分析内容结构，识别组件类型
3. 读取对应组件模板
4. 替换占位符并填充到指定区域

## 输入参数

| 参数 | 类型 | 说明 |
|-----|------|------|
| doc_path | string | 文档绝对路径 |
| sections | array | 分配的章节列表（含 charRange） |
| template_path | string | 框架模板路径 |
| region_ids | array | 目标区域ID列表 |

## 工作流程

### Step 1: 读取章节内容

使用 Read 工具的 offset 和 limit 参数：
```
offset = charRange[0]
limit = charRange[1] - charRange[0]
```

### Step 2: 分析内容结构

识别内容类型，选择对应组件：
- 有序步骤 → step-cards
- 带日期事件 → timeline
- 编号主题 → topic-cards
- 无序特性 → feature-grid
- 表格数据 → data-table / chart-card
- 简短要点 → stat-chips
- 问题风险 → accordion
- 代码块 → code-block
- 架构图 → architecture-diagram
- 流程图 → flowchart

### Step 3: 读取组件模板

从 `templates/components/` 读取对应组件 HTML 文件。

### Step 4: 替换占位符

将 `{{placeholder}}` 替换为实际内容：
- 复制列表项元素
- 填充标题、描述
- 生成唯一 ID

### Step 5: 填充到区域

使用 Edit 工具填充到框架模板的指定 region：

```html
<!-- 目标区域 -->
<section id="section-1" data-fill="section-1" data-region="true">
  <!-- 填充内容 -->
</section>
```

## 约束规则

| 规则 | 说明 |
|-----|------|
| 只读指定章节 | 禁止读取文档全文 |
| 只编辑指定区域 | 禁止修改其他部分 |
| 使用模板组件 | 禁止创建新样式 |

## 参考资源

- 组件模板目录: `templates/components/`
- 图表规范: `references/chart-specs.md`
- 图标系统: `references/icon-system.md`
```

- [ ] **Step 2: 提交修改**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add skills/yg-visualize/agents/visualize-page.md && git commit -m "refactor(yg-visualize): update visualize-page agent for template-based workflow

- Simplify workflow to 5 steps
- Add component type selection guide
- Update input parameters for template approach

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 18: 精简 yg-create-html.md

**Files:**
- Modify: `skills/yg-visualize/references/yg-create-html.md`

- [ ] **Step 1: 重写文件内容**

移除动态样式生成，简化为模板使用说明：

```markdown
---
name: yg-create-html
description: "HTML 模板使用说明。定义框架模板结构和组件模板的使用方式。"
---

# HTML 模板使用说明

## 框架模板

### 文件位置
- `templates/framework-light.html` - 亮色主题
- `templates/framework-dark.html` - 暗色主题

### 模板结构

框架模板包含以下可填充区域：

| 区域 | data-fill 属性 | 填充者 |
|-----|---------------|-------|
| 文档标题 | `doc-title` | 主Agent |
| 目录导航 | `nav` | 主Agent |
| 文档元信息 | `header` | 主Agent |
| 章节内容 | `section-N` | SubAgent |

### 使用方式

1. 复制模板到目标目录
2. 填充 `<title>` 标签
3. 填充 `data-fill` 区域

---

## 组件模板

位于 `templates/components/`，每个组件包含完整 HTML + 内联样式。

### 占位符替换

| 占位符 | 说明 |
|-------|------|
| `{{title}}` | 标题文本 |
| `{{desc}}` | 描述文本 |
| `{{chart-type}}` | 图表类型 (bar/radar/doughnut/line) |
| `{{chart-id}}` | 唯一 canvas ID |

### 列表项复制

组件模板中包含单个列表项示例，SubAgent 需要根据 Markdown 内容复制并填充。

---

## 参考文件

| 文件 | 用途 |
|------|------|
| chart-specs.md | Chart.js 图表类型选择 |
| mermaid-specs.md | Mermaid 流程图规范 |
| icon-system.md | Lucide 图标映射 |
```

- [ ] **Step 2: 验证文件行数**

```bash
wc -l "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/references/yg-create-html.md"
```
Expected: < 100 行

- [ ] **Step 3: 提交修改**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add skills/yg-visualize/references/yg-create-html.md && git commit -m "refactor(yg-visualize): simplify yg-create-html.md to template usage guide

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 19: 精简 chart-specs.md

**Files:**
- Modify: `skills/yg-visualize/references/chart-specs.md`

- [ ] **Step 1: 移除组件结构部分**

保留图表类型选择规则，移除 HTML 结构示例（已转为 chart-card.html 模板）。

精简后内容：

```markdown
# Chart.js 数据图表规范

## 图表类型选择

| 数据特征 | 图表类型 | 使用场景 |
|---------|---------|---------|
| 评分/指标 | 柱状图/雷达图 | 功能评分、性能指标对比 |
| 占比/分布 | 环形图/饼图 | 状态分布、类型占比 |
| 趋势/时序 | 折线图/面积图 | 数据变化趋势 |
| 排名 | 水平条形图 | Top N 排名 |
| 完成进度 | 仪表盘/进度条 | 完成率、达标率 |
| 多维度评估 | 雷达图 | 能力评估、多维对比 |

## 强制规则

检测到以下数据时必须生成图表：
1. 评分表格 → 柱状图/雷达图
2. 统计数据 → 环形图/饼图
3. 排行数据 → 水平条形图
4. 时间序列 → 折线图
5. 完成状态 → 进度图

图表数量控制：单文档 2-4 个。

## 组件模板

使用 `templates/components/chart-card.html` 模板。
```

- [ ] **Step 2: 提交修改**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add skills/yg-visualize/references/chart-specs.md && git commit -m "refactor(yg-visualize): simplify chart-specs.md, remove HTML structure

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 20: 删除 component-specs.md

**Files:**
- Delete: `skills/yg-visualize/references/component-specs.md`

- [ ] **Step 1: 删除文件**

```bash
rm "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/references/component-specs.md"
```

- [ ] **Step 2: 提交删除**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add -A && git commit -m "refactor(yg-visualize): remove component-specs.md (content moved to templates)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 21: 最终验证

- [ ] **Step 1: 验证文件结构**

```bash
find "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize" -type f -name "*.html" -o -name "*.md" | sort
```
Expected:
- SKILL.md (≤300 行)
- agents/visualize-page.md
- templates/framework-light.html
- templates/framework-dark.html
- templates/components/*.html (11 个)
- references/chart-specs.md
- references/icon-system.md
- references/mermaid-specs.md
- references/yg-create-html.md

- [ ] **Step 2: 验收清单**

```bash
# SKILL.md 行数
wc -l "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/SKILL.md"

# 组件模板数量
ls "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/components/" | wc -l

# 框架模板存在
ls "e:/Develop/SKILLS/yuga-pm/skills/yg-visualize/templates/framework-"*.html
```

- [ ] **Step 3: 创建最终提交**

```bash
cd "e:/Develop/SKILLS/yuga-pm" && git add -A && git commit -m "feat(yg-visualize): complete template-based refactor

- Add framework templates (light/dark)
- Add 11 component templates with inline styles
- Simplify SKILL.md to <300 lines
- Update visualize-page agent
- Remove component-specs.md (moved to templates)
- Simplify chart-specs.md and yg-create-html.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```