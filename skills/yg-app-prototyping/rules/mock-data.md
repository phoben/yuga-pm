# Mock 数据规则

本文档定义应用原型生成过程中的 Mock 数据策略、规范和生成标准。

---

## Mock 数据策略

### 两层 Mock 数据架构

| 层级 | 生成时机 | 内容范围 | 存储位置 |
|-----|---------|---------|---------|
| **全局 Mock** | 项目初始化阶段 | 通用基础数据 | `src/mock/global/` |
| **页面 Mock** | 页面开发阶段 | 页面专属数据 | `src/mock/pages/` |

### 全局 Mock 数据

在项目初始化阶段生成，供多个页面共享使用：

```
src/mock/global/
├── users.ts          # 用户数据
├── organizations.ts  # 组织架构
├── roles.ts          # 角色定义
├── permissions.ts    # 权限配置
├── config.ts         # 系统配置
└── index.ts          # 导出入口
```

**全局 Mock 数据类型：**

| 数据类型 | 说明 | 示例字段 |
|---------|------|---------|
| 用户数据 | 系统用户列表 | id, name, email, avatar, status, role |
| 组织架构 | 部门/团队结构 | id, name, parentId, members |
| 角色定义 | 用户角色 | id, name, permissions, description |
| 权限配置 | 权限列表 | id, code, name, resource |
| 系统配置 | 全局设置 | theme, language, features |

### 页面 Mock 数据

每个页面任务生成专属 Mock 数据：

```
src/mock/pages/
├── home.ts           # 首页数据
├── user-list.ts      # 用户列表页数据
├── user-detail.ts    # 用户详情页数据
├── dashboard.ts      # 仪表盘数据
└── index.ts          # 导出入口
```

**页面 Mock 生成规则：**

1. 每个页面 Mock 文件独立
2. 引用全局 Mock 数据建立关联
3. 包含页面特有的业务数据
4. 覆盖页面所需的所有数据场景

---

## Mock 数据规范

### 数据命名规范

```typescript
// 文件命名：kebab-case
// src/mock/pages/user-list.ts

// 数据导出：camelCase + Mock 后缀
export const userListMock = { ... };
export const userDetailMock = { ... };

// 类型定义：PascalCase
export interface UserListItem { ... }
export interface UserDetail { ... }
```

### 数据结构规范

```typescript
// 列表数据结构
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 示例
export const userListMock: PaginatedList<UserListItem> = {
  items: [...],
  total: 100,
  page: 1,
  pageSize: 20,
  hasMore: true,
};
```

### 数据类型规范

| 字段类型 | Mock 数据要求 | 示例 |
|---------|-------------|------|
| ID | 唯一字符串或数字 | `"user-001"`, `1001` |
| 名称 | 真实中文姓名 | `"张三"`, `"李明华"` |
| 邮箱 | 符合邮箱格式 | `"zhangsan@example.com"` |
| 手机号 | 11位中国手机号 | `"13800138000"` |
| 日期 | ISO 8601 格式 | `"2024-03-25T10:30:00Z"` |
| 金额 | 数字（分）或字符串 | `1999`, `"19.99"` |
| 状态 | 枚举值 + 显示文本 | `{ value: "active", label: "启用" }` |
| 图片 | 占位图 URL 或真实图片 | `"https://picsum.photos/200/200"` |

---

## 数据生成规范

### 假数据工具选择

| 场景 | 推荐工具 | 说明 |
|-----|---------|------|
| 中文姓名 | `@faker-js/faker` (zh_CN) | 支持中文本地化 |
| 英文数据 | `@faker-js/faker` | 原生支持 |
| 手机号 | 自定义函数 | 符合中国手机号规则 |
| 公司名 | 自定义词库 | 真实感更强 |
| 地址 | `@faker-js/faker` + 自定义 | 中文地址格式 |

### 数据生成示例

```typescript
// src/mock/generators.ts
import { faker } from '@faker-js/faker/locale/zh_CN';

// 生成随机用户
export function generateUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: generatePhone(),
    avatar: faker.image.avatar(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// 生成随机手机号
export function generatePhone(): string {
  const prefixes = ['138', '139', '186', '187', '150', '151', '177', '188'];
  const prefix = faker.helpers.arrayElement(prefixes);
  return prefix + faker.string.numeric(8);
}

// 批量生成
export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, () => generateUser());
}
```

### 业务逻辑遵循

Mock 数据应符合真实业务逻辑：

```typescript
// 正确：状态与数据一致
export const orderMock = {
  status: 'completed',
  completedAt: '2024-03-25T15:00:00Z', // 已完成订单有完成时间
  paidAt: '2024-03-25T14:00:00Z',      // 已完成订单必然已支付
};

// 错误：状态与数据矛盾
export const orderMockBad = {
  status: 'completed',
  completedAt: null,     // 已完成订单不应没有完成时间
  paidAt: null,          // 已完成订单不应未支付
};
```

