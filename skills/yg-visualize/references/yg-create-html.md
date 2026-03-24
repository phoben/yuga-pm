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