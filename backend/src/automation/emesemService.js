const { chromium } = require('playwright');
const db = require('../db/database');

/**
 * E-MESEM Otomasyon Servisi
 * 
 * Giriş akışı (kullanıcı tarafından manuel yapılır):
 * 1. https://e-mesem.meb.gov.tr/ adresine gidilir
 * 2. Sağ üstten MEBBİS girişine tıklanır
 * 3. Güvenlik kodu, kullanıcı adı ve şifre girilir
 * 4. MEB Ajanda uygulamasından doğrulama kodu girilir
 * 5. Sisteme giriş yapılır ve kayıt ekranına gelinir
 * 
 * Bu servis, kullanıcının tarayıcısına CDP (Chrome DevTools Protocol) 
 * üzerinden bağlanarak kayıt ekranındaki form alanlarını otomatik doldurur.
 */
class EmesemService {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.connected = false;
  }

  /**
   * Kullanıcının Chrome tarayıcısına CDP üzerinden bağlanır.
   * Kullanıcı Chrome'u şu komutla açmalıdır:
   * chrome.exe --remote-debugging-port=9222
   */
  async connectToBrowser(port = 9222) {
    try {
      this.browser = await chromium.connectOverCDP(`http://localhost:${port}`);
      const contexts = this.browser.contexts();
      
      if (contexts.length === 0) {
        return { success: false, message: 'Tarayıcıda açık sekme bulunamadı. Lütfen E-MESEM sayfasını açın.' };
      }

      // E-MESEM sayfasını bul
      this.context = contexts[0];
      const pages = this.context.pages();
      
      // E-MESEM sayfasını ara
      const emesemPage = pages.find(p => p.url().includes('e-mesem.meb.gov.tr') || p.url().includes('emesem.meb.gov.tr'));
      
      if (emesemPage) {
        this.page = emesemPage;
      } else {
        // Yeni sekme aç
        this.page = await this.context.newPage();
        await this.page.goto('https://e-mesem.meb.gov.tr/', { waitUntil: 'domcontentloaded' });
      }

      this.connected = true;
      return { success: true, message: 'Tarayıcıya bağlanıldı' };
    } catch (error) {
      this.connected = false;
      return { 
        success: false, 
        message: 'Tarayıcıya bağlanılamadı. Lütfen Chrome\'u şu komutla açın: chrome.exe --remote-debugging-port=9222. Hata: ' + error.message 
      };
    }
  }

  /**
   * E-MESEM'e otomatik giriş yapar (Robot).
   * MEBBİS kullanıcı adı ve şifresi ile otomatik giriş yapar.
   */
  async autoLogin(kullaniciAdi, sifre) {
    if (!this.page) {
      return { success: false, message: 'Tarayıcıya bağlantı yok. Önce tarayıcıya bağlanın.' };
    }

    try {
      // E-MESEM ana sayfasına git
      await this.page.goto('https://e-mesem.meb.gov.tr/', { waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(2000);

      // MEBBİS giriş butonunu bul ve tıkla
      const mebbisBtn = await this.page.$('a:has-text("MEBBİS"), button:has-text("MEBBİS"), a:has-text("Giriş"), button:has-text("Giriş")');
      if (mebbisBtn) {
        await mebbisBtn.click();
        await this.page.waitForTimeout(2000);
      }

      // Kullanıcı adı alanını bul ve doldur
      const kullaniciSelectors = [
        'input[name="kullaniciAdi"]', 'input[name="username"]', 'input[name="kullanici_adi"]',
        'input[id*="kullanici"]', 'input[id*="username"]', 'input[placeholder*="Kullanıcı"]',
        'input[placeholder*="Kullanici"]', 'input[placeholder*="MEBBİS"]', 'input[placeholder*="MEBBIS"]'
      ];
      let kullaniciBulundu = false;
      for (const sel of kullaniciSelectors) {
        const el = await this.page.$(sel);
        if (el) {
          await el.fill(kullaniciAdi);
          kullaniciBulundu = true;
          break;
        }
      }

      if (!kullaniciBulundu) {
        return { 
          success: false, 
          message: 'Kullanıcı adı alanı bulunamadı. Lütfen MEBBİS giriş ekranına manuel olarak gidin.' 
        };
      }

      // Şifre alanını bul ve doldur
      const sifreSelectors = [
        'input[name="sifre"]', 'input[name="password"]', 'input[type="password"]',
        'input[id*="sifre"]', 'input[id*="password"]', 'input[placeholder*="Şifre"]',
        'input[placeholder*="Sifre"]', 'input[placeholder*="Parola"]'
      ];
      let sifreBulundu = false;
      for (const sel of sifreSelectors) {
        const el = await this.page.$(sel);
        if (el) {
          await el.fill(sifre);
          sifreBulundu = true;
          break;
        }
      }

      if (!sifreBulundu) {
        return { 
          success: false, 
          message: 'Şifre alanı bulunamadı. Lütfen MEBBİS giriş ekranına manuel olarak gidin.' 
        };
      }

      // Güvenlik kodu alanını bul (varsa)
      const guvenlikSelectors = [
        'input[name="guvenlikKodu"]', 'input[name="guvenlik_kodu"]', 'input[id*="guvenlik"]',
        'input[id*="captcha"]', 'input[placeholder*="Güvenlik"]', 'input[placeholder*="Guvenlik"]'
      ];
      for (const sel of guvenlikSelectors) {
        const el = await this.page.$(sel);
        if (el) {
          return { 
            success: false, 
            message: 'Güvenlik kodu alanı bulundu. Lütfen güvenlik kodunu manuel olarak girin ve giriş yapın.' 
          };
        }
      }

      // Giriş butonunu bul ve tıkla
      const girisBtn = await this.page.$('button[type="submit"], button:has-text("Giriş"), button:has-text("Gönder"), input[type="submit"]');
      if (girisBtn) {
        await girisBtn.click();
        await this.page.waitForTimeout(3000);
      }

      // Giriş başarılı mı kontrol et
      const url = this.page.url();
      const bodyText = await this.page.textContent('body').catch(() => '');

      if (bodyText.includes('MEB Ajanda') || bodyText.includes('doğrulama') || bodyText.includes('Doğrulama')) {
        return { 
          success: false, 
          message: 'MEB Ajanda doğrulama kodu gerekiyor. Lütfen telefonunuzdaki MEB Ajanda uygulamasından gelen kodu girin.' 
        };
      }

      const isLoggedIn = !url.includes('login') && 
        !url.includes('giris') && 
        !bodyText.includes('MEBBİS Girişi') &&
        !bodyText.includes('Kullanıcı Adı');

      if (isLoggedIn) {
        return { success: true, message: 'E-MESEM sistemine otomatik giriş yapıldı' };
      }

      return { 
        success: false, 
        message: 'Giriş yapılamadı. Kullanıcı adı veya şifre hatalı olabilir. Lütfen manuel olarak giriş yapın.' 
      };
    } catch (error) {
      return { success: false, message: 'Otomatik giriş sırasında hata: ' + error.message };
    }
  }

  /**
   * E-MESEM giriş durumunu kontrol eder.
   * Kullanıcı kendisi giriş yapacağı için sadece sayfanın durumunu kontrol ederiz.
   */
  async checkLoginStatus() {

    if (!this.page) {
      return { success: false, message: 'Tarayıcıya bağlantı yok' };
    }

    try {
      const url = this.page.url();
      const bodyText = await this.page.textContent('body').catch(() => '');

      // Giriş yapılmış mı kontrol et
      const isLoggedIn = !url.includes('login') && 
        !url.includes('giris') && 
        !bodyText.includes('MEBBİS Girişi') &&
        !bodyText.includes('Kullanıcı Adı');

      return { 
        success: isLoggedIn, 
        message: isLoggedIn ? 'E-MESEM oturumu aktif' : 'E-MESEM girişi yapılmamış. Lütfen önce giriş yapın.',
        url: url
      };
    } catch (error) {
      return { success: false, message: 'Sayfa durumu kontrol edilemedi: ' + error.message };
    }
  }

  /**
   * Kayıt ekranına gitmeye çalışır.
   * Kullanıcı zaten kayıt ekranındaysa bir şey yapmaz.
   */
  async goToKayitEkrani() {
    if (!this.page) {
      return { success: false, message: 'Tarayıcıya bağlantı yok' };
    }

    try {
      const url = this.page.url();
      
      // Zaten kayıt ekranındaysa
      if (url.includes('kayit') || url.includes('aday') || url.includes('basvuru')) {
        return { success: true, message: 'Zaten kayıt ekranındasınız', url: url };
      }

      // Menüden kayıt ekranına gitmeyi dene
      const kayitLink = await this.page.$('a:has-text("Aday Kayıt"), a:has-text("Kayıt"), a:has-text("Başvuru")');
      if (kayitLink) {
        await kayitLink.click();
        await this.page.waitForTimeout(2000);
        return { success: true, message: 'Kayıt ekranına gidildi', url: this.page.url() };
      }

      return { 
        success: false, 
        message: 'Kayıt ekranına otomatik gidilemedi. Lütfen E-MESEM üzerinden kayıt ekranına manuel olarak gidin.' 
      };
    } catch (error) {
      return { success: false, message: 'Kayıt ekranına gidilemedi: ' + error.message };
    }
  }

  /**
   * Adayı E-MESEM kayıt ekranına kaydeder.
   * Kullanıcının tarayıcısındaki açık kayıt formunu doldurur.
   */
  async adayKaydet(aday) {
    if (!this.page) {
      return { success: false, message: 'Tarayıcıya bağlantı yok. Önce tarayıcıya bağlanın.' };
    }

    try {
      // Kayıt ekranında olduğumuzdan emin ol
      const url = this.page.url();
      const bodyText = await this.page.textContent('body').catch(() => '');

      // Form alanlarını bul ve doldur
      const formFilled = await this.fillForm(aday);
      
      if (!formFilled) {
        return { 
          success: false, 
          message: 'Kayıt formu bulunamadı. Lütfen E-MESEM üzerinde kayıt ekranına gidin.' 
        };
      }

      // Kaydet butonunu bul ve tıkla
      const kaydetBtn = await this.page.$('button:has-text("Kaydet"), button:has-text("Gönder"), button:has-text("Başvuruyu Tamamla"), input[type="submit"]');
      
      if (!kaydetBtn) {
        return { 
          success: false, 
          message: 'Kaydet butonu bulunamadı. Form alanları dolduruldu ancak kaydetme işlemi manuel yapılmalı.' 
        };
      }

      await kaydetBtn.click();
      await this.page.waitForTimeout(3000);

      // Başarı kontrolü
      const resultText = await this.page.textContent('body').catch(() => '');
      if (resultText.includes('başarılı') || resultText.includes('kaydedildi') || resultText.includes('tamamlandı')) {
        return { success: true, message: 'Aday E-MESEM sistemine kaydedildi' };
      }

      return { success: false, message: 'Kayıt işlemi tamamlanamadı. Lütfen ekranı kontrol edin.' };
    } catch (error) {
      return { success: false, message: 'Aday kaydı sırasında hata: ' + error.message };
    }
  }

  /**
   * Kayıt formundaki alanları doldurur.
   * E-MESEM form alanlarını çeşitli selector'larla bulmaya çalışır.
   */
  async fillForm(aday) {
    try {
      let filled = false;

      // Kimlik No
      const kimlikSelectors = [
        'input[name="kimlikNo"]', 'input[name="tcKimlikNo"]', 'input[name="tckn"]',
        'input[id*="kimlik"]', 'input[id*="tc"]', 'input[placeholder*="Kimlik"]',
        'input[placeholder*="TC"]'
      ];
      for (const sel of kimlikSelectors) {
        const el = await this.page.$(sel);
        if (el) {
          await el.fill(aday.kimlik_no || '');
          filled = true;
          break;
        }
      }

      // Ad
      const adSelectors = [
        'input[name="adi"]', 'input[name="ad"]', 'input[name="firstName"]',
        'input[id*="ad"]', 'input[placeholder*="Ad"]'
      ];
      for (const sel of adSelectors) {
        const el = await this.page.$(sel);
        if (el) {
          await el.fill(aday.adi || '');
          filled = true;
          break;
        }
      }

      // Soyad
      const soyadSelectors = [
        'input[name="soyadi"]', 'input[name="soyad"]', 'input[name="lastName"]',
        'input[id*="soyad"]', 'input[placeholder*="Soyad"]'
      ];
      for (const sel of soyadSelectors) {
        const el = await this.page.$(sel);
        if (el) {
          await el.fill(aday.soyadi || '');
          filled = true;
          break;
        }
      }

      // Doğum Tarihi
      if (aday.dogum_tarihi) {
        const dogumSelectors = [
          'input[name="dogumTarihi"]', 'input[name="dogum_tarihi"]', 'input[type="date"]',
          'input[id*="dogum"]', 'input[placeholder*="Doğum"]'
        ];
        for (const sel of dogumSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.dogum_tarihi);
            filled = true;
            break;
          }
        }
      }

      // E-posta
      if (aday.eposta) {
        const epostaSelectors = [
          'input[name="eposta"]', 'input[name="email"]', 'input[type="email"]',
          'input[id*="eposta"]', 'input[id*="email"]', 'input[placeholder*="E-posta"]',
          'input[placeholder*="Eposta"]', 'input[placeholder*="Mail"]'
        ];
        for (const sel of epostaSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.eposta);
            filled = true;
            break;
          }
        }
      }

      // Telefon
      if (aday.telefon) {
        const telefonSelectors = [
          'input[name="telefon"]', 'input[name="tel"]', 'input[name="phone"]',
          'input[id*="telefon"]', 'input[id*="tel"]', 'input[placeholder*="Telefon"]',
          'input[placeholder*="Tel"]'
        ];
        for (const sel of telefonSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.telefon);
            filled = true;
            break;
          }
        }
      }

      // Cinsiyet
      if (aday.cinsiyet) {
        const cinsiyetSelectors = [
          'select[name="cinsiyet"]', 'select[id*="cinsiyet"]'
        ];
        for (const sel of cinsiyetSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.selectOption(aday.cinsiyet);
            filled = true;
            break;
          }
        }
      }

      // Alan (select)
      if (aday.alan) {
        const alanSelectors = [
          'select[name="alan"]', 'select[id*="alan"]', 'select[name*="meslek"]',
          'select[id*="meslek"]'
        ];
        for (const sel of alanSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.alan });
            } catch {
              try {
                await el.selectOption(aday.alan);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // Dal (select)
      if (aday.dal) {
        const dalSelectors = [
          'select[name="dal"]', 'select[id*="dal"]'
        ];
        for (const sel of dalSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.dal });
            } catch {
              try {
                await el.selectOption(aday.dal);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // Yeterlilik (select)
      if (aday.yeterlilik) {
        const yeterlilikSelectors = [
          'select[name="yeterlilik"]', 'select[id*="yeterlilik"]', 'select[name*="meslek"]',
          'select[id*="meslek"]'
        ];
        for (const sel of yeterlilikSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.yeterlilik });
            } catch {
              try {
                await el.selectOption(aday.yeterlilik);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // Öğrenim Durumu
      if (aday.ogrenim_durumu) {
        const ogrenimSelectors = [
          'select[name="ogrenimDurumu"]', 'select[name="ogrenim_durumu"]', 'select[id*="ogrenim"]'
        ];
        for (const sel of ogrenimSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.ogrenim_durumu });
            } catch {
              try {
                await el.selectOption(aday.ogrenim_durumu);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // Adres
      if (aday.adres) {
        const adresSelectors = [
          'textarea[name="adres"]', 'textarea[id*="adres"]', 'input[name="adres"]',
          'input[id*="adres"]', 'textarea[placeholder*="Adres"]'
        ];
        for (const sel of adresSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.adres);
            filled = true;
            break;
          }
        }
      }

      // İl
      if (aday.il) {
        const ilSelectors = [
          'select[name="il"]', 'select[id*="il"]'
        ];
        for (const sel of ilSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.il });
            } catch {
              try {
                await el.selectOption(aday.il);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // İlçe
      if (aday.ilce) {
        const ilceSelectors = [
          'select[name="ilce"]', 'select[id*="ilce"]'
        ];
        for (const sel of ilceSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.ilce });
            } catch {
              try {
                await el.selectOption(aday.ilce);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // Kurum / Okul
      if (aday.kurum) {
        const kurumSelectors = [
          'input[name="kurum"]', 'input[name="okul"]', 'input[id*="kurum"]',
          'input[id*="okul"]', 'input[placeholder*="Kurum"]', 'input[placeholder*="Okul"]'
        ];
        for (const sel of kurumSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.kurum);
            filled = true;
            break;
          }
        }
      }

      // Başvuru No
      if (aday.basvuru_no) {
        const basvuruSelectors = [
          'input[name="basvuruNo"]', 'input[name="basvuru_no"]', 'input[id*="basvuru"]'
        ];
        for (const sel of basvuruSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.basvuru_no);
            filled = true;
            break;
          }
        }
      }

      // Sınav Türü
      if (aday.sinav_turu) {
        const sinavTuruSelectors = [
          'select[name="sinavTuru"]', 'select[name="sinav_turu"]', 'select[id*="sinav"]',
          'select[name*="sinav"]'
        ];
        for (const sel of sinavTuruSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.sinav_turu });
            } catch {
              try {
                await el.selectOption(aday.sinav_turu);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      // Sınav Tarihi
      if (aday.sinav_tarihi) {
        const sinavTarihiSelectors = [
          'input[name="sinavTarihi"]', 'input[name="sinav_tarihi"]', 'input[id*="sinavTarihi"]',
          'input[id*="sinav_tarihi"]', 'input[placeholder*="Sınav Tarihi"]'
        ];
        for (const sel of sinavTarihiSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.sinav_tarihi);
            filled = true;
            break;
          }
        }
      }

      // Sınav Saati
      if (aday.sinav_saati) {
        const sinavSaatiSelectors = [
          'input[name="sinavSaati"]', 'input[name="sinav_saati"]', 'input[id*="sinavSaati"]',
          'input[id*="sinav_saati"]', 'input[placeholder*="Sınav Saati"]'
        ];
        for (const sel of sinavSaatiSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.sinav_saati);
            filled = true;
            break;
          }
        }
      }

      // Sınav Yeri
      if (aday.sinav_yeri) {
        const sinavYeriSelectors = [
          'input[name="sinavYeri"]', 'input[name="sinav_yeri"]', 'input[id*="sinavYeri"]',
          'input[id*="sinav_yeri"]', 'input[placeholder*="Sınav Yeri"]'
        ];
        for (const sel of sinavYeriSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            await el.fill(aday.sinav_yeri);
            filled = true;
            break;
          }
        }
      }

      // Sınav Sonucu
      if (aday.sinav_sonucu) {
        const sinavSonucuSelectors = [
          'select[name="sinavSonucu"]', 'select[name="sinav_sonucu"]', 'select[id*="sinavSonucu"]',
          'select[id*="sinav_sonucu"]'
        ];
        for (const sel of sinavSonucuSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            try {
              await el.selectOption({ label: aday.sinav_sonucu });
            } catch {
              try {
                await el.selectOption(aday.sinav_sonucu);
              } catch {}
            }
            filled = true;
            break;
          }
        }
      }

      return filled;

    } catch (error) {
      console.error('Form doldurma hatası:', error);
      return false;
    }
  }

  /**
   * Toplu kayıt işlemi.
   * Her aday için kayıt formunu doldurur ve kaydeder.
   */
  async topluKayit(adayIds) {
    const results = [];
    
    for (const id of adayIds) {
      const aday = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM adaylar WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!aday) {
        results.push({ adayId: id, success: false, message: 'Aday bulunamadı' });
        continue;
      }

      const result = await this.adayKaydet(aday);
      results.push({ adayId: id, ...result });

      // Log kaydı
      db.run(
        'INSERT INTO otomasyon_log (aday_id, islem_turu, durum, mesaj) VALUES (?, ?, ?, ?)',
        [id, 'E-MESEM Kayıt', result.success ? 'Başarılı' : 'Hata', result.message]
      );

      // Aday durumunu güncelle
      if (result.success) {
        db.run(
          'UPDATE adaylar SET emesem_kayit_durumu = ?, emesem_kayit_tarihi = ? WHERE id = ?',
          ['Kayıtlı', new Date().toISOString().split('T')[0], id]
        );
      }
    }

    return results;
  }

  /**
   * Tarayıcı bağlantısını kapatır.
   */
  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {}
    }
    this.browser = null;
    this.context = null;
    this.page = null;
    this.connected = false;
  }
}

module.exports = new EmesemService();
