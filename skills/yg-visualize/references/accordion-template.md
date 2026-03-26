# Accordion 组件模板

本文档提供 H3 子章节折叠卡片的完整 HTML 模板和使用指南。

---

## 1. Accordion HTML 模板

### 基础结构

```html
<div class="accordion-group">
  <!-- 第一个 H3 -->
  <div class="accordion-item" data-state="closed">
    <button class="accordion-trigger" type="button">
      <div class="accordion-trigger-icon">
        <i data-lucide="chevron-right"></i>
        <h3>H3 标题文本</h3>
      </div>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-content">
      <div class="accordion-content-inner">
        <p>H3 章节的内容...</p>
        <ul>
          <li>列表项1</li>
          <li>列表项2</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 第二个 H3 -->
  <div class="accordion-item" data-state="closed">
    <button class="accordion-trigger" type="button">
      <div class="accordion-trigger-icon">
        <i data-lucide="chevron-right"></i>
        <h3>另一个 H3 标题</h3>
      </div>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-content">
      <div class="accordion-content-inner">
        <p>内容...</p>
      </div>
    </div>
  </div>
</div>
```

---

## 2. 混合结构（图表 + H3 子章节）

**当章节开头有图表，后面有 H3 子章节时：**

```html
<!-- 章节容器 -->
<div class="space-y-6">
  <!-- 前置图表（在 accordion-group 外部） -->
  <div class="diagram-container">
    <div class="diagram-title">系统架构总览</div>
    <pre class="mermaid">
    flowchart TD
        A[开始] --> B[结束]
    </pre>
  </div>

  <!-- H3 子章节必须使用 accordion-group -->
  <div class="accordion-group">
    <!-- 第一个 H3 -->
    <div class="accordion-item" data-state="closed">
      <button class="accordion-trigger" type="button">
        <div class="accordion-trigger-icon">
          <i data-lucide="chevron-right"></i>
          <h3>H3 标题文本</h3>
        </div>
        <i data-lucide="chevron-down"></i>
      </button>
      <div class="accordion-content">
        <div class="accordion-content-inner">
          <p>H3 章节的内容...</p>
        </div>
      </div>
    </div>

    <!-- 更多 H3 子章节... -->
  </div>
</div>
```

---

## 3. H3 转 Accordion 示例

### 原始 Markdown

```markdown
### 功能模块A
这是功能模块A的详细说明...

### 功能模块B
这是功能模块B的详细说明...
```

### 转换后 HTML

```html
<div class="accordion-group">
  <div class="accordion-item" data-state="closed">
    <button class="accordion-trigger" type="button">
      <div class="accordion-trigger-icon">
        <i data-lucide="package"></i>
        <h3>功能模块A</h3>
      </div>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-content">
      <div class="accordion-content-inner">
        <p>这是功能模块A的详细说明...</p>
      </div>
    </div>
  </div>

  <div class="accordion-item" data-state="closed">
    <button class="accordion-trigger" type="button">
      <div class="accordion-trigger-icon">
        <i data-lucide="package"></i>
        <h3>功能模块B</h3>
      </div>
      <i data-lucide="chevron-down"></i>
    </button>
    <div class="accordion-content">
      <div class="accordion-content-inner">
        <p>这是功能模块B的详细说明...</p>
      </div>
    </div>
  </div>
</div>
```

---

## 4. H3 图标选择

| H3 内容类型 | 推荐图标 |
|------------|----------|
| 功能模块 | `package` |
| 技术方案 | `cpu` |
| 数据相关 | `database` |
| 接口/API | `plug` |
| 配置项 | `settings` |
| 安全相关 | `shield` |
| 用户相关 | `user` |
| 通用/默认 | `chevron-right` |

---

## 5. 禁止事项

```
┌─────────────────────────────────────────────────────────────┐
│ ❌ 绝对禁止用 Card 样式容器替代 Accordion                      │
│                                                              │
│ 错误示例：                                                    │
│ <div class="rounded-lg border bg-card text-card-foreground shadow-sm">  │
│   <h3>标题</h3>                                              │
│   <p>内容...</p>                                             │
│ </div>                                                       │
│                                                              │
│ 正确做法：                                                    │
│ <div class="accordion-group">                                │
│   <div class="accordion-item" data-state="closed">           │
│     ...                                                      │
│   </div>                                                     │
│ </div>                                                       │
└─────────────────────────────────────────────────────────────┘
```

| 禁止行为 | 正确做法 |
|----------|----------|
| 使用 `rounded-lg border bg-card` 作为 H3 容器 | 使用 `accordion-group` + `accordion-item` |
| 直接用 Card 样式包裹 H3 内容 | 用 Accordion 提供折叠功能 |
| 图表在 H3 内容外但样式与 H3 混淆 | 图表在 `accordion-group` 外，H3 在内 |