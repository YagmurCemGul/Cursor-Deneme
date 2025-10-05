# 🚀 AI CV & Cover Letter Optimizer - Kurulum Rehberi

## ✨ Özellikler

### 📝 Yeni Sekme (New Tab) Sayfası - TAM İŞLEVSEL

Artık yeni sekme sayfası **tamamen işlevsel** ve aşağıdaki özelliklere sahip:

#### 1. 👤 **Kişisel Bilgiler**
- Ad, soyad, email, telefon
- LinkedIn, GitHub, Portfolio bağlantıları
- Lokasyon bilgisi
- Profesyonel özet

#### 2. 💡 **Yetenekler (Skills)**
- Sınırsız yetenek ekleme
- Kolay ekleme/çıkarma
- Dinamik yönetim

#### 3. 💼 **İş Deneyimi (Experience)**
- Detaylı iş geçmişi ekleme
- İş türü (Full-time, Part-time, Contract, vb.)
- Lokasyon türü (Remote, Hybrid, On-site)
- Başlangıç/bitiş tarihleri
- Hala çalışıyor mu? checkbox
- Detaylı açıklama alanı

#### 4. 🎓 **Eğitim (Education)**
- Okul/üniversite bilgileri
- Derece ve alan bilgisi
- Not ortalaması
- Tarihler

#### 5. 🔨 **Projeler (Projects)**
- Proje adı ve açıklaması
- Kişisel ve profesyonel projeler
- Detaylı açıklama

#### 6. 📜 **Sertifikalar (Licenses & Certifications)**
- Sertifika adı ve veren kurum
- Credential ID ve URL
- Tarih bilgileri

#### 7. 💼 **İş İlanı Analizi**
- İş ilanını yapıştırma
- AI tabanlı analiz
- ATS optimizasyonu
- Cover letter için özel talimatlar

#### 8. 👁️ **Önizleme**
- Canlı resume önizleme
- Markdown formatında
- Panoya kopyalama

#### 9. ✉️ **Cover Letter**
- AI destekli cover letter oluşturma
- Özelleştirilebilir talimatlar
- Önizleme ve düzenleme

#### 10. ⬇️ **İndirme**
- Markdown (.md) formatında indirme
- Düz metin (.txt) formatında indirme
- Panoya kopyalama
- PDF için print özelliği

#### 11. ⚙️ **Ayarlar**
- API provider seçimi (OpenAI, Gemini, Claude, Azure)
- API key yönetimi
- Dil seçimi (Türkçe/English)
- Güvenli local storage

## 🛠️ Kurulum Adımları

### 1. Projeyi Build Edin

```bash
npm install
npm run build
```

### 2. Chrome'a Yükleyin

1. Chrome'u açın
2. Adres çubuğuna `chrome://extensions/` yazın
3. Sağ üst köşeden **"Geliştirici modu"** (Developer mode) açın
4. **"Paketlenmemiş yükle"** (Load unpacked) butonuna tıklayın
5. `/workspace/dist` klasörünü seçin

### 3. İlk Kurulum

1. **Yeni sekme** açın - AI CV Optimizer otomatik olarak açılacak
2. **Ayarlar** sekmesine gidin
3. API provider'ınızı seçin
4. API key'inizi girin
5. **Kaydet** butonuna tıklayın

## 🔑 API Key Alma