---

## 边界情况覆盖

### 必须覆盖的边界情况

| 边界类型 | 说明 | 示例数据 |
|---------|------|---------|
| 空数据 | 空列表、空对象 | `{ items: [], total: 0 }` |
| 极长文本 | 超长名称、描述 | 500字符的名称 |
| 特殊字符 | 包含特殊字符的数据 | `<script>alert(1)</script>` |
| 边界数值 | 极大/极小/负数 | `-1`, `999999999`, `0` |
| 异常状态 | 错误、异常数据 | `status: 'error'` |
| 缺失字段 | 可选字段为空 | `{ name: null, email: '' }` |

### 边界数据示例

```typescript
// src/mock/edge-cases.ts

// 空状态数据
export const emptyListMock = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  hasMore: false,
};

// 极端数据
export const extremeValuesMock = {
  veryLongName: '这是一个非常非常非常非常非常非常长的名称用于测试文本溢出情况...',
  maxNumber: 999999999,
  minNumber: -999999,
  zeroValue: 0,
  emptyString: '',
  nullValue: null,
};

// 特殊字符数据（安全测试）
export const specialCharsMock = {
  htmlContent: '<script>alert("xss")</script>',
  sqlInjection: "'; DROP TABLE users; --",
  unicodeChars: '😀🎉🔥你好世界',
  whitespace: '   多余空格   ',
};

// 错误状态数据
export const errorStateMock = {
  status: 'error',
  errorCode: 'ERR_500',
  errorMessage: '服务器内部错误，请稍后重试',
};
```

### 页面状态覆盖

每个页面 Mock 应覆盖以下状态：

```typescript
// src/mock/pages/user-list-states.ts

// 正常状态
export const normalState = { ... };

// 加载状态
export const loadingState = {
  isLoading: true,
  items: [],
};

// 空状态
export const emptyState = {
  isLoading: false,
  items: [],
  total: 0,
};

// 错误状态
export const errorState = {
  isLoading: false,
  error: {
    code: 'NETWORK_ERROR',
    message: '网络连接失败，请检查网络设置',
  },
};

// 部分数据
export const partialState = {
  items: [...], // 部分数据
  hasMore: true,
  isLoadingMore: false,
};
```

---

## Mock 数据目录结构

```
src/mock/
├── global/                   # 全局 Mock 数据
│   ├── users.ts              # 用户数据
│   ├── organizations.ts      # 组织架构
│   ├── roles.ts              # 角色定义
│   ├── permissions.ts        # 权限配置
│   ├── config.ts             # 系统配置
│   └── index.ts              # 导出入口
│
├── pages/                    # 页面 Mock 数据
│   ├── home.ts               # 首页
│   ├── user-list.ts          # 用户列表
│   ├── user-detail.ts        # 用户详情
│   ├── dashboard.ts          # 仪表盘
│   └── index.ts              # 导出入口
│
├── edge-cases/               # 边界情况数据
│   ├── empty.ts              # 空数据
│   ├── errors.ts             # 错误数据
│   ├── extreme.ts            # 极端数据
│   └── index.ts              # 导出入口
│
├── generators/               # 数据生成器
│   ├── user.ts               # 用户生成器
│   ├── order.ts              # 订单生成器
│   └── index.ts              # 导出入口
│
├── types/                    # 类型定义
│   ├── user.ts               # 用户类型
│   ├── common.ts             # 通用类型
│   └── index.ts              # 导出入口
│
└── index.ts                  # 主导出入口
```

---

## 使用指南

### 在组件中使用 Mock 数据

```typescript
// 开发环境自动使用 Mock 数据
import { userListMock } from '@/mock';

export default function UserList() {
  const [users, setUsers] = useState(userListMock.items);

  // 模拟 API 调用
  useEffect(() => {
    // fetch('/api/users').then(res => res.json()).then(setUsers);
    // Mock: 直接使用 mock 数据
  }, []);

  return <UserTable data={users} />;
}
```

### 模拟 API 响应

```typescript
// src/lib/api-mock.ts
import { userListMock } from '@/mock';

export function mockApiDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchUsers(): Promise<PaginatedList<User>> {
  await mockApiDelay();
  return userListMock;
}
```

---

## 反模式

- ❌ 使用无意义的测试数据（如 "test1", "asdf"）
- ❌ 忽略边界情况覆盖
- ❌ 数据结构与真实 API 不一致
- ❌ 硬编码数据散落在组件中
- ❌ Mock 数据不符合业务逻辑
- ❌ 缺少类型定义
- ❌ 中文场景使用英文假数据

## 最佳实践

- ✅ 使用真实感强的中文假数据
- ✅ 建立可复用的数据生成器
- ✅ 统一管理 Mock 数据入口
- ✅ Mock 数据结构与真实 API 保持一致
- ✅ 完整的类型定义和注释
- ✅ 覆盖所有边界情况和状态