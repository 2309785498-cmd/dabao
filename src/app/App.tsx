import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { isAuthenticated, clearToken } from './utils/api';
import { LoginPage } from './components/LoginPage';
import { EmployeeManagement } from './components/EmployeeManagement';
import { CategoryManagement } from './components/CategoryManagement';
import { DeviceManagement } from './components/DeviceManagement';
import { Users, FolderOpen, Monitor, LogOut } from 'lucide-react';

type TabType = 'employees' | 'categories' | 'devices';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setActiveTab('employees');
  };

  const handleViewCategoryDevices = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setActiveTab('devices');
  };

  const handleDeviceCategoryChange = () => {
    setSelectedCategoryId(undefined);
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLogin} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-[375px] h-full bg-white shadow-2xl flex flex-col">
        {/* 顶部状态栏 */}
        <div className="h-11 bg-white flex items-center justify-between px-4 text-sm">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.924 2.617a.997.997 0 00-.215-.322l-.004-.004A.997.997 0 0017 2h-4a1 1 0 100 2h1.586l-3.293 3.293a1 1 0 001.414 1.414L16 5.414V7a1 1 0 102 0V3a.997.997 0 00-.076-.383z" />
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 1a2 2 0 00-2 2v1a1 1 0 001 1h12a1 1 0 001-1V3a2 2 0 00-2-2H5zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm2 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7z" />
            </svg>
          </div>
        </div>

        {/* 渐变头部 */}
        <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-between px-4 text-white shadow-lg">
          <h1 className="text-xl">企业办公助手</h1>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="退出登录"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'employees' && <EmployeeManagement />}
          {activeTab === 'categories' && (
            <CategoryManagement onViewDevices={handleViewCategoryDevices} />
          )}
          {activeTab === 'devices' && (
            <DeviceManagement
              initialCategoryId={selectedCategoryId}
              onCategoryChange={handleDeviceCategoryChange}
            />
          )}
        </div>

        {/* 底部 Tab 栏 */}
        <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'employees'
                ? 'text-blue-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users size={24} />
            <span className="text-xs mt-1">员工管理</span>
          </button>
          <button
            onClick={() => {
              setSelectedCategoryId(undefined);
              setActiveTab('categories');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'categories'
                ? 'text-blue-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FolderOpen size={24} />
            <span className="text-xs mt-1">设备分类</span>
          </button>
          <button
            onClick={() => {
              setSelectedCategoryId(undefined);
              setActiveTab('devices');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'devices'
                ? 'text-blue-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Monitor size={24} />
            <span className="text-xs mt-1">设备管理</span>
          </button>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}