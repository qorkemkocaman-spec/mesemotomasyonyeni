import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>E-MESEM</h2>
        <p>Otomasyon Sistemi</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end>
          <span>📊 Dashboard</span>
        </NavLink>
        <NavLink to="/adaylar">
          <span>👥 Adaylar</span>
        </NavLink>
        <NavLink to="/adaylar/yeni">
          <span>➕ Yeni Aday</span>
        </NavLink>
        <NavLink to="/otomasyon">
          <span>🤖 E-MESEM Otomasyon</span>
        </NavLink>
        <NavLink to="/excel">
          <span>📊 Excel İşlemleri</span>
        </NavLink>
        <NavLink to="/evraklar">
          <span>📄 Evraklar</span>
        </NavLink>
        {user && user.role === 'admin' && (
          <NavLink to="/kullanicilar">
            <span>👤 Kullanıcılar</span>
          </NavLink>
        )}
        <NavLink to="/ayarlar">
          <span>⚙️ Ayarlar</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p style={{ fontSize: 12, marginBottom: 10 }}>
          {user ? user.full_name : ''}
          <br />
          <small style={{ opacity: 0.7 }}>{user ? user.role : ''}</small>
        </p>
        <button className="btn btn-danger btn-sm btn-block" onClick={onLogout}>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
