# 企业内部移动办公助手 - API 接口文档

## 基本信息

- **基础 URL**: `http://localhost:5000/api`
- **认证方式**: JWT (JSON Web Token)
- **请求头**: `Authorization: Bearer <token>`
- **内容类型**: `application/json`

---

## 统一响应格式

所有 API 接口均遵循以下统一响应格式：

```json
{
  "code": 200,           // 状态码：200 成功，非 200 失败
  "message": "操作成功",  // 提示信息
  "data": { ... }        // 业务数据，失败时为 null
}
```

### 常见状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token 失效或未登录） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 认证接口

### 1.1 用户登录

**接口地址**: `POST /api/auth/login`

**是否需要认证**: 否

**请求参数**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin"
  }
}
```

**失败响应示例**:

```json
{
  "code": 400,
  "message": "用户名或密码错误",
  "data": null
}
```

---

## 2. 员工管理接口

### 2.1 查询所有员工

**接口地址**: `GET /api/employees`

**是否需要认证**: 是

**请求参数**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "age": 28,
      "email": "zhangsan@company.com",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "李四",
      "age": 32,
      "email": "lisi@company.com",
      "createdAt": "2024-02-20T11:30:00.000Z"
    }
  ]
}
```

### 2.2 查询单个员工详情

**接口地址**: `GET /api/employees/{id}`

**是否需要认证**: 是

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 员工ID |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "张三",
    "age": 28,
    "email": "zhangsan@company.com",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2.3 创建员工

**接口地址**: `POST /api/employees`

**是否需要认证**: 是

**请求参数**:

```json
{
  "name": "赵六",
  "age": 30,
  "email": "zhaoliu@company.com"
}
```

| 参数 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| name | string | 是 | 长度 1-20 字符 | 员工姓名 |
| age | integer | 是 | 范围 18-60 | 员工年龄 |
| email | string | 是 | 合法邮箱格式 | 员工邮箱 |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 4,
    "name": "赵六",
    "age": 30,
    "email": "zhaoliu@company.com",
    "createdAt": "2024-05-22T08:30:00.000Z"
  }
}
```

### 2.4 修改员工信息

**接口地址**: `PUT /api/employees/{id}`

**是否需要认证**: 是

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 员工ID |

**请求参数**:

```json
{
  "name": "张三丰",
  "age": 29,
  "email": "zhangsanfeng@company.com"
}
```

参数校验规则同创建接口。

**成功响应示例**:

```json
{
  "code": 200,
  "message": "修改成功",
  "data": {
    "id": 1,
    "name": "张三丰",
    "age": 29,
    "email": "zhangsanfeng@company.com",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2.5 删除员工

**接口地址**: `DELETE /api/employees/{id}`

**是否需要认证**: 是

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 员工ID |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 3. 设备分类管理接口

### 3.1 查询所有分类

**接口地址**: `GET /api/categories`

**是否需要认证**: 是

**请求参数**: 无

**成功响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "办公设备",
      "deviceCount": 5,
      "createdAt": "2024-01-01T09:00:00.000Z"
    },
    {
      "id": 2,
      "name": "网络设备",
      "deviceCount": 3,
      "createdAt": "2024-01-05T10:00:00.000Z"
    }
  ]
}
```

### 3.2 创建分类

**接口地址**: `POST /api/categories`

**是否需要认证**: 是

**请求参数**:

```json
{
  "name": "存储设备"
}
```

| 参数 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| name | string | 是 | 长度 1-20 字符，不能重复 | 分类名称 |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 4,
    "name": "存储设备",
    "deviceCount": 0,
    "createdAt": "2024-05-22T08:30:00.000Z"
  }
}
```

### 3.3 修改分类

**接口地址**: `PUT /api/categories/{id}`

**是否需要认证**: 是

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 分类ID |

**请求参数**:

```json
{
  "name": "办公设备类"
}
```

**成功响应示例**:

```json
{
  "code": 200,
  "message": "修改成功",
  "data": {
    "id": 1,
    "name": "办公设备类",
    "deviceCount": 5,
    "createdAt": "2024-01-01T09:00:00.000Z"
  }
}
```

### 3.4 删除分类

**接口地址**: `DELETE /api/categories/{id}`

**是否需要认证**: 是

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 分类ID |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**失败响应示例（分类下有设备）**:

```json
{
  "code": 400,
  "message": "该分类下有设备，无法删除",
  "data": null
}
```

### 3.5 查询分类下的所有设备

