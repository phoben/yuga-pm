# yg-diagram Canvas 图表规范设计文档

## 1. 概述

### 1.1 设计目标

为 `yg-visualize-shadcn` 技能提供一套基于 Canvas 的图表渲染规范，解决当前 HTML/CSS 方案的问题：

- **视觉效果不够精美** — 节点样式、连接线、动画效果不够专业
- **表达能力受限** — 时序图、状态图、蓝图等复杂图表难以实现

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| 声明式 API | Agent 只需描述「画什么」，不关心「怎么画」 |
| 图表级抽象 | Agent 只需描述节点和连接，布局算法自动计算位置 |
| 类型全覆盖 | 支持 8 种常用图表类型 |
| 基础交互 | 内置 hover 高亮、点击详情、缩放平移 |

### 1.3 技术选型

**方案：Konva.js 封装层**

```
Agent 生成 JSON 配置 → yg-diagram 封装层 → Konva.js → Canvas
```

选型理由：
- 成熟库，内置交互、动画、事件系统
- 支持导出图片（PNG/SVG）
- Agent 学习成本低，只需声明式 JSON

---

## 2. 通用配置结构

### 2.1 基础字段

```typescript
// 图表类型枚举
type DiagramType =
  | 'flowchart'      // 流程图
  | 'architecture'   // 架构图
  | 'sequence'       // 时序图
  | 'statechart'     // 状态图
  | 'er-diagram'     // ER 图
  | 'gantt'          // 甘特图
  | 'mindmap'        // 思维导图
  | 'network';       // 网络拓扑图

// 主题类型枚举
type ThemeType = 'light' | 'dark' | 'minimal' | 'colorful';

interface DiagramConfig {
  type: DiagramType;           // 图表类型
  title?: string;              // 图表标题
  theme?: ThemeType;           // 主题样式（默认 'light'）
  interactive?: InteractiveConfig;  // 交互配置
}
```

**连线字段命名约定：**

不同图表类型使用语义化的连线字段名，便于 Agent 理解：

| 图表类型 | 连线字段 | 说明 |
|---------|---------|------|
| flowchart | `edges` | 流程边 |
| architecture | `connections` | 服务连接 |
| sequence | `messages` | 消息传递 |
| statechart | `transitions` | 状态转换 |
| er-diagram | `relations` | 实体关系 |
| network | `connections` | 网络连接 |

所有连线结构均包含 `from`、`to`、`label`（可选）字段。

### 2.2 主题系统

| theme 值 | 背景 | 节点风格 | 适用场景 |
|---------|------|---------|---------|
| `light` | 白色 | 彩色边框/填充 | 默认，嵌入文档 |
| `dark` | 深色 | 高对比彩色 | 深色模式文档 |
| `minimal` | 白色 | 灰色线条 | 打印/正式文档 |
| `colorful` | 白色 | 渐变填充 | 演示/汇报 |

### 2.3 颜色变量

```css
/* 节点颜色映射 */
--node-primary: #3b82f6;      /* 主要节点 - 蓝 */
--node-secondary: #8b5cf6;    /* 次要节点 - 紫 */
--node-success: #10b981;      /* 成功/开始 - 绿 */
--node-warning: #f59e0b;      /* 警告/判断 - 橙 */
--node-danger: #ef4444;       /* 危险/结束 - 红 */
--node-info: #06b6d4;         /* 信息 - 青 */
--node-neutral: #64748b;      /* 中性 - 灰 */

/* 连线颜色 */
--edge-default: #94a3b8;
--edge-highlight: #3b82f6;
--edge-data: #10b981;
```

**主题与颜色联动：**

| 主题 | 背景色 | 节点颜色策略 | 文字颜色 |
|------|--------|-------------|---------|
| `light` | `#ffffff` | 使用上述颜色变量原值 | `#1e293b` |
| `dark` | `#1e293b` | 颜色变量亮度降低 15% | `#f1f5f9` |
| `minimal` | `#ffffff` | 仅使用 `--node-neutral` 灰度 | `#334155` |
| `colorful` | `#ffffff` | 节点使用渐变填充 | `#1e293b` |

