# 企业内部移动办公助手 — 全栈项目

React Native 移动端 + Python Flask 后端 + MySQL 数据库。

原 React Web（Figma Make / Vite + Tailwind CSS）代码已完整转换为以下技术栈：

---

## 项目结构

```
output/
├── database/
│   └── schema.sql              # MySQL 8.0 建表 + 初始数据
├── backend/                    # Python Flask 后端
│   ├── app.py                  # 应用入口
│   ├── config.py               # 配置（数据库URI, JWT密钥等）
│   ├── requirements.txt        # Python 依赖
│   ├── .env.example            # 环境变量示例
│   ├── models/                 # SQLAlchemy 模型
│   │   ├── admin.py
│   │   ├── employee.py
│   │   ├── category.py
│   │   └── device.py
│   ├── services/               # 业务逻辑层
│   │   ├── auth_service.py
│   │   ├── employee_service.py
│   │   ├── category_service.py
│   │   └── device_service.py
│   ├── controllers/            # 路由 + 请求处理
│   │   ├── auth_controller.py
│   │   ├── employee_controller.py
│   │   ├── category_controller.py
│   │   └── device_controller.py
│   ├── middlewares/            # JWT认证守卫 + 日志中间件
│   │   ├── auth_middleware.py
│   │   └── log_middleware.py
│   └── utils/                  # 统一响应、异常处理、JWT工具
│       ├── response.py
│       ├── exceptions.py
│       └── jwt_utils.py
├── rn-app/                     # React Native (Expo) 前端
│   ├── App.js                  # 入口（导航 + AuthProvider）
│   ├── package.json
│   ├── app.json
│   ├── babel.config.js
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.js   # 认证状态管理
│       ├── services/
│       │   └── api.js           # axios 实例 + 拦截器 + API调用
│       ├── styles/
│       │   └── theme.js         # 颜色 + 全局样式（原 Tailwind 转换为 StyleSheet）
│       └── screens/
│           ├── LoginScreen.js   # 登录页
│           ├── MainTabs.js      # 主界面（顶部渐变头 + 底部Tab栏）
│           ├── EmployeeScreen.js # 员工管理（列表 + 添加/编辑 + 删除确认）
│           ├── CategoryScreen.js # 分类管理（网格列表 + CRUD + 查看设备）
│           └── DeviceScreen.js   # 设备管理（列表 + 分类筛选 + 添加）
└── README.md                   # 本文件
```

---

## 一、MySQL 数据库部署

### 1. 创建数据库并导入

```bash
mysql -u root -p < output/database/schema.sql
```

### 2. 数据库信息

| 项目 | 值 |
|------|-----|
| 数据库名 | `office_assistant` |
| 引擎 | InnoDB |
| 字符集 | utf8mb4 |
| 管理员账号 | `admin` / `admin123` |
| 外键策略 | `ON DELETE RESTRICT` |

### 3. 表结构

- `admin` — 管理员认证（id, username, password_hash, role）
- `employees` — 员工信息（id, name, age, email, created_at）
- `categories` — 设备分类（id, name, device_count）
- `devices` — 设备信息（id, name, model, category_id → FK categories.id）
- 触发器自动维护 `categories.device_count`

---

## 二、Python Flask 后端部署

### 1. 创建虚拟环境

```bash
cd output/backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制并修改 .env 文件
cp .env.example .env
```

需根据本地 MySQL 修改 `DATABASE_URL`：

```
DATABASE_URL=mysql+pymysql://root:你的密码@localhost:3306/office_assistant
```

### 4. 启动服务

```bash
flask run --host=0.0.0.0 --port=5000
```

或直接：

```bash
python app.py
```

后端默认运行在 `http://localhost:5000`。

### 5. 测试 API

```bash
# 登录获取 token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 查询员工（使用返回的 token）
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>"
```

---

## 三、React Native 前端部署

### 1. 安装依赖

```bash
cd output/rn-app
npm install
```

### 2. 启动 Expo 开发服务器

```bash
npm start
```

然后用 Expo Go App 扫码，或按 `a`（Android 模拟器）/ `i`（iOS 模拟器）。

### 3. 配置 API 地址

编辑 [api.js](output/rn-app/src/services/api.js) 第 4 行的 `BASE_URL`：

```js
// Android 模拟器连接本机
const BASE_URL = 'http://10.0.2.2:5000/api';

// iOS 模拟器连接本机
const BASE_URL = 'http://localhost:5000/api';

// 真机调试（替换为电脑局域网IP）
const BASE_URL = 'http://192.168.x.x:5000/api';
```

### 4. 登录测试

打开 App → 输入 `admin` / `admin123` → 进入主界面（员工管理、设备分类、设备管理三个 Tab）。

---

## 四、API 接口一览

| 方法 | 路径 | 需要Token | 说明 |
|------|------|-----------|------|
| POST | `/api/auth/login` | 否 | 登录 |
| GET | `/api/employees` | 是 | 员工列表 |
| GET | `/api/employees/:id` | 是 | 员工详情 |
| POST | `/api/employees` | 是 | 添加员工 |
| PUT | `/api/employees/:id` | 是 | 修改员工 |
| DELETE | `/api/employees/:id` | 是 | 删除员工 |
| GET | `/api/categories` | 是 | 分类列表（含deviceCount） |
| POST | `/api/categories` | 是 | 添加分类 |
| PUT | `/api/categories/:id` | 是 | 修改分类 |
| DELETE | `/api/categories/:id` | 是 | 删除分类 |
| GET | `/api/categories/:id/devices` | 是 | 分类下的设备 |
| GET | `/api/devices?category_id=` | 是 | 设备列表（支持筛选） |
| POST | `/api/devices` | 是 | 添加设备 |

**统一响应格式**：`{"code": 200, "message": "成功", "data": {...}}`

**统一错误格式**：`{"code": 400/401/404/409/500, "message": "...", "data": null}`

---

## 五、技术栈对照（Web → RN 转换）

| 原 Web | React Native |
|--------|-------------|
| `<div>` | `<View>` |
| `<p>`, `<h1>`~`<h6>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` | `<TouchableOpacity>` |
| `.map()` 渲染列表 | `<FlatList>` + 下拉刷新 |
| `react-hook-form` | `react-hook-form`（RN适配） |
| `sonner` toast | `Alert.alert` |
| Tailwind CSS | `StyleSheet.create()` |
| `localStorage` | `AsyncStorage` |
| `<Dialog>` / `<AlertDialog>` | `<Modal>` + `Alert.alert` |
| `lucide-react` 图标 | Emoji / unicode 文本图标 |
