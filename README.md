# 企业内部移动办公助手

一个基于 React + Tailwind CSS 构建的移动端企业办公助手应用，支持员工管理、设备分类管理和设备管理三大核心功能模块。

## 功能特点

- ✅ **JWT 认证登录** - 基于 JWT 的用户认证系统
- ✅ **员工管理** - 完整的员工增删改查功能
- ✅ **设备分类管理** - 设备分类的创建、编辑、删除和查看
- ✅ **设备管理** - 设备信息管理和分类筛选功能
- ✅ **移动端适配** - 375px 宽度移动端优化界面
- ✅ **表单校验** - 基于 react-hook-form 的完整表单验证
- ✅ **Toast 提示** - 操作反馈和错误提示
- ✅ **确认对话框** - 删除操作的二次确认
- ✅ **Mock API** - 完整的 Mock 数据和 API 接口

## 技术栈

- **前端框架**: React 18.3.1
- **样式方案**: Tailwind CSS 4.1.12
- **UI 组件**: Radix UI
- **表单管理**: React Hook Form 7.55.0
- **通知提示**: Sonner
- **图标库**: Lucide React
- **构建工具**: Vite 6.3.5

## 项目结构

```
src/
├── app/
│   ├── components/
│   │   ├── LoginPage.tsx           # 登录页面
│   │   ├── EmployeeManagement.tsx  # 员工管理模块
│   │   ├── CategoryManagement.tsx  # 设备分类管理模块
│   │   └── DeviceManagement.tsx    # 设备管理模块
│   ├── utils/
│   │   └── api.ts                  # API 接口和 Mock 数据
│   └── App.tsx                     # 主应用组件
├── styles/
│   ├── theme.css                   # 主题样式
│   ├── tailwind.css                # Tailwind 配置
│   └── index.css                   # 全局样式
database-schema.sql                 # MySQL 数据库建表脚本
API-DOCUMENTATION.md                # API 接口文档
```

## 快速开始

### 前端运行

由于这是 Figma Make 项目，开发服务器已经在运行中，无需手动启动。

### 测试账号

- **用户名**: admin
- **密码**: 123456

## 功能说明

### 1. 登录模块

- 用户名/密码登录
- JWT Token 认证
- 自动 Token 失效检测
- 退出登录功能

### 2. 员工管理

- **查看员工列表**: 显示所有员工信息（姓名、年龄、邮箱）
- **添加员工**: 表单验证（姓名 1-20 字符、年龄 18-60、邮箱格式）
- **编辑员工**: 修改员工信息
- **删除员工**: 带确认对话框的删除操作

### 3. 设备分类管理

- **查看分类列表**: 卡片形式展示，右上角显示设备数量角标
- **添加分类**: 分类名称 1-20 字符验证
- **编辑分类**: 修改分类名称
- **删除分类**: 有设备的分类无法删除（带提示）
- **查看设备**: 点击查看按钮跳转到设备管理并自动筛选

### 4. 设备管理

- **查看设备列表**: 显示设备名称、型号、所属分类
- **分类筛选**: 下拉选择器筛选不同分类的设备
- **添加设备**: 填写设备名称、型号、选择所属分类
- **跨模块联动**: 从分类管理跳转时自动筛选对应分类

## UI 设计特点

- **渐变头部**: 科技蓝渐变色（from-blue-500 to-indigo-600）
- **状态栏**: 仿真手机状态栏（时间 9:41、信号、电池图标）
- **底部 Tab 栏**: 三个模块切换，选中状态高亮显示
- **卡片设计**: 圆角卡片布局，hover 状态阴影效果
- **响应式**: 375px 移动端优化，完美适配手机屏幕

## API 接口说明

所有 API 接口遵循统一响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

详细接口文档请查看 [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

## 数据库部署

### 创建数据库

```bash
mysql -u root -p < database-schema.sql
```

### 数据库表结构

- **employees** - 员工信息表
- **categories** - 设备分类表
- **devices** - 设备信息表
- **users** - 用户认证表

详细数据库设计请查看 [database-schema.sql](./database-schema.sql)

## 后端实现

本项目前端已完成，后端需要使用 Python Flask + SQLAlchemy + MySQL 实现。

### 后端技术栈

- Flask (Web 框架)
- Flask-SQLAlchemy (ORM)
- Flask-JWT-Extended (JWT 认证)
- Flask-CORS (跨域支持)
- PyMySQL (MySQL 驱动)
- BCrypt (密码加密)

### 后端安装

```bash
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors bcrypt pymysql
```

详细后端实现示例请查看 [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) 中的代码示例。

## 开发说明

### 替换为真实后端

当后端接口开发完成后，只需修改 `src/app/utils/api.ts` 中的 `mockApiRequest` 函数，将其替换为真实的 fetch 或 axios 请求即可：

```typescript
// 修改前（Mock）
async function mockApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Mock 逻辑
}

// 修改后（真实 API）
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    clearToken();
    window.location.reload();
  }
  
  return response.json();
}
```

### 表单校验规则

- **姓名**: 1-20 字符，必填
- **年龄**: 18-60 整数，必填
- **邮箱**: 合法邮箱格式，必填
- **分类名称**: 1-20 字符，必填，不可重复
- **设备名称**: 必填
- **设备型号**: 可选
- **所属分类**: 必选

## 浏览器兼容性

- Chrome (推荐)
- Safari
- Firefox
- Edge

## 注意事项

1. 本项目为 Figma Make 环境，不支持标准的 `npm run dev` 命令
2. 开发服务器已自动运行，使用预览界面查看效果
3. Mock 数据存储在内存中，刷新页面会重置为初始数据
4. 生产环境请务必替换为真实后端 API

## 后续优化建议

- [ ] 添加数据分页功能
- [ ] 添加搜索功能
- [ ] 添加数据导出功能
- [ ] 添加数据统计图表
- [ ] 添加多语言支持
- [ ] 添加暗黑模式
- [ ] 添加操作日志记录
- [ ] 添加权限管理系统

## 许可证

MIT

## 联系方式

如有问题，请提交 Issue 或联系开发团队。
