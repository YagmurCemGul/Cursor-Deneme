# 📖 Usage Examples - Smart AI Features

## Quick Start

### 1. Basic Usage (Recommended)

Replace your existing AI calls with Smart AI:

```typescript
import { smartAI } from './utils/smartAIIntegration';

// CV Optimization
const result = await smartAI.optimizeCV(cvData, jobDescription);

console.log('Optimizations:', result.result.optimizations);
console.log('Cost:', result.metadata.cost);
console.log('Provider used:', result.metadata.provider);
console.log('Was cached:', result.metadata.cached);
```

### 2. With Options

```typescript
const result = await smartAI.optimizeCV(cvData, jobDescription, {
  provider: 'openai',
  tier: 'tier-1',        // Set your OpenAI tier
  enableQueue: true,     // Queue requests automatically
  enableCache: true,     // Use caching
  enableFallback: true,  // Auto switch providers
  enableAnalytics: true, // Track analytics
  onProgress: (progress) => {
    console.log(progress.message);
    // "Queued at position 2"
    // "Waiting 10s for rate limit..."
    // "Processing request..."
    // "Request completed successfully"
  }
});
```

---

## Feature-by-Feature Examples

### ⏱️ Rate Limit Tracking

```typescript
import { getRateLimitTracker, checkRateLimit } from './utils/rateLimitTracker';

// Get tracker for your provider
const tracker = getRateLimitTracker('openai', 'tier-1');

// Check current usage
const stats = tracker.getUsageStats();

console.log(`RPM: ${stats.currentRpm}/${stats.maxRpm} (${stats.rpmUsagePercent.toFixed(1)}%)`);
console.log(`TPM: ${stats.currentTpm}/${stats.maxTpm}`);
console.log(`Can make request: ${stats.canMakeRequest}`);
console.log(`Need to wait: ${stats.waitTimeMs}ms`);

// Check before making request
const { allowed, waitTimeMs, warning } = await checkRateLimit('openai', 2000);

if (!allowed) {
  console.log(`Wait ${waitTimeMs}ms before next request`);
  await new Promise(resolve => setTimeout(resolve, waitTimeMs));
}

// Record request after making it
tracker.recordRequest(2000); // 2000 tokens used

// Get warning level
const warningLevel = tracker.getWarningLevel();
// 'safe' | 'warning' | 'critical' | 'exceeded'
```

---

### 📨 Smart Request Queue

```typescript
import { queueRequest, getGlobalQueue } from './utils/smartRequestQueue';

// Queue a single request
const result = await queueRequest(
  async () => await someAPICall(),
  {
    priority: 'high',           // 'high' | 'normal' | 'low'
    provider: 'openai',
    estimatedTokens: 2000,
    maxRetries: 3,
    onProgress: (progress) => {
      console.log(`[${progress.status}] ${progress.message}`);
      if (progress.position) {
        console.log(`Position in queue: ${progress.position}`);
      }
    }
  }
);

// Get queue statistics
const queue = getGlobalQueue();
const stats = queue.getStats();

console.log('Pending:', stats.pending);
console.log('Completed:', stats.completed);
console.log('Failed:', stats.failed);
console.log('Average wait time:', stats.averageWaitTime + 'ms');
console.log('Estimated wait:', stats.estimatedWaitTime + 'ms');

// Pause queue (e.g., when user wants to stop)
queue.pause();

// Resume later
queue.resume();

// Clear queue (cancel all pending)
queue.clear();
```

---

### 💰 Budget Management

