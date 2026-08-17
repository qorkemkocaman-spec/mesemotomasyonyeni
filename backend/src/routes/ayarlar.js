const express = require('express');
const db = require('../db/database');

const router = express.Router();

// Kurum ayarlarını getir
router.get('/', (req, res) => {
  db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!row) return res.json({});
    res.json(row);
  });
});

// Kurum ayarlarını güncelle
router.put('/', (req, res) => {
  const { kurum_adi, emesem_url, emesem_kullanici, emesem_sifre, ogrenim_yili } = req.body;

  db.run(
    `INSERT INTO kurum_ayarlari (id, kurum_adi, emesem_url, emesem_kullanici, emesem_sifre, ogrenim_yili, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       kurum_adi = excluded.kurum_adi,
       emesem_url = excluded.emesem_url,
       emesem_kullanici = excluded.emesem_kullanici,
       emesem_sifre = excluded.emesem_sifre,
       ogrenim_yili = excluded.ogrenim_yili,
       updated_at = CURRENT_TIMESTAMP`,
    [kurum_adi, emesem_url, emesem_kullanici, emesem_sifre, ogrenim_yili],
    function (err) {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası: ' + err.message });
      res.json({ message: 'Ayarlar güncellendi' });
    }
  );
});

// İstatistikler
router.get('/istatistik', (req, res) => {
  db.get('SELECT COUNT(*) as toplam FROM adaylar', [], (err, toplam) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

    db.get("SELECT COUNT(*) as kayitli FROM adaylar WHERE emesem_kayit_durumu = 'Kayıtlı'", [], (err, kayitli) => {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

      db.get("SELECT COUNT(*) as bekleyen FROM adaylar WHERE emesem_kayit_durumu = 'Bekliyor'", [], (err, bekleyen) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

        db.get("SELECT COUNT(*) as hata FROM adaylar WHERE emesem_kayit_durumu = 'Hata'", [], (err, hata) => {
          if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

          db.get("SELECT COUNT(*) as sinav_planlanan FROM adaylar WHERE sinav_tarihi IS NOT NULL AND sinav_tarihi != ''", [], (err, sinavPlanlanan) => {
            if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

            db.get("SELECT COUNT(*) as sinav_basarili FROM adaylar WHERE sinav_sonucu = 'BAŞARILI'", [], (err, sinavBasarili) => {
              if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

              db.get("SELECT COUNT(*) as sinav_basarisiz FROM adaylar WHERE sinav_sonucu = 'BAŞARISIZ'", [], (err, sinavBasarisiz) => {
                if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

                res.json({
                  toplam: toplam.toplam,
                  kayitli: kayitli.kayitli,
                  bekleyen: bekleyen.bekleyen,
                  hata: hata.hata,
                  sinav_planlanan: sinavPlanlanan.sinav_planlanan,
                  sinav_basarili: sinavBasarili.sinav_basarili,
                  sinav_basarisiz: sinavBasarisiz.sinav_basarisiz
                });
              });
            });
          });
        });

      });
    });
  });
});

module.exports = router;
