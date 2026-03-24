# 主控工作流

> 本工作流定义了主控Agent在处理大规模需求文档时的完整执行流程。

---

## 概述

主控Agent是yg-prototyping技能的核心协调者，负责：
- 文档分析与分块决策
- 预定义样式库生成
- 子Agent任务分发与协调
- HTML片段收集与合并
- 最终原型文件输出

---

## 工作流程总览

```
┌─────────────────────────────────────────────────────────────────┐
│                      主控Agent工作流                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  阶段0: 初始化                                                    │
│  ├── 读取需求文档                                                 │
│  ├── 分析文档结构                                                 │
│  ├── 计算分块策略                                                 │
│  └── 生成预定义样式库                                             │
│       │                                                          │
│       ▼                                                          │
│  阶段1: 任务分发                                                  │
│  ├── 创建任务列表（TodoWrite）                                    │
│  ├── 按分块策略创建子任务                                         │
│  └── 并行启动页面Agent（后台）                                    │
│       │                                                          │
│       ▼                                                          │
│  阶段2: 结果收集                                                  │
│  ├── 等待所有Agent完成                                            │
│  ├── 收集HTML片段                                                 │
│  └── 错误处理与重试                                               │
│       │                                                          │
│       ▼                                                          │
│  阶段3: 结果合并                                                  │
│  ├── 组装HTML骨架                                                 │
│  ├── 注入样式库                                                   │
│  ├── 合并所有HTML片段                                             │
│  ├── 添加导航脚本                                                 │
│  └── 输出最终HTML文件                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 阶段0：初始化

### 0.1 读取需求文档

**输入：**
- 文档路径（由用户指定或默认当前文档）
- 文档内容（通过Read工具获取）

**处理：**
```javascript
// 伪代码
async function readDocument(docPath) {
  const content = await Read(docPath);
  const stats = analyzeDocument(content);
  return { content, stats };
}
```

**输出：**
- 完整文档内容
- 文档统计信息（总字符数、总行数、标题数量）

### 0.2 分析文档结构

**目标：** 识别文档的页面/模块结构

**分析项：**
| 项目 | 说明 | 方法 |
|-----|------|------|
| 页面列表 | 所有页面名称和位置 | 正则匹配「页面」「界面」等关键词 |
| 模块列表 | 所有模块名称和范围 | 识别章节标题层级 |
| 依赖关系 | 页面间的跳转/引用关系 | 分析引用链接和交互说明 |
| 公共组件 | 跨页面使用的组件 | 统计组件出现频次 |

**输出：** 文档结构分析结果
```json
{
  "total_chars": 125000,
  "total_pages": 50,
  "modules": [
    { "name": "用户管理", "start": 0, "end": 25000, "pages": ["用户列表", "用户详情"] }
  ],
  "cross_references": [
    { "from": "用户列表", "to": "用户详情", "type": "navigation" }
  ],
  "shared_components": ["用户选择器", "部门树"]
}
```

### 0.3 计算分块策略

**决策逻辑：**

```
文档规模 = 总页数（或 总字符数 / 2500）

IF 文档规模 <= 20:
    策略 = 直接处理（不分块）
    Agent数量 = 1

ELSE IF 文档规模 <= 50:
    策略 = 按模块分块
    Agent数量 = min(模块数量, 5)

ELSE IF 文档规模 <= 100:
    策略 = 按页面分块
    Agent数量 = ceil(总页数 / 6)

ELSE:
    策略 = 按页面分块 + 动态调整
    Agent数量 = min(ceil(总页数 / 6), 20)
