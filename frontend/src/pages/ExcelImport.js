import React, { useState } from 'react';
import { importExcel, exportExcel } from '../services/api';

function ExcelImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Lütfen bir Excel dosyası seçin');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await importExcel(file);
      setResult(response.data);
      setMessage('Excel dosyası başarıyla içe aktarıldı');
    } catch (err) {
      setError(err.response?.data?.error || 'Excel dosyası içe aktarılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await exportExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'adaylar.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('Excel dosyası indirildi');
    } catch (err) {
      setError('Excel dosyası dışa aktarılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1a237e', marginBottom: 30 }}>Excel İşlemleri</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Excel'den Aday İçe Aktar</h2>
        </div>
        <p style={{ marginBottom: 20, color: '#666' }}>
          E-MESEM'den indirdiğiniz Excel dosyasını seçerek adayları sisteme aktarabilirsiniz.
          Dosya formatı E-MESEM'in standart çıktı formatıyla uyumlu olmalıdır.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleImport} disabled={loading || !file}>
            {loading ? 'Aktarılıyor...' : 'İçe Aktar'}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 20 }}>
            <div className="alert alert-info">
              <strong>Sonuç:</strong> Toplam {result.toplam} kayıt, {result.aktarilan} başarıyla aktarıldı, {result.hatalar.length} hata
            </div>
            {result.hatalar.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Satır</th>
                      <th>Hata Mesajı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.hatalar.map((hata, index) => (
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

      <div className="card">
        <div className="card-header">
          <h2>Excel'e Dışa Aktar</h2>
        </div>
        <p style={{ marginBottom: 20, color: '#666' }}>
          Sistemdeki tüm adayları Excel formatında indirin.
        </p>
        <button className="btn btn-success" onClick={handleExport} disabled={loading}>
          {loading ? 'İndiriliyor...' : 'Excel İndir'}
        </button>
      </div>
    </div>
  );
}

export default ExcelImport;
