import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Transaction, BankAccount, TransactionType, TransactionStatus, BANKS_LIST } from '../types';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'banks' | 'deposits'>('overview');
  
  // Add Bank Form State
  const [newBankName, setNewBankName] = useState('MBBANK');
  const [newAccNum, setNewAccNum] = useState('');
  const [newAccName, setNewAccName] = useState('');

  const refreshData = () => {
    setTransactions(storageService.adminGetTransactions());
    setBanks(storageService.adminGetBanks());
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
        <div className="flex space-x-2 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'overview'
                ? 'text-gold-500 border-gold-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <i className="fas fa-chart-pie mr-2"></i>Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'deposits'
                ? 'text-gold-500 border-gold-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <i className="fas fa-inbox mr-2"></i>Đơn Nạp ({pendingDeposits})
          </button>
          <button
            onClick={() => setActiveTab('banks')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
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
                    <p className="text-gray-400 text-sm">Số Ngân Hàng</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{banks.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-600/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-building text-purple-400 text-2xl"></i>
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
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Loại</th>
                      <th className="text-right py-3 px-4">Số Tiền</th>
                      <th className="text-left py-3 px-4">Trạng Thái</th>
                      <th className="text-left py-3 px-4">Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(tx => (
                      <tr key={tx.id} className="border-b border-gray-700/30 hover:bg-dark-700/50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-gray-300">{tx.userId}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {tx.type === TransactionType.DEPOSIT ? '💳 Nạp' : '🎁 Mua Key'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-green-400">{tx.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tx.status === TransactionStatus.SUCCESS
                              ? 'bg-green-600/30 text-green-400'
                              : 'bg-yellow-600/30 text-yellow-400'
                          }`}>
                            {tx.status === TransactionStatus.SUCCESS ? '✓ Thành công' : '⏳ Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">
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
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Nội Dung</th>
                    <th className="text-right py-3 px-4">Số Tiền</th>
                    <th className="text-left py-3 px-4">Trạng Thái</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.type === TransactionType.DEPOSIT)
                    .map(tx => (
                      <tr key={tx.id} className="border-b border-gray-700/30 hover:bg-dark-700/50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-gray-300">{tx.userId}</td>
                        <td className="py-3 px-4 text-gray-400 font-mono">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-bold text-green-400">{tx.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tx.status === TransactionStatus.SUCCESS
                              ? 'bg-green-600/30 text-green-400'
                              : 'bg-yellow-600/30 text-yellow-400'
                          }`}>
                            {tx.status === TransactionStatus.SUCCESS ? '✓ Thành công' : '⏳ Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {tx.status === TransactionStatus.PENDING && (
                            <button
                              onClick={() => handleApprove(tx.id)}
                              className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded-lg font-semibold transition"
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
    </div>
  );
};

export default Admin;
