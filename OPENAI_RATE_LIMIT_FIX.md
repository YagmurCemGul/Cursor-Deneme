# OpenAI Rate Limit ve Quota Hatası Düzeltmeleri

## Sorun
Kullanıcılar OpenAI API'den 429 (Rate Limit Exceeded) hatası alıyorlardı, ancak hesaplarında bütçe bulunuyordu. Hata mesajları, sorunun **rate limit** (çok fazla istek) mi yoksa **quota/bütçe** (yetersiz kredi) problemi mi olduğunu ayırt edemiyordu.

## OpenAI 429 Hata Türleri

OpenAI API'den gelen 429 hatalarının 2 farklı nedeni olabilir:

### 1. Rate Limit (Hız Sınırı)
- **Neden**: Çok kısa sürede çok fazla istek gönderiyorsunuz
- **Örnek**: Dakika başına 3 istek limiti varken 10 istek gönderdiniz
- **Çözüm**: 
  - 20-60 saniye bekleyin ve tekrar deneyin
  - İstekler arasında daha fazla bekleme süresi ekleyin
  - Daha yüksek rate limit için API planınızı yükseltin
- **Yeniden Deneme**: Evet, exponential backoff ile otomatik yeniden denenir

### 2. Quota/Budget (Bütçe/Kota Sınırı)
- **Neden**: Hesabınızda yetersiz kredi veya kota
- **Örnekler**:
  - Free tier aylık limitiniz doldu
  - Ödeme yönteminiz reddedildi
  - Hesabınıza kredi eklenmedi
- **Çözüm**:
  - [OpenAI Usage Dashboard](https://platform.openai.com/usage) kontrolü
  - [OpenAI Billing](https://platform.openai.com/account/billing) sayfasından kredi ekleyin
  - Free tier kullanıyorsanız aylık reset bekleyin
- **Yeniden Deneme**: Hayır, kredi eklenene kadar yeniden denemez

## Yapılan İyileştirmeler

### 1. Gelişmiş Hata Algılama
```typescript
// ÖNCESİ - Basit hata
if (response.status === 429) {
  throw new Error(`OpenAI rate limit exceeded (429). Please wait and try again.`);
}

// SONRASI - Detaylı hata analizi
if (response.status === 429) {
  const errorMessage = errorJson.error?.message || errorText;
  const errorType = errorJson.error?.type || 'unknown';
  
  // Quota hatası mı?
  if (errorMessage.includes('quota') || 
      errorMessage.includes('insufficient_quota') || 
      errorType === 'insufficient_quota') {
    throw new Error(
      `OpenAI quota exceeded: ${errorMessage}\n\n` +
      `Your account has insufficient quota/credits. Please:\n` +
      `1. Check your usage at https://platform.openai.com/usage\n` +
      `2. Add credits or upgrade your plan at https://platform.openai.com/account/billing\n` +
      `3. Wait for your monthly quota to reset if on free tier`
    );
  } else {
    // Rate limit hatası
    throw new Error(
      `OpenAI rate limit exceeded (429): ${errorMessage}\n\n` +
      `You're sending requests too quickly. Please:\n` +
      `1. Wait 20-60 seconds before trying again\n` +
      `2. Reduce the frequency of your requests\n` +
      `3. Consider upgrading to a higher tier for increased rate limits`
    );
  }
}
```

### 2. API Manager İyileştirmeleri
`src/utils/apiManager.ts` dosyasında retry logic geliştirildi:

```typescript
// Quota hatası için yeniden deneme yapma
if (error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
  const quotaMessage = 'Quota exceeded: Your account has insufficient credits...';
  throw new Error(quotaMessage);
} else {
  // Rate limit için daha uzun backoff
  const rateLimitMessage = 'Rate limit exceeded: Too many requests...';
  throw new Error(rateLimitMessage);
}
```

### 3. Retry Stratejisi
- **Rate Limit Hataları**: 
  - 5 saniye minimum bekleme
  - Exponential backoff: 5s → 15s → 45s
  - Maksimum 2-3 deneme
  
- **Quota Hataları**:
  - Yeniden deneme yapılmaz (retryable = false)
  - Kullanıcıya açık yönlendirme verilir

## Güncellenen Dosyalar

1. **src/utils/aiProviders.ts**
   - OpenAI provider'da gelişmiş 429 error handling
   - Hem optimizeCV hem de generateCoverLetter fonksiyonlarında

2. **extension/src/lib/aiProviders.ts**
   - Extension'daki OpenAI çağrılarında aynı iyileştirmeler
   - Kullanıcıya daha net mesajlar

3. **extension/src/lib/aiProviders.improved.ts**
   - Production-ready versiyonda tüm provider'lar (OpenAI, Claude, Gemini)
   - Retryable flag eklendi quota hataları için

4. **src/utils/apiManager.ts**
   - Generic retry logic'de quota vs rate limit ayrımı
   - Daha uzun backoff süreleri rate limit için

## Kullanım Örnekleri

### Senaryo 1: Rate Limit Hatası
```
Hata: "OpenAI rate limit exceeded (429): Rate limit reached for requests

