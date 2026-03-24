---
name: yg-visualize
description: "将Markdown文档转换为可视化HTML。执行步骤：1) 确定文档路径 doc_path；2) 用Bash执行 ${CLAUDE_SKILL_DIR}/script/extract-outline.sh $doc_path 获取元信息；3) 根据charCount选择模式（<30000直接处理，>=30000主从协调）；4) 生成HTML。禁止跳过步骤2直接读取文档！"
---

# 可视化文档

<HARD-GATE>
在读取任何文档内容之前，**必须**先执行预处理脚本。这适用于**所有文档**，无论大小。**禁止**直接读取文档内容。
</HARD-GATE>

## 预处理步骤

### 步骤1: 确定文档路径

- 用户指定路径 → 使用该路径
- 用户未指定 → 检查 `.yg-pm/projects/` 目录下的项目文档
- 无项目上下文 → 询问用户文档路径

### 步骤2: 执行脚本获取文档元信息

**必须执行以下 Bash 命令**（使用 `${CLAUDE_SKILL_DIR}` 变量引用技能目录中的脚本）：

```bash
bash "${CLAUDE_SKILL_DIR}/script/extract-outline.sh" "$doc_path"
```

### 步骤3: 根据返回结果选择处理模式

- `charCount < 30000` → 直接处理模式
- `charCount >= 30000` → 主从协调模式（启动多个 SubAgent 并行处理）

---

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
| **大文档支持** | 主从协调架构处理50000+字符文档 |

## 技能协作

### 核心设计理念

**职责分离原则**：
- 本技能负责：**结构与功能** — 文档解析、组件映射、数据可视化、交互功能
- `ui-ux-pro-max` 负责：**审美与风格** — 配色方案、字体选择、视觉风格、设计系统

### 调用 ui-ux-pro-max 的时机

在生成 HTML **之前**，必须先调用 `ui-ux-pro-max` 技能获取设计系统：

```
执行流程:
1. 解析 Markdown 文档结构
2. ⚡ 调用 ui-ux-pro-max 技能获取设计系统（配色、字体、样式）
3. 根据设计系统生成 HTML 样式
4. 渲染最终 HTML 文件
```

### 设计系统应用

从 `ui-ux-pro-max` 获取的设计系统包含：

| 组件 | 用途 |
|-----|------|
| 调色板 | CSS 变量、图表颜色、组件颜色 |
| 字体配对 | 标题字体、正文字体 |
| 样式风格 | 卡片样式、阴影效果、圆角大小 |
| UX 规则 | 可访问性检查清单、交互规范 |

---

## 模式选择规则

根据文档规模自动选择处理模式：

| 文档规模 | 处理模式 | SubAgent数量 | 说明 |
|---------|---------|-------------|------|
| < 3万字符 | 直接处理 | 0 | 单Agent一次性完成 |
| >= 3万字符 | 主从协调 | floor((字符数-20000)/10000)+1 | 并行处理 |

**计算示例**：
- 25000字符 → 直接处理
- 35000字符 → 主从协调，2个SubAgent
- 50000字符 → 主从协调，4个SubAgent
- 80000字符 → 主从协调，7个SubAgent

**阈值选择依据**：
- 30000字符分界点：单Agent处理3万字符约需3-5分钟，超过此阈值后上下文压力增大
- 每增加1万字符增加1个SubAgent：平衡并行收益与协调开销

---

## 执行流程

### 阶段1: 文档预处理

```
步骤1.1: 获取文档信息
├── 调用 scripts/extract-outline.sh <doc_path>
├── 获取字符数、行数、标题结构
└── 返回 JSON 格式的文档元信息

步骤1.2: 选择处理模式
├── charCount < 30000 → 直接处理模式
└── charCount >= 30000 → 主从协调模式
```

**extract-outline.sh 输出示例**：
```json
{
  "charCount": 52340,
  "lineCount": 856,
  "suggestedChunks": 4,
  "headings": [
    {
      "level": 1,
      "text": "产品需求文档",
      "id": "section-1",
      "startLine": 1,
      "endLine": 45,
      "charRange": [0, 8500],
      "children": []
    }
  ]
}
```

### 阶段2: 文档分析与规划

```
步骤2.1: 读取文档摘要
├── 读取文档前3000字符
├── 了解文档类型、主题、风格
└── 决定设计风格关键词

步骤2.2: 获取设计系统
├── 调用 ui-ux-pro-max 获取设计系统
├── 提取配色方案、字体配对
└── 生成全局设计规范文件

步骤2.3: 生成分块计划（仅主从模式）
├── 按 H1/H2 章节边界分块
├── 避免在章节中间截断
└── 记录每个分块的章节列表和字符范围
```

**设计规范文件** (.temp/design-spec.css)：
```css
:root {
  /* 从 ui-ux-pro-max palette 提取 */
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;

  /* 从 typography 提取 */
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;

  /* 从 style 提取 */
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);

  /* 图表颜色 */
  --chart-colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
}
```

### 阶段3: 模板生成

```
步骤3.1: 读取基础模板
├── 读取 references/report.html
└── 保留基础结构

步骤3.2: 生成区域结构（仅主从模式）
├── 将 __MD_CONTENT__ 替换为分区域结构
├── 每个区域有唯一ID (section-1, section-2...)
└── 保存到 .temp/template-{timestamp}.html
```

