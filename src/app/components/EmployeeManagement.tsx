import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { User, Mail, Trash2, Edit, Plus, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface Employee {
  id: number;
  name: string;
  age: number;
  email: string;
  createdAt: string;
}

interface EmployeeFormData {
  name: string;
  age: number;
  email: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>();

  const loadEmployees = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.getEmployees();
      if (response.code === 200 && response.data) {
        setEmployees(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      reset(employee);
    } else {
      setEditingEmployee(null);
      reset({ name: '', age: 18, email: '' });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    reset({ name: '', age: 18, email: '' });
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      const response = editingEmployee
        ? await api.updateEmployee(editingEmployee.id, data)
        : await api.createEmployee(data);

      if (response.code === 200) {
        toast.success(response.message);
        closeDialog();
        loadEmployees();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const response = await api.deleteEmployee(id);
      if (response.code === 200) {
        toast.success(response.message);
        setDeletingId(null);
        loadEmployees();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 头部操作栏 */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-gray-800">员工列表</h2>
        <button
          onClick={() => openDialog()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          添加员工
        </button>
      </div>

      {/* 员工列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && employees.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            暂无员工数据
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                  <User size={24} />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-gray-800">{employee.name}</h3>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {employee.age}岁
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail size={14} />
                    <span className="truncate">{employee.email}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openDialog(employee)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <AlertDialog.Root
                    open={deletingId === employee.id}
                    onOpenChange={(open) => setDeletingId(open ? employee.id : null)}
                  >
                    <AlertDialog.Trigger asChild>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
                      <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[320px] shadow-xl animate-in fade-in zoom-in">
                        <AlertDialog.Title className="mb-2 text-gray-800">
                          确认删除
                        </AlertDialog.Title>
                        <AlertDialog.Description className="mb-6 text-sm text-gray-600">
                          确定要删除员工「{employee.name}」吗？此操作不可恢复。
                        </AlertDialog.Description>
                        <div className="flex gap-3 justify-end">
                          <AlertDialog.Cancel asChild>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              取消
                            </button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action asChild>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              删除
                            </button>
                          </AlertDialog.Action>
                        </div>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加/编辑对话框 */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[360px] max-h-[80vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-gray-800">
                {editingEmployee ? '编辑员工' : '添加员工'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">姓名 *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入姓名"
                  {...register('name', {
                    required: '请输入姓名',
                    minLength: { value: 1, message: '姓名长度至少1个字符' },
                    maxLength: { value: 20, message: '姓名长度不能超过20个字符' },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-gray-700">年龄 *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入年龄"
                  {...register('age', {
                    required: '请输入年龄',
                    min: { value: 18, message: '年龄不能小于18岁' },
                    max: { value: 60, message: '年龄不能大于60岁' },
                    valueAsNumber: true,
                  })}
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-gray-700">邮箱 *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入邮箱"
                  {...register('email', {
                    required: '请输入邮箱',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '请输入有效的邮箱地址',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? '提交中...' : '确定'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
