# 图表转换参考指南

---

## 渲染方案对比

### HTML 组件 vs Canvas 渲染

| 维度 | HTML 组件 | Canvas 渲染 (yg-diagram) |
|------|-----------|-------------------------|
| **渲染方式** | 原生 HTML + CSS | Konva.js Canvas |
| **复杂度支持** | 简单图表（节点 ≤ 8） | 复杂图表（节点 > 8） |
| **交互能力** | 有限（CSS hover） | 丰富（缩放、平移、弹出详情） |
| **自动布局** | 手动排列 | dagre 自动布局 |
| **导出能力** | 无 | 支持图片导出 |
| **SEO 友好** | ✅ 是 | ❌ 否 |
| **打印兼容** | ✅ 完美 | ⚠️ 可能截断 |
| **JS 依赖** | 无 | Konva + dagre |

### 快速决策

```
需要交互或复杂布局？
    │
    ├─ 是 → Canvas (yg-diagram)
    │
    └─ 否 → 检查节点数
              │
              ├─ > 8 → Canvas (自动布局)
              │
              └─ ≤ 8 → HTML 组件
```

---

本文档定义如何将 ASCII 字符图表转换为 HTML 可视化组件。

---

## 识别 ASCII 图表

### 常见 ASCII 图表字符

| 字符类型 | 字符 | 用途 |
|---------|-----|------|
| 框线字符 | `┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼` | 绘制矩形框和连接点 |
| 线条字符 | `│ ─ ═` | 垂直和水平连接线 |
| 箭头字符 | `► ▼ ▲ → ← ↑ ↓` | 表示流向和方向 |
| 分支字符 | `├─ └─` | 树形结构的分支 |
| 特殊符号 | `○ ● ◆ ◇` | 状态标记和特殊节点 |

### 图表类型识别

```
检测到 ┌───┐ 形式的矩形框 + ▼ 箭头 → 流程图
检测到多层缩进 + 分层标签 → 架构图
检测到 ──→ 时间线 → 时序图
检测到 [*] 状态标记 → 状态图
```

---

## 流程图转换

### 节点类型映射

| ASCII 图形 | HTML 类型 | 视觉效果 |
|-----------|----------|----------|
| 圆角框/开始框 | `data-type="start"` | 绿色圆角 |
| 结束框 | `data-type="end"` | 红色圆角 |
| 矩形处理框 | `data-type="process"` | 蓝边框矩形 |
| 菱形判断框 | `data-type="decision"` | 橙色菱形 |

### HTML 模板

```html
<div class="flowchart-container">
  <div class="flow-title">流程标题</div>
  <div class="flowchart">
    <!-- 开始节点 -->
    <div class="flow-row">
      <div class="flow-node" data-type="start">开始</div>
    </div>
    <div class="flow-arrow"><i data-lucide="arrow-down"></i></div>

    <!-- 处理节点 -->
    <div class="flow-row">
      <div class="flow-node" data-type="process">处理步骤</div>
    </div>
    <div class="flow-arrow"><i data-lucide="arrow-down"></i></div>

    <!-- 判断节点 -->
    <div class="flow-row">
      <div class="flow-node" data-type="decision">条件?</div>
    </div>

    <!-- 分支 -->
    <div class="flow-parallel">
      <div class="flow-branch">
        <span class="flow-branch-label">是</span>
        <div class="flow-node" data-type="process">分支A</div>
      </div>
      <div class="flow-branch">
        <span class="flow-branch-label">否</span>
        <div class="flow-node" data-type="process">分支B</div>
      </div>
    </div>

    <div class="flow-arrow"><i data-lucide="arrow-down"></i></div>

    <!-- 结束节点 -->
    <div class="flow-row">
      <div class="flow-node" data-type="end">结束</div>
    </div>
  </div>
</div>
```

### 转换示例

