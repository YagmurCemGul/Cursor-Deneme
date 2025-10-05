# 🗺️ AI API Kullanımı - Kapsamlı Yol Haritası

## 📋 İçindekiler
1. [Başlangıç Seviyesi (0-2 Hafta)](#başlangıç-seviyesi)
2. [Orta Seviye (2-6 Hafta)](#orta-seviye)
3. [İleri Seviye (6-12 Hafta)](#ileri-seviye)
4. [Production (12+ Hafta)](#production-seviye)
5. [Hata Giderme](#hata-giderme)
6. [Best Practices](#best-practices)
7. [Gerçek Dünya Projeleri](#gerçek-dünya-projeleri)

---

## 🎯 Öğrenme Yol Haritası

```
┌──────────────────────────────────────────────────────────────┐
│                    AI API ÖĞRENME YOLU                        │
└──────────────────────────────────────────────────────────────┘

BAŞLANGIÇ (0-2 Hafta) - "Hello World"
├─ Hafta 1: Temel Kavramlar
│  ├─ ✅ API nedir? REST API temelleri
│  ├─ ✅ HTTP methods (GET, POST)
│  ├─ ✅ API key nedir? Güvenlik
│  ├─ ✅ Environment variables
│  └─ ✅ İlk API çağrısı (Gemini)
│
└─ Hafta 2: Temel Kullanım
   ├─ ✅ Text generation
   ├─ ✅ Chat completion
   ├─ ✅ Error handling (try-catch)
   ├─ ✅ Rate limiting anlama
   └─ ✅ Basit chatbot projesi

ORTA SEVİYE (2-6 Hafta) - "Gerçek Projeler"
├─ Hafta 3-4: Çoklu AI Entegrasyonu
│  ├─ ✅ Multiple providers (Gemini, OpenAI, Claude)
│  ├─ ✅ Provider switching
│  ├─ ✅ Conversation history
│  ├─ ✅ Streaming responses
│  └─ ✅ Context management
│
└─ Hafta 5-6: Gelişmiş Özellikler
   ├─ ✅ Function calling
   ├─ ✅ Embeddings
   ├─ ✅ Image analysis (Vision)
   ├─ ✅ Token optimization
   └─ ✅ Cost tracking

İLERİ SEVİYE (6-12 Hafta) - "Production Ready"
├─ Hafta 7-9: Architecture
│  ├─ ✅ API wrapper design
│  ├─ ✅ Caching strategies
│  ├─ ✅ Queue systems
│  ├─ ✅ Retry logic & exponential backoff
│  └─ ✅ Circuit breaker pattern
│
└─ Hafta 10-12: Optimization
   ├─ ✅ Batch processing
   ├─ ✅ Async/await patterns
   ├─ ✅ Database integration
   ├─ ✅ Load balancing
   └─ ✅ Performance monitoring

PRODUCTION (12+ Hafta) - "Scale & Monitor"
├─ Deployment
│  ├─ ✅ Docker containerization
│  ├─ ✅ CI/CD pipeline
│  ├─ ✅ Environment management
│  └─ ✅ Secrets management
│
├─ Monitoring
│  ├─ ✅ Logging (structured logs)
│  ├─ ✅ Metrics (Prometheus/Grafana)
│  ├─ ✅ Error tracking (Sentry)
│  └─ ✅ Alerting
│
└─ Scaling
   ├─ ✅ Horizontal scaling
   ├─ ✅ Auto-scaling
   ├─ ✅ Load testing
   └─ ✅ Cost optimization
```

---

## 🎓 Başlangıç Seviyesi (0-2 Hafta)

### Hafta 1: Temel Kavramlar

#### Gün 1-2: API Temelleri
**Hedef**: API'yi anlamak

```python
# API nedir?
# - Application Programming Interface
# - Uygulamalar arası iletişim
# - REST: HTTP üzerinden JSON

# Basit HTTP request
import requests

response = requests.get('https://api.example.com/data')
print(response.json())
```

**Öğrenilecekler**:
- ✅ HTTP methods (GET, POST, PUT, DELETE)
- ✅ Status codes (200, 400, 401, 429, 500)
- ✅ Headers, Body, Parameters
- ✅ JSON format

**Pratik**:
1. Herhangi bir public API'yi test et (https://jsonplaceholder.typicode.com/)
2. Postman veya curl ile istek gönder
3. Response'u incele

---

#### Gün 3-4: API Key ve Güvenlik
**Hedef**: Güvenli API kullanımı

```bash
# Environment variables
export GEMINI_API_KEY="AIzaYour..."

# .env dosyası
echo "GEMINI_API_KEY=AIzaYour..." > .env
echo ".env" >> .gitignore
```

**Öğrenilecekler**:
- ✅ API key nedir?
- ✅ Environment variables
- ✅ .gitignore kullanımı
- ✅ API key güvenliği

**Pratik**:
1. Gemini API key al
2. .env dosyası oluştur
3. python-dotenv kullan

---

#### Gün 5-7: İlk AI Çağrısı
**Hedef**: Gemini ile ilk projen

```python
# İlk AI çağrın
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

response = model.generate_content("Merhaba!")
print(response.text)
```

**Proje**: Basit Q&A Bot
```python
def ask_ai(question):
    response = model.generate_content(question)
    return response.text

# Kullanım
print(ask_ai("Python nedir?"))
print(ask_ai("JavaScript nedir?"))
```

---

### Hafta 2: Temel Kullanım

#### Gün 8-10: Error Handling
**Hedef**: Hataları yönetmek

```python
def safe_generate(prompt, max_retries=3):
    """Retry logic ile güvenli generate"""
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Retry {attempt + 1}/{max_retries}")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                return f"Error: {e}"
```

**Öğrenilecekler**:
- ✅ try-except kullanımı
- ✅ Retry logic
- ✅ Exponential backoff
- ✅ User-friendly error messages

---

#### Gün 11-14: Basit Chatbot Projesi
**Hedef**: İlk gerçek projen

```python
class SimpleChatbot:
    def __init__(self):
        self.history = []
    
    def chat(self, message):
        # History'ye ekle
        self.history.append(f"User: {message}")
        
        # AI'ya sor
        response = model.generate_content(message)
        
        # History'ye ekle
        self.history.append(f"Bot: {response.text}")
        
        return response.text

# Kullanım
bot = SimpleChatbot()
print(bot.chat("Merhaba!"))
print(bot.chat("Python öğrenmek istiyorum"))
```

**✅ Hafta 2 Sonu Checklist**:
- [ ] API key güvenli şekilde saklayabiliyorum
- [ ] Basit API çağrısı yapabiliyorum
- [ ] Hataları handle edebiliyorum
- [ ] Basit bir chatbot yazdım

---

## 🔥 Orta Seviye (2-6 Hafta)

### Hafta 3-4: Çoklu AI Entegrasyonu

#### Multi-Provider Support
**Hedef**: Birden fazla AI kullanmak

```python
class MultiAI:
    def __init__(self):
        self.providers = {
            'gemini': self._init_gemini(),
            'openai': self._init_openai(),
            'claude': self._init_claude()
        }
    
    def generate(self, prompt, provider='gemini'):
        """Belirtilen provider ile generate et"""
        if provider not in self.providers:
            raise ValueError(f"Unknown provider: {provider}")
        
        return self.providers[provider].generate(prompt)
    
    def generate_with_fallback(self, prompt):
        """Bir provider fail ederse diğerini dene"""
        for provider in ['gemini', 'openai', 'claude']:
            try:
                return self.generate(prompt, provider)
            except Exception as e:
                print(f"{provider} failed: {e}")
                continue
        
        raise Exception("All providers failed!")
```

**Öğrenilecekler**:
- ✅ Multiple AI services
- ✅ Fallback strategies
- ✅ Provider abstraction
- ✅ Unified interface

---

#### Conversation History & Context
**Hedef**: Bağlamı korumak

```python
class ContextualChatbot:
    def __init__(self, max_history=10):
        self.messages = []
        self.max_history = max_history
    
    def chat(self, user_message):
        # Kullanıcı mesajını ekle
        self.messages.append({
            "role": "user",
            "content": user_message
        })
        
        # AI'dan yanıt al (tüm history ile)
        response = self._generate_with_context()
        
        # Yanıtı ekle
        self.messages.append({
            "role": "assistant",
            "content": response
        })
        
        # History'yi limitle
        if len(self.messages) > self.max_history * 2:
            self.messages = self.messages[-self.max_history * 2:]
        
        return response
    
    def _generate_with_context(self):
        # Context'i birleştir
        context = "\n".join([
            f"{m['role']}: {m['content']}" 
            for m in self.messages
        ])
        
        return model.generate_content(context).text
```

---

#### Streaming Responses
**Hedef**: Real-time yanıtlar

```python
def stream_chat(prompt):
    """Streaming ile yanıt al"""
    print("Bot: ", end="", flush=True)
    
    response = model.generate_content(prompt, stream=True)
    
    full_response = ""
    for chunk in response:
        text = chunk.text
        print(text, end="", flush=True)
        full_response += text
    
    print()
    return full_response
```

**✅ Hafta 4 Sonu Checklist**:
- [ ] Multiple AI providers kullanabiliyorum
- [ ] Fallback stratejisi implement ettim
- [ ] Conversation history yönetiyorum
- [ ] Streaming responses çalışıyor

---

### Hafta 5-6: Gelişmiş Özellikler

#### Token Optimization
**Hedef**: Maliyeti azaltmak

```python
class TokenOptimizer:
    def __init__(self):
        self.token_counts = []
    
    def count_tokens(self, text):
        """Token sayısını tahmin et"""
        # Rough estimate: ~4 chars per token
        return len(text) // 4
    
    def optimize_prompt(self, prompt, max_tokens=1000):
        """Prompt'u token limitine göre kısalt"""
        tokens = self.count_tokens(prompt)
        
        if tokens > max_tokens:
            # Kısalt
            chars = max_tokens * 4
            return prompt[:chars] + "..."
        
        return prompt
    
    def generate_with_limit(self, prompt, max_response_tokens=500):
        """Token limiti ile generate"""
        optimized_prompt = self.optimize_prompt(prompt)
        
        response = model.generate_content(
            optimized_prompt,
            generation_config={
                'max_output_tokens': max_response_tokens
            }
        )
        
        # Track usage
        tokens_used = self.count_tokens(prompt + response.text)
        self.token_counts.append(tokens_used)
        
        return response.text
```

---

#### Caching Strategy
**Hedef**: Tekrarlı istekleri önlemek

```python
import hashlib
import json
from datetime import datetime, timedelta

class AICache:
    def __init__(self, ttl_hours=24):
        self.cache = {}
        self.ttl = timedelta(hours=ttl_hours)
    
    def _hash_prompt(self, prompt, **kwargs):
        """Prompt için unique hash oluştur"""
        key = json.dumps({
            'prompt': prompt,
            **kwargs
        }, sort_keys=True)
        return hashlib.md5(key.encode()).hexdigest()
    
    def get(self, prompt, **kwargs):
        """Cache'den al"""
        key = self._hash_prompt(prompt, **kwargs)
        
        if key in self.cache:
            entry = self.cache[key]
            
            # TTL kontrolü
            if datetime.now() - entry['timestamp'] < self.ttl:
                print("🎯 Cache hit!")
                return entry['response']
            else:
                # Expired, sil
                del self.cache[key]
        
        return None
    
    def set(self, prompt, response, **kwargs):
        """Cache'e kaydet"""
        key = self._hash_prompt(prompt, **kwargs)
        self.cache[key] = {
            'response': response,
            'timestamp': datetime.now()
        }
    
    def generate_cached(self, prompt, **kwargs):
        """Cache'li generate"""
        # Önce cache'e bak
        cached = self.get(prompt, **kwargs)
        if cached:
            return cached
        
        # Cache'de yok, generate et
        response = model.generate_content(prompt).text
        
        # Cache'e kaydet
        self.set(prompt, response, **kwargs)
        
        return response

# Kullanım
cache = AICache(ttl_hours=24)

# İlk çağrı - API'ye gider
response1 = cache.generate_cached("Python nedir?")

# İkinci çağrı - Cache'den gelir (hızlı, ücretsiz!)
response2 = cache.generate_cached("Python nedir?")
```

**✅ Hafta 6 Sonu Checklist**:
- [ ] Token optimization implement ettim
- [ ] Caching sistemi çalışıyor
- [ ] Maliyet tracking yapıyorum
- [ ] Vision API kullanabiliyorum

---

## 🚀 İleri Seviye (6-12 Hafta)

### Hafta 7-9: Production Architecture

#### Async/Await Patterns
**Hedef**: Paralel işlemler

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AsyncAI:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=5)
    
    async def generate_async(self, prompt):
        """Async generate"""
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            self.executor,
            lambda: model.generate_content(prompt).text
        )
        return response
    
    async def batch_generate(self, prompts):
        """Birden fazla prompt'u paralel işle"""
        tasks = [self.generate_async(p) for p in prompts]
        results = await asyncio.gather(*tasks)
        return results

# Kullanım
async def main():
    ai = AsyncAI()
    
    prompts = [
        "Python nedir?",
        "JavaScript nedir?",
        "Go nedir?",
        "Rust nedir?"
    ]
    
    # Paralel olarak işle
    results = await ai.batch_generate(prompts)
    
    for prompt, result in zip(prompts, results):
        print(f"Q: {prompt}")
        print(f"A: {result[:100]}...\n")

asyncio.run(main())
```

---

#### Queue System
**Hedef**: İşleri sıraya koymak

```python
import queue
import threading
import time

class AIQueue:
    def __init__(self, num_workers=3):
        self.queue = queue.Queue()
        self.results = {}
        self.workers = []
        
        # Worker threads başlat
        for i in range(num_workers):
            worker = threading.Thread(target=self._worker)
            worker.daemon = True
            worker.start()
            self.workers.append(worker)
    
    def _worker(self):
        """Worker thread - queue'dan iş al ve işle"""
        while True:
            try:
                job_id, prompt = self.queue.get(timeout=1)
                
                # İşle
                result = model.generate_content(prompt).text
                
                # Sonucu kaydet
                self.results[job_id] = {
                    'status': 'completed',
                    'result': result
                }
                
                self.queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                self.results[job_id] = {
                    'status': 'failed',
                    'error': str(e)
                }
    
    def submit(self, prompt):
        """İş gönder"""
        job_id = str(uuid.uuid4())
        
        self.results[job_id] = {
            'status': 'pending',
            'result': None
        }
        
        self.queue.put((job_id, prompt))
        return job_id
    
    def get_result(self, job_id, timeout=30):
        """Sonucu al (blocking)"""
        start = time.time()
        
        while time.time() - start < timeout:
            if job_id in self.results:
                result = self.results[job_id]
                
                if result['status'] == 'completed':
                    return result['result']
                elif result['status'] == 'failed':
                    raise Exception(result['error'])
            
            time.sleep(0.5)
        
        raise TimeoutError(f"Job {job_id} timed out")

# Kullanım
queue_system = AIQueue(num_workers=3)

# Birden fazla iş gönder
job_ids = []
for i in range(10):
    job_id = queue_system.submit(f"Soru {i}: Nedir?")
    job_ids.append(job_id)
    print(f"Job {i} submitted: {job_id}")

# Sonuçları al
for job_id in job_ids:
    result = queue_system.get_result(job_id)
    print(f"Result: {result[:50]}...")
```

---

#### Circuit Breaker Pattern
**Hedef**: Başarısız servisleri bypass etmek

```python
from enum import Enum
import time

class CircuitState(Enum):
    CLOSED = "closed"      # Normal
    OPEN = "open"          # Başarısız, istekleri reddet
    HALF_OPEN = "half_open"  # Test ediliyor

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold=5,
        timeout=60,
        success_threshold=2
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.success_threshold = success_threshold
        
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    def call(self, func, *args, **kwargs):
        """Circuit breaker ile fonksiyon çağır"""
        
        # OPEN state - istekleri reddet
        if self.state == CircuitState.OPEN:
            # Timeout geçti mi?
            if time.time() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            # Fonksiyonu çağır
            result = func(*args, **kwargs)
            
            # Başarılı
            self._on_success()
            return result
            
        except Exception as e:
            # Başarısız
            self._on_failure()
            raise
    
    def _on_success(self):
        """Başarılı çağrı"""
        self.failure_count = 0
        
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
    
    def _on_failure(self):
        """Başarısız çağrı"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Kullanım
breaker = CircuitBreaker(failure_threshold=3, timeout=30)

def call_ai(prompt):
    return breaker.call(
        model.generate_content,
        prompt
    ).text

# Kullan
try:
    result = call_ai("Test prompt")
except Exception as e:
    print(f"Circuit breaker prevented call: {e}")
```

**✅ Hafta 9 Sonu Checklist**:
- [ ] Async/await kullanıyorum
- [ ] Queue system implement ettim
- [ ] Circuit breaker pattern anladım
- [ ] Production-ready architecture var

---

## 🏭 Production Seviye (12+ Hafta)

### Monitoring & Logging

```python
import logging
import time
from datetime import datetime

# Structured logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_api.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class MonitoredAI:
    def __init__(self):
        self.metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'total_tokens': 0,
            'total_cost': 0.0,
            'avg_latency': 0.0
        }
    
    def generate_monitored(self, prompt, provider='gemini'):
        """Monitoring ile generate"""
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        logger.info(f"Request started", extra={
            'request_id': request_id,
            'provider': provider,
            'prompt_length': len(prompt)
        })
        
        try:
            # Generate
            response = model.generate_content(prompt)
            
            # Calculate metrics
            latency = time.time() - start_time
            tokens = self._count_tokens(prompt + response.text)
            cost = self._calculate_cost(tokens, provider)
            
            # Update metrics
            self.metrics['total_requests'] += 1
            self.metrics['successful_requests'] += 1
            self.metrics['total_tokens'] += tokens
            self.metrics['total_cost'] += cost
            self.metrics['avg_latency'] = (
                (self.metrics['avg_latency'] * (self.metrics['total_requests'] - 1) + latency)
                / self.metrics['total_requests']
            )
            
            logger.info(f"Request completed", extra={
                'request_id': request_id,
                'latency': latency,
                'tokens': tokens,
                'cost': cost,
                'status': 'success'
            })
            
            return response.text
            
        except Exception as e:
            latency = time.time() - start_time
            
            self.metrics['total_requests'] += 1
            self.metrics['failed_requests'] += 1
            
            logger.error(f"Request failed", extra={
                'request_id': request_id,
                'latency': latency,
                'error': str(e),
                'status': 'failed'
            })
            
            raise
    
    def get_metrics(self):
        """Metrics'leri döndür"""
        return {
            **self.metrics,
            'success_rate': (
                self.metrics['successful_requests'] / self.metrics['total_requests']
                if self.metrics['total_requests'] > 0 else 0
            )
        }
```

---

### Deployment Checklist

```yaml
# Production Deployment Checklist

Environment Setup:
  - [ ] Environment variables configured
  - [ ] Secrets management (Vault, AWS Secrets Manager)
  - [ ] SSL/TLS certificates
  - [ ] Domain configuration

Application:
  - [ ] All dependencies installed
  - [ ] Config files ready
  - [ ] Database migrations run
  - [ ] Static files served

API Configuration:
  - [ ] Rate limiting configured
  - [ ] Timeouts set
  - [ ] Retry logic implemented
  - [ ] Circuit breakers active

Monitoring:
  - [ ] Logging configured
  - [ ] Metrics collection (Prometheus)
  - [ ] Dashboards created (Grafana)
  - [ ] Alerts configured

Security:
  - [ ] API keys encrypted
  - [ ] HTTPS enforced
  - [ ] Input validation
  - [ ] CORS configured
  - [ ] Authentication/Authorization

Testing:
  - [ ] Unit tests passing
  - [ ] Integration tests passing
  - [ ] Load testing done
  - [ ] Security testing done

Documentation:
  - [ ] API documentation complete
  - [ ] Deployment guide written
  - [ ] Runbook for incidents
  - [ ] Architecture diagram

Backup & Recovery:
  - [ ] Backup strategy defined
  - [ ] Recovery procedures tested
  - [ ] Disaster recovery plan

Performance:
  - [ ] Caching configured
  - [ ] CDN setup (if needed)
  - [ ] Database optimized
  - [ ] Load balancing configured
```

---

## 🐛 Hata Giderme (Troubleshooting)

### Yaygın Hatalar ve Çözümleri

#### 1. Authentication Errors

```python
# Problem: 401 Unauthorized
"""
Error: Invalid API key
"""

# Çözüm:
def debug_api_key():
    """API key'i debug et"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    print("Checks:")
    print(f"  ✓ API key exists: {api_key is not None}")
    print(f"  ✓ API key length: {len(api_key) if api_key else 0}")
    print(f"  ✓ API key format: {'AIza...' if api_key and api_key.startswith('AIza') else 'Invalid'}")
    print(f"  ✓ Masked key: {api_key[:10]}...{api_key[-4:] if api_key else 'None'}")
    
    # Test API call
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Test")
        print(f"  ✓ API call: Success!")
    except Exception as e:
        print(f"  ✗ API call: Failed - {e}")
```

---

#### 2. Rate Limit Errors

```python
# Problem: 429 Too Many Requests
"""
Error: Rate limit exceeded
"""

# Çözüm: Smart rate limiter
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_requests=60, time_window=60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
    
    def wait_if_needed(self):
        """Gerekirse bekle"""
        now = time.time()
        
        # Eski istekleri temizle
        while self.requests and now - self.requests[0] > self.time_window:
            self.requests.popleft()
        
        # Limit aşıldı mı?
        if len(self.requests) >= self.max_requests:
            # En eski isteğin süresi dolana kadar bekle
            wait_time = self.time_window - (now - self.requests[0])
            if wait_time > 0:
                print(f"⏱️  Rate limit reached. Waiting {wait_time:.1f}s...")
                time.sleep(wait_time)
                self.wait_if_needed()  # Recursive check
        
        # İsteği kaydet
        self.requests.append(now)

# Kullanım
limiter = RateLimiter(max_requests=60, time_window=60)

def rate_limited_generate(prompt):
    limiter.wait_if_needed()
    return model.generate_content(prompt).text
```

---

#### 3. Timeout Errors

```python
# Problem: Request timeout
"""
Error: Request timed out after 30s
"""

# Çözüm: Timeout handling
import signal

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Request timed out")

def generate_with_timeout(prompt, timeout_seconds=30):
    """Timeout ile generate"""
    
    # Set timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout_seconds)
    
    try:
        response = model.generate_content(prompt)
        signal.alarm(0)  # Cancel alarm
        return response.text
    except TimeoutError:
        return "Request timed out. Please try with a shorter prompt."
    finally:
        signal.alarm(0)  # Make sure to cancel alarm
```

---

#### 4. Memory Leaks

```python
# Problem: Memory usage artıyor
"""
Issue: Memory leak in conversation history
"""

# Çözüm: Memory management
import sys

class MemoryManagedChat:
    def __init__(self, max_history=20, max_memory_mb=100):
        self.messages = []
        self.max_history = max_history
        self.max_memory_mb = max_memory_mb
    
    def _get_size_mb(self):
        """Memory kullanımını hesapla"""
        return sys.getsizeof(self.messages) / (1024 * 1024)
    
    def add_message(self, role, content):
        """Mesaj ekle ve memory'yi yönet"""
        self.messages.append({'role': role, 'content': content})
        
        # History limitini kontrol et
        if len(self.messages) > self.max_history * 2:
            # En eski mesajları sil
            self.messages = self.messages[-self.max_history * 2:]
        
        # Memory limitini kontrol et
        if self._get_size_mb() > self.max_memory_mb:
            # Aggressive cleanup
            self.messages = self.messages[-10:]
            print(f"⚠️  Memory limit reached. Cleaned up history.")
```

---

## ✅ Best Practices Özeti

### 1. **Güvenlik**
```python
# ✅ DO
api_key = os.getenv('API_KEY')
encrypted_key = encrypt(api_key)

# ❌ DON'T
api_key = "sk-abc123..."  # Hardcoded!
```

### 2. **Error Handling**
```python
# ✅ DO
try:
    response = api_call()
except SpecificError as e:
    handle_specific_error(e)
except Exception as e:
    log_error(e)
    raise

# ❌ DON'T
try:
    response = api_call()
except:
    pass  # Silent fail!
```

### 3. **Retry Logic**
```python
# ✅ DO
for attempt in range(max_retries):
    try:
        return api_call()
    except RetryableError:
        wait = exponential_backoff(attempt)
        time.sleep(wait)

# ❌ DON'T
while True:
    try:
        return api_call()
    except:
        time.sleep(1)  # Infinite loop!
```

### 4. **Caching**
```python
# ✅ DO
@cache(ttl=3600)
def get_response(prompt):
    return api_call(prompt)

# ❌ DON'T
def get_response(prompt):
    return api_call(prompt)  # Her seferinde API çağrısı!
```

### 5. **Monitoring**
```python
# ✅ DO
logger.info("API call", extra={
    'duration': duration,
    'tokens': tokens,
    'cost': cost
})

# ❌ DON'T
print("API call completed")  # Lost logs!
```

---

## 🎯 Gerçek Dünya Projeleri

### Proje 1: Smart Customer Support Bot (Hafta 2-4)
- Multi-turn conversations
- Context management
- FAQ integration
- Sentiment analysis

### Proje 2: Content Generation Platform (Hafta 4-6)
- Blog post generation
- Multiple formats (article, social media, email)
- SEO optimization
- Image generation integration

### Proje 3: Code Assistant (Hafta 6-8)
- Code generation
- Code review
- Bug detection
- Documentation generation

### Proje 4: AI Analytics Dashboard (Hafta 8-12)
- Multi-provider comparison
- Cost tracking
- Performance metrics
- Usage analytics

### Proje 5: Production API Service (Hafta 12+)
- RESTful API
- Authentication & authorization
- Rate limiting
- Caching
- Monitoring
- Auto-scaling

---

## 📊 Öğrenme Takip Tablosu

| Seviye | Konu | Tahmini Süre | Öğrendim |
|--------|------|--------------|----------|
| **Başlangıç** | API Temelleri | 2 gün | [ ] |
| | Environment variables | 2 gün | [ ] |
| | İlk AI çağrısı | 3 gün | [ ] |
| | Error handling | 3 gün | [ ] |
| | Basit chatbot | 4 gün | [ ] |
| **Orta** | Multi-provider | 1 hafta | [ ] |
| | Conversation history | 1 hafta | [ ] |
| | Streaming | 3 gün | [ ] |
| | Token optimization | 1 hafta | [ ] |
| | Caching | 1 hafta | [ ] |
| **İleri** | Async/await | 1 hafta | [ ] |
| | Queue system | 1 hafta | [ ] |
| | Circuit breaker | 1 hafta | [ ] |
| | Batch processing | 3 gün | [ ] |
| **Production** | Monitoring | 1 hafta | [ ] |
| | Deployment | 1 hafta | [ ] |
| | Scaling | 2 hafta | [ ] |

---

## 🎓 Sonraki Adımlar

### Bu Hafta:
1. [ ] API key al (Gemini)
2. [ ] İlk API çağrısını yap
3. [ ] Basit chatbot yaz
4. [ ] Error handling ekle

### Bu Ay:
1. [ ] Multi-provider desteği
2. [ ] Caching implement et
3. [ ] Token optimization
4. [ ] İlk gerçek proje

### Bu Yıl:
1. [ ] Production-ready service
2. [ ] Monitoring ve alerting
3. [ ] Auto-scaling
4. [ ] Portfolio'ya ekle

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Comprehensive Roadmap
