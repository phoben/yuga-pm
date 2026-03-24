---
name: yg-create-html
description: "将 Markdown 文档转换为精美的 HTML 可视化报告。当用户要求将 Markdown 转换为 HTML、生成可视化报告、创建专业文档展示、需要图表/流程图渲染时触发。设计系统由 ui-ux-pro-max 驱动，支持动态配色和字体方案。"
---

# Markdown 转 HTML 可视化报告

## 定位

本技能是一个**通用的** Markdown → HTML 可视化转换器，负责**结构与功能**：

- 动态图表（Chart.js）
- 流程图/时序图/ER图（Mermaid）
- 代码高亮（highlight.js）
- 响应式布局与主题切换
- 可折叠内容区块

**审美决策**由 `ui-ux-pro-max` 技能驱动，包括：配色方案、字体选择、视觉风格。

## 职责边界

| 本技能负责 | ui-ux-pro-max 负责 |
|-----------|-------------------|
| Markdown 解析 | 配色方案选择 |
| 组件结构映射 | 字体配对推荐 |
| 数据可视化 | 视觉风格决策 |
| 交互功能实现 | UX 规则检查 |
| HTML 结构生成 | 可访问性验证 |

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

### Step 3: 获取设计系统 ⚡

**关键步骤**：调用 `ui-ux-pro-max` 获取设计系统。

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<document_type> <style_keywords>" --design-system -p "DocName"
```

**获取的设计系统包含**：
- `palette`：配色方案（主色、辅助色、语义色）
- `typography`：字体配对（标题字体、正文字体）
- `style`：视觉风格（圆角、阴影、间距）
- `effects`：效果参数（模糊、渐变、过渡）

### Step 4: 选择图表类型

**核心原则**：根据数据特征和图表复杂度，选择最合适的渲染方式。

#### 4.1 图表渲染方式选择

| 场景特征 | 渲染方式 | 原因 |
|---------|---------|------|
| 小型图表（节点 ≤ 10） | Mermaid | 轻量、关系表达清晰 |
| 节点简单、关系复杂（多连线/交叉） | Mermaid | Mermaid 擅长表达复杂关系 |
| 大型蓝图、架构图（节点 > 10） | HTML 绘制 | 更直观、精美、可控 |
| 复杂流程图（多分支/嵌套） | HTML 绘制 | 布局灵活、交互性强 |
| 统计数据、排行、比例对比 | Chart.js | 强制使用数据图表 |

#### 4.2 Mermaid 适用场景

**优先使用 Mermaid**：

| 场景 | Mermaid 类型 | 示例 |
|-----|-------------|------|
| 简单流程 | `flowchart TD/LR` | 3-5 步骤流程 |
| 时序交互 | `sequenceDiagram` | API 调用链、用户操作序列 |
| 状态转换 | `stateDiagram-v2` | 订单状态、审批流程 |
| 实体关系 | `erDiagram` | 简单 ER 图（≤ 8 表） |
| 类图 | `classDiagram` | 简单类结构 |
| 甘特图 | `gantt` | 项目时间线 |

**Mermaid 使用限制**：
- 节点数建议 ≤ 10 个
- 超过限制时，拆分为多个子图或改用 HTML 绘制
- 复杂架构图禁用 Mermaid，改用 HTML + CSS 绘制

#### 4.3 HTML 绘制场景

**必须使用 HTML 绘制**：

| 场景 | 原因 | 实现方式 |
|-----|------|---------|
| 系统架构图 | 节点多、布局复杂 | CSS Grid + Flexbox |
| 微服务架构 | 需要分组、分层 | 自定义组件 + 连线 |
| 数据流程图 | 需要丰富的视觉效果 | SVG + CSS 动画 |
| 组织架构图 | 需要精美的卡片样式 | HTML 卡片 + 连接线 |
| 复杂业务流程 | 多泳道、多分支 | 自定义流程图组件 |

**HTML 图表优势**：
- 完全自定义样式（由 `ui-ux-pro-max` 提供设计）
- 支持丰富的交互（悬停、点击、展开）
- 响应式布局
- 更精美的视觉效果

#### 4.4 Chart.js 数据图表（强制使用）

**以下场景必须使用 Chart.js 数据图表**：

| 数据特征 | 图表类型 | 使用场景 |
|---------|---------|---------|
| 单维度评分/指标 | 柱状图（Bar） | 功能评分、性能指标对比 |
| 多维度评分 | 雷达图（Radar） | 能力评估、多维对比 |
| 分类占比 | 环形图（Doughnut）/ 饼图 | 状态分布、类型占比 |
| 时间趋势 | 折线图（Line）/ 面积图 | 数据变化趋势 |
| 多组对比 | 分组柱状图 | 多版本/多方案对比 |
| 排行榜 | 水平条形图 | Top N 排名 |
| 完成进度 | 仪表盘/进度条 | 完成率、达标率 |
| 数据分布 | 散点图/气泡图 | 相关性分析 |

**图表强制规则**：

```
检测到以下数据时，必须生成对应图表：

