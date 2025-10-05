# 🌟 Google Gemini API - Python Development Environment Setup

## 📋 İçindekiler
1. [Gereksinimler](#gereksinimler)
2. [Kurulum Adımları](#kurulum-adımları)
3. [API Key Yapılandırması](#api-key-yapılandırması)
4. [Temel Kullanım](#temel-kullanım)
5. [Gelişmiş Özellikler](#gelişmiş-özellikler)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Gereksinimler

### Sistem Gereksinimleri
- **Python**: 3.9 veya üzeri
- **pip**: Python package manager
- **Google AI Studio API Key**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### İşletim Sistemi
- ✅ Linux / macOS
- ✅ Windows 10/11
- ✅ WSL (Windows Subsystem for Linux)

---

## 📦 Kurulum Adımları

### 1. Python Kurulumu Kontrolü

```bash
# Python versiyonunu kontrol et
python --version
# veya
python3 --version

# pip versiyonunu kontrol et
pip --version
```

**Beklenen Çıktı:**
```
Python 3.11.0
pip 23.0.1
```

### 2. Virtual Environment Oluşturma

```bash
# Proje klasörü oluştur
mkdir gemini-api-project
cd gemini-api-project

# Virtual environment oluştur
python3 -m venv venv

# Virtual environment'ı aktifleştir
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# Aktif olduğunu göreceksiniz:
# (venv) user@computer:~/gemini-api-project$
```

---

### 3. Google Gemini Python Library Kurulumu

```bash
# Google Gemini resmi kütüphanesini kur
pip install google-generativeai

# Ek yararlı kütüphaneler
pip install python-dotenv  # .env dosyası desteği
pip install pillow          # Image desteği (Gemini Vision için)
pip install requests        # HTTP istekleri
pip install rich            # Terminal output güzelleştirme

# Tüm bağımlılıkları requirements.txt'e kaydet
pip freeze > requirements.txt
```

**requirements.txt örneği:**
```txt
google-generativeai==0.3.2
python-dotenv==1.0.0
pillow==10.1.0
requests==2.31.0
rich==13.7.0
```

---

## 🔑 API Key Yapılandırması

### 1. Google AI Studio'dan API Key Alma

1. [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) adresine git
2. Google hesabınla giriş yap
3. **"Create API Key"** butonuna tıkla
4. Key'i kopyala (güvenli bir yere kaydet!)

### 2. Environment Variables ile Yapılandırma (ÖNERİLEN)

Google Gemini API, iki farklı environment variable'ı destekler:
- `GEMINI_API_KEY` (Önerilen)
- `GOOGLE_API_KEY` (Alternatif)

**⚠️ ÖNEMLİ**: Her ikisi de ayarlanırsa `GOOGLE_API_KEY` öncelikli olur!

#### Option A: .env Dosyası (Önerilen)

```bash
# Proje klasöründe .env dosyası oluştur
touch .env

# .env dosyasını düzenle
nano .env
```

**.env içeriği:**
```env
# Google Gemini API Configuration
# Sadece birini ayarlayın (GOOGLE_API_KEY öncelikli)
GEMINI_API_KEY=AIzaYourActualAPIKeyHere

# veya
# GOOGLE_API_KEY=AIzaYourActualAPIKeyHere

# Model Configuration
GEMINI_MODEL=gemini-pro
GEMINI_VISION_MODEL=gemini-pro-vision
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048

# Application Settings
DEBUG=True
LOG_LEVEL=INFO
```

**⚠️ GÜVENLİK UYARISI:**
```bash
# .env dosyasını git'e ekleme!
echo ".env" >> .gitignore
echo "venv/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pyc" >> .gitignore
```

#### Option B: System Environment Variables

**🐧 Linux/macOS:**

**.bashrc veya .zshrc:**
```bash
# Sadece birini kullanın
export GEMINI_API_KEY="AIzaYourActualAPIKeyHere"

# veya
# export GOOGLE_API_KEY="AIzaYourActualAPIKeyHere"

# Dosyayı yükle
source ~/.bashrc  # veya ~/.zshrc
```

**Geçici olarak (sadece mevcut terminal session için):**
```bash
export GEMINI_API_KEY="AIzaYourActualAPIKeyHere"
```

**🪟 Windows:**

**PowerShell (Geçici):**
```powershell
$env:GEMINI_API_KEY="AIzaYourActualAPIKeyHere"
```

**PowerShell (Kalıcı - User Level):**
```powershell
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaYourActualAPIKeyHere', 'User')
```

**PowerShell (Kalıcı - System Level - Admin gerekir):**
```powershell
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaYourActualAPIKeyHere', 'Machine')
```

**Command Prompt (cmd):**
```cmd
# Geçici
set GEMINI_API_KEY=AIzaYourActualAPIKeyHere

# Kalıcı
setx GEMINI_API_KEY "AIzaYourActualAPIKeyHere"
```

**Windows System Settings:**
1. Windows tuşu + "environment" ara
2. "Edit the system environment variables" seç
3. "Environment Variables" butonuna tıkla
4. "User variables" altında "New" butonuna tıkla
5. Variable name: `GEMINI_API_KEY`
6. Variable value: `AIzaYourActualAPIKeyHere`
7. OK'a tıkla

#### Option C: Doğrudan Kod İçinde (GÜVENLİ DEĞİL!)

```python
import google.generativeai as genai

# ❌ YAPMAYIN: Hardcoded API key
genai.configure(api_key="AIzaYourActualAPIKeyHere")

# ✅ YAPILACAK: Environment variable
import os
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
```

---

## 🚀 Temel Kullanım

### 1. Basit Text Generation

**`basic_gemini.py`:**
```python
#!/usr/bin/env python3
"""
Basic Google Gemini API Example
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# API key'i yapılandır
# Otomatik olarak GEMINI_API_KEY veya GOOGLE_API_KEY'i kullanır
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_text(prompt: str, model_name: str = "gemini-pro") -> str:
    """
    Basit text generation
    
    Args:
        prompt: Kullanıcı mesajı
        model_name: Gemini model ismi
        
    Returns:
        AI'ın yanıtı
    """
    try:
        # Model'i başlat
        model = genai.GenerativeModel(model_name)
        
        # Generate content
        response = model.generate_content(prompt)
        
        return response.text
        
    except Exception as e:
        return f"Hata: {str(e)}"

# Kullanım
if __name__ == "__main__":
    prompt = "Python ile API kullanımı hakkında kısa bir açıklama yaz."
    result = generate_text(prompt)
    print("Gemini:", result)
```

**Çalıştırma:**
```bash
python basic_gemini.py
```

---

### 2. Chat Conversation (Multi-turn)

**`gemini_chat.py`:**
```python
#!/usr/bin/env python3
"""
Gemini Chat with Conversation History
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class GeminiChat:
    def __init__(self, model_name: str = "gemini-pro"):
        """Initialize Gemini chat"""
        self.model = genai.GenerativeModel(model_name)
        self.chat = self.model.start_chat(history=[])
        
    def send_message(self, message: str) -> str:
        """
        Send a message and get response
        Conversation history is automatically maintained
        """
        try:
            response = self.chat.send_message(message)
            return response.text
        except Exception as e:
            return f"Hata: {str(e)}"
    
    def get_history(self) -> List[Dict]:
        """Get conversation history"""
        return [
            {
                "role": msg.role,
                "text": msg.parts[0].text
            }
            for msg in self.chat.history
        ]
    
    def clear_history(self):
        """Clear conversation history"""
        self.chat = self.model.start_chat(history=[])

# Kullanım örneği
if __name__ == "__main__":
    chat = GeminiChat()
    
    # İlk mesaj
    print("User: Python nedir?")
    response1 = chat.send_message("Python nedir?")
    print(f"Gemini: {response1}\n")
    
    # Takip sorusu (context korunur)
    print("User: Peki nasıl öğrenebilirim?")
    response2 = chat.send_message("Peki nasıl öğrenebilirim?")
    print(f"Gemini: {response2}\n")
    
    # History'yi göster
    print("=== Conversation History ===")
    for msg in chat.get_history():
        print(f"{msg['role'].upper()}: {msg['text'][:50]}...")
```

---

### 3. Streaming Responses

**`gemini_stream.py`:**
```python
#!/usr/bin/env python3
"""
Gemini Streaming Responses - Real-time output
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def stream_generate(prompt: str, model_name: str = "gemini-pro"):
    """
    Streaming ile yanıt al (kelime kelime)
    """
    try:
        model = genai.GenerativeModel(model_name)
        
        print("Gemini: ", end="", flush=True)
        
        # Stream=True ile generate
        response = model.generate_content(prompt, stream=True)
        
        for chunk in response:
            print(chunk.text, end="", flush=True)
        
        print()  # Yeni satır
        
    except Exception as e:
        print(f"\nHata: {str(e)}")

# Kullanım
if __name__ == "__main__":
    prompt = "Yapay zeka nedir? Detaylı açıkla."
    stream_generate(prompt)
```

---

### 4. Vision (Image Understanding)

**`gemini_vision.py`:**
```python
#!/usr/bin/env python3
"""
Gemini Vision - Image Understanding
"""

import os
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def analyze_image(image_path: str, prompt: str = "Bu resimde ne görüyorsun?") -> str:
    """
    Resmi analiz et
    
    Args:
        image_path: Resim dosyasının yolu
        prompt: Resim hakkında soru
        
    Returns:
        AI'ın analizi
    """
    try:
        # Vision model'i başlat
        model = genai.GenerativeModel('gemini-pro-vision')
        
        # Resmi yükle
        img = Image.open(image_path)
        
        # Resmi analiz et
        response = model.generate_content([prompt, img])
        
        return response.text
        
    except Exception as e:
        return f"Hata: {str(e)}"

# Kullanım
if __name__ == "__main__":
    # Örnek kullanım
    image_path = "example_image.jpg"
    
    if os.path.exists(image_path):
        result = analyze_image(image_path, "Bu resimde neler var? Detaylı açıkla.")
        print("Gemini Vision:", result)
    else:
        print(f"❌ Resim bulunamadı: {image_path}")
        print("Lütfen 'example_image.jpg' adında bir resim ekleyin.")
```

---

## 🎨 Gelişmiş Özellikler

### 1. Safety Settings (Güvenlik Ayarları)

**`gemini_safety.py`:**
```python
#!/usr/bin/env python3
"""
Gemini with Safety Settings
"""

import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_with_safety(prompt: str) -> str:
    """
    Safety settings ile content generate et
    """
    model = genai.GenerativeModel('gemini-pro')
    
    # Safety settings yapılandır
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
    
    try:
        response = model.generate_content(
            prompt,
            safety_settings=safety_settings
        )
        
        return response.text
        
    except Exception as e:
        return f"Hata (muhtemelen safety block): {str(e)}"

# Kullanım
if __name__ == "__main__":
    prompt = "Güvenli bir içerik oluştur."
    result = generate_with_safety(prompt)
    print(result)
```

---

### 2. Generation Configuration

**`gemini_config.py`:**
```python
#!/usr/bin/env python3
"""
Gemini with Generation Configuration
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_with_config(prompt: str) -> str:
    """
    Custom generation configuration ile generate
    """
    model = genai.GenerativeModel('gemini-pro')
    
    # Generation config
    generation_config = genai.types.GenerationConfig(
        temperature=0.9,           # Yaratıcılık (0.0-1.0)
        top_p=1,                   # Nucleus sampling
        top_k=1,                   # Top-k sampling
        max_output_tokens=2048,    # Max output length
        stop_sequences=['END'],    # Stop sequences
    )
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        return response.text
        
    except Exception as e:
        return f"Hata: {str(e)}"

# Kullanım
if __name__ == "__main__":
    prompt = "Kısa bir hikaye yaz."
    result = generate_with_config(prompt)
    print(result)
```

---

### 3. Retry Logic ve Error Handling

**`advanced_gemini.py`:**
```python
#!/usr/bin/env python3
"""
Advanced Gemini API wrapper with retry logic
"""

import os
import time
from typing import Optional, Dict, Any
import google.generativeai as genai
from google.api_core import exceptions
from dotenv import load_dotenv

load_dotenv()

class AdvancedGemini:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-pro",
        max_retries: int = 3,
        retry_delay: float = 1.0
    ):
        api_key = api_key or os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel(model_name)
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
    def generate_with_retry(
        self,
        prompt: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Retry logic ile content generation
        
        Returns:
            {
                'success': bool,
                'text': str,
                'error': Optional[str]
            }
        """
        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(prompt, **kwargs)
                
                return {
                    'success': True,
                    'text': response.text,
                    'error': None
                }
                
            except exceptions.ResourceExhausted as e:
                # Rate limit / Quota exceeded
                wait_time = self.retry_delay * (2 ** attempt)
                print(f"⚠️  Rate limit! Bekleniyor {wait_time}s...")
                time.sleep(wait_time)
                
                if attempt == self.max_retries - 1:
                    return {
                        'success': False,
                        'text': None,
                        'error': f"Rate limit exceeded after {self.max_retries} attempts"
                    }
                    
            except exceptions.InvalidArgument as e:
                # Invalid request
                return {
                    'success': False,
                    'text': None,
                    'error': f"Invalid argument: {str(e)}"
                }
                
            except exceptions.PermissionDenied as e:
                # API key error
                return {
                    'success': False,
                    'text': None,
                    'error': f"Permission denied (check API key): {str(e)}"
                }
                
            except Exception as e:
                # Other errors
                if attempt < self.max_retries - 1:
                    print(f"⚠️  Error, tekrar deneniyor... ({attempt + 1}/{self.max_retries})")
                    time.sleep(self.retry_delay)
                else:
                    return {
                        'success': False,
                        'text': None,
                        'error': f"Error: {str(e)}"
                    }
        
        return {
            'success': False,
            'text': None,
            'error': 'Max retries exceeded'
        }

# Kullanım
if __name__ == "__main__":
    gemini = AdvancedGemini(max_retries=3)
    
    result = gemini.generate_with_retry(
        "Python ile API kullanımı nasıl yapılır?"
    )
    
    if result['success']:
        print(f"✅ Başarılı!")
        print(f"Yanıt: {result['text']}")
    else:
        print(f"❌ Hata: {result['error']}")
```

---

## ✅ Best Practices

### 1. Güvenlik

```python
# ✅ İYİ: Environment variables
import os
api_key = os.getenv('GEMINI_API_KEY')

# ❌ KÖTÜ: Hardcoded API key
api_key = "AIzaYour..."  # Asla yapma!

# ✅ İYİ: .gitignore'a ekle
# .env
# *.pyc
# __pycache__/
```

### 2. Model Selection

```python
# Text-only tasks için
model = genai.GenerativeModel('gemini-pro')

# Image + text için
model = genai.GenerativeModel('gemini-pro-vision')

# Experimental models için
model = genai.GenerativeModel('gemini-1.5-pro-latest')
```

### 3. Rate Limit Management

```python
import time

def rate_limited_generate(prompts: list):
    """Rate limit'e dikkat ederek generate"""
    results = []
    
    for i, prompt in enumerate(prompts):
        result = model.generate_content(prompt)
        results.append(result.text)
        
        # Her istekten sonra kısa bekle
        if i < len(prompts) - 1:
            time.sleep(1)  # 1 saniye bekle
    
    return results
```

### 4. Error Handling

```python
from google.api_core import exceptions

try:
    response = model.generate_content(prompt)
    print(response.text)
    
except exceptions.ResourceExhausted:
    print("⚠️  Rate limit veya quota aşıldı")
    
except exceptions.InvalidArgument:
    print("❌ Geçersiz istek")
    
except exceptions.PermissionDenied:
    print("❌ API key geçersiz veya yetkisiz")
    
except Exception as e:
    print(f"❌ Bilinmeyen hata: {e}")
```

---

## 🐛 Troubleshooting

### Sık Karşılaşılan Hatalar

#### 1. API Key Error
```python
# Hata: Permission denied

# Çözüm 1: Environment variable kontrolü
import os
print("GEMINI_API_KEY:", os.getenv('GEMINI_API_KEY'))
print("GOOGLE_API_KEY:", os.getenv('GOOGLE_API_KEY'))

# Çözüm 2: API key formatı kontrolü
# Doğru format: AIza... (39 karakter)
```

#### 2. Module Not Found Error
```bash
# Hata: ModuleNotFoundError: No module named 'google.generativeai'

# Çözüm:
pip install google-generativeai
```

#### 3. Rate Limit Error
```python
# Hata: google.api_core.exceptions.ResourceExhausted: 429 Quota exceeded

# Çözüm: Retry logic ekle veya bekle
import time
time.sleep(60)  # 1 dakika bekle
```

#### 4. Safety Block
```python
# Hata: Response blocked due to safety

# Çözüm: Safety settings'i ayarla
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
}
```

---

## 📊 Model Karşılaştırması

| Model | Kullanım | Input | Max Tokens |
|-------|----------|-------|------------|
| **gemini-pro** | Text-only | Text | 30,720 |
| **gemini-pro-vision** | Multimodal | Text + Image | 12,288 |
| **gemini-1.5-pro-latest** | Advanced | Text + Multiple images | 1,000,000 |

---

## 💰 Fiyatlandırma

### Gemini Pro (Free Tier)
- **60 requests per minute**
- **Ücretsiz** (belirli limitler dahilinde)

### Gemini Pro (Paid)
- Daha yüksek quota
- Detaylar: [ai.google.dev/pricing](https://ai.google.dev/pricing)

---

## 📚 Ek Kaynaklar

- **Google AI Docs**: https://ai.google.dev/docs
- **Python SDK**: https://github.com/google/generative-ai-python
- **API Keys**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Safety Settings**: https://ai.google.dev/docs/safety_setting_gemini

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Production Ready