```typescript
import { getBudgetManager, trackCost } from './utils/budgetManager';

// Configure budget
const manager = getBudgetManager({
  period: 'daily',              // 'hourly' | 'daily' | 'weekly' | 'monthly'
  limit: 10.0,                  // $10 daily limit
  alertThresholds: [0.5, 0.8, 0.95],  // Alert at 50%, 80%, 95%
  autoStopAt: 1.0               // Stop at 100%
});

// Track a cost
trackCost(
  'openai',           // provider
  'optimizeCV',       // operation
  1500,               // input tokens
  500,                // output tokens
  0.02,               // cost in USD
  'gpt-4o-mini'       // model
);

// Check if can spend
if (manager.canSpend(0.05)) {
  // OK to make request
} else {
  console.log('Budget limit reached!');
}

// Get current spending
const spending = manager.getCurrentSpending();
console.log(`Spent today: $${spending.toFixed(2)}`);

// Check for alerts
const alert = manager.checkBudgetAlert();
if (alert) {
  console.log(`[${alert.level}] ${alert.message}`);
  // warning: "Budget warning: 85% used ($8.50 of $10.00)"
}

// Get detailed report
const report = manager.getCostReport();

console.log('Total cost:', report.totalCost);
console.log('Remaining:', report.remaining);
console.log('Percentage:', report.percentage + '%');
console.log('By provider:', report.byProvider);
console.log('By operation:', report.byOperation);
console.log('Projected monthly:', report.projectedCost);

// Cost by provider breakdown
const breakdown = manager.getCostByProvider();
console.log('OpenAI:', breakdown.openai);
// { cost: 5.20, requests: 150, percentage: 65 }
```

---

### 🔄 Provider Fallback

```typescript
import { getProviderManager } from './utils/smartProviderManager';

const manager = getProviderManager({
  providerPriority: ['openai', 'gemini', 'claude'],
  fallbackOnRateLimit: true,
  fallbackOnQuota: true,
  fallbackOnError: true,
  maxConsecutiveFailures: 3
});

// Make request with automatic fallback
const result = await manager.optimizeCV(
  cvData,
  jobDescription,
  (from, to, reason) => {
    console.log(`Provider switched: ${from} → ${to}`);
    console.log(`Reason: ${reason}`);
    // "Provider switched: openai → gemini"
    // "Reason: rate limit exceeded"
  }
);

console.log('Used provider:', result.provider);
console.log('Fallback used:', result.fallbackUsed);
console.log('Attempted providers:', result.attemptedProviders);

// Get provider status
const status = manager.getProviderStatus('openai');
console.log('Available:', status?.available);
console.log('Healthy:', status?.healthy);
console.log('Consecutive failures:', status?.consecutiveFailures);

// Manually mark provider as unavailable
manager.setProviderAvailable('openai', false);

// Reset provider status
manager.resetProviderStatus('openai');
```

---

### 💾 Smart Caching

```typescript
import { 
  getCache, 
  generateCacheKey, 
  cvOptimizationCache,
  coverLetterCache 
} from './utils/smartCache';

// Use pre-configured caches
const result = await cvOptimizationCache.getOrGenerate(
  generateCacheKey('cv_opt', 'openai', cvData, jobDesc),
  async () => await optimizeCV(cvData, jobDesc),
  {
    ttl: 3600000,        // 1 hour
    importance: 0.8,      // High importance (less likely to be evicted)
    enableSimilarityMatch: true  // Enable fuzzy matching
  }
);

// Create custom cache
const myCache = getCache('my_custom_cache', {
  maxSize: 30,                    // 30 MB
  defaultTTL: 3600000,            // 1 hour
  enableSemanticMatching: true,
  similarityThreshold: 0.85,      // 85% similarity required
  evictionStrategy: 'importance'  // 'lru' | 'lfu' | 'importance'
});

// Simple get/set
myCache.set('key1', { data: 'value' }, 60000); // 1 minute TTL
const value = myCache.get('key1');

// Get or generate pattern
const data = await myCache.getOrGenerate(
  'expensive_operation',
  async () => {
    // This only runs if not cached
    return await expensiveAPICall();
  }
);

// Cache statistics
const stats = myCache.getStats();
console.log('Hit rate:', (stats.hitRate * 100).toFixed(1) + '%');
console.log('Cache size:', stats.size, 'entries');
console.log('Total size:', (stats.totalSize / 1024 / 1024).toFixed(2), 'MB');
console.log('Average access time:', stats.averageAccessTime.toFixed(2), 'ms');

// Clean expired entries
const cleaned = myCache.cleanExpired();
console.log('Cleaned entries:', cleaned);

// Cache warming (preload common items)
await myCache.warmCache([
  {
    key: 'common_1',
    generator: async () => await loadCommonData1(),
    importance: 0.9
  },
  {
    key: 'common_2',
    generator: async () => await loadCommonData2(),
    importance: 0.8
  }
]);

// Clear cache
myCache.clear();
```