**原始 ASCII:**
```
┌─────────┐
│   开始   │
└────┬────┘
     │
     ▼
┌─────────┐
│  处理A  │
└────┬────┘
     │
     ▼
  ┌──┴──┐
  │ 判断 │
  └──┬──┘
   是│  否
     │
     ▼
┌─────────┐
│   结束   │
└─────────┘
```

**转换后:**
```html
<div class="flowchart-container">
  <div class="flow-title">流程图</div>
  <div class="flowchart">
    <div class="flow-row">
      <div class="flow-node" data-type="start">开始</div>
    </div>
    <div class="flow-arrow"><i data-lucide="arrow-down"></i></div>
    <div class="flow-row">
      <div class="flow-node" data-type="process">处理A</div>
    </div>
    <div class="flow-arrow"><i data-lucide="arrow-down"></i></div>
    <div class="flow-row">
      <div class="flow-node" data-type="decision">判断</div>
    </div>
    <div class="flow-parallel">
      <div class="flow-branch">
        <span class="flow-branch-label">是</span>
        <div class="flow-node" data-type="process">继续</div>
      </div>
      <div class="flow-branch">
        <span class="flow-branch-label">否</span>
        <div class="flow-node" data-type="process">返回</div>
      </div>
    </div>
    <div class="flow-arrow"><i data-lucide="arrow-down"></i></div>
    <div class="flow-row">
      <div class="flow-node" data-type="end">结束</div>
    </div>
  </div>
</div>
```

---

## 架构图转换

### 节点类型映射

| 节点类型 | data-type | 颜色 | 常用图标 |
|---------|----------|------|----------|
| 核心服务 | `primary` | 蓝色 | `server`, `cpu` |
| 辅助服务 | `secondary` | 紫色 | `shield`, `lock` |
| 数据存储 | `database` | 绿色 | `database` |
| 缓存层 | `cache` | 橙色 | `hard-drive`, `zap` |
| 外部服务 | `external` | 灰色 | `cloud`, `globe` |

### HTML 模板

```html
<div class="architecture-diagram">
  <div class="arch-title">系统架构</div>
  <div class="arch-layers">
    <!-- 前端层 -->
    <div class="arch-layer">
      <div class="layer-label">前端层</div>
      <div class="layer-nodes">
        <div class="arch-node" data-type="primary">
          <i data-lucide="monitor"></i>
          <span>Web 应用</span>
        </div>
        <div class="arch-node" data-type="primary">
          <i data-lucide="smartphone"></i>
          <span>移动端</span>
        </div>
      </div>
    </div>

    <!-- 连接器 -->
    <div class="arch-connector">
      <div class="arch-connector-line">
        <i data-lucide="arrow-up-down"></i>
        <span>API 调用</span>
      </div>
    </div>

    <!-- 服务层 -->
    <div class="arch-layer">
      <div class="layer-label">服务层</div>
      <div class="layer-nodes">
        <div class="arch-node" data-type="primary">
          <i data-lucide="server"></i>
          <span>API 网关</span>
        </div>
      </div>
    </div>

    <!-- 连接器 -->
    <div class="arch-connector">
      <div class="arch-connector-line">
        <i data-lucide="arrow-up-down"></i>
        <span>数据读写</span>
      </div>
    </div>

    <!-- 数据层 -->
    <div class="arch-layer">
      <div class="layer-label">数据层</div>
      <div class="layer-nodes">
        <div class="arch-node" data-type="database">
          <i data-lucide="database"></i>
          <span>数据库</span>
        </div>
        <div class="arch-node" data-type="cache">
          <i data-lucide="hard-drive"></i>
          <span>缓存</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Lucide 图标速查表

### 通用图标

| 场景 | 图标名 |
|------|--------|
| 开始/播放 | `play-circle` |
| 结束/停止 | `stop-circle` |
| 处理/操作 | `cog` |
| 判断/问题 | `help-circle` |
| 用户 | `user` |
| 设置 | `settings` |
| 警告 | `alert-triangle` |
| 成功 | `check-circle` |
| 错误 | `x-circle` |
| 信息 | `info` |

### 技术图标

| 场景 | 图标名 |
|------|--------|
| 服务器 | `server` |
| 数据库 | `database` |
| 缓存 | `hard-drive` |
| API | `plug` |
| 前端/Web | `monitor` |
| 移动端 | `smartphone` |
| 云服务 | `cloud` |
| 安全 | `shield` |
| 网络 | `globe` |
| 消息 | `mail` |

### 箭头图标

| 场景 | 图标名 |
|------|--------|
| 向下 | `arrow-down` |
| 向上 | `arrow-up` |
| 双向 | `arrow-up-down` |
| 向右 | `arrow-right` |
| 流程 | `arrow-right-circle` |

---

## 禁止事项

### 严格禁止

```html
<!-- ❌ 禁止：保留原始 ASCII 图表 -->
<pre>
┌─────────┐
│  错误   │
└─────────┘
</pre>

