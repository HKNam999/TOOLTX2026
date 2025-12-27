import React, { useEffect, useState } from 'react';
import { storageService } from '../../services/storage';
import { Transaction, TransactionType, TransactionStatus } from '../../types';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = storageService.getCurrentUser();
    if (user) {
      setTransactions(storageService.getTransactions(user.id));
    }
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deposits = filteredTransactions.filter(t => t.type === TransactionType.DEPOSIT);
  const buyKeys = filteredTransactions.filter(t => t.type === TransactionType.BUY_KEY);

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case TransactionStatus.PENDING: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case TransactionStatus.FAILED: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-8">
      
      {/* Search Bar */}
      <div className="relative">
        <input 
            type="text"
            placeholder="Tìm kiếm mã giao dịch hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
        />
        <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"></i>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: DEPOSITS */}
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2 flex items-center">
                <i className="fas fa-wallet mr-2 text-gold-500"></i>
                Lịch Sử Nạp Tiền
                {searchTerm && <span className="text-sm font-normal text-gray-500 ml-4">(Kết quả tìm kiếm: {deposits.length})</span>}
            </h2>
            <div className="bg-dark-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-900 text-gray-200 uppercase font-medium">
                    <tr>
                        <th className="px-6 py-4">Mã GD</th>
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4">Ngân hàng</th>
                        <th className="px-6 py-4 text-right">Số tiền</th>
                        <th className="px-6 py-4 text-center">Trạng thái</th>
                        <th className="px-6 py-4">Nội dung</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                    {deposits.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            {searchTerm ? 'Không tìm thấy giao dịch nạp tiền phù hợp' : 'Chưa có giao dịch nạp tiền'}
                        </td></tr>
                    ) : (
                        deposits.map((tx) => (
                            <tr key={tx.id} className="hover:bg-dark-700/50 transition">
                                <td className="px-6 py-4 font-mono text-xs text-white">{tx.id}</td>
                                <td className="px-6 py-4">{formatDate(tx.createdAt)}</td>
                                <td className="px-6 py-4 text-white">{tx.metadata?.bankName || 'N/A'}</td>
                                <td className="px-6 py-4 text-right font-bold text-green-400">+{tx.amount.toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">{tx.description}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>

        {/* SECTION 2: KEY PURCHASES */}
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2 flex items-center">
                <i className="fas fa-key mr-2 text-gold-500"></i>
                Lịch Sử Mua Key
                {searchTerm && <span className="text-sm font-normal text-gray-500 ml-4">(Kết quả tìm kiếm: {buyKeys.length})</span>}
            </h2>
            <div className="bg-dark-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-dark-900 text-gray-200 uppercase font-medium">
                    <tr>
                        <th className="px-6 py-4">Mã Đơn</th>
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4">Chi tiết đơn</th>
                        <th className="px-6 py-4 text-right">Tổng tiền</th>
                        <th className="px-6 py-4">Danh sách Key / Hết hạn</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                    {buyKeys.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            {searchTerm ? 'Không tìm thấy lịch sử mua key phù hợp' : 'Chưa có lịch sử mua key'}
                        </td></tr>
                    ) : (
                        buyKeys.map((tx) => (
                            <tr key={tx.id} className="hover:bg-dark-700/50 transition">
                                <td className="px-6 py-4 font-mono text-xs align-top text-white">{tx.id}</td>
                                <td className="px-6 py-4 align-top">{formatDate(tx.createdAt)}</td>
                                <td className="px-6 py-4 align-top text-white">{tx.description}</td>
                                <td className="px-6 py-4 text-right font-bold text-red-400 align-top">-{tx.amount.toLocaleString('vi-VN')}</td>
                                <td className="px-6 py-4 align-top">
                                    <div className="space-y-2">
                                        {tx.metadata?.keys && Array.isArray(tx.metadata.keys) ? (
                                            tx.metadata.keys.map((k: any, idx: number) => {
                                                const keyStr = typeof k === 'string' ? k : k.code;
                                                const expiry = typeof k === 'object' && k.expiry ? new Date(k.expiry).toLocaleString('vi-VN') : 'N/A';
                                                return (
                                                    <div key={idx} className="bg-dark-900 p-2 rounded border border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <span className="font-mono text-gold-400 font-bold select-all">{keyStr}</span>
                                                        <span className="text-xs text-gray-500">Hết hạn: {expiry}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-gray-500 italic">Không có thông tin key</span>
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
        </div>
      </div>
    </div>
  );
};

export default History;