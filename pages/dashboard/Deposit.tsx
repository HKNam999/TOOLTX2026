import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { BankAccount } from '../../types';

const Deposit: React.FC = () => {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [amount, setAmount] = useState<string>('50000');
  const [order, setOrder] = useState<any>(null); // Holds the created pending transaction
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Select & Create, 2: Show QR
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Load admin configured banks
    const bankList = storageService.adminGetBanks();
    setBanks(bankList);
    if(bankList.length > 0) setSelectedBankId(bankList[0].id);
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (step === 2 && order) {
        // Calculate initial remaining time based on order creation
        const updateTimer = () => {
            const createdTime = new Date(order.createdAt).getTime();
            const now = new Date().getTime();
            const validDuration = 20 * 60 * 1000; // 20 minutes in ms
            const remaining = Math.max(0, Math.floor((createdTime + validDuration - now) / 1000));
            setTimeLeft(remaining);
        };
        
        updateTimer(); // Run once immediately
        interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [step, order]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleCreateOrder = async () => {
    const user = storageService.getCurrentUser();
    if (!user) return;
    
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''));
    if (isNaN(numAmount) || numAmount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000 VND");
      return;
    }

    if (!selectedBankId) {
        alert("Vui lòng chọn ngân hàng!");
        return;
    }

    setLoading(true);
    try {
      // Create pending transaction in system
      const tx = await storageService.createDepositOrder(user.id, numAmount, selectedBankId);
      setOrder(tx);
      setStep(2);
      // alert("Tạo đơn hàng thành công! Vui lòng quét mã QR hoặc chuyển khoản theo đúng nội dung bên dưới.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Confirmation prompt before going back
    if (window.confirm("Bạn có chắc chắn muốn hủy giao dịch này để quay lại tạo đơn mới không?")) {
        setStep(1);
        setOrder(null);
    }
  };

  const getQRLink = () => {
    if(!order || !order.metadata) return '';
    const { bankBin, accountNumber } = order.metadata;
    const { description, amount } = order;
    // Template qr_only is requested
    return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-qr_only.png?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(order.metadata.accountName)}`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
        <i className="fas fa-wallet mr-2 text-gold-500"></i>
        Nạp Tiền Tài Khoản
      </h2>

      {step === 1 && (
        <div className="bg-dark-800 p-8 rounded-xl border border-gray-700 shadow-lg">
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 font-medium">Chọn Ngân Hàng</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {banks.map((bank) => (
                <div 
                  key={bank.id}
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                    selectedBankId === bank.id 
                    ? 'border-gold-500 bg-gold-500/10' 
                    : 'border-gray-600 bg-dark-900 hover:border-gray-400'
                  }`}
                >
                  <div className="h-10 flex items-center justify-center font-bold text-sm">
                    {/* Placeholder for logo since we can't upload assets */}
                    {bank.bankName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{bank.accountName}</div>
                </div>
              ))}
            </div>
            {banks.length === 0 && <p className="text-red-500 text-sm mt-2">Chưa có ngân hàng nào được cấu hình bởi Admin.</p>}
          </div>

          <div className="mb-8">
            <label className="block text-gray-400 mb-2 font-medium">Số Tiền Nạp</label>
            <div className="relative">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-dark-900 border border-gray-600 rounded-lg p-4 text-xl text-white font-bold focus:border-gold-500 focus:outline-none"
                    placeholder="VD: 50000"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">VND</span>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {[50000, 100000, 200000, 500000, 1000000].map(val => (
                    <button 
                        key={val} 
                        onClick={() => setAmount(val.toString())}
                        className="bg-dark-700 hover:bg-dark-600 px-3 py-1 rounded-full text-xs text-gray-300 whitespace-nowrap"
                    >
                        {formatCurrency(val)}
                    </button>
                ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={loading || banks.length === 0}
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-4 rounded-lg text-lg transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <i className="fas fa-spinner fa-spin"></i>}
            {loading ? 'Đang tạo đơn...' : 'Tạo Mã QR Chuyển Khoản'}
          </button>
        </div>
      )}

      {step === 2 && order && (
        <div className="bg-dark-800 p-8 rounded-xl border border-gray-700 shadow-lg text-center relative">
            
           {/* Back Icon Button */}
           <button 
                type="button"
                onClick={handleBack}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-dark-700 hover:bg-red-600 hover:text-white rounded-full text-gray-400 border border-gray-600 hover:border-red-500 transition-all z-20 shadow-md"
                title="Hủy & Quay lại"
           >
               <i className="fas fa-arrow-left"></i>
           </button>

           <div className="mb-6 mt-2">
                <p className="text-sm text-gray-400 mb-2">Đơn hàng hết hạn sau</p>
                <div className={`text-3xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gold-500'}`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : 'ĐÃ HẾT HẠN'}
                </div>
           </div>
           
           <div className="bg-white p-4 inline-block rounded-lg mb-6 shadow-inner">
                <img src={getQRLink()} alt="QR Code" className="w-64 h-64 object-contain" />
           </div>

           <div className="bg-dark-900 rounded-lg p-4 text-left space-y-3 mb-2 border border-gray-600">
               <div className="flex justify-between border-b border-gray-700 pb-2">
                   <span className="text-gray-400">Ngân hàng:</span>
                   <span className="font-bold text-white uppercase">{order.metadata.bankName}</span>
               </div>
               <div className="flex justify-between border-b border-gray-700 pb-2">
                   <span className="text-gray-400">Số tài khoản:</span>
                   <span className="font-bold text-gold-400 tracking-wider copy-text cursor-pointer select-all" title="Click to copy">{order.metadata.accountNumber}</span>
               </div>
               <div className="flex justify-between border-b border-gray-700 pb-2">
                   <span className="text-gray-400">Chủ tài khoản:</span>
                   <span className="font-bold text-white uppercase">{order.metadata.accountName}</span>
               </div>
               <div className="flex justify-between border-b border-gray-700 pb-2">
                   <span className="text-gray-400">Số tiền:</span>
                   <span className="font-bold text-green-400 text-lg">{formatCurrency(order.amount)}</span>
               </div>
               <div className="flex justify-between pt-1">
                   <span className="text-gray-400">Nội dung chuyển khoản:</span>
                   <span className="font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30 select-all">{order.description}</span>
               </div>
               <p className="text-xs text-center text-gray-500 italic mt-2">
                   *Vui lòng nhập chính xác Nội Dung Chuyển Khoản để được cộng tiền tự động.
               </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;