### 2.4 字体规范

| 元素 | 字号 | 字重 |
|------|------|------|
| 标题 | 16px | 600 |
| 节点标签 | 14px | 500 |
| 边标签 | 12px | 400 |
| 字段名 | 12px | 500 |
| 字段类型 | 11px | 400 |

### 2.5 交互配置

```typescript
interface InteractiveConfig {
  zoomable?: boolean;        // 允许缩放（默认 true）
  pannable?: boolean;        // 允许平移（默认 true）
  hoverHighlight?: boolean;  // hover 高亮（默认 true）
  clickPopover?: boolean;    // 点击弹出详情（默认 true）
}
```

---

## 3. 图表类型规范

### 3.1 流程图 (flowchart)

#### 节点类型

| type 值 | 形状 | 用途 | 颜色 |
|--------|------|------|------|
| `terminal` | 圆角胶囊 | 开始/结束 | 绿色(开始) / 红色(结束) |
| `process` | 矩形 | 处理步骤 | 蓝色边框 |
| `decision` | 菱形 | 判断/条件 | 橙色边框 |
| `io` | 平行四边形 | 输入/输出 | 紫色边框 |
| `subprocess` | 双边框矩形 | 子流程 | 蓝色填充 |

#### 连线类型

| routing 值 | 效果 | 适用场景 |
|-----------|------|---------|
| `orthogonal` | 正交折线（默认） | 流程图 |
| `straight` | 直线 | 简单连接 |
| `curve` | 贝塞尔曲线 | 跨越连接 |

#### 配置示例

```json
{
  "type": "flowchart",
  "title": "订单处理流程",
  "nodes": [
    {"id": "start", "label": "开始", "type": "terminal"},
    {"id": "input", "label": "接收订单", "type": "io"},
    {"id": "check", "label": "库存充足?", "type": "decision"},
    {"id": "process", "label": "处理订单", "type": "process"},
    {"id": "reject", "label": "拒绝订单", "type": "process"},
    {"id": "end", "label": "结束", "type": "terminal"}
  ],
  "edges": [
    {"from": "start", "to": "input"},
    {"from": "input", "to": "check"},
    {"from": "check", "to": "process", "label": "是"},
    {"from": "check", "to": "reject", "label": "否"},
    {"from": "process", "to": "end"},
    {"from": "reject", "to": "end"}
  ]
}
```

---

### 3.2 架构图 (architecture)

#### 节点类型

| type 值 | 颜色 | 用途 | 默认图标 |
|--------|------|------|---------|
| `primary` | 蓝色渐变 | 核心服务 | `server` |
| `secondary` | 紫色渐变 | 辅助服务 | `shield` |
| `database` | 绿色渐变 | 数据存储 | `database` |
| `cache` | 橙色渐变 | 缓存层 | `zap` |
| `external` | 灰色渐变 | 外部服务 | `cloud` |
| `client` | 青色渐变 | 客户端 | `monitor` |
| `queue` | 黄色渐变 | 消息队列 | `list` |

#### 可用图标列表

架构图节点支持 `icon` 字段，使用 Lucide 图标库。常用图标：

| 分类 | 图标名称 |
|------|---------|
| **服务端** | `server`, `cpu`, `hard-drive`, `database` |
| **客户端** | `monitor`, `smartphone`, `tablet`, `laptop` |
| **网络** | `globe`, `cloud`, `wifi`, `shield` |
| **数据** | `database`, `file-text`, `archive`, `folder` |
| **安全** | `shield`, `lock`, `key`, `eye` |
| **消息** | `mail`, `message-square`, `send`, `bell` |
| **流程** | `zap`, `git-branch`, `layers`, `workflow` |
| **通用** | `settings`, `tool`, `package`, `box` |

#### 配置示例