You're sending requests too quickly. Please:
1. Wait 20-60 seconds before trying again
2. Reduce the frequency of your requests
3. Consider upgrading to a higher tier for increased rate limits at https://platform.openai.com/account/limits"
```

**Ne Yapmalı**: 1-2 dakika bekleyin, sonra tekrar deneyin. Sistem otomatik retry yapacaktır.

### Senaryo 2: Quota/Budget Hatası
```
Hata: "OpenAI quota exceeded: You exceeded your current quota, please check your plan and billing details

Your account has insufficient quota/credits. Please:
1. Check your usage at https://platform.openai.com/usage
2. Add credits or upgrade your plan at https://platform.openai.com/account/billing
3. Wait for your monthly quota to reset if on free tier"
```

**Ne Yapmalı**: OpenAI dashboard'a gidin ve kredi ekleyin veya planınızı kontrol edin.

## Test Senaryoları

### Test 1: Rate Limit Testi
```typescript
// Hızlı ardışık istekler gönder
for (let i = 0; i < 10; i++) {
  await optimizeCV(cvData, jobDesc); // Rate limit tetiklenmeli
}
// Beklenen: "Rate limit exceeded" mesajı, otomatik retry
```

### Test 2: Quota Testi  
```typescript
// Kredisi bitmiş API key ile
await optimizeCV(cvData, jobDesc);
// Beklenen: "Quota exceeded" mesajı, retry yapılmamalı
```

## Önlemler ve Best Practices

1. **İstekler Arası Bekleme**
   ```typescript
   await delay(2000); // Her istek arasında 2 saniye bekle
   ```

2. **Batch İstekler İçin Queue**
   ```typescript
   const queue = new RequestQueue({ 
     maxConcurrent: 1, 
     minDelay: 2000 
   });
   ```

3. **Cache Kullanımı**
   ```typescript
   // Aynı istekleri tekrar göndermemek için cache
   const cacheKey = generateCacheKey(cvData, jobDesc);
   ```

4. **Monitoring ve Limits**
   - Usage dashboard'u düzenli kontrol
   - Rate limit yaklaşırken uyarı
   - Cost tracking

## Faydalı Linkler

- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- [OpenAI Billing](https://platform.openai.com/account/billing)
- [OpenAI API Status](https://status.openai.com/)
- [API Key Limits](https://platform.openai.com/account/limits)

## Gelecek İyileştirmeler

1. **Proactive Rate Limiting**
   - Client-side'da istek sayısını takip et
   - Limitlere yaklaşınca otomatik yavaşlat

2. **Cost Tracking**
   - Her istek maliyetini göster
   - Günlük/aylık maliyet limitleri

3. **Provider Fallback**
   - OpenAI quota/rate limit dolarsa otomatik Gemini/Claude'a geç
   - Kullanıcıya bildir

4. **Advanced Queue System**
   - İstekleri öncelik sırasına koy
   - Rate limit'e göre dinamik throttling
