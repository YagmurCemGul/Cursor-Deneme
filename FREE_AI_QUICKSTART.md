# ⚡ Ücretsiz AI API'leri - Hızlı Başlangıç

## 🎯 En Hızlı Yol (5 Dakika)

### 1. Ücretsiz API Key Al (2 dakika)

#### Google Gemini (Önerilen):
1. https://makersuite.google.com/app/apikey
2. "Create API Key" tıkla
3. Key'i kopyala: `AIzaYour...`

**Neden Gemini?**
- ✅ Tamamen ücretsiz
- ✅ 60 requests/minute
- ✅ Vision support
- ✅ Kredli kart gerektirmez!

---

### 2. Kurulum (2 dakika)

```bash
# free-ai-examples klasörüne git
cd free-ai-examples

# Virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Paketleri kur (sadece ücretsizler)
pip install google-generativeai groq python-dotenv requests
```

---

### 3. API Key Ekle (1 dakika)

```bash
# .env dosyası oluştur
cp .env.example .env

# Düzenle
nano .env  # veya herhangi bir editör

# Sadece bunu ekle:
GEMINI_API_KEY=AIzaYour-actual-key-here
```

---

### 4. Çalıştır!

```bash
python unified_ai_client.py
```

**Çıktı:**
```
🤖 Unified AI Client
Available AI Providers:
  🆓 FREE gemini
  
Testing: GEMINI
✅ Success!
Response: Python, yüksek seviyeli bir programlama dilidir...
```

🎉 **Başardın!**

---

## 🆓 Tüm Ücretsiz Seçenekler

### 1. Google Gemini (En İyi)

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Python nedir?")
print(response.text)
```

**Özellikler:**
- ✅ 60 requests/minute
- ✅ 1,500 requests/day
- ✅ Vision support
- ✅ Kredisiz

**API Key**: https://makersuite.google.com/app/apikey

---

### 2. Groq (En Hızlı)

```python
from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
response = client.chat.completions.create(
    messages=[{"role": "user", "content": "Python nedir?"}],
    model="llama3-70b-8192"
)
print(response.choices[0].message.content)
```

**Özellikler:**
- ✅ 30 requests/minute
- ✅ Ultra hızlı (özel hardware)
- ✅ Llama 3 modelleri
- ✅ Kredisiz

**API Key**: https://console.groq.com/keys

---

### 3. Ollama (Tamamen Offline)

```bash
# Kur (Linux/macOS)
curl -fsSL https://ollama.com/install.sh | sh

# Model indir
ollama run llama3

# Python'dan kullan
import requests
response = requests.post('http://localhost:11434/api/generate', 
    json={"model": "llama3", "prompt": "Python nedir?", "stream": False})
print(response.json()['response'])
```

**Özellikler:**
- ✅ Tamamen ücretsiz
- ✅ Sınırsız kullanım
- ✅ Offline çalışır
- ✅ API key gerektirmez
- ⚠️ GPU önerilir (büyük modeller için)

**İndirme**: https://ollama.com/

---

### 4. Hugging Face (En Çok Seçenek)

```python
import requests

API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
response = requests.post(API_URL, headers=headers, json={"inputs": "Python nedir?"})
print(response.json())
```

**Özellikler:**
- ✅ Binlerce model
- ✅ Community modelleri
- ✅ Çeşitlilik
- ⚠️ Rate limit var

**API Key**: https://huggingface.co/settings/tokens

---

## 📊 Hızlı Karşılaştırma

| API | Ücretsiz | Limit | Hız | Kalite | Kurulum |
|-----|----------|-------|-----|--------|---------|
| **Gemini** | ✅ | 60/min | ⚡⚡ | ⭐⭐⭐⭐ | Kolay |
| **Groq** | ✅ | 30/min | ⚡⚡⚡ | ⭐⭐⭐ | Kolay |
| **Ollama** | ✅ | Sınırsız | ⚡ | ⭐⭐⭐ | Orta |
| **HF** | ✅ | Değişken | ⚡⚡ | ⭐⭐⭐ | Kolay |

### Önerilen Kombinasyon:

**Başlangıç**: Gemini (ücretsiz, kolay)
**Hız**: Groq (ultra fast)
**Offline**: Ollama (sınırsız)
**Kalite**: OpenAI GPT-4 (ücretli)

---

## 💻 Unified API Kullanımı

Tüm AI'ları tek arayüzle kullan:

```python
from unified_ai_client import UnifiedAI

ai = UnifiedAI()

# Otomatik (ücretsiz provider seçer)
result = ai.generate("Python nedir?", provider="auto")
print(result['text'])

# Belirli provider
result = ai.generate("Python nedir?", provider="gemini")
result = ai.generate("Python nedir?", provider="groq")
result = ai.generate("Python nedir?", provider="ollama")

# Hangi provider'lar mevcut?
print(ai.list_available())  # ['gemini', 'groq', 'ollama']
```

---

## 🚀 Sonraki Adımlar

### Öğrendikten Sonra:

1. **Vision ekleme** (Gemini ile resim analizi)
2. **Streaming** (real-time responses)
3. **Chat history** (conversation context)
4. **Function calling** (OpenAI ile)

### Production İçin:

1. **Gemini Pro 1.5** (1M token context)
2. **OpenAI GPT-4** (en iyi kalite)
3. **Claude 3 Opus** (reasoning)
4. **Rate limiting** (hız kontrolü)

---

## 💰 Maliyet (1K request için)

### Ücretsiz:
```
Gemini:  $0 (kalıcı)
Groq:    $0 (kalıcı)
Ollama:  $0 (elektrik)
HF:      $0 (rate limit)
```

### Ücretli (karşılaştırma):
```
OpenAI GPT-3.5:  ~$0.002
OpenAI GPT-4:    ~$0.020
Claude Haiku:    ~$0.001
Claude Sonnet:   ~$0.015
```

---

## 🔗 Hızlı Linkler

| Servis | API Key | Docs |
|--------|---------|------|
| Gemini | [Get Key](https://makersuite.google.com/app/apikey) | [Docs](https://ai.google.dev/docs) |
| Groq | [Get Key](https://console.groq.com/keys) | [Docs](https://console.groq.com/docs) |
| Ollama | [Download](https://ollama.com/) | [Docs](https://github.com/ollama/ollama) |
| Hugging Face | [Get Token](https://huggingface.co/settings/tokens) | [Docs](https://huggingface.co/docs) |

---

## ✅ Checklist

- [ ] Gemini API key aldım
- [ ] Virtual environment oluşturdum
- [ ] Paketleri kurdum
- [ ] .env dosyası oluşturdum
- [ ] İlk API çağrısını yaptım ✅
- [ ] Unified client'ı test ettim ✅
- [ ] Diğer ücretsiz API'leri denedim

---

**İyi kodlamalar! 🚀**

Tamamen ücretsiz AI ile projeler geliştirin! 🆓✨
