const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../db/database');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Excel'den adayları içe aktar
router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Dosya yüklenmedi' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let imported = 0;
    let errors = [];

    data.forEach((row, index) => {
      const aday = {
        basvuru_no: row['Başvuru No'] || row['BASVURU_NO'] || null,
        sira_no: row['Sıra No'] || row['SIRA_NO'] || null,
        ogrenim_yili: row['Öğrenim Yılı'] || row['OGRENIM_YILI'] || null,
        kayit_tarihi: row['Kayıt Tarihi'] || row['KAYIT_TARIHI'] || null,
        basvuru_kayit_turu: row['Başvuru Kayıt Türü'] || row['BASVURU_KAYIT_TURU'] || null,
        kimlik_no: row['Kimlik No'] || row['KIMLIK_NO'] || null,
        dogum_tarihi: row['Doğum Tarihi'] || row['DOGUM_TARIHI'] || null,
        adi: row['Adı'] || row['ADI'] || null,
        soyadi: row['Soyadı'] || row['SOYADI'] || null,
        kapsam: row['Kapsam'] || row['KAPSAM'] || null,
        alan: row['Alan'] || row['ALAN'] || null,
        dal: row['Dal'] || row['DAL'] || null,
        myk_yeterlilik: row['MYK Yeterlilik'] || row['MYK_YETERLILIK'] || null,
        myk_kod: row['MYK Kodu'] || row['MYK_KOD'] || null,
        ogrenci_egitim_turu: row['Öğrenci Eğitim Türü'] || row['OGRENCI_EGITIM_TURU'] || null,
        cerceve_programi: row['Çerçeve Programı'] || row['CERCEVE_PROGRAMI'] || null,
        eposta: row['E-posta'] || row['EPOSTA'] || null,
        telefon: row['Telefon'] || row['TELEFON'] || null,
        ikametgah_adres: row['İkametgah Adres'] || row['IKAMETGAH_ADRES'] || null,
        en_son_mezuniyeti: row['En Son Mezuniyeti'] || row['EN_SON_MEZUNIYETI'] || null,
        getirdigi_belge: row['Getirdiği Belge'] || row['GETIRDIGI_BELGE'] || null,
        belge_tarihi: row['Belge Tarihi'] || row['BELGE_TARIHI'] || null,
        ilkogretim_okul: row['İlköğretim Okul'] || row['ILKOGRETIM_OKUL'] || null,
        ilkogretim_belge_tarihi: row['İlköğretim Belge Tarihi'] || row['ILKOGRETIM_BELGE_TARIHI'] || null,
        ilkogretim_belge_sayisi: row['İlköğretim Belge Sayısı'] || row['ILKOGRETIM_BELGE_SAYISI'] || null,
        lise_okul: row['Lise Okul'] || row['LISE_OKUL'] || null,
        lise_alan: row['Lise Alan'] || row['LISE_ALAN'] || null,
        lise_belge_tarihi: row['Lise Belge Tarihi'] || row['LISE_BELGE_TARIHI'] || null,
        lise_belge_sayisi: row['Lise Belge Sayısı'] || row['LISE_BELGE_SAYISI'] || null,
        lise_ogrenim_suresi: row['Lise Öğrenim Süresi'] || row['LISE_OGRENIM_SURESI'] || null,
        universite_okul: row['Üniversite Okul'] || row['UNIVERSITE_OKUL'] || null,
        universite_alan: row['Üniversite Alan'] || row['UNIVERSITE_ALAN'] || null,
        universite_belge_tarihi: row['Üniversite Belge Tarihi'] || row['UNIVERSITE_BELGE_TARIHI'] || null,
        universite_belge_sayisi: row['Üniversite Belge Sayısı'] || row['UNIVERSITE_BELGE_SAYISI'] || null,
        lisansustu_okul: row['Lisansüstü Okul'] || row['LISANSUSTU_OKUL'] || null,
        lisansustu_alan: row['Lisansüstü Alan'] || row['LISANSUSTU_ALAN'] || null,
        lisansustu_belge_tarihi: row['Lisansüstü Belge Tarihi'] || row['LISANSUSTU_BELGE_TARIHI'] || null,
        lisansustu_belge_sayisi: row['Lisansüstü Belge Sayısı'] || row['LISANSUSTU_BELGE_SAYISI'] || null,
        mezuniyet_aciklama: row['Mezuniyet Açıklama'] || row['MEZUNIYET_ACIKLAMA'] || null,
        usta_ogretmen_dayanak_belge: row['Usta Öğretmen Dayanak Belge'] || row['USTA_OGRETMEN_DAYANAK_BELGE'] || null,
        usta_ogretmen_belge_tarihi: row['Usta Öğretmen Belge Tarihi'] || row['USTA_OGRETMEN_BELGE_TARIHI'] || null,
        usta_ogretmen_belge_sayisi: row['Usta Öğretmen Belge Sayısı'] || row['USTA_OGRETMEN_BELGE_SAYISI'] || null,
        usta_ogretmen_talep_turu: row['Usta Öğretmen Talep Türü'] || row['USTA_OGRETMEN_TALEP_TURU'] || null,
        calisma1_cesit: row['Çalışma 1 Çeşit'] || row['CALISMA1_CESIT'] || null,
        calisma1_kurum: row['Çalışma 1 Kurum'] || row['CALISMA1_KURUM'] || null,
        calisma1_sayi: row['Çalışma 1 Sayı'] || row['CALISMA1_SAYI'] || null,
        calisma1_baslangic: row['Çalışma 1 Başlangıç'] || row['CALISMA1_BASLANGIC'] || null,
        calisma1_bitis: row['Çalışma 1 Bitiş'] || row['CALISMA1_BITIS'] || null,
        calisma1_aciklama: row['Çalışma 1 Açıklama'] || row['CALISMA1_ACIKLAMA'] || null,
        calisma2_cesit: row['Çalışma 2 Çeşit'] || row['CALISMA2_CESIT'] || null,
        calisma2_kurum: row['Çalışma 2 Kurum'] || row['CALISMA2_KURUM'] || null,
        calisma2_sayi: row['Çalışma 2 Sayı'] || row['CALISMA2_SAYI'] || null,
        calisma2_baslangic: row['Çalışma 2 Başlangıç'] || row['CALISMA2_BASLANGIC'] || null,
        calisma2_bitis: row['Çalışma 2 Bitiş'] || row['CALISMA2_BITIS'] || null,
        calisma2_aciklama: row['Çalışma 2 Açıklama'] || row['CALISMA2_ACIKLAMA'] || null,
        calisma3_cesit: row['Çalışma 3 Çeşit'] || row['CALISMA3_CESIT'] || null,
        calisma3_kurum: row['Çalışma 3 Kurum'] || row['CALISMA3_KURUM'] || null,
        calisma3_sayi: row['Çalışma 3 Sayı'] || row['CALISMA3_SAYI'] || null,
        calisma3_baslangic: row['Çalışma 3 Başlangıç'] || row['CALISMA3_BASLANGIC'] || null,
        calisma3_bitis: row['Çalışma 3 Bitiş'] || row['CALISMA3_BITIS'] || null,
        calisma3_aciklama: row['Çalışma 3 Açıklama'] || row['CALISMA3_ACIKLAMA'] || null,
        calisma4_cesit: row['Çalışma 4 Çeşit'] || row['CALISMA4_CESIT'] || null,
        calisma4_kurum: row['Çalışma 4 Kurum'] || row['CALISMA4_KURUM'] || null,
        calisma4_sayi: row['Çalışma 4 Sayı'] || row['CALISMA4_SAYI'] || null,
        calisma4_baslangic: row['Çalışma 4 Başlangıç'] || row['CALISMA4_BASLANGIC'] || null,
        calisma4_bitis: row['Çalışma 4 Bitiş'] || row['CALISMA4_BITIS'] || null,
        calisma4_aciklama: row['Çalışma 4 Açıklama'] || row['CALISMA4_ACIKLAMA'] || null,
        denklik_belge_tarihi: row['Denklik Belge Tarihi'] || row['DENKLIK_BELGE_TARIHI'] || null,
        kalfalik_sinavlarina_girmesi: row['Kalfalık Sınavlarına Girmesi'] || row['KALFALIK_SINAVLARINA_GIRMESI'] || null,
        dogrudan_kalfalik_belgesi: row['Doğrudan Kalfalık Belgesi'] || row['DOGRUDAN_KALFALIK_BELGESI'] || null,
        kalfalik_ustalik_sinavlari: row['Kalfalık Ustalık Sınavları'] || row['KALFALIK_USTALIK_SINAVLARI'] || null,
        ustalik_sinavina_girmesi: row['Ustalık Sınavına Girmesi'] || row['USTALIK_SINAVINA_GIRMESI'] || null,
        dogrudan_ustalik_belgesi: row['Doğrudan Ustalık Belgesi'] || row['DOGRUDAN_USTALIK_BELGESI'] || null,
        sinav_turu: row['Sınav Türü'] || row['SINAV_TURU'] || null,
        sinav_tarihi: row['Sınav Tarihi'] || row['SINAV_TARIHI'] || null,
        sinav_saati: row['Sınav Saati'] || row['SINAV_SAATI'] || null,
        sinav_yeri: row['Sınav Yeri'] || row['SINAV_YERI'] || null,
        sinav_sonucu: row['Sınav Sonucu'] || row['SINAV_SONUCU'] || null
      };


      // Zorunlu alan kontrolü
      if (!aday.adi || !aday.soyadi) {
        errors.push({ satir: index + 2, mesaj: 'Adı ve Soyadı zorunludur' });
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
            errors.push({ satir: index + 2, mesaj: err.message });
          } else {
            imported++;
          }
        }
      );
    });

    res.json({
      toplam: data.length,
      aktarilan: imported,
      hatalar: errors
    });
  } catch (error) {
    res.status(500).json({ error: 'Excel dosyası okunamadı: ' + error.message });
  }
});

