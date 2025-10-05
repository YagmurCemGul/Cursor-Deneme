# 🌟 Google Gemini Python API Examples

Bu klasör, Python ile Google Gemini API kullanımı için örnek scriptleri içerir.

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

# GEMINI_API_KEY değerini gerçek key'inle değiştir
GEMINI_API_KEY=AIzaYour-actual-api-key-here
```

**API Key almak için**: https://makersuite.google.com/app/apikey

## 📁 Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `setup.sh` | Otomatik kurulum scripti |
| `basic_gemini.py` | Basit API kullanımı |
| `interactive_gemini.py` | İnteraktif konsol chatbot |
| `gemini_streaming.py` | Streaming responses |
| `requirements.txt` | Python paket gereksinimleri |
| `.env.example` | Environment variables örneği |

## 🎯 Örnekleri Çalıştırma

### Basic Example
```bash
python basic_gemini.py
```

Çıktı:
```
==================================================
🌟 Google Gemini API - Basit Örnek
==================================================

✅ API key bulundu: AIza123...xyz4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Soru 1: Python nedir? Kısaca açıkla.

🌟 Gemini:
Python, yüksek seviyeli, yorumlamalı bir programlama dilidir...
```

### Interactive Chat
```bash
python interactive_gemini.py
```

Çıktı:
```
🌟 Google Gemini - Interactive Chat Console

Komutlar:
  /help    - Yardım
  /clear   - Conversation history'yi temizle
  /quit    - Çıkış

Sen: Merhaba!
🌟 Gemini: Merhaba! Size nasıl yardımcı olabilirim?

Sen: Python nedir?
🌟 Gemini: Python, yüksek seviyeli...

Sen: /quit
👋 Görüşmek üzere!
```

### Streaming Example
```bash
python gemini_streaming.py
```

Real-time olarak yanıtları görürsünüz (kelime kelime).

## 🔧 Komutlar (Interactive Chat)

- `/help` - Yardım mesajını göster
- `/clear` - Conversation history'yi temizle
- `/history` - Conversation history'yi göster
- `/count` - Mesaj sayısını göster
- `/quit` - Çıkış

## 🔑 Environment Variables

Gemini API, iki farklı environment variable'ı destekler:

```bash
# Önerilen
export GEMINI_API_KEY="AIzaYour-key"

# Alternatif (öncelikli)
export GOOGLE_API_KEY="AIzaYour-key"
```

**⚠️ Önemli**: Her ikisi de ayarlanırsa `GOOGLE_API_KEY` öncelikli olur!

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için ana klasördeki `GEMINI_PYTHON_SETUP.md` dosyasına bakın:
- Environment variables ayarlama (Linux/macOS/Windows)
- Vision API kullanımı (resim analizi)
- Safety settings
- Generation configuration
- Best practices
- Troubleshooting

## 🐛 Sorun Giderme

### "ModuleNotFoundError: No module named 'google.generativeai'"
```bash
pip install -r requirements.txt
```

### "Permission denied" / API key error
```bash
# API key'inizi kontrol edin
cat .env | grep GEMINI_API_KEY

# Doğru format: AIza... (39 karakter)
```

### "ResourceExhausted" / Rate limit
```bash
# Biraz bekleyin ve tekrar deneyin
# Free tier: 60 requests/minute
```

## 💰 Maliyet

**Gemini Pro (Free Tier)**:
- 60 requests/minute
- Ücretsiz (belirli limitler dahilinde)

**Gemini Pro (Paid)**:
- Daha yüksek quota
- Detaylar: https://ai.google.dev/pricing

## 📖 Kaynaklar

- **Google AI Docs**: https://ai.google.dev/docs
- **Python SDK**: https://github.com/google/generative-ai-python
- **API Keys**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing

## 🆚 OpenAI vs Gemini

| Özellik | OpenAI | Gemini |
|---------|--------|--------|
| Free tier | ❌ Yok | ✅ Var (60 req/min) |
| Vision | gpt-4-vision | gemini-pro-vision |
| Context | 128K tokens | 30K-1M tokens |
| Streaming | ✅ | ✅ |

## 🤝 Katkıda Bulunma

Öneri ve geliştirmeler için issue açabilirsiniz!

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05