1. 评分表格 → 柱状图/雷达图
   - 包含数值评分（1-10、百分比、分值）
   - 多个评分项对比

2. 统计数据 → 环形图/饼图
   - 分类 + 数量/百分比
   - 占比分析

3. 排行数据 → 水平条形图
   - Top N 列表
   - 排名对比

4. 时间序列 → 折线图
   - 日期 + 数值
   - 趋势分析

5. 完成状态 → 进度图
   - 完成/总数
   - 百分比进度
```

**图表数量控制**：
- 单个文档图表数：2-4 个
- 相关数据可合并为多系列图表
- 避免重复信息的图表

#### 4.5 图表选择决策树

```
需要可视化？
├─ 是关系/流程图？
│   ├─ 节点 ≤ 10 且关系复杂？
│   │   └─ 是 → Mermaid
│   ├─ 节点 > 10 或大型架构？
│   │   └─ 是 → HTML 绘制
│   └─ 简单流程？
│       └─ 是 → Mermaid
│
├─ 是统计数据？
│   ├─ 评分/指标？
│   │   ├─ 单维度 → 柱状图
│   │   └─ 多维度 → 雷达图
│   ├─ 占比/分布？
│   │   └─ 环形图/饼图
│   ├─ 趋势/时序？
│   │   └─ 折线图/面积图
│   ├─ 排名？
│   │   └─ 水平条形图
│   └─ 进度？
│       └─ 仪表盘/进度条
│
└─ 其他 → 评估最佳方式
```

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

// 2. 侧边栏导航（从大纲自动生成）
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

### Step 6: 生成 CSS 变量

根据从 `ui-ux-pro-max` 获取的设计系统，生成 CSS 变量：

```css
/* 从设计系统动态生成 */
:root {
  /* 从 palette.primary 提取 */
  --primary: <design_system.palette.primary>;
  --primary-foreground: <design_system.palette.primaryForeground>;

  /* 从 palette.semantic 提取 */
  --success: <design_system.palette.success>;
  --warning: <design_system.palette.warning>;
  --error: <design_system.palette.error>;

  /* 从 typography 提取 */
  --font-heading: <design_system.typography.heading>;
  --font-body: <design_system.typography.body>;

  /* 从 style 提取 */
  --radius: <design_system.style.radius>;
  --shadow: <design_system.style.shadow>;
}
```

### Step 7: 渲染 HTML

#### 7.1 读取模板

模板文件：`\report.html`

#### 7.2 替换占位符

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
| `__CSS_VARIABLES__` | 从设计系统生成的 CSS 变量 |

### Step 8: 保存输出

使用 Write 工具保存 HTML 文件，路径默认与 MD 文件同目录。

---

## 内容范式识别与组件映射

根据 Markdown 内容的结构特征，自动识别并应用对应的组件结构。

### 组件结构规范

**以下规范仅定义结构，不涉及具体样式**。样式由 `ui-ux-pro-max` 提供。

### 1. 线性流程类（Linear Process）

**识别特征**：有序编号的步骤，步骤之间有先后依赖关系

**推荐结构**：Step Cards

```html
<div class="step-cards">
  <div class="step-card">
    <div class="step-num">
      <span class="num">1</span>
    </div>
    <div class="step-content">
      <h4>步骤标题</h4>
      <p>步骤描述内容...</p>
    </div>
  </div>
</div>
```

---

### 2. 时间线类（Timeline）

**识别特征**：带日期/时间节点的事件序列

**推荐结构**：Vertical Timeline

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-header">
        <span class="timeline-date">2024-01-15</span>
      </div>
      <h4>事件标题</h4>
      <p>事件描述...</p>
    </div>
  </div>
</div>
```

---

### 3. 顺序带主题内容（Sequential with Topics）

**识别特征**：有编号且每个编号下有独立标题和详细内容