```json
{
  "type": "architecture",
  "title": "微服务架构",
  "layers": [
    {
      "id": "client",
      "label": "客户端层",
      "nodes": [
        {"id": "web", "label": "Web 应用", "type": "client", "icon": "monitor"},
        {"id": "mobile", "label": "移动端", "type": "client", "icon": "smartphone"}
      ]
    },
    {
      "id": "gateway",
      "label": "网关层",
      "nodes": [
        {"id": "api", "label": "API Gateway", "type": "primary", "icon": "shield"}
      ]
    },
    {
      "id": "service",
      "label": "服务层",
      "nodes": [
        {"id": "user", "label": "用户服务", "type": "primary"},
        {"id": "order", "label": "订单服务", "type": "primary"},
        {"id": "payment", "label": "支付服务", "type": "primary"}
      ]
    },
    {
      "id": "data",
      "label": "数据层",
      "nodes": [
        {"id": "mysql", "label": "MySQL", "type": "database"},
        {"id": "redis", "label": "Redis", "type": "cache"}
      ]
    }
  ],
  "connections": [
    {"from": "web", "to": "api"},
    {"from": "mobile", "to": "api"},
    {"from": "api", "to": "user"},
    {"from": "api", "to": "order"},
    {"from": "user", "to": "mysql"},
    {"from": "order", "to": "mysql"},
    {"from": "order", "to": "redis"}
  ]
}
```

---

### 3.3 时序图 (sequence)

#### 参与者类型

| type 值 | 用途 | 渲染效果 |
|--------|------|---------|
| `actor` | 参与者（人） | 火柴人图标 |
| `participant` | 参与者（系统） | 矩形框 |
| `boundary` | 系统边界 | 带边框的参与者 |

#### 消息类型

| type 值 | 用途 | 箭头样式 |
|--------|------|---------|
| `sync` | 同步调用 | 实心箭头 `→` |
| `async` | 异步调用 | 开放箭头 `⇢` |
| `return` | 返回 | 虚线箭头 `⤶` |
| `self` | 自调用 | 回环箭头 |

#### 配置示例

```json
{
  "type": "sequence",
  "title": "用户登录时序",
  "participants": [
    {"id": "user", "label": "用户", "type": "actor"},
    {"id": "web", "label": "Web 前端", "type": "participant"},
    {"id": "api", "label": "API 服务", "type": "participant"},
    {"id": "db", "label": "数据库", "type": "participant"}
  ],
  "messages": [
    {"from": "user", "to": "web", "label": "输入账号密码", "type": "sync"},
    {"from": "web", "to": "api", "label": "POST /login", "type": "sync"},
    {"from": "api", "to": "db", "label": "查询用户信息", "type": "sync"},
    {"from": "db", "to": "api", "label": "返回用户数据", "type": "return"},
    {"from": "api", "to": "api", "label": "验证密码", "type": "self"},
    {"from": "api", "to": "web", "label": "返回 Token", "type": "return"},
    {"from": "web", "to": "user", "label": "显示首页", "type": "return"}
  ],
  "notes": [
    {"position": "left", "participant": "api", "label": "密码加密验证"}
  ]
}
```

#### 注释 (notes) 字段

| 字段 | 用途 |
|------|------|
| `position` | 位置：`left` / `right` / `over` |
| `participant` | 关联的参与者 ID（over 时可传数组） |
| `label` | 注释文字 |

#### 分组框

支持 `alt`/`loop`/`opt`/`par` 等逻辑分组：

```json
{
  "groups": [
    {
      "type": "alt",
      "label": "验证结果",
      "participants": ["api"],
      "branches": [
        {"label": "成功", "messages": [...]},
        {"label": "失败", "messages": [...]}
      ]
    }
  ]
}
```

---

### 3.4 状态图 (statechart)

#### 节点类型

