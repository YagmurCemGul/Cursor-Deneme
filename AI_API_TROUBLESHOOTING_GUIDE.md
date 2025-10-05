# 🔧 AI API Hata Giderme Rehberi

## 📋 İçindekiler
1. [Yaygın Hatalar](#yaygın-hatalar)
2. [Debug Araçları](#debug-araçları)
3. [Performance Sorunları](#performance-sorunları)
4. [Production İssues](#production-issues)

---

## ❌ Yaygın Hatalar ve Çözümleri

### 1. Authentication / API Key Hataları

#### Problem: "Invalid API key" / 401 Unauthorized

**Belirtiler:**
```
Error: Invalid API key (401)
Error: Unauthorized access
Error: API key not found
```

**Nedenler:**
- ✗ API key yanlış veya eksik
- ✗ API key format hatası
- ✗ Environment variable yüklenmemiş
- ✗ API key expire olmuş

**Çözümler:**

```python
# 1. API Key Debug Tool
def debug_api_key(provider='gemini'):
    """API key'i kapsamlı debug et"""
    import os
    
    key_map = {
        'gemini': ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
        'openai': ['OPENAI_API_KEY'],
        'claude': ['ANTHROPIC_API_KEY'],
        'groq': ['GROQ_API_KEY']
    }
    
    print(f"🔍 Debugging {provider} API key...")
    print("=" * 50)
    
    # Check environment variables
    env_vars = key_map.get(provider, [])
    found_key = None
    
    for var in env_vars:
        key = os.getenv(var)
        if key:
            found_key = key
            print(f"✅ {var}: Found")
            print(f"   Length: {len(key)}")
            print(f"   Preview: {key[:10]}...{key[-4:]}")
            
            # Format check
            if provider == 'gemini' and not key.startswith('AIza'):
                print(f"   ⚠️  Warning: Gemini keys usually start with 'AIza'")
            elif provider == 'openai' and not key.startswith('sk-'):
                print(f"   ⚠️  Warning: OpenAI keys start with 'sk-'")
            elif provider == 'claude' and not key.startswith('sk-ant-'):
                print(f"   ⚠️  Warning: Claude keys start with 'sk-ant-'")
        else:
            print(f"❌ {var}: Not found")
    
    if not found_key:
        print("\n❌ No API key found!")
        print("\nSolution:")
        print(f"1. Create .env file:")
        print(f"   echo '{env_vars[0]}=your-key-here' > .env")
        print(f"2. Or export:")
        print(f"   export {env_vars[0]}='your-key-here'")
        return False
    
    # Test API call
    print("\n🧪 Testing API call...")
    try:
        if provider == 'gemini':
            import google.generativeai as genai
            genai.configure(api_key=found_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("Test")
            print("✅ API call successful!")
        elif provider == 'openai':
            from openai import OpenAI
            client = OpenAI(api_key=found_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=5
            )
            print("✅ API call successful!")
        
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        print("\nPossible causes:")
        print("- API key is invalid or expired")
        print("- API key doesn't have required permissions")
        print("- Network/firewall blocking requests")
        return False

# Kullanım
debug_api_key('gemini')
```

---

### 2. Rate Limit Errors

#### Problem: "429 Too Many Requests"

**Belirtiler:**
```
Error: Rate limit exceeded (429)
Error: Quota exceeded
Error: Too many requests
```

**Nedenler:**
- ✗ Çok fazla istek gönderiliyor
- ✗ Quota sınırına ulaşıldı
- ✗ Burst limit aşıldı

**Çözümler:**

```python
# 1. Intelligent Rate Limiter
import time
from collections import deque
from datetime import datetime, timedelta

class IntelligentRateLimiter:
    def __init__(
        self,
        requests_per_minute=60,
        requests_per_day=1500,
        burst_size=10
    ):
        self.rpm = requests_per_minute
        self.rpd = requests_per_day
        self.burst_size = burst_size
        
        self.minute_requests = deque()
        self.day_requests = deque()
        self.burst_requests = deque()
    
    def _clean_old_requests(self):
        """Eski istekleri temizle"""
        now = datetime.now()
        
        # Minute window
        minute_ago = now - timedelta(minutes=1)
        while self.minute_requests and self.minute_requests[0] < minute_ago:
            self.minute_requests.popleft()
        
        # Day window
        day_ago = now - timedelta(days=1)
        while self.day_requests and self.day_requests[0] < day_ago:
            self.day_requests.popleft()
        
        # Burst window (5 seconds)
        burst_ago = now - timedelta(seconds=5)
        while self.burst_requests and self.burst_requests[0] < burst_ago:
            self.burst_requests.popleft()
    
    def wait_if_needed(self):
        """Gerekirse bekle"""
        self._clean_old_requests()
        now = datetime.now()
        
        # Burst kontrolü
        if len(self.burst_requests) >= self.burst_size:
            wait_time = 5 - (now - self.burst_requests[0]).total_seconds()
            if wait_time > 0:
                print(f"⏱️  Burst limit reached. Waiting {wait_time:.1f}s...")
                time.sleep(wait_time)
                self._clean_old_requests()
        
        # Minute kontrolü
        if len(self.minute_requests) >= self.rpm:
            wait_time = 60 - (now - self.minute_requests[0]).total_seconds()
            if wait_time > 0:
                print(f"⏱️  Rate limit (minute). Waiting {wait_time:.1f}s...")
                time.sleep(wait_time)
                self._clean_old_requests()
        
        # Day kontrolü
        if len(self.day_requests) >= self.rpd:
            wait_time = 86400 - (now - self.day_requests[0]).total_seconds()
            if wait_time > 0:
                print(f"⏱️  Daily quota reached. Waiting {wait_time/3600:.1f}h...")
                print(f"   Or upgrade your plan!")
                raise Exception("Daily quota exceeded")
        
        # İsteği kaydet
        now = datetime.now()
        self.minute_requests.append(now)
        self.day_requests.append(now)
        self.burst_requests.append(now)
    
    def get_stats(self):
        """Rate limit stats"""
        self._clean_old_requests()
        
        return {
            'requests_last_minute': len(self.minute_requests),
            'requests_last_day': len(self.day_requests),
            'burst_requests': len(self.burst_requests),
            'rpm_remaining': self.rpm - len(self.minute_requests),
            'daily_remaining': self.rpd - len(self.day_requests)
        }

# Kullanım
limiter = IntelligentRateLimiter(
    requests_per_minute=60,
    requests_per_day=1500,
    burst_size=10
)

def safe_api_call(prompt):
    limiter.wait_if_needed()
    return model.generate_content(prompt).text

# Stats göster
print(limiter.get_stats())
```

---

### 3. Timeout Errors

#### Problem: "Request timeout"

**Belirtiler:**
```
Error: Request timed out after 30s
TimeoutError: Connection timeout
ReadTimeout: Server didn't respond
```

**Nedenler:**
- ✗ Prompt çok uzun
- ✗ Network yavaş
- ✗ Server yük altında
- ✗ Timeout çok kısa

**Çözümler:**

```python
# 1. Smart Timeout Handler
import signal
import time

class SmartTimeout:
    def __init__(self, default_timeout=30, max_timeout=120):
        self.default_timeout = default_timeout
        self.max_timeout = max_timeout
        self.timeout_history = []
    
    def estimate_timeout(self, prompt_length):
        """Prompt uzunluğuna göre timeout tahmin et"""
        # Base timeout
        timeout = self.default_timeout
        
        # Uzun prompt'lar için ekstra süre
        if prompt_length > 1000:
            timeout += 15
        if prompt_length > 5000:
            timeout += 30
        
        # History'den öğren
        if self.timeout_history:
            avg_time = sum(self.timeout_history) / len(self.timeout_history)
            timeout = max(timeout, avg_time * 1.5)
        
        return min(timeout, self.max_timeout)
    
    def call_with_timeout(self, func, prompt, *args, **kwargs):
        """Timeout ile fonksiyon çağır"""
        timeout = self.estimate_timeout(len(prompt))
        start = time.time()
        
        try:
            # Set alarm
            signal.signal(signal.SIGALRM, self._timeout_handler)
            signal.alarm(int(timeout))
            
            # Call function
            result = func(prompt, *args, **kwargs)
            
            # Success - kaydet
            duration = time.time() - start
            self.timeout_history.append(duration)
            
            # Son 20 istekle sınırla
            if len(self.timeout_history) > 20:
                self.timeout_history = self.timeout_history[-20:]
            
            signal.alarm(0)
            return result
            
        except TimeoutError:
            print(f"❌ Timeout after {timeout}s")
            print(f"💡 Try:")
            print(f"   - Shorter prompt (current: {len(prompt)} chars)")
            print(f"   - Increase timeout")
            print(f"   - Check network connection")
            raise
            
        finally:
            signal.alarm(0)
    
    def _timeout_handler(self, signum, frame):
        raise TimeoutError("Request timed out")

# Kullanım
timeout_handler = SmartTimeout()

def safe_generate(prompt):
    return timeout_handler.call_with_timeout(
        model.generate_content,
        prompt
    ).text
```

---

### 4. Memory Issues

#### Problem: "Out of memory"

**Belirtiler:**
```
MemoryError: Unable to allocate memory
Process killed (OOM)
High memory usage
```

**Nedenler:**
- ✗ Conversation history çok büyük
- ✗ Cache sınırsız büyüyor
- ✗ Memory leak var

**Çözümler:**

```python
# Memory Monitor
import psutil
import gc

class MemoryMonitor:
    def __init__(self, max_memory_mb=500, warning_threshold=0.8):
        self.max_memory_mb = max_memory_mb
        self.warning_threshold = warning_threshold
    
    def get_memory_usage(self):
        """Current memory usage"""
        process = psutil.Process()
        mem_info = process.memory_info()
        return {
            'rss_mb': mem_info.rss / (1024 * 1024),
            'vms_mb': mem_info.vms / (1024 * 1024),
            'percent': process.memory_percent()
        }
    
    def check_memory(self):
        """Memory kontrolü ve cleanup"""
        usage = self.get_memory_usage()
        
        if usage['rss_mb'] > self.max_memory_mb:
            print(f"❌ Memory limit exceeded: {usage['rss_mb']:.1f}MB")
            print(f"   Cleaning up...")
            
            # Garbage collection
            gc.collect()
            
            new_usage = self.get_memory_usage()
            print(f"   After cleanup: {new_usage['rss_mb']:.1f}MB")
            
            if new_usage['rss_mb'] > self.max_memory_mb:
                raise MemoryError("Out of memory!")
        
        elif usage['rss_mb'] > self.max_memory_mb * self.warning_threshold:
            print(f"⚠️  Memory warning: {usage['rss_mb']:.1f}MB / {self.max_memory_mb}MB")
    
    def memory_safe_operation(self, func, *args, **kwargs):
        """Memory güvenli operasyon"""
        self.check_memory()
        
        try:
            result = func(*args, **kwargs)
            self.check_memory()
            return result
        finally:
            # Cleanup
            gc.collect()

# Kullanım
monitor = MemoryMonitor(max_memory_mb=500)

def safe_chat(message):
    return monitor.memory_safe_operation(
        bot.chat,
        message
    )
```

---

## 🔍 Debug Araçları

### 1. Request Logger

```python
import json
from datetime import datetime

class RequestLogger:
    def __init__(self, log_file='api_requests.log'):
        self.log_file = log_file
    
    def log_request(
        self,
        provider,
        prompt,
        response=None,
        error=None,
        metadata=None
    ):
        """Request'i log'la"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'provider': provider,
            'prompt_length': len(prompt),
            'prompt_preview': prompt[:100],
            'response_length': len(response) if response else 0,
            'error': str(error) if error else None,
            'metadata': metadata or {}
        }
        
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
        
        # Console output
        status = '✅' if response else '❌'
        print(f"{status} [{provider}] {prompt[:50]}...")
    
    def analyze_logs(self):
        """Log'ları analiz et"""
        logs = []
        
        try:
            with open(self.log_file, 'r') as f:
                for line in f:
                    logs.append(json.loads(line))
        except FileNotFoundError:
            print("No logs found")
            return
        
        # Analysis
        total = len(logs)
        errors = sum(1 for log in logs if log['error'])
        success_rate = ((total - errors) / total * 100) if total > 0 else 0
        
        providers = {}
        for log in logs:
            provider = log['provider']
            providers[provider] = providers.get(provider, 0) + 1
        
        print(f"📊 Log Analysis ({total} requests)")
        print(f"   Success rate: {success_rate:.1f}%")
        print(f"   Providers: {providers}")
        print(f"   Errors: {errors}")

# Kullanım
logger = RequestLogger()

def logged_generate(prompt, provider='gemini'):
    try:
        response = model.generate_content(prompt).text
        logger.log_request(provider, prompt, response=response)
        return response
    except Exception as e:
        logger.log_request(provider, prompt, error=e)
        raise

# Analiz
logger.analyze_logs()
```

---

## 📈 Performance Sorunları

### Yavaş Yanıtlar

```python
# Performance Profiler
import time
import statistics

class PerformanceProfiler:
    def __init__(self):
        self.timings = {
            'total': [],
            'network': [],
            'processing': []
        }
    
    def profile(self, func, *args, **kwargs):
        """Fonksiyonu profile et"""
        start = time.time()
        
        # Pre-processing
        prep_start = time.time()
        # ... preparation ...
        prep_time = time.time() - prep_start
        
        # API call
        api_start = time.time()
        result = func(*args, **kwargs)
        api_time = time.time() - api_start
        
        # Post-processing
        post_start = time.time()
        # ... post-processing ...
        post_time = time.time() - post_start
        
        total_time = time.time() - start
        
        # Save timing
        self.timings['total'].append(total_time)
        self.timings['network'].append(api_time)
        self.timings['processing'].append(prep_time + post_time)
        
        return result
    
    def report(self):
        """Performance raporu"""
        print("⏱️  Performance Report")
        print("=" * 50)
        
        for category, times in self.timings.items():
            if times:
                print(f"\n{category.upper()}:")
                print(f"  Count: {len(times)}")
                print(f"  Mean: {statistics.mean(times):.2f}s")
                print(f"  Median: {statistics.median(times):.2f}s")
                print(f"  Min: {min(times):.2f}s")
                print(f"  Max: {max(times):.2f}s")
                
                # Recommendations
                if statistics.mean(times) > 5:
                    print(f"  ⚠️  Slow! Consider:")
                    print(f"     - Caching")
                    print(f"     - Shorter prompts")
                    print(f"     - Faster model")
```

---

## 🚨 Production Issues

### 1. Service Degradation

```python
# Health Check System
class HealthCheck:
    def __init__(self):
        self.checks = {
            'api_available': self._check_api,
            'rate_limit_ok': self._check_rate_limit,
            'memory_ok': self._check_memory,
            'latency_ok': self._check_latency
        }
        self.status = {}
    
    def _check_api(self):
        """API availability"""
        try:
            response = model.generate_content("test")
            return True, "API is responsive"
        except Exception as e:
            return False, f"API error: {e}"
    
    def _check_rate_limit(self):
        """Rate limit status"""
        stats = limiter.get_stats()
        remaining = stats['rpm_remaining']
        
        if remaining < 10:
            return False, f"Low rate limit: {remaining} remaining"
        return True, f"Rate limit OK: {remaining} remaining"
    
    def _check_memory(self):
        """Memory status"""
        usage = monitor.get_memory_usage()
        
        if usage['percent'] > 80:
            return False, f"High memory: {usage['percent']:.1f}%"
        return True, f"Memory OK: {usage['percent']:.1f}%"
    
    def _check_latency(self):
        """Latency check"""
        start = time.time()
        model.generate_content("test")
        latency = time.time() - start
        
        if latency > 10:
            return False, f"High latency: {latency:.1f}s"
        return True, f"Latency OK: {latency:.1f}s"
    
    def run_checks(self):
        """Tüm checksleri çalıştır"""
        results = {}
        
        for name, check_func in self.checks.items():
            try:
                healthy, message = check_func()
                results[name] = {
                    'healthy': healthy,
                    'message': message
                }
            except Exception as e:
                results[name] = {
                    'healthy': False,
                    'message': f"Check failed: {e}"
                }
        
        self.status = results
        return results
    
    def is_healthy(self):
        """Genel health status"""
        return all(check['healthy'] for check in self.status.values())
    
    def get_report(self):
        """Health report"""
        self.run_checks()
        
        print("🏥 Health Check Report")
        print("=" * 50)
        
        for name, status in self.status.items():
            symbol = "✅" if status['healthy'] else "❌"
            print(f"{symbol} {name}: {status['message']}")
        
        overall = "✅ HEALTHY" if self.is_healthy() else "❌ DEGRADED"
        print(f"\nOverall: {overall}")
        
        return self.is_healthy()
```

---

## 📚 Hızlı Referans

### Error Code Tablosu

| Code | Meaning | Common Cause | Solution |
|------|---------|--------------|----------|
| 400 | Bad Request | Malformed request | Check request format |
| 401 | Unauthorized | Invalid API key | Check API key |
| 403 | Forbidden | No permission | Check account status |
| 429 | Too Many Requests | Rate limit | Add rate limiting |
| 500 | Internal Server Error | Server issue | Retry with backoff |
| 503 | Service Unavailable | Overloaded | Wait and retry |

### Debug Checklist

```
API Call Fails?
├─ [ ] Check API key
├─ [ ] Check internet connection
├─ [ ] Check rate limits
├─ [ ] Check request format
├─ [ ] Check timeout settings
└─ [ ] Check error logs

Slow Performance?
├─ [ ] Profile requests
├─ [ ] Check cache
├─ [ ] Optimize prompts
├─ [ ] Check network
└─ [ ] Consider faster model

High Memory?
├─ [ ] Check history size
├─ [ ] Check cache size
├─ [ ] Run garbage collection
└─ [ ] Monitor memory usage

Production Issues?
├─ [ ] Run health checks
├─ [ ] Check metrics
├─ [ ] Review logs
├─ [ ] Test failover
└─ [ ] Alert on-call
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Comprehensive Troubleshooting Guide
