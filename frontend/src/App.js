import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Adaylar from './pages/Adaylar';
import AdayForm from './pages/AdayForm';
import Otomasyon from './pages/Otomasyon';
import ExcelImport from './pages/ExcelImport';
import Evraklar from './pages/Evraklar';
import Ayarlar from './pages/Ayarlar';
import Kullanicilar from './pages/Kullanicilar';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/adaylar" element={<Adaylar />} />
          <Route path="/adaylar/yeni" element={<AdayForm />} />
          <Route path="/adaylar/:id" element={<AdayForm />} />
          <Route path="/otomasyon" element={<Otomasyon />} />
          <Route path="/excel" element={<ExcelImport />} />
          <Route path="/evraklar" element={<Evraklar />} />
          <Route path="/ayarlar" element={<Ayarlar />} />
          <Route path="/kullanicilar" element={<Kullanicilar />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