| type 值 | 形状 | 用途 |
|--------|------|------|
| `initial` | 实心圆点 | 初始状态 |
| `final` | 双圈圆点 | 终止状态 |
| `state` | 圆角矩形 | 普通状态 |
| `composite` | 嵌套圆角矩形 | 复合状态（含子状态） |
| `choice` | 菱形 | 选择分支 |
| `history` | 圆圈+H | 历史状态 |

#### 转换属性

| 字段 | 用途 |
|------|------|
| `trigger` | 触发事件 |
| `guard` | 守卫条件 |
| `action` | 执行动作 |

#### 配置示例

**基础示例：**

```json
{
  "type": "statechart",
  "title": "订单状态流转",
  "states": [
    {"id": "init", "type": "initial"},
    {"id": "pending", "label": "待支付", "type": "state"},
    {"id": "paid", "label": "已支付", "type": "state"},
    {"id": "shipping", "label": "配送中", "type": "state"},
    {"id": "completed", "label": "已完成", "type": "state"},
    {"id": "cancelled", "label": "已取消", "type": "state"},
    {"id": "end", "type": "final"}
  ],
  "transitions": [
    {"from": "init", "to": "pending", "trigger": "创建订单"},
    {"from": "pending", "to": "paid", "trigger": "支付成功"},
    {"from": "pending", "to": "cancelled", "trigger": "取消订单", "guard": "未支付"},
    {"from": "paid", "to": "shipping", "trigger": "发货"},
    {"from": "shipping", "to": "completed", "trigger": "签收"},
    {"from": "completed", "to": "end"},
    {"from": "cancelled", "to": "end"}
  ]
}
```

**复合状态示例：**

```json
{
  "type": "statechart",
  "title": "用户会话状态",
  "states": [
    {"id": "init", "type": "initial"},
    {
      "id": "active",
      "label": "活动状态",
      "type": "composite",
      "children": [
        {"id": "active.idle", "label": "空闲", "type": "state"},
        {"id": "active.processing", "label": "处理中", "type": "state"},
        {"id": "active.waiting", "label": "等待响应", "type": "state"}
      ]
    },
    {"id": "inactive", "label": "非活动", "type": "state"},
    {"id": "end", "type": "final"}
  ],
  "transitions": [
    {"from": "init", "to": "active.idle", "trigger": "登录"},
    {"from": "active.idle", "to": "active.processing", "trigger": "发起请求"},
    {"from": "active.processing", "to": "active.waiting", "trigger": "等待确认"},
    {"from": "active.waiting", "to": "active.idle", "trigger": "确认完成"},
    {"from": "active", "to": "inactive", "trigger": "超时", "guard": "无操作 30 分钟"},
    {"from": "inactive", "to": "active.idle", "trigger": "恢复"},
    {"from": "inactive", "to": "end", "trigger": "登出"}
  ]
}
```

---

### 3.5 ER 图 (er-diagram)

#### 实体类型

| type 值 | 用途 | 渲染效果 |
|--------|------|---------|
| `entity` | 实体表 | 矩形框，含字段列表 |
| `weak` | 弱实体 | 双边框矩形 |

#### 字段定义

| 字段 | 用途 |
|------|------|
| `name` | 字段名 |
| `dataType` | 数据类型（如 BIGINT, VARCHAR(50)） |
| `pk` | 是否主键 |
| `fk` | 外键引用（格式：`实体.字段`） |
| `nullable` | 是否可空 |

#### 关系类型

| type 值 | 用途 | 连线符号 |
|--------|------|---------|
| `one-one` | 一对一 | `1 ── 1` |
| `one-many` | 一对多 | `1 ── n` |
| `many-many` | 多对多 | `n ── n` |
| `many-one` | 多对一 | `n ── 1` |

#### 配置示例

