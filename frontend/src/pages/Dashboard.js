import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIstatistik, getAdaylar, getLoglar } from '../services/api';

function Dashboard() {
  const [istatistik, setIstatistik] = useState(null);
  const [sonAdaylar, setSonAdaylar] = useState([]);
  const [loglar, setLoglar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [istatistikRes, adaylarRes, loglarRes] = await Promise.all([
        getIstatistik(),
        getAdaylar(),
        getLoglar()
      ]);
      setIstatistik(istatistikRes.data);
      setSonAdaylar(adaylarRes.data.slice(0, 5));
      setLoglar(loglarRes.data.slice(0, 5));
    } catch (err) {
      console.error('Dashboard yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 style={{ color: '#1a237e', marginBottom: 30 }}>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{istatistik?.toplam || 0}</div>
          <div className="stat-label">Toplam Aday</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#2e7d32' }}>{istatistik?.kayitli || 0}</div>
          <div className="stat-label">E-MESEM'e Kayıtlı</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f57f17' }}>{istatistik?.bekleyen || 0}</div>
          <div className="stat-label">Kayıt Bekleyen</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#c62828' }}>{istatistik?.hata || 0}</div>
          <div className="stat-label">Hatalı Kayıt</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1565c0' }}>{istatistik?.sinav_planlanan || 0}</div>
          <div className="stat-label">Sınav Planlanan</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#2e7d32' }}>{istatistik?.sinav_basarili || 0}</div>
          <div className="stat-label">Sınavda Başarılı</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#c62828' }}>{istatistik?.sinav_basarisiz || 0}</div>
          <div className="stat-label">Sınavda Başarısız</div>
        </div>
      </div>


      <div className="card">
        <div className="card-header">
          <h2>Son Eklenen Adaylar</h2>
          <Link to="/adaylar" className="btn btn-primary btn-sm">Tümünü Gör</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Başvuru No</th>
                <th>Adı Soyadı</th>
                <th>Alan</th>
                <th>Dal</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {sonAdaylar.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>
                    Henüz aday eklenmemiş. <Link to="/adaylar/yeni">Yeni aday ekleyin</Link>
                  </td>
                </tr>
              ) : (
                sonAdaylar.map((aday) => (
                  <tr key={aday.id}>
                    <td>{aday.basvuru_no || '-'}</td>
                    <td>{aday.adi} {aday.soyadi}</td>
                    <td>{aday.alan || '-'}</td>
                    <td>{aday.dal || '-'}</td>
                    <td>
                      <span className={`badge ${
                        aday.emesem_kayit_durumu === 'Kayıtlı' ? 'badge-success' :
                        aday.emesem_kayit_durumu === 'Hata' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {aday.emesem_kayit_durumu || 'Bekliyor'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Son Otomasyon İşlemleri</h2>
          <Link to="/otomasyon" className="btn btn-primary btn-sm">Otomasyon</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Aday</th>
                <th>İşlem</th>
                <th>Durum</th>
                <th>Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {loglar.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>
                    Henüz otomasyon işlemi yapılmamış.
                  </td>
                </tr>
              ) : (
                loglar.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.tarih).toLocaleString('tr-TR')}</td>
                    <td>{log.adi} {log.soyadi}</td>
                    <td>{log.islem_turu}</td>
                    <td>
                      <span className={`badge ${log.durum === 'Başarılı' ? 'badge-success' : 'badge-danger'}`}>
                        {log.durum}
                      </span>
                    </td>
                    <td>{log.mesaj}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
