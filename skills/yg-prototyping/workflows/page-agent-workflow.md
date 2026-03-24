# 页面Agent工作流

> 本工作流定义了页面Agent生成HTML片段的详细执行流程。

---

## 概述

页面Agent是由主控Agent启动的子Agent，负责：
- 接收文档片段和样式引用
- 解析页面结构和组件需求
- 生成符合规范的HTML片段
- 返回给主控Agent进行合并

---

## 输入规范

### 输入格式

页面Agent接收以下输入：

```json
{
  "chunk_id": "chunk_001",
  "chunk_index": 0,
  "document_fragment": "...文档片段内容...",
  "pages": ["用户列表", "用户详情", "用户表单"],
  "style_ref": "./styles.css",
  "style_classes": {
    "container": "page-container",
    "header": "page-header",
    "button": "btn btn-primary"
  },
  "cross_references": [
    { "from": "用户列表", "to": "用户详情", "type": "navigation" }
  ]
}
```

### 输入验证

```
必填项检查：
├── chunk_id ✓
├── document_fragment ✓
├── pages ✓
└── style_ref ✓
```

---

## 执行流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      页面Agent工作流                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  步骤1: 解析文档片段                                              │
│  ├── 识别页面边界                                                 │
│  ├── 提取页面元素                                                 │
│  └── 解析交互逻辑                                                 │
│       │                                                          │
│       ▼                                                          │
│  步骤2: 生成页面结构                                              │
│  ├── 确定页面类型                                                 │
│  ├── 选择布局模板                                                 │
│  └── 划分页面区块                                                 │
│       │                                                          │
│       ▼                                                          │
│  步骤3: 放置组件                                                  │
│  ├── 组件选型                                                     │
│  ├── 组件排列                                                     │
│  └── 状态设计                                                     │
│       │                                                          │
│       ▼                                                          │
│  步骤4: 添加交互标注                                              │
│  ├── 事件绑定                                                     │
│  ├── 导航链接                                                     │
│  └── 状态说明                                                     │
│       │                                                          │
│       ▼                                                          │
│  步骤5: 输出HTML片段                                              │
│  ├── 格式化HTML                                                   │
│  ├── 添加注释标注                                                 │
│  └── 返回给主控Agent                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 步骤详解

### 步骤1：解析文档片段

#### 1.1 识别页面边界

根据标题层级识别页面边界：

```javascript
function identifyPageBoundaries(fragment, expectedPages) {
  const boundaries = [];
  const lines = fragment.split('\n');

  let currentPage = null;
  let currentContent = [];

  for (const line of lines) {
    // 检测页面标题（## 或 ### 开头）
    const pageMatch = line.match(/^#{2,3}\s+(.+页面|.+界面|.+视图)/);
    if (pageMatch && expectedPages.includes(pageMatch[1])) {
      if (currentPage) {
        boundaries.push({ page: currentPage, content: currentContent.join('\n') });
      }
      currentPage = pageMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // 最后一页
  if (currentPage) {
    boundaries.push({ page: currentPage, content: currentContent.join('\n') });
  }

  return boundaries;
}
```

#### 1.2 提取页面元素

从每个页面内容中提取：

| 元素类型 | 提取方法 | 示例 |
|---------|---------|------|
| 表单字段 | 识别「输入」「选择」「必填」等关键词 | 用户名：输入框，必填 |
| 数据字段 | 识别表格列、数据项 | 用户名、手机号、状态 |
| 操作按钮 | 识别「按钮」「操作」等关键词 | 新增、编辑、删除、搜索 |
| 筛选条件 | 识别「筛选」「过滤」等关键词 | 状态筛选、时间范围 |

#### 1.3 解析交互逻辑

```javascript
function parseInteraction(pageContent) {
  const interactions = [];

  // 页面跳转
  const navPatterns = [
    /跳转到?(.+)页面?/,
    /进入(.+)页面?/,
    /点击.*跳转(.+)/
  ];

  // 弹窗交互
  const modalPatterns = [
    /弹出(.+)弹窗/,
    /显示(.+)对话框/,
    /打开(.+)模态框/
  ];

  // 表单提交
  const submitPatterns = [
    /提交.*到(.+)/,
    /保存.*到(.+)/,
    /更新(.+)/
  ];

  // 匹配并提取
  for (const pattern of [...navPatterns, ...modalPatterns, ...submitPatterns]) {
    const matches = pageContent.matchAll(new RegExp(pattern, 'g'));
    for (const match of matches) {
      interactions.push({
        trigger: 'click',
        action: 'navigation', // or 'modal', 'submit'
        target: match[1]
      });
    }
  }

  return interactions;
}
```

