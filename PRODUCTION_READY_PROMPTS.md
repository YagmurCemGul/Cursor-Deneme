# Production Ready: Claude 4.5 Sonnet İçin Adım Adım Promptlar

Bu dokümandaki her bir prompt, Claude 4.5 Sonnet tarafından tek seferde tamamlanabilir kapsamda hazırlanmıştır. Promptları sırayla uygulayarak projeyi gerçek hayat senaryolarında çalışacak hale getirebilirsiniz.

---

## 📋 BÖLÜM 1: TEMEL ALTYAPI VE GÜVENLİK

### Prompt 1.1: Ayarlar Sayfası Oluşturma
```
extension/src/options/ klasöründeki mevcut options sayfasını geliştir. Şu özellikleri ekle:

1. API Provider seçimi (OpenAI, Claude, Gemini, Azure OpenAI)
2. API Key girişi (masked input, show/hide butonu ile)
3. Dil seçimi (TR/EN)
4. AI Model seçimi (provider'a göre dinamik)
5. Temperature slider (0-1 arası, varsayılan 0.3)
6. "Test Connection" butonu (API anahtarını test etmek için)
7. Kaydet butonu ve başarı mesajı
8. Mevcut ayarları yükleme ve görüntüleme

main.tsx ve index.html dosyalarını da güncelleyerek modern bir UI tasarla. Tailwind benzeri utility class'lar kullanarak responsive yap. Tüm ayarları storage.ts'deki saveOptions ve loadOptions fonksiyonları ile kaydet/yükle.
```

### Prompt 1.2: API Hata Yönetimi İyileştirme
```
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
```

### Prompt 1.3: Rate Limiting ve Token Takibi
```
extension/src/lib/ klasöründe yeni bir usage.ts dosyası oluştur:

1. Token kullanımını takip eden bir sistem:
   - Her API çağrısında yaklaşık token sayısını hesapla
   - Günlük, haftalık, aylık kullanımı kaydet
   - chrome.storage.local'de sakla
2. Rate limiting:
   - Dakikada maksimum 10 istek
   - Saatte maksimum 50 istek
   - Limit aşımında kullanıcıya bildir
3. UsageStats interface'i:
   - totalTokens, dailyTokens, weeklyTokens, monthlyTokens
   - requestCount, lastReset timestamp
4. getUsageStats() ve resetStats() fonksiyonları
5. Simple bir hook: useUsageStats() (React)

ai.ts dosyasını güncelle ve her API çağrısında kullanımı kaydet.
```

---

## 📋 BÖLÜM 2: KULLANICI DENEYİMİ

### Prompt 2.1: İlk Kurulum Sihirbazı (Setup Wizard)
```
extension/src/components/ klasöründe SetupWizard.tsx komponenti oluştur:

1. 5 adımlı wizard:
   - Adım 1: Hoş geldiniz ve özellikler tanıtımı
   - Adım 2: API Provider seçimi ve key girişi (test connection butonu ile)
   - Adım 3: Dil ve model tercihleri
   - Adım 4: İlk profil oluşturma (ad, soyad, email zorunlu)
   - Adım 5: Tamamlandı, hemen kullanmaya başlayabilirsiniz
2. Her adımda "Next", "Back" ve "Skip" butonları
3. Progress bar (1/5, 2/5 vb.)
4. Her adımı storage'da kaydet (wizard durumunu korumak için)
5. Wizard tamamlandığında "wizardCompleted: true" flag'ini kaydet

newtab.tsx dosyasını güncelle: eğer wizard tamamlanmadıysa SetupWizard'ı göster, tamamlandıysa normal uygulamayı göster.
```

### Prompt 2.2: Örnek Profiller ve Şablonlar
```
extension/src/lib/ klasöründe sampleData.ts dosyası oluştur:

1. 3 farklı örnek profil hazırla:
   - Software Engineer profili (tam dolu, örnek projeler, skills vs.)
   - Marketing Manager profili
   - Fresh Graduate profili
2. Her profil için gerçekçi veriler (Lorem ipsum değil, gerçek görünümlü)
3. Her profilde 3-4 work experience, 2 education, skills, projects
4. "Load Sample Profile" fonksiyonu: örnek profili aktif profile yükle
5. Kullanıcıya seçim sunan modal: hangi örnek profili yüklemek istiyor?

newtab.tsx'e "Load Sample Profile" butonu ekle (profil yoksa veya boşsa göster). Butona tıklayınca modal açılsın ve kullanıcı örnek profillerden birini seçsin.
```

### Prompt 2.3: Progress Indicators ve Loading States
```
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
```

### Prompt 2.4: Kullanıcı Bildirimleri ve Toast Sistemi
```
extension/src/components/ klasöründe Toast.tsx ve ToastProvider.tsx oluştur:

1. Toast tipleri: success, error, warning, info
2. Özellikleri:
   - Auto dismiss (varsayılan 3 saniye)
   - Manual close butonu
   - Position (top-right, top-center, bottom-right vb.)
   - Stack yönetimi (birden fazla toast)
   - Progress bar (dismiss süresini göstermek için)
3. Context API ile global toast yönetimi
4. Custom hook: useToast()

Tüm başarılı işlemlerde success toast, hatalarda error toast göster:
- Profile saved
- Resume generated
- Export completed
- API errors
- Validation errors

main.tsx dosyalarını güncelle ve ToastProvider'ı en üste ekle.
```

