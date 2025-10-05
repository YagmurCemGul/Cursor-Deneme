# 🏭 AI API Production Deployment Guide

## 📋 Production Checklist

```
┌─────────────────────────────────────────────────────┐
│           PRODUCTION DEPLOYMENT PIPELINE             │
└─────────────────────────────────────────────────────┘

DEVELOPMENT
    ├─ Code complete
    ├─ Tests passing
    ├─ Documentation ready
    └─ Code review approved
           │
           ↓
STAGING
    ├─ Deploy to staging
    ├─ Integration tests
    ├─ Performance tests
    └─ Security scan
           │
           ↓
PRODUCTION
    ├─ Deploy to production
    ├─ Monitor closely
    ├─ Verify metrics
    └─ Update docs
           │
           ↓
POST-DEPLOYMENT
    ├─ 24h monitoring
    ├─ User feedback
    ├─ Performance analysis
    └─ Incident response ready
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Environment variables (set via docker-compose or k8s)
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - LOG_LEVEL=INFO
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

---

## ☸️ Kubernetes Deployment

### deployment.yaml

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-api
  labels:
    app: ai-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-api
  template:
    metadata:
      labels:
        app: ai-api
    spec:
      containers:
      - name: ai-api
        image: your-registry/ai-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-api-secrets
              key: gemini-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-api
spec:
  selector:
    app: ai-api
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

---

## 📊 Monitoring Setup

### Prometheus Metrics

```python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# Metrics
api_requests_total = Counter(
    'ai_api_requests_total',
    'Total API requests',
    ['provider', 'status']
)

api_request_duration = Histogram(
    'ai_api_request_duration_seconds',
    'API request duration',
    ['provider']
)

api_tokens_total = Counter(
    'ai_api_tokens_total',
    'Total tokens used',
    ['provider']
)

api_cost_total = Counter(
    'ai_api_cost_total',
    'Total API cost',
    ['provider']
)

active_requests = Gauge(
    'ai_api_active_requests',
    'Currently active requests',
    ['provider']
)

# Instrumentation
def monitored_generate(prompt, provider='gemini'):
    """Prometheus metrics ile generate"""
    
    # Track active requests
    active_requests.labels(provider=provider).inc()
    
    start = time.time()
    
    try:
        # Generate
        response = model.generate_content(prompt).text
        
        # Record success
        api_requests_total.labels(
            provider=provider,
            status='success'
        ).inc()
        
        # Record duration
        duration = time.time() - start
        api_request_duration.labels(provider=provider).observe(duration)
        
        # Record tokens
        tokens = (len(prompt) + len(response)) // 4
        api_tokens_total.labels(provider=provider).inc(tokens)
        
        return response
        
    except Exception as e:
        # Record failure
        api_requests_total.labels(
            provider=provider,
            status='error'
        ).inc()
        raise
        
    finally:
        # Decrease active requests
        active_requests.labels(provider=provider).dec()
```

---

## 🚨 Alerting Rules

### alerting.yaml

```yaml
# Prometheus alerting rules
groups:
  - name: ai_api_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(ai_api_requests_total{status="error"}[5m]) / 
          rate(ai_api_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            rate(ai_api_request_duration_seconds_bucket[5m])
          ) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency"
          description: "P95 latency is {{ $value }}s"
      
      # High cost
      - alert: HighAPICost
        expr: rate(ai_api_cost_total[1h]) > 10
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "API costs are high"
          description: "Spending ${{ $value }}/hour"
      
      # Service down
      - alert: ServiceDown
        expr: up{job="ai-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "AI API service is down"
```

---

## 📈 Scaling Strategy

### Horizontal Pod Autoscaling (HPA)

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
```

---

## 🔐 Security Hardening

### 1. Secrets Management

```python
# secrets_manager.py
import boto3
import json

class SecretsManager:
    """AWS Secrets Manager integration"""
    
    def __init__(self, region='us-east-1'):
        self.client = boto3.client('secretsmanager', region_name=region)
    
    def get_secret(self, secret_name):
        """Get secret from AWS"""
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            
            if 'SecretString' in response:
                return json.loads(response['SecretString'])
            else:
                return json.loads(response['SecretBinary'].decode('utf-8'))
                
        except Exception as e:
            logger.error(f"Error retrieving secret: {e}")
            raise
    
    def get_api_keys(self):
        """Get all AI API keys"""
        secrets = self.get_secret('ai-api-keys')
        
        return {
            'gemini': secrets.get('GEMINI_API_KEY'),
            'openai': secrets.get('OPENAI_API_KEY'),
            'claude': secrets.get('ANTHROPIC_API_KEY')
        }

# Kullanım
secrets = SecretsManager()
api_keys = secrets.get_api_keys()

genai.configure(api_key=api_keys['gemini'])
```

---

## 💰 Cost Management

### Budget Alerts

```python
# cost_tracker.py
class CostTracker:
    def __init__(self, daily_budget=10.0, monthly_budget=300.0):
        self.daily_budget = daily_budget
        self.monthly_budget = monthly_budget
        
        self.daily_spent = 0.0
        self.monthly_spent = 0.0
        self.last_reset = datetime.now()
    
    def check_budget(self):
        """Budget kontrolü"""
        # Daily reset
        if (datetime.now() - self.last_reset).days >= 1:
            self.daily_spent = 0.0
            self.last_reset = datetime.now()
        
        # Check limits
        if self.daily_spent >= self.daily_budget:
            raise BudgetExceededError(
                f"Daily budget exceeded: ${self.daily_spent:.2f}"
            )
        
        if self.monthly_spent >= self.monthly_budget:
            raise BudgetExceededError(
                f"Monthly budget exceeded: ${self.monthly_spent:.2f}"
            )
    
    def record_cost(self, cost):
        """Maliyeti kaydet"""
        self.daily_spent += cost
        self.monthly_spent += cost
        
        # Alert if approaching limit
        if self.daily_spent > self.daily_budget * 0.8:
            logger.warning(
                f"Daily budget 80% used: ${self.daily_spent:.2f}/${self.daily_budget:.2f}"
            )
```

---

## 📚 Production Checklist Özet

```
🔐 SECURITY
  ✅ API keys encrypted
  ✅ HTTPS only
  ✅ Input validation
  ✅ Rate limiting
  ✅ Authentication

⚡ PERFORMANCE  
  ✅ Caching enabled
  ✅ Connection pooling
  ✅ Async operations
  ✅ Load balancing
  ✅ CDN (if needed)

📊 MONITORING
  ✅ Logging (structured)
  ✅ Metrics (Prometheus)
  ✅ Tracing (Jaeger)
  ✅ Dashboards (Grafana)
  ✅ Alerts (PagerDuty)

🧪 TESTING
  ✅ Unit tests (>80%)
  ✅ Integration tests
  ✅ Load tests
  ✅ Security tests
  ✅ Chaos engineering

💰 COST
  ✅ Budget tracking
  ✅ Cost alerts
  ✅ Token optimization
  ✅ Model selection
  ✅ Usage analytics

🚀 DEPLOYMENT
  ✅ Docker containerized
  ✅ CI/CD pipeline
  ✅ Blue-green deployment
  ✅ Rollback plan
  ✅ Runbook ready

📖 DOCUMENTATION
  ✅ API documentation
  ✅ Architecture diagram
  ✅ Runbook
  ✅ Incident procedures
  ✅ Team training
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-05  
**Status**: ✅ Production Ready Guide
