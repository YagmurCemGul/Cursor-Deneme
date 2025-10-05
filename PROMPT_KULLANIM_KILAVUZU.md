# 📖 Prompt Kullanım Kılavuzu

Bu doküman, PRODUCTION_READY_PROMPTS.md dosyasındaki promptları nasıl kullanacağınızı adım adım açıklar.

## 🎯 Bir Prompt'u Nasıl Uygularım?

### Adım 1: Prompt'u Kopyala

PRODUCTION_READY_PROMPTS.md dosyasını açın ve uygulamak istediğiniz prompt'un içeriğini kopyalayın.

**Örnek:** Prompt 1.1 - Ayarlar Sayfası

```
extension/src/options/ klasöründeki mevcut options sayfasını geliştir. Şu özellikleri ekle:

1. API Provider seçimi (OpenAI, Claude, Gemini, Azure OpenAI)
2. API Key girişi (masked input, show/hide butonu ile)
3. Dil seçimi (TR/EN)
...
```

### Adım 2: Claude 4.5 Sonnet'e Ver

Claude 4.5 Sonnet ile yeni bir konuşma başlatın ve şöyle deyin:

```
Şu görevi tamamla:

[Burada kopyaladığınız prompt'u yapıştırın]

Tüm değişiklikleri yap ve bana hangi dosyaları oluşturduğunu/güncellediğini bildir.
```

### Adım 3: Claude'un Çıktısını İncele

Claude size şunları verecek:
- ✅ Oluşturduğu/güncellediği dosya listesi
- ✅ Yaptığı değişikliklerin açıklaması
- ✅ Test etmeniz gereken şeyler

### Adım 4: Test Et

```bash
cd extension
npm run dev
```

Chrome'da extension'ı reload edin ve yeni özellikleri test edin.

### Adım 5: Commit Yap

Her prompt tamamlandıktan sonra commit yapın:

```bash
git add .
git commit -m "feat: ayarlar sayfası eklendi (Prompt 1.1)"
git push
```

---

## 💡 Örnek: İlk 3 Prompt'u Uygulama

Hadi birlikte ilk 3 prompt'u uygulayalım!

### Örnek 1: Prompt 1.1 - Ayarlar Sayfası

**Claude'a Ne Söyleyeceğiz:**

```
Şu görevi tamamla:

extension/src/options/ klasöründeki mevcut options sayfasını geliştir. Şu özellikleri ekle:

1. API Provider seçimi (OpenAI, Claude, Gemini, Azure OpenAI)
2. API Key girişi (masked input, show/hide butonu ile)
3. Dil seçimi (TR/EN)
4. AI Model seçimi (provider'a göre dinamik)
5. Temperature slider (0-1 arası, varsayılan 0.3)
6. "Test Connection" butonu (API anahtarını test etmek için)
7. Kaydet butonu ve başarı mesajı
8. Mevcut ayarları yükleme ve görüntüleme

main.tsx ve index.html dosyalarını da güncelleyerek modern bir UI tasarla. 
Tailwind benzeri utility class'lar kullanarak responsive yap. 
Tüm ayarları storage.ts'deki saveOptions ve loadOptions fonksiyonları ile kaydet/yükle.

Tüm değişiklikleri yap ve bana hangi dosyaları oluşturduğunu/güncellediğini bildir.
```

**Claude'un Yapacakları:**
1. `extension/src/options/options.tsx` dosyasını güncelleyecek
2. Form component'leri ekleyecek
3. Storage entegrasyonu yapacak
4. CSS styling'i ekleyecek

**Test:**
```bash
cd extension
npm run dev
# Chrome'da extension'ı yükleyin
# Sağ tık > Options
# Ayarlar sayfasını açın ve test edin
```

---

### Örnek 2: Prompt 1.2 - API Hata Yönetimi

**Claude'a Ne Söyleyeceğiz:**

