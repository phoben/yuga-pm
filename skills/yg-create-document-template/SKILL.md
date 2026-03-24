---
name: yg-create-document-template
description: 创建新的需求文档类型模板
---

# 创建文档类型

## 适用场景

- 现有文档类型（BRD/PRD/TRD/SRS/DRD）不满足需求
- 组织有特定的文档格式要求
- 需要创建行业专用文档模板
- 标准化团队文档格式

## 执行流程

```
1. 需求收集
   ├── 文档类型名称
   ├── 适用场景描述
   └── 目标受众

2. 资料收集
   ├── 参考现有模板
   ├── 行业标准格式
   └── 团队特殊要求

3. 重复检测
   └── 检查 yg-document-writing SKILL.md 是否已存在该类型

4. 模板编写
   └── 创建 template.md（模板内容）

5. 类型注册
   └── 更新 yg-document-writing SKILL.md 文档类型表

6. 用户确认
   └── 用户审核并确认模板
```

---

## 交互式提问规范

**涉及用户交互时必须使用 AskUserQuestion 工具**，遵循以下原则：

| 原则 | 说明 |
|-----|------|
| **一次一问** | 每次只提出一个问题，等待用户回答后再继续 |
| **提供选项** | 为每个问题提供 2-4 个预设选项 |
| **保留自定义** | 依靠"其他"选项让用户自由表达 |
| **单选为主** | 大多数情况使用单选（multiSelect: false） |

### 需求收集示例

**文档类型名称**：

```json
{
  "questions": [{
    "question": "您要创建的文档类型属于哪个类别？",
    "header": "文档类别",
    "multiSelect": false,
    "options": [
      { "label": "需求类", "description": "PRD、BRD、SRS 等需求文档" },
      { "label": "技术类", "description": "TRD、架构设计、接口文档等" },
      { "label": "管理类", "description": "项目计划、进度报告、会议纪要等" },
      { "label": "测试类", "description": "测试计划、测试用例、测试报告等" }
    ]
  }]
}
```

**适用场景**：

```json
{
  "questions": [{
    "question": "这个模板主要用于什么场景？",
    "header": "适用场景",
    "multiSelect": false,
    "options": [
      { "label": "团队标准化", "description": "统一团队文档格式规范" },
      { "label": "行业专用", "description": "特定行业的文档格式要求" },
      { "label": "项目定制", "description": "为特定项目设计的文档格式" },
      { "label": "个人偏好", "description": "个人习惯使用的文档格式" }
    ]
  }]
}
```

---

## 输出内容

创建完成后，更新以下内容：

```
yg-document-writing/
├── SKILL.md                        # 添加新文档类型声明
└── references/
    └── {type}-template.md          # 新增模板文件
```

### SKILL.md 类型声明格式

在「支持文档类型」或「场景模板」表中添加新行：

```markdown
| {缩写} | {全称} | {适用场景} |
```

### 模板文件格式

```markdown
# {文档标题}

## 章节1
### 子章节1.1
...

## 章节2
...
```

## 创建检查清单

- [ ] 文档类型命名规范（小写字母+连字符）
- [ ] 与 yg-document-writing 现有类型无重复
- [ ] 模板内容结构清晰
- [ ] 在 SKILL.md 中注册文档类型
- [ ] 模板文件放置到 references 目录
- [ ] 用户确认通过

## 注意事项

1. 命名使用小写字母和连字符，如 `api-spec`
2. 模板应符合行业规范或团队标准
3. 模板文件命名为 `{type}-template.md`
4. 保持模板简洁，避免过度复杂

## 参考文件

参考现有模板结构（位于 yg-document-writing 技能目录）：
- `yg-document-writing/references/brd-template.md`
- `yg-document-writing/references/prd-template.md`
- `yg-document-writing/SKILL.md`（类型声明格式）