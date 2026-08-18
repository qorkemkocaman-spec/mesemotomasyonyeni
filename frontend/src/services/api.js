import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hata yakalama
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) => api.post('/auth/login', { username, password });
export const getUsers = () => api.get('/auth/users');
export const createUser = (data) => api.post('/auth/users', data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);
export const changePassword = (data) => api.put('/auth/password', data);

// Adaylar
export const getAdaylar = (params) => api.get('/adaylar', { params });
export const getAday = (id) => api.get(`/adaylar/${id}`);
export const createAday = (data) => api.post('/adaylar', data);
export const updateAday = (id, data) => api.put(`/adaylar/${id}`, data);
export const deleteAday = (id) => api.delete(`/adaylar/${id}`);
export const hizliGiris = (metin) => api.post('/adaylar/hizli-giris', { metin });


// MYK
export const getMykData = () => api.get('/myk');
export const searchMyk = (q) => api.get('/myk/ara', { params: { q } });

// Otomasyon
export const emesemBaglan = (port) => api.post('/otomasyon/baglan', { port });
export const emesemOtomatikGiris = (kullaniciAdi, sifre) => api.post('/otomasyon/otomatik-giris', { kullaniciAdi, sifre });
export const emesemDurum = () => api.get('/otomasyon/durum');

export const emesemKayitEkrani = () => api.post('/otomasyon/kayit-ekrani');
export const emesemAdayKaydet = (id) => api.post(`/otomasyon/aday/${id}`);
export const emesemTopluKayit = (adayIds) => api.post('/otomasyon/toplu-kayit', { adayIds });
export const getLoglar = () => api.get('/otomasyon/loglar');


// Excel
export const importExcel = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/excel/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const exportExcel = () => api.get('/excel/export', { responseType: 'blob' });

// Evrak
export const getBasvuruFormu = (id) => api.get(`/evrak/basvuru-formu/${id}`, { responseType: 'blob' });
export const getTopluFormlar = () => api.get('/evrak/toplu-formlar', { responseType: 'blob' });
export const getSonucBelgesi = (id) => api.get(`/evrak/sonuc-belgesi/${id}`, { responseType: 'blob' });
export const getKomisyonListesi = () => api.get('/evrak/komisyon-listesi', { responseType: 'blob' });
export const getDenklikDefteri = () => api.get('/evrak/denklik-defteri', { responseType: 'blob' });
export const getBosForm = () => api.get('/evrak/bos-form', { responseType: 'blob' });
export const getSinavGirisBelgesi = (id) => api.get(`/evrak/sinav-giris-belgesi/${id}`, { responseType: 'blob' });
export const getSinavSonucBelgesi = (id) => api.get(`/evrak/sinav-sonuc-belgesi/${id}`, { responseType: 'blob' });
export const getUstalikBelgesi = (id) => api.get(`/evrak/ustalik-belgesi/${id}`, { responseType: 'blob' });
export const getKalfalikBelgesi = (id) => api.get(`/evrak/kalfalik-belgesi/${id}`, { responseType: 'blob' });


// Komisyon üyeleri
export const getKomisyonUyeleri = () => api.get('/evrak/komisyon-uyeleri');
export const createKomisyonUyesi = (data) => api.post('/evrak/komisyon-uyeleri', data);
export const updateKomisyonUyesi = (id, data) => api.put(`/evrak/komisyon-uyeleri/${id}`, data);
export const deleteKomisyonUyesi = (id) => api.delete(`/evrak/komisyon-uyeleri/${id}`);


// Ayarlar
export const getAyarlar = () => api.get('/ayarlar');
export const updateAyarlar = (data) => api.put('/ayarlar', data);
export const getIstatistik = () => api.get('/ayarlar/istatistik');

export default api;
