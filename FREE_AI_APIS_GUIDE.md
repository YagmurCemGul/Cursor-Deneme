# 🆓 Ücretsiz AI API'leri - Kapsamlı Rehber

## 📋 İçindekiler
1. [Genel Karşılaştırma](#genel-karşılaştırma)
2. [Google Gemini (ÜCRETSİZ)](#google-gemini)
3. [Hugging Face (ÜCRETSİZ)](#hugging-face)
4. [Groq (ÜCRETSİZ)](#groq)
5. [Cohere (ÜCRETSİZ)](#cohere)
6. [OpenAI (Ücretli - Credit ile başlangıç)](#openai)
7. [Anthropic Claude (Ücretli - Credit ile başlangıç)](#anthropic-claude)
8. [Meta Llama (Açık Kaynak - Kendi Sunucunuzda)](#meta-llama)
9. [Mistral (Kısmen Ücretsiz)](#mistral)
10. [Unified Kullanım](#unified-kullanım)

---

## 📊 Genel Karşılaştırma

| AI Servisi | Ücretsiz Tier | Limit | API Key | Avantajlar |
|------------|---------------|-------|---------|------------|
| **🌟 Gemini** | ✅ TAM ÜCRETSİZ | 60 req/min | Gerekli | En cömert, vision |
| **🤗 Hugging Face** | ✅ TAM ÜCRETSİZ | Rate limit var | Gerekli | Binlerce model |
| **⚡ Groq** | ✅ TAM ÜCRETSİZ | 30 req/min | Gerekli | Ultra hızlı |
| **🔮 Cohere** | ✅ Deneme | 5K/ay ilk ay | Gerekli | Trial period |
| **🤖 OpenAI** | ❌ $5 credit | - | Gerekli | En popüler |
| **💬 Claude** | ❌ $5 credit | - | Gerekli | En iyi reasoning |
| **🦙 Llama** | ✅ Açık kaynak | Sınırsız | - | Kendi sunucu |
| **🌪️ Mistral** | ⚠️ Kısmen | - | Gerekli | Bazı modeller |

### 🏆 En İyi Ücretsiz Seçenekler

#### 1. **Google Gemini** 🥇
- ✅ **Tamamen ücretsiz**
- ✅ 60 requests/minute
- ✅ 1,500 requests/day
- ✅ Vision support (resim analizi)
- ✅ Uzun context (30K-1M tokens)
- 🎯 **Önerilen başlangıç!**

#### 2. **Groq** 🥈
- ✅ Tamamen ücretsiz
- ✅ Ultra hızlı inference
- ✅ Llama 3, Mixtral modelleri
- ✅ 30 requests/minute
- 🎯 **En hızlı yanıt!**

#### 3. **Hugging Face** 🥉
- ✅ Binlerce ücretsiz model
- ✅ Çeşitlilik
- ✅ Community modelleri
- ⚠️ Rate limit var
- 🎯 **En fazla seçenek!**

---

## 🌟 Google Gemini (TAM ÜCRETSİZ)

### Özellikler
- ✅ **Tamamen ücretsiz** (kalıcı)
- ✅ 60 requests/minute
- ✅ 1,500 requests/day
- ✅ Vision support
- ✅ Context: 30K-1M tokens

### Hızlı Kurulum

```bash
# 1. API Key al
# https://makersuite.google.com/app/apikey

# 2. Kur
pip install google-generativeai python-dotenv

# 3. .env oluştur
echo "GEMINI_API_KEY=AIzaYour..." > .env
```

### Kullanım

```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Model
model = genai.GenerativeModel('gemini-pro')

# Generate
response = model.generate_content("Python nedir?")
print(response.text)
```

**Detaylar**: `GEMINI_PYTHON_SETUP.md`

---

## 🤗 Hugging Face (TAM ÜCRETSİZ)

### Özellikler
- ✅ **Tamamen ücretsiz**
- ✅ Binlerce model
- ✅ Community modelleri
- ✅ Inference API
- ⚠️ Rate limit var (değişken)

### Hızlı Kurulum

```bash
# 1. API Key al
# https://huggingface.co/settings/tokens

# 2. Kur
pip install huggingface-hub requests

# 3. .env oluştur
echo "HUGGINGFACE_API_KEY=hf_..." > .env
```

### Kullanım

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

# Generate
output = query({
    "inputs": "Python nedir?",
})
print(output)
```

### Popüler Ücretsiz Modeller

```python
# Text Generation
"gpt2"
"distilgpt2"
"facebook/opt-350m"
"EleutherAI/gpt-neo-125m"

# Translation
"Helsinki-NLP/opus-mt-en-tr"
"facebook/mbart-large-50-many-to-many-mmt"

# Sentiment Analysis
"distilbert-base-uncased-finetuned-sst-2-english"
"cardiffnlp/twitter-roberta-base-sentiment"

# Summarization
"facebook/bart-large-cnn"
"t5-small"
```

---

## ⚡ Groq (TAM ÜCRETSİZ)

### Özellikler
- ✅ **Tamamen ücretsiz**
- ✅ Ultra hızlı (özel hardware)
- ✅ Llama 3, Mixtral modelleri
- ✅ 30 requests/minute
- ✅ 14,400 requests/day

### Hızlı Kurulum

```bash
# 1. API Key al
# https://console.groq.com/keys

# 2. Kur
pip install groq

# 3. .env oluştur
echo "GROQ_API_KEY=gsk_..." > .env
```

### Kullanım

```python
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Python nedir?",
        }
    ],
    model="llama3-70b-8192",  # veya mixtral-8x7b-32768
)

print(chat_completion.choices[0].message.content)
```

### Mevcut Modeller

```python
# Llama 3
"llama3-70b-8192"   # En güçlü
"llama3-8b-8192"    # Hızlı

# Mixtral
"mixtral-8x7b-32768"

# Gemma
"gemma-7b-it"
```

---

## 🔮 Cohere (Deneme Ücretsiz)

### Özellikler
- ✅ İlk ay ücretsiz (5K requests)
- ✅ Production trial
- ✅ Özel embedding models
- ⚠️ Sonra ücretli

### Hızlı Kurulum

```bash
# 1. API Key al
# https://dashboard.cohere.com/api-keys

# 2. Kur
pip install cohere

# 3. .env oluştur
echo "COHERE_API_KEY=..." > .env
```

### Kullanım

```python
import cohere
import os
from dotenv import load_dotenv

load_dotenv()

co = cohere.Client(os.getenv('COHERE_API_KEY'))

response = co.generate(
    prompt="Python nedir?",
    max_tokens=200,
    temperature=0.7
)

print(response.generations[0].text)
```

---

## 🤖 OpenAI (Ücretli - $5 Credit ile Başlangıç)

### Özellikler
- ❌ Ücretsiz tier yok
- ✅ Yeni hesaplara $5 credit
- ✅ En popüler
- ✅ GPT-4, GPT-3.5-turbo
- ⚠️ Credit bitince ücretli

### Fiyatlar

```
GPT-3.5-turbo:  $0.0005/1K input,  $0.0015/1K output
GPT-4-turbo:    $0.01/1K input,    $0.03/1K output
GPT-4o:         $0.005/1K input,   $0.015/1K output
```

### $5 Credit ile Ne Kadar?

```
GPT-3.5-turbo: ~2,500 requests (ortalama)
GPT-4-turbo:   ~200 requests (ortalama)
```

### Kullanım

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Python nedir?"}]
)

print(response.choices[0].message.content)
```

**Detaylar**: `PYTHON_OPENAI_SETUP.md`

---

## 💬 Anthropic Claude (Ücretli - $5 Credit ile Başlangıç)

### Özellikler
- ❌ Ücretsiz tier yok
- ✅ Yeni hesaplara $5 credit
- ✅ En iyi reasoning
- ✅ 200K context window
- ⚠️ Credit bitince ücretli

### Fiyatlar

```
Claude 3 Haiku:   $0.25/1M input,  $1.25/1M output
Claude 3 Sonnet:  $3/1M input,     $15/1M output
Claude 3 Opus:    $15/1M input,    $75/1M output
```

### Kullanım

```python
import anthropic
import os

client = anthropic.Anthropic(
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Python nedir?"}
    ]
)

print(message.content[0].text)
```

---

## 🦙 Meta Llama (Açık Kaynak - Kendi Sunucunuzda)

### Özellikler
- ✅ **Tamamen ücretsiz** (açık kaynak)
- ✅ Sınırsız kullanım
- ✅ Llama 3, 3.1, 3.2
- ⚠️ Kendi sunucunuzda çalıştırmanız gerekir

### Option 1: Ollama (Önerilen - En Kolay)

```bash
# 1. Ollama kur
# Linux/macOS:
curl -fsSL https://ollama.com/install.sh | sh

# Windows:
# https://ollama.com/download/windows

# 2. Model indir ve çalıştır
ollama run llama3

# 3. API kullan (localhost:11434)
```

**Python ile:**

```python
import requests

response = requests.post('http://localhost:11434/api/generate', 
    json={
        "model": "llama3",
        "prompt": "Python nedir?",
        "stream": False
    }
)

print(response.json()['response'])
```

### Option 2: Transformers (Hugging Face)

```bash
pip install transformers torch
```

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Generate
inputs = tokenizer("Python nedir?", return_tensors="pt")
outputs = model.generate(**inputs, max_length=100)
print(tokenizer.decode(outputs[0]))
```

⚠️ **Not**: GPU gerektirir (büyük modeller için)

### Llama Modelleri

```
llama3:8b     - 8B parametreli (4-8GB RAM)
llama3:70b    - 70B parametreli (40+ GB RAM)
llama3.1      - En yeni versiyon
llama3.2      - Vision support
```

---

## 🌪️ Mistral (Kısmen Ücretsiz)

### Özellikler
- ⚠️ Bazı modeller ücretsiz
- ✅ Mistral 7B açık kaynak
- ⚠️ API çoğunlukla ücretli

### Açık Kaynak Modeller

```bash
# Ollama ile
ollama run mistral

# Hugging Face ile
pip install transformers
```

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-v0.1")
tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-v0.1")
```

---

## 🎯 Unified Kullanım (Tüm API'leri Tek Arayüzle)

### Unified AI Client Oluşturma

**`unified_ai.py`:**

```python
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# AI Libraries
import google.generativeai as genai
from openai import OpenAI
import anthropic
from groq import Groq
import requests

load_dotenv()

class UnifiedAI:
    """Tüm AI API'lerini tek arayüzle kullan"""
    
    def __init__(self):
        # API Keys
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        self.groq_key = os.getenv('GROQ_API_KEY')
        self.hf_key = os.getenv('HUGGINGFACE_API_KEY')
        
        # Initialize clients
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini = genai.GenerativeModel('gemini-pro')
        
        if self.openai_key:
            self.openai = OpenAI(api_key=self.openai_key)
        
        if self.anthropic_key:
            self.claude = anthropic.Anthropic(api_key=self.anthropic_key)
        
        if self.groq_key:
            self.groq = Groq(api_key=self.groq_key)
    
    def generate(
        self, 
        prompt: str, 
        provider: str = "gemini",
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Unified generate method
        
        Args:
            prompt: User prompt
            provider: 'gemini', 'openai', 'claude', 'groq', 'huggingface'
            model: Specific model (optional)
            **kwargs: Additional parameters
            
        Returns:
            Generated text
        """
        
        if provider == "gemini":
            return self._generate_gemini(prompt, **kwargs)
        elif provider == "openai":
            return self._generate_openai(prompt, model or "gpt-3.5-turbo", **kwargs)
        elif provider == "claude":
            return self._generate_claude(prompt, model or "claude-3-sonnet-20240229", **kwargs)
        elif provider == "groq":
            return self._generate_groq(prompt, model or "llama3-70b-8192", **kwargs)
        elif provider == "huggingface":
            return self._generate_huggingface(prompt, model or "gpt2", **kwargs)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    def _generate_gemini(self, prompt: str, **kwargs) -> str:
        """Gemini generation"""
        response = self.gemini.generate_content(prompt)
        return response.text
    
    def _generate_openai(self, prompt: str, model: str, **kwargs) -> str:
        """OpenAI generation"""
        response = self.openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            **kwargs
        )
        return response.choices[0].message.content
    
    def _generate_claude(self, prompt: str, model: str, **kwargs) -> str:
        """Claude generation"""
        message = self.claude.messages.create(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
            **kwargs
        )
        return message.content[0].text
    
    def _generate_groq(self, prompt: str, model: str, **kwargs) -> str:
        """Groq generation"""
        chat_completion = self.groq.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
            **kwargs
        )
        return chat_completion.choices[0].message.content
    
    def _generate_huggingface(self, prompt: str, model: str, **kwargs) -> str:
        """Hugging Face generation"""
        API_URL = f"https://api-inference.huggingface.co/models/{model}"
        headers = {"Authorization": f"Bearer {self.hf_key}"}
        
        response = requests.post(
            API_URL, 
            headers=headers, 
            json={"inputs": prompt, **kwargs}
        )
        
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            return result[0].get('generated_text', str(result))
        return str(result)

# Kullanım
if __name__ == "__main__":
    ai = UnifiedAI()
    
    prompt = "Python nedir? Kısaca açıkla."
    
    # Gemini (ücretsiz)
    print("🌟 Gemini:", ai.generate(prompt, provider="gemini"))
    
    # Groq (ücretsiz)
    print("⚡ Groq:", ai.generate(prompt, provider="groq"))
    
    # OpenAI (ücretli)
    # print("🤖 OpenAI:", ai.generate(prompt, provider="openai"))
    
    # Claude (ücretli)
    # print("💬 Claude:", ai.generate(prompt, provider="claude"))
```

---

## 💰 Maliyet Karşılaştırması

### Ücretsiz Seçenekler (Sınırsıza Yakın)

| Servis | Aylık Kullanım | Limit | Maliyet |
|--------|----------------|-------|---------|
| **Gemini** | 1,500 req/gün | 45K/ay | $0 |
| **Groq** | 14,400 req/gün | 432K/ay | $0 |
| **Hugging Face** | Değişken | Rate limit | $0 |
| **Llama (Ollama)** | Sınırsız | - | $0 (elektrik) |

### Ücretli Seçenekler (1M token için)

| Servis | Input | Output | Toplam |
|--------|-------|--------|--------|
| **OpenAI GPT-3.5** | $0.50 | $1.50 | $2.00 |
| **OpenAI GPT-4** | $10.00 | $30.00 | $40.00 |
| **Claude Haiku** | $0.25 | $1.25 | $1.50 |
| **Claude Sonnet** | $3.00 | $15.00 | $18.00 |

---

## 🎯 Hangi AI'yi Seçmeliyim?

### Senaryolara Göre Öneriler:

#### 🎓 Öğrenme / Deneme
**Önerilen**: Gemini + Groq
- ✅ Tamamen ücretsiz
- ✅ Cömert limitler
- ✅ Hızlı yanıtlar

#### 💼 Küçük Proje / Startup
**Önerilen**: Gemini (ana) + Ollama (backup)
- ✅ Ücretsiz başlangıç
- ✅ Ölçeklenebilir
- ✅ Maliyet kontrolü

#### 🏢 Production / Kurumsal
**Önerilen**: OpenAI GPT-4 / Claude 3
- ✅ En iyi kalite
- ✅ Güvenilirlik
- ✅ Support
- ⚠️ Ücretli

#### 🔬 Araştırma / Deney
**Önerilen**: Hugging Face + Llama
- ✅ Binlerce model
- ✅ Açık kaynak
- ✅ Özelleştirilebilir

---

## 📚 Detaylı Dokümantasyon

- **Gemini**: `GEMINI_PYTHON_SETUP.md`
- **OpenAI**: `PYTHON_OPENAI_SETUP.md`
- **Tüm API'ler**: Bu dosya

---

## 🔗 Kaynaklar

### API Keys:
- **Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys
- **Claude**: https://console.anthropic.com/
- **Groq**: https://console.groq.com/keys
- **Hugging Face**: https://huggingface.co/settings/tokens
- **Cohere**: https://dashboard.cohere.com/api-keys

### Dokümantasyon:
- **Gemini**: https://ai.google.dev/docs
- **OpenAI**: https://platform.openai.com/docs
- **Claude**: https://docs.anthropic.com/
- **Groq**: https://console.groq.com/docs
- **Hugging Face**: https://huggingface.co/docs
- **Ollama**: https://ollama.com/

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Production Ready