**推荐结构**：Topic Cards

```html
<div class="topic-cards">
  <div class="topic-card">
    <div class="topic-header">
      <span class="topic-num">01</span>
      <h3>主题标题</h3>
      <span class="badge">标签</span>
    </div>
    <div class="topic-body">
      <p>详细内容...</p>
    </div>
  </div>
</div>
```

---

### 4. 无序带主题内容（Unordered with Topics）

**识别特征**：无序列表项，但每项有标题+描述结构

**推荐结构**：Feature Grid

```html
<div class="feature-grid">
  <div class="feature-item">
    <div class="feature-icon">
      <!-- 图标由 ui-ux-pro-max 推荐或使用 Lucide -->
    </div>
    <div class="feature-content">
      <h4>特性名称</h4>
      <p>特性描述...</p>
    </div>
  </div>
</div>
```

---

### 5. 矩阵型内容（Matrix）

**识别特征**：结构化表格数据，属性-值对应关系

**推荐结构**：Table / KV Grid

```html
<div class="table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th>属性</th>
        <th>值</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>名称</td>
        <td>值内容</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 6. 核心短句内容（Key Points）

**识别特征**：简短的要点列表，强调快速阅读

**推荐结构**：Stat Chips / Point Cards

```html
<div class="stat-chips">
  <div class="stat-chip">
    <div class="stat-label">标签</div>
    <div class="stat-value">核心内容</div>
  </div>
</div>
```

---

### 7. 问题/风险列表（Issues/Risks）

**识别特征**：包含问题、风险、待办等条目，有优先级标识

**推荐结构**：Accordion

```html
<div class="accordion">
  <div class="accordion-item">
    <div class="accordion-header">
      <span class="badge">P0</span>
      <span class="font-medium">问题标题</span>
    </div>
    <div class="accordion-content">
      <p>问题描述...</p>
    </div>
  </div>
</div>
```

**优先级标识**：

| 优先级 | 语义类 | 图标建议 |
|-------|--------|---------|
| P0/严重 | `priority-critical` | `alert-octagon` |
| P1/重要 | `priority-high` | `alert-triangle` |
| P2/建议 | `priority-medium` | `info` |
| 完成 | `status-complete` | `check-circle-2` |

---

### 8. 代码块（Code Blocks）

**推荐结构**：Code Block with Copy

```html
<div class="code-block-wrapper">
  <div class="code-header">
    <span class="code-lang">sql</span>
    <button class="copy-btn">复制</button>
  </div>
  <pre class="code-content"><code class="language-sql">-- SQL code</code></pre>
</div>
```

---

### 9. Mermaid 图表

**适用场景**：小型图表、节点简单但关系复杂

**推荐结构**：Card with zoom modal

```html
<div class="mermaid-card">
  <div class="mermaid-header">
    <h4>流程图</h4>
    <button class="zoom-btn">放大</button>
  </div>
  <div class="mermaid-content">
    <pre class="mermaid">graph TD...</pre>
  </div>
</div>
```

**Mermaid 使用限制**：
- 节点数建议 ≤ 10
- 超过限制时拆分或改用 HTML 绘制

---

### 10. HTML 绘制图表

**适用场景**：大型架构图、复杂流程图、系统蓝图

**推荐结构**：自定义 HTML 组件

#### 10.1 架构图组件

```html
<div class="architecture-diagram">
  <div class="arch-header">
    <h4>系统架构</h4>
    <div class="arch-legend">
      <span class="legend-item"><span class="dot primary"></span>核心服务</span>
      <span class="legend-item"><span class="dot secondary"></span>支撑服务</span>
    </div>
  </div>
  <div class="arch-canvas">
    <!-- 分层布局 -->
    <div class="arch-layer" data-layer="frontend">
      <div class="layer-label">前端层</div>
      <div class="layer-nodes">
        <div class="arch-node" data-type="primary">Web 应用</div>
        <div class="arch-node" data-type="primary">移动端</div>
      </div>
    </div>
    <div class="arch-layer" data-layer="backend">
      <div class="layer-label">服务层</div>
      <div class="layer-nodes">
        <div class="arch-node" data-type="primary">API Gateway</div>
        <div class="arch-node" data-type="secondary">Auth Service</div>
      </div>
    </div>
    <div class="arch-layer" data-layer="data">
      <div class="layer-label">数据层</div>
      <div class="layer-nodes">
        <div class="arch-node" data-type="database">MySQL</div>
        <div class="arch-node" data-type="cache">Redis</div>
      </div>
    </div>
  </div>
  <!-- 连接线（SVG） -->
  <svg class="arch-connections">
    <line x1="100" y1="50" x2="100" y2="100" class="connection-line" />
  </svg>
