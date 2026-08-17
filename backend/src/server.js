const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Route'lar
const authRoutes = require('./routes/auth');
const adayRoutes = require('./routes/adaylar');
const mykRoutes = require('./routes/myk');
const otomasyonRoutes = require('./routes/otomasyon');
const excelRoutes = require('./routes/excel');
const evrakRoutes = require('./routes/evrak');
const ayarRoutes = require('./routes/ayarlar');

app.use('/api/auth', authRoutes);
app.use('/api/adaylar', adayRoutes);
app.use('/api/myk', mykRoutes);
app.use('/api/otomasyon', otomasyonRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/evrak', evrakRoutes);
app.use('/api/ayarlar', ayarRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'E-MESEM Otomasyon API çalışıyor' });
});

// Hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası oluştu' });
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
