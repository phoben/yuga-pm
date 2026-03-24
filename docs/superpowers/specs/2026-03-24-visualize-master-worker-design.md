# yg-visualize 主从协调架构设计

## 概述

优化 `yg-visualize` 技能，解决大型 PRD 文档（50000+ 字符）处理超时问题，通过主从协调架构实现并行处理。

## 问题背景

| 现状 | 问题 |
|-----|------|
| 大型 PRD 文档 | 50000+ 字符导致处理超时 |
| 单 Agent 模式 | 无法并行，上下文超限 |

## 解决方案

采用主从协调架构：
- 主 Agent：文档分析、设计规范、模板生成、任务协调
- Sub Agent：并行处理章节内容，直接填充模板

## 模式选择规则

| 文档规模 | 处理模式 | SubAgent数量 |
|---------|---------|-------------|
| < 3万字符 | 直接处理 | 0 |
| >= 3万字符 | 主从协调 | floor((字符数-20000)/10000)+1 |

**示例**：
- 25000字符 -> 直接处理
- 35000字符 -> 主从协调，2个SubAgent
- 50000字符 -> 主从协调，4个SubAgent
- 80000字符 -> 主从协调，7个SubAgent

## 文件结构

```
skills/yg-visualize/
├── SKILL.md                    # 主技能文件（更新）
├── agents/
│   └── visualize-page.md       # 新建：页面片段生成Agent
├── scripts/
│   └── extract-outline.sh      # 新建：提取文档层级结构脚本
└── references/
    ├── yg-create-html.md       # 现有：HTML生成规范
    └── report.html             # 现有：HTML模板
```

## 核心流程

```
主Agent (yg-visualize)
│
├── 阶段1: 文档预处理
│   ├── 调用 extract-outline.sh 获取字数
│   ├── 字数 < 3万? -> 直接处理模式
│   └── 字数 >= 3万 -> 主从协调模式
│
├── 阶段2: 文档分析与规划
│   ├── 读取文档前3000字符（摘要）
│   ├── 生成全局设计规范 -> .temp/design-spec.css
│   └── 生成分块计划 JSON
│
├── 阶段3: 模板生成
│   ├── 生成带占位DOM的基础模板
│   └── 保存到 .temp/template-{timestamp}.html
│
├── 阶段4: 并行执行
│   ├── 启动 N 个 visualize-page Agent (后台并行)
│   ├── 各Agent读取指定章节范围
│   ├── 各Agent读取设计规范
│   ├── 各Agent直接Edit模板填充指定区域
│   └── 等待所有Agent完成
│
└── 阶段5: 后处理
    ├── 代码格式审查
    ├── 浏览器端到端测试
    └── 输出最终HTML
```

## 组件设计

### 1. extract-outline.sh 脚本

**功能**：提取 Markdown 文档层级结构

**输入**：Markdown 文件路径

**输出**：JSON 格式

```json
{
  "charCount": 52340,
  "headings": [
    {
      "level": 1,
      "text": "产品需求文档",
      "id": "产品需求文档",
      "startLine": 1,
      "endLine": 45,
      "charRange": [0, 8500],
      "children": [
        {
          "level": 2,
          "text": "1. 产品概述",
          "id": "1-产品概述",
          "startLine": 5,
          "endLine": 30,
          "charRange": [200, 4500],
          "children": []
        }
      ]
    }
  ],
  "suggestedChunks": 4
}
```

**核心逻辑**：
1. 统计文档总字符数
2. 逐行扫描，识别 H1/H2/H3 标题行
3. 记录每个标题的起止行号和字符范围
4. 构建层级树结构
5. 计算建议分块数

### 2. visualize-page Agent

**定义**：
```yaml
---
description: 可视化页面片段生成Agent - 负责生成指定章节区域的HTML内容，直接填充到模板文件
capabilities:
  - 读取指定章节内容
  - 应用全局设计规范
  - 生成HTML片段
  - 填充到模板指定区域
tools:
  - Read
  - Edit
  - Glob
  - Grep
---
```

**输入参数**（由主Agent传递）：
- `doc_path`: 文档路径
- `assigned_sections`: 分配的章节列表
- `char_range`: 字符范围 [start, end]
- `design_spec_path`: 设计规范文件路径
- `template_path`: 模板文件路径
- `region_id`: 目标区域ID

**工作流程**：
1. 读取设计规范文件
2. 读取文档指定字符范围
3. 解析内容结构
4. 生成HTML片段
5. Edit模板文件替换目标区域

**约束规则**：
| 规则 | 说明 |
|-----|------|
| 只读指定范围 | 禁止读取文档全文 |
| 只编辑指定区域 | 禁止修改模板其他部分 |
| 样式遵循规范 | 所有样式来自设计规范文件 |
| 无返回HTML | 直接编辑文件 |

### 3. 分块策略

**原则**：
- 按 H1/H2 章节边界分块
- 避免在章节中间截断
- 每个分块尽量均衡

**分块算法**：
```
1. 获取 headings 层级结构
2. 计算总字符数和目标分块数
3. 按章节遍历，累计字符数
4. 当累计字符接近阈值时，创建一个分块
5. 记录每个分块:
   - region_id
   - sections (章节列表)
   - char_range
```

### 4. 模板占位结构

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 全局设计规范 -->
  <style>
    /* CSS变量来自 design-spec.css */
  </style>
</head>
<body>
  <nav id="sidebar"><!-- 导航结构 --></nav>
  <main id="content">
    <div id="section-1" data-placeholder="true">
      <!-- SubAgent #1 填充 -->
    </div>
    <div id="section-2" data-placeholder="true">
      <!-- SubAgent #2 填充 -->
    </div>
    <!-- ... 更多区域 -->
  </main>
</body>
</html>
```

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| 脚本执行失败 | 回退到直接处理模式 |
| SubAgent 超时 | 主Agent补充填充该区域 |
| 区域填充失败 | 生成占位提示，保留其他内容 |
| 并发写入冲突 | 分区域独立，无冲突风险 |

## 实现步骤

1. 创建 `scripts/extract-outline.sh` 脚本
2. 创建 `agents/visualize-page.md` Agent定义
3. 更新 `SKILL.md` 添加模式判断和主从协调流程
4. 测试验证

## 验收标准

- [ ] 5万字符文档处理成功，无超时
- [ ] 8万字符文档处理成功，并行执行
- [ ] 输出HTML样式一致性
- [ ] 所有章节内容完整渲染
- [ ] 浏览器测试无报错