---

## 📋 BÖLÜM 3: İLERİ SEVİYE ÖZELLİKLER

### Prompt 3.1: CV ve Cover Letter Önizleme Sistemi
```
extension/src/components/ klasöründe DocumentPreview.tsx komponenti oluştur:

1. Gerçek zamanlı önizleme (PDF çıktısına yakın)
2. Template seçimini önizlemede göster
3. Zoom in/out (50%, 75%, 100%, 125%, 150%)
4. Sayfa sayısını göster
5. Print butonunu ekle
6. Export butonları (PDF, DOCX, Google Docs)
7. Toggle: ATS-optimized view / Original view

newtab.tsx'te ana editör ile yan yana (split view) veya tab olarak önizleme göster. Real-time güncelleme için debounce kullan (500ms).

CSS ile professional document layout oluştur: proper margins, page breaks, typography.
```

### Prompt 3.2: CV Karşılaştırma (Before/After)
```
extension/src/components/ klasöründe ComparisonView.tsx komponenti oluştur:

1. Side-by-side görünüm: Original CV vs Optimized CV
2. Değişiklikleri highlight et:
   - Eklenen kısımlar yeşil background
   - Silinen kısımlar kırmızı background
   - Değiştirilen kısımlar sarı background
3. Diff görselleştirme (diff-match-patch kullan, zaten package.json'da var)
4. Toggle: Show all / Show only changes
5. Export comparison as PDF
6. "Accept All Changes" butonu
7. Her değişiklik için "Accept" veya "Reject" butonu

storage.ts'e originalVersion kaydeden fonksiyon ekle. ATS optimization yapıldığında original versiyonu kaydet.
```

### Prompt 3.3: Keyword Analizi ve ATS Skoru
```
extension/src/lib/ klasöründe atsAnalyzer.ts dosyası oluştur:

1. analyzeAtsScore fonksiyonu:
   - CV'deki keyword'leri çıkar
   - Job description'daki keyword'leri çıkar
   - Match yüzdesini hesapla (0-100)
   - Eksik keyword'leri listele
   - Action verb kullanım oranı
   - Quantifiable achievements sayısı
   - Section completeness (Summary, Skills, Experience vb.)
2. Skor kategorileri:
   - Excellent (90-100)
   - Good (70-89)
   - Fair (50-69)
   - Poor (0-49)
3. Improvement suggestions listesi
4. Visual skor göstergesi: circular progress chart

extension/src/components/AtsScoreCard.tsx komponenti oluştur ve newtab.tsx'te göster. Her profil güncellemesinde skoru yeniden hesapla.
```

### Prompt 3.4: Template Sistemi İyileştirme
```
extension/src/lib/ klasöründe templates.ts dosyası oluştur:

1. 8 profesyonel template tanımla (types.ts'teki TemplateMeta kullanarak):
   - Classic
   - Modern
   - Executive
   - Creative
   - Compact
   - Academic
   - Tech
   - Startup
2. Her template için:
   - Color scheme (primary, secondary, accent)
   - Font family (heading, body)
   - Layout style (spacing, margins)
   - Section order
   - Icon style
3. Template preview renderer
4. Template selection UI (grid view, cards)
5. Custom template oluşturma imkanı (gelecek için placeholder)

extension/src/components/TemplateGallery.tsx komponenti oluştur. Template seçimi yapıldığında storage'a kaydet ve export sırasında kullan.
```

---

## 📋 BÖLÜM 4: ENTEGRASYONLAR

### Prompt 4.1: Google Drive OAuth Kurulumu
```
manifest.json'da oauth2 konfigürasyonu hazır ama Google Client ID eksik. Şu adımları dokümante et ve helper fonksiyonlar yaz:

1. extension/src/lib/googleAuth.ts dosyası oluştur:
   - getAuthToken(): OAuth token al
   - revokeToken(): Token'ı iptal et
   - isAuthenticated(): Kullanıcı giriş yapmış mı kontrol et
2. extension/src/lib/googleDrive.ts dosyası oluştur:
   - uploadToDrive(file, filename): Dosyayı Google Drive'a yükle
   - createGoogleDoc(content, filename): Google Docs oluştur
   - listMyFiles(): Kullanıcının dosyalarını listele
3. GOOGLE_SETUP.md dosyası oluştur:
   - Google Cloud Console'da proje oluşturma adımları
   - OAuth 2.0 credentials oluşturma
   - Drive API ve Docs API'yi aktifleştirme
   - Client ID'yi manifest.json'a ekleme
   - Redirect URI'yi ayarlama

Extension'a "Connect Google Drive" butonu ekle ve authentication flow'u implement et.
```