```

**分块执行：**

```javascript
function executeChunking(content, strategy) {
  if (strategy.mode === 'direct') {
    return [{ content, chunk_id: 'chunk_001' }];
  }

  // 按页面/模块边界分块
  const chunks = splitByPageBoundary(content);

  // 确保每块大小合理
  return balanceChunks(chunks, {
    targetSize: 15000,
    minSize: 5000,
    maxSize: 25000
  });
}
```

### 0.4 生成预定义样式库

**依据：** [rules/style-library.md](../rules/style-library.md)

**步骤：**
1. 确定UI框架风格（Element UI / Ant Design / 自定义）
2. 生成CSS变量
3. 生成布局类
4. 生成组件类
5. 生成工具类

**输出：** 样式库CSS内容
```css
/* prototype-styles.css */
:root {
  --color-primary: #409EFF;
  /* ... */
}
/* 布局类 */
.page-container { /* ... */ }
/* 组件类 */
.btn { /* ... */ }
```

---

## 阶段1：任务分发

### 1.1 创建任务列表

**使用TodoWrite工具创建任务：**

```json
{
  "todos": [
    { "content": "文档分析与分块", "status": "completed", "activeForm": "分析文档结构与分块" },
    { "content": "生成样式库", "status": "completed", "activeForm": "生成预定义样式库" },
    { "content": "生成页面1-6", "status": "in_progress", "activeForm": "生成页面1-6的HTML片段" },
    { "content": "生成页面7-12", "status": "pending", "activeForm": "生成页面7-12的HTML片段" },
    { "content": "生成页面13-18", "status": "pending", "activeForm": "生成页面13-18的HTML片段" },
    { "content": "合并HTML片段", "status": "pending", "activeForm": "合并所有HTML片段" }
  ]
}
```

### 1.2 创建子任务

**为每个分块创建Agent任务：**

```javascript
const subTasks = chunks.map((chunk, index) => ({
  task_id: `page-agent-${index}`,
  chunk: chunk,
  style_ref: './styles.css',
  pages: extractPages(chunk)
}));
```

### 1.3 并行启动页面Agent

**使用Agent工具启动子Agent：**

```
Agent(
  subagent_type: "prototyping-page",
  description: "生成页面1-6 HTML片段",
  prompt: `
    你是页面生成Agent，负责生成以下页面的HTML片段：

    ## 输入文档片段
    ${chunk.content}

    ## 页面列表
    ${chunk.pages.join(', ')}

    ## 样式引用
    使用预定义样式库，类名参考：${styleRef}

    ## 输出要求
    返回每个页面的HTML片段，格式：
    \`\`\`html
    <!-- PAGE: 页面名称 -->
    <section id="page-xxx" class="page-section">
      ...
    </section>
    \`\`\`
  `,
  run_in_background: true
)
```

**并行启动多个Agent：**
- 使用单次消息调用多个Agent工具
- 所有Agent设为后台运行
- 记录Agent ID用于后续收集

---

## 阶段2：结果收集

### 2.1 等待Agent完成

**使用TaskOutput等待后台任务：**

```javascript
const results = await Promise.all(
  agentIds.map(id => TaskOutput({
    task_id: id,
    block: true,
    timeout: 300000  // 5分钟超时
  }))
);
```

### 2.2 收集HTML片段

**解析Agent输出：**

```javascript
function collectFragments(results) {
  const fragments = [];

  for (const result of results) {
    if (result.status === 'completed') {
      const html = extractHTML(result.output);
      fragments.push({
        chunk_id: result.chunk_id,
        html: html,
        pages: result.pages
      });
    } else {
      // 错误处理
      handleAgentFailure(result);
    }
  }

  return fragments;
}
```

### 2.3 错误处理与重试

| 错误类型 | 处理策略 |
|---------|---------|
| Agent超时 | 标记失败，重新拆分后重试（最多2次） |
| HTML片段无效 | 丢弃片段，重新生成 |
| 部分页面失败 | 输出占位符，保留已完成内容 |

**重试逻辑：**

```javascript
async function handleAgentFailure(result) {
  if (result.retryCount < 2) {
    // 缩小分块范围后重试
    const smallerChunks = splitChunk(result.chunk, 2);
    await dispatchAgents(smallerChunks);
  } else {
    // 生成占位符
    return generatePlaceholder(result.pages);
  }
}
```

---

## 阶段3：结果合并

### 3.1 组装HTML骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{项目名称} - 原型设计</title>
  <style id="prototype-styles">
    /* 样式库内容 */
  </style>
</head>
<body>
  <div id="app">
    <!-- 导航 -->
    <nav id="main-nav">...</nav>

    <!-- 内容区域 -->
    <main id="content">
      <!-- HTML片段将在此处插入 -->
    </main>
  </div>
  <script>
    // 导航脚本
  </script>
</body>
</html>
```