```json
{
  "type": "er-diagram",
  "title": "电商数据模型",
  "entities": [
    {
      "id": "user",
      "label": "用户",
      "type": "entity",
      "fields": [
        {"name": "id", "dataType": "BIGINT", "pk": true},
        {"name": "username", "dataType": "VARCHAR(50)"},
        {"name": "email", "dataType": "VARCHAR(100)"},
        {"name": "created_at", "dataType": "DATETIME"}
      ]
    },
    {
      "id": "order",
      "label": "订单",
      "type": "entity",
      "fields": [
        {"name": "id", "dataType": "BIGINT", "pk": true},
        {"name": "user_id", "dataType": "BIGINT", "fk": "user.id"},
        {"name": "status", "dataType": "VARCHAR(20)"},
        {"name": "total", "dataType": "DECIMAL(10,2)"}
      ]
    },
    {
      "id": "product",
      "label": "商品",
      "type": "entity",
      "fields": [
        {"name": "id", "dataType": "BIGINT", "pk": true},
        {"name": "name", "dataType": "VARCHAR(200)"},
        {"name": "price", "dataType": "DECIMAL(10,2)"},
        {"name": "stock", "dataType": "INT"}
      ]
    }
  ],
  "relations": [
    {"from": "user", "to": "order", "type": "one-many", "label": "下单"},
    {"from": "order", "to": "product", "type": "many-many", "label": "包含"}
  ]
}
```

---

### 3.6 甘特图 (gantt)

#### 任务定义

| 字段 | 用途 |
|------|------|
| `id` | 任务唯一标识 |
| `label` | 任务名称 |
| `start` | 开始日期 |
| `end` | 结束日期 |
| `progress` | 完成进度 (0-100) |
| `assignee` | 负责人 |
| `dependencies` | 前置任务 ID 列表 |

#### 配置示例

```json
{
  "type": "gantt",
  "title": "项目开发计划",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "groups": [
    {
      "id": "phase1",
      "label": "需求阶段",
      "tasks": [
        {"id": "t1", "label": "需求调研", "start": "2026-04-01", "end": "2026-04-15", "assignee": "PM"},
        {"id": "t2", "label": "需求评审", "start": "2026-04-16", "end": "2026-04-20", "dependencies": ["t1"]}
      ]
    },
    {
      "id": "phase2",
      "label": "开发阶段",
      "tasks": [
        {"id": "t3", "label": "架构设计", "start": "2026-04-21", "end": "2026-05-05", "dependencies": ["t2"]},
        {"id": "t4", "label": "前端开发", "start": "2026-05-06", "end": "2026-05-25", "progress": 30, "assignee": "前端组"},
        {"id": "t5", "label": "后端开发", "start": "2026-05-06", "end": "2026-05-25", "dependencies": ["t3"]},
        {"id": "t6", "label": "联调测试", "start": "2026-05-26", "end": "2026-06-10", "dependencies": ["t4", "t5"]}
      ]
    },
    {
      "id": "phase3",
      "label": "发布阶段",
      "tasks": [
        {"id": "t7", "label": "UAT 测试", "start": "2026-06-11", "end": "2026-06-20", "dependencies": ["t6"]},
        {"id": "t8", "label": "上线部署", "start": "2026-06-21", "end": "2026-06-25", "dependencies": ["t7"]}
      ]
    }
  ],
  "milestones": [
    {"id": "m1", "label": "需求确认", "date": "2026-04-20"},
    {"id": "m2", "label": "开发完成", "date": "2026-05-25"},
    {"id": "m3", "label": "正式上线", "date": "2026-06-25"}
  ]
}
```

#### 渲染特性

- **进度条**：已完成部分用深色填充
- **依赖线**：前置任务用箭头连接
- **里程碑**：菱形标记关键节点
- **今日线**：红色虚线标记当前日期

---

### 3.7 思维导图 (mindmap)

#### 节点样式

| level | 样式 |
|-------|------|
| 0 (根节点) | 大号字体，强调色背景 |
| 1 | 中号字体，主色边框 |
| 2+ | 常规字体，次色边框 |

#### 布局方向

