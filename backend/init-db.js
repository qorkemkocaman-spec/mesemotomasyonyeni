const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_mB9vDL5JpZKS@ep-autumn-lake-avsnwmgh.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function init() {
  try {
    // Kullanıcılar tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Adaylar tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS adaylar (
        id SERIAL PRIMARY KEY,
        basvuru_no TEXT,
        sira_no INTEGER,
        ogrenim_yili TEXT,
        kayit_tarihi TEXT,
        basvuru_kayit_turu TEXT,
        kimlik_no TEXT,
        dogum_tarihi TEXT,
        adi TEXT,
        soyadi TEXT,
        kapsam TEXT,
        alan TEXT,
        dal TEXT,
        myk_yeterlilik TEXT,
        myk_kod TEXT,
        ogrenci_egitim_turu TEXT,
        cerceve_programi TEXT,
        eposta TEXT,
        telefon TEXT,
        ikametgah_adres TEXT,
        en_son_mezuniyeti TEXT,
        getirdigi_belge TEXT,
        belge_tarihi TEXT,
        ilkogretim_okul TEXT,
        ilkogretim_belge_tarihi TEXT,
        ilkogretim_belge_sayisi TEXT,
        lise_okul TEXT,
        lise_alan TEXT,
        lise_belge_tarihi TEXT,
        lise_belge_sayisi TEXT,
        lise_ogrenim_suresi TEXT,
        universite_okul TEXT,
        universite_alan TEXT,
        universite_belge_tarihi TEXT,
        universite_belge_sayisi TEXT,
        lisansustu_okul TEXT,
        lisansustu_alan TEXT,
        lisansustu_belge_tarihi TEXT,
        lisansustu_belge_sayisi TEXT,
        mezuniyet_aciklama TEXT,
        usta_ogretmen_dayanak_belge TEXT,
        usta_ogretmen_belge_tarihi TEXT,
        usta_ogretmen_belge_sayisi TEXT,
        usta_ogretmen_talep_turu TEXT,
        calisma1_cesit TEXT,
        calisma1_kurum TEXT,
        calisma1_sayi TEXT,
        calisma1_baslangic TEXT,
        calisma1_bitis TEXT,
        calisma1_aciklama TEXT,
        calisma2_cesit TEXT,
        calisma2_kurum TEXT,
        calisma2_sayi TEXT,
        calisma2_baslangic TEXT,
        calisma2_bitis TEXT,
        calisma2_aciklama TEXT,
        calisma3_cesit TEXT,
        calisma3_kurum TEXT,
        calisma3_sayi TEXT,
        calisma3_baslangic TEXT,
        calisma3_bitis TEXT,
        calisma3_aciklama TEXT,
        calisma4_cesit TEXT,
        calisma4_kurum TEXT,
        calisma4_sayi TEXT,
        calisma4_baslangic TEXT,
        calisma4_bitis TEXT,
        calisma4_aciklama TEXT,
        denklik_belge_tarihi TEXT,
        kalfalik_sinavlarina_girmesi TEXT,
        dogrudan_kalfalik_belgesi TEXT,
        kalfalik_ustalik_sinavlari TEXT,
        ustalik_sinavina_girmesi TEXT,
        dogrudan_ustalik_belgesi TEXT,
        sinav_turu TEXT,
        sinav_tarihi TEXT,
        sinav_saati TEXT,
        sinav_yeri TEXT,
        sinav_sonucu TEXT,
        emesem_kayit_durumu TEXT DEFAULT 'Bekliyor',
        emesem_kayit_tarihi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Otomasyon log tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otomasyon_log (
        id SERIAL PRIMARY KEY,
        aday_id INTEGER,
        islem_turu TEXT,
        durum TEXT,
        mesaj TEXT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aday_id) REFERENCES adaylar(id)
      )
    `);

    // Kurum ayarları tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kurum_ayarlari (
        id SERIAL PRIMARY KEY,
        kurum_adi TEXT,
        emesem_url TEXT,
        emesem_kullanici TEXT,
        emesem_sifre TEXT,
        ogrenim_yili TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Komisyon üyeleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS komisyon_uyeleri (
        id SERIAL PRIMARY KEY,
        ad_soyad TEXT NOT NULL,
        gorev TEXT NOT NULL,
        unvan TEXT,
        sira_no INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Varsayılan admin kullanıcısı
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    await pool.query(
      `INSERT INTO users (username, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', defaultPassword, 'Sistem Yöneticisi', 'admin']
    );

    console.log('Veritabanı tabloları başarıyla oluşturuldu!');
    await pool.end();
  } catch (err) {
    console.error('Hata:', err.message);
    await pool.end();
    process.exit(1);
  }
}

init();
