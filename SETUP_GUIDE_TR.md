# YZ CV ve Niyet Mektubu Optimizasyonu - Komple Kurulum Kılavuzu (Türkçe)

## 📹 Adım Adım Kurulum ve Yapılandırma

Bu kılavuz, YZ CV ve Niyet Mektubu Optimizasyon Chrome Eklentisini kurmak ve yapılandırmak için gereken her adımda size yol gösterecektir.

---

## 📋 Ön Koşullar

Başlamadan önce, aşağıdakilere sahip olduğunuzdan emin olun:

1. **Google Chrome Tarayıcı** (sürüm 90 veya üzeri)
2. **Node.js** (sürüm 16 veya üzeri) - [Buradan indirin](https://nodejs.org/)
3. **npm** (Node.js ile birlikte gelir) veya **yarn**
4. **Git** (opsiyonel, depoyu klonlamak için)
5. Bu YZ sağlayıcılarından birinden **API Anahtarı** (opsiyonel, tam YZ özellikleri için):
   - OpenAI (ChatGPT) - [API Anahtarı Alın](https://platform.openai.com/api-keys)
   - Google Gemini - [API Anahtarı Alın](https://makersuite.google.com/app/apikey)
   - Anthropic Claude - [API Anahtarı Alın](https://console.anthropic.com/)

---

## 🚀 Bölüm 1: Kurulum (5 dakika)

### Adım 1: Depoyu İndirin veya Klonlayın

**Seçenek A: Git Kullanarak (Önerilen)**
```bash
# Terminalinizi açın ve çalıştırın:
git clone <depo-url>
cd ai-cv-optimizer
```

**Seçenek B: ZIP İndirme**
1. Projeyi ZIP dosyası olarak indirin
2. Seçtiğiniz bir klasöre çıkarın
3. O klasörde terminal/komut satırı açın

### Adım 2: Bağımlılıkları Yükleyin

```bash
# Tüm gerekli paketleri yükleyin
npm install
```

Bu işlem 2-3 dakika sürecek ve tüm gerekli kütüphaneleri yükleyecektir.

### Adım 3: Eklentiyi Derleyin

```bash
# Chrome için eklentiyi derleyin
npm run build
```

Proje dizininizde yeni bir `dist` klasörü oluşturulduğunu göreceksiniz.

---

## 🔧 Bölüm 2: Eklentiyi Chrome'a Yükleme (3 dakika)

### Adım 4: Chrome Eklentiler Sayfasını Açın

1. **Google Chrome**'u açın
2. Şu adrese gidin: `chrome://extensions/`
   - Veya **üç nokta** (⋮) → **Diğer araçlar** → **Uzantılar**'a tıklayın

### Adım 5: Geliştirici Modunu Etkinleştirin

1. **Sağ üst köşede** **Geliştirici modu** anahtarını bulun
2. **AÇMAK** için tıklayın
3. Yeni düğmelerin göründüğünü göreceksiniz: "Paketlenmemiş öğe yükle", vb.

### Adım 6: Eklentiyi Yükleyin

1. **"Paketlenmemiş öğe yükle"** düğmesine tıklayın
2. Proje klasörünüze gidin
3. **`dist`** klasörünü seçin (kök klasör DEĞİL)
4. **"Klasörü Seç"** düğmesine tıklayın

### Adım 7: Kurulumu Doğrulayın

✅ Eklentiyi uzantılar listenizde şu şekilde görmelisiniz:
- Eklenti adı: "AI CV & Cover Letter Optimizer"
- Durum: Etkin (mavi anahtar)
- Chrome araç çubuğunuzda eklenti simgesi

---

## ⚙️ Bölüm 3: İlk Yapılandırma (5 dakika)

### Adım 8: Eklentiyi Açın

1. Chrome araç çubuğundaki **eklenti simgesine** tıklayın
   - Görmüyorsanız, **yapboz simgesine** (🧩) tıklayın ve eklentiyi sabitleyin
2. Eklenti açılır penceresi açılacaktır

### Adım 9: Dilinizi Ayarlayın

1. **Ayarlar** (⚙️) sekmesine tıklayın
2. **"Dil"** seçeneğini bulun
3. Tercih ettiğiniz dili seçin:
   - **İngilizce** (EN)
   - **Türkçe** (TR)

### Adım 10: YZ Sağlayıcısını Yapılandırın

1. **Ayarlar** sekmesinde, **"YZ Sağlayıcısı"** bölümünü bulun
2. YZ sağlayıcınızı seçin:
   - **ChatGPT (OpenAI)** - Önerilen
   - **Gemini (Google)**
   - **Claude (Anthropic)**
3. **"API Anahtarını Kaydet"** düğmesine tıklayın

### Adım 11: API Anahtarını Girin

**ChatGPT (OpenAI) için:**
1. [OpenAI API Anahtarları](https://platform.openai.com/api-keys)'nı ziyaret edin
2. Oturum açın veya hesap oluşturun
3. **"Yeni gizli anahtar oluştur"** düğmesine tıklayın
4. Anahtarı kopyalayın (güvenli bir yerde saklayın!)
5. Eklentiye yapıştırın
6. **"Kaydet"** düğmesine tıklayın

**Gemini için:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey)'yu ziyaret edin
2. Google hesabınızla oturum açın
3. **"API Anahtarı Oluştur"** düğmesine tıklayın
4. Kopyalayın ve eklentiye yapıştırın

**Claude için:**
1. [Anthropic Console](https://console.anthropic.com/)'u ziyaret edin
2. Oturum açın ve API Anahtarları'na gidin
3. Yeni bir anahtar oluşturun ve kopyalayın
4. Eklentiye yapıştırın

---

## 📝 Bölüm 4: İlk Kurulum (10 dakika)

### Adım 12: CV'nizi Yükleyin (Opsiyonel)

1. **"CV Bilgileri"** sekmesine gidin
2. **"CV Yükle"** düğmesine tıklayın
3. CV dosyanızı seçin (PDF veya DOCX)
4. Otomatik ayrıştırmayı bekleyin
5. Otomatik doldurulan bilgileri inceleyin ve düzeltin

### Adım 13: Kişisel Bilgileri Doldurun

Tüm gerekli alanları doldurun:

**Temel Bilgiler:**
- Ad
- İkinci Ad (opsiyonel)
- Soyad
- E-posta
- Telefon Numarası (ülke kodu ile)

**Profesyonel Bağlantılar:**
- LinkedIn Kullanıcı Adı (sadece kullanıcı adı, tam URL değil)
- GitHub Kullanıcı Adı (opsiyonel)
- Portföy URL'si (opsiyonel)
- WhatsApp Linki (opsiyonel)

**Profesyonel Özet:**
Profesyonel geçmişiniz hakkında kısa bir özet (2-3 cümle) yazın.

### Adım 14: Becerilerinizi Ekleyin

1. **"Beceriler"** bölümüne gidin
2. Bir beceri yazın ve **Enter**'a basın veya **"Ekle"**'ye tıklayın
3. Tüm ilgili teknik ve soft becerilerinizi ekleyin
4. Beceriler kaldırılabilir etiketler olarak görünür

**Örnekler:**
- Teknik: JavaScript, Python, React, SQL, Docker
- Soft: Liderlik, İletişim, Problem Çözme

### Adım 15: İş Deneyimi Ekleyin

Her pozisyon için:

1. **"Deneyim Ekle"**'ye tıklayın
2. Doldurun:
   - **İş Unvanı**: Rolünüz (örn. "Kıdemli Yazılım Mühendisi")
   - **Şirket Adı**: İşveren adı
   - **İstihdam Türü**: Tam zamanlı, Yarı zamanlı, Sözleşmeli, vb.
   - **Konum**: Şehir ve Ülke
   - **Konum Türü**: Yerinde, Uzaktan, Hibrit
   - **Başlangıç Tarihi**: AA/YYYY
   - **Bitiş Tarihi**: AA/YYYY (veya "Halen Çalışıyorum" işaretleyin)
   - **Açıklama**: Ne yaptınız ve başardınız
   - **Kullanılan Beceriler**: İlgili becerileri ekleyin

3. **"Kaydet"**'e tıklayın
4. Tüm pozisyonlar için tekrarlayın

### Adım 16: Eğitim Ekleyin

Her derece için:

1. **"Eğitim Ekle"**'ye tıklayın
2. Doldurun:
   - **Okul Adı**: Üniversite veya kurum
   - **Derece**: Lisans, Yüksek Lisans, Doktora, vb.
   - **Çalışma Alanı**: Bölümünüz
   - **Konum**: Şehir ve Ülke
   - **Başlangıç Tarihi**: AA/YYYY
   - **Bitiş Tarihi**: AA/YYYY (veya "Halen Okuyorum" işaretleyin)
   - **Not Ortalaması**: Opsiyonel
   - **Faaliyetler**: Kulüpler, topluluklar, vb.
   - **Açıklama**: İlgili dersler veya başarılar

3. **"Kaydet"**'e tıklayın
4. Tüm dereceler için tekrarlayın

### Adım 17: Sertifikalar Ekleyin (Opsiyonel)

1. **"Sertifika Ekle"**'ye tıklayın
2. Doldurun:
   - **Sertifika Adı**
   - **Veren Kuruluş**
   - **Veriliş Tarihi**
   - **Son Kullanma Tarihi** (veya "Süresi Dolmaz" işaretleyin)
   - **Kimlik Numarası** (opsiyonel)
   - **Kimlik URL'si** (opsiyonel)

3. Tüm sertifikalar için tekrarlayın

### Adım 18: Projeler Ekleyin (Opsiyonel)

1. **"Proje Ekle"**'ye tıklayın
2. Doldurun:
   - **Proje Adı**
   - **Açıklama**: Projenin ne yaptığı
   - **Kullanılan Beceriler**
   - **Başlangıç Tarihi**
   - **Bitiş Tarihi** (veya "Halen Üzerinde Çalışıyorum" işaretleyin)
   - **İlişkili**: Şirket veya organizasyon

3. Tüm projeler için tekrarlayın

---

## 🎯 Bölüm 5: Eklentiyi Kullanma (15 dakika)

### Adım 19: İş İlanı Ekleyin

1. Başvurmak istediğiniz bir iş ilanını açın
2. Tüm iş açıklamasını kopyalayın
3. **"CV Bilgileri"** sekmesine gidin
4. **"İş Açıklaması"** metin alanını bulun
5. İş açıklamasını yapıştırın
6. Kaydetmek için metin alanının dışına tıklayın

### Adım 20: CV'nizi Optimize Edin

1. Alttaki **"CV'yi YZ ile Optimize Et"** düğmesine tıklayın
2. YZ analizi için 30-60 saniye bekleyin
3. **ATS Puanını** inceleyin (üstte görünür)

### Adım 21: Optimizasyon Önerilerini İnceleyin

**"Optimize Et & Önizleme"** sekmesinde:

1. Tüm önerilen optimizasyonları **hap** olarak görün
2. Her hap şunları gösterir:
   - Kategori (Anahtar Kelimeler, Eylem Fiilleri, Nicelleştirme, vb.)
   - Özel değişiklik
3. Hap üzerine **geldiğinizde** X ile kırmızıya döndüğünü görün
4. Değişikliği açıp kapatmak için **hapı tıklayın**
5. Bir öneriyi kalıcı olarak kaldırmak için **X'e tıklayın**

### Adım 22: CV'nizi Önizleyin

1. **CV Önizleme** bölümüne inin
2. Optimize edilmiş CV'nizi gerçek zamanlı olarak görün
3. Açılır menüden bir **Şablon** seçin:
   - Klasik
   - Modern
   - Yönetici
   - Yaratıcı
   - Kompakt
   - Akademik
   - Teknoloji
   - Girişim

### Adım 23: CV'nizi İndirin

1. Formatınızı seçin:
   - **PDF**: Başvurular için en iyi
   - **DOCX**: Düzenlenebilir format
   - **Google Docs**: Google Drive'a doğrudan dışa aktarım
2. İndirme düğmesine tıklayın
3. CV'niz otomatik olarak adınız ve tarihle adlandırılır

### Adım 24: Niyet Mektubu Oluşturun

1. **"Niyet Mektubu"** sekmesine gidin
2. (Opsiyonel) İstem alanına ekstra talimatlar ekleyin
   - Örnek: "Coşkulu yapın ve liderlik becerilerimi vurgulayın"
3. **"Niyet Mektubu Oluştur"**'a tıklayın
4. 30-60 saniye bekleyin
5. Oluşturulan mektubu inceleyin

### Adım 25: Niyet Mektubunu Özelleştirin ve İndirin

1. Niyet mektubunu okuyun
2. Önizlemede manuel düzenlemeler yapın
3. Şu şekilde indirin:
   - **PDF**
   - **DOCX**
   - **Google Docs**
4. Veya başka bir yere yapıştırmak için **"Panoya Kopyala"**'ya tıklayın

---

## 💾 Bölüm 6: Profilleri Kaydetme ve Yönetme (5 dakika)

### Adım 26: Profilinizi Kaydedin

1. **"Profiller"** sekmesine gidin
2. Bir **profil adı** girin (örn. "Yazılım Mühendisi Profili")
3. **"Profil Kaydet"**'e tıklayın
4. Başarılı! Profiliniz kaydedildi

### Adım 27: Kaydedilmiş Profil Yükleyin

1. **"Profiller"** sekmesine gidin
2. Kayıtlı profilinizi bulun
3. **"Yükle"** düğmesine tıklayın
4. Tüm CV bilgileriniz anında yüklenecektir

### Adım 28: Birden Fazla Profili Yönetin

**Neden birden fazla profil kullanmalısınız?**
- Farklı iş türleri (örn. Frontend vs Backend)
- Farklı sektörler
- Farklı deneyim seviyeleri

**Yeni bir profil oluşturmak için:**
1. CV bilgilerinizi değiştirin
2. Farklı bir ad verin
3. Yeni profil olarak kaydedin

---

## 🔍 Bölüm 7: Analitik ve Hata İzleme (5 dakika)

### Adım 29: Optimizasyon Analitiğini Görüntüleyin

1. **"Analitik"** sekmesine gidin
2. İstatistikleri görün:
   - Uygulanan toplam optimizasyonlar
   - Oturum başına ortalama
   - En çok optimize edilen bölümler
   - YZ sağlayıcı kullanımı
3. Kategori dağılımlarını görüntüleyin
4. Son aktiviteyi görün

### Adım 30: Hata Analitiğini İzleyin

1. **"Analitik"** sekmesinde aşağı kaydırın
2. **Hata Analitiği** bölümünü görüntüleyin:
   - Toplam hatalar
   - Kritik hatalar
   - Hata türleri dağılımı
   - Hata önem derecesi grafiği
3. Hataları filtreleyin:
   - Önem derecesi (Kritik, Yüksek, Orta, Düşük)
   - Tür (Çalışma Zamanı, Ağ, API, vb.)
4. Detayları görmek için herhangi bir hataya tıklayın:
   - Yığın izleme
   - Metadata
   - Zaman damgası
5. Düzeltmeden sonra hataları **çözüldü** olarak işaretleyin

### Adım 31: Analitik Verilerini Temizleyin

**Optimizasyon analitiğini temizlemek için:**
1. Analitik bölümünde, **"Analitik Verisini Temizle"**'ye tıklayın
2. İşlemi onaylayın

**Hata günlüklerini temizlemek için:**
1. Hata Analitiği bölümünde, **"Hata Günlüklerini Temizle"**'ye tıklayın
2. İşlemi onaylayın

---

## 🎨 Bölüm 8: Gelişmiş Özellikler (5 dakika)

### Adım 32: Niyet Mektupları için İstemleri Kaydedin

1. **"Niyet Mektubu"** sekmesine gidin
2. Özel bir istem girin
3. **"İstemi Kaydet"**'e tıklayın
4. Bir ad verin
5. Klasörlerde düzenleyin (opsiyonel)

### Adım 33: İş Açıklaması Kütüphanesi

1. Bir iş açıklaması yapıştırdıktan sonra
2. **"Kütüphaneye Kaydet"**'e tıklayın
3. Bir ad ve kategori verin
4. Kolay arama için etiketler ekleyin
5. Kaydedilen iş açıklamalarını daha sonra yeniden kullanın

### Adım 34: Google Drive Entegrasyonu

1. **"Ayarlar"** sekmesine gidin
2. **"Google Drive Entegrasyonu"**'nu bulun
3. **"Google ile Giriş Yap"**'a tıklayın
4. İzinlere izin verin
5. Artık doğrudan şunlara aktarabilirsiniz:
   - Google Docs
   - Google Sheets
   - Google Slides

### Adım 35: Tema Ayarları

1. **"Ayarlar"** sekmesine gidin
2. **"Tema"** seçeneğini bulun
3. Seçin:
   - **Açık**: Parlak tema
   - **Koyu**: Karanlık mod
   - **Sistem**: İşletim sistemi temanızı takip eder

---

## 🆘 Bölüm 9: Sorun Giderme (5 dakika)

### Yaygın Sorunlar ve Çözümleri

#### Sorun 1: Eklenti Yüklenmiyor
**Çözüm:**
1. `dist` klasörünü seçtiğinizden emin olun, kök klasörü değil
2. Geliştirici Modunun etkin olduğunu kontrol edin
3. Yeniden yüklemeyi deneyin: Eklentinin yanındaki yeniden yükleme simgesine (🔄) tıklayın
4. Uzantılar sayfasında hataları kontrol edin

#### Sorun 2: API Anahtarı Çalışmıyor
**Çözüm:**
1. API anahtarının doğru olduğunu doğrulayın (ekstra boşluk yok)
2. YZ sağlayıcınızla krediniz/kotanız olduğunu kontrol edin
3. API anahtarını yeniden oluşturmayı deneyin
4. Doğru sağlayıcıyı seçtiğinizden emin olun

#### Sorun 3: CV Yüklemesi Ayrıştırmıyor
**Çözüm:**
1. Dosya formatını kontrol edin (yalnızca PDF ve DOCX desteklenir)
2. Farklı bir dosya deneyin
3. Bunun yerine bilgileri manuel olarak girin
4. Detaylar için Hata Analitiği'ni kontrol edin

#### Sorun 4: Optimizasyonlar Uygulanmıyor
**Çözüm:**
1. İş açıklamasının sağlandığından emin olun
2. İnternet bağlantısını kontrol edin
3. API anahtarının yapılandırıldığını doğrulayın
4. Farklı bir YZ sağlayıcı ile deneyin
5. Hata Analitiği sekmesini kontrol edin

#### Sorun 5: İndirme Çalışmıyor
**Çözüm:**
1. Chrome ayarlarında indirmelere izin verin
2. Açılır pencere engelleyici ayarlarını kontrol edin
3. Farklı bir format deneyin (PDF vs DOCX)
4. Tarayıcı konsolunda hataları kontrol edin

### Yardım Alma

Sorunlarla karşılaşırsanız:
1. Detaylar için **Hata Analitiği** sekmesini kontrol edin
2. Tarayıcı konsolunu kontrol edin (F12 → Konsol)
3. Hata günlüklerini inceleyin
4. Şunlarla birlikte GitHub sorunu açın:
   - Yeniden üretme adımları
   - Hata mesajları
   - Ekran görüntüleri
   - Tarayıcı sürümü

---

## ✅ Bölüm 10: Doğrulama Kontrol Listesi

Kurulumdan sonra, her şeyin çalıştığını doğrulayın:

- [ ] Eklenti Chrome araç çubuğunda görünüyor
- [ ] İngilizce ve Türkçe arasında geçiş yapabilirim
- [ ] YZ sağlayıcı ayarlarını seçip kaydedebilirim
- [ ] CV yükleyip ayrıştırabilirim
- [ ] Tüm form bölümlerini doldurabilirim
- [ ] Deneyimleri, eğitimleri vb. ekleyebilir/düzenleyebilir/kaldırabilirim
- [ ] İş açıklamalarını yapıştırabilirim
- [ ] CV'yi YZ ile optimize edebilirim
- [ ] Optimizasyonları hap olarak görebilirim
- [ ] Optimizasyonları açıp kapatabilir im
- [ ] Farklı şablonlarla CV'yi önizleyebilirim
- [ ] CV'yi PDF/DOCX olarak indirebilirim
- [ ] Niyet mektubu oluşturabilirim
- [ ] Profilleri kaydedip yükleyebilirim
- [ ] Analitikleri görüntüleyebilirim
- [ ] Hata izlemeyi görüntüleyebilirim
- [ ] Google Drive'a aktarabilir im (yapılandırıldıysa)

---

## 🎉 Tebrikler!

YZ CV ve Niyet Mektubu Optimizasyon Eklentisini başarıyla kurdunuz ve yapılandırdınız!

### Sonraki Adımlar:

1. **Profilinizi özelleştirin** farklı iş türleri için
2. **Farklı YZ sağlayıcıları deneyin** sonuçları karşılaştırmak için
3. **Şablonlarla denemeler yapın** favori bulun
4. **İş açıklamaları kütüphanesi oluşturun**
5. **Analitikleri izleyin** zamanla iyileştirmek için

### En İyi Sonuçlar için İpuçları:

- ✨ CV bilgilerinizi güncel tutun
- 📝 Belirli, ölçülebilir başarılar kullanın
- 🎯 Her başvuruyu iş açıklamasına uyarlayın
- 🔄 YZ önerilerini gözden geçirin ve düzeltin
- 💾 Birden fazla profil sürümü kaydedin
- 📊 Analitikleri düzenli olarak kontrol edin
- 🐛 Hata Analitiği'nde hataları bildirin

---

## 📚 Ek Kaynaklar

- **README.md**: Özellik belgeleri
- **TROUBLESHOOTING.md**: Ayrıntılı sorun giderme kılavuzu
- **DEVELOPER_GUIDE.md**: Geliştiriciler ve katkıda bulunanlar için
- **GitHub Sorunları**: Hataları bildirin ve özellik isteyin

---

**Sürüm:** 1.0.0  
**Son Güncelleme:** 2025-10-04  
**Dil:** Türkçe

---

*Dünya çapındaki iş arayanlar için ❤️ ile yapıldı*