| layout 值 | 效果 |
|----------|------|
| `right` | 向右展开（默认） |
| `left` | 向左展开 |
| `both` | 左右对称展开 |
| `tree` | 向下树形展开 |

#### 配置示例

```json
{
  "type": "mindmap",
  "title": "产品功能规划",
  "layout": "right",
  "root": {
    "id": "root",
    "label": "电商平台",
    "children": [
      {
        "id": "c1",
        "label": "用户模块",
        "children": [
          {"id": "c1-1", "label": "注册登录"},
          {"id": "c1-2", "label": "个人中心"},
          {"id": "c1-3", "label": "地址管理"}
        ]
      },
      {
        "id": "c2",
        "label": "商品模块",
        "children": [
          {"id": "c2-1", "label": "商品列表"},
          {"id": "c2-2", "label": "商品详情"},
          {"id": "c2-3", "label": "搜索筛选"}
        ]
      },
      {
        "id": "c3",
        "label": "订单模块",
        "children": [
          {"id": "c3-1", "label": "购物车"},
          {"id": "c3-2", "label": "下单支付"},
          {"id": "c3-3", "label": "订单跟踪"}
        ]
      },
      {
        "id": "c4",
        "label": "运营模块",
        "children": [
          {"id": "c4-1", "label": "促销活动"},
          {"id": "c4-2", "label": "优惠券"}
        ]
      }
    ]
  }
}
```

---

### 3.8 网络拓扑图 (network)

#### 节点类型

| type 值 | 图标 | 用途 |
|--------|------|------|
| `server` | 服务器图标 | 物理服务器/虚拟机 |
| `cloud` | 云图标 | 云服务/外部服务 |
| `database` | 数据库图标 | 数据库实例 |
| `firewall` | 防火墙图标 | 安全设备 |
| `loadbalancer` | 负载均衡图标 | LB 实例 |
| `router` | 路由器图标 | 网络设备 |
| `container` | 容器图标 | Docker/K8s Pod |
| `storage` | 存储图标 | 存储服务 |

#### 连接类型

| type 值 | 用途 | 线型 |
|--------|------|------|
| `network` | 网络连接 | 实线 |
| `data` | 数据流向 | 虚线箭头 |
| `dependency` | 依赖关系 | 点线 |

#### 配置示例

```json
{
  "type": "network",
  "title": "生产环境部署架构",
  "nodes": [
    {"id": "internet", "label": "Internet", "type": "cloud", "x": 400, "y": 50},
    {"id": "fw", "label": "防火墙", "type": "firewall", "x": 400, "y": 150},
    {"id": "lb", "label": "负载均衡", "type": "loadbalancer", "x": 400, "y": 250},
    {"id": "web1", "label": "Web-01", "type": "server", "x": 250, "y": 350},
    {"id": "web2", "label": "Web-02", "type": "server", "x": 550, "y": 350},
    {"id": "app1", "label": "App-01", "type": "container", "x": 250, "y": 450},
    {"id": "app2", "label": "App-02", "type": "container", "x": 550, "y": 450},
    {"id": "cache", "label": "Redis 集群", "type": "database", "x": 400, "y": 550},
    {"id": "db", "label": "MySQL 主从", "type": "database", "x": 400, "y": 650},
    {"id": "storage", "label": "对象存储", "type": "storage", "x": 600, "y": 650}
  ],
  "connections": [
    {"from": "internet", "to": "fw", "type": "network"},
    {"from": "fw", "to": "lb", "type": "network"},
    {"from": "lb", "to": "web1", "type": "network"},
    {"from": "lb", "to": "web2", "type": "network"},
    {"from": "web1", "to": "app1", "type": "data"},
    {"from": "web2", "to": "app2", "type": "data"},
    {"from": "app1", "to": "cache", "type": "data"},
    {"from": "app2", "to": "cache", "type": "data"},
    {"from": "cache", "to": "db", "type": "data"},
    {"from": "app1", "to": "storage", "type": "data"}
  ],
  "groups": [
    {"id": "dmz", "label": "DMZ 区", "nodes": ["lb", "web1", "web2"]},
    {"id": "internal", "label": "内网区", "nodes": ["app1", "app2", "cache", "db"]}
  ]
}
```

