# 🐍 Python ile ChatGPT API - Development Environment Setup

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
- **Python**: 3.7.1 veya üzeri
- **pip**: Python package manager
- **OpenAI API Key**: [platform.openai.com](https://platform.openai.com/api-keys)

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
# veya
pip3 --version
```

**Beklenen Çıktı:**
```
Python 3.11.0
pip 23.0.1
```

### 2. Python Kurulumu (Eğer yoksa)

#### 🐧 Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### 🍎 macOS
```bash
# Homebrew ile
brew install python3

# veya python.org'dan indir
# https://www.python.org/downloads/macos/
```

#### 🪟 Windows
```powershell
# Microsoft Store'dan Python 3.11 indir
# veya
# https://www.python.org/downloads/windows/

# Kurulum sırasında "Add Python to PATH" seçeneğini işaretle!
```

---

### 3. Virtual Environment Oluşturma

Virtual environment, projenizin bağımlılıklarını izole eder.

```bash
# Proje klasörü oluştur
mkdir chatgpt-api-project
cd chatgpt-api-project

# Virtual environment oluştur
python3 -m venv venv

# Virtual environment'ı aktifleştir
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# Aktif olduğunu göreceksiniz:
# (venv) user@computer:~/chatgpt-api-project$
```

---

### 4. OpenAI Python Library Kurulumu

```bash
# OpenAI resmi kütüphanesini kur
pip install openai

# Ek yararlı kütüphaneler
pip install python-dotenv  # .env dosyası desteği
pip install requests       # HTTP istekleri
pip install rich           # Terminal output güzelleştirme

# Tüm bağımlılıkları requirements.txt'e kaydet
pip freeze > requirements.txt
```

**requirements.txt örneği:**
```txt
openai==1.12.0
python-dotenv==1.0.0
requests==2.31.0
rich==13.7.0
```

---

## 🔑 API Key Yapılandırması

### 1. OpenAI API Key Alma

1. [platform.openai.com](https://platform.openai.com/api-keys) adresine git
2. Giriş yap veya hesap oluştur
3. **"Create new secret key"** butonuna tıkla
4. Key'i kopyala (bir daha göremezsin!)
5. Güvenli bir yere kaydet

### 2. Environment Variables ile Yapılandırma (ÖNERİLEN)

#### Option A: .env Dosyası (Önerilen)

```bash
# Proje klasöründe .env dosyası oluştur
touch .env

# .env dosyasını düzenle
nano .env
```

**.env içeriği:**
```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_ORG_ID=org-your-org-id-here  # Opsiyonel

# Model Configuration
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

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

**Linux/macOS (.bashrc veya .zshrc):**
```bash
export OPENAI_API_KEY="sk-your-actual-api-key-here"
source ~/.bashrc  # veya ~/.zshrc
```

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-your-key', 'User')
```

---

## 🚀 Temel Kullanım

### 1. Basit Chat Completion

**`basic_example.py`:**
```python
#!/usr/bin/env python3
"""
Basic OpenAI ChatGPT API Example
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# OpenAI client'ı başlat
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

def chat_completion(prompt: str, model: str = "gpt-3.5-turbo") -> str:
    """
    Basit chat completion
    
    Args:
        prompt: Kullanıcı mesajı
        model: OpenAI model ismi
        
    Returns:
        AI'ın yanıtı
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Sen yardımcı bir asistansın."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Hata: {str(e)}"

# Kullanım
if __name__ == "__main__":
    prompt = "Python ile API kullanımı hakkında kısa bir açıklama yap."
    result = chat_completion(prompt)
    print(result)
```

**Çalıştırma:**
```bash
python basic_example.py
```

---

### 2. Conversation History ile Chat

**`conversation_example.py`:**
```python
#!/usr/bin/env python3
"""
Conversation History ile ChatGPT API kullanımı
"""

import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class ChatBot:
    def __init__(self, system_prompt: str = "Sen yardımcı bir asistansın."):
        self.messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]
        
    def chat(self, user_message: str, model: str = "gpt-3.5-turbo") -> str:
        """
        Conversation history'yi koruyarak chat yap
        """
        # Kullanıcı mesajını ekle
        self.messages.append({"role": "user", "content": user_message})
        
        try:
            # API çağrısı
            response = client.chat.completions.create(
                model=model,
                messages=self.messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Assistant yanıtını al ve kaydet
            assistant_message = response.choices[0].message.content
            self.messages.append({"role": "assistant", "content": assistant_message})
            
            return assistant_message
            
        except Exception as e:
            return f"Hata: {str(e)}"
    
    def clear_history(self):
        """Conversation history'yi temizle (system prompt hariç)"""
        self.messages = [self.messages[0]]
    
    def get_history(self) -> List[Dict[str, str]]:
        """Conversation history'yi döndür"""
        return self.messages[1:]  # System prompt'u atla

# Kullanım örneği
if __name__ == "__main__":
    bot = ChatBot(system_prompt="Sen Python programlama konusunda uzman bir öğretmensin.")
    
    # İlk soru
    print("User: Python nedir?")
    response1 = bot.chat("Python nedir?")
    print(f"Bot: {response1}\n")
    
    # Takip sorusu (context korunur)
    print("User: Peki nasıl öğrenebilirim?")
    response2 = bot.chat("Peki nasıl öğrenebilirim?")
    print(f"Bot: {response2}\n")
    
    # History'yi göster
    print("=== Conversation History ===")
    for msg in bot.get_history():
        print(f"{msg['role'].upper()}: {msg['content'][:50]}...")
```

---

### 3. Streaming Responses

**`streaming_example.py`:**
```python
#!/usr/bin/env python3
"""
Streaming API responses - Real-time output
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def stream_chat(prompt: str, model: str = "gpt-3.5-turbo"):
    """
    Streaming ile yanıt al (kelime kelime)
    """
    try:
        stream = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            stream=True,  # Streaming aktif!
            temperature=0.7
        )
        
        print("Bot: ", end="", flush=True)
        
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                print(content, end="", flush=True)
        
        print()  # Yeni satır
        
    except Exception as e:
        print(f"\nHata: {str(e)}")

# Kullanım
if __name__ == "__main__":
    prompt = "Yapay zeka nedir? Detaylı açıkla."
    stream_chat(prompt)
```

---

## 🎨 Gelişmiş Özellikler

### 1. Retry Logic ve Error Handling

**`advanced_api.py`:**
```python
#!/usr/bin/env python3
"""
Advanced OpenAI API wrapper with retry logic
"""

import os
import time
from typing import Optional, Dict, Any
from openai import OpenAI, OpenAIError, RateLimitError, APIError
from dotenv import load_dotenv

load_dotenv()

class AdvancedChatGPT:
    def __init__(
        self,
        api_key: Optional[str] = None,
        max_retries: int = 3,
        retry_delay: float = 1.0
    ):
        self.client = OpenAI(api_key=api_key or os.getenv('OPENAI_API_KEY'))
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
    def chat_with_retry(
        self,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Retry logic ile chat completion
        
        Returns:
            {
                'success': bool,
                'content': str,
                'error': Optional[str],
                'usage': dict
            }
        """
        for attempt in range(self.max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    **kwargs
                )
                
                return {
                    'success': True,
                    'content': response.choices[0].message.content,
                    'error': None,
                    'usage': {
                        'prompt_tokens': response.usage.prompt_tokens,
                        'completion_tokens': response.usage.completion_tokens,
                        'total_tokens': response.usage.total_tokens
                    }
                }
                
            except RateLimitError as e:
                # Rate limit - exponential backoff
                wait_time = self.retry_delay * (2 ** attempt)
                print(f"⚠️  Rate limit! Bekleniyor {wait_time}s...")
                time.sleep(wait_time)
                
                if attempt == self.max_retries - 1:
                    return {
                        'success': False,
                        'content': None,
                        'error': f"Rate limit exceeded after {self.max_retries} attempts",
                        'usage': None
                    }
                    
            except APIError as e:
                # API error (503, 500, etc.)
                if attempt < self.max_retries - 1:
                    print(f"⚠️  API error, tekrar deneniyor... ({attempt + 1}/{self.max_retries})")
                    time.sleep(self.retry_delay)
                else:
                    return {
                        'success': False,
                        'content': None,
                        'error': f"API error: {str(e)}",
                        'usage': None
                    }
                    
            except OpenAIError as e:
                # Diğer OpenAI hataları
                return {
                    'success': False,
                    'content': None,
                    'error': f"OpenAI error: {str(e)}",
                    'usage': None
                }
                
            except Exception as e:
                # Beklenmeyen hatalar
                return {
                    'success': False,
                    'content': None,
                    'error': f"Unexpected error: {str(e)}",
                    'usage': None
                }
        
        return {
            'success': False,
            'content': None,
            'error': 'Max retries exceeded',
            'usage': None
        }

# Kullanım
if __name__ == "__main__":
    api = AdvancedChatGPT(max_retries=3)
    
    result = api.chat_with_retry(
        "Python ile API kullanımı nasıl yapılır?",
        temperature=0.7,
        max_tokens=500
    )
    
    if result['success']:
        print(f"✅ Başarılı!")
        print(f"Yanıt: {result['content']}")
        print(f"Token kullanımı: {result['usage']}")
    else:
        print(f"❌ Hata: {result['error']}")
```

---

### 2. Function Calling (Tools)

**`function_calling_example.py`:**
```python
#!/usr/bin/env python3
"""
OpenAI Function Calling örneği
"""

import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Kullanılabilir fonksiyonlar
def get_weather(location: str, unit: str = "celsius") -> dict:
    """Hava durumu bilgisi al (örnek)"""
    # Gerçek uygulamada weather API çağırırsınız
    return {
        "location": location,
        "temperature": 22,
        "unit": unit,
        "condition": "Güneşli"
    }

def calculate(operation: str, a: float, b: float) -> float:
    """Matematiksel işlem yap"""
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        return a / b if b != 0 else "Error: Division by zero"

# Function definitions (OpenAI için)
functions = [
    {
        "name": "get_weather",
        "description": "Belirtilen lokasyon için hava durumu bilgisi al",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "Şehir adı, örn: İstanbul, Ankara"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Sıcaklık birimi"
                }
            },
            "required": ["location"]
        }
    },
    {
        "name": "calculate",
        "description": "İki sayı arasında matematiksel işlem yap",
        "parameters": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "subtract", "multiply", "divide"],
                    "description": "Yapılacak işlem"
                },
                "a": {"type": "number", "description": "İlk sayı"},
                "b": {"type": "number", "description": "İkinci sayı"}
            },
            "required": ["operation", "a", "b"]
        }
    }
]