**分区域模板结构**：
```html
<main class="main-content">
  __QUICK_SUMMARY__
  __CHARTS_HTML__

  <!-- 分区域结构 -->
  <div id="section-1" data-placeholder="true" data-region="true">
    <!-- SubAgent #1 填充 -->
  </div>
  <div id="section-2" data-placeholder="true" data-region="true">
    <!-- SubAgent #2 填充 -->
  </div>
</main>
```

### 阶段4: 内容生成

#### 直接处理模式 (< 3万字符)

```
1. 读取完整文档
2. 解析Markdown结构
3. 生成HTML内容
4. 替换模板占位符
5. 输出最终HTML
```

#### 主从协调模式 (>= 3万字符)

```
步骤4.1: 启动SubAgent
├── 使用 Agent 工具启动 visualize-page Agent
├── 设置 run_in_background: true
├── 传递参数:
│   - doc_path: 文档路径
│   - assigned_sections: 分配的章节列表
│   - design_spec_path: 设计规范路径
│   - template_path: 模板路径
│   - region_id: 目标区域ID
└── 记录所有 agentId

步骤4.2: 等待完成
├── 使用 TaskOutput 等待每个Agent
├── 设置 timeout: 300000 (5分钟/Agent)
└── 处理超时情况

步骤4.3: 处理失败区域
├── 标记超时区域
├── 主Agent补充填充
└── 或生成占位提示
```

**启动SubAgent示例**：
```javascript
Agent({
  subagent_type: "yg-pm:visualize-page",
  description: "生成页面片段 section-1",
  prompt: `
    你是页面生成Agent，负责生成指定章节的HTML片段。

    ## 输入参数
    - doc_path: "/path/to/document.md"
    - assigned_sections: [{"id":"section-1","title":"1. 产品概述","charRange":[0,8500]}]
    - design_spec_path: ".temp/design-spec.css"
    - template_path: ".temp/template-20260324.html"
    - region_id: "section-1"

    ## 工作流程
    1. 读取设计规范文件
    2. 读取文档指定字符范围
    3. 生成HTML片段
    4. 使用Edit工具填充模板区域
  `,
  run_in_background: true
})
```

### 阶段5: 后处理

```
步骤5.1: 代码格式审查
├── 检查HTML结构完整性
├── 验证区域填充状态
└── 清理占位标记

步骤5.2: 浏览器测试
├── 使用Bash工具打开HTML文件
└── 验证页面渲染正常

步骤5.3: 输出最终HTML
└── 保存到目标路径
```

---

## 图表处理策略

### 职责划分

| 图表类型 | 处理者 | 原因 |
|---------|-------|------|
| Chart.js 数据图表 | SubAgent | 数据与章节绑定，内容范围内处理 |
| Mermaid 流程图 | SubAgent | 小型图表，章节内独立 |
| 大型架构图/蓝图 | 主Agent | 可能跨章节，需全局视角 |

### Chart.js 处理规则（SubAgent执行）

1. 扫描章节内表格数据
2. 识别可量化数据（评分、占比、趋势）
3. 生成 Chart.js 配置
4. 使用设计规范中的 `--chart-colors`

### Mermaid 处理规则（SubAgent执行）

1. 提取 ````mermaid` 代码块
2. 节点数 ≤ 10 直接渲染
3. 节点数 > 10 标记警告，建议拆分

### 大型架构图处理（主Agent预处理）

1. 主Agent在阶段2扫描全文识别大型图表
2. 主Agent生成架构图HTML，注入模板头部
3. SubAgent跳过该图表，仅保留引用链接

---

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| 脚本执行失败 | 回退到直接处理模式 |
| SubAgent 超时 | 主Agent补充填充该区域 |
| 区域填充失败 | 生成占位提示，保留其他内容 |
| 并发写入冲突 | 分区域独立，无冲突风险 |

### 回退流程

```
触发条件: extract-outline.sh 执行失败或返回异常

回退步骤:
1. 检测脚本失败，记录错误日志
2. 放弃主从协调模式
3. 恢复到直接处理模式（现有流程）
4. 清理已生成的临时文件
```

---

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

## 文件结构

```
skills/yg-visualize/
├── SKILL.md                    # 主技能文件
├── agents/
│   └── visualize-page.md       # 页面片段生成Agent
├── script/
│   └── extract-outline.sh      # 提取文档层级结构脚本
└── references/
    ├── yg-create-html.md       # HTML生成规范
    └── report.html             # HTML模板
```

## 参考文件

| 文件 | 说明 |
|------|------|
| `references/yg-create-html.md` | HTML生成结构规范，包含组件映射和交互规则 |
| `agents/visualize-page.md` | 页面片段生成Agent定义 |
| `../ui-ux-pro-max/SKILL.md` | 设计系统驱动，提供配色、字体、样式决策 |

## 验收标准

- [ ] 5万字符文档处理成功，无超时
- [ ] 8万字符文档处理成功，并行执行
- [ ] 输出HTML样式一致性
- [ ] 所有章节内容完整渲染
- [ ] 浏览器测试无报错

## 下一步建议

可视化完成后：
- 需求审查 → `/yg-requirement-reviewer`
- 原型设计 → `/yg-prototyping`