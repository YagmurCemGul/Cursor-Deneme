# Görev Listesi - Kontrol Çizelgesi

## ✅ KRİTİK (1 Hafta)

- [ ] **GÖREV 1: Build Sistemini Düzelt**
  - [ ] Webpack dependency'leri ekle VEYA
  - [ ] Sadece Vite kullanmaya geç
  - [ ] `npm run build` komutunu test et
  - [ ] Build artifacts'i kontrol et
  - [ ] README'deki build talimatlarını güncelle

- [ ] **GÖREV 2: Proje Yapısını Birleştir**
  - [ ] `/src` ve `/extension` dizinlerini analiz et
  - [ ] Hangi versiyonun aktif olduğuna karar ver
  - [ ] Kullanılmayan kodu sil
  - [ ] Tek bir dizin yapısına geç
  - [ ] Import path'lerini güncelle

- [ ] **GÖREV 3: AI Servisi Entegrasyonu**
  - [ ] OpenAI API key yönetimini düzenle
  - [ ] `aiService.ts` içindeki mock kodu kaldır
  - [ ] Gerçek OpenAI API çağrıları yap
  - [ ] Rate limiting ekle
  - [ ] Error handling ekle
  - [ ] API response parsing'i test et

- [ ] **GÖREV 4: Error Handling Sistemi**
  - [ ] `src/utils/errorHandler.ts` oluştur
  - [ ] Custom error types tanımla
  - [ ] User-friendly error messages
  - [ ] Error logging servisi
  - [ ] Tüm catch bloklarını güncelle
  - [ ] Toast/notification sistemi ekle

- [ ] **GÖREV 5: Dependency Senkronizasyonu**
  - [ ] React versiyonunu birleştir (18 veya 19?)
  - [ ] pdfjs-dist versiyonunu birleştir
  - [ ] docx versiyonunu birleştir
  - [ ] Diğer çakışan package'ları düzelt
  - [ ] `npm install` test et
  - [ ] Lock file'ı güncelle

---

## 🔥 YÜKSEK ÖNCELİK (2-4 Hafta)

- [ ] **GÖREV 6: Test Framework Setup**
  - [ ] Jest veya Vitest kur
  - [ ] React Testing Library ekle
  - [ ] Test konfigürasyonu yap
  - [ ] İlk unit test yaz (fileParser için)
  - [ ] Coverage threshold belirle (%50)
  - [ ] CI'da testleri çalıştır

- [ ] **GÖREV 7: Linter & Formatter**
  - [ ] ESLint kur ve konfigüre et
  - [ ] Prettier kur ve konfigüre et
  - [ ] VSCode settings.json ekle
  - [ ] Pre-commit hook (husky) ekle
  - [ ] Mevcut kodu lint'le
  - [ ] Tüm lint errors'ları düzelt

- [ ] **GÖREV 8: API Key Güvenliği**
  - [ ] Chrome storage encryption araştır
  - [ ] Encryption utility fonksiyonları yaz
  - [ ] API key save/load'u güvenli hale getir
  - [ ] Migration script (mevcut key'ler için)
  - [ ] Dokümantasyon ekle

- [ ] **GÖREV 9: TypeScript Strict Mode**
  - [ ] Tüm `any` kullanımlarını bul
  - [ ] Proper type definitions ekle
  - [ ] `@ts-ignore` yorumlarını temizle
  - [ ] Interface'leri complete et
  - [ ] Strict mode ihlallerini düzelt

- [ ] **GÖREV 10: Input Validation**
  - [ ] Zod schema'ları tanımla (zaten dependency'de!)
  - [ ] Form validation ekle
  - [ ] Email/phone/URL validation
  - [ ] Sanitization fonksiyonları
  - [ ] Real-time validation feedback

---

## ⚡ ORTA ÖNCELİK (1-2 Ay)

- [ ] **GÖREV 11: CV Parsing İyileştirmeleri**
  - [ ] Tarih parsing kütüphanesi ekle (date-fns)
  - [ ] Daha fazla CV formatı desteği
  - [ ] Türkçe karakter desteği iyileştir
  - [ ] NLP kütüphanesi dene (opsiyonel)
  - [ ] Parsing accuracy testleri

