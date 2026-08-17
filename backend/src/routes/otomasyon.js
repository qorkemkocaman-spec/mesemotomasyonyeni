const express = require('express');
const db = require('../db/database');
const emesemService = require('../automation/emesemService');

const router = express.Router();

// Tarayıcıya bağlan (CDP üzerinden)
router.post('/baglan', async (req, res) => {
  const { port } = req.body;
  const result = await emesemService.connectToBrowser(port || 9222);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// E-MESEM'e otomatik giriş yap (Robot)
router.post('/otomatik-giris', async (req, res) => {
  const { kullaniciAdi, sifre } = req.body;

  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
  }

  const result = await emesemService.autoLogin(kullaniciAdi, sifre);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// E-MESEM giriş durumunu kontrol et
router.get('/durum', async (req, res) => {
  const result = await emesemService.checkLoginStatus();
  res.json(result);
});


// Kayıt ekranına git
router.post('/kayit-ekrani', async (req, res) => {
  const result = await emesemService.goToKayitEkrani();
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// Tek adayı E-MESEM'e kaydet
router.post('/aday/:id', async (req, res) => {
  const adayId = req.params.id;

  const aday = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM adaylar WHERE id = ?', [adayId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!aday) {
    return res.status(404).json({ error: 'Aday bulunamadı' });
  }

  const result = await emesemService.adayKaydet(aday);

  // Log kaydı
  db.run(
    'INSERT INTO otomasyon_log (aday_id, islem_turu, durum, mesaj) VALUES (?, ?, ?, ?)',
    [adayId, 'E-MESEM Kayıt', result.success ? 'Başarılı' : 'Hata', result.message]
  );

  if (result.success) {
    db.run(
      'UPDATE adaylar SET emesem_kayit_durumu = ?, emesem_kayit_tarihi = ? WHERE id = ?',
      ['Kayıtlı', new Date().toISOString().split('T')[0], adayId]
    );
  }

  res.json(result);
});

// Toplu kayıt
router.post('/toplu-kayit', async (req, res) => {
  const { adayIds } = req.body;

  if (!adayIds || !Array.isArray(adayIds) || adayIds.length === 0) {
    return res.status(400).json({ error: 'Aday ID listesi zorunludur' });
  }

  const results = await emesemService.topluKayit(adayIds);
  res.json(results);
});

// Otomasyon loglarını getir
router.get('/loglar', (req, res) => {
  db.all(
    `SELECT l.*, a.adi, a.soyadi 
     FROM otomasyon_log l 
     LEFT JOIN adaylar a ON l.aday_id = a.id 
     ORDER BY l.tarih DESC 
     LIMIT 100`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
      res.json(rows);
    }
  );
});

// Otomasyonu kapat
router.post('/kapat', async (req, res) => {
  await emesemService.close();
  res.json({ message: 'Otomasyon kapatıldı' });
});

module.exports = router;
