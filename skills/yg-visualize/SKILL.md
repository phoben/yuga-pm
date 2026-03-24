---
name: yg-visualize
description: 将Markdown文档转换为可视化HTML
---

# 可视化文档

## 适用场景

- 需求文档可视化展示
- 文档评审会议
- 向干系人展示需求
- 生成可分享的文档版本
- 导出PDF格式文档

## 功能特点

| 特性 | 说明 |
|-----|------|
| 智能解析 | 自动识别 Markdown 结构，生成对应组件 |
| 图表支持 | Chart.js 数据图表、Mermaid 流程图 |
| 主题切换 | 支持明暗主题切换，审美由 ui-ux-pro-max 驱动 |
| 目录导航 | 自动生成文档目录 |
| PDF导出 | 支持导出PDF格式 |
| 响应式设计 | 适配不同屏幕尺寸 |

## 技能协作

### 核心设计理念

**职责分离原则**：
- 本技能负责：**结构与功能** — 文档解析、组件映射、数据可视化、交互功能
- `ui-ux-pro-max` 负责：**审美与风格** — 配色方案、字体选择、视觉风格、设计系统

### 调用 ui-ux-pro-max 的时机

在生成 HTML **之前**，必须先调用 `ui-ux-pro-max` 获取设计系统：

```
执行流程:
1. 解析 Markdown 文档结构
2. ⚡ 调用 ui-ux-pro-max 获取设计系统（配色、字体、样式）
3. 根据设计系统生成 HTML 样式
4. 渲染最终 HTML 文件
```

### ui-ux-pro-max 调用方式

根据文档类型选择调用参数：

| 文档类型 | 调用示例 |
|---------|---------|
| 需求文档 | `--design-system -p "PRD-Dashboard"` |
| 审查报告 | `--design-system -p "Review-Report"` |
| 技术文档 | `--design-system -p "Tech-Docs"` |

**调用命令**：
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<document_type> <keywords>" --design-system -p "ProjectName"
```

**示例**：
```bash
# 需求文档可视化
python3 skills/ui-ux-pro-max/scripts/search.py "document report professional" --design-system -p "PRD-Doc"

# 数据仪表板
python3 skills/ui-ux-pro-max/scripts/search.py "dashboard data analytics" --design-system -p "Dashboard-Report"
```

### 设计系统应用

从 `ui-ux-pro-max` 获取的设计系统包含：

| 组件 | 用途 |
|-----|------|
| 调色板 | CSS 变量、图表颜色、组件颜色 |
| 字体配对 | 标题字体、正文字体 |
| 样式风格 | 卡片样式、阴影效果、圆角大小 |
| UX 规则 | 可访问性检查清单、交互规范 |

## 执行流程

```
1. Markdown输入
   └── 接收或读取Markdown文档

2. 解析转换
   ├── 标题解析
   ├── 表格处理
   ├── 代码高亮
   └── 图片处理

3. ⚡ 获取设计系统
   └── 调用 ui-ux-pro-max --design-system

4. 应用设计系统
   ├── 生成 CSS 变量
   ├── 配置图表颜色
   └── 应用字体样式

5. 生成HTML
   └── 输出可视化HTML文件

6. 可选导出
   └── 导出PDF格式
```

## 使用方式

```bash
# 可视化当前项目需求文档（自动判断项目）
/yg-visualize

# 可视化指定项目需求文档
/yg-visualize --project project-name

# 指定文档风格关键词（传递给 ui-ux-pro-max）
/yg-visualize --style "professional modern"

# 直接导出PDF
/yg-visualize --pdf
```

## 设计风格

设计风格由 `ui-ux-pro-max` 动态推荐，支持但不限于：

| 风格 | 特点 | 适用场景 |
|-----|------|---------|
| minimal | 简洁清爽，留白充足 | 技术文档、API文档 |
| professional | 专业稳重，层次分明 | 需求文档、审查报告 |
| dashboard | 数据驱动，图表丰富 | 数据报告、分析文档 |
| elegant | 优雅精致，细节考究 | 产品手册、演示文档 |

**风格指定**：通过 `--style` 参数传递关键词，由 `ui-ux-pro-max` 匹配最佳风格。

## 图表选择规则

### 核心原则

根据数据特征和图表复杂度，选择最合适的渲染方式：

| 场景特征 | 渲染方式 | 原因 |
|---------|---------|------|
| 小型图表（节点 ≤ 10） | Mermaid | 轻量、关系表达清晰 |
| 节点简单、关系复杂 | Mermaid | Mermaid 擅长表达复杂关系 |
| 大型蓝图、架构图（节点 > 10） | HTML 绘制 | 更直观、精美、可控 |
| 统计数据、排行、比例对比 | Chart.js | **强制使用**数据图表 |

### Mermaid 适用场景

**优先使用**：
- 简单流程图（节点 ≤ 10）
- 时序图、状态图
- 简单 ER 图（≤ 8 表）

**使用限制**：
- 节点数建议 ≤ 10 个
- 超过限制时，拆分或改用 HTML 绘制

### HTML 绘制场景

**必须使用 HTML 绘制**：
- 系统架构图
- 微服务架构
- 复杂业务流程图
- 组织架构图

### Chart.js 数据图表（强制使用）

**检测到以下数据时，必须生成对应图表**：

| 数据特征 | 图表类型 | 使用场景 |
|---------|---------|---------|
| 评分/指标 | 柱状图/雷达图 | 功能评分、性能指标对比 |
| 占比/分布 | 环形图/饼图 | 状态分布、类型占比 |
| 趋势/时序 | 折线图/面积图 | 数据变化趋势 |
| 排名 | 水平条形图 | Top N 排名 |
| 完成进度 | 仪表盘/进度条 | 完成率、达标率 |

详细规则见 `references/yg-create-html.md`。

## 输出结构

转换后生成的 HTML 文档包含：

- 文档标题头部
- 自动生成的目录导航
- 格式化的正文内容
- 美化的表格样式
- 高亮的代码块
- **数据图表**（Chart.js：柱状图、饼图、折线图、雷达图等）
- **流程/架构图**（Mermaid 或 HTML 绘制）
- 明暗主题切换功能

禁止在HTML中包含需求文档的来源信息、Skills信息、命令建议等。

## 参考文件

| 文件 | 说明 |
|------|------|
| `references/yg-create-html.md` | HTML生成结构规范，包含组件映射和交互规则 |
| `../ui-ux-pro-max/SKILL.md` | 设计系统驱动，提供配色、字体、样式决策 |

## 下一步建议

可视化完成后：
- 需求审查 → `/yg-requirement-reviewer`
- 原型设计 → `/yg-prototyping`