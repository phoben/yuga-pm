# DRD 处理规则

本文档定义如何检测、验证和生成设计需求文档（DRD）。

---

## DRD 智能处理流程

```
┌─────────────────────────────────────┐
│          检测 DRD 文档               │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    DRD 存在        DRD 不存在
        │               │
        ▼               ▼
  验证 DRD 格式    检测 PRD/需求文档
        │               │
   ┌────┴────┐     ┌────┴────┐
   ▼         ▼     ▼         ▼
 格式有效   格式无效  PRD 存在   PRD 不存在
   │         │     │         │
   ▼         ▼     ▼         ▼
 使用 DRD  重新生成  生成 DRD  询问用户提供
```

---

## DRD 检测逻辑

### 检测顺序

按以下优先级检测输入文档：

1. **用户指定路径** - 用户通过 `--doc` 参数明确指定的文档路径
2. **上下文中的 DRD** - 当前项目目录中已存在的 DRD 文档
3. **上下文中的 PRD** - 当前项目目录中已存在的 PRD 文档
4. **直接需求描述** - 用户直接提供的需求描述

### 检测实现

```javascript
async function detectInputDocument(options) {
  // 1. 检查用户指定路径
  if (options.doc) {
    const doc = await readDocument(options.doc);
    return { type: detectDocumentType(doc), content: doc, path: options.doc };
  }

  // 2. 检查上下文中的 DRD
  const drdPath = findDocumentInContext('DRD.md');
  if (drdPath) {
    const doc = await readDocument(drdPath);
    return { type: 'DRD', content: doc, path: drdPath };
  }

  // 3. 检查上下文中的 PRD
  const prdPath = findDocumentInContext('PRD.md');
  if (prdPath) {
    const doc = await readDocument(prdPath);
    return { type: 'PRD', content: doc, path: prdPath };
  }

  // 4. 询问用户提供文档
  return askUserForDocument();
}
```

### 文档类型检测

```javascript
function detectDocumentType(content) {
  const hasDesignSpecs = /设计规范|Design Specification/i.test(content);
  const hasPageStructure = /页面结构|Page Structure/i.test(content);
  const hasBusinessReq = /业务需求|Business Requirement/i.test(content);
  const hasProductReq = /产品需求|Product Requirement/i.test(content);

  if (hasDesignSpecs && hasPageStructure) {
    return 'DRD';
  }

  if (hasBusinessReq || hasProductReq) {
    return 'PRD';
  }

  return 'unknown';
}
```

---

## DRD 验证清单

### 必要章节检查

| 章节 | 检查项 | 重要性 |
|-----|-------|-------|
| 文档信息 | 包含项目名称、版本、日期 | 必需 |
| 设计规范 | 包含配色方案、字体规范 | 必需 |
| 页面结构 | 包含页面清单、导航结构 | 必需 |
| 交互流程 | 包含关键业务流程说明 | 必需 |
| 组件清单 | 列出公共组件和业务组件 | 推荐 |
| 数据展示规范 | 包含表单字段、数据表格 | 推荐 |

### 验证检查项

```markdown
## DRD 验证清单

### 基础结构
- [ ] 包含文档信息章节
- [ ] 包含设计规范章节
- [ ] 包含页面结构章节
- [ ] 包含交互流程章节

### 设计规范
- [ ] 定义了配色方案（CSS 变量）
- [ ] 定义了字体规范
- [ ] 定义了间距规范
- [ ] 定义了交互动效（可选）

### 页面结构
- [ ] 列出了所有页面
- [ ] 定义了页面入口
- [ ] 说明了导航结构
- [ ] 标注了页面类型

### 交互流程
- [ ] 描述了关键业务流程
- [ ] 说明了用户操作路径
- [ ] 定义了状态变化

### 组件清单（可选但推荐）
- [ ] 列出公共组件
- [ ] 列出业务组件
- [ ] 说明组件用途
```

### 验证实现

```javascript
function validateDRD(drdContent) {
  const results = {
    isValid: true,
    score: 0,
    issues: [],
    warnings: []
  };

  // 检查必要章节
  const requiredSections = [
    { pattern: /设计规范|Design Specification/, name: '设计规范', required: true },
    { pattern: /页面结构|Page Structure/, name: '页面结构', required: true },
    { pattern: /交互流程|Interaction Flow/, name: '交互流程', required: true },
    { pattern: /组件清单|Component Inventory/, name: '组件清单', required: false }
  ];

  for (const section of requiredSections) {
    if (!section.pattern.test(drdContent)) {
      if (section.required) {
        results.issues.push(`缺少必要章节: ${section.name}`);
        results.isValid = false;
      } else {
        results.warnings.push(`缺少推荐章节: ${section.name}`);
      }
    } else {
      results.score += section.required ? 25 : 10;
    }
  }

  // 检查设计规范内容
  if (!/--color-primary|--color-text|--color-bg/i.test(drdContent)) {
    results.warnings.push('设计规范缺少 CSS 变量定义');
  }

  return results;
}
```

