# ⚡ Python OpenAI API - Hızlı Başlangıç

## 🎯 5 Dakikada Başla

### Adım 1: Python Kurulumu (2 dakika)

```bash
# Python versiyonunu kontrol et
python3 --version

# Eğer Python 3.7+ yoksa:
# Linux: sudo apt install python3 python3-pip
# macOS: brew install python3
# Windows: https://www.python.org/downloads/
```

### Adım 2: Proje Kurulumu (2 dakika)

```bash
# Örnek klasörüne git
cd python-examples

# Otomatik kurulum (Linux/macOS)
./setup.sh

# Manuel kurulum (Windows veya sorun varsa)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### Adım 3: API Key Ekle (1 dakika)

```bash
# .env dosyasını düzenle
nano .env  # veya herhangi bir text editör

# OPENAI_API_KEY değerini değiştir:
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**API Key nereden alınır?**
1. https://platform.openai.com/api-keys
2. Giriş yap / Hesap aç
3. "Create new secret key"
4. Key'i kopyala ve .env'e yapıştır

### Adım 4: İlk Programı Çalıştır

```bash
python basic_example.py
```

**Çıktı:**
```
🤖 OpenAI ChatGPT API - Basit Örnek
✅ API key bulundu: sk-abc123...xyz4

📝 Soru 1: Python nedir? Kısaca açıkla.
🤖 Yanıt:
Python, yüksek seviyeli bir programlama dilidir...
📊 Token kullanımı: 125 tokens
```

🎉 **Tebrikler! İlk API çağrınız başarılı!**

---

## 💻 Kod Örnekleri

### En Basit Örnek (10 satır)

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Merhaba!"}]
)

print(response.choices[0].message.content)
```

### Conversation History ile (Context)

```python
messages = [
    {"role": "system", "content": "Sen yardımcı bir asistansın."}
]

def chat(user_message):
    messages.append({"role": "user", "content": user_message})
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    reply = response.choices[0].message.content
    messages.append({"role": "assistant", "content": reply})
    
    return reply

# Kullanım
print(chat("Python nedir?"))
print(chat("Nasıl öğrenirim?"))  # Context korunur!
```

### Error Handling ile

```python
def safe_chat(prompt):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            timeout=30
        )
        return response.choices[0].message.content
        
    except RateLimitError:
        return "⚠️ Rate limit aşıldı, biraz bekleyin"
    except APIError as e:
        return f"❌ API hatası: {e}"
    except Exception as e:
        return f"❌ Hata: {e}"
```

### Streaming (Real-time output)

```python
stream = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Uzun bir hikaye yaz"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

---

## 🔧 Yaygın Hatalar ve Çözümleri

### ❌ "Invalid API key"
```python
# Çözüm: API key'i kontrol et
import os
print(os.getenv('OPENAI_API_KEY'))  # None olmamalı

# .env dosyasını kontrol et
# Doğru format: sk-... (48+ karakter)
```

### ❌ "ModuleNotFoundError: No module named 'openai'"
```bash
# Virtual environment aktif mi?
which python  # venv içinde olmalı

# Paketleri tekrar kur
pip install -r requirements.txt
```

### ❌ "Rate limit exceeded"
```python
# Çözüm: Retry logic ekle
import time

for attempt in range(3):
    try:
        response = client.chat.completions.create(...)
        break
    except RateLimitError:
        if attempt < 2:
            time.sleep(2 ** attempt)  # 1s, 2s, 4s
        else:
            raise
```

---

## 📊 Maliyet Hesaplama

### GPT-3.5-turbo (Önerilen başlangıç)
```python
# Fiyatlar (2024)
prompt_cost = 0.0005 / 1000      # $0.0005 per 1K tokens
completion_cost = 0.0015 / 1000  # $0.0015 per 1K tokens

# Örnek hesaplama
prompt_tokens = 100        # ~400 karakter
completion_tokens = 200    # ~800 karakter

total_cost = (prompt_tokens * prompt_cost) + \
             (completion_tokens * completion_cost)
# = $0.00005 + $0.0003 = $0.00035 (yaklaşık)

# 100 istek = ~$0.035
# 1000 istek = ~$0.35
```

**İpucu**: `gpt-3.5-turbo` ile başlayın, gerekirse `gpt-4-turbo-preview`'e geçin.

---

## 🎓 Sonraki Adımlar

### 1. İnteraktif Chat Dene
```bash
python interactive_chat.py
```

Komutlar:
- `/help` - Yardım
- `/clear` - History temizle
- `/quit` - Çıkış

### 2. Kendi Projen İçin Template

```python
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

class MyChatBot:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.messages = []
        
    def setup_personality(self, personality: str):
        """Bot'un kişiliğini ayarla"""
        self.messages = [
            {"role": "system", "content": personality}
        ]
    
    def chat(self, user_input: str) -> str:
        """Kullanıcı ile chat yap"""
        self.messages.append({"role": "user", "content": user_input})
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=self.messages,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": reply})
        
        return reply

# Kullanım
bot = MyChatBot()
bot.setup_personality("Sen komik bir arkadaşsın ve espri yapmayı seversin.")
print(bot.chat("Merhaba!"))
```

### 3. Gelişmiş Özellikler

Detaylı dokümantasyon için:
- **PYTHON_OPENAI_SETUP.md** - Kapsamlı guide
- **Advanced examples** - Function calling, async, vb.

---

## 📚 Kaynaklar

| Kaynak | Link |
|--------|------|
| OpenAI Docs | https://platform.openai.com/docs |
| Python Client | https://github.com/openai/openai-python |
| API Keys | https://platform.openai.com/api-keys |
| Pricing | https://openai.com/pricing |
| Rate Limits | https://platform.openai.com/docs/guides/rate-limits |

---

## ✅ Checklist

- [ ] Python 3.7+ kurulu
- [ ] Virtual environment oluşturuldu
- [ ] Paketler kurulu (`pip install -r requirements.txt`)
- [ ] .env dosyası oluşturuldu
- [ ] API key eklendi
- [ ] basic_example.py çalıştı ✅
- [ ] interactive_chat.py denendi ✅
- [ ] Kendi projem için kod yazdım 🚀

---

**İyi kodlamalar! 🐍✨**