```
Şu görevi tamamla:

extension/src/lib/ai.ts dosyasındaki callOpenAI fonksiyonunu geliştir:

1. Retry mekanizması ekle (3 deneme, exponential backoff ile)
2. Timeout ekle (30 saniye)
3. Detaylı hata mesajları:
   - Rate limit aşımı (429)
   - Authentication hatası (401)
   - Quota aşımı
   - Network hataları
   - Model bulunamadı hataları
4. Hata mesajlarını Türkçe ve İngilizce olarak destekle
5. Console'a detaylı log yaz (development için)
6. Her hata için kullanıcı dostu mesaj döndür

Ayrıca bir ErrorLogger utility class'ı oluştur ve hatalarını chrome.storage.local'de sakla (son 50 hata).

Tüm değişiklikleri yap ve bana hangi dosyaları oluşturduğunu/güncellediğini bildir.
```

**Claude'un Yapacakları:**
1. `extension/src/lib/ai.ts` dosyasını güncelleyecek
2. Retry logic ekleyecek
3. `extension/src/lib/errorLogger.ts` oluşturacak
4. Error handling iyileştirecek

**Test:**
```bash
# API key'i yanlış girin ve test edin
# Network'u kapatıp test edin
# Rate limit'e ulaşmayı simüle edin
```

---

### Örnek 3: Prompt 2.3 - Loading States

**Claude'a Ne Söyleyeceğiz:**

```
Şu görevi tamamla:

extension/src/components/ klasöründe LoadingSpinner.tsx ve ProgressBar.tsx komponentleri oluştur:

1. LoadingSpinner:
   - 3 varyasyon: small, medium, large
   - 2 stil: spinner (circle), dots
   - Custom mesaj gösterme
   - Backdrop ile veya inline
2. ProgressBar:
   - Percentage gösterme
   - Animated
   - Color variants (primary, success, warning, error)
   - Label gösterme opsiyonu

Tüm async işlemlerde loading state göster:
- popup.tsx'teki generateAtsResume ve generateCoverLetter fonksiyonlarında
- AI çağrıları yapılırken
- Profil kaydedilirken
- Export işlemlerinde

ai.ts'de streaming destekli bir wrapper fonksiyon oluştur (eğer API destekliyorsa).

Tüm değişiklikleri yap ve bana hangi dosyaları oluşturduğunu/güncellediğini bildir.
```

**Claude'un Yapacakları:**
1. `extension/src/components/LoadingSpinner.tsx` oluşturacak
2. `extension/src/components/ProgressBar.tsx` oluşturacak
3. `extension/src/popup/popup.tsx` güncelleyecek
4. Loading states ekleyecek

**Test:**
```bash
# CV generate edin ve loading spinner'ı görün
# Cover letter generate edin
# Export işlemi yapın
```

---

## 🚨 Sık Karşılaşılan Sorunlar ve Çözümleri

### Sorun 1: "Dosya bulunamadı" Hatası

**Sebep:** Prompt'taki dosya yolu mevcut proje yapınızla uyuşmuyor.

**Çözüm:**
```
Claude'a şunu söyleyin:

"extension/src/components/ klasöründe bu dosya yok. 
Önce klasör yapısını ls komutu ile kontrol et ve 
doğru yola göre dosyaları oluştur."
```

### Sorun 2: Import Hataları

**Sebep:** Claude yanlış import path'leri kullanmış.

**Çözüm:**
```bash
# Build edin ve hataları görün
npm run dev

# Claude'a hataları gösterin:
"Şu import hatalarını düzelt: [hata mesajlarını yapıştır]"
```

### Sorun 3: TypeScript Hataları

**Sebep:** Type tanımları eksik veya yanlış.

**Çözüm:**
```
Claude'a şunu söyleyin:

"TypeScript hatalarını düzelt. extension/src/lib/types.ts 
dosyasını kontrol et ve eksik type'ları ekle."
```

### Sorun 4: Styling Çalışmıyor

**Sebep:** CSS class'ları uygulanmamış veya global.css import edilmemiş.