### OpenAI
1. [platform.openai.com/api-keys](https://platform.openai.com/api-keys) adresine gidin
2. "Create new secret key" butonuna tıklayın
3. Key'i kopyalayıp uzantıya yapıştırın

### Google Gemini
1. [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) adresine gidin
2. "Create API Key" butonuna tıklayın
3. Key'i kopyalayıp uzantıya yapıştırın

### Anthropic Claude
1. [console.anthropic.com](https://console.anthropic.com/) adresine gidin
2. API Keys bölümünden yeni key oluşturun
3. Key'i kopyalayıp uzantıya yapıştırın

## 📖 Kullanım Kılavuzu

### Adım 1: Profilinizi Oluşturun
1. **CV Profile** sekmesinde kişisel bilgilerinizi girin
2. Yeteneklerinizi ekleyin
3. İş deneyimlerinizi ekleyin
4. Eğitim bilgilerinizi girin
5. Projelerinizi ve sertifikalarınızı ekleyin

### Adım 2: İş İlanını Ekleyin
1. **Job Description** sekmesine gidin
2. İş ilanının tamamını yapıştırın
3. İsteğe bağlı: Cover letter için özel notlar ekleyin

### Adım 3: CV Oluşturun
1. **"Generate ATS Resume"** butonuna tıklayın
2. AI otomatik olarak:
   - İş ilanını analiz eder
   - Anahtar kelimeleri belirler
   - CV'nizi optimize eder
   - ATS uyumlu formatta sunar

### Adım 4: Cover Letter Oluşturun
1. **"Generate Cover Letter"** butonuna tıklayın
2. AI özelleştirilmiş bir cover letter oluşturur

### Adım 5: İndirin ve Kullanın
1. **Downloads** sekmesine gidin
2. Markdown veya Text formatında indirin
3. Google Docs veya Word'de açıp biçimlendirin
4. Veya Ctrl+P (Cmd+P) ile PDF olarak kaydedin

## 💡 İpuçları

### CV Yazımı
- ✅ **Kullanın:** Eylem fiilleri (Developed, Managed, Led)
- ✅ **Kullanın:** Sayısal sonuçlar (%30 artış, 50+ proje)
- ✅ **Kullanın:** İş ilanındaki anahtar kelimeler
- ❌ **Kullanmayın:** Kişisel zamirler (Ben, Biz)
- ❌ **Kullanmayın:** Genel ifadeler ("Sorumluydum")

### ATS Optimizasyonu
- İş ilanındaki anahtar kelimeleri kullanın
- Standart başlıklar kullanın (Experience, Education)
- Karmaşık formatlamalardan kaçının
- PDF formatını tercih edin

### Cover Letter
- Şirkete ve pozisyona özel yazın
- Somut örnekler verin
- 1 sayfa ile sınırlı tutun
- Professional ama samimi bir ton kullanın

## 🔒 Güvenlik

- API key'leriniz **sadece tarayıcınızda** saklanır
- Hiçbir bilgi 3. parti sunuculara gönderilmez
- Doğrudan AI provider'a bağlanır
- Tüm veriler local storage'da şifrelenir

## 🐛 Sorun Giderme

### "API key not set" Hatası
- Ayarlar sayfasından API key girdiğinizden emin olun
- Kaydet butonuna bastığınızdan emin olun

### "File not found: newtab.html" Hatası
- ✅ **ÇÖZÜLDÜ!** Bu hata artık oluşmuyor
- Build işlemi başarılı
- Tüm dosyalar doğru yerde

### Resume Oluşturulamıyor
- API key'inizin geçerli olduğunu kontrol edin
- İnternet bağlantınızı kontrol edin
- Ayarlar sekmesinden "Test Connection" ile test edin

### Yavaş Çalışıyor
- Seçtiğiniz AI model hızını etkiler
- GPT-4o-mini veya Gemini Flash daha hızlı
- GPT-4 daha kaliteli ama yavaş

## 📊 Dosya Yapısı

```
dist/
├── background.js        # Background service worker
├── newtab.html          # Ana uygulama sayfası ✅
├── newtab.*.js          # NewTab JavaScript bundle ✅
├── options.html         # Ayarlar sayfası ✅
├── options.*.js         # Options JavaScript bundle ✅
├── popup.html           # Popup sayfası ✅
├── popup.*.js           # Popup JavaScript bundle ✅
├── manifest.json        # Chrome extension manifest ✅
├── icons/               # Uzantı ikonları ✅
└── *.js                 # React ve diğer kütüphaneler ✅
```

## 🎯 Gelecek Geliştirmeler

- [ ] PDF export (built-in)
- [ ] DOCX export
- [ ] Çoklu profil yönetimi
- [ ] Template sistemi
- [ ] Dark mode
- [ ] İstatistikler ve analizler
- [ ] LinkedIn import
- [ ] Google Drive entegrasyonu

## 📝 Notlar

- **Build Durumu:** ✅ Başarılı
- **Newtab:** ✅ Tam İşlevsel
- **API Entegrasyonu:** ✅ Çalışıyor
- **UI/UX:** ✅ Modern ve Kullanışlı
- **Tüm Özellikler:** ✅ Aktif

## 🤝 Destek

Sorularınız için:
- GitHub Issues kullanın
- Dokümantasyonu inceleyin
- Console log'larını kontrol edin

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0.0  
**Son Güncelleme:** 2025-10-05
