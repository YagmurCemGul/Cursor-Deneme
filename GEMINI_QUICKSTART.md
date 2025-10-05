# ⚡ Google Gemini API - Hızlı Başlangıç (5 Dakika)

## 🎯 3 Adımda Başla

### Adım 1: API Key Al (2 dakika)

1. [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) git
2. Google hesabınla giriş yap
3. **"Create API Key"** tıkla
4. Key'i kopyala (örn: `AIzaYour...`)

**Format**: `AIza...` ile başlar, 39 karakter

---

### Adım 2: Kurulum (2 dakika)

```bash
# Gemini örnekleri klasörüne git
cd gemini-examples

# Otomatik kurulum (Linux/macOS)
./setup.sh

# Manuel (Windows veya sorun varsa)
python -m venv venv
venv\Scripts\activate  # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
```

---

### Adım 3: API Key Ekle ve Çalıştır (1 dakika)

```bash
# .env dosyasını düzenle
nano .env  # Windows: notepad .env

# Bu satırı bul:
GEMINI_API_KEY=your-api-key-here

# Kendi key'inle değiştir:
GEMINI_API_KEY=AIzaYour...

# Kaydet ve çık

# İlk programı çalıştır
python basic_gemini.py
```

**Çıktı görüyorsan 🎉 Başardın!**

---

## 💻 En Basit Kod (10 satır)

```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Merhaba!")
print(response.text)
```

---

## 🔑 Environment Variable Ayarlama

### 🐧 Linux/macOS (Hızlı)

```bash
# Geçici (bu terminal için)
export GEMINI_API_KEY="AIzaYour..."

# Kalıcı
echo 'export GEMINI_API_KEY="AIzaYour..."' >> ~/.bashrc
source ~/.bashrc
```

### 🪟 Windows (Hızlı)

**PowerShell:**
```powershell
# Geçici
$env:GEMINI_API_KEY="AIzaYour..."

# Kalıcı
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaYour...', 'User')
```

**GUI:**
1. Windows tuşu → "environment" ara
2. "Edit the system environment variables"
3. Environment Variables → New
4. Name: `GEMINI_API_KEY`, Value: `AIzaYour...`

---

## 🎨 Örnek Kullanımlar

### Chat (Conversation History)

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Chat session başlat
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])

# İlk mesaj
response1 = chat.send_message("Python nedir?")
print(response1.text)

# Takip sorusu (context korunur!)
response2 = chat.send_message("Nasıl öğrenirim?")
print(response2.text)
```

---

### Streaming (Real-time)

```python
model = genai.GenerativeModel('gemini-pro')

response = model.generate_content(
    "Uzun bir hikaye yaz",
    stream=True
)

for chunk in response:
    print(chunk.text, end="", flush=True)
```

---

## 🐛 Yaygın Hatalar

### ❌ "ModuleNotFoundError"
```bash
pip install google-generativeai
```

### ❌ "Permission denied" / API key error
```bash
# Kontrol et
echo $GEMINI_API_KEY  # Linux/macOS
echo %GEMINI_API_KEY%  # Windows cmd
echo $env:GEMINI_API_KEY  # Windows PowerShell

# Format kontrolü: AIza ile başlamalı, 39 karakter
```

### ❌ "ResourceExhausted"
```
Rate limit aşıldı. 1 dakika bekle.
Free tier: 60 requests/minute
```

---

## 💡 İpuçları

### 1. Her İki Variable'ı da Ayarlama

```bash
# ⚠️ GOOGLE_API_KEY öncelikli!
export GEMINI_API_KEY="AIzaKey1..."
export GOOGLE_API_KEY="AIzaKey2..."  # Bu kullanılır!

# Önerilen: Sadece birini ayarla
export GEMINI_API_KEY="AIzaYour..."
```

---

### 2. .gitignore Unutma

```bash
echo ".env" >> .gitignore
echo "venv/" >> .gitignore
```

---

### 3. API Key Test Et

```python
import os

key = os.getenv('GEMINI_API_KEY')
if key:
    print(f"✅ Key bulundu: {key[:10]}...{key[-4:]}")
else:
    print("❌ Key bulunamadı!")
```

---

## 📊 Maliyet

### Free Tier:
- ✅ 60 requests/minute
- ✅ Ücretsiz
- ✅ Yeterli test için

### Paid:
- 🚀 Daha yüksek quota
- 💰 Detaylar: [ai.google.dev/pricing](https://ai.google.dev/pricing)

---

## 🆚 OpenAI vs Gemini

| Özellik | OpenAI | Gemini |
|---------|--------|--------|
| Free tier | ❌ | ✅ (60 req/min) |
| Key format | sk-... | AIza... |
| Context | 128K | 30K-1M |
| Vision | gpt-4-vision | gemini-pro-vision |

---

## 🎓 Sonraki Adımlar

1. **Interactive chat dene**:
   ```bash
   python interactive_gemini.py
   ```

2. **Streaming test et**:
   ```bash
   python gemini_streaming.py
   ```

3. **Detaylı dokümantasyon oku**:
   - `GEMINI_PYTHON_SETUP.md` - Kapsamlı rehber
   - `GEMINI_ENV_VARIABLES_GUIDE.md` - Env variables detay
   - `gemini-examples/README.md` - Örnekler

---

## 📚 Kaynaklar

- **Docs**: https://ai.google.dev/docs
- **API Keys**: https://makersuite.google.com/app/apikey
- **Python SDK**: https://github.com/google/generative-ai-python
- **Pricing**: https://ai.google.dev/pricing

---

## ✅ Checklist

- [ ] API key aldım
- [ ] Environment variable ayarladım
- [ ] Virtual environment oluşturdum
- [ ] Paketleri kurdum
- [ ] basic_gemini.py çalıştırdım ✅
- [ ] interactive_gemini.py denedim ✅
- [ ] .env dosyasını .gitignore'a ekledim ✅

---

**Başarılar! 🌟**
