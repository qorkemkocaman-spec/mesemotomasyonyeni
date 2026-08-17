import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAday, createAday, updateAday, getMykData } from '../services/api';

const initialForm = {
  basvuru_no: '',
  sira_no: '',
  ogrenim_yili: '',
  kayit_tarihi: '',
  basvuru_kayit_turu: '',
  kimlik_no: '',
  dogum_tarihi: '',
  adi: '',
  soyadi: '',
  kapsam: '',
  alan: '',
  dal: '',
  myk_yeterlilik: '',
  myk_kod: '',
  ogrenci_egitim_turu: '',
  cerceve_programi: '',
  eposta: '',
  telefon: '',
  ikametgah_adres: '',
  en_son_mezuniyeti: '',
  getirdigi_belge: '',
  belge_tarihi: '',
  ilkogretim_okul: '',
  ilkogretim_belge_tarihi: '',
  ilkogretim_belge_sayisi: '',
  lise_okul: '',
  lise_alan: '',
  lise_belge_tarihi: '',
  lise_belge_sayisi: '',
  lise_ogrenim_suresi: '',
  universite_okul: '',
  universite_alan: '',
  universite_belge_tarihi: '',
  universite_belge_sayisi: '',
  lisansustu_okul: '',
  lisansustu_alan: '',
  lisansustu_belge_tarihi: '',
  lisansustu_belge_sayisi: '',
  mezuniyet_aciklama: '',
  usta_ogretmen_dayanak_belge: '',
  usta_ogretmen_belge_tarihi: '',
  usta_ogretmen_belge_sayisi: '',
  usta_ogretmen_talep_turu: '',
  calisma1_cesit: '',
  calisma1_kurum: '',
  calisma1_sayi: '',
  calisma1_baslangic: '',
  calisma1_bitis: '',
  calisma1_aciklama: '',
  calisma2_cesit: '',
  calisma2_kurum: '',
  calisma2_sayi: '',
  calisma2_baslangic: '',
  calisma2_bitis: '',
  calisma2_aciklama: '',
  calisma3_cesit: '',
  calisma3_kurum: '',
  calisma3_sayi: '',
  calisma3_baslangic: '',
  calisma3_bitis: '',
  calisma3_aciklama: '',
  calisma4_cesit: '',
  calisma4_kurum: '',
  calisma4_sayi: '',
  calisma4_baslangic: '',
  calisma4_bitis: '',
  calisma4_aciklama: '',
  denklik_belge_tarihi: '',
  kalfalik_sinavlarina_girmesi: '',
  dogrudan_kalfalik_belgesi: '',
  kalfalik_ustalik_sinavlari: '',
  ustalik_sinavina_girmesi: '',
  dogrudan_ustalik_belgesi: '',
  sinav_turu: '',
  sinav_tarihi: '',
  sinav_saati: '',
  sinav_yeri: '',
  sinav_sonucu: ''
};


function AdayForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [mykData, setMykData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMykData();
    if (id) {
      loadAday();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const loadMykData = async () => {
    try {
      const response = await getMykData();
      setMykData(response.data);
    } catch (err) {
      console.error('MYK verileri yüklenemedi:', err);
    }
  };

  const loadAday = async () => {
    setLoading(true);
    try {
      const response = await getAday(id);
      setForm({ ...initialForm, ...response.data });
    } catch (err) {
      setError('Aday bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // MYK kodu seçildiğinde yeterlilik adını otomatik doldur
    if (name === 'myk_kod') {
      const mykItem = mykData.find(item => item.kod === value);
      if (mykItem) {
        setForm(prev => ({ ...prev, myk_yeterlilik: mykItem.ad }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (id) {
        await updateAday(id, form);
        setMessage('Aday güncellendi');
      } else {
        await createAday(form);
        setMessage('Aday eklendi');
        setForm(initialForm);
      }
      setTimeout(() => navigate('/adaylar'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#1a237e' }}>{id ? 'Aday Düzenle' : 'Yeni Aday'}</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-section">
            <h4>Başvuru Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Başvuru No</label>
                <input name="basvuru_no" value={form.basvuru_no} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Sıra No</label>
                <input name="sira_no" value={form.sira_no} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Öğrenim Yılı</label>
                <input name="ogrenim_yili" value={form.ogrenim_yili} onChange={handleChange} placeholder="Örn: 2024-2025" />
              </div>
              <div className="form-group">
                <label>Kayıt Tarihi</label>
                <input type="date" name="kayit_tarihi" value={form.kayit_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Başvuru Kayıt Türü</label>
                <select name="basvuru_kayit_turu" value={form.basvuru_kayit_turu} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Yeni Kayıt">Yeni Kayıt</option>
                  <option value="Devam">Devam</option>
                  <option value="Nakil">Nakil</option>
                </select>
              </div>
              <div className="form-group">
                <label>Kapsam</label>
                <select name="kapsam" value={form.kapsam} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Çıraklık">Çıraklık</option>
                  <option value="Kalfalık">Kalfalık</option>
                  <option value="Ustalık">Ustalık</option>
                  <option value="Usta Öğreticilik">Usta Öğreticilik</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <h4>Kişisel Bilgiler</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Adı *</label>
                <input name="adi" value={form.adi} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Soyadı *</label>
                <input name="soyadi" value={form.soyadi} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Kimlik No</label>
                <input name="kimlik_no" value={form.kimlik_no} onChange={handleChange} maxLength="11" />
              </div>
              <div className="form-group">
                <label>Doğum Tarihi</label>
                <input type="date" name="dogum_tarihi" value={form.dogum_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input name="telefon" value={form.telefon} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>E-posta</label>
                <input type="email" name="eposta" value={form.eposta} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>İkametgah Adres</label>
                <textarea name="ikametgah_adres" value={form.ikametgah_adres} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <h4>Eğitim Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Alan</label>
                <select name="alan" value={form.alan} onChange={handleChange}>
                  <option value="">Seçiniz</option>
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
              </div>
              <div className="form-group">
                <label>Dal</label>
                <input name="dal" value={form.dal} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>MYK Kodu</label>
                <select name="myk_kod" value={form.myk_kod} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  {mykData.map(item => (
                    <option key={item.kod} value={item.kod}>{item.kod} - {item.ad}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>MYK Yeterlilik</label>
                <input name="myk_yeterlilik" value={form.myk_yeterlilik} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Öğrenci Eğitim Türü</label>
                <select name="ogrenci_egitim_turu" value={form.ogrenci_egitim_turu} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Örgün">Örgün</option>
                  <option value="Uzaktan">Uzaktan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Çerçeve Programı</label>
                <input name="cerceve_programi" value={form.cerceve_programi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>En Son Mezuniyeti</label>
                <select name="en_son_mezuniyeti" value={form.en_son_mezuniyeti} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="İlköğretim">İlköğretim</option>
                  <option value="Lise">Lise</option>
                  <option value="Üniversite">Üniversite</option>
                  <option value="Lisansüstü">Lisansüstü</option>
                </select>
              </div>
              <div className="form-group">
                <label>Getirdiği Belge</label>
                <input name="getirdigi_belge" value={form.getirdigi_belge} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Belge Tarihi</label>
                <input type="date" name="belge_tarihi" value={form.belge_tarihi} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <h4>Öğrenim Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>İlköğretim Okul</label>
                <input name="ilkogretim_okul" value={form.ilkogretim_okul} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>İlköğretim Belge Tarihi</label>
                <input type="date" name="ilkogretim_belge_tarihi" value={form.ilkogretim_belge_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>İlköğretim Belge Sayısı</label>
                <input name="ilkogretim_belge_sayisi" value={form.ilkogretim_belge_sayisi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lise Okul</label>
                <input name="lise_okul" value={form.lise_okul} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lise Alan</label>
                <input name="lise_alan" value={form.lise_alan} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lise Belge Tarihi</label>
                <input type="date" name="lise_belge_tarihi" value={form.lise_belge_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lise Belge Sayısı</label>
                <input name="lise_belge_sayisi" value={form.lise_belge_sayisi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lise Öğrenim Süresi</label>
                <input name="lise_ogrenim_suresi" value={form.lise_ogrenim_suresi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Üniversite Okul</label>
                <input name="universite_okul" value={form.universite_okul} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Üniversite Alan</label>
                <input name="universite_alan" value={form.universite_alan} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Üniversite Belge Tarihi</label>
                <input type="date" name="universite_belge_tarihi" value={form.universite_belge_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Üniversite Belge Sayısı</label>
                <input name="universite_belge_sayisi" value={form.universite_belge_sayisi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lisansüstü Okul</label>
                <input name="lisansustu_okul" value={form.lisansustu_okul} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lisansüstü Alan</label>
                <input name="lisansustu_alan" value={form.lisansustu_alan} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lisansüstü Belge Tarihi</label>
                <input type="date" name="lisansustu_belge_tarihi" value={form.lisansustu_belge_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lisansüstü Belge Sayısı</label>
                <input name="lisansustu_belge_sayisi" value={form.lisansustu_belge_sayisi} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Mezuniyet Açıklama</label>
                <textarea name="mezuniyet_aciklama" value={form.mezuniyet_aciklama} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <h4>Usta Öğretmen Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Dayanak Belge</label>
                <input name="usta_ogretmen_dayanak_belge" value={form.usta_ogretmen_dayanak_belge} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Belge Tarihi</label>
                <input type="date" name="usta_ogretmen_belge_tarihi" value={form.usta_ogretmen_belge_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Belge Sayısı</label>
                <input name="usta_ogretmen_belge_sayisi" value={form.usta_ogretmen_belge_sayisi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Talep Türü</label>
                <select name="usta_ogretmen_talep_turu" value={form.usta_ogretmen_talep_turu} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Yeni Talep">Yeni Talep</option>
                  <option value="Yenileme">Yenileme</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {[1, 2, 3, 4].map(num => (
          <div className="card" key={num}>
            <div className="form-section">
              <h4>Çalışma {num} Bilgileri</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Çeşit</label>
                  <input name={`calisma${num}_cesit`} value={form[`calisma${num}_cesit`]} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Kurum</label>
                  <input name={`calisma${num}_kurum`} value={form[`calisma${num}_kurum`]} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Sayı</label>
                  <input name={`calisma${num}_sayi`} value={form[`calisma${num}_sayi`]} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Başlangıç</label>
                  <input type="date" name={`calisma${num}_baslangic`} value={form[`calisma${num}_baslangic`]} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Bitiş</label>
                  <input type="date" name={`calisma${num}_bitis`} value={form[`calisma${num}_bitis`]} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Açıklama</label>
                  <input name={`calisma${num}_aciklama`} value={form[`calisma${num}_aciklama`]} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="card">
          <div className="form-section">
            <h4>Sınav Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Denklik Belge Tarihi</label>
                <input type="date" name="denklik_belge_tarihi" value={form.denklik_belge_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Kalfalık Sınavlarına Girmesi</label>
                <select name="kalfalik_sinavlarina_girmesi" value={form.kalfalik_sinavlarina_girmesi} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Evet">Evet</option>
                  <option value="Hayır">Hayır</option>
                </select>
              </div>
              <div className="form-group">
                <label>Doğrudan Kalfalık Belgesi</label>
                <select name="dogrudan_kalfalik_belgesi" value={form.dogrudan_kalfalik_belgesi} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Evet">Evet</option>
                  <option value="Hayır">Hayır</option>
                </select>
              </div>
              <div className="form-group">
                <label>Kalfalık Ustalık Sınavları</label>
                <select name="kalfalik_ustalik_sinavlari" value={form.kalfalik_ustalik_sinavlari} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Evet">Evet</option>
                  <option value="Hayır">Hayır</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ustalık Sınavına Girmesi</label>
                <select name="ustalik_sinavina_girmesi" value={form.ustalik_sinavina_girmesi} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Evet">Evet</option>
                  <option value="Hayır">Hayır</option>
                </select>
              </div>
              <div className="form-group">
                <label>Doğrudan Ustalık Belgesi</label>
                <select name="dogrudan_ustalik_belgesi" value={form.dogrudan_ustalik_belgesi} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Evet">Evet</option>
                  <option value="Hayır">Hayır</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <h4>Sınav Planlama Bilgileri</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Sınav Türü</label>
                <select name="sinav_turu" value={form.sinav_turu} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="Kalfalık Sınavı">Kalfalık Sınavı</option>
                  <option value="Ustalık Sınavı">Ustalık Sınavı</option>
                  <option value="Usta Öğreticilik Sınavı">Usta Öğreticilik Sınavı</option>
                </select>
              </div>
              <div className="form-group">
                <label>Sınav Tarihi</label>
                <input type="date" name="sinav_tarihi" value={form.sinav_tarihi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Sınav Saati</label>
                <input type="time" name="sinav_saati" value={form.sinav_saati} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Sınav Yeri</label>
                <input name="sinav_yeri" value={form.sinav_yeri} onChange={handleChange} placeholder="Örn: Atölye 1, Derslik 2" />
              </div>
              <div className="form-group">
                <label>Sınav Sonucu</label>
                <select name="sinav_sonucu" value={form.sinav_sonucu} onChange={handleChange}>
                  <option value="">Seçiniz</option>
                  <option value="BAŞARILI">BAŞARILI</option>
                  <option value="BAŞARISIZ">BAŞARISIZ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/adaylar')}>
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdayForm;
