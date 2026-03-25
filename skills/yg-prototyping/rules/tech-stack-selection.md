# 技术栈选择规则

本文档定义如何为应用原型选择合适的技术栈。

---

## 技术栈决策矩阵

| 项目类型 | 推荐技术栈 | 备选方案 | 选择理由 |
|---------|-----------|---------|---------|
| Web 后台管理系统 | React + Element UI | Vue + Element Plus | 组件丰富，表单处理强 |
| 营销/官网 | Next.js + shadcn/ui | - | SEO 友好，现代体验 |
| 移动端 H5 | React + Ant Design Mobile | - | 移动端优化 |
| 小程序 | Taro + Ant Design Mini | - | 跨端支持 |
| 简单原型 | Next.js + shadcn/ui | HTML + CSS | 快速搭建 |

---

## 技术栈详解

### Next.js + shadcn/ui

**适用场景:**
- 官网、营销页
- SEO 要求高的项目
- 现代化 UI 体验

**技术组件:**
- 框架: Next.js 14 (App Router)
- UI 库: shadcn/ui (基于 Radix UI)
- 样式: Tailwind CSS
- 状态: Zustand (可选)

**环境要求:**
- Node.js >= 18
- pnpm >= 8 (推荐)

### React + Element UI

**适用场景:**
- 后台管理系统
- 企业级应用
- 复杂表单场景

**技术组件:**
- 框架: React 18
- UI 库: Element Plus
- 构建: Vite
- 路由: React Router
- 状态: Zustand

### Vue + Element Plus

**适用场景:**
- Vue 技术栈后台
- 企业级应用

**技术组件:**
- 框架: Vue 3 (Composition API)
- UI 库: Element Plus
- 构建: Vite
- 路由: Vue Router
- 状态: Pinia

### Taro (小程序)

**适用场景:**
- 微信/支付宝/字节小程序
- 跨端小程序需求

**技术组件:**
- 框架: Taro 3
- UI 库: Ant Design Mini
- 状态: Taro 自带 / Zustand

---

## 选择流程

```
开始
  │
  ├── 检查 DRD 是否指定技术栈
  │     ├── 是 → 使用 AskUserQuestion 确认
  │     └── 否 → 继续
  │
  ├── 确定项目类型
  │     ├── 后台管理 → React + Element UI
  │     ├── 营销官网 → Next.js + shadcn/ui
  │     ├── 移动 H5 → React + Ant Design Mobile
  │     └── 小程序 → Taro
  │
  └── 使用 AskUserQuestion 确认选择
```

---

## AskUserQuestion 示例

```json
{
  "questions": [{
    "question": "请选择原型技术栈：",
    "header": "技术栈",
    "multiSelect": false,
    "options": [
      { "label": "Next.js + shadcn/ui (推荐)", "description": "现代全栈方案，SEO友好" },
      { "label": "React + Element UI", "description": "后台管理系统首选" },
      { "label": "Vue + Element Plus", "description": "Vue 生态后台方案" },
      { "label": "Taro (小程序)", "description": "跨端小程序方案" }
    ]
  }]
}
```

---

## 反模式

- 假设技术栈不确认
- 使用静态 HTML 技术栈处理复杂应用
- 忽略用户的团队技术栈偏好
- 不考虑项目的 SEO 需求