### Prompt 4.2: LinkedIn Profil İçe Aktarma
```
LinkedIn'in genel profil URL'sinden veri çekmek yasal değil ama kullanıcının LinkedIn JSON export dosyasını yüklemesine izin verebiliriz:

1. extension/src/lib/linkedinImporter.ts dosyası oluştur:
   - parseLinkedInExport(jsonFile): LinkedIn export JSON'ını parse et
   - mapToResumeProfile(linkedinData): LinkedIn verisini ResumeProfile formatına çevir
2. Desteklenen alanlar:
   - Personal info
   - Work experience (pozisyonlar)
   - Education
   - Skills
   - Certifications
   - Projects
3. extension/src/components/ImportLinkedIn.tsx:
   - File upload input
   - "How to export from LinkedIn" rehberi (collapsible)
   - Import progress
   - Preview imported data
   - "Confirm Import" butonu

newtab.tsx'te "Import from LinkedIn" butonu ekle ve ImportLinkedIn modal'ını göster.
```

### Prompt 4.3: PDF ve DOCX Export İyileştirme
```
extension/src/lib/exportService.ts dosyası oluştur ve tüm export işlemlerini buradan yönet:

1. Export formatları:
   - PDF: jsPDF ve html2canvas kullanarak
   - DOCX: docx library kullanarak
   - Google Docs: Google Docs API ile
   - HTML: Download edilebilir HTML (print için)
2. Her export için:
   - Template stilleri uygula
   - Professional formatting
   - Proper page breaks
   - Header/footer (opsiyonel)
   - Watermark (opsiyonel, "Generated by AI CV Optimizer")
3. exportResume(profile, format, template): Promise<Blob>
4. exportCoverLetter(content, format, template): Promise<Blob>
5. exportBatch([profiles], format): Birden fazla versiyonu toplu export et
6. Error handling ve retry mekanizması

Export butonlarına format seçimi dropdown'u ekle. Progress bar göster.
```

### Prompt 4.4: Job Description Parser
```
extension/src/lib/jobParser.ts dosyası oluştur:

1. parseJobDescription(text): Job description'dan yapılandırılmış veri çıkar:
   - Job title
   - Company name
   - Location
   - Employment type (Full-time, Part-time vb.)
   - Required skills
   - Preferred skills
   - Responsibilities
   - Qualifications
   - Benefits
   - Application deadline
2. detectJobSource(text): Hangi platformdan geldiğini anla (LinkedIn, Indeed, Glassdoor vb.)
3. extractKeywords(text): Önemli keyword'leri çıkar (NLP olmadan, basit regex ve frequency ile)
4. matchSkillsToCV(jobSkills, cvSkills): CV'deki skills ile job'daki skills'i eşleştir
5. generateApplicationChecklist(job, profile): Başvuru için checklist oluştur

Job description textarea'sına "Auto-Parse" butonu ekle. Parse edilen bilgileri göster ve job object'ine kaydet.
```

---

## 📋 BÖLÜM 5: VERİ YÖNETİMİ VE GÜVENLİK

### Prompt 5.1: Veri Yedekleme ve Geri Yükleme
```
extension/src/lib/backup.ts dosyası oluştur:

1. exportAllData(): Tüm profilleri, ayarları, job post'ları JSON dosyası olarak export et
2. importAllData(jsonFile): JSON dosyasından tüm veriyi import et
3. exportProfile(profileId): Tek bir profili export et
4. importProfile(jsonFile): Tek profil import et (merge veya replace seçeneği)
5. Auto-backup: Her 7 günde bir otomatik backup al (chrome.alarms API kullanarak)
6. Backup versiyonlama: Son 5 backup'ı sakla
7. Backup dosya formatı:
   ```json
   {
     "version": "1.0",
     "timestamp": "ISO date",
     "profiles": [...],
     "options": {...},
     "jobs": [...]
   }
   ```

extension/src/options/ klasöründeki options sayfasına "Data Management" sekmesi ekle:
- Export All Data butonu
- Import Data butonu (file input)
- Auto-backup toggle
- List of backups (with restore button)
- Delete all data butonu (confirmation ile)
```

### Prompt 5.2: Veri Validasyonu ve Sanitization
```
extension/src/lib/validator.ts dosyası oluştur:

1. Zod kullanarak (zaten package.json'da var) validation schemas oluştur:
   - ResumeProfileSchema
   - PersonalInfoSchema
   - ExperienceSchema
   - EducationSchema
   - vb. (tüm types.ts'teki tipler için)
2. validateProfile(profile): Profile'ı validate et ve hataları döndür
3. sanitizeInput(input): XSS ve injection saldırılarına karşı input'ları temizle
4. validateEmail(email): Email formatını kontrol et
5. validateUrl(url): URL formatını kontrol et
6. validatePhone(phone, countryCode): Telefon numarası validasyonu
7. Form validation helpers: validateField, validateForm

Tüm form component'lerinde validation kullan. Hataları inline göster (field'in altında kırmızı metin).
```