</div>
```

#### 10.2 流程图组件

```html
<div class="flowchart-diagram">
  <div class="flowchart-header">
    <h4>业务流程</h4>
  </div>
  <div class="flowchart-canvas">
    <div class="flow-node start">开始</div>
    <div class="flow-arrow"></div>
    <div class="flow-node process">处理请求</div>
    <div class="flow-arrow"></div>
    <div class="flow-node decision">
      <span class="decision-text">验证通过？</span>
      <div class="decision-branches">
        <div class="branch yes">是</div>
        <div class="branch no">否</div>
      </div>
    </div>
    <div class="flow-arrow branch-yes"></div>
    <div class="flow-node end success">完成</div>
  </div>
</div>
```

**HTML 图表样式要点**：
- 使用 CSS Grid/Flexbox 布局
- 连接线使用 SVG 或 CSS 伪元素
- 支持交互（悬停高亮、点击展开）
- 响应式适配

---

### 11. Chart.js 数据图表（强制使用）

**适用场景**：统计数据、评分对比、占比分析、趋势展示

**强制规则**：检测到可量化数据时必须生成对应图表

#### 11.1 柱状图组件

```html
<div class="chart-card" data-chart-type="bar">
  <div class="chart-header">
    <h4>功能评分对比</h4>
    <div class="chart-actions">
      <button class="chart-toggle">切换视图</button>
    </div>
  </div>
  <div class="chart-body">
    <canvas id="chart-scores"></canvas>
  </div>
  <div class="chart-footer">
    <div class="chart-legend"></div>
  </div>
</div>
```

**Chart.js 配置示例**：
```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['功能A', '功能B', '功能C'],
    datasets: [{
      label: '评分',
      data: [85, 72, 90],
      backgroundColor: ['<from design system>']
    }]
  }
});
```

#### 11.2 雷达图组件

**适用场景**：多维度评估、能力矩阵

```html
<div class="chart-card" data-chart-type="radar">
  <div class="chart-header">
    <h4>能力评估雷达图</h4>
  </div>
  <div class="chart-body">
    <canvas id="chart-radar"></canvas>
  </div>
</div>
```

#### 11.3 环形图/饼图组件

**适用场景**：占比分析、状态分布

```html
<div class="chart-card" data-chart-type="doughnut">
  <div class="chart-header">
    <h4>状态分布</h4>
  </div>
  <div class="chart-body">
    <canvas id="chart-distribution"></canvas>
  </div>
  <div class="chart-footer">
    <div class="chart-summary">
      <span class="total">总计: 100</span>
    </div>
  </div>
</div>
```

#### 11.4 折线图组件

**适用场景**：趋势分析、时间序列

```html
<div class="chart-card" data-chart-type="line">
  <div class="chart-header">
    <h4>数据趋势</h4>
    <div class="chart-filters">
      <select class="time-range">
        <option>近7天</option>
        <option>近30天</option>
      </select>
    </div>
  </div>
  <div class="chart-body">
    <canvas id="chart-trend"></canvas>
  </div>
</div>
```

#### 11.5 图表网格布局

多个图表时使用网格布局：

```html
<div class="charts-grid">
  <div class="chart-card chart-wide">
    <!-- 主要图表（占2列） -->
  </div>
  <div class="chart-card">
    <!-- 次要图表 -->
  </div>
  <div class="chart-card">
    <!-- 次要图表 -->
  </div>
</div>
```

---

## 内容范式识别流程

```
1. 是否为有序编号 + 有标题结构？
   → 是：Topic Cards
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
   → 是：Accordion
   → 否：继续判断

7. 是否为简短短语列表？
   → 是：Stat Chips / Point Cards
   → 否：继续判断

8. 是否包含可量化数据？
   → 是：检查数据特征
      ├─ 评分/指标 → 柱状图/雷达图
      ├─ 占比/分布 → 环形图/饼图
      ├─ 趋势/时序 → 折线图
      └─ 排名 → 水平条形图
   → 否：使用默认样式

