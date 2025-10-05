# 🐍 Python OpenAI ChatGPT API Examples

Bu klasör, Python ile OpenAI ChatGPT API kullanımı için örnek scriptleri içerir.

## 🚀 Hızlı Başlangıç

### 1. Kurulum (Otomatik)

```bash
# Setup script'ini çalıştır (Linux/macOS)
chmod +x setup.sh
./setup.sh
```

### 2. Kurulum (Manuel)

```bash
# Virtual environment oluştur
python3 -m venv venv

# Aktifleştir
source venv/bin/activate  # Linux/macOS
# veya
venv\Scripts\activate  # Windows

# Paketleri kur
pip install -r requirements.txt

# .env dosyası oluştur
cp .env.example .env
```

### 3. API Key Yapılandırması

```bash
# .env dosyasını düzenle
nano .env

# OPENAI_API_KEY değerini gerçek key'inle değiştir
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**API Key almak için**: https://platform.openai.com/api-keys

## 📁 Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `setup.sh` | Otomatik kurulum scripti |
| `basic_example.py` | Basit API kullanımı |
| `interactive_chat.py` | İnteraktif konsol chatbot |
| `requirements.txt` | Python paket gereksinimleri |
| `.env.example` | Environment variables örneği |

## 🎯 Örnekleri Çalıştırma

### Basic Example
```bash
python basic_example.py
```

Çıktı:
```
==================================================
🤖 OpenAI ChatGPT API - Basit Örnek
==================================================

✅ API key bulundu: sk-abc123...xyz4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Soru 1: Python nedir? Kısaca açıkla.

🤖 Yanıt:
Python, yüksek seviyeli, yorumlamalı bir programlama dilidir...

📊 Token kullanımı: 125 tokens
   (Prompt: 25, Completion: 100)
```

### Interactive Chat
```bash
python interactive_chat.py
```

Çıktı:
```
🤖 OpenAI ChatGPT - Interactive Console

Komutlar:
  /help    - Yardım
  /clear   - Conversation history'yi temizle
  /quit    - Çıkış

Sen: Merhaba!
🤖 Bot: Merhaba! Size nasıl yardımcı olabilirim?
   [Tokens: 30, Total: 30]

Sen: Python nedir?
🤖 Bot: Python, yüksek seviyeli...
   [Tokens: 95, Total: 125]

Sen: /quit
👋 Görüşmek üzere!
📊 Toplam token kullanımı: 125
```

## 🔧 Komutlar (Interactive Chat)

- `/help` - Yardım mesajını göster
- `/clear` - Conversation history'yi temizle
- `/history` - Mesaj sayısını göster
- `/quit` - Çıkış

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için ana klasördeki `PYTHON_OPENAI_SETUP.md` dosyasına bakın:
- Gelişmiş örnekler
- Error handling
- Best practices
- Function calling
- Async/await kullanımı
- Token management

## 🐛 Sorun Giderme

### "ModuleNotFoundError: No module named 'openai'"
```bash
pip install -r requirements.txt
```

### "Invalid API key"
```bash
# API key'inizi kontrol edin
cat .env | grep OPENAI_API_KEY

# Doğru format: sk-... (48+ karakter)
```

### "Rate limit exceeded"
```bash
# Biraz bekleyin ve tekrar deneyin
# Veya daha yavaş istek gönderin
```

## 💰 Maliyet

**Tahmini maliyetler** (GPT-3.5-turbo):
- Prompt: $0.0005 / 1K tokens
- Completion: $0.0015 / 1K tokens

**Örnek**:
- 1000 token prompt + 1000 token completion = ~$0.002
- Günlük 100 istek (ortalama 2K token) = ~$0.20

## 📖 Kaynaklar

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Python Client**: https://github.com/openai/openai-python
- **Pricing**: https://openai.com/pricing
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits

## 🤝 Katkıda Bulunma

Öneri ve geliştirmeler için issue açabilirsiniz!

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05
