import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdaylar, deleteAday, emesemAdayKaydet, hizliGiris } from '../services/api';

function Adaylar() {
  const [adaylar, setAdaylar] = useState([]);
  const [search, setSearch] = useState('');
  const [alan, setAlan] = useState('');
  const [durum, setDurum] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showHizliGiris, setShowHizliGiris] = useState(false);
  const [hizliMetin, setHizliMetin] = useState('');
  const [hizliSonuc, setHizliSonuc] = useState(null);
  const [hizliLoading, setHizliLoading] = useState(false);

  useEffect(() => {
    loadAdaylar();
  }, [search, alan, durum]);

  const loadAdaylar = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (alan) params.alan = alan;
      if (durum) params.durum = durum;

      const response = await getAdaylar(params);
      setAdaylar(response.data);
    } catch (err) {
      setError('Adaylar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu adayı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteAday(id);
      setMessage('Aday silindi');
      loadAdaylar();
    } catch (err) {
      setError('Aday silinirken hata oluştu');
    }
  };

  const handleEmesemKayit = async (id) => {
    try {
      const response = await emesemAdayKaydet(id);
      setMessage(response.data.message);
      loadAdaylar();
    } catch (err) {
      setError(err.response?.data?.message || 'E-MESEM kaydı başarısız');
    }
  };

  const handleHizliGiris = async () => {
    if (!hizliMetin.trim()) {
      setError('Lütfen yapıştırılacak metni girin');
      return;
    }

    setHizliLoading(true);
    setError('');
    setMessage('');
    setHizliSonuc(null);

    try {
      const response = await hizliGiris(hizliMetin);
      setHizliSonuc(response.data);
      setMessage(`${response.data.eklenen} aday başarıyla eklendi`);
      setHizliMetin('');
      loadAdaylar();
    } catch (err) {
      setError(err.response?.data?.error || 'Hızlı giriş sırasında hata oluştu');
    } finally {
      setHizliLoading(false);
    }
  };

  const getDurumBadge = (durum) => {
    const classes = {
      'Kayıtlı': 'badge-success',
      'Bekliyor': 'badge-warning',
      'Hata': 'badge-danger'
    };
    return <span className={`badge ${classes[durum] || 'badge-info'}`}>{durum || 'Bekliyor'}</span>;
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#1a237e' }}>Adaylar</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-info" onClick={() => setShowHizliGiris(!showHizliGiris)}>
            Hızlı Giriş
          </button>
          <Link to="/adaylar/yeni" className="btn btn-success">+ Yeni Aday</Link>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Hızlı Giriş Paneli */}
      {showHizliGiris && (
        <div className="card" style={{ border: '2px solid #0277bd' }}>
          <div className="card-header">
            <h2>Hızlı Giriş (Panodan Yapıştır)</h2>
          </div>
          <p style={{ marginBottom: 15, color: '#666', fontSize: 14 }}>
            E-MESEM veya Excel'den kopyaladığınız verileri aşağıya yapıştırın. Her satır bir aday olarak kaydedilir.
            Format: <strong>Başvuru No, Ad, Soyad, Kimlik No, Alan, Dal, Öğrenim Yılı, Telefon, E-posta</strong>
            (Sekme, virgül veya noktalı virgül ile ayrılabilir)
          </p>
          <textarea
            value={hizliMetin}
            onChange={(e) => setHizliMetin(e.target.value)}
            placeholder="Örn:&#10;2024-001, Ahmet, Yılmaz, 12345678901, Bilişim Teknolojileri, Web Programcılığı, 2024-2025, 05551234567, ahmet@example.com&#10;2024-002, Mehmet, Demir, 12345678902, Elektrik-Elektronik Teknolojisi, Elektrik Tesisatları, 2024-2025, 05559876543, mehmet@example.com"
            style={{
              width: '100%',
              minHeight: 150,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontFamily: 'monospace',
              fontSize: 13,
              marginBottom: 15
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleHizliGiris} disabled={hizliLoading}>
              {hizliLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setHizliMetin(''); setHizliSonuc(null); }}>
              Temizle
            </button>
          </div>

          {hizliSonuc && (
            <div style={{ marginTop: 20 }}>
              <div className="alert alert-info">
                <strong>Sonuç:</strong> Toplam {hizliSonuc.toplam} satır, {hizliSonuc.eklenen} başarıyla eklendi, {hizliSonuc.hatalar.length} hata
              </div>
              {hizliSonuc.hatalar.length > 0 && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Satır</th>
                        <th>Hata Mesajı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hizliSonuc.hatalar.map((hata, index) => (
                        <tr key={index}>
                          <td>{hata.satir}</td>
                          <td>{hata.mesaj}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Ara: ad, soyad, kimlik no, başvuru no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={alan} onChange={(e) => setAlan(e.target.value)}>
          <option value="">Tüm Alanlar</option>
          <option value="Bilişim Teknolojileri">Bilişim Teknolojileri</option>
          <option value="Elektrik-Elektronik Teknolojisi">Elektrik-Elektronik Teknolojisi</option>
          <option value="Makine Teknolojisi">Makine Teknolojisi</option>
          <option value="Metal Teknolojisi">Metal Teknolojisi</option>
          <option value="Motorlu Araçlar Teknolojisi">Motorlu Araçlar Teknolojisi</option>
          <option value="Tesisat Teknolojisi ve İklimlendirme">Tesisat Teknolojisi ve İklimlendirme</option>
          <option value="Mobilya ve İç Mekan Tasarımı">Mobilya ve İç Mekan Tasarımı</option>
          <option value="Gıda Teknolojisi">Gıda Teknolojisi</option>
          <option value="Kimya Teknolojisi">Kimya Teknolojisi</option>
          <option value="İnşaat Teknolojisi">İnşaat Teknolojisi</option>
          <option value="Giyim Üretim Teknolojisi">Giyim Üretim Teknolojisi</option>
          <option value="Matbaa Teknolojisi">Matbaa Teknolojisi</option>
          <option value="Tarım Teknolojileri">Tarım Teknolojileri</option>
          <option value="Karşılığı Yok">Karşılığı Yok</option>
        </select>
        <select value={durum} onChange={(e) => setDurum(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option value="Kayıtlı">Kayıtlı</option>
          <option value="Bekliyor">Bekliyor</option>
          <option value="Hata">Hata</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Başvuru No</th>
                <th>Sıra No</th>
                <th>Adı Soyadı</th>
                <th>Kimlik No</th>
                <th>Alan</th>
                <th>Dal</th>
                <th>MYK Kodu</th>
                <th>Sınav Türü</th>
                <th>Sınav Tarihi</th>
                <th>Sınav Sonucu</th>
                <th>Durum</th>
                <th>İşlemler</th>

              </tr>
            </thead>
            <tbody>
              {adaylar.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: 30 }}>
                    Aday bulunamadı
                  </td>
                </tr>
              ) : (
                adaylar.map((aday) => (
                  <tr key={aday.id}>
                    <td>{aday.basvuru_no || '-'}</td>
                    <td>{aday.sira_no || '-'}</td>
                    <td>{aday.adi} {aday.soyadi}</td>
                    <td>{aday.kimlik_no || '-'}</td>
                    <td>{aday.alan || '-'}</td>
                    <td>{aday.dal || '-'}</td>
                    <td>{aday.myk_kod || '-'}</td>
                    <td>{aday.sinav_turu || '-'}</td>
                    <td>{aday.sinav_tarihi || '-'}</td>
                    <td>{aday.sinav_sonucu || '-'}</td>
                    <td>{getDurumBadge(aday.emesem_kayit_durumu)}</td>

                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <Link to={`/adaylar/${aday.id}`} className="btn btn-info btn-sm">Düzenle</Link>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEmesemKayit(aday.id)}
                          title="E-MESEM'e kaydet"
                        >
                          E-MESEM
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(aday.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Adaylar;
