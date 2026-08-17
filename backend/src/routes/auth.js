const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'emesem-otomasyon-gizli-anahtar';

// Giriş yap
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Şifre hatalı' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  });
});

// Kullanıcı listesi (admin)
router.get('/users', (req, res) => {
  db.all('SELECT id, username, full_name, role, created_at FROM users', [], (err, users) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    res.json(users);
  });
});

// Yeni kullanıcı ekle (admin)
router.post('/users', (req, res) => {
  const { username, password, full_name, role } = req.body;

  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, full_name, role || 'user'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
        }
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }
      res.status(201).json({ id: this.lastID, message: 'Kullanıcı oluşturuldu' });
    }
  );
});

// Kullanıcı sil (admin)
router.delete('/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (this.changes === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json({ message: 'Kullanıcı silindi' });
  });
});

// Şifre değiştir
router.put('/password', (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const valid = bcrypt.compareSync(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Mevcut şifre hatalı' });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
      res.json({ message: 'Şifre güncellendi' });
    });
  });
});

module.exports = router;
