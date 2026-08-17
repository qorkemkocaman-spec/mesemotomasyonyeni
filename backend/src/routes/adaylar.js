const express = require('express');
const db = require('../db/database');

const router = express.Router();

// Tüm adayları listele
router.get('/', (req, res) => {
  const { search, alan, durum } = req.query;
  let sql = 'SELECT * FROM adaylar WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (adi LIKE ? OR soyadi LIKE ? OR kimlik_no LIKE ? OR basvuru_no LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (alan) {
    sql += ' AND alan = ?';
    params.push(alan);
  }

  if (durum) {
    sql += ' AND emesem_kayit_durumu = ?';
    params.push(durum);
  }

  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    res.json(rows);
  });
});

// Tek aday getir
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!row) return res.status(404).json({ error: 'Aday bulunamadı' });
    res.json(row);
  });
});

// Yeni aday ekle
router.post('/', (req, res) => {
  const data = req.body;
  const fields = Object.keys(data);
  const placeholders = fields.map(() => '?').join(', ');
  const values = fields.map(f => data[f]);

  db.run(
    `INSERT INTO adaylar (${fields.join(', ')}) VALUES (${placeholders})`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası: ' + err.message });
      res.status(201).json({ id: this.lastID, message: 'Aday eklendi' });
    }
  );
});

// Aday güncelle
router.put('/:id', (req, res) => {
  const data = req.body;
  const fields = Object.keys(data).filter(f => f !== 'id');
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f]);
  values.push(req.params.id);

  db.run(
    `UPDATE adaylar SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
      if (this.changes === 0) return res.status(404).json({ error: 'Aday bulunamadı' });
      res.json({ message: 'Aday güncellendi' });
    }
  );
});

// Aday sil
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM adaylar WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (this.changes === 0) return res.status(404).json({ error: 'Aday bulunamadı' });
    res.json({ message: 'Aday silindi' });
  });
});

// İstatistikler
router.get('/istatistik/toplam', (req, res) => {
  db.get('SELECT COUNT(*) as toplam FROM adaylar', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    res.json(row);
  });
});

// Hızlı giriş - panodan yapıştırılan metni ayrıştırıp aday olarak kaydeder
router.post('/hizli-giris', (req, res) => {
  const { metin } = req.body;
  
  if (!metin) {
    return res.status(400).json({ error: 'Yapıştırılacak metin zorunludur' });
  }

  // Metni satırlara böl
  const satirlar = metin.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  
  if (satirlar.length === 0) {
    return res.status(400).json({ error: 'Geçerli veri bulunamadı' });
  }

  const eklenenler = [];
  const hatalar = [];

  satirlar.forEach((satir, index) => {
    // Sekme veya virgül ile ayrılmış verileri ayır
    const parcalar = satir.split(/\t|,|;/).map(p => p.trim());
    
    if (parcalar.length < 2) {
      hatalar.push({ satir: index + 1, mesaj: 'En az ad ve soyad gerekli' });
      return;
    }

    // Format: [başvuru_no, ad, soyad, kimlik_no, alan, dal, ...]
    const aday = {
      basvuru_no: parcalar[0] || null,
      adi: parcalar[1] || null,
      soyadi: parcalar[2] || null,
      kimlik_no: parcalar[3] || null,
      alan: parcalar[4] || null,
      dal: parcalar[5] || null,
      ogrenim_yili: parcalar[6] || null,
      telefon: parcalar[7] || null,
      eposta: parcalar[8] || null
    };

    if (!aday.adi || !aday.soyadi) {
      hatalar.push({ satir: index + 1, mesaj: 'Ad ve soyad zorunludur' });
      return;
    }

    const fields = Object.keys(aday).filter(k => aday[k] !== null && aday[k] !== undefined);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => aday[f]);

    db.run(
      `INSERT INTO adaylar (${fields.join(', ')}) VALUES (${placeholders})`,
      values,
      function (err) {
        if (err) {
          hatalar.push({ satir: index + 1, mesaj: err.message });
        } else {
          eklenenler.push({ id: this.lastID, adi: aday.adi, soyadi: aday.soyadi });
        }
      }
    );
  });

  res.json({
    toplam: satirlar.length,
    eklenen: eklenenler.length,
    eklenenler,
    hatalar
  });
});

module.exports = router;


