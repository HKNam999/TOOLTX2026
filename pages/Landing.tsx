import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <img src="https://picsum.photos/seed/logo-vip/40/40" alt="Logo" className="w-10 h-10 rounded-full border border-gold-500" />
          <span className="text-2xl font-bold text-gold-500">{APP_NAME}</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="px-6 py-2 rounded-full border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black transition font-bold">
            Đăng Nhập
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 lg:py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://picsum.photos/seed/casino-bg/1920/1080')] bg-cover bg-center"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-dark-900/80 to-dark-900"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-yellow-600">
              CÔNG CỤ DỰ ĐOÁN
            </span>
            <br />
            CHÍNH XÁC NHẤT 2026
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Hệ thống phân tích dữ liệu AI chuyên sâu cho Tài Xỉu, Sicbo, Xóc Đĩa, Baccarat. 
            Tỷ lệ thắng lên đến 92%.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/login" className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-black text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.5)] transition transform hover:-translate-y-1">
              Đăng Ký Ngay
            </Link>
            <a href="#features" className="px-8 py-4 bg-dark-800 hover:bg-dark-700 text-white border border-gray-600 text-lg font-bold rounded-lg transition">
              Tìm Hiểu Thêm
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-dark-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16 text-gold-500">TÍNH NĂNG NỔI BẬT</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Tài Xỉu (Tai Xiu)", icon: "fa-dice", desc: "Thuật toán soi cầu chuẩn xác theo thời gian thực." },
              { title: "Xóc Đĩa", icon: "fa-circle-notch", desc: "Dự đoán chẵn lẻ với tỷ lệ chính xác cao." },
              { title: "Baccarat", icon: "fa-playing-card", desc: "Phân tích Player/Banker dựa trên lịch sử cầu." },
              { title: "Sicbo", icon: "fa-dice-d6", desc: "Thống kê xúc xắc nhanh chóng và tiện lợi." },
            ].map((f, i) => (
              <div key={i} className="bg-dark-900 p-8 rounded-2xl border border-gray-700 hover:border-gold-500 transition hover:shadow-lg group">
                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-6 text-gold-500 group-hover:scale-110 transition">
                  <i className={`fas ${f.icon} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-6 bg-dark-900 border-t border-gray-800">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Bảng Giá Hợp Lý</h2>
            <p className="text-gray-400 mb-12">Thuê theo giờ hoặc mua vĩnh viễn với chiết khấu cực cao.</p>
            <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 w-64">
                    <h3 className="text-gold-500 font-bold text-xl">1 Giờ</h3>
                    <p className="text-2xl font-bold text-white my-4">5.000 VND</p>
                    <p className="text-sm text-gray-500">Dùng thử trải nghiệm</p>
                </div>
                <div className="bg-gradient-to-b from-dark-800 to-dark-700 p-6 rounded-xl border border-gold-600 w-64 transform scale-105 shadow-xl relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">BEST CHOICE</div>
                    <h3 className="text-gold-500 font-bold text-xl">1 Ngày</h3>
                    <p className="text-2xl font-bold text-white my-4">20.000 VND</p>
                    <p className="text-sm text-gray-500">Thoải mái sử dụng 24h</p>
                </div>
                <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 w-64">
                    <h3 className="text-gold-500 font-bold text-xl">Vĩnh Viễn</h3>
                    <p className="text-2xl font-bold text-white my-4">250.000 VND</p>
                    <p className="text-sm text-gray-500">Mua 1 lần dùng mãi mãi</p>
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-dark-950 py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2026 {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;