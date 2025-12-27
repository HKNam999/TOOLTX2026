import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Transaction, BankAccount, TransactionType, TransactionStatus, BANKS_LIST } from '../types';

const Admin: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  
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
    if(!newAccNum || !newAccName) return;

    const bankDef = BANKS_LIST.find(b => b.name === newBankName);
    if(!bankDef) return;

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
  };

  const handleRemoveBank = (id: string) => {
      if(window.confirm('Xóa ngân hàng này?')) {
          storageService.adminRemoveBank(id);
          refreshData();
      }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-red-500">ADMIN PANEL</h1>
            <Link to="/dashboard" className="text-gray-400 hover:text-white">
                <i className="fas fa-arrow-left mr-2"></i> Quay lại Dashboard
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Bank Management */}
            <div>
                <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 mb-8">
                    <h2 className="text-xl font-bold mb-4 text-white">Thêm Ngân Hàng Mới</h2>
                    <form onSubmit={handleAddBank} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Ngân hàng</label>
                            <select 
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                className="w-full bg-dark-900 border border-gray-600 rounded p-2 text-white"
                            >
                                {BANKS_LIST.map(b => <option key={b.bin} value={b.name}>{b.name} ({b.shortName})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Số Tài Khoản</label>
                            <input 
                                type="text" 
                                value={newAccNum} 
                                onChange={e => setNewAccNum(e.target.value)} 
                                className="w-full bg-dark-900 border border-gray-600 rounded p-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Tên Chủ Tài Khoản</label>
                            <input 
                                type="text" 
                                value={newAccName} 
                                onChange={e => setNewAccName(e.target.value)} 
                                className="w-full bg-dark-900 border border-gray-600 rounded p-2 text-white uppercase"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">
                            Thêm Ngân Hàng
                        </button>
                    </form>
                </div>

                <div className="bg-dark-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-white">Danh Sách Ngân Hàng</h2>
                    <ul className="space-y-3">
                        {banks.map(bank => (
                            <li key={bank.id} className="flex justify-between items-center bg-dark-900 p-3 rounded border border-gray-700">
                                <div>
                                    <div className="font-bold text-gold-500">{bank.bankName}</div>
                                    <div className="text-sm">{bank.accountNumber} - {bank.accountName}</div>
                                </div>
                                <button onClick={() => handleRemoveBank(bank.id)} className="text-red-500 hover:text-red-400">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Column: Transaction Checks */}
            <div>
                 <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 min-h-[500px]">
                    <h2 className="text-xl font-bold mb-4 text-white">Kiểm Tra Đơn Nạp (Deposits)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="bg-dark-900 uppercase text-xs">
                                <tr>
                                    <th className="px-2 py-2">User</th>
                                    <th className="px-2 py-2">Nội dung</th>
                                    <th className="px-2 py-2">Số tiền</th>
                                    <th className="px-2 py-2">TT</th>
                                    <th className="px-2 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions
                                    .filter(t => t.type === TransactionType.DEPOSIT)
                                    .map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-700 hover:bg-dark-700">
                                        <td className="px-2 py-2 font-mono text-xs">{tx.userId}</td>
                                        <td className="px-2 py-2 font-mono text-xs text-white">{tx.description}</td>
                                        <td className="px-2 py-2 text-green-400 font-bold">{tx.amount.toLocaleString()}</td>
                                        <td className="px-2 py-2">
                                            <span className={`text-xs ${tx.status === TransactionStatus.SUCCESS ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2">
                                            {tx.status === TransactionStatus.PENDING && (
                                                <button 
                                                    onClick={() => handleApprove(tx.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white text-xs px-2 py-1 rounded"
                                                >
                                                    Duyệt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;