9. 是否包含流程/架构图？
   → 是：检查复杂度
      ├─ 节点 ≤ 10 且关系复杂 → Mermaid
      └─ 节点 > 10 或大型架构 → HTML 绘制
   → 否：使用默认样式
```

---

## 图标系统

### 图标选择原则

1. 优先使用 Lucide Icons SVG（与 shadcn/ui 兼容）
2. 图标尺寸：16px（默认）、20px（强调）、24px（大图标）
3. 颜色继承父元素或使用语义颜色
4. **禁止使用 emoji 作为图标**

### 常用图标映射

| 内容类型 | 推荐 Lucide 图标 |
|---------|-----------------|
| 总览/摘要 | `layout-dashboard`, `file-text`, `clipboard-list` |
| 分析/评估 | `bar-chart-2`, `trending-up`, `search` |
| 问题/风险 | `alert-triangle`, `alert-circle`, `alert-octagon` |
| 解决方案 | `lightbulb`, `check-circle`, `wrench` |
| 数据/表格 | `table`, `database`, `hash` |
| 流程/步骤 | `git-branch`, `play`, `arrow-right` |
| 代码/技术 | `code`, `terminal`, `cpu` |
| 测试/验证 | `flask-conical`, `check`, `target` |
| 时间/日期 | `calendar`, `clock`, `history` |
| 文档/说明 | `file`, `book-open`, `file-check` |
| 成功/完成 | `check-circle-2`, `badge-check` |
| 警告/注意 | `alert-triangle`, `info` |
| 错误/失败 | `x-circle`, `octagon-x` |
| 用户/角色 | `user`, `users`, `user-circle` |
| 设置/配置 | `settings`, `sliders-horizontal` |

---

## 交互功能

### 可折叠区块

```html
<div class="collapsible">
  <button class="collapsible-trigger">
    <span>标题</span>
    <svg class="chevron-down"><!-- ... --></svg>
  </button>
  <div class="collapsible-content" hidden>
    <!-- 内容 -->
  </div>
</div>
```

### 侧边栏导航

- 滚动监听：IntersectionObserver
- 平滑滚动：`scroll-behavior: smooth`
- 当前项高亮：`data-active="true"`

### 图表交互

- Tooltip：Chart.js 默认 tooltip
- 图例：可点击切换
- Mermaid 放大：Modal 组件

### 主题切换

**必须支持**明暗主题切换：

```javascript
// 主题切换逻辑
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  html.classList.remove('dark', 'light');
  html.classList.add(isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');

  // 更新图表主题
  updateChartTheme(!isDark);
  updateMermaidTheme(!isDark);
}
```

---

## 模板占位符详解

### 必需占位符

| 占位符 | 类型 | 说明 |
|--------|------|------|
| `__REPORT_TITLE__` | string | 报告标题 |
| `__SIDEBAR_NAV__` | HTML | 侧边栏导航 |
| `__MD_CONTENT__` | HTML | Markdown 渲染后的主内容 |
| `__CSS_VARIABLES__` | CSS | 从设计系统生成的 CSS 变量 |

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

| 库 | 用途 |
|----|------|
| Lucide Icons | 图标系统 |
| Mermaid.js | 流程图渲染 |
| Chart.js | 数据图表 |
| highlight.js | 代码高亮 |

---

## 与 ui-ux-pro-max 协作示例

### 示例：需求文档可视化

```
1. 解析 Markdown 文档
   → 提取：标题、表格、流程图

2. 调用 ui-ux-pro-max
   ```bash
   python3 skills/ui-ux-pro-max/scripts/search.py "document report professional" --design-system -p "PRD-Doc"
   ```
   → 获取：配色方案、字体配对、视觉风格

3. 生成 CSS 变量
   ```css
   :root {
     --primary: <from design system>;
     --font-heading: <from design system>;
     /* ... */
   }
   ```

4. 渲染 HTML
   → 应用组件结构
   → 注入样式变量
   → 添加交互功能
```

### 示例：审查报告可视化

```
1. 解析 Markdown 文档
   → 提取：评分表格、问题列表、风险项

2. 调用 ui-ux-pro-max
   ```bash
   python3 skills/ui-ux-pro-max/scripts/search.py "dashboard analytics review" --design-system -p "Review-Report"
   ```
   → 获取：数据可视化配色、图表样式

3. 生成图表
   → 评分柱状图（使用设计系统配色）
   → 风险分布环形图

4. 渲染 HTML
   → Accordion 问题列表
   → 图表区域
   → 主题切换
```