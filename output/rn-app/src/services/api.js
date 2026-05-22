import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5000/api'; // Android 模拟器用 10.0.2.2, iOS 用 localhost

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动添加 JWT token
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 时清除 token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.code === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// ---- Token 管理 ----
export const getToken = () => AsyncStorage.getItem('token');
export const setToken = (token) => AsyncStorage.setItem('token', token);
export const clearToken = () => AsyncStorage.removeItem('token');

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// 统一解包响应
function unwrap(response) {
  return response.data;
}

// ---- API 函数 ----
export const api = {
  // 登录
  login: (username, password) =>
    client.post('/auth/login', { username, password }).then(unwrap),

  // 员工管理
  getEmployees: () => client.get('/employees').then(unwrap),
  getEmployee: (id) => client.get(`/employees/${id}`).then(unwrap),
  createEmployee: (data) => client.post('/employees', data).then(unwrap),
  updateEmployee: (id, data) => client.put(`/employees/${id}`, data).then(unwrap),
  deleteEmployee: (id) => client.delete(`/employees/${id}`).then(unwrap),

  // 分类管理
  getCategories: () => client.get('/categories').then(unwrap),
  createCategory: (name) => client.post('/categories', { name }).then(unwrap),
  updateCategory: (id, name) => client.put(`/categories/${id}`, { name }).then(unwrap),
  deleteCategory: (id) => client.delete(`/categories/${id}`).then(unwrap),
  getCategoryDevices: (id) => client.get(`/categories/${id}/devices`).then(unwrap),

  // 设备管理
  getDevices: (categoryId) => {
    const params = categoryId ? { category_id: categoryId } : {};
    return client.get('/devices', { params }).then(unwrap);
  },
  createDevice: (data) => client.post('/devices', data).then(unwrap),
};