def chat_with_functions(prompt: str):
    """Function calling ile chat"""
    
    messages = [{"role": "user", "content": prompt}]
    
    # İlk API çağrısı
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=messages,
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    # Function call olup olmadığını kontrol et
    if message.function_call:
        function_name = message.function_call.name
        function_args = json.loads(message.function_call.arguments)
        
        print(f"🔧 Function çağrılıyor: {function_name}")
        print(f"   Arguments: {function_args}")
        
        # İlgili fonksiyonu çağır
        if function_name == "get_weather":
            function_response = get_weather(**function_args)
        elif function_name == "calculate":
            function_response = calculate(**function_args)
        else:
            function_response = "Unknown function"
        
        print(f"   Sonuç: {function_response}\n")
        
        # Function sonucunu mesajlara ekle
        messages.append(message)
        messages.append({
            "role": "function",
            "name": function_name,
            "content": json.dumps(function_response)
        })
        
        # İkinci API çağrısı (sonucu formatla)
        second_response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages
        )
        
        return second_response.choices[0].message.content
    
    else:
        # Function call yok, direkt yanıt
        return message.content

# Kullanım
if __name__ == "__main__":
    # Hava durumu sorusu
    print("=== Test 1: Hava Durumu ===")
    result1 = chat_with_functions("İstanbul'da hava nasıl?")
    print(f"Yanıt: {result1}\n")
    
    # Matematik sorusu
    print("=== Test 2: Hesaplama ===")
    result2 = chat_with_functions("25 ile 17'yi topla")
    print(f"Yanıt: {result2}")
