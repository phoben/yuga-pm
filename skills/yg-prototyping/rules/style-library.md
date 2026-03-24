# 预定义样式库规则

> 本规则定义了原型设计技能的预定义样式库，用于确保多Agent协同生成原型的样式一致性。

---

## 概述

预定义样式库是主控Agent在分块处理前生成的公共CSS样式集合。所有子Agent在生成HTML片段时，只需引用预定义的CSS类名，无需自行定义样式，从而保证：

1. **样式一致性** - 所有页面使用统一的视觉风格
2. **生成效率** - 子Agent无需重复生成样式代码
3. **维护便捷** - 样式集中管理，易于调整

---

## 样式库结构

样式库按以下层次组织：

```
styles.css
├── CSS变量（设计令牌）
├── 基础重置
├── 布局系统
├── 页面区块
├── 组件库
└── 工具类
```

---

## 一、CSS变量（设计令牌）

### 颜色系统

```css
:root {
  /* 主色 */
  --color-primary: #409EFF;
  --color-primary-light: #66b1ff;
  --color-primary-dark: #3a8ee6;

  /* 成功/警告/危险/信息 */
  --color-success: #67C23A;
  --color-warning: #E6A23C;
  --color-danger: #F56C6C;
  --color-info: #909399;

  /* 中性色 */
  --color-text-primary: #303133;
  --color-text-regular: #606266;
  --color-text-secondary: #909399;
  --color-text-placeholder: #C0C4CC;

  /* 边框色 */
  --color-border-base: #DCDFE6;
  --color-border-light: #E4E7ED;
  --color-border-lighter: #EBEEF5;

  /* 背景色 */
  --color-bg-base: #FFFFFF;
  --color-bg-page: #F5F7FA;
  --color-bg-hover: #F5F7FA;
}
```

### 间距系统

```css
:root {
  /* 基础间距单位: 4px */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 内边距 */
  --padding-page: 24px;
  --padding-card: 16px;
  --padding-cell: 12px;

  /* 外边距 */
  --margin-section: 24px;
  --margin-element: 16px;
}
```

### 字体系统

```css
:root {
  /* 字体族 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;

  /* 字号 */
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;

  /* 行高 */
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-loose: 1.75;

  /* 字重 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
}
```

### 圆角与阴影

```css
:root {
  /* 圆角 */
  --radius-sm: 2px;
  --radius-base: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.12);
}
```

---

## 二、布局系统

### 容器布局

```css
/* 页面容器 */
.page-container {
  padding: var(--padding-page);
  background: var(--color-bg-page);
  min-height: 100vh;
}

/* 内容区域 */
.content-wrapper {
  background: var(--color-bg-base);
  border-radius: var(--radius-md);
  padding: var(--padding-card);
  box-shadow: var(--shadow-sm);
}

/* 后台布局 */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-header {
  height: 56px;
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  padding: 0 var(--padding-page);
}

.admin-sidebar {
  width: 200px;
  background: var(--color-bg-base);
  border-right: 1px solid var(--color-border-light);
}

.admin-main {
  flex: 1;
  background: var(--color-bg-page);
  padding: var(--padding-page);
}
```

### 栅格系统

```css
/* 行容器 */
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

/* 列容器 */
.col-1 { flex: 0 0 8.333%; max-width: 8.333%; }
.col-2 { flex: 0 0 16.667%; max-width: 16.667%; }
.col-3 { flex: 0 0 25%; max-width: 25%; }
.col-4 { flex: 0 0 33.333%; max-width: 33.333%; }
.col-6 { flex: 0 0 50%; max-width: 50%; }
.col-8 { flex: 0 0 66.667%; max-width: 66.667%; }
.col-12 { flex: 0 0 100%; max-width: 100%; }

/* 响应式断点 */
@media (max-width: 768px) {
  .col-md-12 { flex: 0 0 100%; max-width: 100%; }
}
```

### Flex工具

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
```

---

## 三、页面区块

### 页面标题区

```css
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--margin-section);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
```

### 搜索筛选区

```css
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--margin-element);
  padding: var(--padding-card);
  background: var(--color-bg-base);
  border-radius: var(--radius-md);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
```

### 内容展示区

```css
.content-area {
  background: var(--color-bg-base);
  border-radius: var(--radius-md);
  padding: var(--padding-card);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-md);
}
```

### 底部操作区

```css
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--spacing-md);
}
```

---

## 四、组件库

### 按钮

```css
/* 基础按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: var(--font-size-base);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

/* 主按钮 */
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: var(--color-primary-light);
}

/* 次要按钮 */
.btn-default {
  background: white;
  border-color: var(--color-border-base);
  color: var(--color-text-regular);
}
.btn-default:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 文字按钮 */
.btn-text {
  background: transparent;
  color: var(--color-primary);
  padding: 4px 8px;
}

