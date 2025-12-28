import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Transaction, BankAccount, TransactionType, TransactionStatus, BANKS_LIST, User } from '../types';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'banks' | 'deposits' | 'users'>('overview');
  
  // Add Bank Form State
  const [newBankName, setNewBankName] = useState('MBBANK');
  const [newAccNum, setNewAccNum] = useState('');
  const [newAccName, setNewAccName] = useState('');

  // User Management States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [editBalance, setEditBalance] = useState('0');
  const [searchUser, setSearchUser] = useState('');

  const refreshData = () => {
    setTransactions(storageService.adminGetTransactions());
    setBanks(storageService.adminGetBanks());
    setUsers(storageService.adminGetAllUsers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApprove = async (txId: string) => {
    try {
      await storageService.adminApproveDeposit(txId);
      alert('Đã duyệt đơn thành công!');
      refreshData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNum || !newAccName) return;

    const bankDef = BANKS_LIST.find(b => b.name === newBankName);
    if (!bankDef) return;

    storageService.adminAddBank({
      bankName: bankDef.name,
      bankCode: bankDef.bin,
      accountNumber: newAccNum,
      accountName: newAccName.toUpperCase(),
      logo: `${bankDef.shortName.toLowerCase()}.png`
    });

    setNewAccNum('');
    setNewAccName('');
    refreshData();
    alert('Thêm ngân hàng thành công!');
  };

  const handleRemoveBank = (id: string) => {
    if (window.confirm('Xóa ngân hàng này?')) {
      storageService.adminRemoveBank(id);
      refreshData();
      alert('Xóa ngân hàng thành công!');
    }
  };

  // User Management Handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setEditBalance(user.balance.toString());
    setShowUserDetail(true);
  };

  const handleUpdateBalance = () => {
    if (!selectedUser) return;
    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance) || newBalance < 0) {
      alert('Số dư không hợp lệ');
      return;
    }
    storageService.adminUpdateUserBalance(selectedUser.id, newBalance);
    alert('Cập nhật số dư thành công!');
    refreshData();
    setShowUserDetail(false);
  };

  const handleToggleLock = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (window.confirm(`${user?.locked ? 'Mở khóa' : 'Khóa'} tài khoản ${user?.username}?`)) {
      storageService.adminToggleLockUser(userId);
      alert(`${user?.locked ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`);
      refreshData();
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (window.confirm(`Xóa vĩnh viễn tài khoản ${user?.username}? Hành động này không thể hoàn tác!`)) {
      storageService.adminDeleteUser(userId);
      alert('Xóa tài khoản thành công!');
      refreshData();
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.id.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleLogout = () => {
    storageService.logout();
    navigate('/login');
  };

  const pendingDeposits = transactions.filter(
    t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.PENDING
  ).length;

  const successDeposits = transactions.filter(
    t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.SUCCESS
  ).length;

  const totalDeposited = transactions
    .filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.SUCCESS)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur border-b border-gold-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-crown text-dark-900 text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
                  ADMIN PANEL
                </h1>
                <p className="text-xs text-gray-400">Quản lý hệ thống</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-gold-500 border-gold-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <i className="fas fa-chart-pie mr-2"></i>Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'deposits'
                ? 'text-gold-500 border-gold-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <i className="fas fa-inbox mr-2"></i>Đơn Nạp ({pendingDeposits})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-gold-500 border-gold-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <i className="fas fa-users mr-2"></i>Tài Khoản ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('banks')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'banks'
                ? 'text-gold-500 border-gold-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <i className="fas fa-university mr-2"></i>Ngân Hàng
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-xl p-6 hover:border-blue-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Đơn Nạp Chờ Duyệt</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{pendingDeposits}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-600/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-hourglass-half text-blue-400 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30 rounded-xl p-6 hover:border-green-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Đơn Nạp Thành Công</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">{successDeposits}</p>
                  </div>
                  <div className="w-14 h-14 bg-green-600/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-400 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gold-600/20 to-gold-700/20 border border-gold-600/30 rounded-xl p-6 hover:border-gold-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tổng Nạp VNĐ</p>
                    <p className="text-3xl font-bold text-gold-400 mt-2">{totalDeposited.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 bg-gold-600/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-coins text-gold-400 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-600/30 rounded-xl p-6 hover:border-purple-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Số Tài Khoản</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{users.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-600/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-purple-400 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-dark-800 border border-gray-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 text-white">Giao Dịch Gần Đây</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-4 whitespace-nowrap">User</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Loại</th>
                      <th className="text-right py-3 px-4 whitespace-nowrap">Số Tiền</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(tx => (
                      <tr key={tx.id} className="border-b border-gray-700/30 hover:bg-dark-700/50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-gray-300 whitespace-nowrap">{tx.userId}</td>
                        <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                          {tx.type === TransactionType.DEPOSIT ? '💳 Nạp' : '🎁 Mua Key'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-green-400 whitespace-nowrap">{tx.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                            tx.status === TransactionStatus.SUCCESS
                              ? 'bg-green-600/30 text-green-400'
                              : 'bg-yellow-600/30 text-yellow-400'
                          }`}>
                            {tx.status === TransactionStatus.SUCCESS ? '✓ Thành công' : '⏳ Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="bg-dark-800 border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 text-white">Kiểm Tra Đơn Nạp</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-3 px-4 whitespace-nowrap">User</th>
                    <th className="text-left py-3 px-4 whitespace-nowrap">Nội Dung</th>
                    <th className="text-right py-3 px-4 whitespace-nowrap">Số Tiền</th>
                    <th className="text-left py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                    <th className="text-left py-3 px-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.type === TransactionType.DEPOSIT)
                    .map(tx => (
                      <tr key={tx.id} className="border-b border-gray-700/30 hover:bg-dark-700/50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-gray-300 whitespace-nowrap">{tx.userId}</td>
                        <td className="py-3 px-4 text-gray-400 font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-400 whitespace-nowrap">{tx.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                            tx.status === TransactionStatus.SUCCESS
                              ? 'bg-green-600/30 text-green-400'
                              : 'bg-yellow-600/30 text-yellow-400'
                          }`}>
                            {tx.status === TransactionStatus.SUCCESS ? '✓ Thành công' : '⏳ Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.status === TransactionStatus.PENDING && (
                            <button
                              onClick={() => handleApprove(tx.id)}
                              className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap"
                            >
                              Duyệt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {transactions.filter(t => t.type === TransactionType.DEPOSIT).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-inbox text-3xl mb-3 block"></i>
                  Không có đơn nạp
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Tìm kiếm theo tên đăng nhập hoặc ID..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"></i>
            </div>

            {/* Users Table */}
            <div className="bg-dark-800 border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-900">
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-4 whitespace-nowrap">Tên Đăng Nhập</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">ID</th>
                      <th className="text-right py-3 px-4 whitespace-nowrap">Số Dư</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Ngày Tạo</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          <i className="fas fa-users text-2xl mb-2 block"></i>
                          {searchUser ? 'Không tìm thấy tài khoản' : 'Chưa có tài khoản'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-dark-700/50 transition">
                          <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{user.username}</td>
                          <td className="py-3 px-4 font-mono text-xs text-gray-400 whitespace-nowrap">{user.id}</td>
                          <td className="py-3 px-4 text-right font-bold text-green-400 whitespace-nowrap">{user.balance.toLocaleString('vi-VN')}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                              user.locked 
                                ? 'bg-red-600/30 text-red-400'
                                : 'bg-green-600/30 text-green-400'
                            }`}>
                              {user.locked ? '🔒 Đã Khóa' : '✓ Bình Thường'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded transition whitespace-nowrap"
                              >
                                Chi Tiết
                              </button>
                              <button
                                onClick={() => handleToggleLock(user.id)}
                                className={`text-white text-xs px-3 py-1 rounded transition whitespace-nowrap ${
                                  user.locked
                                    ? 'bg-green-600 hover:bg-green-500'
                                    : 'bg-yellow-600 hover:bg-yellow-500'
                                }`}
                              >
                                {user.locked ? 'Mở Khóa' : 'Khóa'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1 rounded transition whitespace-nowrap"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Banks Tab */}
        {activeTab === 'banks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Bank Form */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800 border border-gray-700/50 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-white">Thêm Ngân Hàng</h2>
                <form onSubmit={handleAddBank} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-semibold">Ngân Hàng</label>
                    <select
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition"
                    >
                      {BANKS_LIST.map(b => (
                        <option key={b.bin} value={b.name}>
                          {b.name} ({b.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-semibold">Số Tài Khoản</label>
                    <input
                      type="text"
                      value={newAccNum}
                      onChange={e => setNewAccNum(e.target.value)}
                      className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-semibold">Tên Chủ Tài Khoản</label>
                    <input
                      type="text"
                      value={newAccName}
                      onChange={e => setNewAccName(e.target.value)}
                      className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition uppercase"
                      placeholder="TRAN QUOC TUAN"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-dark-900 font-bold py-3 rounded-lg transition transform active:scale-95"
                  >
                    <i className="fas fa-plus mr-2"></i>Thêm Ngân Hàng
                  </button>
                </form>
              </div>
            </div>

            {/* Banks List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-6 text-white">Danh Sách Ngân Hàng ({banks.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banks.map(bank => (
                  <div
                    key={bank.id}
                    className="bg-dark-800 border border-gray-700/50 rounded-xl p-6 hover:border-gold-500/50 transition group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-university text-gold-500"></i>
                      </div>
                      <button
                        onClick={() => handleRemoveBank(bank.id)}
                        className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <h3 className="font-bold text-gold-400 mb-2 text-lg">{bank.bankName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <span className="w-32">Số TK:</span>
                        <span className="font-mono text-white">{bank.accountNumber}</span>
                      </div>
                      <div className="flex items-start text-gray-400">
                        <span className="w-32">Chủ TK:</span>
                        <span className="text-white">{bank.accountName}</span>
                      </div>
                      <div className="flex items-center text-gray-400 pt-2 border-t border-gray-700">
                        <span className="w-32">Mã:</span>
                        <span className="font-mono text-xs text-gray-500">{bank.bankCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {banks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <i className="fas fa-university text-4xl mb-3 block"></i>
                  <p>Chưa có ngân hàng nào</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-gray-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Quản Lý Tài Khoản</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* User Info */}
            <div className="bg-dark-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tên:</span>
                <span className="text-white font-semibold">{selectedUser.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-mono text-xs">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ngày Tạo:</span>
                <span className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Trạng Thái:</span>
                <span className={selectedUser.locked ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                  {selectedUser.locked ? '🔒 Đã Khóa' : '✓ Bình Thường'}
                </span>
              </div>
            </div>

            {/* Edit Balance */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-semibold">Cập Nhật Số Dư (VND)</label>
              <input
                type="number"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition"
                placeholder="0"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-700">
              <button
                onClick={handleUpdateBalance}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition"
              >
                <i className="fas fa-save mr-2"></i>Cập Nhật
              </button>
              <button
                onClick={() => setShowUserDetail(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
