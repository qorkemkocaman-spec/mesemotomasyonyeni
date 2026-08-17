import React, { useState, useEffect } from 'react';
import {
  getAdaylar,
  getBasvuruFormu,
  getTopluFormlar,
  getSonucBelgesi,
  getKomisyonListesi,
  getDenklikDefteri,
  getBosForm,
  getSinavGirisBelgesi,
  getSinavSonucBelgesi,
  getUstalikBelgesi,
  getKalfalikBelgesi,
  getKomisyonUyeleri,
  createKomisyonUyesi,
  updateKomisyonUyesi,
  deleteKomisyonUyesi
} from '../services/api';

function Evraklar() {
  const [adaylar, setAdaylar] = useState([]);
  const [komisyonUyeleri, setKomisyonUyeleri] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sablonlar');
  const [komisyonForm, setKomisyonForm] = useState({ ad_soyad: '', gorev: '', unvan: '', sira_no: '' });
  const [editingUye, setEditingUye] = useState(null);

  useEffect(() => {
    loadAdaylar();
    loadKomisyonUyeleri();
  }, []);

  const loadAdaylar = async () => {
    try {
      const response = await getAdaylar();
      setAdaylar(response.data);
    } catch (err) {
      setError('Adaylar yüklenirken hata oluştu');
    }
  };

  const loadKomisyonUyeleri = async () => {
    try {
      const response = await getKomisyonUyeleri();
      setKomisyonUyeleri(response.data);
    } catch (err) {
      setError('Komisyon üyeleri yüklenirken hata oluştu');
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleBasvuruFormu = async (aday) => {
    setLoading(true);
    setError('');
    try {
      const response = await getBasvuruFormu(aday.id);
      downloadFile(response.data, `basvuru-formu-${aday.adi}-${aday.soyadi}.pdf`);
      setMessage('Başvuru formu indirildi');
    } catch (err) {
      setError('Başvuru formu oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSonucBelgesi = async (aday) => {
    setLoading(true);
    setError('');
    try {
      const response = await getSonucBelgesi(aday.id);
      downloadFile(response.data, `sonuc-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      setMessage('Sonuç belgesi indirildi');
    } catch (err) {
      setError('Sonuç belgesi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSinavGirisBelgesi = async (aday) => {
    setLoading(true);
    setError('');
    try {
      const response = await getSinavGirisBelgesi(aday.id);
      downloadFile(response.data, `sinav-giris-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      setMessage('Sınav giriş belgesi indirildi');
    } catch (err) {
      setError('Sınav giriş belgesi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSinavSonucBelgesi = async (aday) => {
    setLoading(true);
    setError('');
    try {
      const response = await getSinavSonucBelgesi(aday.id);
      downloadFile(response.data, `sinav-sonuc-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      setMessage('Sınav sonuç belgesi indirildi');
    } catch (err) {
      setError('Sınav sonuç belgesi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUstalikBelgesi = async (aday) => {
    setLoading(true);
    setError('');
    try {
      const response = await getUstalikBelgesi(aday.id);
      downloadFile(response.data, `ustalik-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      setMessage('Ustalık belgesi indirildi');
    } catch (err) {
      setError('Ustalık belgesi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleKalfalikBelgesi = async (aday) => {
    setLoading(true);
    setError('');
    try {
      const response = await getKalfalikBelgesi(aday.id);
      downloadFile(response.data, `kalfalik-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      setMessage('Kalfalık belgesi indirildi');
    } catch (err) {
      setError('Kalfalık belgesi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleTopluFormlar = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getTopluFormlar();
      downloadFile(response.data, 'toplu-basvuru-formlari.pdf');
      setMessage('Toplu başvuru formları indirildi');
    } catch (err) {
      setError('Toplu formlar oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleKomisyonListesi = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getKomisyonListesi();
      downloadFile(response.data, 'komisyon-listesi.pdf');
      setMessage('Komisyon listesi indirildi');
    } catch (err) {
      setError('Komisyon listesi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDenklikDefteri = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDenklikDefteri();
      downloadFile(response.data, 'denklik-defteri.pdf');
      setMessage('Denklik defteri indirildi');
    } catch (err) {
      setError('Denklik defteri oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBosForm = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getBosForm();
      downloadFile(response.data, 'bos-basvuru-formu.pdf');
      setMessage('Boş başvuru formu indirildi');
    } catch (err) {
      setError('Boş form oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleKomisyonFormChange = (e) => {
    const { name, value } = e.target;
    setKomisyonForm(prev => ({ ...prev, [name]: value }));
  };

  const handleKomisyonSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingUye) {
        await updateKomisyonUyesi(editingUye.id, komisyonForm);
        setMessage('Komisyon üyesi güncellendi');
      } else {
        await createKomisyonUyesi(komisyonForm);
        setMessage('Komisyon üyesi eklendi');
      }
      setKomisyonForm({ ad_soyad: '', gorev: '', unvan: '', sira_no: '' });
      setEditingUye(null);
      loadKomisyonUyeleri();
    } catch (err) {
      setError(err.response?.data?.error || 'Komisyon üyesi kaydedilirken hata oluştu');
    }
  };

  const handleEditUye = (uye) => {
    setEditingUye(uye);
    setKomisyonForm({
      ad_soyad: uye.ad_soyad,
      gorev: uye.gorev,
      unvan: uye.unvan || '',
      sira_no: uye.sira_no || ''
    });
  };

  const handleDeleteUye = async (id) => {
    if (!window.confirm('Bu komisyon üyesini silmek istediğinize emin misiniz?')) return;
    try {
      await deleteKomisyonUyesi(id);
      setMessage('Komisyon üyesi silindi');
      loadKomisyonUyeleri();
    } catch (err) {
      setError('Komisyon üyesi silinirken hata oluştu');
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1a237e', marginBottom: 30 }}>Evraklar</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === 'sablonlar' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sablonlar')}
        >
          Evrak Şablonları
        </button>
        <button
          className={`btn ${activeTab === 'adaylar' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('adaylar')}
        >
          Aday Evrakları
        </button>
        <button
          className={`btn ${activeTab === 'komisyon' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('komisyon')}
        >
          Komisyon Yönetimi
        </button>
      </div>

      {/* Evrak Şablonları */}
      {activeTab === 'sablonlar' && (
        <div className="card">
          <div className="card-header">
            <h2>Evrak Şablonları</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
            <div className="evrak-kart">
              <h3>Boş Başvuru Formu</h3>
              <p>Elle doldurulacak boş başvuru formu şablonu.</p>
              <button className="btn btn-primary" onClick={handleBosForm} disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'İndir'}
              </button>
            </div>
            <div className="evrak-kart">
              <h3>Toplu Başvuru Formları</h3>
              <p>Tüm adaylar için başvuru formlarını tek PDF olarak indirin.</p>
              <button className="btn btn-primary" onClick={handleTopluFormlar} disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'İndir'}
              </button>
            </div>
            <div className="evrak-kart">
              <h3>Komisyon Listesi</h3>
              <p>MESEM komisyon üyelerinin listesini PDF olarak indirin.</p>
              <button className="btn btn-primary" onClick={handleKomisyonListesi} disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'İndir'}
              </button>
            </div>
            <div className="evrak-kart">
              <h3>Denklik Defteri</h3>
              <p>Denklik belgesi olan adayların defterini PDF olarak indirin.</p>
              <button className="btn btn-primary" onClick={handleDenklikDefteri} disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'İndir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aday Evrakları */}
      {activeTab === 'adaylar' && (
        <div className="card">
          <div className="card-header">
            <h2>Aday Evrakları</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Başvuru No</th>
                  <th>Adı Soyadı</th>
                  <th>Alan</th>
                  <th>Dal</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {adaylar.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 30 }}>
                      Aday bulunamadı
                    </td>
                  </tr>
                ) : (
                  adaylar.map((aday) => (
                    <tr key={aday.id}>
                      <td>{aday.basvuru_no || '-'}</td>
                      <td>{aday.adi} {aday.soyadi}</td>
                      <td>{aday.alan || '-'}</td>
                      <td>{aday.dal || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleBasvuruFormu(aday)}
                            disabled={loading}
                          >
                            Başvuru Formu
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSonucBelgesi(aday)}
                            disabled={loading}
                          >
                            Sonuç Belgesi
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleSinavGirisBelgesi(aday)}
                            disabled={loading}
                          >
                            Sınav Giriş
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSinavSonucBelgesi(aday)}
                            disabled={loading}
                          >
                            Sınav Sonuç
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUstalikBelgesi(aday)}
                            disabled={loading}
                          >
                            Ustalık
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleKalfalikBelgesi(aday)}
                            disabled={loading}
                          >
                            Kalfalık
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Komisyon Yönetimi */}
      {activeTab === 'komisyon' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2>{editingUye ? 'Komisyon Üyesi Düzenle' : 'Yeni Komisyon Üyesi Ekle'}</h2>
            </div>
            <form onSubmit={handleKomisyonSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Ad Soyad *</label>
                  <input
                    name="ad_soyad"
                    value={komisyonForm.ad_soyad}
                    onChange={handleKomisyonFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Görev *</label>
                  <select name="gorev" value={komisyonForm.gorev} onChange={handleKomisyonFormChange} required>
                    <option value="">Seçiniz</option>
                    <option value="Komisyon Başkanı">Komisyon Başkanı</option>
                    <option value="Komisyon Üyesi">Komisyon Üyesi</option>
                    <option value="Raportör">Raportör</option>
                    <option value="Üye">Üye</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ünvan</label>
                  <input
                    name="unvan"
                    value={komisyonForm.unvan}
                    onChange={handleKomisyonFormChange}
                    placeholder="Örn: Müdür, Müdür Yardımcısı, Öğretmen"
                  />
                </div>
                <div className="form-group">
                  <label>Sıra No</label>
                  <input
                    type="number"
                    name="sira_no"
                    value={komisyonForm.sira_no}
                    onChange={handleKomisyonFormChange}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                <button type="submit" className="btn btn-primary">
                  {editingUye ? 'Güncelle' : 'Ekle'}
                </button>
                {editingUye && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingUye(null);
                      setKomisyonForm({ ad_soyad: '', gorev: '', unvan: '', sira_no: '' });
                    }}
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Komisyon Üyeleri</h2>
              <button className="btn btn-success btn-sm" onClick={handleKomisyonListesi} disabled={loading}>
                Komisyon Listesi İndir
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Sıra</th>
                    <th>Ad Soyad</th>
                    <th>Görev</th>
                    <th>Ünvan</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {komisyonUyeleri.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 30 }}>
                        Henüz komisyon üyesi eklenmemiş
                      </td>
                    </tr>
                  ) : (
                    komisyonUyeleri.map((uye) => (
                      <tr key={uye.id}>
                        <td>{uye.sira_no || '-'}</td>
                        <td>{uye.ad_soyad}</td>
                        <td>{uye.gorev}</td>
                        <td>{uye.unvan || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button className="btn btn-info btn-sm" onClick={() => handleEditUye(uye)}>
                              Düzenle
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUye(uye.id)}>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Evraklar;
