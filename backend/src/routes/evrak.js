const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db/database');

const router = express.Router();

// Aday başvuru formu PDF oluştur
router.get('/basvuru-formu/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, aday) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!aday) return res.status(404).json({ error: 'Aday bulunamadı' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=basvuru-formu-${aday.adi}-${aday.soyadi}.pdf`);
    doc.pipe(res);

    // Başlık
    doc.fontSize(16).text('MESEM BAŞVURU FORMU', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Başvuru No: ${aday.basvuru_no || '-'}`, { align: 'right' });
    doc.text(`Kayıt Tarihi: ${aday.kayit_tarihi || '-'}`, { align: 'right' });
    doc.moveDown();

    // Kişisel Bilgiler
    doc.fontSize(12).text('KİŞİSEL BİLGİLER', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Adı Soyadı: ${aday.adi || ''} ${aday.soyadi || ''}`);
    doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
    doc.text(`Doğum Tarihi: ${aday.dogum_tarihi || '-'}`);
    doc.text(`Telefon: ${aday.telefon || '-'}`);
    doc.text(`E-posta: ${aday.eposta || '-'}`);
    doc.text(`İkametgah Adres: ${aday.ikametgah_adres || '-'}`);
    doc.moveDown();

    // Eğitim Bilgileri
    doc.fontSize(12).text('EĞİTİM BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Alan: ${aday.alan || '-'}`);
    doc.text(`Dal: ${aday.dal || '-'}`);
    doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
    doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
    doc.text(`En Son Mezuniyet: ${aday.en_son_mezuniyeti || '-'}`);
    doc.text(`Öğrenim Yılı: ${aday.ogrenim_yili || '-'}`);
    doc.moveDown();

    // Öğrenim Bilgileri
    doc.fontSize(12).text('ÖĞRENİM BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`İlköğretim: ${aday.ilkogretim_okul || '-'} (${aday.ilkogretim_belge_tarihi || '-'})`);
    doc.text(`Lise: ${aday.lise_okul || '-'} - ${aday.lise_alan || '-'} (${aday.lise_belge_tarihi || '-'})`);
    doc.text(`Üniversite: ${aday.universite_okul || '-'} - ${aday.universite_alan || '-'} (${aday.universite_belge_tarihi || '-'})`);
    doc.text(`Lisansüstü: ${aday.lisansustu_okul || '-'} - ${aday.lisansustu_alan || '-'} (${aday.lisansustu_belge_tarihi || '-'})`);
    doc.moveDown();

    // Çalışma Bilgileri
    doc.fontSize(12).text('ÇALIŞMA BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    for (let i = 1; i <= 4; i++) {
      const cesit = aday[`calisma${i}_cesit`];
      const kurum = aday[`calisma${i}_kurum`];
      const baslangic = aday[`calisma${i}_baslangic`];
      const bitis = aday[`calisma${i}_bitis`];
      if (cesit || kurum) {
        doc.text(`Çalışma ${i}: ${cesit || '-'} - ${kurum || '-'} (${baslangic || '-'} / ${bitis || '-'})`);
      }
    }
    doc.moveDown();

    // Belge Bilgileri
    doc.fontSize(12).text('BELGE BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Getirdiği Belge: ${aday.getirdigi_belge || '-'}`);
    doc.text(`Belge Tarihi: ${aday.belge_tarihi || '-'}`);
    doc.text(`Usta Öğretmen Dayanak Belge: ${aday.usta_ogretmen_dayanak_belge || '-'}`);
    doc.text(`Usta Öğretmen Belge Tarihi: ${aday.usta_ogretmen_belge_tarihi || '-'}`);
    doc.text(`Usta Öğretmen Talep Türü: ${aday.usta_ogretmen_talep_turu || '-'}`);
    doc.moveDown();

    // Sınav Bilgileri
    doc.fontSize(12).text('SINAV BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Kalfalık Sınavlarına Girmesi: ${aday.kalfalik_sinavlarina_girmesi || '-'}`);
    doc.text(`Doğrudan Kalfalık Belgesi: ${aday.dogrudan_kalfalik_belgesi || '-'}`);
    doc.text(`Kalfalık Ustalık Sınavları: ${aday.kalfalik_ustalik_sinavlari || '-'}`);
    doc.text(`Ustalık Sınavına Girmesi: ${aday.ustalik_sinavina_girmesi || '-'}`);
    doc.text(`Doğrudan Ustalık Belgesi: ${aday.dogrudan_ustalik_belgesi || '-'}`);
    doc.moveDown();

    // İmza alanı
    doc.moveDown(2);
    doc.text('Aday İmzası: ______________________', { align: 'right' });
    doc.moveDown(1);
    doc.text('Kurum Yetkilisi İmzası: ______________________', { align: 'right' });

    doc.end();
  });
});

// Tüm adaylar için başvuru formları (toplu)
router.get('/toplu-formlar', (req, res) => {
  db.all('SELECT * FROM adaylar ORDER BY sira_no', [], (err, adaylar) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=toplu-basvuru-formlari.pdf');
    doc.pipe(res);

    adaylar.forEach((aday, index) => {
      if (index > 0) doc.addPage();

      doc.fontSize(16).text('MESEM BAŞVURU FORMU', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Başvuru No: ${aday.basvuru_no || '-'}`, { align: 'right' });
      doc.text(`Sıra No: ${aday.sira_no || '-'}`, { align: 'right' });
      doc.moveDown();

      doc.fontSize(12).text('KİŞİSEL BİLGİLER', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Adı Soyadı: ${aday.adi || ''} ${aday.soyadi || ''}`);
      doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
      doc.text(`Doğum Tarihi: ${aday.dogum_tarihi || '-'}`);
      doc.text(`Telefon: ${aday.telefon || '-'}`);
      doc.text(`E-posta: ${aday.eposta || '-'}`);
      doc.moveDown();

      doc.fontSize(12).text('EĞİTİM BİLGİLERİ', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Alan: ${aday.alan || '-'}`);
      doc.text(`Dal: ${aday.dal || '-'}`);
      doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
      doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
      doc.text(`En Son Mezuniyet: ${aday.en_son_mezuniyeti || '-'}`);
      doc.moveDown();

      doc.moveDown(2);
      doc.text('Aday İmzası: ______________________', { align: 'right' });
      doc.text('Kurum Yetkilisi İmzası: ______________________', { align: 'right' });
    });

    doc.end();
  });
});

// Sonuç belgesi oluştur (tek aday)
router.get('/sonuc-belgesi/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, aday) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!aday) return res.status(404).json({ error: 'Aday bulunamadı' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sonuc-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('MESEM BAŞVURU SONUÇ BELGESİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Aday bilgileri
      doc.fontSize(11);
      doc.text(`Sayın ${aday.adi || ''} ${aday.soyadi || ''},`);
      doc.moveDown();
      doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
      doc.text(`Başvuru No: ${aday.basvuru_no || '-'}`);
      doc.text(`Alan: ${aday.alan || '-'}`);
      doc.text(`Dal: ${aday.dal || '-'}`);
      doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
      doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
      doc.moveDown(2);

      doc.text('Başvurunuz değerlendirilmiş olup, aşağıdaki sonuç elde edilmiştir:', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text('BAŞVURUNUZ KABUL EDİLMİŞTİR', { align: 'center', underline: true });
      doc.moveDown(2);

      doc.fontSize(10);
      doc.text(`Bu belge, ${kurumAdi} tarafından ${new Date().toLocaleDateString('tr-TR')} tarihinde düzenlenmiştir.`);
      doc.moveDown(3);

      // İmza alanı
      doc.text('Komisyon Başkanı', { align: 'right' });
      doc.moveDown(2);
      doc.text('______________________', { align: 'right' });
      doc.text('İmza', { align: 'right' });

      doc.end();
    });
  });
});

// Komisyon listesi oluştur
router.get('/komisyon-listesi', (req, res) => {
  db.all('SELECT * FROM komisyon_uyeleri ORDER BY sira_no', [], (err, uyeler) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=komisyon-listesi.pdf');
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('MESEM KOMİSYON LİSTESİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Tablo başlıkları
      const startX = 50;
      const startY = doc.y;
      const colWidths = [30, 200, 150, 120];
      const headers = ['Sıra', 'Ad Soyad', 'Görev', 'Ünvan'];

      doc.fontSize(10);
      doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), 25).fill('#1a237e');
      doc.fillColor('white');
      let x = startX;
      headers.forEach((h, i) => {
        doc.text(h, x + 5, startY + 8, { width: colWidths[i] - 10 });
        x += colWidths[i];
      });

      // Tablo satırları
      doc.fillColor('black');
      let y = startY + 25;
      uyeler.forEach((uye, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 25).fill('#f5f5f5');
        }
        doc.fillColor('black');
        x = startX;
        const rowData = [index + 1, uye.ad_soyad, uye.gorev, uye.unvan];
        rowData.forEach((cell, i) => {
          doc.text(String(cell), x + 5, y + 8, { width: colWidths[i] - 10 });
          x += colWidths[i];
        });
        y += 25;
      });

      doc.moveDown(2);
      doc.fontSize(10);
      doc.text(`Bu liste, ${kurumAdi} tarafından ${new Date().toLocaleDateString('tr-TR')} tarihinde düzenlenmiştir.`);

      doc.end();
    });
  });
});

// Denklik defteri oluştur
router.get('/denklik-defteri', (req, res) => {
  db.all('SELECT * FROM adaylar WHERE denklik_belge_tarihi IS NOT NULL ORDER BY sira_no', [], (err, adaylar) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=denklik-defteri.pdf');
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('DENKLİK DEFTERİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Tablo başlıkları
      const startX = 50;
      const startY = doc.y;
      const colWidths = [30, 150, 120, 100, 100];
      const headers = ['Sıra', 'Ad Soyad', 'Kimlik No', 'Alan', 'Denklik Tarihi'];

      doc.fontSize(9);
      doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), 25).fill('#1a237e');
      doc.fillColor('white');
      let x = startX;
      headers.forEach((h, i) => {
        doc.text(h, x + 5, startY + 8, { width: colWidths[i] - 10 });
        x += colWidths[i];
      });

      // Tablo satırları
      doc.fillColor('black');
      let y = startY + 25;
      adaylar.forEach((aday, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 25).fill('#f5f5f5');
        }
        doc.fillColor('black');
        x = startX;
        const rowData = [index + 1, `${aday.adi} ${aday.soyadi}`, aday.kimlik_no, aday.alan, aday.denklik_belge_tarihi];
        rowData.forEach((cell, i) => {
          doc.text(String(cell || '-'), x + 5, y + 8, { width: colWidths[i] - 10 });
          x += colWidths[i];
        });
        y += 25;
      });

      doc.moveDown(2);
      doc.fontSize(10);
      doc.text(`Bu defter, ${kurumAdi} tarafından ${new Date().toLocaleDateString('tr-TR')} tarihinde düzenlenmiştir.`);

      doc.end();
    });
  });
});

// Sınav giriş belgesi oluştur (tek aday)
router.get('/sinav-giris-belgesi/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, aday) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!aday) return res.status(404).json({ error: 'Aday bulunamadı' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sinav-giris-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('MESEM SINAV GİRİŞ BELGESİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Aday bilgileri
      doc.fontSize(11);
      doc.text(`Adı Soyadı: ${aday.adi || ''} ${aday.soyadi || ''}`);
      doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
      doc.text(`Başvuru No: ${aday.basvuru_no || '-'}`);
      doc.text(`Alan: ${aday.alan || '-'}`);
      doc.text(`Dal: ${aday.dal || '-'}`);
      doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
      doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
      doc.moveDown(2);

      // Sınav bilgileri
      doc.fontSize(12).text('SINAV BİLGİLERİ', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Sınav Türü: ${aday.sinav_turu || 'Ustalık Sınavı'}`);
      doc.text(`Sınav Tarihi: ${aday.sinav_tarihi || '-'}`);
      doc.text(`Sınav Saati: ${aday.sinav_saati || '-'}`);
      doc.text(`Sınav Yeri: ${aday.sinav_yeri || '-'}`);
      doc.moveDown(2);

      doc.fontSize(10);
      doc.text('Bu belge, sınav günü kimlik belgenizle birlikte ibraz edilmelidir.', { align: 'center' });
      doc.moveDown(3);

      // İmza alanı
      doc.text('Komisyon Başkanı', { align: 'right' });
      doc.moveDown(2);
      doc.text('______________________', { align: 'right' });
      doc.text('İmza', { align: 'right' });

      doc.end();
    });
  });
});

