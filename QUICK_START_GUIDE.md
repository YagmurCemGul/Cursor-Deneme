# Quick Start Guide - API Enhancements

## What's New?

Your AI CV Optimizer now has powerful new features for better reliability and user experience:

- ⏱️ **Timeout Management** - No more endless waiting
- 📊 **Progress Indicators** - See what's happening in real-time
- 📝 **Detailed Logging** - Better debugging and monitoring
- 🔌 **Offline Support** - Work even without internet
- 💾 **Smart Caching** - Faster responses for repeat requests

## Quick Setup

### 1. Basic Configuration (Optional)

The enhancements work automatically, but you can customize:

```typescript
import { APIManager } from './utils/apiManager';

// Set default timeout (optional - defaults are good for most cases)
APIManager.setDefaultTimeout(30000); // 30 seconds
```

### 2. Using with AI Service

```typescript
import { AIService } from './utils/aiService';

// Create AI service with enhancements
const aiService = new AIService({
  provider: 'openai',
  apiKey: 'your-api-key',
  timeout: 60000,      // 60 seconds (optional)
  enableCache: true,   // Cache responses (optional, default: true)
  cacheTTL: 300000,    // Cache for 5 minutes (optional)
});

// Use normally - enhancements work automatically!
const result = await aiService.optimizeCV(cvData, jobDescription);
```

### 3. Show Progress to Users

```typescript
import { ProgressTracker } from './utils/progressTracker';

// Subscribe to progress updates
const unsubscribe = ProgressTracker.subscribeAll((progress) => {
  // Update your UI
  updateProgressBar(progress.progress);
  showMessage(progress.message);
  
  // Handle different states
  if (progress.status === 'success') {
    showSuccess();
  } else if (progress.status === 'error') {
    showError(progress.error);
  } else if (progress.status === 'offline') {
    showOfflineWarning();
  }
});

// Clean up when component unmounts
// unsubscribe();
```

### 4. Handle Offline Scenarios

```typescript
import { OfflineSupportManager } from './utils/offlineSupport';

// Check if online
if (!OfflineSupportManager.isCurrentlyOnline()) {
  // Show offline UI or queue operation
  alert('You are offline. Your request will be processed when connection is restored.');
}

// Subscribe to online/offline events
OfflineSupportManager.subscribe((status) => {
  if (status.isOnline) {
    showOnlineIndicator();
  } else {
    showOfflineIndicator();
  }
});

// Get offline suggestions (works without internet!)
const suggestions = OfflineSupportManager.getOfflineOptimizationSuggestions(cvData);
```

### 5. View Metrics and Logs

```typescript
import { logger } from './utils/logger';

// Get API call statistics
const stats = logger.getAPICallStats();
console.log('API Statistics:', stats);
// { total: 50, success: 48, error: 2, timeout: 0, averageDuration: 1234 }

// Get performance metrics
const metrics = logger.getMetrics('cv-optimization');
console.log('Performance:', metrics);
// { count: 10, average: 1200, min: 800, max: 2000, total: 12000 }

// Export logs for debugging
const logs = logger.exportLogs();
// Download or send logs
```

## Common Use Cases

### Show Progress Bar

```typescript
import { ProgressTracker } from './utils/progressTracker';

function MyComponent() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const unsubscribe = ProgressTracker.subscribeAll((p) => {
      setProgress(p.progress);
      setMessage(p.message);
    });
    return unsubscribe;
  }, []);
  
  return (
    <div>
      <ProgressBar value={progress} />
      <p>{message}</p>
    </div>
  );
}
```

### Handle Timeout Errors

```typescript
try {
  const result = await aiService.optimizeCV(cvData, jobDescription);
} catch (error) {
  if (error.message.includes('timeout')) {
    alert('Request timed out. Please try again.');
  } else if (error.message.includes('No internet connection')) {
    alert('You are offline. Please check your connection.');
  } else {
    alert('An error occurred: ' + error.message);
  }
}
```

### Clear Cache

```typescript
import { APIManager } from './utils/apiManager';

// Clear all cache (e.g., on logout)
APIManager.clearCache();

// Or clear specific entry
APIManager.clearCacheEntry('specific-cache-key');
```

### Monitor Performance

```typescript
import { logger } from './utils/logger';

// Start timer
logger.startTimer('my-operation');

// ... do operation ...

// End timer (returns duration)
const duration = logger.endTimer('my-operation');

// Get metrics later
const metrics = logger.getMetrics('my-operation');
console.log(`Average: ${metrics.average}ms`);
```

## Default Settings

All enhancements have sensible defaults:

- **Timeout**: 30 seconds (API calls), 60 seconds (AI operations)
- **Max Timeout**: 2 minutes
- **Cache**: Enabled by default
- **Cache TTL**: 5 minutes
- **Retries**: 2 retries with exponential backoff
- **Log Level**: INFO (DEBUG in development)

## Tips

1. **Progress Updates**: Always show progress for operations >2 seconds
2. **Error Messages**: Show user-friendly messages for timeouts/offline
3. **Cache**: Keep enabled for better performance
4. **Cleanup**: Unsubscribe from progress updates when done
5. **Monitoring**: Check metrics regularly in production

## Troubleshooting

### "Request timeout" errors
→ Increase timeout: `timeout: 90000` (90 seconds)

### High memory usage
→ Clear cache regularly: `APIManager.clearCache()`
→ Clear log history: `logger.clearHistory()`

### Slow performance
→ Check if caching is enabled: `enableCache: true`
→ Review metrics: `logger.getAPICallStats()`

### Offline not working
→ System initializes automatically with AIService
→ Check: `OfflineSupportManager.isCurrentlyOnline()`

## Need Help?

1. Check full documentation: `API_ENHANCEMENTS.md`
2. Review implementation summary: `IMPLEMENTATION_SUMMARY.md`
3. Export logs for debugging: `logger.exportLogs()`
4. Check code comments - all functions are documented

## What Happens Automatically?

You don't need to do anything special - these work automatically:

✅ Timeout protection on all API calls
✅ Automatic retries on transient failures
✅ Response caching for repeated requests
✅ Request deduplication
✅ Offline detection
✅ Progress tracking
✅ Performance logging

Just use your existing code, and the enhancements work behind the scenes!
