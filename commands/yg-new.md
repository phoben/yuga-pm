---
name: yg-new
description: 创建新项目，初始化目录结构
---

# 创建新项目

## 使用方式

```
/yg-new <项目名>
```

**示例**：
```
/yg-new WMS优化需求
```

## 功能说明

创建一个新的项目管理目录，初始化必要的文件结构和配置。

## 执行流程

1. **检查根目录**
   - 检查 `.yg-pm/` 目录是否存在
   - 不存在则自动创建

2. **检查项目是否存在**
   - 读取 `.yg-pm/projects/` 目录
   - 检查是否存在同名项目
   - 存在则提示用户并终止

3. **创建项目目录结构**
   ```
   .yg-pm/projects/{项目名}/
   ├── project.json    # 项目元数据
   ├── drafts/         # 草稿文档
   ├── documents/      # 正式文档
   └── prototypes/     # 原型文件
   ```

4. **初始化 project.json**
   生成项目元数据文件，包含以下字段：

   ```json
   {
     "id": "{ABBR}-{YEAR}-{SEQ}",
     "name": "项目名称",
     "description": "",
     "stage": "draft",
     "created_at": "{{current_date}}",
     "updated_at": "{{current_date}}",
     "documents": [],
     "tags": []
   }
   ```

   **字段说明**：

   | 字段 | 类型 | 说明 |
   |------|------|------|
   | `id` | string | 项目唯一标识，格式：`{简称}-{年份}-{序号}`，自动生成 |
   | `name` | string | 项目名称（用户指定） |
   | `description` | string | 项目简介，初始为空 |
   | `stage` | enum | 当前阶段，默认 `draft` |
   | `created_at` | string | 创建时间，ISO 8601 格式 |
   | `updated_at` | string | 更新时间，ISO 8601 格式 |
   | `documents` | array | 已生成的文档列表，初始为空 |
   | `tags` | array | 标签数组，初始为空 |

5. **输出结果**
   - 显示项目创建成功信息
   - 显示项目 ID 和路径
   - 显示目录结构

## 状态流转

```
[无] ──► draft (项目创建完成)
```

## 输出示例

```
✓ 项目创建成功

项目ID: WMS-2024-001
项目名称: WMS优化需求
项目路径: .yg-pm/projects/WMS优化需求/

目录结构:
├── project.json
├── drafts/
├── documents/
└── prototypes/

下一步建议:
- 使用 /yg-brainstorming 开始需求收集
- 或直接编辑 project.json 添加项目描述
```

## 下一步建议

使用 `yg-brainstorming` 技能开始需求收集和头脑风暴。