---

### 📈 Advanced Analytics

```typescript
import { getAnalytics } from './utils/advancedAnalytics';

const analytics = getAnalytics();

// Track request (automatically tracked by smartAI)
analytics.trackRequest({
  provider: 'openai',
  operation: 'optimizeCV',
  cost: 0.02,
  duration: 2500,        // ms
  success: true,
  model: 'gpt-4o-mini',
  inputTokens: 1500,
  outputTokens: 500
});

// Get insights
const insights = analytics.getInsights();

insights.forEach(insight => {
  console.log(`[${insight.type}] ${insight.severity}`);
  console.log(insight.title);
  console.log(insight.message);
  
  if (insight.potentialSaving) {
    console.log(`💰 Save $${insight.potentialSaving.toFixed(2)}`);
  }
});

// Example insights:
// [cost_saving] important
// Switch CV optimization to Gemini
// Using Gemini instead of OpenAI could save $0.018 per request.
// 💰 Save $5.20

// Compare providers
const comparison = analytics.compareProviders();

comparison.forEach(provider => {
  console.log(`${provider.provider}:`);
  console.log(`  Total cost: $${provider.totalCost.toFixed(2)}`);
  console.log(`  Avg cost: $${provider.averageCost.toFixed(4)}`);
  console.log(`  Success rate: ${(provider.successRate * 100).toFixed(1)}%`);
  console.log(`  Avg latency: ${provider.averageLatency}ms`);
  console.log(`  Recommendation: ${provider.recommendation}`);
});

// Analyze usage patterns
const patterns = analytics.analyzePatterns();

console.log('Peak hours:', patterns.peakHours);  // [9, 10, 14, 15]
console.log('Peak days:', patterns.peakDays);    // ['Monday', 'Friday']
console.log('Trend:', patterns.trend);           // 'increasing'
console.log('Avg requests/day:', patterns.averageRequestsPerDay);

// Forecast cost
const forecast = analytics.forecastCost();

console.log('Daily forecast: $' + forecast.daily.toFixed(2));
console.log('Weekly forecast: $' + forecast.weekly.toFixed(2));
console.log('Monthly forecast: $' + forecast.monthly.toFixed(2));
console.log('Confidence:', (forecast.confidence * 100).toFixed(0) + '%');
console.log('Trend:', forecast.trend);

if (forecast.alerts.length > 0) {
  console.log('⚠️ Alerts:');
  forecast.alerts.forEach(alert => console.log('  -', alert));
}

// Analyze operations
const operations = analytics.analyzeOperations();

operations.forEach(op => {
  console.log(`${op.operation}:`);
  console.log(`  Requests: ${op.count}`);
  console.log(`  Total cost: $${op.totalCost.toFixed(2)}`);
  console.log(`  Avg cost: $${op.averageCost.toFixed(4)}`);
  console.log(`  Success rate: ${(op.successRate * 100).toFixed(1)}%`);
  console.log(`  Cost %: ${op.costPercentage.toFixed(1)}%`);
  
  if (op.optimization) {
    console.log(`  💡 ${op.optimization}`);
  }
});
```

---

### 🔔 Notifications