### Prompt 5.3: Privacy ve Data Encryption
```
extension/src/lib/security.ts dosyası oluştur:

1. API key'leri encrypt et:
   - encryptApiKey(key): API key'i encrypt et
   - decryptApiKey(encryptedKey): API key'i decrypt et
   - Web Crypto API kullan (window.crypto.subtle)
2. Sensitive data handling:
   - Personal info (email, phone) encryption opsiyonu
   - "Private mode" toggle: hassas bilgileri gösterme/gizleme
3. Data retention policy:
   - Kullanıcıya veri saklama süresi seçtir (1 ay, 3 ay, 6 ay, süresiz)
   - Belirlenen süre sonunda otomatik silme (chrome.alarms ile)
4. GDPR compliance helpers:
   - Export my data
   - Delete my data
   - Privacy policy gösterimi

PRIVACY_POLICY.md dosyası oluştur ve extension'da göster. Options sayfasına "Privacy" sekmesi ekle.
```

### Prompt 5.4: Offline Support
```
Uygulamanın offline çalışabilmesi için:

1. extension/src/lib/offline.ts dosyası oluştur:
   - isOnline(): Network durumu kontrol et
   - queueRequest(request): Offline iken API isteklerini queue'ya ekle
   - processQueue(): Online olunca queue'daki istekleri işle
2. Service Worker'da background sync API kullan
3. Cache stratejisi:
   - Son generated resume'leri cache'le
   - Son generated cover letter'ları cache'le
   - Template'leri cache'le
4. Offline indicator: Network olmadığında kullanıcıya bildir
5. Graceful degradation: Offline iken hangi özellikler çalışır?
   - Profile editing: ✅
   - Export: ✅ (cached templates ile)
   - AI generation: ❌ (queue'ya ekle, online olunca işle)

Background service worker'ı (extension/src/background/index.ts) güncelle ve sync event'lerini handle et.
```

---

## 📋 BÖLÜM 6: TEST VE KALİTE

### Prompt 6.1: Unit Testler
```
Test altyapısı zaten package.json'da var (jest, @testing-library/react) ama test dosyaları yok. Şu testleri oluştur:

1. extension/src/lib/__tests__/storage.test.ts:
   - Storage get/set operasyonları
   - Profile save/load
   - Active profile selection
2. extension/src/lib/__tests__/ai.test.ts:
   - Mock API responses
   - Error handling
   - Retry logic
   - Different providers (OpenAI, Claude, Gemini)
3. extension/src/lib/__tests__/atsAnalyzer.test.ts:
   - Keyword extraction
   - Score calculation
   - Improvement suggestions
4. extension/src/components/__tests__/Toast.test.tsx:
   - Toast rendering
   - Auto dismiss
   - Manual close
5. extension/src/lib/__tests__/validator.test.ts:
   - Email validation
   - URL validation
   - Profile validation

Jest config dosyası (jest.config.js) oluştur. npm test komutu ile tüm testleri çalıştır.
```

### Prompt 6.2: Integration Testler
```
extension/src/__tests__/integration/ klasöründe integration testler oluştur:

1. fullFlow.test.ts:
   - Setup wizard'ı tamamlama
   - Profil oluşturma
   - Job description girme
   - Resume generation
   - Export işlemi
2. aiIntegration.test.ts:
   - Gerçek API call'lar (test key ile)
   - Response parsing
   - Error scenarios
3. storageIntegration.test.ts:
   - Chrome storage mock'lama
   - Data persistence
   - Migration scenarios (future için)

@testing-library/react kullanarak user flow'ları simüle et.
```

### Prompt 6.3: Manual Test Senaryoları Dokümantasyonu
```
TESTING_GUIDE.md dosyası oluştur:

1. Test senaryoları:
   - Yeni kullanıcı flow'u (fresh install)
   - Profil oluşturma ve kaydetme
   - CV upload ve parsing
   - AI optimization
   - Template seçimi ve değiştirme
   - Export (tüm formatlar)
   - Cover letter generation
   - Google Drive integration
   - Error handling (network error, API error vb.)
   - Offline usage
2. Her senaryo için:
   - Preconditions
   - Steps
   - Expected results
   - Screenshots (gelecekte eklenebilir)
3. Cross-browser testing checklist (Chrome, Edge, Brave)
4. Performance testing:
   - Extension startup time
   - AI response time
   - Export time
   - Memory usage

Bug report template'i de ekle.
```

### Prompt 6.4: Linting ve Code Quality
```
ESLint ve Prettier zaten package.json'da var. Konfigürasyonlarını optimize et:

1. .eslintrc.json dosyası oluştur:
   - TypeScript rules
   - React rules
   - React Hooks rules
   - Accessibility rules
   - Best practices
2. .prettierrc.json dosyası oluştur:
   - 2 space indentation
   - Single quotes
   - Trailing commas
   - Line width 100
3. .eslintignore ve .prettierignore dosyaları
4. Pre-commit hook (husky + lint-staged):
   - Commit öncesi lint çalıştır
   - Prettier format çalıştır
   - Type check yap
5. CI/CD için GitHub Actions workflow:
   - .github/workflows/ci.yml
   - Lint, test, build pipeline

package.json scripts'lerini kontrol et ve eksikleri ekle.
```