---

## DRD 生成流程

### 触发条件

当检测到以下情况时，触发 DRD 生成：

1. 上下文中存在 PRD 但无 DRD
2. 现有 DRD 验证失败且用户选择重新生成
3. 用户直接提供需求描述

### 生成步骤

```
Step 1: 读取源文档
    │
    ▼
Step 2: 提取设计要素
    ├── UI 布局信息
    ├── 组件信息
    ├── 交互逻辑
    └── 数据展示需求
    │
    ▼
Step 3: 过滤非前端内容
    ├── 丢弃后端 API 实现细节
    ├── 丢弃数据库 schema 设计
    ├── 丢弃服务端逻辑
    └── 丢弃基础设施/DevOps 规范
    │
    ▼
Step 4: 按 DRD 模板组织内容
    │
    ▼
Step 5: 输出 DRD 文档
```

### 调用 Writer Agent

```javascript
async function generateDRD(sourceDoc, outputPath) {
  // 派发 Writer Agent
  const result = await Agent({
    subagent_type: 'general-purpose',
    description: '生成 DRD 文档',
    prompt: `
## 任务: 生成 DRD 文档

### 输入文档
${sourceDoc}

### 输出路径
${outputPath}

### 要求
1. 按照 DRD 模板结构生成文档
2. 只保留前端相关内容
3. 包含设计规范、页面结构、交互流程
4. 使用中文撰写
    `,
    tools: ['Read', 'Write', 'Edit']
  });

  return result;
}
```

---

## 错误处理策略

### 错误分类与处理

| 错误类型 | 描述 | 处理方式 | 重试次数 |
|---------|------|---------|---------|
| 文档不存在 | 指定的文档路径无效 | 询问用户提供正确路径 | 0 |
| 文档格式错误 | 无法解析文档内容 | 尝试修复或询问用户 | 1 |
| DRD 验证失败 | 缺少必要章节 | 询问用户选择重新生成或补充 | 1 |
| 生成超时 | Writer Agent 超时 | 减小文档范围后重试 | 2 |
| 写入失败 | 无法保存 DRD 文件 | 检查权限后重试 | 1 |

### 处理实现

```javascript
async function handleDRDError(error, context) {
  switch (error.type) {
    case 'DOCUMENT_NOT_FOUND':
      return AskUserQuestion({
        question: `文档不存在: ${error.path}。请提供正确的文档路径。`,
        header: '文档错误',
        options: [
          { label: '提供新路径', description: '输入正确的文档路径' },
          { label: '跳过文档', description: '直接使用当前需求描述' },
          { label: '取消操作', description: '终止当前任务' }
        ]
      });

    case 'VALIDATION_FAILED':
      return AskUserQuestion({
        question: 'DRD 验证失败，缺少以下必要章节:\n' + error.missingSections.join('\n'),
        header: '验证失败',
        options: [
          { label: '重新生成', description: '调用 Writer Agent 重新生成 DRD' },
          { label: '手动补充', description: '保留现有内容，手动补充缺失章节' },
          { label: '继续使用', description: '忽略警告，继续使用当前 DRD' }
        ]
      });

    case 'GENERATION_TIMEOUT':
      // 减小范围重试
      return retryWithSmallerScope(context);

    default:
      return AskUserQuestion({
        question: `处理 DRD 时发生错误: ${error.message}`,
        header: '处理错误',
        options: [
          { label: '重试', description: '重新尝试操作' },
          { label: '取消', description: '终止当前任务' }
        ]
      });
  }
}
```

### 超时配置

| 操作 | 超时时间 | 说明 |
|-----|---------|------|
| 文档读取 | 30 秒 | 大文档读取 |
| DRD 验证 | 10 秒 | 快速验证 |
| DRD 生成 | 3 分钟 | Writer Agent 生成 |
| 文件写入 | 30 秒 | 保存文档 |

---

## 反模式

以下操作应避免：

- **跳过 DRD 直接编码** - 没有设计规范会导致代码不一致
- **使用不完整的 DRD** - 缺少关键章节会导致返工
- **忽略 DRD 验证** - 未验证的 DRD 可能包含错误
- **过度生成 DRD** - 简单项目不需要过于详细的 DRD
- **不更新过时的 DRD** - 需求变更时未同步更新 DRD

---

## 最佳实践

1. **始终验证 DRD** - 在开始编码前确保 DRD 完整有效
2. **保持 DRD 更新** - 需求变更时同步更新 DRD
3. **使用模板** - 遵循标准 DRD 模板结构
4. **适度详细** - 根据项目复杂度调整 DRD 详细程度
5. **版本控制** - DRD 应纳入版本控制并记录变更历史