```

---

### 3. Async/Await ile Parallel Requests

**`async_example.py`:**
```python
#!/usr/bin/env python3
"""
Async/Await ile paralel API çağrıları
"""

import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv
from typing import List

load_dotenv()

# Async client
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

async def async_chat(prompt: str, model: str = "gpt-3.5-turbo") -> str:
    """Async chat completion"""
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

async def batch_chat(prompts: List[str]) -> List[str]:
    """Birden fazla prompt'u paralel olarak işle"""
    tasks = [async_chat(prompt) for prompt in prompts]
    results = await asyncio.gather(*tasks)
    return results

# Kullanım
if __name__ == "__main__":
    prompts = [
        "Python nedir?",
        "JavaScript nedir?",
        "TypeScript nedir?",
        "Go nedir?",
        "Rust nedir?"
    ]
    
    print("🚀 5 soru paralel olarak gönderiliyor...\n")
    
    import time
    start = time.time()
    
    # Async olarak çalıştır
    results = asyncio.run(batch_chat(prompts))
    
    end = time.time()
    
    # Sonuçları göster
    for i, (prompt, result) in enumerate(zip(prompts, results), 1):
        print(f"Soru {i}: {prompt}")
        print(f"Yanıt: {result[:100]}...\n")
    
    print(f"⏱️  Toplam süre: {end - start:.2f} saniye")
    print(f"   (Sıralı yapılsaydı: ~{len(prompts) * 2:.0f} saniye)")