<!-- ❌ 禁止：使用 <code> 包裹 ASCII -->
<code>┌───┐</code>

<!-- ❌ 禁止：将 ASCII 作为普通文本 -->
<p>流程如下：┌───┐</p>
```

### 必须转换

```html
<!-- ✅ 正确：转换为 HTML 组件 -->
<div class="flowchart-container">
  <div class="flowchart">
    <div class="flow-row">
      <div class="flow-node" data-type="process">正确</div>
    </div>
  </div>
</div>
```

---

## 质量检查清单

转换完成后，检查：

- [ ] 所有 ASCII 图表已识别并转换
- [ ] 无 `<pre>` 或 `<code>` 包裹的 ASCII 字符
- [ ] 流程图节点类型正确（start/end/process/decision）
- [ ] 架构图层级清晰，使用正确的 data-type
- [ ] 分支流程使用 `flow-parallel` 布局
- [ ] Lucide 图标已正确设置 `data-lucide` 属性
- [ ] 图表标题清晰描述图表内容
---

## Accordion 折叠卡片组件

### 使用场景

- **H3 级别内容**：Markdown 中的 `### 标题` 应转换为 Accordion
- **FAQ 问答**：问答形式的内容
- **可折叠详情**：用户按需查看的详细信息

### HTML 模板

```html
<div class="accordion-group">
  <div class="accordion-item" data-state="closed">
    <button class="accordion-trigger" type="button">
      <div class="accordion-trigger-icon">
        <i data-lucide="chevron-right"></i>
        <h3>折叠卡片标题</h3>
      </div>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-content">
      <div class="accordion-content-inner">
        <p>折叠卡片的内容...</p>
      </div>
    </div>
  </div>
</div>
```

### 状态说明

| data-state | 效果 |
|------------|------|
| `closed` | 折叠状态，内容隐藏 |
| `open` | 展开状态，内容可见 |

### 图标选择

| 内容类型 | 推荐图标 |
|---------|----------|
| 功能模块 | `package` |
| 技术方案 | `cpu` |
| 数据相关 | `database` |
| 接口/API | `plug` |
| 配置项 | `settings` |
| 安全相关 | `shield` |
| 用户相关 | `user` |
| 通用/默认 | `chevron-right` |

---

## 颜色使用规范

### 推荐的文字颜色

| 场景 | Tailwind 类 | CSS 变量 |
|------|-------------|----------|
| 主要文字 | `text-foreground` | `--foreground` |
| 次要文字 | `text-muted-foreground` | `--muted-foreground` |
| 强调文字 | `text-primary` | `--primary` |
| 卡片内文字 | `text-card-foreground` | `--card-foreground` |

### 禁止的颜色用法

| 禁止 | 原因 |
|------|------|
| `text-secondary` | 对比度不足，难以阅读 |
| 直接使用 `text-gray-*` | 不符合主题系统 |
| 硬编码颜色如 `text-blue-500` | 主题切换时会失效 |
