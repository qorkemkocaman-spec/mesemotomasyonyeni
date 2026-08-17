import React, { useState, useEffect } from 'react';
import { getAdaylar, emesemBaglan, emesemDurum, emesemKayitEkrani, emesemTopluKayit, getLoglar, emesemOtomatikGiris } from '../services/api';

function Otomasyon() {
  const [adaylar, setAdaylar] = useState([]);
  const [loglar, setLoglar] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bagli, setBagli] = useState(false);
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [port, setPort] = useState(9222);
  const [showOtomatikGiris, setShowOtomatikGiris] = useState(false);
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [otomatikGirisLoading, setOtomatikGirisLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adaylarRes, loglarRes] = await Promise.all([
        getAdaylar(),
        getLoglar()
      ]);
      setAdaylar(adaylarRes.data);
      setLoglar(loglarRes.data);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
    }
  };

  // Tarayıcıya bağlan
  const handleBaglan = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await emesemBaglan(port);
      setMessage(response.data.message);
      setBagli(true);
      
      // Giriş durumunu kontrol et
      const durumRes = await emesemDurum();
      setGirisYapildi(durumRes.data.success);
      if (!durumRes.data.success) {
        setError(durumRes.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Tarayıcıya bağlanılamadı');
      setBagli(false);
    } finally {
      setLoading(false);
    }
  };

  // Otomatik giriş (Robot)
  const handleOtomatikGiris = async () => {
    if (!kullaniciAdi.trim() || !sifre.trim()) {
      setError('Kullanıcı adı ve şifre zorunludur');
      return;
    }

    setOtomatikGirisLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await emesemOtomatikGiris(kullaniciAdi, sifre);
      setMessage(response.data.message);
      setGirisYapildi(response.data.success);
      setSifre('');
      setShowOtomatikGiris(false);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Otomatik giriş başarısız');
    } finally {
      setOtomatikGirisLoading(false);
    }
  };

  // Giriş durumunu kontrol et
  const handleDurumKontrol = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await emesemDurum();
      setGirisYapildi(response.data.success);
      if (response.data.success) {
        setMessage(response.data.message);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Durum kontrol edilemedi');
    } finally {
      setLoading(false);
    }
  };

  // Kayıt ekranına git
  const handleKayitEkrani = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await emesemKayitEkrani();
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt ekranına gidilemedi');
    } finally {
      setLoading(false);
    }
  };

  // Toplu kayıt
  const handleTopluKayit = async () => {
    if (selected.length === 0) {
      setError('Lütfen en az bir aday seçin');
      return;
    }

    if (!window.confirm(`${selected.length} aday E-MESEM sistemine kaydedilecek. Devam edilsin mi?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await emesemTopluKayit(selected);
      const basarili = response.data.filter(r => r.success).length;
      const hatali = response.data.filter(r => !r.success).length;
      setMessage(`${basarili} aday başarıyla kaydedildi, ${hatali} adayda hata oluştu`);
      setSelected([]);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Toplu kayıt sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === adaylar.length) {
      setSelected([]);
    } else {
      setSelected(adaylar.map(a => a.id));
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1a237e', marginBottom: 30 }}>E-MESEM Otomasyon</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Adım 1: Tarayıcıya Bağlan */}
      <div className="card">
        <div className="card-header">
          <h2>1. Adım: Tarayıcıya Bağlan</h2>
          {bagli && <span className="badge badge-success">Bağlı</span>}
        </div>
        <p style={{ marginBottom: 15, color: '#666', fontSize: 14 }}>
          E-MESEM otomasyonu için Chrome tarayıcınızı özel bir modda açmanız gerekmektedir. Bunun için:
        </p>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '12px 16px', 
          borderRadius: 6, 
          fontFamily: 'monospace', 
          fontSize: 13,
          marginBottom: 15,
          border: '1px solid #ddd'
        }}>
          chrome.exe --remote-debugging-port=9222
        </div>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '12px 16px', 
          borderRadius: 6, 
          marginBottom: 15,
          border: '1px solid #90caf9'
        }}>
          <strong style={{ color: '#1565c0' }}>📌 Nasıl Yapılır?</strong>
          <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20, color: '#333', fontSize: 14, lineHeight: 1.8 }}>
            <li><strong>Chrome'u tamamen kapatın</strong> (tüm Chrome pencerelerini kapatın)</li>
            <li><strong>Windows + R</strong> tuşlarına basın, Çalıştır penceresi açılacak</li>
            <li>Aşağıdaki komutu yapıştırın ve <strong>Enter</strong>'a basın:</li>
          </ol>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '8px 12px', 
            borderRadius: 4, 
            fontFamily: 'monospace', 
            fontSize: 13,
            marginTop: 8,
            border: '1px solid #90caf9'
          }}>
            chrome.exe --remote-debugging-port=9222
          </div>
          <p style={{ marginTop: 8, marginBottom: 0, color: '#333', fontSize: 14 }}>
            <strong>Alternatif:</strong> Komut İstemi (CMD) açıp şu komutu da çalıştırabilirsiniz:
          </p>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '8px 12px', 
            borderRadius: 4, 
            fontFamily: 'monospace', 
            fontSize: 13,
            marginTop: 8,
            border: '1px solid #90caf9'
          }}>
            "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
          </div>
        </div>
        <p style={{ marginBottom: 15, color: '#666', fontSize: 14 }}>
          Chrome'u bu şekilde açtıktan sonra <strong>https://e-mesem.meb.gov.tr/</strong> adresine gidin.
          Ardından aşağıdaki butonlardan birini kullanarak giriş yapabilirsiniz.
        </p>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, width: 150 }}>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="Port"
            />
          </div>
          <button className="btn btn-primary" onClick={handleBaglan} disabled={loading}>
            {loading ? 'Bağlanılıyor...' : 'Tarayıcıya Bağlan'}
          </button>
          <button className="btn btn-warning" onClick={() => setShowOtomatikGiris(!showOtomatikGiris)}>
            🤖 Otomatik Giriş (Robot)
          </button>
          {bagli && (
            <button className="btn btn-info" onClick={handleDurumKontrol} disabled={loading}>
              Giriş Durumunu Kontrol Et
            </button>
          )}
        </div>

        {/* Otomatik Giriş Paneli */}
        {showOtomatikGiris && (
          <div style={{ marginTop: 20, padding: 20, backgroundColor: '#fff8e1', borderRadius: 8, border: '1px solid #ffc107' }}>
            <h3 style={{ marginBottom: 15, color: '#e65100' }}>🤖 E-MESEM Otomatik Giriş</h3>
            <p style={{ marginBottom: 15, color: '#666', fontSize: 14 }}>
              MEBBİS kullanıcı adı ve şifrenizi girin. Sistem otomatik olarak E-MESEM'e giriş yapacaktır.
              Güvenlik kodu veya MEB Ajanda doğrulaması gerekiyorsa, bu adımları manuel olarak tamamlamanız gerekecektir.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                <input
                  type="text"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  placeholder="MEBBİS Kullanıcı Adı"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                <input
                  type="password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="MEBBİS Şifre"
                />
              </div>
              <button className="btn btn-warning" onClick={handleOtomatikGiris} disabled={otomatikGirisLoading}>
                {otomatikGirisLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adım 2: Giriş Durumu */}
      {bagli && (
        <div className="card">
          <div className="card-header">
            <h2>2. Adım: E-MESEM Giriş Durumu</h2>
            {girisYapildi ? (
              <span className="badge badge-success">Giriş Yapıldı</span>
            ) : (
              <span className="badge badge-warning">Giriş Bekleniyor</span>
            )}
          </div>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 15 }}>
            {girisYapildi 
              ? 'E-MESEM oturumunuz aktif. Kayıt ekranına geçebilirsiniz.'
              : 'Lütfen Chrome tarayıcınızda E-MESEM sistemine giriş yapın ve kayıt ekranına gelin.'}
          </p>
          {girisYapildi && (
            <button className="btn btn-success" onClick={handleKayitEkrani} disabled={loading}>
              Kayıt Ekranına Git
            </button>
          )}
        </div>
      )}

      {/* Adım 3: Toplu Kayıt */}
      {girisYapildi && (
        <div className="card">
          <div className="card-header">
            <h2>3. Adım: Toplu Kayıt</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" onClick={handleTopluKayit} disabled={loading || selected.length === 0}>
                Seçilenleri Kaydet ({selected.length})
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === adaylar.length && adaylar.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Başvuru No</th>
                  <th>Adı Soyadı</th>
                  <th>Kimlik No</th>
                  <th>Alan</th>
                  <th>Sınav Türü</th>
                  <th>Sınav Tarihi</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {adaylar.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: 30 }}>
                      Aday bulunamadı
                    </td>
                  </tr>
                ) : (
                  adaylar.map((aday) => (
                    <tr key={aday.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(aday.id)}
                          onChange={() => toggleSelect(aday.id)}
                        />
                      </td>
                      <td>{aday.basvuru_no || '-'}</td>
                      <td>{aday.adi} {aday.soyadi}</td>
                      <td>{aday.kimlik_no || '-'}</td>
                      <td>{aday.alan || '-'}</td>
                      <td>{aday.sinav_turu || '-'}</td>
                      <td>{aday.sinav_tarihi || '-'}</td>
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
      )}

      {/* Loglar */}
      <div className="card">
        <div className="card-header">
          <h2>Otomasyon Logları</h2>
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
                  <td colSpan="5" style={{ textAlign: 'center', padding: 30 }}>
                    Henüz otomasyon işlemi yapılmamış
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

export default Otomasyon;
