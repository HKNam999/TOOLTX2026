import React, { useEffect, useState } from 'react';
import { storageService } from '../../services/storage';
import { Transaction, TransactionType, TransactionStatus } from '../../types';

type SortField = 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'deposits' | 'purchases'>('deposits');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const user = storageService.getCurrentUser();
    if (user) {
      setTransactions(storageService.getTransactions(user.id));
    }
  }, []);

  const getFilteredTransactions = () => {
    const typeFilter = activeTab === 'deposits' ? TransactionType.DEPOSIT : TransactionType.BUY_KEY;
    return transactions.filter(t => 
      t.type === typeFilter && (
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getSortedTransactions = () => {
    const filtered = getFilteredTransactions();
    return [...filtered].sort((a, b) => {
      let compareA: any = a.createdAt;
      let compareB: any = b.createdAt;

      if (sortField === 'amount') {
        compareA = a.amount;
        compareB = b.amount;
      } else if (sortField === 'status') {
        compareA = a.status;
        compareB = b.status;
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case TransactionStatus.PENDING: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case TransactionStatus.FAILED: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 hover:text-gold-400 transition whitespace-nowrap ${
        sortField === field ? 'text-gold-500 font-bold' : 'text-gray-400'
      }`}
    >
      <span>{label}</span>
      {sortField === field && (
        <i className={`fas fa-arrow-${sortOrder === 'asc' ? 'up' : 'down'} text-xs`}></i>
      )}
    </button>
  );

  const depositTransactions = getSortedTransactions();
  const stats = {
    total: activeTab === 'deposits' 
      ? depositTransactions.reduce((sum, t) => sum + t.amount, 0)
      : depositTransactions.length,
    pending: depositTransactions.filter(t => t.status === TransactionStatus.PENDING).length,
    success: depositTransactions.filter(t => t.status === TransactionStatus.SUCCESS).length
  };

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-700 border border-gray-700/50 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center whitespace-nowrap">
          <i className="fas fa-history text-gold-500 mr-3"></i>Lịch Sử Giao Dịch
        </h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-900/50 border border-gold-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1 whitespace-nowrap">
              {activeTab === 'deposits' ? 'Tổng Nạp' : 'Số Lần Mua'}
            </p>
            <p className="text-2xl font-bold text-gold-400 whitespace-nowrap">
              {activeTab === 'deposits' ? stats.total.toLocaleString('vi-VN') : stats.total}
            </p>
          </div>
          <div className="bg-dark-900/50 border border-green-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1 whitespace-nowrap">Thành Công</p>
            <p className="text-2xl font-bold text-green-400 whitespace-nowrap">{stats.success}</p>
          </div>
          <div className="bg-dark-900/50 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1 whitespace-nowrap">Chờ Duyệt</p>
            <p className="text-2xl font-bold text-yellow-400 whitespace-nowrap">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-6 py-3 font-semibold border-b-2 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'deposits'
              ? 'text-gold-500 border-gold-500'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <i className="fas fa-wallet"></i>
          <span>Lịch Sử Nạp Tiền</span>
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-6 py-3 font-semibold border-b-2 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'text-gold-500 border-gold-500'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <i className="fas fa-key"></i>
          <span>Lịch Sử Mua Key</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text"
          placeholder={activeTab === 'deposits' ? 'Tìm kiếm mã giao dịch, nội dung...' : 'Tìm kiếm mã đơn, chi tiết...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
        />
        <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"></i>
      </div>

      {/* Content */}
      {activeTab === 'deposits' && (
        <div className="bg-dark-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-dark-900 text-gray-200 uppercase font-medium">
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-4 whitespace-nowrap">Mã GD</th>
                  <th className="px-4 py-4 whitespace-nowrap cursor-pointer">
                    <SortButton field="date" label="Thời gian" />
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">Ngân hàng</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap cursor-pointer">
                    <SortButton field="amount" label="Số tiền" />
                  </th>
                  <th className="px-4 py-4 text-center whitespace-nowrap cursor-pointer">
                    <SortButton field="status" label="Trạng thái" />
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {depositTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <i className="fas fa-inbox text-2xl mb-2 block"></i>
                      {searchTerm ? 'Không tìm thấy giao dịch phù hợp' : 'Chưa có giao dịch nạp tiền'}
                    </td>
                  </tr>
                ) : (
                  depositTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-dark-700/50 transition">
                      <td className="px-4 py-4 font-mono text-xs text-white whitespace-nowrap">{tx.id}</td>
                      <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                        <div className="text-xs">{formatDate(tx.createdAt)}</div>
                        <div className="text-xs text-gray-500">{formatTime(tx.createdAt)}</div>
                      </td>
                      <td className="px-4 py-4 text-white font-semibold whitespace-nowrap">{tx.metadata?.bankName || 'N/A'}</td>
                      <td className="px-4 py-4 text-right font-bold text-green-400 whitespace-nowrap">+{tx.amount.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border inline-block ${getStatusColor(tx.status)}`}>
                          {tx.status === TransactionStatus.SUCCESS ? '✓ Thành công' : '⏳ Chờ duyệt'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{tx.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="bg-dark-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-dark-900 text-gray-200 uppercase font-medium">
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-4 whitespace-nowrap">Mã Đơn</th>
                  <th className="px-4 py-4 whitespace-nowrap cursor-pointer">
                    <SortButton field="date" label="Thời gian" />
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">Chi tiết đơn</th>
                  <th className="px-4 py-4 text-right whitespace-nowrap cursor-pointer">
                    <SortButton field="amount" label="Tổng tiền" />
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">Danh sách Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {depositTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <i className="fas fa-key text-2xl mb-2 block"></i>
                      {searchTerm ? 'Không tìm thấy lịch sử mua key phù hợp' : 'Chưa có lịch sử mua key'}
                    </td>
                  </tr>
                ) : (
                  depositTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-dark-700/50 transition">
                      <td className="px-4 py-4 font-mono text-xs text-white whitespace-nowrap">{tx.id}</td>
                      <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                        <div className="text-xs">{formatDate(tx.createdAt)}</div>
                        <div className="text-xs text-gray-500">{formatTime(tx.createdAt)}</div>
                      </td>
                      <td className="px-4 py-4 text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">{tx.description}</td>
                      <td className="px-4 py-4 text-right font-bold text-red-400 whitespace-nowrap">-{tx.amount.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {tx.metadata?.keys && Array.isArray(tx.metadata.keys) ? (
                            tx.metadata.keys.slice(0, 2).map((k: any, idx: number) => {
                              const keyStr = typeof k === 'string' ? k : k.code;
                              const expiry = typeof k === 'object' && k.expiry ? new Date(k.expiry).toLocaleDateString('vi-VN') : 'N/A';
                              return (
                                <div key={idx} className="bg-dark-900 p-1.5 rounded border border-gold-500/30 text-xs">
                                  <div className="font-mono text-gold-400 font-bold truncate">{keyStr}</div>
                                  <div className="text-gray-500 text-xs">HH: {expiry}</div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-gray-500 italic text-xs">Không có key</span>
                          )}
                          {tx.metadata?.keys && Array.isArray(tx.metadata.keys) && tx.metadata.keys.length > 2 && (
                            <div className="text-xs text-gold-400 font-semibold">+{tx.metadata.keys.length - 2} key khác</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
