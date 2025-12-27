import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';

const DashboardLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const u = storageService.refreshUser(); // Get freshest balance
    setUser(u);
  }, [location.pathname]); // Refresh on route change

  const handleLogout = () => {
    storageService.logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Trang Chủ', path: '/dashboard', icon: 'fa-home' },
    { label: 'Nạp Tiền', path: '/dashboard/deposit', icon: 'fa-wallet' },
    { label: 'Mua Key', path: '/dashboard/buy-key', icon: 'fa-key' },
    { label: 'Lịch Sử', path: '/dashboard/history', icon: 'fa-history' },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: 'fa-user-shield' });
  }

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-dark-800 p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50">
        <div className="font-bold text-xl text-gold-500">{APP_NAME}</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-dark-800 border-r border-gray-700 flex flex-col z-40
      `}>
        <div className="p-6 text-center border-b border-gray-700 hidden md:block">
           <img src="https://picsum.photos/seed/logo-vip/80/80" alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gold-500" />
           <h1 className="text-xl font-bold text-gold-500 tracking-wider">{APP_NAME}</h1>
        </div>

        <div className="p-4 border-b border-gray-700 bg-dark-700/30">
            <p className="text-xs text-gray-400 mb-1">Xin chào,</p>
            <p className="font-bold text-white truncate">{user?.username}</p>
            <p className="text-gold-400 font-mono mt-1 text-sm">
              {user?.balance.toLocaleString('vi-VN')} VND
            </p>
            <p className="text-xs text-gray-500 mt-1">ID: {user?.id}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-black font-bold shadow-lg' 
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'}
                `}
              >
                <i className={`fas ${item.icon} w-6 text-center`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;