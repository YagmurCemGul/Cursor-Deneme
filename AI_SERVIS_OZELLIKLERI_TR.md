# AI Servis Entegrasyonu ve Yönetimi - Uygulama Özeti

## Genel Bakış
Bu belge, CV Optimizer Chrome Eklentisi için uygulanan kapsamlı AI servis entegrasyonu ve yönetim özelliklerini özetlemektedir.

## Uygulanan Özellikler

### 1. ✅ Azure OpenAI Service Desteği
- **Dosya**: `src/utils/aiProviders.ts` - `AzureOpenAIProvider` sınıfı
- **Özellikler**:
  - Tam Azure OpenAI API entegrasyonu
  - Azure'a özel endpoint ve deployment desteği
  - API versiyon uyumluluğu (2024-02-15-preview)
  - OpenAI ile aynı modeller (GPT-4, GPT-4o, GPT-3.5 Turbo)
  - Kurumsal kullanım için gelişmiş güvenlik
- **Yapılandırma**:
  - Azure endpoint (örn: `https://your-resource.openai.azure.com`)
  - Deployment adı
  - API anahtarı
  - Model seçimi

### 2. ✅ Ollama (Yerel AI) Desteği
- **Dosya**: `src/utils/aiProviders.ts` - `OllamaProvider` sınıfı
- **Özellikler**:
  - Yerel AI model desteği (tamamen özel ve ücretsiz)
  - İnternet bağlantısı gerektirmez
  - Popüler açık kaynak modeller:
    - Llama 2/3
    - Mistral/Mixtral
    - Code Llama
    - Phi, Gemma
  - Güvenli örnekler için opsiyonel API anahtarı
- **Yapılandırma**:
  - Ollama endpoint (varsayılan: `http://localhost:11434`)
  - Model seçimi
  - Opsiyonel API anahtarı

### 3. ✅ API Kullanım İstatistikleri
- **Dosya**: `src/utils/usageTracker.ts` - `UsageTracker` sınıfı
- **Özellikler**:
  - Kapsamlı kullanım takibi
  - Her API çağrısı için kayıt:
    - Kullanılan sağlayıcı ve model
    - İşlem tipi
    - Token kullanımı (prompt/completion/toplam)
    - Maliyet hesaplama
    - Süre
    - Başarı/başarısızlık durumu
  - Depolama yönetimi (son 1000 kayıt)
  - Sorgulama yetenekleri:
    - Tarih aralığına göre
    - Sağlayıcıya göre
    - İşlem tipine göre
  - Kullanım özetleri ve trendler
  - Dışa aktarma işlevselliği

### 4. ✅ Token Sayacı
- **Dosya**: `src/utils/tokenCounter.ts`
- **Özellikler**:
  - Metin girişi için token tahmini
  - Model-spesifik token sayımı
  - Konuşma token hesaplama (sistem + kullanıcı + tamamlama)
  - Model-spesifik ayarlamalarla gelişmiş token sayımı
  - Model başına token limit kontrolü
  - Görüntüleme için token formatı (K/M sonekleri)
  - CV verisi token tahmini

### 5. ✅ Toplu İşleme (Batch Processing)
- **Dosya**: `src/utils/batchProcessor.ts` - `BatchProcessor` sınıfı
- **Özellikler**:
  - Birden fazla CV'yi aynı anda işleme
  - Yapılandırılabilir paralel işleme (varsayılan: 3 eşzamanlı istek)
  - İlerleme takibi
  - Hata durumunda devam etme seçeneği ile hata yönetimi
  - Yapılandırılabilir gecikmelerle hız sınırlama
  - İş yönetimi:
    - İş oluşturma, izleme, iptal etme
    - Bireysel öğe durumu takibi
    - İş geçmişi saklama (son 50 iş)
  - Destek:
    - CV optimizasyonu
    - Niyet mektubu oluşturma

### 6. ✅ Özel Prompt Yönetimi
- **Dosya**: `src/utils/customPrompts.ts` - `CustomPromptsManager` sınıfı
- **Özellikler**:
  - Özel prompt şablonları oluşturma ve yönetme
  - Kategorizasyon (CV optimizasyonu, niyet mektubu, genel)
  - Değişken değiştirme sistemi ({{değişken}} sözdizimi)
  - Prompt başına kullanım takibi
  - Dahil edilen varsayılan şablonlar:
    - Standart CV Optimizasyonu
    - Üst Düzey Pozisyon CV Optimizasyonu
    - Teknik Rol CV Optimizasyonu
    - Standart Niyet Mektubu
    - Kariyer Değişikliği Niyet Mektubu
  - İçe/Dışa aktarma işlevselliği
  - Prompt versiyonlama (oluşturma/güncelleme zaman damgaları)