```

---

## ✅ Best Practices

### 1. Güvenlik

```python
# ✅ İYİ: Environment variables
api_key = os.getenv('OPENAI_API_KEY')

# ❌ KÖTÜ: Hardcoded API key
api_key = "sk-abc123..."  # Asla yapma!

# ✅ İYİ: .gitignore'a ekle
# .env
# *.pyc
# __pycache__/
```

### 2. Error Handling

```python
# ✅ İYİ: Spesifik exception'ları yakala
try:
    response = client.chat.completions.create(...)
except RateLimitError:
    # Rate limit özel işlemi
    handle_rate_limit()
except APIError as e:
    # API hatası
    log_error(e)
except OpenAIError as e:
    # Genel OpenAI hatası
    notify_user(str(e))

# ❌ KÖTÜ: Genel exception
try:
    response = client.chat.completions.create(...)
except Exception as e:
    pass  # Sessizce geç
```

### 3. Token Management

```python
# Token kullanımını takip et
def chat_with_token_tracking(prompt: str):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    
    usage = response.usage
    cost = calculate_cost(
        model="gpt-3.5-turbo",
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens
    )
    
    print(f"📊 Token kullanımı:")
    print(f"   Prompt: {usage.prompt_tokens}")
    print(f"   Completion: {usage.completion_tokens}")
    print(f"   Total: {usage.total_tokens}")
    print(f"   💰 Maliyet: ${cost:.4f}")
    
    return response.choices[0].message.content

def calculate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Token maliyetini hesapla"""
    # GPT-3.5-turbo fiyatları (örnek)
    costs = {
        "gpt-3.5-turbo": {
            "prompt": 0.0005 / 1000,      # $0.0005 per 1K tokens
            "completion": 0.0015 / 1000    # $0.0015 per 1K tokens
        },
        "gpt-4-turbo-preview": {
            "prompt": 0.01 / 1000,
            "completion": 0.03 / 1000
        }
    }
    
    model_costs = costs.get(model, costs["gpt-3.5-turbo"])
    total = (prompt_tokens * model_costs["prompt"]) + \
            (completion_tokens * model_costs["completion"])
    
    return total
```

### 4. Logging

```python
import logging
from datetime import datetime

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chatgpt_api.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def chat_with_logging(prompt: str):
    """Logging ile chat"""
    logger.info(f"Chat request: {prompt[:50]}...")
    
    try:
        start_time = datetime.now()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        
        duration = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Chat response received in {duration:.2f}s")
        logger.debug(f"Token usage: {response.usage.total_tokens}")
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        raise
```

---

## 🐛 Troubleshooting

### Sık Karşılaşılan Hatalar

#### 1. Authentication Error
```python
# Hata: openai.AuthenticationError: Invalid API key

# Çözüm:
# 1. API key'i kontrol et
print(os.getenv('OPENAI_API_KEY'))  # None olmamalı

# 2. .env dosyasının yüklendiğini kontrol et
from dotenv import load_dotenv
load_dotenv()

# 3. API key formatını kontrol et
# Doğru format: sk-... (48+ karakter)
```

#### 2. Rate Limit Error
```python
# Hata: openai.RateLimitError: Rate limit exceeded

# Çözüm: Retry logic ekle
import time

for attempt in range(3):
    try:
        response = client.chat.completions.create(...)
        break
    except RateLimitError:
        if attempt < 2:
            wait_time = (2 ** attempt)  # 1s, 2s, 4s
            print(f"Rate limit! {wait_time}s bekleniyor...")
            time.sleep(wait_time)
        else:
            raise
```

#### 3. Model Not Found Error
```python
# Hata: Model 'gpt-4' not found

# Çözüm: Model erişiminizi kontrol edin
# GPT-4 için özel erişim gerekir
# Alternatif: gpt-3.5-turbo veya gpt-4-turbo-preview
```

#### 4. Connection Error
```python
# Hata: Connection timeout

# Çözüm: Timeout ayarı
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    timeout=30.0,  # 30 saniye timeout
    max_retries=2
)
```

---

## 📚 Ek Kaynaklar

- **OpenAI Docs**: https://platform.openai.com/docs
- **Python Client**: https://github.com/openai/openai-python
- **Best Practices**: https://platform.openai.com/docs/guides/production-best-practices
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits
- **Pricing**: https://openai.com/pricing

---

## 🎓 Örnek Projeler

Tam çalışan örnek projeler için dokümantasyon dosyalarına bakın:
- `examples/basic_chatbot.py` - Basit chatbot
- `examples/advanced_assistant.py` - Gelişmiş asistan
- `examples/function_calling_app.py` - Function calling örneği

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Production Ready
