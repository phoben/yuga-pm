# Mermaid 图表语法参考

## 1. 图表类型选择

| 场景 | Mermaid 图表类型 |
|------|-----------------|
| 业务流程、决策流程 | `flowchart` |
| 接口调用、交互流程 | `sequenceDiagram` |
| 状态流转、生命周期 | `stateDiagram` |
| 数据模型、表关系 | `erDiagram` |
| 项目计划、时间线 | `gantt` |
| 知识结构、功能分解 | `mindmap` |

**注意：** 系统架构图、网络拓扑图使用 Canvas 原生绘制，不使用 Mermaid。

---

## 2. 流程图 (flowchart)

### 语法模板

```mermaid
flowchart TD
    A[开始] --> B[处理步骤]
    B --> C{判断条件?}
    C -->|是| D[分支A]
    C -->|否| E[分支B]
    D --> F[结束]
    E --> F
```

### 节点形状

| 语法 | 形状 | 示例 |
|------|------|------|
| `id[文字]` | 矩形 | `[处理步骤]` |
| `id(文字)` | 圆角矩形 | `(开始)` |
| `id{文字}` | 菱形 | `{判断?}` |
| `id[[文字]]` | 子程序 | `[[子流程]]` |
| `id[(文字)]` | 圆柱 | `[(数据库)]` |

### 连线类型

| 语法 | 效果 |
|------|------|
| `-->` | 实线箭头 |
| `---` | 实线无箭头 |
| `-.->` | 虚线箭头 |
| `==>` | 粗线箭头 |
| `--文字-->` | 带标签连线 |

---

## 3. 时序图 (sequenceDiagram)

### 语法模板

```mermaid
sequenceDiagram
    participant U as 用户
    participant W as Web前端
    participant A as API服务
    participant D as 数据库

    U->>W: 输入账号密码
    W->>A: POST /login
    A->>D: 查询用户信息
    D-->>A: 返回用户数据
    A-->>W: 返回 Token
    W-->>U: 显示首页
```

### 箭头类型

| 语法 | 效果 |
|------|------|
| `->>` | 实线箭头 |
| `-->>` | 虚线箭头 |
| `-) ` | 异步箭头 |
| `--x` | 失败返回 |

---

## 4. 状态图 (stateDiagram)

### 语法模板

```mermaid
stateDiagram-v2
    [*] --> 待支付
    待支付 --> 已支付: 支付成功
    待支付 --> 已取消: 取消订单
    已支付 --> 配送中: 发货
    配送中 --> 已完成: 签收
    已完成 --> [*]
    已取消 --> [*]
```

---

## 5. ER 图 (erDiagram)

### 语法模板

```mermaid
erDiagram
    USER ||--o{ ORDER : "下单"
    ORDER ||--|{ ORDER_ITEM : "包含"
    PRODUCT ||--o{ ORDER_ITEM : "被购买"

    USER {
        bigint id PK
        varchar username
        varchar email
        datetime created_at
    }

    ORDER {
        bigint id PK
        bigint user_id FK
        varchar status
        decimal total
    }

    PRODUCT {
        bigint id PK
        varchar name
        decimal price
        int stock
    }
```

### 关系符号

| 符号 | 关系 |
|------|------|
| `||--||` | 一对一 |
| `||--o{` | 一对多 |
| `}o--o{` | 多对多 |

---

## 6. 甘特图 (gantt)

### 语法模板

```mermaid
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 需求阶段
    需求调研     :a1, 2026-04-01, 14d
    需求评审     :a2, after a1, 5d
    section 开发阶段
    架构设计     :b1, after a2, 15d
    前端开发     :b2, after b1, 20d
    后端开发     :b3, after b1, 20d
    section 发布阶段
    UAT测试      :c1, after b2, 10d
    上线部署     :c2, after c1, 5d
```

---

## 7. 思维导图 (mindmap)

### 语法模板

```mermaid
mindmap
  root((电商平台))
    用户模块
      注册登录
      个人中心
      地址管理
    商品模块
      商品列表
      商品详情
      搜索筛选
    订单模块
      购物车
      下单支付
      订单跟踪
```

---

## 8. Canvas 原生绘制场景

当以下场景不适合 Mermaid 时，使用 Canvas 原生绘制：

| 场景 | 原因 |
|------|------|
| 系统架构图 | 需要精确控制节点位置、分组、连接样式 |
| 网络拓扑图 | 需要自定义图标、复杂的连接关系 |
| 蓝图设计 | 需要精确的尺寸和比例 |

### Canvas 模板

```html
<div class="canvas-blueprint">
  <span class="canvas-blueprint-title">系统架构图</span>
  <canvas id="blueprint-1"></canvas>
</div>

<script>
(function() {
  const canvas = document.getElementById('blueprint-1');
  const ctx = canvas.getContext('2d');
  // 设置画布尺寸
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = 400;

  // 绘制逻辑
  // ... 自定义绘制代码

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    canvas.width = canvas.parentElement.offsetWidth;
    // 重绘
  });
})();
</script>
```

---

## 9. 禁止事项

- ❌ 使用 `<pre>` 包裹 Mermaid 代码
- ❌ 保留 ASCII 字符图表
- ❌ 为简单图表使用 Canvas（优先 Mermaid）

## 10. 推荐做法

- ✅ 使用 `<div class="diagram-container"><pre class="mermaid">` 包裹 Mermaid 代码
- ✅ 为架构图使用 Canvas 原生绘制
- ✅ 保持图表简洁，避免过度复杂