---

### 步骤2：生成页面结构

#### 2.1 确定页面类型

根据页面名称和内容特征判断类型：

| 类型 | 判断特征 | 布局模板 |
|-----|---------|---------|
| 列表页 | 包含「列表」「表格」「筛选」 | list-template |
| 详情页 | 包含「详情」「信息」「查看」 | detail-template |
| 表单页 | 包含「新增」「编辑」「表单」 | form-template |
| 仪表盘 | 包含「统计」「图表」「概览」 | dashboard-template |
| 设置页 | 包含「设置」「配置」「偏好」 | settings-template |

#### 2.2 布局模板

**列表页模板：**

```html
<section id="page-{id}" class="page-section" data-page="{pageName}">
  <!-- 页面标题区 -->
  <div class="page-header">
    <div>
      <h1 class="page-title">{pageTitle}</h1>
      <p class="page-subtitle">{pageSubtitle}</p>
    </div>
    <div class="page-actions">
      <!-- 主操作按钮 -->
    </div>
  </div>

  <!-- 筛选区 -->
  <div class="filter-bar">
    <!-- 筛选组件 -->
  </div>

  <!-- 内容区 -->
  <div class="content-area">
    <table class="data-table">
      <!-- 表格内容 -->
    </table>
  </div>

  <!-- 分页 -->
  <div class="pagination">
    <!-- 分页组件 -->
  </div>
</section>
```

**表单页模板：**

```html
<section id="page-{id}" class="page-section" data-page="{pageName}">
  <div class="page-header">
    <h1 class="page-title">{pageTitle}</h1>
  </div>

  <div class="content-area">
    <form class="form-container">
      <!-- 表单字段 -->
      <div class="form-group">
        <label class="form-label {required}">{label}</label>
        <input type="text" class="form-input" placeholder="{placeholder}">
      </div>

      <!-- 底部操作 -->
      <div class="footer-actions">
        <button class="btn btn-default" type="button">取消</button>
        <button class="btn btn-primary" type="submit">提交</button>
      </div>
    </form>
  </div>
</section>
```

**详情页模板：**

```html
<section id="page-{id}" class="page-section" data-page="{pageName}">
  <div class="page-header">
    <h1 class="page-title">{pageTitle}</h1>
    <div class="page-actions">
      <button class="btn btn-default">返回</button>
      <button class="btn btn-primary">编辑</button>
    </div>
  </div>

  <div class="content-area">
    <div class="detail-card card">
      <div class="card-header">
        <h3 class="card-title">基本信息</h3>
      </div>
      <div class="card-body">
        <div class="detail-row">
          <span class="detail-label">字段名</span>
          <span class="detail-value">{value}</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### 步骤3：放置组件

#### 3.1 组件选型映射

| 需求描述 | 组件类型 | CSS类名 |
|---------|---------|---------|
| 文本输入 | 输入框 | `form-input` |
| 选择项 | 下拉选择 | `form-select` |
| 多选项 | 复选框 | `form-checkbox` |
| 触发操作 | 按钮 | `btn btn-primary` / `btn-default` |
| 数据列表 | 表格 | `data-table` |
| 状态展示 | 标签 | `tag tag-{type}` |
| 分页 | 分页器 | `pagination` |

#### 3.2 组件生成规则

**输入框：**

```html
<div class="form-group">
  <label class="form-label {requiredClass}">{labelText}</label>
  <input type="{type}" class="form-input"
         placeholder="{placeholder}"
         {required}
         {disabled}>