// Adayları Excel'e dışa aktar
router.get('/export', (req, res) => {
  db.all('SELECT * FROM adaylar ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });

    const data = rows.map(row => ({
      'Başvuru No': row.basvuru_no,
      'Sıra No': row.sira_no,
      'Öğrenim Yılı': row.ogrenim_yili,
      'Kayıt Tarihi': row.kayit_tarihi,
      'Başvuru Kayıt Türü': row.basvuru_kayit_turu,
      'Kimlik No': row.kimlik_no,
      'Doğum Tarihi': row.dogum_tarihi,
      'Adı': row.adi,
      'Soyadı': row.soyadi,
      'Kapsam': row.kapsam,
      'Alan': row.alan,
      'Dal': row.dal,
      'MYK Yeterlilik': row.myk_yeterlilik,
      'MYK Kodu': row.myk_kod,
      'Öğrenci Eğitim Türü': row.ogrenci_egitim_turu,
      'Çerçeve Programı': row.cerceve_programi,
      'E-posta': row.eposta,
      'Telefon': row.telefon,
      'İkametgah Adres': row.ikametgah_adres,
      'En Son Mezuniyeti': row.en_son_mezuniyeti,
      'Getirdiği Belge': row.getirdigi_belge,
      'Belge Tarihi': row.belge_tarihi,
      'İlköğretim Okul': row.ilkogretim_okul,
      'İlköğretim Belge Tarihi': row.ilkogretim_belge_tarihi,
      'İlköğretim Belge Sayısı': row.ilkogretim_belge_sayisi,
      'Lise Okul': row.lise_okul,
      'Lise Alan': row.lise_alan,
      'Lise Belge Tarihi': row.lise_belge_tarihi,
      'Lise Belge Sayısı': row.lise_belge_sayisi,
      'Lise Öğrenim Süresi': row.lise_ogrenim_suresi,
      'Üniversite Okul': row.universite_okul,
      'Üniversite Alan': row.universite_alan,
      'Üniversite Belge Tarihi': row.universite_belge_tarihi,
      'Üniversite Belge Sayısı': row.universite_belge_sayisi,
      'Lisansüstü Okul': row.lisansustu_okul,
      'Lisansüstü Alan': row.lisansustu_alan,
      'Lisansüstü Belge Tarihi': row.lisansustu_belge_tarihi,
      'Lisansüstü Belge Sayısı': row.lisansustu_belge_sayisi,
      'Mezuniyet Açıklama': row.mezuniyet_aciklama,
      'Usta Öğretmen Dayanak Belge': row.usta_ogretmen_dayanak_belge,
      'Usta Öğretmen Belge Tarihi': row.usta_ogretmen_belge_tarihi,
      'Usta Öğretmen Belge Sayısı': row.usta_ogretmen_belge_sayisi,
      'Usta Öğretmen Talep Türü': row.usta_ogretmen_talep_turu,
      'Çalışma 1 Çeşit': row.calisma1_cesit,
      'Çalışma 1 Kurum': row.calisma1_kurum,
      'Çalışma 1 Sayı': row.calisma1_sayi,
      'Çalışma 1 Başlangıç': row.calisma1_baslangic,
      'Çalışma 1 Bitiş': row.calisma1_bitis,
      'Çalışma 1 Açıklama': row.calisma1_aciklama,
      'Çalışma 2 Çeşit': row.calisma2_cesit,
      'Çalışma 2 Kurum': row.calisma2_kurum,
      'Çalışma 2 Sayı': row.calisma2_sayi,
      'Çalışma 2 Başlangıç': row.calisma2_baslangic,
      'Çalışma 2 Bitiş': row.calisma2_bitis,
      'Çalışma 2 Açıklama': row.calisma2_aciklama,
      'Çalışma 3 Çeşit': row.calisma3_cesit,
      'Çalışma 3 Kurum': row.calisma3_kurum,
      'Çalışma 3 Sayı': row.calisma3_sayi,
      'Çalışma 3 Başlangıç': row.calisma3_baslangic,
      'Çalışma 3 Bitiş': row.calisma3_bitis,
      'Çalışma 3 Açıklama': row.calisma3_aciklama,
      'Çalışma 4 Çeşit': row.calisma4_cesit,
      'Çalışma 4 Kurum': row.calisma4_kurum,
      'Çalışma 4 Sayı': row.calisma4_sayi,
      'Çalışma 4 Başlangıç': row.calisma4_baslangic,
      'Çalışma 4 Bitiş': row.calisma4_bitis,
      'Çalışma 4 Açıklama': row.calisma4_aciklama,
      'Denklik Belge Tarihi': row.denklik_belge_tarihi,
      'Kalfalık Sınavlarına Girmesi': row.kalfalik_sinavlarina_girmesi,
      'Doğrudan Kalfalık Belgesi': row.dogrudan_kalfalik_belgesi,
      'Kalfalık Ustalık Sınavları': row.kalfalik_ustalik_sinavlari,
      'Ustalık Sınavına Girmesi': row.ustalik_sinavina_girmesi,
      'Doğrudan Ustalık Belgesi': row.dogrudan_ustalik_belgesi,
      'Sınav Türü': row.sinav_turu,
      'Sınav Tarihi': row.sinav_tarihi,
      'Sınav Saati': row.sinav_saati,
      'Sınav Yeri': row.sinav_yeri,
      'Sınav Sonucu': row.sinav_sonucu,
      'E-MESEM Kayıt Durumu': row.emesem_kayit_durumu,

      'E-MESEM Kayıt Tarihi': row.emesem_kayit_tarihi
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Adaylar');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=adaylar.xlsx');
    res.send(buffer);
  });
});

module.exports = router;
