# Form Builder Özellikleri - Kullanım Rehberi

## Yeni Özellikler

### 1. 🔴 Zorunlu Sorular (Required Questions)

**Kullanım:**
- Yeni soru eklerken "Zorunlu olarak işaretle" onay kutusunu işaretleyin
- Zorunlu sorular yanında kırmızı yıldız (*) işareti görünür
- Zorunlu sorular cevaplanmazsa kırmızı kenarlık ve uyarı mesajı gösterilir

**Örnek:**
```
❓ Ad-Soyad *
[Metin Kutusu] ← Cevaplanmadıysa kırmızı kenarlık
```

### 2. 📊 Karakter Sayacı (Character Counter)

**Kullanım:**
- "Form Grubu" veya "Alan Grubu" tipindeki sorular için otomatik aktif
- Soru oluştururken karakter limitini belirleyin (varsayılan: 500)
- Cevap yazarken kalan karakter sayısı gösterilir
- 50 karakterden az kaldığında kırmızı renkte uyarı

**Örnek:**
```
[Metin Alanı]
450 karakter kaldı ← Yeşil renkte
```

```
[Metin Alanı]
25 karakter kaldı ← Kırmızı renkte (uyarı)
```

### 3. 💾 Otomatik Kaydetme (Auto-save)

**Kullanım:**
- Cevapları yazdıkça otomatik olarak kaydedilir
- Yazdıktan 1 saniye sonra kaydetme işlemi başlar
- Üst kısımda kaydetme durumu gösterilir:
  - 💾 "Otomatik kaydediliyor..." → Kaydediyor
  - ✓ "Kaydedildi" → Başarılı

**Avantajları:**
- Veri kaybı riski yok
- Manuel kaydetme butonu kullanmaya gerek yok
- Anlık geri bildirim

### 4. ✍️ Zengin Metin Editörü (Rich Text Editor)

**Kullanım:**
- "Form Grubu" tipindeki sorular için otomatik aktif
- Araç çubuğundan metin biçimlendirme yapabilirsiniz:

**Özellikler:**
- **B** → Kalın yazı
- _I_ → İtalik yazı
- • Madde → Madde işareti ekle
- 1. Liste → Numaralı liste ekle
- Biçimi Temizle → Tüm biçimlendirmeyi kaldır
- 🗑️ → Tüm metni sil

**Markdown Desteği:**
```
**kalın metin** → Kalın görünür
_italik metin_ → İtalik görünür
```

**Otomatik Liste Algılama:**
- Word veya başka yerden liste yapıştırırsanız otomatik olarak biçimlendirilir

### 5. 📁 Dosya Yükleme (File Upload)

**Kullanım:**
- Yeni soru eklerken tip olarak "Dosya Yükleme" seçin
- Kullanıcılar dosya yükleyebilir

**Özellikler:**
- Maksimum dosya boyutu: 5MB
- Tüm dosya tipleri desteklenir
- Yüklenen dosya adı ve boyutu gösterilir
- ✕ butonu ile dosya kaldırılabilir

**Örnek Kullanım:**
```
📁 Dosya Seç ← Tıklayarak dosya seçin
Dosya seçilmedi
```

Dosya yüklendikten sonra:
```
📎 ozgecmis.pdf     [✕]
48.5 KB
```

## Soru Tipleri Karşılaştırması

| Tip | Zengin Metin | Karakter Sayacı | Zorunlu | Dosya |
|-----|-------------|-----------------|---------|-------|
| Metin Girişi | ❌ | ❌ | ✅ | ❌ |
| Form Grubu | ✅ | ✅ | ✅ | ❌ |
| Alan Grubu | ❌ | ✅ | ✅ | ❌ |
| Seçim (Radio) | ❌ | ❌ | ✅ | ❌ |
| Onay Kutusu | ❌ | ❌ | ✅ | ❌ |
| Dosya Yükleme | ❌ | ❌ | ✅ | ✅ |

## En İyi Uygulamalar

### Zorunlu Sorular İçin
- Sadece gerçekten gerekli soruları zorunlu yapın
- Kullanıcı deneyimini düşünün
- Çok fazla zorunlu soru kullanıcıyı yorar

### Karakter Limiti İçin
- Kısa yanıtlar için: 100-200 karakter
- Orta uzunlukta metinler için: 500 karakter (varsayılan)
- Uzun açıklamalar için: 1000-2000 karakter

### Zengin Metin İçin
- Detaylı açıklamalar gerektiğinde kullanın
- Madde işaretli listeler için idealdir
- CV, iş deneyimi gibi yapılandırılmış metinler için

### Dosya Yükleme İçin
- Maksimum boyutu kullanıcılara bildirin (5MB)
- Hangi dosya tiplerini beklendiğini açıklayın
- Örnek: "CV dosyanızı yükleyin (PDF, DOCX)"

## Örnek Kullanım Senaryoları

### 1. İş Başvuru Formu
```
❓ Ad-Soyad * (Metin Girişi, Zorunlu)
❓ E-posta * (Metin Girişi, Zorunlu)
❓ İş Deneyiminiz * (Form Grubu, Zorunlu, 1000 karakter)
  → Zengin metin editörü ile madde işaretli liste olarak yazılabilir
❓ CV Yükleyin * (Dosya Yükleme, Zorunlu)
❓ Ön Yazı (Form Grubu, İsteğe Bağlı, 500 karakter)
```

### 2. Müşteri Geri Bildirimi
```
❓ Memnuniyet Derecesi * (Seçim, Zorunlu)
  ◉ Çok Memnun
  ◉ Memnun
  ◉ Orta
  ◉ Memnun Değil
❓ Yorumlarınız (Alan Grubu, İsteğe Bağlı, 300 karakter)
❓ Ekran Görüntüsü (Dosya Yükleme, İsteğe Bağlı)
```

### 3. Eğitim Başvuru Formu
```
❓ Öğrenci Bilgileri * (Form Grubu, Zorunlu, 500 karakter)
❓ Neden Bu Kursa Katılmak İstiyorsunuz? * (Form Grubu, Zorunlu, 800 karakter)
  → Zengin metin ile formatlanmış cevap
❓ İlgi Alanları (Onay Kutusu, İsteğe Bağlı)
  ☑ Yazılım Geliştirme
  ☑ Veri Bilimi
  ☑ Yapay Zeka
❓ Diploma/Sertifika (Dosya Yükleme, İsteğe Bağlı)
```

## Teknik Notlar

- Otomatik kaydetme 1 saniye gecikmeli çalışır (debounce)
- Dosya verileri base64 formatında saklanır
- Tüm özellikler Türkçe ve İngilizce dillerini destekler
- Validasyon gerçek zamanlı çalışır
- Veriler tarayıcı yerel deposunda güvenle saklanır

## Sorun Giderme

**Otomatik kaydetme çalışmıyor:**
- Tarayıcı konsolunu kontrol edin
- Yerel depolama izninin verildiğinden emin olun

**Dosya yüklenemiyor:**
- Dosya boyutunun 5MB'dan küçük olduğunu kontrol edin
- Tarayıcının dosya okuma iznine sahip olduğunu doğrulayın

**Zengin metin formatı görünmüyor:**
- Markdown sözdizimini kullanın (**kalın**, _italik_)
- Madde işaretleri için • karakterini kullanın
- Araç çubuğundaki butonları deneyin

## Destek

Sorun yaşarsanız veya öneriniz varsa, lütfen proje deposunda bir issue açın.

---

**Son Güncelleme:** 2025-10-04
**Versiyon:** 1.0.0