---

## 4. 交互功能

### 4.1 缩放与平移

| 操作 | 效果 |
|------|------|
| 鼠标滚轮 | 缩放（以鼠标位置为中心） |
| 拖拽空白区域 | 平移画布 |
| 双击画布 | 重置视图（适配窗口） |
| 双指捏合（触屏） | 缩放 |

### 4.2 节点交互

| 操作 | 效果 |
|------|------|
| Hover 节点 | 高亮节点 + 关联连线 |
| 点击节点 | 显示详情 Popover |
| Hover 连线 | 高亮连线 + 显示标签 |

### 4.3 Popover 内容结构

节点支持 `popover` 字段，点击节点时显示详情：

```json
{
  "id": "user-service",
  "label": "用户服务",
  "type": "primary",
  "popover": {
    "title": "用户服务",
    "description": "负责用户认证与授权管理",
    "metadata": {
      "端口": "8080",
      "状态": "运行中",
      "实例数": "3"
    }
  }
}
```

**Popover 字段说明：**

| 字段 | 用途 |
|------|------|
| `title` | 弹窗标题（可选，默认使用节点 label） |
| `description` | 描述文字 |
| `metadata` | 键值对元数据，显示为标签列表 |

---

## 5. HTML 集成方案

### 5.1 依赖引入

```html
<script src="https://unpkg.com/konva@9/konva.min.js"></script>
<script src="https://unpkg.com/dagre@0.8.5/dist/dagre.min.js"></script>
```

### 5.2 渲染模板

```html
<!-- 图表容器 -->
<div id="diagram-container" style="width: 100%; min-height: 400px;"></div>

<!-- 图表配置（Agent 生成） -->
<script id="diagram-config" type="application/json">
{
  "type": "flowchart",
  "title": "用户登录流程",
  "nodes": [...],
  "edges": [...]
}
</script>

<!-- 渲染初始化 -->
<script>
const config = JSON.parse(document.getElementById('diagram-config').textContent);
const container = document.getElementById('diagram-container');
YGDiagram.render(container, config);
</script>
```

---

## 6. Agent 使用指南

### 6.1 图表类型选择

| 场景 | 推荐图表类型 |
|------|-------------|
| 业务流程、决策流程 | `flowchart` |
| 系统架构、分层架构 | `architecture` |
| 接口调用、交互流程 | `sequence` |
| 状态流转、生命周期 | `statechart` |
| 数据模型、表关系 | `er-diagram` |
| 项目计划、时间线 | `gantt` |
| 知识结构、功能分解 | `mindmap` |
| 部署架构、网络结构 | `network` |

### 6.2 生成流程

```
1. 分析文档内容，识别图表需求
2. 选择合适的图表类型
3. 参考本文档相应章节的规范
4. 生成符合规范的 JSON 配置
5. 使用 HTML 模板嵌入页面
```

### 6.3 注意事项

- 确保所有节点 `id` 唯一
- `edges` 中的 `from`/`to` 必须引用已定义的节点 `id`
- 复杂图表建议拆分为多个简单图表
- 节点标签控制在 20 字符以内

---

## 7. 文件结构

```
skills/yg-visualize-shadcn/
├── references/
│   ├── diagram-conversion.md      # 旧版（保留兼容）
│   └── yg-diagram-spec.md         # 新版 Canvas 规范
└── scripts/
    └── yg-diagram/                # 渲染引擎（可选）
        ├── core.js                # 核心渲染逻辑
        └── layouts/               # 布局算法
```

---

## 8. 后续工作

1. 实现 `yg-diagram` 渲染引擎（基于 Konva.js）
2. 更新 `fill-section.md` Agent 规范，引用新规范
3. 添加图表预览/测试页面
4. 编写 Agent 使用示例