---

## 📋 BÖLÜM 7: DEPLOYMENT VE YAYINLAMA

### Prompt 7.1: Production Build Optimizasyonu
```
vite.config.ts dosyasını production için optimize et:

1. Build optimizations:
   - Minification
   - Tree shaking
   - Code splitting
   - Asset optimization
2. Environment variables:
   - .env.example dosyası oluştur
   - Development ve production env'leri
3. Source maps:
   - Production'da minimal source maps
   - Development'ta detailed source maps
4. Chunk size warnings
5. Bundle analyzer (opsiyonel)
6. Build script:
   - Clean dist klasörü
   - Type check
   - Build
   - Zip oluştur (Chrome Web Store için)

package.json'a build:prod script'i ekle. BUILD.md dokümantasyonu oluştur.
```

### Prompt 7.2: Chrome Web Store Hazırlığı
```
Chrome Web Store'da yayınlamak için gerekli materyalleri hazırla:

1. Store listing bilgileri:
   - STORE_LISTING.md dosyası oluştur:
     - Detaylı açıklama (132 karakter kısa, 16000 karakter uzun)
     - Feature listesi
     - Screenshots placeholder'ları (1280x800 veya 640x400)
     - Promotional images placeholder'ları
     - Category: Productivity
     - Keywords: CV, resume, cover letter, ATS, job application, AI
     - Support email
     - Privacy policy URL
2. manifest.json son kontroller:
   - Version number
   - Name ve description
   - Permissions açıklamaları
   - Icons (16x16, 48x48, 128x128)
3. PRIVACY_POLICY.md detaylı hale getir:
   - Data collection (ne topluyoruz?)
   - Data usage (nasıl kullanıyoruz?)
   - Data storage (nerede saklıyoruz?)
   - Third-party services (AI APIs)
   - User rights
4. CHANGELOG.md oluştur ve version history başlat

scripts/ klasöründe release.sh script'i oluştur (versiyonu artır, build al, zip oluştur).
```

### Prompt 7.3: Dokümantasyon Tamamlama
```
Kullanıcı ve geliştirici dokümantasyonunu tamamla:

1. README.md güncelle:
   - Installation (production)
   - Usage guide (screenshots ile)
   - Features (detailed)
   - API setup guide
   - Troubleshooting
   - FAQ
2. CONTRIBUTING.md oluştur:
   - How to contribute
   - Code style guide
   - Pull request process
   - Issue templates
3. API_SETUP_GUIDE.md oluştur:
   - OpenAI API key alma
   - Claude API key alma
   - Gemini API key alma
   - Azure OpenAI setup
   - Rate limits ve pricing bilgileri
4. USER_GUIDE.md oluştur:
   - Step-by-step usage
   - Best practices
   - Tips and tricks
   - Common issues
5. ARCHITECTURE.md güncelle (zaten var ama detaylandır):
   - Project structure
   - Data flow
   - Component hierarchy
   - State management
   - Extension lifecycle

docs/ klasörü oluştur ve tüm dokümantasyonu buraya taşı.
```

### Prompt 7.4: Versiyonlama ve Release Process
```
Semantic versioning ve release process oluştur:

1. VERSION.md dosyası oluştur:
   - Versioning strategy (Semantic Versioning 2.0.0)
   - Version number format: MAJOR.MINOR.PATCH
   - Breaking changes = MAJOR
   - New features = MINOR
   - Bug fixes = PATCH
2. RELEASE_PROCESS.md oluştur:
   - Pre-release checklist
   - Testing checklist
   - Build process
   - Store submission
   - Post-release tasks
3. scripts/version-bump.sh:
   - Version numarasını artır
   - CHANGELOG.md güncelle
   - Git tag oluştur
4. GitHub Releases için template:
   - .github/RELEASE_TEMPLATE.md
   - What's new
   - Bug fixes
   - Known issues
   - Upgrade notes
5. Auto-update mechanism:
   - manifest.json'da update_url
   - Version check logic

package.json'a version-bump scripts'leri ekle (patch, minor, major).
```

---

## 📋 BÖLÜM 8: İZLEME VE ANALİTİK

### Prompt 8.1: Kullanım Analitiği (Privacy-Friendly)
```
extension/src/lib/analytics.ts dosyası oluştur (kullanıcı gizliliğine saygılı):

1. Anonim kullanım metrikleri:
   - Extension install date
   - Feature usage count (CV generated, cover letter generated vb.)
   - Export format preferences
   - Template usage
   - Error count (without personal data)
2. Event tracking:
   - trackEvent(category, action, label)
   - trackPageView(page)
   - trackError(error, context)
3. Local analytics (chrome.storage.local):
   - No external service
   - User can export their own analytics
   - User can clear analytics
4. Analytics dashboard component:
   - extension/src/components/AnalyticsDashboard.tsx
   - Charts (usage over time, feature popularity)
   - Summary stats
5. Privacy first:
   - Opt-in analytics (default: disabled)
   - Clear data anytime
   - No personal info tracked

Options sayfasına "Analytics" toggle'ı ekle. Analytics dashboard'ı options sayfasında göster.
```

