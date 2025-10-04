# 🚀 Google Drive Entegrasyonu - Hızlı Başlangıç

## 📋 Hızlı Kurulum (5 Dakika)

### 1️⃣ Google Cloud Console'da Proje Oluştur
```
1. https://console.cloud.google.com/ 'u aç
2. "Yeni Proje" → İsim ver → "Oluştur"
3. Proje seçiliyken devam et
```

### 2️⃣ API'leri Etkinleştir
```
1. Sol menü → "API'ler ve Hizmetler" → "Kitaplık"
2. Ara ve etkinleştir:
   ✅ Google Drive API
   ✅ Google Docs API
   ✅ Google Sheets API
   ✅ Google Slides API
```

### 3️⃣ OAuth Client ID Oluştur
```
1. "API'ler ve Hizmetler" → "Kimlik Bilgileri"
2. "Kimlik Bilgileri Oluştur" → "OAuth istemci kimliği"
3. OAuth izin ekranını yapılandır (ilk sefer)
   - Kullanıcı türü: Harici
   - Uygulama adı: CV Optimizer
   - E-postalar: Kendi e-postan
4. Uygulama türü: Chrome Uzantısı
5. İsim: CV Optimizer Extension
6. "Oluştur" → Client ID'yi kopyala
```

### 4️⃣ manifest.json'u Güncelle
```json
// manifest.json dosyasını aç
// Şu satırı bul:
"client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",

// Kendi Client ID'ni yapıştır:
"client_id": "123456789-abc...xyz.apps.googleusercontent.com",
```

### 5️⃣ Uzantıyı Yeniden Yükle
```
1. chrome://extensions/ aç
2. Uzantıyı yenile (🔄 butonu)
```

### 6️⃣ Giriş Yap
```
1. Uzantıyı aç
2. Ayarlar sekmesi
3. "Google ile Giriş Yap" → İzinleri ver
```

## ✅ Artık Hazırsınız!

### CV'yi Google Docs'a Aktar
```
1. CV'ni doldur
2. "Optimize Et & Önizleme" sekmesi
3. ☁️ "Google'a Aktar" → 📄 "Google Docs"
4. Dosya otomatik açılır!
```

### CV'yi Google Sheets'e Aktar
```
1. CV'ni doldur
2. "Optimize Et & Önizleme" sekmesi
3. ☁️ "Google'a Aktar" → 📊 "Google Sheets"
4. Verilerini analiz et!
```

### CV'yi Google Slides'a Aktar
```
1. CV'ni doldur
2. "Optimize Et & Önizleme" sekmesi
3. ☁️ "Google'a Aktar" → 📽️ "Google Slides"
4. Sunum hazır!
```

## 🐛 Sorun Giderme

### "Authentication Required" Hatası
**Çözüm:**
```
1. Ayarlar → "Çıkış Yap"
2. Tekrar "Giriş Yap"
3. İzinleri ver
```

### "Failed to Export" Hatası
**Kontrol Et:**
- ✅ Tüm 4 API etkinleştirildi mi?
- ✅ Client ID doğru mu?
- ✅ İnternet bağlantısı var mı?

### Client ID Nerede?
```
1. Google Cloud Console → Projen
2. "API'ler ve Hizmetler" → "Kimlik Bilgileri"
3. OAuth 2.0 İstemci Kimlikleri listesinde
4. Kopyala ve manifest.json'a yapıştır
```

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için:
- 📘 `GOOGLE_DRIVE_INTEGRATION.md` (İngilizce)
- 📘 `GOOGLE_DRIVE_GELISTIRMELERI.md` (Türkçe)
- 📘 `TAMAMLANAN_GELISTIRMELER_OZET.md` (Tam özet)

## 🎯 İpuçları

### Dosya Yönetimi
```
Ayarlar → "Dosyalarımı Görüntüle"
- Tüm dışa aktarılan dosyaları gör
- Eski versiyonları sil
- Dosyaları doğrudan aç
```

### Toplu Dışa Aktarma
```
Aynı CV'yi birden fazla formatta:
1. Google Docs'a aktar (düzenleme için)
2. Google Sheets'e aktar (analiz için)
3. Google Slides'a aktar (sunum için)
```

### Paylaşım
```
1. Dosyayı Google'da aç
2. "Paylaş" butonuna tıkla
3. E-posta ekle veya link al
```

## ⚡ Hızlı Referans

| Özellik | Buton | Sonuç |
|---------|-------|-------|
| Google Docs | ☁️ → 📄 | Düzenlenebilir belge |
| Google Sheets | ☁️ → 📊 | Veri tablosu |
| Google Slides | ☁️ → 📽️ | Sunum |
| Dosyalar | Ayarlar → 📁 | Dosya listesi |
| Giriş | Ayarlar → 🔑 | OAuth girişi |

## 🎉 Başarı!

Artık CV'nizi Google'da saklayabilir, düzenleyebilir ve paylaşabilirsiniz!

---

**İyi şanslar! 🚀**
