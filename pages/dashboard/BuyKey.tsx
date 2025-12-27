import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEY_PRICING, getDiscount } from '../../constants';
import { storageService } from '../../services/storage';

const BuyKey: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1d');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectedPlan = KEY_PRICING.find(p => p.id === selectedPlanId) || KEY_PRICING[0];
  const discountRate = getDiscount(quantity);
  const subtotal = selectedPlan.price * quantity;
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  const handleBuy = async () => {
    const user = storageService.getCurrentUser();
    if (!user) return;

    if (user.balance < total) {
      const missingAmount = total - user.balance;
      alert(`Số dư không đủ! Bạn còn thiếu ${missingAmount.toLocaleString('vi-VN')} VND. Vui lòng nạp thêm tiền để thực hiện giao dịch.`);
      navigate('/dashboard/deposit');
      return;
    }

    if(!window.confirm(`Xác nhận mua ${quantity} key loại ${selectedPlan.durationLabel} với giá ${total.toLocaleString('vi-VN')} VND?`)) {
        return;
    }

    setLoading(true);
    try {
      await storageService.buyKey(user.id, selectedPlan.id, quantity, selectedPlan.price, total);
      alert("Mua key thành công! Vui lòng kiểm tra trong mục Lịch Sử.");
      navigate('/dashboard/history');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
        <i className="fas fa-shopping-cart mr-2 text-gold-500"></i>
        Mua Key Bản Quyền
      </h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Plan Selection */}
          <div className="bg-dark-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-gray-300 mb-4">1. Chọn Thời Hạn</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {KEY_PRICING.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`
                    cursor-pointer p-4 rounded-lg border text-center transition-all relative overflow-hidden
                    ${selectedPlanId === plan.id 
                      ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                      : 'border-gray-600 bg-dark-900 hover:bg-dark-700'}
                  `}
                >
                  <div className="text-white font-bold text-lg mb-1">{plan.durationLabel}</div>
                  <div className="text-gold-500 font-mono">{plan.price.toLocaleString('vi-VN')} đ</div>
                  {plan.id === '1m' && <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-bl">HOT</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="bg-dark-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-gray-300 mb-4">2. Số Lượng Key</h3>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-dark-700 rounded-lg text-white hover:bg-gold-500 hover:text-black font-bold transition"
               >-</button>
               <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 h-12 bg-dark-900 border border-gray-600 rounded-lg text-center text-xl font-bold text-white focus:border-gold-500 focus:outline-none"
               />
               <button 
                 onClick={() => setQuantity(quantity + 1)}
                 className="w-12 h-12 bg-dark-700 rounded-lg text-white hover:bg-gold-500 hover:text-black font-bold transition"
               >+</button>
            </div>
            
            {/* Discount Info */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className={`p-2 rounded border ${quantity >= 3 && quantity < 6 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-dark-900 border-gray-700 text-gray-500'}`}>
                    Mua &ge; 3: Giảm 15%
                </div>
                <div className={`p-2 rounded border ${quantity >= 6 && quantity < 10 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-dark-900 border-gray-700 text-gray-500'}`}>
                    Mua &ge; 6: Giảm 25%
                </div>
                <div className={`p-2 rounded border ${quantity >= 10 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-dark-900 border-gray-700 text-gray-500'}`}>
                    Mua &ge; 10: Giảm 35%
                </div>
            </div>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-6 rounded-xl border border-gold-600/50 shadow-lg sticky top-6">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Hóa Đơn</h3>
                
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400">
                        <span>Đơn giá:</span>
                        <span>{selectedPlan.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Số lượng:</span>
                        <span>x {quantity}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Tạm tính:</span>
                        <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                        <span>Chiết khấu ({(discountRate * 100).toFixed(0)}%):</span>
                        <span>- {discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>

                <div className="border-t border-gray-600 pt-4 mb-6">
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-white">Tổng cộng:</span>
                        <span className="font-extrabold text-3xl text-gold-500">{total.toLocaleString('vi-VN')}</span>
                    </div>
                </div>

                <button 
                    onClick={handleBuy}
                    disabled={loading}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-black font-extrabold py-4 rounded-lg text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.4)] transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    {loading ? 'Đang xử lý...' : 'THANH TOÁN NGAY'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default BuyKey;