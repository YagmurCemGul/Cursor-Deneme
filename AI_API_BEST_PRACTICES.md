# ⭐ AI API Best Practices - En İyi Uygulamalar

## 📋 İçindekiler
1. [Güvenlik](#güvenlik)
2. [Performance](#performance)
3. [Maliyet Optimizasyonu](#maliyet-optimizasyonu)
4. [Code Quality](#code-quality)
5. [Production Readiness](#production-readiness)

---

## 🔒 Güvenlik

### 1. API Key Yönetimi

#### ✅ YAPILMASI GEREKENLER:

```python
# Environment variables kullan
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

# API key'i encrypt et (production'da)
from cryptography.fernet import Fernet

def encrypt_api_key(api_key):
    key = Fernet.generate_key()
    f = Fernet(key)
    return f.encrypt(api_key.encode())

# API key'i maskeleyerek logla
def mask_key(key):
    return f"{key[:10]}...{key[-4:]}"

print(f"Using API key: {mask_key(api_key)}")
```

#### ❌ YAPILMAMASI GEREKENLER:

```python
# ❌ Hardcoded API keys
api_key = "AIza123456789..."  # ASLA!

# ❌ Git'e commit
# config.py:
API_KEY = "sk-abc123..."  # Dangerous!

# ❌ Logs'a full API key
logging.info(f"API Key: {api_key}")  # Don't!

# ❌ Client-side'da expose
# JavaScript:
const apiKey = "AIza123...";  # Client sees this!
```

---

### 2. Input Validation & Sanitization

```python
# ✅ Input validation
import re

class InputValidator:
    def __init__(self):
        self.max_prompt_length = 10000
        self.min_prompt_length = 1
        
        # Dangerous patterns
        self.dangerous_patterns = [
            r'<script',
            r'javascript:',
            r'onclick=',
            r'onerror=',
        ]
    
    def validate_prompt(self, prompt):
        """Prompt'u validate et"""
        # Length check
        if len(prompt) < self.min_prompt_length:
            raise ValueError("Prompt too short")
        
        if len(prompt) > self.max_prompt_length:
            raise ValueError(f"Prompt too long (max {self.max_prompt_length})")
        
        # XSS check
        for pattern in self.dangerous_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                raise ValueError("Potentially dangerous input detected")
        
        return True
    
    def sanitize_prompt(self, prompt):
        """Prompt'u temizle"""
        # Trim whitespace
        prompt = prompt.strip()
        
        # Remove null bytes
        prompt = prompt.replace('\x00', '')
        
        # Normalize whitespace
        prompt = re.sub(r'\s+', ' ', prompt)
        
        return prompt

# Kullanım
validator = InputValidator()

def safe_generate(user_input):
    # Sanitize
    clean_input = validator.sanitize_prompt(user_input)
    
    # Validate
    validator.validate_prompt(clean_input)
    
    # Generate
    return model.generate_content(clean_input).text
```

---

### 3. Rate Limiting (Server-side)

```python
# Flask example
from flask import Flask, request, jsonify
from functools import wraps
import time

app = Flask(__name__)

# Simple in-memory rate limiter
rate_limit_storage = {}

def rate_limit(max_per_minute=60):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client IP
            client_ip = request.remote_addr
            now = time.time()
            
            # Initialize if new client
            if client_ip not in rate_limit_storage:
                rate_limit_storage[client_ip] = []
            
            # Clean old requests
            rate_limit_storage[client_ip] = [
                req_time for req_time in rate_limit_storage[client_ip]
                if now - req_time < 60
            ]
            
            # Check limit
            if len(rate_limit_storage[client_ip]) >= max_per_minute:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': 60
                }), 429
            
            # Add request
            rate_limit_storage[client_ip].append(now)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/api/generate', methods=['POST'])
@rate_limit(max_per_minute=10)
def generate():
    prompt = request.json.get('prompt')
    response = model.generate_content(prompt).text
    return jsonify({'response': response})
```

---

## ⚡ Performance

### 1. Caching Strategy

```python
# Multi-level cache
from functools import lru_cache
import redis
import pickle

class MultiLevelCache:
    def __init__(self):
        # Level 1: Memory cache (LRU)
        self.memory_cache = {}
        
        # Level 2: Redis cache (optional)
        try:
            self.redis = redis.Redis(host='localhost', port=6379, db=0)
        except:
            self.redis = None
    
    @lru_cache(maxsize=100)
    def _memory_get(self, key):
        """Memory cache get"""
        return self.memory_cache.get(key)
    
    def get(self, key):
        """Multi-level cache get"""
        # Level 1: Memory
        if key in self.memory_cache:
            return self.memory_cache[key]
        
        # Level 2: Redis
        if self.redis:
            cached = self.redis.get(key)
            if cached:
                value = pickle.loads(cached)
                # Promote to memory cache
                self.memory_cache[key] = value
                return value
        
        return None
    
    def set(self, key, value, ttl=3600):
        """Multi-level cache set"""
        # Level 1: Memory
        self.memory_cache[key] = value
        
        # Level 2: Redis
        if self.redis:
            self.redis.setex(
                key,
                ttl,
                pickle.dumps(value)
            )
    
    def generate_cached(self, prompt):
        """Cache'li generate"""
        import hashlib
        key = hashlib.md5(prompt.encode()).hexdigest()
        
        # Check cache
        cached = self.get(key)
        if cached:
            print("🎯 Cache hit!")
            return cached
        
        # Generate
        response = model.generate_content(prompt).text
        
        # Save to cache
        self.set(key, response)
        
        return response
```

---

### 2. Async Operations

```python
# Async best practices
import asyncio
from typing import List

class AsyncAIClient:
    def __init__(self, max_concurrent=5):
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def generate_async(self, prompt):
        """Rate-limited async generate"""
        async with self.semaphore:
            # Simulate async API call
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                model.generate_content,
                prompt
            )
            return response.text
    
    async def batch_generate(
        self,
        prompts: List[str],
        show_progress=True
    ):
        """Batch generation with progress"""
        results = []
        total = len(prompts)
        
        for i, prompt in enumerate(prompts, 1):
            if show_progress:
                print(f"Progress: {i}/{total} ({i/total*100:.1f}%)", end='\r')
            
            result = await self.generate_async(prompt)
            results.append(result)
        
        if show_progress:
            print(f"\n✅ Completed {total} requests")
        
        return results

# Kullanım
async def main():
    client = AsyncAIClient(max_concurrent=3)
    
    prompts = ["Q1", "Q2", "Q3", "Q4", "Q5"]
    results = await client.batch_generate(prompts)
    
    for prompt, result in zip(prompts, results):
        print(f"{prompt}: {result[:50]}...")

asyncio.run(main())
```

---

## 💰 Maliyet Optimizasyonu

### 1. Token Optimization

```python
class TokenOptimizer:
    def __init__(self):
        self.total_tokens = 0
        self.total_cost = 0.0
    
    def count_tokens(self, text):
        """Token sayısını tahmin et"""
        # Rough: ~4 chars per token
        return len(text) // 4
    
    def optimize_prompt(self, prompt, target_tokens=500):
        """Prompt'u optimize et"""
        tokens = self.count_tokens(prompt)
        
        if tokens <= target_tokens:
            return prompt
        
        # Strategies
        optimized = prompt
        
        # 1. Remove extra whitespace
        optimized = ' '.join(optimized.split())
        
        # 2. Summarize if needed
        if self.count_tokens(optimized) > target_tokens:
            # Truncate with ellipsis
            chars = target_tokens * 4
            optimized = optimized[:chars] + "..."
        
        print(f"📊 Optimized: {tokens} → {self.count_tokens(optimized)} tokens")
        
        return optimized
    
    def calculate_cost(self, prompt, response, provider='gemini'):
        """Maliyet hesapla"""
        costs = {
            'gemini': {'input': 0, 'output': 0},  # Free!
            'openai-3.5': {'input': 0.0005/1000, 'output': 0.0015/1000},
            'openai-4': {'input': 0.01/1000, 'output': 0.03/1000},
            'claude-haiku': {'input': 0.25/1000000, 'output': 1.25/1000000},
        }
        
        input_tokens = self.count_tokens(prompt)
        output_tokens = self.count_tokens(response)
        
        if provider not in costs:
            return 0
        
        cost = (
            input_tokens * costs[provider]['input'] +
            output_tokens * costs[provider]['output']
        )
        
        self.total_tokens += (input_tokens + output_tokens)
        self.total_cost += cost
        
        return cost
    
    def get_report(self):
        """Maliyet raporu"""
        return {
            'total_tokens': self.total_tokens,
            'total_cost': self.total_cost,
            'avg_tokens_per_request': self.total_tokens / max(1, len(self.requests))
        }
```

---

### 2. Smart Prompt Engineering

```python
class PromptOptimizer:
    """Prompt'ları optimize et"""
    
    def __init__(self):
        self.templates = {
            'summary': "Summarize in {words} words: {text}",
            'qa': "Q: {question}\nA: ",
            'classify': "Classify the following: {text}\nCategories: {categories}"
        }
    
    def optimize_for_task(self, text, task='summary', **kwargs):
        """Task'a göre optimize et"""
        # Template kullan (daha kısa)
        if task in self.templates:
            return self.templates[task].format(text=text, **kwargs)
        
        return text
    
    def compress_context(self, messages, max_messages=10):
        """Context'i sıkıştır"""
        if len(messages) <= max_messages:
            return messages
        
        # Strategy 1: Keep recent
        recent = messages[-max_messages:]
        
        # Strategy 2: Summarize old messages
        old_messages = messages[:-max_messages]
        if old_messages:
            summary = f"Previous context: {len(old_messages)} messages summarized"
            return [{'role': 'system', 'content': summary}] + recent
        
        return recent

# Kullanım
optimizer = PromptOptimizer()

# Before: 500 words
long_text = "..." * 500

# After: Optimized prompt
short_prompt = optimizer.optimize_for_task(
    long_text,
    task='summary',
    words=50
)
```

---

## 🎯 Code Quality

### 1. Type Hints & Documentation

```python
# ✅ GOOD: Type hints ve docstring
from typing import Optional, Dict, List, Union

def generate_text(
    prompt: str,
    model: str = "gemini-pro",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    **kwargs
) -> Dict[str, Union[str, bool, None]]:
    """
    Generate text using AI model
    
    Args:
        prompt: User input prompt
        model: Model name to use
        temperature: Creativity level (0.0-1.0)
        max_tokens: Maximum output length
        **kwargs: Additional model parameters
    
    Returns:
        {
            'success': bool,
            'text': Optional[str],
            'error': Optional[str],
            'metadata': Dict
        }
    
    Raises:
        ValueError: If prompt is invalid
        APIError: If API call fails
    
    Example:
        >>> result = generate_text("Hello!")
        >>> print(result['text'])
        "Hello! How can I help you today?"
    """
    # Implementation
    pass
```

#### ❌ BAD: Type hints yok

```python
# ❌ BAD
def generate(p, m="gemini", t=0.7):
    # What is p? m? t?
    pass
```

---

### 2. Error Handling Patterns

```python
# ✅ GOOD: Specific exceptions
from google.api_core import exceptions as google_exceptions

def robust_generate(prompt):
    """Robust error handling"""
    try:
        response = model.generate_content(prompt)
        return {'success': True, 'text': response.text}
        
    except google_exceptions.ResourceExhausted as e:
        # Rate limit - retryable
        return {
            'success': False,
            'error': 'rate_limit',
            'retry_after': 60,
            'message': 'Rate limit exceeded. Please wait.'
        }
        
    except google_exceptions.InvalidArgument as e:
        # Bad request - not retryable
        return {
            'success': False,
            'error': 'invalid_input',
            'retry_after': 0,
            'message': f'Invalid input: {e}'
        }
        
    except google_exceptions.PermissionDenied as e:
        # Auth error - not retryable
        return {
            'success': False,
            'error': 'auth_error',
            'retry_after': 0,
            'message': 'API key invalid'
        }
        
    except Exception as e:
        # Unknown error - log and investigate
        logger.error(f"Unknown error: {e}", exc_info=True)
        return {
            'success': False,
            'error': 'unknown',
            'retry_after': 0,
            'message': 'An error occurred'
        }
```

#### ❌ BAD: Catch-all

```python
# ❌ BAD
try:
    response = model.generate_content(prompt)
except:
    return "Error"  # What error? Why?
```

---

### 3. Logging

```python
# ✅ GOOD: Structured logging
import logging
import json

# Setup
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)

class StructuredLogger:
    def __init__(self, service_name='ai-api'):
        self.service_name = service_name
    
    def log(self, level, event, **kwargs):
        """Structured log"""
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'service': self.service_name,
            'event': event,
            **kwargs
        }
        
        log_message = json.dumps(log_data)
        
        if level == 'info':
            logger.info(log_message)
        elif level == 'error':
            logger.error(log_message)
        elif level == 'warning':
            logger.warning(log_message)
    
    def log_api_call(self, provider, prompt_length, success, duration, error=None):
        """Log API call"""
        self.log(
            'info' if success else 'error',
            'api_call',
            provider=provider,
            prompt_length=prompt_length,
            success=success,
            duration=duration,
            error=error
        )

# Kullanım
logger = StructuredLogger()

start = time.time()
try:
    response = model.generate_content(prompt)
    logger.log_api_call('gemini', len(prompt), True, time.time() - start)
except Exception as e:
    logger.log_api_call('gemini', len(prompt), False, time.time() - start, str(e))
```

---

## 📊 Monitoring & Metrics

### 1. Custom Metrics

```python
# Metrics collector
class MetricsCollector:
    def __init__(self):
        self.metrics = {
            'requests_total': 0,
            'requests_success': 0,
            'requests_failed': 0,
            'latency_sum': 0.0,
            'tokens_total': 0,
            'cost_total': 0.0,
            'errors_by_type': {}
        }
    
    def record_request(
        self,
        success,
        latency,
        tokens=0,
        cost=0.0,
        error_type=None
    ):
        """Record metrics"""
        self.metrics['requests_total'] += 1
        
        if success:
            self.metrics['requests_success'] += 1
        else:
            self.metrics['requests_failed'] += 1
            if error_type:
                self.metrics['errors_by_type'][error_type] = \
                    self.metrics['errors_by_type'].get(error_type, 0) + 1
        
        self.metrics['latency_sum'] += latency
        self.metrics['tokens_total'] += tokens
        self.metrics['cost_total'] += cost
    
    def get_summary(self):
        """Metrics summary"""
        total = self.metrics['requests_total']
        
        if total == 0:
            return "No requests yet"
        
        return {
            'total_requests': total,
            'success_rate': (self.metrics['requests_success'] / total) * 100,
            'avg_latency': self.metrics['latency_sum'] / total,
            'total_tokens': self.metrics['tokens_total'],
            'total_cost': self.metrics['cost_total'],
            'errors': self.metrics['errors_by_type']
        }
    
    def print_dashboard(self):
        """Print dashboard"""
        summary = self.get_summary()
        
        print("📊 Metrics Dashboard")
        print("=" * 50)
        print(f"Total Requests: {summary['total_requests']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Avg Latency: {summary['avg_latency']:.2f}s")
        print(f"Total Tokens: {summary['total_tokens']}")
        print(f"Total Cost: ${summary['total_cost']:.4f}")
        
        if summary['errors']:
            print(f"\nErrors:")
            for error_type, count in summary['errors'].items():
                print(f"  {error_type}: {count}")

# Kullanım
metrics = MetricsCollector()

def monitored_generate(prompt):
    start = time.time()
    
    try:
        response = model.generate_content(prompt).text
        tokens = len(prompt + response) // 4
        
        metrics.record_request(
            success=True,
            latency=time.time() - start,
            tokens=tokens,
            cost=0  # Gemini free
        )
        
        return response
        
    except Exception as e:
        metrics.record_request(
            success=False,
            latency=time.time() - start,
            error_type=type(e).__name__
        )
        raise

# Dashboard göster
metrics.print_dashboard()
```

---

## 🏭 Production Readiness

### 1. Configuration Management

```python
# config.py
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    """Application settings"""
    
    # API Keys
    gemini_api_key: str = Field(..., env='GEMINI_API_KEY')
    openai_api_key: str = Field(None, env='OPENAI_API_KEY')
    
    # API Settings
    default_provider: str = 'gemini'
    default_model: str = 'gemini-pro'
    max_retries: int = 3
    timeout_seconds: int = 30
    
    # Rate Limiting
    rate_limit_rpm: int = 60
    rate_limit_rpd: int = 1500
    
    # Caching
    cache_enabled: bool = True
    cache_ttl_hours: int = 24
    
    # Monitoring
    logging_level: str = 'INFO'
    metrics_enabled: bool = True
    
    # Performance
    max_concurrent_requests: int = 5
    max_memory_mb: int = 500
    
    class Config:
        env_file = '.env'
        case_sensitive = False

# Kullanım
settings = Settings()

# Type-safe access
print(settings.gemini_api_key)  # Type: str
print(settings.max_retries)      # Type: int
```

---

### 2. Health Checks

```python
# health.py
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    """Basic health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health/ready')
def readiness():
    """Readiness check"""
    checks = {
        'api': check_api_connection(),
        'database': check_database(),
        'cache': check_cache()
    }
    
    is_ready = all(checks.values())
    
    return jsonify({
        'ready': is_ready,
        'checks': checks
    }), 200 if is_ready else 503

@app.route('/health/live')
def liveness():
    """Liveness check"""
    # Application is running?
    return jsonify({'live': True}), 200

def check_api_connection():
    """Check AI API"""
    try:
        response = model.generate_content("test")
        return True
    except:
        return False
```

---

### 3. Deployment Checklist

```yaml
# Production Deployment Checklist

PRE-DEPLOYMENT:
  Code Quality:
    - [ ] Code review completed
    - [ ] No hardcoded secrets
    - [ ] Type hints added
    - [ ] Documentation complete
  
  Testing:
    - [ ] Unit tests passing (>80% coverage)
    - [ ] Integration tests passing
    - [ ] Load tests completed
    - [ ] Security scan passed
  
  Configuration:
    - [ ] Environment variables set
    - [ ] Secrets in vault
    - [ ] Feature flags configured
    - [ ] Rate limits set

DEPLOYMENT:
  Infrastructure:
    - [ ] Docker image built
    - [ ] Database migrations run
    - [ ] Load balancer configured
    - [ ] SSL certificates valid
  
  Monitoring:
    - [ ] Logging configured
    - [ ] Metrics collecting
    - [ ] Dashboards ready
    - [ ] Alerts configured
  
  Backup:
    - [ ] Backup strategy defined
    - [ ] Recovery tested
    - [ ] Rollback plan ready

POST-DEPLOYMENT:
  Verification:
    - [ ] Health checks passing
    - [ ] Smoke tests passed
    - [ ] Metrics flowing
    - [ ] No errors in logs
  
  Monitoring:
    - [ ] Watch for 24 hours
    - [ ] Check error rates
    - [ ] Monitor performance
    - [ ] User feedback

  Documentation:
    - [ ] Runbook updated
    - [ ] API docs published
    - [ ] Changelog updated
    - [ ] Team notified
```

---

## 🧪 Testing Best Practices

### 1. Unit Tests

```python
# test_ai_client.py
import pytest
from unittest.mock import Mock, patch

class TestAIClient:
    @pytest.fixture
    def mock_model(self):
        """Mock AI model"""
        with patch('google.generativeai.GenerativeModel') as mock:
            mock_instance = Mock()
            mock_instance.generate_content = Mock(
                return_value=Mock(text="Test response")
            )
            mock.return_value = mock_instance
            yield mock
    
    def test_generate_success(self, mock_model):
        """Test successful generation"""
        client = AIClient()
        result = client.generate("Test prompt")
        
        assert result['success'] == True
        assert result['text'] == "Test response"
    
    def test_generate_with_retry(self, mock_model):
        """Test retry logic"""
        # First call fails, second succeeds
        mock_model.return_value.generate_content.side_effect = [
            Exception("Rate limit"),
            Mock(text="Success")
        ]
        
        client = AIClient(max_retries=2)
        result = client.generate("Test prompt")
        
        assert result['success'] == True
        assert mock_model.return_value.generate_content.call_count == 2
```

---

### 2. Integration Tests

```python
# test_integration.py
import pytest

class TestIntegration:
    @pytest.mark.integration
    def test_real_api_call(self):
        """Test real API (requires API key)"""
        import os
        
        # Skip if no API key
        if not os.getenv('GEMINI_API_KEY'):
            pytest.skip("No API key available")
        
        client = AIClient()
        result = client.generate("Test prompt")
        
        assert result['success'] == True
        assert len(result['text']) > 0
    
    @pytest.mark.slow
    def test_rate_limiting(self):
        """Test rate limiter"""
        client = AIClient()
        
        # Send multiple requests
        start = time.time()
        for i in range(10):
            client.generate(f"Test {i}")
        duration = time.time() - start
        
        # Should be rate limited
        assert duration > 5  # At least some delay
```

---

## 📝 Best Practices Checklist

### ✅ Security
- [ ] API keys in environment variables
- [ ] .env in .gitignore
- [ ] API keys encrypted in production
- [ ] Input validation
- [ ] Output sanitization
- [ ] Rate limiting implemented

### ✅ Performance
- [ ] Caching enabled
- [ ] Async operations for batch
- [ ] Connection pooling
- [ ] Request timeout set
- [ ] Memory management

### ✅ Reliability
- [ ] Retry logic with backoff
- [ ] Circuit breaker pattern
- [ ] Fallback providers
- [ ] Health checks
- [ ] Graceful degradation

### ✅ Monitoring
- [ ] Structured logging
- [ ] Metrics collection
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Cost tracking

### ✅ Code Quality
- [ ] Type hints
- [ ] Documentation
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] Code review

### ✅ Cost Optimization
- [ ] Token counting
- [ ] Prompt optimization
- [ ] Response caching
- [ ] Model selection
- [ ] Budget alerts

---

## 🚀 Quick Wins (Hemen Uygulanabilir)

### 1. Günlük 1 Saat
```python
# Cache ekle (15 dakika)
@cache(ttl=3600)
def generate(prompt):
    return model.generate_content(prompt).text

# Result: %50-70 API call azalması
```

### 2. Bu Hafta
```python
# Rate limiter ekle
limiter = RateLimiter(60, 60)

def generate(prompt):
    limiter.wait_if_needed()
    return model.generate_content(prompt).text

# Result: Rate limit errors %90 azalma
```

### 3. Bu Ay
```python
# Multi-provider fallback
def generate_with_fallback(prompt):
    for provider in ['gemini', 'groq', 'openai']:
        try:
            return providers[provider].generate(prompt)
        except:
            continue
    raise Exception("All providers failed")

# Result: %99.9 uptime
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Production Best Practices
