# 表格组件模板

本文档提供 shadcn 风格表格的完整 HTML 模板和使用指南。

---

## 1. 表格 HTML 模板

```html
<div class="w-full overflow-auto rounded-lg border">
  <table class="w-full text-sm">
    <!-- 表头（必须有样式） -->
    <thead class="bg-muted/50 border-b">
      <tr>
        <th class="px-4 py-3 text-left font-semibold text-foreground">列标题1</th>
        <th class="px-4 py-3 text-left font-semibold text-foreground">列标题2</th>
        <th class="px-4 py-3 text-left font-semibold text-foreground">列标题3</th>
      </tr>
    </thead>
    <!-- 表体（交替行背景） -->
    <tbody class="divide-y">
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3 text-foreground">数据1</td>
        <td class="px-4 py-3 text-muted-foreground">数据2</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
            状态标签
          </span>
        </td>
      </tr>
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3 text-foreground">数据1</td>
        <td class="px-4 py-3 text-muted-foreground">数据2</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600">
            已完成
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 2. 表格样式组件说明

| 组件 | Tailwind 类 | 用途 |
|------|------------|------|
| 外层容器 | `w-full overflow-auto rounded-lg border` | 响应式滚动、圆角边框 |
| 表头背景 | `bg-muted/50 border-b` | 区分表头与表体 |
| 表头文字 | `px-4 py-3 text-left font-semibold text-foreground` | 加粗、对齐 |
| 行悬停 | `hover:bg-muted/30 transition-colors` | 交互反馈 |
| 分隔线 | `divide-y` | 行间分隔 |
| 单元格 | `px-4 py-3` | 内边距 |

---

## 3. 状态 Badge 颜色方案

| 状态类型 | Tailwind 类 | 颜色 |
|----------|------------|------|
| 主色/默认 | `bg-primary/10 text-primary` | 蓝色 |
| 成功/完成 | `bg-green-500/10 text-green-600` | 绿色 |
| 警告/待处理 | `bg-yellow-500/10 text-yellow-600` | 黄色 |
| 错误/高风险 | `bg-red-500/10 text-red-600` | 红色 |
| 中性/次要 | `bg-muted text-muted-foreground` | 灰色 |

---

## 4. Markdown 表格转换示例

### 原始 Markdown

```markdown
| 模块 | 功能 | 状态 |
|------|------|------|
| 用户管理 | 登录注册 | 已完成 |
| 订单系统 | 订单流程 | 开发中 |
```

### 转换后 HTML

```html
<div class="w-full overflow-auto rounded-lg border">
  <table class="w-full text-sm">
    <thead class="bg-muted/50 border-b">
      <tr>
        <th class="px-4 py-3 text-left font-semibold text-foreground">模块</th>
        <th class="px-4 py-3 text-left font-semibold text-foreground">功能</th>
        <th class="px-4 py-3 text-left font-semibold text-foreground">状态</th>
      </tr>
    </thead>
    <tbody class="divide-y">
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3 text-foreground">用户管理</td>
        <td class="px-4 py-3 text-muted-foreground">登录注册</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600">
            已完成
          </span>
        </td>
      </tr>
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3 text-foreground">订单系统</td>
        <td class="px-4 py-3 text-muted-foreground">订单流程</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-600">
            开发中
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 5. 禁止事项

| 禁止行为 | 正确做法 |
|----------|----------|
| `<table>` 无外层容器 | 包裹 `<div class="w-full overflow-auto rounded-lg border">` |
| 表头无背景样式 | 添加 `bg-muted/50 border-b` |
| 行无交互反馈 | 添加 `hover:bg-muted/30` |
| 状态列使用纯文本 | 使用 Badge 组件显示状态 |

---

## 6. 核心原则

```
┌─────────────────────────────────────────────────────────────┐
│ 表格必须使用 shadcn 样式，禁止使用无样式的 <table>            │
│                                                              │
│ ✅ 必须包含：表头样式、边框、交替行背景、响应式容器             │
│ ❌ 禁止：裸 <table>、无边框表格、无表头样式的表格              │
└─────────────────────────────────────────────────────────────┘
```