// Sınav sonuç belgesi oluştur (tek aday)
router.get('/sinav-sonuc-belgesi/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, aday) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!aday) return res.status(404).json({ error: 'Aday bulunamadı' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sinav-sonuc-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('MESEM SINAV SONUÇ BELGESİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Aday bilgileri
      doc.fontSize(11);
      doc.text(`Adı Soyadı: ${aday.adi || ''} ${aday.soyadi || ''}`);
      doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
      doc.text(`Başvuru No: ${aday.basvuru_no || '-'}`);
      doc.text(`Alan: ${aday.alan || '-'}`);
      doc.text(`Dal: ${aday.dal || '-'}`);
      doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
      doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
      doc.moveDown(2);

      // Sınav sonucu
      doc.fontSize(12).text('SINAV SONUCU', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Sınav Türü: ${aday.sinav_turu || 'Ustalık Sınavı'}`);
      doc.text(`Sınav Tarihi: ${aday.sinav_tarihi || '-'}`);
      doc.text(`Sonuç: ${aday.sinav_sonucu || 'BAŞARILI'}`);
      doc.moveDown(2);

      doc.fontSize(10);
      doc.text(`Bu belge, ${kurumAdi} tarafından ${new Date().toLocaleDateString('tr-TR')} tarihinde düzenlenmiştir.`);
      doc.moveDown(3);

      // İmza alanı
      doc.text('Komisyon Başkanı', { align: 'right' });
      doc.moveDown(2);
      doc.text('______________________', { align: 'right' });
      doc.text('İmza', { align: 'right' });

      doc.end();
    });
  });
});

// Ustalık belgesi oluştur (tek aday)
router.get('/ustalik-belgesi/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, aday) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!aday) return res.status(404).json({ error: 'Aday bulunamadı' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ustalik-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('USTALIK BELGESİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Aday bilgileri
      doc.fontSize(11);
      doc.text(`Adı Soyadı: ${aday.adi || ''} ${aday.soyadi || ''}`);
      doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
      doc.text(`Başvuru No: ${aday.basvuru_no || '-'}`);
      doc.text(`Alan: ${aday.alan || '-'}`);
      doc.text(`Dal: ${aday.dal || '-'}`);
      doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
      doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
      doc.moveDown(2);

      doc.fontSize(10);
      doc.text('Bu belge, adayın ustalık sınavında başarılı olduğunu gösterir.', { align: 'center' });
      doc.moveDown(3);

      // İmza alanı
      doc.text('Komisyon Başkanı', { align: 'right' });
      doc.moveDown(2);
      doc.text('______________________', { align: 'right' });
      doc.text('İmza', { align: 'right' });

      doc.end();
    });
  });
});

// Kalfalık belgesi oluştur (tek aday)
router.get('/kalfalik-belgesi/:id', (req, res) => {
  db.get('SELECT * FROM adaylar WHERE id = ?', [req.params.id], (err, aday) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (!aday) return res.status(404).json({ error: 'Aday bulunamadı' });

    db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
      const kurumAdi = ayarlar?.kurum_adi || 'MESEM';
      const ogrenimYili = ayarlar?.ogrenim_yili || '';

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=kalfalik-belgesi-${aday.adi}-${aday.soyadi}.pdf`);
      doc.pipe(res);

      // Başlık
      doc.fontSize(14).text(kurumAdi, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text('KALFALIK BELGESİ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Öğrenim Yılı: ${ogrenimYili || '-'}`, { align: 'center' });
      doc.moveDown(2);

      // Aday bilgileri
      doc.fontSize(11);
      doc.text(`Adı Soyadı: ${aday.adi || ''} ${aday.soyadi || ''}`);
      doc.text(`Kimlik No: ${aday.kimlik_no || '-'}`);
      doc.text(`Başvuru No: ${aday.basvuru_no || '-'}`);
      doc.text(`Alan: ${aday.alan || '-'}`);
      doc.text(`Dal: ${aday.dal || '-'}`);
      doc.text(`MYK Yeterlilik: ${aday.myk_yeterlilik || '-'}`);
      doc.text(`MYK Kodu: ${aday.myk_kod || '-'}`);
      doc.moveDown(2);

      doc.fontSize(10);
      doc.text('Bu belge, adayın kalfalık sınavında başarılı olduğunu gösterir.', { align: 'center' });
      doc.moveDown(3);

      // İmza alanı
      doc.text('Komisyon Başkanı', { align: 'right' });
      doc.moveDown(2);
      doc.text('______________________', { align: 'right' });
      doc.text('İmza', { align: 'right' });

      doc.end();
    });
  });
});

