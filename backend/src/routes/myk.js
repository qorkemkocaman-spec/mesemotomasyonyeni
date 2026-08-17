const express = require('express');
const mykData = require('../data/mykData');

const router = express.Router();

// Tüm MYK verilerini getir
router.get('/', (req, res) => {
  res.json(mykData);
});

// MYK koduna göre ara
router.get('/ara', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const results = mykData.filter(item =>
    item.kod.toLowerCase().includes(q.toLowerCase()) ||
    item.ad.toLowerCase().includes(q.toLowerCase())
  );
  res.json(results);
});

// MYK koduna göre getir
router.get('/:kod', (req, res) => {
  const item = mykData.find(i => i.kod === req.params.kod);
  if (!item) return res.status(404).json({ error: 'MYK yeterliliği bulunamadı' });
  res.json(item);
});

// MESEM'de karşılığı olan yeterlilikler
router.get('/mesem/karşılığı-olan', (req, res) => {
  const results = mykData.filter(item => item.alan !== 'Karşılığı Yok');
  res.json(results);
});

// MESEM'de karşılığı olmayan yeterlilikler
router.get('/mesem/karşılığı-olmayan', (req, res) => {
  const results = mykData.filter(item => item.alan === 'Karşılığı Yok');
  res.json(results);
});

module.exports = router;
