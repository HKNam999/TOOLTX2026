import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { APP_NAME } from '../constants';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }

      if (password !== confirmPassword) {
        throw new Error("Mật khẩu nhập lại không khớp");
      }
      
      await storageService.register(username, password);
      await storageService.login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 bg-[url('https://picsum.photos/seed/tech-bg/1920/1080')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 bg-dark-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <img src="https://picsum.photos/seed/logo-vip/80/80" alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-gold-500" />
          <h2 className="text-3xl font-bold text-white">{APP_NAME}</h2>
          <p className="text-gray-400 mt-2">
            Tạo tài khoản mới
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition"
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition pr-10"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold-500 transition"
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Nhập lại mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-900 border border-gray-600 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition pr-10"
                placeholder="Xác nhận mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold-500 transition"
              >
                <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 rounded-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Đã có tài khoản?
            <Link
              to="/login"
              className="text-gold-500 font-bold ml-2 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