**接口地址**: `GET /api/categories/{id}/devices`

**是否需要认证**: 是

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 分类ID |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro",
      "model": "M3 Max",
      "categoryId": 1,
      "categoryName": "办公设备",
      "createdAt": "2024-01-16T09:00:00.000Z"
    }
  ]
}
```

---

## 4. 设备管理接口

### 4.1 查询设备列表（支持分类筛选）

**接口地址**: `GET /api/devices`

**是否需要认证**: 是

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category_id | integer | 否 | 分类ID，不传则查询所有设备 |

**请求示例**:

```
GET /api/devices
GET /api/devices?category_id=1
```

**成功响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro",
      "model": "M3 Max",
      "categoryId": 1,
      "categoryName": "办公设备",
      "createdAt": "2024-01-16T09:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Dell显示器",
      "model": "U2723DE",
      "categoryId": 1,
      "categoryName": "办公设备",
      "createdAt": "2024-01-17T10:00:00.000Z"
    }
  ]
}
```

### 4.2 创建设备

**接口地址**: `POST /api/devices`

**是否需要认证**: 是

**请求参数**:

```json
{
  "name": "华为路由器",
  "model": "AX3 Pro",
  "categoryId": 2
}
```

| 参数 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| name | string | 是 | 不能为空 | 设备名称 |
| model | string | 否 | - | 设备型号 |
| categoryId | integer | 是 | 必须是已存在的分类ID | 所属分类ID |

**成功响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 11,
    "name": "华为路由器",
    "model": "AX3 Pro",
    "categoryId": 2,
    "categoryName": "网络设备",
    "createdAt": "2024-05-22T08:30:00.000Z"
  }
}
```

**失败响应示例（分类不存在）**:

```json
{
  "code": 400,
  "message": "分类不存在",
  "data": null
}
```

---

## Python Flask 后端实现示例

### 安装依赖

```bash
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors bcrypt pymysql
```

### 项目结构

```
backend/
├── app.py                 # Flask 应用入口
├── config.py              # 配置文件
├── models.py              # SQLAlchemy 模型
├── routes/
│   ├── auth.py           # 认证路由
│   ├── employees.py      # 员工管理路由
│   ├── categories.py     # 分类管理路由
│   └── devices.py        # 设备管理路由
└── requirements.txt       # 依赖列表
```

### 核心代码示例

#### 1. config.py

```python
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:password@localhost:3306/office_assistant'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
```

#### 2. app.py

```python
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # 注册蓝图
    from routes.auth import auth_bp
    from routes.employees import employees_bp
    from routes.categories import categories_bp
    from routes.devices import devices_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(devices_bp, url_prefix='/api/devices')
    
    # 统一错误处理
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'code': 401, 'message': '未授权，请先登录', 'data': None}), 401
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'code': 404, 'message': '资源不存在', 'data': None}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'code': 500, 'message': '服务器内部错误', 'data': None}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
```

#### 3. models.py

```python
from app import db
from datetime import datetime

class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'email': self.email,
            'createdAt': self.created_at.isoformat() + 'Z'
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False, unique=True)
    device_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    devices = db.relationship('Device', backref='category', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'deviceCount': self.device_count,
            'createdAt': self.created_at.isoformat() + 'Z'
        }

class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model or '',
            'categoryId': self.category_id,
            'categoryName': self.category.name if self.category else '',
            'createdAt': self.created_at.isoformat() + 'Z'
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)
```

---

## 测试建议

1. 使用 Postman 或 curl 测试所有接口
2. 先调用登录接口获取 token
3. 后续请求在 Header 中添加 `Authorization: Bearer <token>`
4. 测试各种错误场景（401、404、400 等）

---

## 注意事项

1. **生产环境配置**:
   - 修改 `SECRET_KEY` 和 `JWT_SECRET_KEY` 为随机字符串
   - 启用 HTTPS
   - 配置 CORS 白名单
   - 使用环境变量管理敏感信息

2. **安全建议**:
   - 密码使用 BCrypt 加密存储
   - Token 设置合理的过期时间
   - 添加请求频率限制（rate limiting）
   - 对用户输入进行严格校验和过滤

3. **性能优化**:
   - 为常用查询字段添加索引
   - 使用数据库连接池
   - 考虑添加 Redis 缓存
   - 分页查询大量数据

4. **日志记录**:
   - 记录所有 API 请求和响应
   - 记录错误和异常信息
   - 便于问题排查和监控