### Prompt 8.2: Error Reporting ve Debugging
```
extension/src/lib/errorReporter.ts dosyası oluştur:

1. Error capturing:
   - Global error handler (window.onerror, unhandledrejection)
   - Try-catch wrapper function
   - React Error Boundary
2. Error info:
   - Error message
   - Stack trace
   - Browser info
   - Extension version
   - Timestamp
   - User action before error (last 5 actions)
3. Error storage:
   - Last 100 errors in chrome.storage.local
   - Automatic cleanup (older than 30 days)
4. Error viewer:
   - extension/src/components/ErrorLogViewer.tsx
   - List of errors
   - Error details modal
   - Copy error info
   - Clear all errors
5. Debug mode:
   - Verbose logging toggle
   - Console logging toggle
   - Performance monitoring

extension/src/components/ErrorBoundary.tsx oluştur ve tüm uygulamayı wrap et.
```

### Prompt 8.3: Performance Monitoring
```
extension/src/lib/performance.ts dosyası oluştur:

1. Performance metrikleri:
   - AI response time
   - Export time
   - Page load time
   - Memory usage (chrome.system.memory API)
2. Performance marks:
   - markStart(label)
   - markEnd(label)
   - measure(label)
3. Performance logger:
   - Log slow operations (>1000ms)
   - Log memory spikes
4. Performance viewer:
   - extension/src/components/PerformanceMonitor.tsx
   - Real-time metrics
   - Historical data (last 24 hours)
   - Charts
5. Optimization suggestions:
   - Eğer AI response >10s ise, "Consider using a faster model" mesajı
   - Eğer memory >100MB ise, "Clear cache" önerisi

Developer options altına ekle (production'da gizli, development'ta görünür).
```

### Prompt 8.4: Feedback ve Rating Sistemi
```
extension/src/components/FeedbackModal.tsx oluştur:

1. Feedback form:
   - Rating (1-5 stars)
   - Feedback type (Bug, Feature request, General)
   - Description (textarea)
   - Email (optional, for follow-up)
   - Screenshot (optional)
2. Feedback submission:
   - Local storage'da sakla (external service yok)
   - Export feedback as JSON
   - Email'e gönderme opsiyonu (mailto: link)
3. Feedback prompts:
   - 10 CV oluşturulduktan sonra feedback iste
   - 30 gün kullanımdan sonra rating iste
   - Major version update'ten sonra "What's new" + feedback
4. NPS (Net Promoter Score):
   - "Would you recommend this to a friend?" (0-10)
   - Follow-up question based on score
5. In-app review:
   - Chrome Web Store'da review bırakma linki

Feedback modal'ı uygulama içinde stratejik noktalara ekle (export tamamlandıktan sonra, başarılı generation sonrası vb.).
```

---

## 📋 BÖLÜM 9: SOSYAL VE TOPLULUK ÖZELLİKLERİ

### Prompt 9.1: Başarı Rozetleri ve Gamification
```
extension/src/lib/achievements.ts dosyası oluştur:

1. Achievement türleri:
   - First CV Created
   - 5 CVs Created
   - 10 CVs Created
   - First Cover Letter
   - Template Explorer (3 farklı template kullan)
   - Profile Pro (profile'i %100 doldur)
   - Job Hunter (10 farklı job'a başvur)
   - Optimization Master (50 optimization uygula)
2. Achievement system:
   - checkAchievements(): Yeni achievement unlock edildi mi kontrol et
   - unlockAchievement(id): Achievement'i unlock et
   - getAchievements(): Tüm achievement'leri ve durumlarını getir
3. Achievement UI:
   - extension/src/components/AchievementNotification.tsx (popup notification)
   - extension/src/components/AchievementsList.tsx (tüm achievement'leri göster)
   - Progress bars (her achievement için)
4. Badges:
   - Icon veya emoji ile görselleştir
   - Locked/unlocked states
5. Share achievements:
   - "Share on LinkedIn" butonu
   - Achievement'i image olarak export et

newtab.tsx'te "Achievements" sekmesi ekle. Achievement unlock olduğunda confetti animation göster.
```

