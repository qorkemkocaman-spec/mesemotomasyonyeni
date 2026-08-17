import React, { useState, useEffect } from 'react';
import { getAyarlar, updateAyarlar } from '../services/api';

function Ayarlar() {
  const [form, setForm] = useState({
    kurum_adi: '',
    emesem_url: '',
    emesem_kullanici: '',
    emesem_sifre: '',
    ogrenim_yili: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAyarlar();
  }, []);

  const loadAyarlar = async () => {
    try {
      const response = await getAyarlar();
      if (response.data) {
        setForm({
          kurum_adi: response.data.kurum_adi || '',
          emesem_url: response.data.emesem_url || '',
          emesem_kullanici: response.data.emesem_kullanici || '',
          emesem_sifre: response.data.emesem_sifre || '',
          ogrenim_yili: response.data.ogrenim_yili || ''
        });
      }
    } catch (err) {
      setError('Ayarlar yüklenirken hata oluştu');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateAyarlar(form);
      setMessage('Ayarlar başarıyla güncellendi');
    } catch (err) {
      setError(err.response?.data?.error || 'Ayarlar güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1a237e', marginBottom: 30 }}>Ayarlar</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-section">
            <h4>Kurum Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Kurum Adı</label>
                <input
                  name="kurum_adi"
                  value={form.kurum_adi}
                  onChange={handleChange}
                  placeholder="Örn: XYZ Mesleki Eğitim Merkezi"
                />
              </div>
              <div className="form-group">
                <label>Öğrenim Yılı</label>
                <input
                  name="ogrenim_yili"
                  value={form.ogrenim_yili}
                  onChange={handleChange}
                  placeholder="Örn: 2024-2025"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <h4>E-MESEM Bağlantı Ayarları</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>E-MESEM URL</label>
                <input
                  name="emesem_url"
                  value={form.emesem_url}
                  onChange={handleChange}
                  placeholder="https://emesem.meb.gov.tr"
                />
              </div>
              <div className="form-group">
                <label>E-MESEM Kullanıcı Adı</label>
                <input
                  name="emesem_kullanici"
                  value={form.emesem_kullanici}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>E-MESEM Şifre</label>
                <input
                  type="password"
                  name="emesem_sifre"
                  value={form.emesem_sifre}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </form>
    </div>
  );
}

export default Ayarlar;
