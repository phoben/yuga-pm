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