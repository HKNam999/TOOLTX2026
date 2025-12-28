import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import { storageService } from './services/storage';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/Home';
import Deposit from './pages/dashboard/Deposit';
import BuyKey from './pages/dashboard/BuyKey';
import History from './pages/dashboard/History';
import Admin from './pages/Admin';

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = storageService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = storageService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="buy-key" element={<BuyKey />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* Admin Route */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;