### Prompt 9.2: Export Templates Marketplace (Future-Ready)
```
Kullanıcıların kendi template'lerini paylaşabileceği bir sistem için altyapı hazırla:

1. extension/src/lib/templateMarketplace.ts:
   - Template JSON formatı standardize et
   - exportTemplate(template): Template'i JSON olarak export et
   - importTemplate(jsonFile): Template'i import et
2. Template metadata:
   - Template name
   - Creator
   - Description
   - Preview image (base64 encoded)
   - Category
   - Tags
   - Downloads count (future)
   - Rating (future)
3. Template validator:
   - validateTemplate(template): Template'in doğru formatta olduğunu kontrol et
   - sanitizeTemplate(template): XSS ve injection risklerini temizle
4. Community templates placeholder:
   - COMMUNITY_TEMPLATES.json dosyası
   - 5-6 community template örneği
   - Load from JSON
5. Template gallery improvements:
   - Filter by category
   - Search
   - Sort by popularity/date
   - Preview before import

Future: Backend API oluşturulduğunda entegre edilebilir.
```

### Prompt 9.3: İpuçları ve Öğretici Sistem
```
extension/src/components/TutorialOverlay.tsx ve extension/src/lib/tutorial.ts oluştur:

1. Interactive tutorial:
   - First-time user experience
   - Step-by-step overlay
   - Highlight elements (CSS ile focus)
   - Next/Previous/Skip butonları
2. Tutorial steps:
   - Welcome and overview
   - Create your first profile
   - Upload or enter CV info
   - Paste a job description
   - Generate ATS-optimized resume
   - Review optimizations
   - Export your resume
   - Generate cover letter
   - Save your profile
3. Contextual tips:
   - Her sayfada/component'te ilgili tip'leri göster
   - "Tip of the day" feature
   - Tooltip'ler (info icon'ları)
4. Tutorial progress:
   - Hangi adımlar tamamlandı
   - Tutorial'ı tekrar başlat
   - Tutorial'ı atla (opt-out)
5. Help center:
   - extension/src/components/HelpCenter.tsx
   - FAQ accordion
   - Search functionality
   - Video tutorials (YouTube embed, future)

Tutorial tamamlama oranını analytics'te takip et.
```

### Prompt 9.4: Multi-Language Support (i18n)
```
Uygulamayı çok dilli yapma altyapısını kur:

1. extension/src/lib/i18n/ klasörü oluştur:
   - tr.json: Türkçe çeviriler
   - en.json: İngilizce çeviriler
   - de.json: Almanca (future)
   - fr.json: Fransızca (future)
2. Translation helper:
   - t(key, params): Translation function
   - useTranslation(): React hook
   - Language context provider
3. Tüm hardcoded string'leri translation key'lerine çevir:
   - Component'lerdeki text'ler
   - Error messages
   - Success messages
   - Button labels
   - Placeholder'lar
4. Language selector:
   - Options sayfasına dil seçici ekle
   - Browser dilini otomatik detect et
   - Fallback: EN
5. RTL support hazırlığı:
   - CSS direction toggle
   - Arapça, İbranice için hazırlık (future)

manifest.json'da default_locale ayarla. _locales/ klasörü oluştur (Chrome Extension i18n standardı).
```

---

## 📋 BÖLÜM 10: GELECEK İÇİN HAZIRLIK

### Prompt 10.1: Backend API Hazırlığı
```
Gelecekte backend API eklenirse hazır olmak için client-side altyapıyı oluştur:

1. extension/src/lib/apiClient.ts:
   - baseURL configuration
   - HTTP client wrapper (fetch ile)
   - Authentication headers
   - Request/response interceptors
   - Error handling
   - Retry logic
2. API endpoints (placeholder):
   - /auth/login
   - /auth/register
   - /profiles
   - /templates
   - /jobs
   - /analytics
3. Sync system:
   - Local-first approach
   - Sync to cloud (when backend ready)
   - Conflict resolution
   - Offline queue
4. API_INTEGRATION.md dokümantasyonu:
   - Backend requirements
   - API specs (OpenAPI format)
   - Authentication flow
   - Data models

Şimdilik mockApiClient kullan, gerçek API gelince swap edilebilir.
```

### Prompt 10.2: Mobile App Hazırlığı
```
React Native veya PWA için kod paylaşımını kolaylaştıracak yapı:

1. extension/src/lib/ içindeki tüm business logic'i platform-agnostic yap:
   - Chrome API'lerine dependency'leri wrapper'lara taşı
   - Pure functions kullan
   - Platform-specific kod'u ayır
2. Platform abstraction layer:
   - extension/src/platform/chrome.ts
   - extension/src/platform/web.ts (future)
   - extension/src/platform/mobile.ts (future)
3. Shared types ve interfaces:
   - types.ts'i platform-agnostic tut
4. Component'leri atomic ve reusable yap:
   - UI components extension'a bağımlı olmasın
   - Storybook hazırlığı (future)
5. MOBILE_APP_PLAN.md oluştur:
   - Architecture for mobile
   - Feature parity plan
   - Code sharing strategy

Monorepo yapısına geçiş planı (Nx, Turborepo, future).
```

