import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storage';
import { User, GeneratedKey } from '../../types';

const DashboardHome: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeKeys, setActiveKeys] = useState<GeneratedKey[]>([]);

  useEffect(() => {
    setUser(storageService.getCurrentUser());
    
    // In a real app we'd fetch actual active keys. 
    // Here we just pull from localStorage via a simplified mock
    const allKeys: GeneratedKey[] = JSON.parse(localStorage.getItem('tooltx_keys') || '[]');
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
        const myKeys = allKeys.filter(k => k.userId === currentUser.id);
        // Filter keys that haven't expired
        const active = myKeys.filter(k => new Date(k.expiryDate) > new Date());
        setActiveKeys(active);
    }
  }, []);

  const handleCopyId = () => {
      if (user?.id) {
          navigator.clipboard.writeText(user.id);
          alert(`Đã sao chép ID: ${user.id}`);
      }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      {/* New User Info Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 p-6 rounded-xl border border-gold-500/30 shadow-lg mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <i className="fas fa-user-circle text-9xl text-gold-500"></i>
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
             <div className="w-20 h-20 rounded-full border-2 border-gold-500 p-1 bg-dark-900">
                 <img src="https://picsum.photos/seed/logo-vip/80/80" alt="Avatar" className="w-full h-full rounded-full object-cover" />
             </div>
             
             <div className="flex-1 text-center md:text-left space-y-2">
                 <h2 className="text-3xl font-bold text-white uppercase tracking-wide">{user.username}</h2>
                 
                 <div className="flex items-center justify-center md:justify-start gap-3 bg-dark-950/50 w-fit mx-auto md:mx-0 px-3 py-1.5 rounded-lg border border-gray-700">
                     <span className="text-gray-400 text-sm">ID:</span>
                     <span className="font-mono font-bold text-gold-400">{user.id}</span>
                     <button 
                        onClick={handleCopyId}
                        className="text-gray-400 hover:text-white transition"
                        title="Sao chép ID"
                     >
                         <i className="fas fa-copy"></i>
                     </button>
                 </div>

                 <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                     <span className="text-gray-300">Số dư:</span>
                     <span className="text-2xl font-bold text-green-400">{user.balance.toLocaleString('vi-VN')} VND</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Stats Cards - Removed VIP Status, Layout changed to 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-gold-500/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ví Tiền</p>
              <h3 className="text-xl font-bold text-gray-200 mt-1">
                Nạp tiền tài khoản
              </h3>
            </div>
            <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-gold-500">
              <i className="fas fa-wallet text-xl"></i>
            </div>
          </div>
          <Link to="/dashboard/deposit" className="block mt-4 text-sm text-center bg-gold-500 hover:bg-gold-600 text-black font-bold py-2 rounded transition">
            <i className="fas fa-plus mr-1"></i> NẠP TIỀN NGAY
          </Link>
        </div>

        <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-gold-500/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Key Đang Kích Hoạt</p>
              <h3 className="text-xl font-bold text-green-500 mt-1">
                {activeKeys.length} <span className="text-sm text-gray-500">Key</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-green-500">
              <i className="fas fa-key text-xl"></i>
            </div>
          </div>
           <Link to="/dashboard/buy-key" className="block mt-4 text-sm text-center bg-dark-700 hover:bg-dark-600 py-2 rounded text-white transition">
            <i className="fas fa-shopping-cart mr-1"></i> Mua Thêm Key
          </Link>
        </div>
      </div>

      {/* Active Tools Section */}
      <h3 className="text-xl font-bold mb-4 text-white border-l-4 border-gold-500 pl-3">Công Cụ Đang Hoạt Động</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Tài Xỉu 2026', 'Sicbo Pro', 'Xóc Đĩa AI', 'Baccarat Master'].map((game, idx) => (
             <div key={idx} className="bg-dark-800 rounded-xl overflow-hidden border border-gray-700 group hover:shadow-gold-500/20 hover:shadow-lg transition-all">
                <div className="h-32 bg-gray-700 relative overflow-hidden">
                    <img src={`https://picsum.photos/seed/${game}/400/200`} alt={game} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         {activeKeys.length > 0 ? (
                             <button className="bg-gold-500 text-black px-6 py-2 rounded-full font-bold shadow-lg transform scale-0 group-hover:scale-100 transition duration-300">
                                MỞ TOOL
                             </button>
                         ) : (
                             <span className="bg-black/70 text-white px-3 py-1 rounded text-xs backdrop-blur-sm">
                                 <i className="fas fa-lock mr-1"></i> Cần Key
                             </span>
                         )}
                    </div>
                </div>
                <div className="p-4">
                    <h4 className="font-bold text-lg text-white group-hover:text-gold-500 transition">{game}</h4>
                    <p className="text-xs text-gray-400 mt-1">Ver: 2.5.1 • Updated: Today</p>
                </div>
             </div> 
          ))}
      </div>
    </div>
  );
};

export default DashboardHome;