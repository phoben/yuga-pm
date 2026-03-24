# yg-visualize 技能模板化重构设计

## 概述

将 `yg-visualize` 技能从"运行时动态生成"改为"模板预设 + 区域填充"模式，减少运行时复杂度和上下文负载。

## 设计目标

1. **消除运行时依赖**：不再运行时调用 `ui-ux-pro-max`，使用预设模板
2. **简化主技能**：主Agent只负责预处理、校验、任务分配
3. **组件模板化**：将组件规范转为可复用的 HTML 模板文件
4. **文档校验**：预处理后校验文档规范，拦截不合格文档

---

## 目录结构

```
skills/yg-visualize/
├── SKILL.md                    # 主技能（精简版）
├── agents/
│   └── visualize-page.md       # SubAgent 定义（更新）
├── script/
│   └── extract-outline.sh      # 文档预处理脚本
├── references/                 # 规范文档（按需加载）
│   ├── yg-create-html.md       # 核心流程（精简）
│   ├── chart-specs.md          # Chart.js 规范
│   ├── mermaid-specs.md        # Mermaid 规范
│   └── icon-system.md          # 图标映射
└── templates/                  # 新增：模板目录
    ├── framework-light.html    # 亮色框架模板
    ├── framework-dark.html     # 暗色框架模板
    └── components/             # 组件模板
        ├── step-cards.html
        ├── timeline.html
        ├── topic-cards.html
        ├── feature-grid.html
        ├── data-table.html
        ├── stat-chips.html
        ├── accordion.html
        ├── code-block.html
        ├── chart-card.html
        ├── architecture-diagram.html
        └── flowchart.html
```

---

## 框架模板结构

框架模板使用 `data-fill` 标记可填充区域：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- 由主Agent填充 --></title>

  <!-- 依赖 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/highlight.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- 预设样式 -->
  <style>
    :root {
      --primary: #3b82f6;
      --primary-foreground: #ffffff;
      --background: #ffffff;
      --foreground: #1f2937;
      --card-bg: #ffffff;
      --border: #e5e7eb;
      /* ... 完整 CSS 变量 */
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- 侧边栏导航区 -->
    <aside class="sidebar" data-fill="sidebar">
      <div class="sidebar-header">
        <h1 class="doc-title" data-fill="doc-title">文档标题</h1>
      </div>
      <nav class="sidebar-nav" data-fill="nav">
        <!-- SubAgent 填充目录 -->
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="content-header" data-fill="header">
        <!-- 主Agent 填充文档元信息 -->
      </header>

      <article class="content-body">
        <!-- 章节区域，由 SubAgent 填充 -->
        <section id="section-1" data-fill="section-1" data-region="true">
          <!-- visualize-page Agent 填充 -->
        </section>
      </article>
    </main>
  </div>

  <!-- 交互脚本 -->
  <script>
    // 目录高亮、平滑滚动
  </script>
</body>
</html>
```

### 填充责任划分

| 区域 | 填充者 | 说明 |
|-----|-------|------|
| `<title>` | 主Agent | 文档标题 |
| `data-fill="doc-title"` | 主Agent | 页面标题 |
| `data-fill="nav"` | 主Agent | 目录导航 |
| `data-fill="header"` | 主Agent | 文档元信息 |
| `data-fill="section-N"` | SubAgent | 章节内容 |

---

## 组件模板规范

每个组件模板是独立的 HTML 文件，包含完整结构和内联样式。

### 示例：step-cards.html

```html
<!-- Step Cards: 有序步骤流程 -->
<div class="step-cards">
  <style scoped>
    .step-cards { display: flex; flex-direction: column; gap: 16px; }
    .step-card { display: flex; align-items: flex-start; gap: 16px; }
    .step-num {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: var(--primary-foreground);
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; flex-shrink: 0;
    }
    .step-content h4 { margin: 0 0 4px; color: var(--foreground); }
    .step-content p { margin: 0; color: var(--foreground); opacity: 0.8; }
  </style>

  <div class="step-card">
    <div class="step-num"><span class="num">1</span></div>
    <div class="step-content">
      <h4>{{step-title}}</h4>
      <p>{{step-desc}}</p>
    </div>
  </div>
  <!-- SubAgent 根据 Markdown 列表项复制 .step-card -->
</div>
```

### 占位符约定

| 占位符 | 说明 | 示例 |
|-------|------|------|
| `{{title}}` / `{{step-title}}` | 标题类文本 | "用户登录" |
| `{{desc}}` / `{{step-desc}}` | 描述文本 | "验证用户身份..." |
| `{{chart-type}}` | 图表类型 | "bar", "radar", "doughnut" |
| `{{chart-id}}` | 唯一ID | "chart-scores-1" |

---

## 执行流程

### 主Agent 职责

```
1. 预处理与校验
   ├── 执行 extract-outline.sh 获取文档元信息
   ├── 校验文件格式（.md）
   ├── 校验标题结构（H1 + ≥2 H2）
   └── 校验失败 → 提示使用 yg-requirement-extraction / yg-document-writing

2. 准备模板
   ├── 选择框架模板（light/dark）
   ├── 复制到输出目录
   ├── 填充文档元信息（title、nav、header）
   └── 根据 outline 生成 section 结构

3. 内容生成
   ├── 小文档（<3万字符）：主Agent直接填充
   └── 大文档（>=3万字符）：启动 SubAgent 并行填充

4. 验证
   ├── 检查区域填充完整性
   └── 浏览器测试
```

### SubAgent 职责

```
1. 读取分配章节（使用 offset/limit）
2. 分析内容结构，识别组件类型
3. 读取对应组件模板
4. 替换占位符 + 复制列表项
5. 填充到指定 region
```

---

## 文档校验规则

| 校验项 | 规则 | 失败处理 |
|-------|------|---------|
| **文件格式** | 扩展名 `.md` | 直接拒绝 |
| **标题结构** | 至少包含 1 个 H1 和 ≥2 个 H2 | 拦截，提示使用技能生成规范文档 |
| **章节长度** | 每个章节建议 > 200 字符 | 警告，询问用户是否继续 |

### 校验失败提示语

```
文档标题结构不清晰，无法生成有效的可视化页面。
建议使用以下技能生成规范文档：
  - /yg-requirement-extraction  从访谈记录提取需求
  - /yg-document-writing         编写规范的需求文档
```

---

## 文件变更清单

### 新建文件

| 文件 | 说明 |
|-----|------|
| `templates/framework-light.html` | 亮色框架模板 |
| `templates/framework-dark.html` | 暗色框架模板 |
| `templates/components/*.html` | 11 个组件模板文件 |

### 修改文件

| 文件 | 改动 |
|-----|------|
| `SKILL.md` | 精简流程，移除 `ui-ux-pro-max` 调用，添加校验步骤 |
| `agents/visualize-page.md` | 更新职责：读取组件模板 → 填充区域 |
| `references/yg-create-html.md` | 移除动态样式生成，简化为模板使用说明 |
| `references/chart-specs.md` | 移除组件结构，保留图表类型选择规则 |

### 删除文件

| 文件 | 原因 |
|-----|------|
| `references/component-specs.md` | 内容已转为组件模板 |

---

## 验收标准

- [ ] SKILL.md 行数控制在 300 行以内
- [ ] 框架模板包含完整的导航、内容区、交互脚本
- [ ] 11 个组件模板文件创建完成
- [ ] 文档校验功能正常工作
- [ ] SubAgent 能正确读取模板并填充区域
- [ ] 5 万字符文档处理成功，无超时