</div>
```

**下拉选择：**

```html
<div class="form-group">
  <label class="form-label">{labelText}</label>
  <select class="form-select">
    <option value="">请选择</option>
    {#each options}
    <option value="{value}">{label}</option>
    {/each}
  </select>
</div>
```

**按钮组：**

```html
<div class="btn-group">
  <button class="btn btn-primary" onclick="navigateTo('{targetPage}')">
    {primaryAction}
  </button>
  <button class="btn btn-default" onclick="history.back()">
    取消
  </button>
</div>
```

**表格：**

```html
<table class="data-table">
  <thead>
    <tr>
      {#each columns}
      <th>{columnName}</th>
      {/each}
      <th>操作</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      {#each columns}
      <td>{sampleValue}</td>
      {/each}
      <td class="table-actions">
        <button class="btn btn-text" onclick="navigateTo('detail-{id}')">查看</button>
        <button class="btn btn-text" onclick="navigateTo('edit-{id}')">编辑</button>
        <button class="btn btn-text text-danger" onclick="confirmDelete()">删除</button>
      </td>
    </tr>
  </tbody>
</table>
```

---

### 步骤4：添加交互标注

#### 4.1 导航链接

使用 `navigateTo()` 函数实现页面跳转：

```html
<!-- 按钮跳转 -->
<button class="btn btn-primary" onclick="navigateTo('page-user-detail')">
  查看详情
</button>

<!-- 表格行跳转 -->
<tr onclick="navigateTo('page-user-detail')" style="cursor: pointer;">
  ...
</tr>
```

#### 4.2 弹窗交互

```html
<!-- 触发弹窗 -->
<button class="btn btn-primary" onclick="showModal('confirm-modal')">
  删除
</button>

<!-- 弹窗模板 -->
<div id="confirm-modal" class="modal" style="display: none;">
  <div class="modal-mask" onclick="hideModal('confirm-modal')"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h3>确认删除</h3>
    </div>
    <div class="modal-body">
      <p>确定要删除此记录吗？此操作不可恢复。</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-default" onclick="hideModal('confirm-modal')">取消</button>
      <button class="btn btn-danger">确认删除</button>
    </div>
  </div>
</div>
```

#### 4.3 表单交互

```html
<form id="form-{pageId}" onsubmit="handleSubmit(event, '{submitEndpoint}')">
  <!-- 表单字段 -->
  <div class="form-group">
    <label class="form-label required">用户名</label>
    <input type="text" class="form-input" name="username" required
           onblur="validateField(this, 'required')">
    <span class="form-error" id="error-username"></span>
  </div>

  <!-- 提交按钮 -->
  <div class="footer-actions">
    <button class="btn btn-default" type="button" onclick="resetForm()">重置</button>
    <button class="btn btn-primary" type="submit">提交</button>
  </div>
</form>

<script>
function handleSubmit(event, endpoint) {
  event.preventDefault();
  // 表单提交逻辑
  console.log('Submit to:', endpoint);
  navigateTo('list-page');
}
</script>
```

---

### 步骤5：输出HTML片段

#### 5.1 格式化要求

- 使用2空格缩进
- 每个页面使用 `<section>` 包裹
- 添加注释标注页面边界
- 保持HTML语义化

#### 5.2 输出格式

```html
<!-- ========== PAGE START: {页面名称} ========== -->
<section id="page-{pageId}" class="page-section" data-page="{pageName}">
  <!-- 页面内容 -->
</section>
<!-- ========== PAGE END: {页面名称} ========== -->
```

#### 5.3 返回给主控Agent

```json
{
  "chunk_id": "chunk_001",
  "status": "success",
  "pages": [
    {
      "name": "用户列表",
      "id": "page-user-list",
      "html": "<section id=\"page-user-list\">...</section>"
    },
    {
      "name": "用户详情",
      "id": "page-user-detail",
      "html": "<section id=\"page-user-detail\">...</section>"
    }
  ],
  "cross_references_handled": [
    { "from": "用户列表", "to": "用户详情", "implemented": true }
  ]
}
```

---

## 错误处理

### 输入验证失败

```json
{
  "status": "error",
  "error": "invalid_input",
  "message": "缺少必填字段：document_fragment",
  "required": ["chunk_id", "document_fragment", "pages", "style_ref"]
}
```

### 生成失败

```json
{
  "status": "error",
  "error": "generation_failed",
  "message": "无法识别页面边界，文档片段格式不规范",
  "partial_output": {
    "completed_pages": ["用户列表"],
    "failed_pages": ["用户详情"]
  }
}
```

### 超时处理

页面Agent应设置内部超时，避免无限运行：

```
单页面处理超时：60秒
整块处理超时：5分钟
```

---

## 样式使用规范

### 必须使用预定义类名

```html
<!-- 正确 ✅ -->
<button class="btn btn-primary">提交</button>

<!-- 错误 ❌ -->
<button style="background: blue; color: white; padding: 10px 20px;">提交</button>
```

### 特殊情况自定义样式

仅在预定义样式无法满足时使用内联样式：

```html
<!-- 特殊高度 -->
<div style="height: 400px;" class="content-area">
  ...
</div>
```

---

## 质量检查清单

输出前检查：

- [ ] 所有页面ID唯一
- [ ] 所有导航链接目标存在
- [ ] 样式类名正确引用
- [ ] HTML语法正确
- [ ] 注释标注完整
- [ ] 交互逻辑清晰