### 7. ✅ A/B Testi
- **Dosya**: `src/utils/abTesting.ts` - `ABTester` sınıfı
- **Özellikler**:
  - Birden fazla AI sağlayıcısını yan yana karşılaştırma
  - Aynı işlemi farklı sağlayıcılarda çalıştırma
  - Sağlayıcı başına izlenen metrikler:
    - Üretilen çıktı
    - Kullanılan tokenlar
    - Maliyet
    - Süre
  - Kullanıcı geri bildirimi:
    - Her sağlayıcıyı puanlama (1-5 yıldız)
    - En iyi sağlayıcıyı seçme
    - Not ekleme
  - Karşılaştırma istatistikleri:
    - Kullanım sayısı
    - En iyi olarak seçilme sayısı
    - Ortalama puan
    - Ortalama maliyet
    - Ortalama süre
  - Test sonucu saklama (son 50 test)
  - Test sonuçlarını dışa aktarma

### 8. ✅ Maliyet Hesaplayıcı
- **Dosya**: `src/utils/costCalculator.ts`
- **Özellikler**:
  - Tüm sağlayıcılar için kapsamlı fiyatlandırma veritabanı
  - Model başına fiyatlandırma (girdi/çıktı tokenları)
  - API çağrısı başına maliyet hesaplama
  - Toplu maliyet hesaplama
  - İşlem maliyet tahmini
  - Modeller arası maliyet karşılaştırma
  - Aylık maliyet projeksiyonu
  - Fiyatlandırma:
    - OpenAI (GPT-4o, GPT-4o-mini, GPT-4, GPT-3.5)
    - Claude (Sonnet, Opus, Haiku)
    - Gemini (Pro, 1.5 Pro, 1.5 Flash)
    - Azure OpenAI (OpenAI ile aynı)
    - Ollama (ücretsiz/yerel)

### 9. ✅ Güncellenmiş UI Bileşenleri
- **Dosya**: `src/components/AISettings.tsx` (güncellendi)
- **Dosya**: `src/components/UsageStatsPanel.tsx` (yeni)
- **Özellikler**:
  - Azure OpenAI yapılandırma arayüzü
  - Ollama yapılandırma arayüzü
  - Kullanım istatistikleri panosu
  - Açıklamalarla sağlayıcı seçimi
  - Model-spesifik ayarlar
  - Azure endpoint/deployment yapılandırması
  - Ollama endpoint yapılandırması
  - Görsel istatistik gösterimi

## Sağlayıcı Karşılaştırması

| Özellik | OpenAI | Gemini | Claude | Azure OpenAI | Ollama |
|---------|--------|--------|--------|--------------|--------|
| Bulut-tabanlı | ✓ | ✓ | ✓ | ✓ | ✗ |
| Maliyet | $$ | $ | $$$ | $$ | Ücretsiz |
| Gizlilik | Bulut | Bulut | Bulut | Bulut | Yerel |
| İnternet Gerekli | ✓ | ✓ | ✓ | ✓ | ✗ |
| Kurumsal | ✗ | ✗ | ✗ | ✓ | - |
| Mevcut Modeller | 4 | 3 | 3 | 5 | 7+ |

## Kullanım Örnekleri

### Token Sayımı
```typescript
import { estimateTokens, countConversationTokens } from './utils/tokenCounter';

const tokenCount = estimateTokens("Metniniz buraya");
const conversationTokens = countConversationTokens(systemPrompt, userPrompt, completion);
```

### Maliyet Hesaplama
```typescript
import { calculateCost, formatCost } from './utils/costCalculator';

const cost = calculateCost('gpt-4o-mini', 1000, 500);
console.log(formatCost(cost)); // "$0.0009"
```

### Kullanım Takibi
```typescript
import { UsageTracker } from './utils/usageTracker';

await UsageTracker.recordUsage({
  provider: 'openai',
  model: 'gpt-4o-mini',
  operation: 'optimize-cv',
  tokensUsed: { prompt: 1000, completion: 500, total: 1500 },
  cost: 0.00225,
  duration: 2500,
  success: true
});

const summary = await UsageTracker.getUsageSummary();
```

