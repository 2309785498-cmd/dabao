// API 基础配置和拦截器
const API_BASE_URL = '/api';

// Mock 数据存储
let mockEmployees = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@company.com', createdAt: new Date('2024-01-15').toISOString() },
  { id: 2, name: '李四', age: 32, email: 'lisi@company.com', createdAt: new Date('2024-02-20').toISOString() },
  { id: 3, name: '王五', age: 25, email: 'wangwu@company.com', createdAt: new Date('2024-03-10').toISOString() },
];

let mockCategories = [
  { id: 1, name: '办公设备', deviceCount: 5, createdAt: new Date('2024-01-01').toISOString() },
  { id: 2, name: '网络设备', deviceCount: 3, createdAt: new Date('2024-01-05').toISOString() },
  { id: 3, name: '安防设备', deviceCount: 2, createdAt: new Date('2024-01-10').toISOString() },
];

let mockDevices = [
  { id: 1, name: 'MacBook Pro', model: 'M3 Max', categoryId: 1, categoryName: '办公设备', createdAt: new Date('2024-01-16').toISOString() },
  { id: 2, name: 'Dell显示器', model: 'U2723DE', categoryId: 1, categoryName: '办公设备', createdAt: new Date('2024-01-17').toISOString() },
  { id: 3, name: 'ThinkPad', model: 'X1 Carbon', categoryId: 1, categoryName: '办公设备', createdAt: new Date('2024-01-18').toISOString() },
  { id: 4, name: 'iPhone 15 Pro', model: '256GB', categoryId: 1, categoryName: '办公设备', createdAt: new Date('2024-01-19').toISOString() },
  { id: 5, name: '无线键盘', model: 'MX Keys', categoryId: 1, categoryName: '办公设备', createdAt: new Date('2024-01-20').toISOString() },
  { id: 6, name: 'Cisco交换机', model: 'Catalyst 2960', categoryId: 2, categoryName: '网络设备', createdAt: new Date('2024-01-21').toISOString() },
  { id: 7, name: '路由器', model: 'Cisco RV340', categoryId: 2, categoryName: '网络设备', createdAt: new Date('2024-01-22').toISOString() },
  { id: 8, name: '防火墙', model: 'FortiGate 60F', categoryId: 2, categoryName: '网络设备', createdAt: new Date('2024-01-23').toISOString() },
  { id: 9, name: '监控摄像头', model: 'Hikvision DS-2CD2143G2-I', categoryId: 3, categoryName: '安防设备', createdAt: new Date('2024-01-24').toISOString() },
  { id: 10, name: '门禁系统', model: 'ZKTeco K40', categoryId: 3, categoryName: '安防设备', createdAt: new Date('2024-01-25').toISOString() },
];