### 3.2 注入样式库

```javascript
function injectStyles(html, styles) {
  return html.replace(
    '<style id="prototype-styles"></style>',
    `<style id="prototype-styles">${styles}</style>`
  );
}
```

### 3.3 合并HTML片段

```javascript
function mergeFragments(html, fragments) {
  const contentHtml = fragments
    .sort((a, b) => a.chunk_id.localeCompare(b.chunk_id))
    .map(f => f.html)
    .join('\n\n');

  return html.replace(
    '<!-- HTML片段将在此处插入 -->',
    contentHtml
  );
}
```

### 3.4 添加导航脚本

```javascript
const navigationScript = `
<script>
// 页面导航
const pages = ${JSON.stringify(pageList)};

function navigateTo(pageId) {
  // 隐藏所有页面
  document.querySelectorAll('.page-section').forEach(p => p.style.display = 'none');
  // 显示目标页面
  document.getElementById(pageId).style.display = 'block';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('${defaultPage}');
});
</script>
`;
```

### 3.5 输出最终HTML文件

**使用Write工具输出：**

```
Write(
  file_path: "${outputPath}/prototype.html",
  content: finalHtml
)
```

**输出路径规则：**
- 单文件原型：`{项目目录}/prototypes/{项目名}_原型_{日期}.html`
- 项目原型：`{项目目录}/prototypes/{项目名}/index.html`

---

## 进度更新

在每个阶段完成后更新TodoWrite：

```json
// 阶段0完成
{ "content": "文档分析与分块", "status": "completed" }
{ "content": "生成样式库", "status": "completed" }

// 阶段1完成
{ "content": "生成页面1-6", "status": "in_progress" }
{ "content": "生成页面7-12", "status": "in_progress" }

// 阶段2完成
{ "content": "生成页面1-6", "status": "completed" }
{ "content": "生成页面7-12", "status": "completed" }

// 阶段3完成
{ "content": "合并HTML片段", "status": "completed" }
```

---

## 容错输出

当部分页面生成失败时，输出带占位符的原型：

```html
<section id="page-xxx" class="page-section placeholder">
  <div class="placeholder-notice">
    <h2>⚠️ 页面生成失败</h2>
    <p>页面「XXX」生成过程中出现问题，请手动补充内容。</p>
  </div>
</section>
```

---

## 性能指标

| 阶段 | 预期耗时 | 说明 |
|-----|---------|------|
| 阶段0 | < 30s | 文档分析和样式生成 |
| 阶段1 | < 10s | 任务分发 |
| 阶段2 | 2-8min | 取决于Agent并行数 |
| 阶段3 | < 30s | 合并输出 |
| **总计** | **< 10min** | 100页文档处理时间 |

---

## 日志记录

主控Agent应记录关键操作日志：

```
[INFO] 开始处理文档：docs/PRD.md
[INFO] 文档规模：75页，预计分块数：13
[INFO] 分块策略：按页面分块
[INFO] 启动 13 个页面Agent并行处理
[INFO] Agent #1 完成：页面1-6
[INFO] Agent #2 完成：页面7-12
[WARN] Agent #5 超时，正在重试...
[INFO] Agent #5 重试成功
[INFO] 所有Agent完成，开始合并
[INFO] 原型输出：prototypes/PRD_原型_2026-03-24.html
[INFO] 处理完成，总耗时：7分32秒
```