### Toplu İşleme
```typescript
import { BatchProcessor } from './utils/batchProcessor';

const batchProcessor = new BatchProcessor(aiService);
const jobId = await batchProcessor.createJob(
  '10 CV Optimize Et',
  items,
  { operation: 'optimize-cv', parallelLimit: 3 }
);
```

### A/B Testi
```typescript
import { ABTester } from './utils/abTesting';

const result = await ABTester.runTest({
  testName: 'Sağlayıcıları Karşılaştır',
  cvData,
  jobDescription,
  providers: [
    { provider: 'openai', apiKey: '...', model: 'gpt-4o-mini' },
    { provider: 'claude', apiKey: '...', model: 'claude-3-haiku-20240307' }
  ],
  operation: 'generate-cover-letter'
});
```

### Özel Promptlar
```typescript
import { CustomPromptsManager } from './utils/customPrompts';

const promptId = await CustomPromptsManager.createPrompt({
  name: 'Özel Promptum',
  category: 'cv-optimization',
  systemPrompt: 'Sen bir uzmansın...',
  userPromptTemplate: 'Bu CV\'yi optimize et:\n{{cvData}}',
  variables: ['cvData']
});

const { systemPrompt, userPrompt } = await CustomPromptsManager.usePrompt(
  promptId,
  { cvData: JSON.stringify(cvData) }
);
```

## Faydalar

### Kullanıcılar İçin
- **Seçenek**: 5 farklı AI sağlayıcı desteği
- **Gizlilik**: Ollama tamamen yerel AI işleme sağlar
- **Maliyet Kontrolü**: Detaylı maliyet takibi ve karşılaştırma
- **Kalite**: A/B testi ihtiyaçlarınız için en iyi sağlayıcıyı bulmanıza yardımcı olur
- **Verimlilik**: Toplu işleme zamandan tasarruf sağlar
- **Esneklik**: Özel kullanım durumları için özel promptlar
- **Şeffaflık**: Tam kullanım istatistikleri

### Kurumsal Kullanıcılar İçin
- **Azure OpenAI**: Kurumsal düzeyde güvenlik ve uyumluluk
- **Maliyet Yönetimi**: Detaylı kullanım ve maliyet takibi
- **Denetim İzi**: Tam API kullanım geçmişi
- **Özelleştirme**: Şirket standartları için özel promptlar

### Gizlilik Odaklı Kullanıcılar İçin
- **Ollama**: %100 yerel işleme
- **Veri Paylaşımı Yok**: CV verisi makinenizde kalır
- **Ücretsiz**: API maliyeti yok
- **Çevrimdışı**: İnternet olmadan çalışır

## Teknik Notlar

- Tüm yardımcı programlar genişletilebilir şekilde tasarlanmıştır
- Depolama limitleri otomatik olarak yönetilir (son N kayıt tutulur)
- Her yerde hata yönetimi
- Üstel geri çekilme ile yeniden deneme mantığı
- Tip-güvenli uygulamalar
- Kapsamlı loglama

## Sonuç

Bu uygulama, birden fazla sağlayıcı desteği, detaylı kullanım takibi, maliyet yönetimi ve toplu işleme ve A/B testi gibi gelişmiş özelliklerle eksiksiz, production-ready bir AI servis entegrasyonu ve yönetim sistemi sağlar.

## Kurulum ve Kullanım

1. **Ayarlar**: Eklentide AI Settings bölümüne gidin
2. **Sağlayıcı Seçin**: OpenAI, Gemini, Claude, Azure OpenAI veya Ollama'dan birini seçin
3. **API Anahtarı**: Seçtiğiniz sağlayıcı için API anahtarınızı girin (Ollama için opsiyonel)
4. **Ek Yapılandırma**:
   - Azure OpenAI için: Endpoint ve deployment adı
   - Ollama için: Endpoint adresi (varsayılan: localhost:11434)
5. **Model Seçimi**: Kullanmak istediğiniz modeli seçin
6. **Kaydet**: Ayarlarınızı kaydedin

### Ollama Kurulumu

1. [ollama.ai](https://ollama.ai) adresinden Ollama'yı indirin ve kurun
2. Terminalde bir model çalıştırın: `ollama run llama2`
3. Eklentide Ollama sağlayıcısını seçin
4. Endpoint'i doğrulayın (varsayılan: `http://localhost:11434`)

## Destek ve Dokümantasyon

- Detaylı İngilizce dokümantasyon: `AI_SERVICE_FEATURES_IMPLEMENTATION.md`
- Kaynak kodlar: `src/utils/` klasörü
- UI bileşenleri: `src/components/` klasörü