```typescript
import { notifications, getNotificationManager } from './utils/notificationManager';

// Show notifications (simple)
notifications.showSuccess('CV Optimized', 'Completed in 2.5s, cost: $0.02');
notifications.showError('Request Failed', 'Rate limit exceeded');
notifications.showInfo('Queue Position', 'You are 3rd in queue');

// Rate limit warning
notifications.showRateLimitWarning(usageStats, 'openai');

// Budget alert
notifications.showBudgetAlert(budgetAlert);

// Provider switch
notifications.showProviderSwitch('openai', 'gemini', 'rate limit exceeded');

// Cost saving tip
notifications.showCostSavingTip('Use Gemini for 90% savings', 5.20);

// Request completed with details
notifications.showRequestCompleted('CV Optimization', 0.02, 2500);

// Subscribe to notifications
const manager = getNotificationManager();

const unsubscribe = manager.subscribe((notifications) => {
  // Render in your UI
  notifications.forEach(notif => {
    showToast(notif.title, notif.message, notif.level);
  });
});

// Dismiss notification
manager.dismiss(notificationId);

// Dismiss all
manager.dismissAll();

// Get all active notifications
const active = manager.getAll();
```

---

### 📊 Usage Dashboard

```tsx
import React from 'react';
import { UsageDashboard } from './components/UsageDashboard';

function SettingsPage() {
  return (
    <div>
      <h1>API Usage & Costs</h1>
      
      <UsageDashboard 
        provider="openai" 
        refreshInterval={5000}  // Update every 5 seconds
      />
    </div>
  );
}

// Dashboard shows:
// - Today's cost, budget remaining, avg cost/request
// - Rate limit progress bars (RPM, TPM, Budget)
// - Cost breakdown by provider
// - Queue status
// - Alerts and warnings
```

---

## Complete Integration Example

```typescript
// App.tsx
import React, { useState } from 'react';
import { smartAI } from './utils/smartAIIntegration';
import { UsageDashboard } from './components/UsageDashboard';
import { getNotificationManager } from './utils/notificationManager';
import { getBudgetManager } from './utils/budgetManager';
import { getAnalytics } from './utils/advancedAnalytics';

function App() {
  const [notifications, setNotifications] = useState([]);
  
  // Subscribe to notifications
  React.useEffect(() => {
    const manager = getNotificationManager();
    return manager.subscribe(setNotifications);
  }, []);

  // Set budget on mount
  React.useEffect(() => {
    getBudgetManager({
      period: 'daily',
      limit: 10.0,
      alertThresholds: [0.5, 0.8, 0.95]
    });
  }, []);

  const handleOptimizeCV = async () => {
    try {
      const result = await smartAI.optimizeCV(cvData, jobDescription, {
        provider: 'openai',
        tier: 'tier-1',
        onProgress: (progress) => {
          console.log(progress.message);
          setProgressMessage(progress.message);
        }
      });

      console.log('✅ Optimization complete!');
      console.log('Cost:', result.metadata.cost);
      console.log('Duration:', result.metadata.duration + 'ms');
      console.log('Cached:', result.metadata.cached);
      
      // Show insights
      const analytics = getAnalytics();
      const insights = analytics.getInsights();
      
      if (insights.length > 0) {
        console.log('💡 Insights:', insights[0].message);
      }
      
    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
    }
  };

  return (
    <div className="app">
      {/* Notifications */}
      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.level}`}>
            <strong>{notif.title}</strong>
            <p>{notif.message}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <button onClick={handleOptimizeCV}>
        Optimize CV
      </button>

      {/* Usage Dashboard */}
      <UsageDashboard provider="openai" />
    </div>
  );
}

export default App;
```

---

## Migration Guide

### From Old Code to New Smart AI

**Before:**
```typescript
import { createAIProvider } from './utils/aiProviders';

const provider = createAIProvider({ provider: 'openai', apiKey });

try {
  const result = await provider.optimizeCV(cvData, jobDescription);
  console.log(result);
} catch (error) {
  if (error.message.includes('429')) {
    // Handle rate limit manually...
    await sleep(60000);
    // Retry...
  }
}
```

**After:**
```typescript
import { smartAI } from './utils/smartAIIntegration';

