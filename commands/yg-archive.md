---
name: yg-archive
description: 归档已完成的项目
---

# 归档项目

## 使用方式

```
/yg-archive <项目名>
```

**示例**：
```
/yg-archive WMS优化需求
```

## 功能说明

将已完成或不再进行的项目移至归档目录，保留完整的历史记录。归档后的项目将从 `projects/` 目录移除。

## 执行流程

1. **验证项目存在**
   - 检查 `.yg-pm/projects/{项目名}/` 目录
   - 读取 `project.json` 文件
   - 如果项目不存在，提示错误

2. **确认归档操作**
   - 显示项目摘要信息
   - 询问用户确认归档
   - 用户确认后继续

3. **创建归档目录**
   - 确保 `.yg-pm/archive/` 目录存在
   - 检查归档目录中是否已存在同名项目

4. **移动项目文件**
   - 将整个项目目录从 `projects/` 移至 `archive/`
   - 保留所有文件和子目录

5. **更新项目状态**
   - 更新 `project.json` 中的 `stage` 为 `archived`
   - 添加 `archived_at` 字段记录归档时间
   - 更新 `updated_at` 时间戳

## 目录变更

**归档前**：
```
.yg-pm/
├── projects/
│   └── WMS优化需求/
│       ├── project.json
│       ├── documents/
│       └── prototypes/
└── archive/
```

**归档后**：
```
.yg-pm/
├── projects/
└── archive/
    └── WMS优化需求/
        ├── project.json
        ├── documents/
        └── prototypes/
```

## project.json 变更

```json
{
  "id": "WMS-2024-001",
  "name": "WMS优化需求",
  "stage": "archived",
  "archived_at": "2024-02-01T15:00:00Z",
  "updated_at": "2024-02-01T15:00:00Z",
  ...
}
```

**新增字段**：
- `archived_at`：归档时间

## 输出示例

**确认提示**：
```
📦 确认归档项目

项目名称: WMS优化需求
项目ID:   WMS-2024-001
当前阶段: final
文档数量: 3
原型文件: 1

归档后项目将从进行中列表移除，但保留所有文件。

确认归档？(y/n)
```

**成功归档**：
```
✓ 项目已归档

项目名称: WMS优化需求
归档时间: 2024-02-01 15:00
归档路径: .yg-pm/archive/WMS优化需求/

已归档内容:
├── project.json
├── documents/ (3 个文档)
│   ├── PRD-WMS优化.md
│   ├── BRD-业务流程.md
│   └── DRD-原型设计.md
└── prototypes/ (1 个原型)
    └── wms-mockup.pen

使用 /yg-list 查看归档项目列表
```

**项目已归档**：
```
⚠ 项目已归档

项目名称: WMS优化需求
归档时间: 2024-01-15 10:00
归档路径: .yg-pm/archive/WMS优化需求/
```

## 错误处理

**项目不存在**：
```
❌ 未找到项目 "XXX"

使用 /yg-list 查看所有项目
```

**归档目录已存在同名项目**：
```
❌ 归档目录已存在同名项目

归档路径: .yg-pm/archive/XXX/

请检查是否重复归档，或手动处理冲突
```

## 归档策略

建议归档的项目：
- 评审通过且已交付的项目（`final` 阶段）
- 已取消的项目
- 长期暂停且不计划恢复的项目

不建议归档的项目：
- 正在进行的项目
- 暂停但计划恢复的项目（使用 `/yg-hold`）

## 下一步建议

- 使用 `/yg-list` 查看所有项目
- 使用 `/yg-new` 创建新项目