- [ ] **GÖREV 12: Template Sistemi**
  - [ ] Template interface'ini complete et
  - [ ] En az 3 CV template tasarla
  - [ ] Template preview komponenti
  - [ ] Template seçim UI'ı
  - [ ] Template kaydetme/yükleme

- [ ] **GÖREV 13: i18n Tamamlama**
  - [ ] Eksik çevirileri bul
  - [ ] Cover letter çevirileri
  - [ ] Profil yönetimi çevirileri
  - [ ] Error messages çevirileri
  - [ ] Dil seçimi persistence

- [ ] **GÖREV 14: Accessibility (a11y)**
  - [ ] ARIA labels ekle
  - [ ] Keyboard navigation
  - [ ] Focus management
  - [ ] Screen reader test
  - [ ] Color contrast kontrol

- [ ] **GÖREV 15: Performance Optimization**
  - [ ] Bundle analyzer çalıştır
  - [ ] Code splitting ekle
  - [ ] Lazy loading implement et
  - [ ] Web Worker (PDF parsing için)
  - [ ] Memory leak kontrolü

---

## 🎯 DÜŞÜK ÖNCELİK (2+ Ay)

- [ ] **GÖREV 16-20: Advanced Features**
  - [ ] Export history
  - [ ] Job application tracking
  - [ ] ATS score calculator
  - [ ] Collaboration features
  - [ ] Version comparison

- [ ] **GÖREV 21-25: Infrastructure**
  - [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Automated tests
  - [ ] Chrome Web Store deployment
  - [ ] Error tracking (Sentry)
  - [ ] Analytics (privacy-friendly)

- [ ] **GÖREV 26-30: Documentation**
  - [ ] API documentation (JSDoc)
  - [ ] Architecture diagrams
  - [ ] CONTRIBUTING.md
  - [ ] CHANGELOG.md
  - [ ] Video tutorials

---

## 📊 İLERLEME TAKIBI

### Sprint 1 Progress (1. Hafta)
```
[====------] 40% Complete
Tamamlanan: 2/5
Devam eden: 1/5
Bekleyen: 2/5
```

### Overall Progress
```
Kritik:      [ ] 0/5   (0%)
Yüksek:      [ ] 0/5   (0%)
Orta:        [ ] 0/5   (0%)
Düşük:       [ ] 0/15  (0%)
───────────────────────────
TOPLAM:      0/30 (0%)
```

---

## 🔄 GÜNLÜK KONTROL

### Her Gün Yapılacaklar
- [ ] Kod yazmadan önce `git pull`
- [ ] Değişikliklerden önce test yaz
- [ ] Lint errors kontrol et
- [ ] Type errors kontrol et
- [ ] Commit message standartlarına uy

### Her Commit'te
```bash
# 1. Tests pass mı?
npm test

# 2. Lint pass mı?
npm run lint

# 3. Type check pass mı?
npm run type-check

# 4. Build başarılı mı?
npm run build
```

---

## 📝 NOTLAR

### Tamamlanan Görevler
<!-- Tamamladığında buraya yaz -->
- ✅ [2025-XX-XX] GÖREV X: Açıklama

### Engeller ve Sorunlar
<!-- Takıldığın yerler -->
- ⚠️ [2025-XX-XX] Sorun: Açıklama, Çözüm: ?

### Öğrenilen Dersler
<!-- İleride faydalı olacak notlar -->
- 💡 [2025-XX-XX] Not: Açıklama

---

## 🎯 HEDEFLER

### Bu Hafta
1. Build sistemini çalışır hale getir
2. Proje yapısını temizle
3. AI entegrasyonuna başla

### Bu Ay
1. Tüm kritik görevleri tamamla
2. Test coverage %50'ye çıkar
3. Security basics'i tamamla

### 3 Ay İçinde
1. Production-ready MVP
2. Test coverage %80+
3. Chrome Web Store'da yayında

---

## 🚀 HIZLI KOMUTLAR

```bash
# Proje setup
npm install

# Development
npm run dev

# Build
npm run build

# Tests (henüz yok)
npm test

# Lint (henüz yok)
npm run lint

# Type check
npm run type-check
```

---

**Son Güncelleme**: 2025-10-03
**Sorumlu**: Developer
**Review**: Pending