let nextEmployeeId = 4;
let nextCategoryId = 4;
let nextDeviceId = 11;

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 统一响应格式
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 获取 token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置 token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 清除 token
export const clearToken = (): void => {
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Mock API 请求函数
async function mockApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  await delay(300); // 模拟网络延迟

  const token = getToken();
  const isLoginRequest = endpoint === '/api/auth/login';

  // 除了登录接口，其他接口都需要验证 token
  if (!isLoginRequest && !token) {
    return {
      code: 401,
      message: '未授权，请先登录',
      data: null,
    };
  }

  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  try {
    // 处理各种 API 请求
    if (endpoint === '/api/auth/login') {
      if (body.username === 'admin' && body.password === '123456') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        return {
          code: 200,
          message: '登录成功',
          data: { token: mockToken, username: 'admin' } as T,
        };
      } else {
        return {
          code: 400,
          message: '用户名或密码错误',
          data: null,
        };
      }
    }

    // 员工管理
    if (endpoint === '/api/employees') {
      if (method === 'GET') {
        const sorted = [...mockEmployees].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return { code: 200, message: '查询成功', data: sorted as T };
      } else if (method === 'POST') {
        const newEmployee = {
          id: nextEmployeeId++,
          ...body,
          createdAt: new Date().toISOString(),
        };
        mockEmployees.push(newEmployee);
        return { code: 200, message: '添加成功', data: newEmployee as T };
      }
    }

    if (endpoint.startsWith('/api/employees/')) {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const employee = mockEmployees.find(e => e.id === id);

      if (method === 'GET') {
        if (!employee) {
          return { code: 404, message: '员工不存在', data: null };
        }
        return { code: 200, message: '查询成功', data: employee as T };
      } else if (method === 'PUT') {
        if (!employee) {
          return { code: 404, message: '员工不存在', data: null };
        }
        Object.assign(employee, body);
        return { code: 200, message: '修改成功', data: employee as T };
      } else if (method === 'DELETE') {
        const index = mockEmployees.findIndex(e => e.id === id);
        if (index === -1) {
          return { code: 404, message: '员工不存在', data: null };
        }
        mockEmployees.splice(index, 1);
        return { code: 200, message: '删除成功', data: null };
      }
    }

    // 分类管理
    if (endpoint === '/api/categories') {
      if (method === 'GET') {
        return { code: 200, message: '查询成功', data: mockCategories as T };
      } else if (method === 'POST') {
        const newCategory = {
          id: nextCategoryId++,
          name: body.name,
          deviceCount: 0,
          createdAt: new Date().toISOString(),
        };
        mockCategories.push(newCategory);
        return { code: 200, message: '添加成功', data: newCategory as T };
      }
    }

    if (endpoint.startsWith('/api/categories/') && endpoint.includes('/devices')) {
      const id = parseInt(endpoint.split('/')[3]);
      const devices = mockDevices.filter(d => d.categoryId === id);
      return { code: 200, message: '查询成功', data: devices as T };
    }

    if (endpoint.startsWith('/api/categories/')) {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const category = mockCategories.find(c => c.id === id);

      if (method === 'PUT') {
        if (!category) {
          return { code: 404, message: '分类不存在', data: null };
        }
        category.name = body.name;
        return { code: 200, message: '修改成功', data: category as T };
      } else if (method === 'DELETE') {
        // 检查是否有关联设备
        const hasDevices = mockDevices.some(d => d.categoryId === id);
        if (hasDevices) {
          return { code: 400, message: '该分类下有设备，无法删除', data: null };
        }
        const index = mockCategories.findIndex(c => c.id === id);
        if (index === -1) {
          return { code: 404, message: '分类不存在', data: null };
        }
        mockCategories.splice(index, 1);
        return { code: 200, message: '删除成功', data: null };
      }
    }

    // 设备管理
    if (endpoint.startsWith('/api/devices')) {
      const url = new URL('http://dummy.com' + endpoint);
      const categoryId = url.searchParams.get('category_id');

      if (method === 'GET') {
        let devices = mockDevices;
        if (categoryId) {
          devices = devices.filter(d => d.categoryId === parseInt(categoryId));
        }
        return { code: 200, message: '查询成功', data: devices as T };
      } else if (method === 'POST') {
        const category = mockCategories.find(c => c.id === body.categoryId);
        if (!category) {
          return { code: 400, message: '分类不存在', data: null };
        }
        const newDevice = {
          id: nextDeviceId++,
          name: body.name,
          model: body.model || '',
          categoryId: body.categoryId,
          categoryName: category.name,
          createdAt: new Date().toISOString(),
        };
        mockDevices.push(newDevice);
        // 更新分类的设备数量
        category.deviceCount++;
        return { code: 200, message: '添加成功', data: newDevice as T };
      }
    }

    return {
      code: 404,
      message: '接口不存在',
      data: null,
    };
  } catch (error) {
    return {
      code: 500,
      message: '服务器错误',
      data: null,
    };
  }
}

// 导出的 API 函数
export const api = {
  // 登录
  login: (username: string, password: string) =>
    mockApiRequest<{ token: string; username: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  // 员工管理
  getEmployees: () => mockApiRequest<any[]>('/api/employees'),
  getEmployee: (id: number) => mockApiRequest<any>(`/api/employees/${id}`),
  createEmployee: (data: { name: string; age: number; email: string }) =>
    mockApiRequest<any>('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: number, data: { name: string; age: number; email: string }) =>
    mockApiRequest<any>(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteEmployee: (id: number) =>
    mockApiRequest<any>(`/api/employees/${id}`, { method: 'DELETE' }),

  // 分类管理
  getCategories: () => mockApiRequest<any[]>('/api/categories'),
  createCategory: (name: string) =>
    mockApiRequest<any>('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  updateCategory: (id: number, name: string) =>
    mockApiRequest<any>(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (id: number) =>
    mockApiRequest<any>(`/api/categories/${id}`, { method: 'DELETE' }),
  getCategoryDevices: (id: number) =>
    mockApiRequest<any[]>(`/api/categories/${id}/devices`),

  // 设备管理
  getDevices: (categoryId?: number) =>
    mockApiRequest<any[]>(
      `/api/devices${categoryId ? `?category_id=${categoryId}` : ''}`
    ),
  createDevice: (data: { name: string; model?: string; categoryId: number }) =>
    mockApiRequest<any>('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};
