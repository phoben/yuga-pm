# yg-visualize Agent 规则汇总

本文件汇总所有 SubAgent 的核心规则，供主技能快速引用。

## fill-section Agent

**路径:** `${CLAUDE_SKILL_DIR}/agents/fill-section.md`

**核心职责:** 填充单个章节的 HTML 内容

**关键规则:**
- 只接收路径参数，自行读取源文档
- 必须调用 shadcn 技能
- H3 子章节使用 Accordion
- 禁止全量读取 HTML
- 只报告状态，不返回 HTML

## tweak-section Agent

**路径:** `${CLAUDE_SKILL_DIR}/agents/tweak-section.md`

**核心职责:** 微调已生成 HTML 的单个章节

**关键规则:**
- 使用 Grep + offset/limit 精准定位
- 最小化修改
- 只报告状态