### Prompt 10.3: AI Model Fine-Tuning Hazırlığı
```
Kullanıcı verisi ile model fine-tuning yapmak için veri toplama altyapısı (opt-in):

1. extension/src/lib/dataCollection.ts:
   - Opt-in consent form
   - Data anonymization
   - Data export for fine-tuning
2. Toplanacak veriler (anonymous):
   - Input: Job descriptions
   - Input: Original CV data (anonymized)
   - Output: Generated optimizations
   - User feedback: thumbs up/down
   - User edits after generation
3. Data format:
   - JSONL format (fine-tuning için standard)
   - Each line: {"prompt": "...", "completion": "..."}
4. Privacy compliance:
   - GDPR compliant
   - User consent
   - Data deletion requests
   - Export user's own data
5. FINE_TUNING.md dokümantasyonu:
   - Data collection strategy
   - Fine-tuning process
   - Model deployment
   - A/B testing plan

Fine-tuned model hazır olunca, options'da "Use our fine-tuned model" seçeneği eklenebilir.
```

### Prompt 10.4: Enterprise Features Hazırlığı
```
Enterprise müşteriler için özellikler planlama:

1. Team collaboration (future):
   - Shared templates
   - Company branding
   - Team admin panel
2. Bulk operations:
   - extension/src/lib/bulkOperations.ts oluştur:
     - Bulk profile import (CSV)
     - Bulk export
     - Batch processing
3. Advanced analytics:
   - Company-wide usage stats
   - ROI tracking
   - Success rate (hire rate)
4. Compliance:
   - Audit logs
   - Access control
   - Data retention policies
5. Custom AI models:
   - Company-specific fine-tuned models
   - Custom prompts
   - Brand voice
6. SSO integration:
   - SAML support (future)
   - OAuth with company IdP
7. ENTERPRISE_PLAN.md oluştur:
   - Feature list
   - Pricing tiers
   - Technical requirements
   - Migration path

License key validation sistemi oluştur (future için placeholder).
```

---

## 🎯 UYGULAMA SIRASI ÖNERİSİ

Promptları şu sırayla uygulamanızı öneririm:

### Öncelik 1 (Kritik - İlk 10 prompt):
1. Prompt 1.1 - Ayarlar Sayfası
2. Prompt 1.2 - API Hata Yönetimi
3. Prompt 2.1 - İlk Kurulum Sihirbazı
4. Prompt 2.3 - Progress Indicators
5. Prompt 2.4 - Toast Sistemi
6. Prompt 3.1 - CV Önizleme
7. Prompt 5.2 - Veri Validasyonu
8. Prompt 6.4 - Linting ve Code Quality
9. Prompt 7.1 - Production Build
10. Prompt 7.2 - Chrome Web Store Hazırlığı

### Öncelik 2 (Önemli - Sonraki 10 prompt):
11. Prompt 1.3 - Rate Limiting
12. Prompt 2.2 - Örnek Profiller
13. Prompt 3.3 - ATS Skoru
14. Prompt 3.4 - Template Sistemi
15. Prompt 4.3 - Export İyileştirme
16. Prompt 4.4 - Job Parser
17. Prompt 5.1 - Veri Yedekleme
18. Prompt 6.1 - Unit Testler
19. Prompt 7.3 - Dokümantasyon
20. Prompt 8.2 - Error Reporting

### Öncelik 3 (İyileştirmeler - Sonraki 10 prompt):
21. Prompt 3.2 - CV Karşılaştırma
22. Prompt 4.1 - Google Drive OAuth
23. Prompt 4.2 - LinkedIn Import
24. Prompt 5.3 - Privacy ve Encryption
25. Prompt 5.4 - Offline Support
26. Prompt 6.2 - Integration Testler
27. Prompt 6.3 - Manual Test Senaryoları
28. Prompt 8.1 - Kullanım Analitiği
29. Prompt 8.3 - Performance Monitoring
30. Prompt 9.3 - Tutorial Sistemi

### Öncelik 4 (Gelişmiş - Son 10 prompt):
31. Prompt 7.4 - Versiyonlama
32. Prompt 8.4 - Feedback Sistemi
33. Prompt 9.1 - Gamification
34. Prompt 9.2 - Template Marketplace
35. Prompt 9.4 - Multi-Language
36. Prompt 10.1 - Backend API Hazırlığı
37. Prompt 10.2 - Mobile App Hazırlığı
38. Prompt 10.3 - AI Fine-Tuning
39. Prompt 10.4 - Enterprise Features

---

## 📝 NOTLAR

- Her prompt tek başına çalıştırılabilir
- Promptlar birbirinden bağımsız ama sıralı uygulanması önerilir
- Her prompt tamamlandıktan sonra test edin
- Git commit'lerinizi düzenli yapın
- Her major feature için branch oluşturun

## 🚀 BAŞLARKEN

İlk promtu uygulamak için Claude 4.5 Sonnet'e şunu söyleyin:

```
Şu promtu uygula: [Prompt 1.1'i buraya kopyala]
```

Her prompt tamamlandıktan sonra:
1. Kodu test edin
2. Varsa hataları düzeltin
3. Commit yapın
4. Sonraki promta geçin

---

**Hazırlayan:** AI Assistant
**Tarih:** 2025-10-05
**Proje:** AI CV & Cover Letter Optimizer Chrome Extension