// That's it! All features automatic:
const result = await smartAI.optimizeCV(cvData, jobDescription);

// Access metadata:
console.log('Cost:', result.metadata.cost);
console.log('Cached:', result.metadata.cached);
console.log('Provider:', result.metadata.provider);
```

**What You Get Automatically:**
✅ Rate limit tracking & waiting  
✅ Automatic request queuing  
✅ Result caching  
✅ Provider fallback on errors  
✅ Cost tracking  
✅ Analytics  
✅ Notifications  

**No manual error handling needed!** 🎉

---

## Best Practices

### 1. Set Budget Early
```typescript
// In your app initialization
getBudgetManager({
  period: 'daily',
  limit: 10.0,
  autoStopAt: 0.95  // Stop at 95% to avoid overages
});
```

### 2. Configure Tier Correctly
```typescript
// Set your OpenAI tier based on your account
const result = await smartAI.optimizeCV(cvData, jobDesc, {
  tier: 'tier-1'  // or 'free', 'tier-2', etc.
});
```

### 3. Use Progress Callbacks
```typescript
await smartAI.optimizeCV(cvData, jobDesc, {
  onProgress: (progress) => {
    // Show to user
    setLoadingMessage(progress.message);
    setProgress(progress.progress);
  }
});
```

### 4. Monitor Usage
```tsx
// Add dashboard to settings page
<UsageDashboard provider="openai" />
```

### 5. Review Analytics
```typescript
// Periodically review insights
const analytics = getAnalytics();
const insights = analytics.getInsights();

// Show cost-saving tips to users
insights
  .filter(i => i.type === 'cost_saving')
  .forEach(tip => {
    console.log('💡', tip.message);
  });
```

---

## Troubleshooting

### Issue: Still getting 429 errors

**Solution:**
```typescript
// 1. Check your tier setting
const tracker = getRateLimitTracker('openai', 'tier-1');

// 2. Enable queue
await smartAI.optimizeCV(cvData, jobDesc, {
  enableQueue: true
});

// 3. Check rate limit before manual calls
const { allowed, waitTimeMs } = await checkRateLimit('openai', 2000);
if (!allowed) {
  await new Promise(r => setTimeout(r, waitTimeMs));
}
```

### Issue: Budget alerts not showing

**Solution:**
```typescript
// Configure budget first
getBudgetManager({ period: 'daily', limit: 10.0 });

// Listen for budget alerts
window.addEventListener('budgetAlert', (event) => {
  console.log('Budget alert:', event.detail);
});
```

### Issue: Cache not working

**Solution:**
```typescript
// Ensure caching is enabled
await smartAI.optimizeCV(cvData, jobDesc, {
  enableCache: true
});

// Check cache stats
import { cvOptimizationCache } from './utils/smartCache';
const stats = cvOptimizationCache.getStats();
console.log('Hit rate:', stats.hitRate);
```

### Issue: Fallback not working

**Solution:**
```typescript
// Configure fallback
import { getProviderManager } from './utils/smartProviderManager';

const manager = getProviderManager({
  providerPriority: ['openai', 'gemini', 'claude'],
  fallbackOnRateLimit: true,
  fallbackOnQuota: true
});

// Or use smartAI (fallback enabled by default)
await smartAI.optimizeCV(cvData, jobDesc, {
  enableFallback: true
});
```

---

## Performance Tips

1. **Enable caching** for frequently requested items
2. **Use queue** to automatically manage rate limits
3. **Enable fallback** for high availability
4. **Monitor analytics** to optimize costs
5. **Set appropriate tier** to get accurate rate limits
6. **Use semantic caching** for similar requests

---

## Security Notes

- API keys are stored in `chrome.storage.local` (encrypted recommended)
- Budget and usage data stored in `localStorage`
- No sensitive data sent to external servers
- All processing happens client-side

---

**Ready to use!** 🚀

All features work out-of-the-box with `smartAI.optimizeCV()` and `smartAI.generateCoverLetter()`.