// Boş başvuru formu oluştur
router.get('/bos-form', (req, res) => {

  db.get('SELECT * FROM kurum_ayarlari WHERE id = 1', [], (err, ayarlar) => {
    const kurumAdi = ayarlar?.kurum_adi || 'MESEM';

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bos-basvuru-formu.pdf');
    doc.pipe(res);

    // Başlık
    doc.fontSize(16).text('MESEM BAŞVURU FORMU', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Başvuru No: ______________`, { align: 'right' });
    doc.text(`Kayıt Tarihi: ______________`, { align: 'right' });
    doc.moveDown();

    // Kişisel Bilgiler
    doc.fontSize(12).text('KİŞİSEL BİLGİLER', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Adı Soyadı: ______________________________');
    doc.text('Kimlik No: ______________________________');
    doc.text('Doğum Tarihi: ______________________________');
    doc.text('Telefon: ______________________________');
    doc.text('E-posta: ______________________________');
    doc.text('İkametgah Adres: ______________________________');
    doc.moveDown();

    // Eğitim Bilgileri
    doc.fontSize(12).text('EĞİTİM BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Alan: ______________________________');
    doc.text('Dal: ______________________________');
    doc.text('MYK Yeterlilik: ______________________________');
    doc.text('MYK Kodu: ______________________________');
    doc.text('En Son Mezuniyet: ______________________________');
    doc.text('Öğrenim Yılı: ______________________________');
    doc.moveDown();

    // Öğrenim Bilgileri
    doc.fontSize(12).text('ÖĞRENİM BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('İlköğretim: ______________________________');
    doc.text('Lise: ______________________________');
    doc.text('Üniversite: ______________________________');
    doc.text('Lisansüstü: ______________________________');
    doc.moveDown();

    // Çalışma Bilgileri
    doc.fontSize(12).text('ÇALIŞMA BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    for (let i = 1; i <= 4; i++) {
      doc.text(`Çalışma ${i}: ______________________________`);
    }
    doc.moveDown();

    // Belge Bilgileri
    doc.fontSize(12).text('BELGE BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Getirdiği Belge: ______________________________');
    doc.text('Belge Tarihi: ______________________________');
    doc.text('Usta Öğretmen Dayanak Belge: ______________________________');
    doc.text('Usta Öğretmen Belge Tarihi: ______________________________');
    doc.text('Usta Öğretmen Talep Türü: ______________________________');
    doc.moveDown();

    // Sınav Bilgileri
    doc.fontSize(12).text('SINAV BİLGİLERİ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Kalfalık Sınavlarına Girmesi: ______________');
    doc.text('Doğrudan Kalfalık Belgesi: ______________');
    doc.text('Kalfalık Ustalık Sınavları: ______________');
    doc.text('Ustalık Sınavına Girmesi: ______________');
    doc.text('Doğrudan Ustalık Belgesi: ______________');
    doc.moveDown();

    // İmza alanı
    doc.moveDown(2);
    doc.text('Aday İmzası: ______________________', { align: 'right' });
    doc.moveDown(1);
    doc.text('Kurum Yetkilisi İmzası: ______________________', { align: 'right' });

    doc.end();
  });
});

// Komisyon üyelerini getir
router.get('/komisyon-uyeleri', (req, res) => {
  db.all('SELECT * FROM komisyon_uyeleri ORDER BY sira_no', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    res.json(rows);
  });
});

// Komisyon üyesi ekle
router.post('/komisyon-uyeleri', (req, res) => {
  const { ad_soyad, gorev, unvan, sira_no } = req.body;
  if (!ad_soyad || !gorev) {
    return res.status(400).json({ error: 'Ad Soyad ve Görev zorunludur' });
  }

  db.run(
    'INSERT INTO komisyon_uyeleri (ad_soyad, gorev, unvan, sira_no) VALUES (?, ?, ?, ?)',
    [ad_soyad, gorev, unvan || '', sira_no || null],
    function (err) {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası: ' + err.message });
      res.status(201).json({ id: this.lastID, message: 'Komisyon üyesi eklendi' });
    }
  );
});

// Komisyon üyesi güncelle
router.put('/komisyon-uyeleri/:id', (req, res) => {
  const { ad_soyad, gorev, unvan, sira_no } = req.body;
  db.run(
    'UPDATE komisyon_uyeleri SET ad_soyad = ?, gorev = ?, unvan = ?, sira_no = ? WHERE id = ?',
    [ad_soyad, gorev, unvan || '', sira_no || null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
      if (this.changes === 0) return res.status(404).json({ error: 'Komisyon üyesi bulunamadı' });
      res.json({ message: 'Komisyon üyesi güncellendi' });
    }
  );
});

// Komisyon üyesi sil
router.delete('/komisyon-uyeleri/:id', (req, res) => {
  db.run('DELETE FROM komisyon_uyeleri WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (this.changes === 0) return res.status(404).json({ error: 'Komisyon üyesi bulunamadı' });
    res.json({ message: 'Komisyon üyesi silindi' });
  });
});

module.exports = router;
