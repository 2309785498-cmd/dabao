import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { FolderOpen, Edit, Trash2, Eye, Plus, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface Category {
  id: number;
  name: string;
  deviceCount: number;
  createdAt: string;
}

interface CategoryFormData {
  name: string;
}

interface CategoryManagementProps {
  onViewDevices: (categoryId: number, categoryName: string) => void;
}

export function CategoryManagement({ onViewDevices }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await api.getCategories();
      if (response.code === 200 && response.data) {
        setCategories(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({ name: category.name });
    } else {
      setEditingCategory(null);
      reset({ name: '' });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    reset({ name: '' });
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const response = editingCategory
        ? await api.updateCategory(editingCategory.id, data.name)
        : await api.createCategory(data.name);

      if (response.code === 200) {
        toast.success(response.message);
        closeDialog();
        loadCategories();
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
      const response = await api.deleteCategory(id);
      if (response.code === 200) {
        toast.success(response.message);
        setDeletingId(null);
        loadCategories();
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
        <h2 className="text-gray-800">设备分类</h2>
        <button
          onClick={() => openDialog()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          添加分类
        </button>
      </div>

      {/* 分类列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            暂无分类数据
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
              >
                {/* 设备数量角标 */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs shadow-md">
                  {category.deviceCount}
                </div>

                {/* 图标和名称 */}
                <div className="flex flex-col items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white mb-2">
                    <FolderOpen size={24} />
                  </div>
                  <h3 className="text-center text-gray-800 line-clamp-2">
                    {category.name}
                  </h3>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDialog(category)}
                    className="flex-1 px-2 py-1.5 text-xs text-blue-500 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    编辑
                  </button>
                  <button
                    onClick={() => onViewDevices(category.id, category.name)}
                    className="flex-1 px-2 py-1.5 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    查看
                  </button>
                </div>

                <AlertDialog.Root
                  open={deletingId === category.id}
                  onOpenChange={(open) => setDeletingId(open ? category.id : null)}
                >
                  <AlertDialog.Trigger asChild>
                    <button className="mt-2 w-full px-2 py-1.5 text-xs text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
                      <Trash2 size={14} />
                      删除
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
                    <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[320px] shadow-xl animate-in fade-in zoom-in">
                      <AlertDialog.Title className="mb-2 text-gray-800">
                        确认删除
                      </AlertDialog.Title>
                      <AlertDialog.Description className="mb-6 text-sm text-gray-600">
                        确定要删除分类「{category.name}」吗？
                        {category.deviceCount > 0 && (
                          <span className="block mt-2 text-red-500">
                            该分类下有 {category.deviceCount} 个设备，删除可能失败。
                          </span>
                        )}
                      </AlertDialog.Description>
                      <div className="flex gap-3 justify-end">
                        <AlertDialog.Cancel asChild>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            取消
                          </button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <button
                            onClick={() => handleDelete(category.id)}
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
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑对话框 */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[360px] shadow-xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-gray-800">
                {editingCategory ? '编辑分类' : '添加分类'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">分类名称 *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入分类名称"
                  {...register('name', {
                    required: '请输入分类名称',
                    minLength: { value: 1, message: '分类名称长度至少1个字符' },
                    maxLength: { value: 20, message: '分类名称长度不能超过20个字符' },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
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