/* 按钮尺寸 */
.btn-sm { padding: 5px 12px; font-size: var(--font-size-sm); }
.btn-lg { padding: 12px 24px; font-size: var(--font-size-md); }

/* 按钮状态 */
.btn-disabled, .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 表单

```css
/* 表单组 */
.form-group {
  margin-bottom: var(--spacing-md);
}

/* 标签 */
.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
}
.form-label.required::after {
  content: '*';
  color: var(--color-danger);
  margin-left: 4px;
}

/* 输入框 */
.form-input {
  width: 100%;
  padding: 8px 12px;
  font-size: var(--font-size-base);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-base);
  transition: border-color 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
.form-input::placeholder {
  color: var(--color-text-placeholder);
}

/* 选择器 */
.form-select {
  appearance: none;
  background: white url('data:image/svg+xml;...') no-repeat right 8px center;
  padding-right: 32px;
}

/* 表单行 */
.form-row {
  display: flex;
  gap: var(--spacing-md);
}
.form-row .form-group {
  flex: 1;
}

/* 错误状态 */
.form-input.error {
  border-color: var(--color-danger);
}
.form-error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  margin-top: 4px;
}
```

### 表格

```css
/* 表格容器 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 表格 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-base);
}

.data-table th {
  background: var(--color-bg-page);
  padding: 12px 16px;
  text-align: left;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-regular);
  border-bottom: 1px solid var(--color-border-light);
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-lighter);
  color: var(--color-text-primary);
}

.data-table tr:hover td {
  background: var(--color-bg-hover);
}

/* 操作列 */
.table-actions {
  display: flex;
  gap: var(--spacing-xs);
}
```

### 卡片

```css
.card {
  background: var(--color-bg-base);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.card-header {
  padding: var(--padding-card);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.card-body {
  padding: var(--padding-card);
}

.card-footer {
  padding: var(--padding-card);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
```

### 标签/徽章

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.tag-primary { background: rgba(64, 158, 255, 0.1); color: var(--color-primary); }
.tag-success { background: rgba(103, 194, 58, 0.1); color: var(--color-success); }
.tag-warning { background: rgba(230, 162, 60, 0.1); color: var(--color-warning); }
.tag-danger { background: rgba(245, 108, 108, 0.1); color: var(--color-danger); }
.tag-info { background: rgba(144, 147, 153, 0.1); color: var(--color-info); }
```

### 状态指示

```css
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-active { background: var(--color-success); }
.status-inactive { background: var(--color-info); }
.status-warning { background: var(--color-warning); }
.status-error { background: var(--color-danger); }
```

---

## 五、工具类

### 间距

```css
.m-0 { margin: 0; }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.p-0 { padding: 0; }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
```

### 文本

```css
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-danger { color: var(--color-danger); }
.font-bold { font-weight: var(--font-weight-bold); }
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 显示

```css
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.w-full { width: 100%; }
.h-full { height: 100%; }
```

---

## 使用方式

### 主控Agent生成

主控Agent在阶段0生成完整的样式库文件：

```html
<style id="prototype-styles">
  /* 样式库内容 */
</style>
```

或生成外部文件引用：

```html
<link rel="stylesheet" href="./styles.css">
```

### 子Agent引用

子Agent在生成HTML片段时，只需使用预定义类名：

```html
<div class="page-container">
  <div class="page-header">
    <h1 class="page-title">用户列表</h1>
    <button class="btn btn-primary">新增用户</button>
  </div>
  <div class="filter-bar">
    <div class="filter-item">
      <span class="filter-label">关键词：</span>
      <input class="form-input" placeholder="搜索用户名/手机号">
    </div>
  </div>
</div>
```

---

## UI框架映射

预定义样式库支持映射到主流UI框架：

| 预定义类 | Element UI | Ant Design |
|---------|-----------|------------|
| `.btn-primary` | `el-button--primary` | `ant-btn-primary` |
| `.form-input` | `el-input__inner` | `ant-input` |
| `.data-table` | `el-table` | `ant-table` |
| `.card` | `el-card` | `ant-card` |
| `.tag-primary` | `el-tag--primary` | `ant-tag-blue` |

---

## 主题扩展

样式库支持主题扩展，通过修改CSS变量实现：

```css
/* 深色主题 */
.theme-dark {
  --color-bg-base: #1f1f1f;
  --color-bg-page: #141414;
  --color-text-primary: #ffffff;
  --color-text-regular: #d9d9d9;
  --color-border-base: #434343;
}
```

---

## 注意事项

1. **子Agent不应自定义样式** - 除非有特殊需求且预定义样式无法满足
2. **保持类名语义化** - 类名应反映用途而非样式
3. **避免内联样式** - 统一使用类名控制样式
4. **响应式设计** - 使用媒体查询适配不同屏幕