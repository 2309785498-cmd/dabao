import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { Monitor, Plus, X, ChevronDown } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

interface Device {
  id: number;
  name: string;
  model: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  deviceCount: number;
}

interface DeviceFormData {
  name: string;
  model: string;
  categoryId: number;
}

interface DeviceManagementProps {
  initialCategoryId?: number;
  onCategoryChange?: () => void;
}

export function DeviceManagement({ initialCategoryId, onCategoryChange }: DeviceManagementProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    initialCategoryId
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeviceFormData>();

  const watchCategoryId = watch('categoryId');

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.code === 200 && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error('加载分类失败');
    }
  };

  const loadDevices = async (categoryId?: number) => {
    setLoading(true);
    try {
      const response = await api.getDevices(categoryId);
      if (response.code === 200 && response.data) {
        setDevices(response.data);
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

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId);
      loadDevices(initialCategoryId);
      if (onCategoryChange) {
        onCategoryChange();
      }
    } else {
      loadDevices();
    }
  }, [initialCategoryId]);

  const handleCategoryFilterChange = (value: string) => {
    const categoryId = value === 'all' ? undefined : parseInt(value);
    setSelectedCategoryId(categoryId);
    loadDevices(categoryId);
  };

  const openDialog = () => {
    reset({ name: '', model: '', categoryId: categories[0]?.id });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    reset({ name: '', model: '', categoryId: categories[0]?.id });
  };

  const onSubmit = async (data: DeviceFormData) => {
    setLoading(true);
    try {
      const response = await api.createDevice({
        name: data.name,
        model: data.model,
        categoryId: data.categoryId,
      });

      if (response.code === 200) {
        toast.success(response.message);
        closeDialog();
        loadDevices(selectedCategoryId);
        loadCategories(); // 刷新分类以更新设备数量
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 头部操作栏 */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-800">设备列表</h2>
          <button
            onClick={openDialog}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            添加设备
          </button>
        </div>

        {/* 分类筛选器 */}
        <div className="relative">
          <select
            value={selectedCategoryId?.toString() || 'all'}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
          >
            <option value="all">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.deviceCount})
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* 设备列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && devices.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {selectedCategoryId ? '该分类下暂无设备' : '暂无设备数据'}
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* 图标 */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                  <Monitor size={24} />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 mb-1">{device.name}</h3>
                  {device.model && (
                    <p className="text-sm text-gray-500 mb-2">型号：{device.model}</p>
                  )}
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                    {device.categoryName}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加设备对话框 */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[360px] max-h-[80vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-gray-800">添加设备</Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">设备名称 *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入设备名称"
                  {...register('name', {
                    required: '请输入设备名称',
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-gray-700">设备型号</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入设备型号（可选）"
                  {...register('model')}
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700">所属分类 *</label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                    {...register('categoryId', {
                      required: '请选择所属分类',
                      valueAsNumber: true,
                    })}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
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
