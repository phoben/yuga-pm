---
name: yg-visualize
description: 生成可视化HTML文档
---

# 可视化文档

## 使用方式

```
/yg-visualize [文档路径] [选项]
```

**参数说明**：
- `文档路径`：可选，指定要可视化的 Markdown 文件路径
- 若不指定，则可视化当前项目的所有文档

**选项**：
- `--theme <主题名>`：指定样式主题
- `--output <目录>`：指定输出目录
- `--toc`：生成目录导航（默认启用）
- `--no-toc`：不生成目录导航

**示例**：
```
/yg-visualize
/yg-visualize documents/PRD-WMS优化.md
/yg-visualize documents/PRD-WMS优化.md --theme tech
```

## 功能说明

将 Markdown 需求文档转换为可视化的 HTML 文档，便于分享和演示。支持多种样式主题，自动生成目录导航。

## 支持的主题

| 主题名称 | 风格描述 | 适用场景 |
|---------|---------|---------|
| `business` | 商务蓝调 | 正式商务文档、汇报材料 |
| `tech` | 科技简约 | 技术文档、开发文档 |
| `minimal` | 极简清新 | 内部文档、快速阅读 |
| `dark` | 深色模式 | 夜间阅读、演示展示 |
| `classic` | 经典学术 | 论文、研究报告 |

默认主题：`business`

## 执行流程

1. **确定目标文档**
   - 如果指定了文档路径，直接使用
   - 如果未指定，从当前项目的 `documents/` 目录获取文档列表
   - 如果有多个文档，让用户选择

2. **读取文档内容**
   - 读取 Markdown 文件内容
   - 解析文档结构

3. **解析文档元素**
   - 标题层级（H1-H6）
   - 段落和文本
   - 列表（有序、无序）
   - 表格
   - 代码块
   - 引用块
   - 图片和链接

4. **应用样式模板**
   - 根据指定的主题加载样式
   - 生成 HTML 结构
   - 嵌入 CSS 样式

5. **生成目录导航**
   - 提取所有标题
   - 生成侧边栏目录
   - 添加锚点链接

6. **输出 HTML 文件**
   - 生成文件名：`{原文件名}.html`
   - 保存到 `visualizations/` 目录

## 输出格式

**单文档转换**：
```
🎨 生成可视化文档

源文件:   documents/PRD-WMS优化需求.md
目标格式: HTML
主题:     business

处理中...
✓ 解析 Markdown 结构
✓ 应用样式模板
✓ 生成目录导航
✓ 输出 HTML 文件

输出路径: .yg-pm/visualizations/PRD-WMS优化需求.html

在浏览器中打开预览
```

**批量转换**：
```
🎨 批量生成可视化文档

项目: WMS优化需求
文档数量: 3
主题: business

处理文档:
✓ PRD-WMS优化需求.md
✓ BRD-业务流程.md
✓ DRD-原型设计.md

输出目录: .yg-pm/projects/WMS优化需求/visualizations/

生成文件:
├── PRD-WMS优化需求.html
├── BRD-业务流程.html
└── DRD-原型设计.html

使用浏览器打开目录预览
```

## HTML 输出特性

### 目录导航
- 固定侧边栏
- 点击跳转
- 当前位置高亮
- 展开/折叠子目录

### 样式优化
- 表格：斑马纹、悬停高亮
- 代码块：语法高亮、行号
- 引用块：左侧边框、背景色
- 图片：居中、阴影、响应式

### 导出支持
- 浏览器打印 → PDF
- 保留样式
- 优化打印布局

## 参考文件

详细实现参考：`references/yg-create-html.md`

## 错误处理

**文档不存在**：
```
❌ 文档不存在

路径: documents/PRD-WMS优化.md

使用 /yg-doc 创建文档
```

**项目无文档**：
```
⚠ 项目暂无文档

项目: WMS优化需求
文档数量: 0

使用 /yg-doc 创建文档后再进行可视化
```

**不支持的格式**：
```
❌ 仅支持 Markdown 文件

当前文件: documents/spec.xlsx

请提供 .md 格式的文档
```

## 输出示例（HTML 结构）

生成的 HTML 文件结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>PRD-WMS优化需求</title>
  <style>
    /* 内嵌样式 */
  </style>
</head>
<body>
  <nav class="toc">
    <!-- 目录导航 -->
  </nav>
  <main class="content">
    <!-- 文档内容 -->
  </main>
</body>
</html>
```

## 下一步建议

- 在浏览器中打开 HTML 文件预览
- 使用浏览器打印功能导出 PDF
- 分享 HTML 文件给相关人员
- 进入原型设计阶段（`/yg-prototyping`）