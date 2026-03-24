---
name: yg-visualize
description: "将Markdown文档转换为可视化HTML。执行步骤：1) 确定文档路径；2) 执行 extract-outline.sh 获取元信息并校验；3) 根据charCount选择模式（<30000直接处理，>=30000主从协调）；4) 复制框架模板并填充内容。禁止跳过步骤2！"
---

# 可视化文档

<HARD-GATE>
在读取任何文档内容之前，**必须**先执行预处理脚本进行校验。
</HARD-GATE>

## 预处理步骤

### 步骤1: 确定文档路径
- 用户指定路径 → 使用该路径
- 用户未指定 → 检查 `.yg-pm/projects/` 目录
- 无项目上下文 → 询问用户

### 步骤2: 执行脚本获取元信息

```bash
bash scripts/extract-outline.sh "$doc_path"
```

### 步骤3: 校验文档规范

| 校验项 | 规则 | 失败处理 |
|-------|------|---------|
| 文件格式 | 扩展名 `.md` | 拒绝执行 |
| 标题结构 | 包含 H1 + ≥2 个 H2 | 提示使用 /yg-requirement-extraction 或 /yg-document-writing |
| 章节长度 | 每章节 > 200 字符 | 警告，询问是否继续 |

### 步骤4: 选择处理模式

- `charCount < 30000` → 直接处理模式
- `charCount >= 30000` → 主从协调模式

---

## 执行流程

### 阶段1: 预处理与校验
执行 extract-outline.sh 获取文档元信息
校验文件格式和标题结构

### 阶段2: 准备模板
1. 选择框架模板（light/dark，默认 light）
2. 复制到目标目录
3. 填充文档元信息（title、nav、header）
4. 根据 outline 生成 section 结构

### 阶段3: 内容生成
- 小文档：主Agent直接填充
- 大文档：启动 SubAgent 并行填充

### 阶段4: 验证
检查区域填充完整性，浏览器测试

---

## 模板说明

### 框架模板
- `templates/framework-light.html` - 亮色主题
- `templates/framework-dark.html` - 暗色主题

### 组件模板
位于 `templates/components/`，共 11 个：
- step-cards.html - 步骤卡片
- timeline.html - 时间线
- topic-cards.html - 主题卡片
- feature-grid.html - 特性网格
- data-table.html - 数据表格
- stat-chips.html - 统计芯片
- accordion.html - 折叠面板
- code-block.html - 代码块
- chart-card.html - 图表卡片
- architecture-diagram.html - 架构图
- flowchart.html - 流程图

### 占位符约定
- `{{title}}` - 标题文本
- `{{desc}}` - 描述文本
- `{{chart-type}}` - 图表类型
- `{{chart-id}}` - 唯一ID

---

## 参考文件

| 文件 | 用途 |
|------|------|
| references/chart-specs.md | 图表类型选择规则 |
| references/mermaid-specs.md | Mermaid 使用规范 |
| references/icon-system.md | 图标映射表 |

## 验收标准
- SKILL.md 行数 ≤ 300
- 框架模板包含完整布局
- 11 个组件模板可用
- 文档校验正常工作