**Çözüm:**
```
Claude'a şunu söyleyin:

"Styling'ler çalışmıyor. extension/src/styles/global.css dosyasına 
gerekli class'ları ekle ve component'te import etmeyi unutma."
```

---

## 🎨 Prompt'ları Özelleştirme

Promptları kendi ihtiyaçlarınıza göre özelleştirebilirsiniz:

### Örnek: Farklı UI Framework Kullanmak

**Orijinal Prompt:**
```
Tailwind benzeri utility class'lar kullanarak responsive yap.
```

**Özelleştirilmiş:**
```
Material-UI kullanarak responsive yap. @mui/material component'lerini kullan.
```

### Örnek: Dil Değiştirme

**Orijinal Prompt:**
```
Hata mesajlarını Türkçe ve İngilizce olarak destekle
```

**Özelleştirilmiş:**
```
Hata mesajlarını Türkçe, İngilizce ve Almanca olarak destekle
```

---

## 📝 Prompt Yazarken İpuçları

Eğer kendi promptlarınızı yazmak isterseniz:

### ✅ İyi Prompt Örneği

```
extension/src/components/ klasöründe UserProfile.tsx komponenti oluştur.

Özellikler:
1. Avatar (150x150, circular)
2. İsim ve email göster
3. Edit butonu (modal açsın)
4. Save butonu
5. Cancel butonu

Styling:
- Modern, clean design
- Responsive (mobile ve desktop)
- Hover effects

Storage:
- Profile'ı chrome.storage.local'e kaydet
- Component mount'ta otomatik yükle

Test:
- Edit butonuna tıklayınca modal açılmalı
- Save'e tıklayınca data kaydedilmeli
```

**Neden iyi?**
- ✅ Spesifik (hangi klasör, hangi dosya)
- ✅ Detaylı (tüm özellikler listelenmiş)
- ✅ Açık gereksinimler (styling, storage, test)
- ✅ Tek bir task (component oluştur)

### ❌ Kötü Prompt Örneği

```
Profil sayfası yap. Güzel olsun.
```

**Neden kötü?**
- ❌ Belirsiz (hangi dosya?)
- ❌ Eksik (hangi özellikler?)
- ❌ Subjektif ("güzel" ne demek?)
- ❌ Test edilemez

---

## 🔄 Prompt'ları Tekrar Uygulamak

Bir prompt'u tekrar uygulamak isterseniz:

```
Claude'a şunu söyleyin:

"Prompt 1.1'i tekrar uygula ama bu sefer şu değişiklikleri de ekle:
- Dark mode desteği
- Keyboard shortcuts
- Daha büyük font'lar"
```

---

## 📊 İlerleme Takibi

Her prompt'tan sonra bir checklist güncelleyin:

```markdown
## Tamamlanan Promptlar

### Faz 1: Temel Altyapı
- [x] Prompt 1.1 - Ayarlar Sayfası ✅ (05/10/2025)
- [x] Prompt 1.2 - Hata Yönetimi ✅ (05/10/2025)
- [ ] Prompt 2.1 - Kurulum Sihirbazı
- [ ] Prompt 2.3 - Loading States
- [ ] Prompt 2.4 - Toast Sistemi

### Notlar
- Prompt 1.1: Test başarılı, API key'leri kaydediyor ✅
- Prompt 1.2: Retry mekanizması çalışıyor, 3 deneme yapıyor ✅
```

---

## 🎯 Sonraki Adımlar

1. **PRODUCTION_READY_PROMPTS.md** dosyasını açın
2. **Faz 1**'den başlayın
3. **Her prompt**'u sırayla uygulayın
4. **Test** edin
5. **Commit** yapın
6. **Sonraki prompt**'a geçin

---

## 🆘 Yardım Gerekirse

- GitHub Issues açın
- Claude ile troubleshooting yapın
- Community'den yardım isteyin

**Başarılar! 🚀**
