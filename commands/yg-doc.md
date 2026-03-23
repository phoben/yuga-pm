---
name: yg-doc
description: 快速创建需求文档
---

# 创建文档

## 使用方式

```
/yg-doc [类型] [项目名]
```

**参数说明**：
- `类型`：可选，文档类型，支持 prd/brd/trd/srs/drd
- `项目名`：可选，指定项目名称，不指定则从上下文推断

**示例**：
```
/yg-doc prd
/yg-doc brd WMS优化需求
/yg-doc
```

## 功能说明

在指定项目中快速创建需求文档，自动引用相应的文档模板。

## 支持的文档类型

| 类型 | 全称 | 适用场景 | 关注重点 |
|------|------|---------|---------|
| `prd` | Product Requirement Document | 产品开发 | 用户体验和功能 |
| `brd` | Business Requirement Document | 业务系统 | 业务流程和规则 |
| `trd` | Technical Requirement Document | 技术系统 | 技术实现方案 |
| `srs` | Software Requirement Specification | 综合项目 | 全面结构化说明 |
| `drd` | Design Requirement Document | WEB前端项目 | 原型设计指导 |

## 执行流程

1. **确定目标项目**
   - 如果指定了项目名，直接使用
   - 如果未指定，从上下文推断当前项目
   - 项目不存在则提示错误

2. **确定文档类型**
   - 如果指定了类型，验证类型有效性
   - 如果未指定类型，根据项目阶段推荐：
     - `draft`/`collecting` → 推荐 `brd`
     - `writing` → 推荐上次文档类型或 `prd`
   - 让用户确认或选择

3. **读取文档模板**
   - 从 `references/` 目录读取对应模板
   - 模板文件：`references/{type}-template.md`

4. **创建文档文件**
   - 生成文件名：`{TYPE}-{项目名}.md`
   - 保存到项目的 `documents/` 目录

5. **更新项目元数据**
   - 在 `project.json` 的 `documents` 数组中添加记录
   - 更新 `updated_at` 时间戳

## 模板引用

| 文档类型 | 模板路径 |
|---------|---------|
| PRD | `references/prd-template.md` |
| BRD | `references/brd-template.md` |
| TRD | `references/trd-template.md` |
| SRS | `references/srs-template.md` |
| DRD | `references/drd-generator.md` |

## 输出示例

**指定类型创建**：
```
📄 创建文档

项目:     WMS优化需求
文档类型: PRD
文件名:   PRD-WMS优化需求.md
保存路径: .yg-pm/projects/WMS优化需求/documents/

模板已加载，请填写以下内容:
• 产品背景
• 用户故事
• 功能需求
• 非功能需求
• 验收标准

文档已创建，开始编写...
```

**交互选择类型**：
```
📄 创建文档

项目: WMS优化需求

请选择文档类型:
1. PRD - 产品需求文档
2. BRD - 业务需求文档
3. TRD - 技术需求文档
4. SRS - 软件需求规格说明书
5. DRD - 设计需求文档

推荐: PRD（基于项目当前阶段）

请输入选择 (1-5):
```

**成功创建**：
```
✓ 文档创建成功

文档名称: PRD-WMS优化需求
文档类型: PRD
文档路径: .yg-pm/projects/WMS优化需求/documents/PRD-WMS优化需求.md

项目文档列表已更新

下一步建议:
• 编写文档内容
• 使用 /yg-document-writing 辅助编写
• 使用 /yg-visualize 生成可视化版本
```

## project.json 更新

```json
{
  "documents": [
    {
      "type": "PRD",
      "path": "documents/PRD-WMS优化需求.md",
      "version": "1.0",
      "created_at": "2024-01-20T14:00:00Z"
    }
  ]
}
```

## 错误处理

**无效的文档类型**：
```
❌ 不支持的文档类型: xyz

支持的类型: prd, brd, trd, srs, drd
```

**项目不存在**：
```
❌ 未找到项目 "XXX"

使用 /yg-list 查看所有项目
```

**文档已存在**：
```
⚠ 文档已存在

文件路径: documents/PRD-WMS优化需求.md

选择操作:
1. 打开现有文档
2. 创建新版本 (PRD-WMS优化需求-v2.md)
3. 取消
```

## 下一步建议

- 使用 `/yg-document-writing` 获取文档编写指导
- 使用 `/yg-requirement-reviewer` 进行文档审查
- 使用 `/yg-visualize` 生成可视化版本