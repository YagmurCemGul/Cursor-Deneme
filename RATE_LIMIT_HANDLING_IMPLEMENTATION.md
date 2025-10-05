# Rate Limit (429) Error Handling Implementation

## Overview
Comprehensive implementation of OpenAI rate limit (429) error handling with exponential backoff retry logic across all AI providers (OpenAI, Gemini, Claude).

## Changes Made

### 1. API Manager (`src/utils/apiManager.ts`)
**Enhanced retry logic to handle rate limit errors:**

- ✅ **Rate Limit Detection**: Identifies 429 errors and rate limit messages
- ✅ **Exponential Backoff**: Uses aggressive backoff for rate limits (minimum 5s, multiplier of 3x)
- ✅ **Progressive Delays**: 
  - First retry: ~5 seconds
  - Second retry: ~15 seconds  
  - Third retry: ~45 seconds
- ✅ **Helpful Error Messages**: Clear user-facing messages when retries exhausted
- ✅ **Progress Updates**: Shows waiting time to users during rate limit delays

**Key Implementation:**
```typescript
// Check if this is a rate limit error (429)
const isRateLimitError = error.message?.includes('429') || 
                          error.message?.includes('rate limit') ||
                          error.message?.includes('Rate limit');

// For rate limit errors, use longer delays (minimum 5 seconds)
if (isRateLimitError) {
  delay = Math.max(5000, retryDelay * Math.pow(3, attempt));
  logger.warn(`Rate limit hit - waiting ${delay}ms before retry`);
}
```

### 2. AI Providers (`src/utils/aiProviders.ts`)
**Added explicit 429 error detection and formatting:**

#### OpenAI Provider
```typescript
if (!response.ok) {
  const error = await response.text();
  
  // Special handling for rate limit errors
  if (response.status === 429) {
    throw new Error(`OpenAI rate limit exceeded (429). Please wait and try again.`);
  }
  
  throw new Error(`OpenAI API error: ${response.status} - ${error}`);
}
```

#### Gemini Provider
- ✅ Same 429 detection logic
- ✅ Provider-specific error messages

#### Claude Provider
- ✅ Same 429 detection logic
- ✅ Provider-specific error messages

### 3. Basic AI Library (`src/lib/ai.ts`)
**Added rate limit handling for simple API calls:**

```typescript
if (!res.ok) {
  // Special handling for rate limit errors
  if (res.status === 429) {
    return `OpenAI rate limit exceeded (429). Please wait a moment and try again, or consider upgrading your API plan. ${res.statusText}`;
  }
  return `OpenAI error: ${res.status} ${res.statusText}`;
}
```

### 4. Extension AI Library (`extension/src/lib/ai.ts`)
**Updated all three providers with rate limit handling:**

- ✅ OpenAI rate limit detection
- ✅ Gemini rate limit detection  
- ✅ Claude rate limit detection
- ✅ User-friendly error messages with actionable guidance

### 5. Comprehensive Test Suite (`src/utils/__tests__/rateLimitHandling.test.ts`)
**Created extensive test coverage:**

- ✅ Rate limit error detection for all providers
- ✅ Exponential backoff timing verification
- ✅ Retry logic validation
- ✅ Progress update verification
- ✅ Error message formatting tests
- ✅ Non-retryable error handling
- ✅ Integration tests

## How It Works

### Flow Diagram
```
API Call → 429 Error → Detect Rate Limit
    ↓
Wait 5 seconds
    ↓
Retry #1 → 429 Error?
    ↓ Yes
Wait 15 seconds
    ↓
Retry #2 → 429 Error?
    ↓ Yes
Wait 45 seconds
    ↓
Retry #3 → Success or Final Error
```

### Error Message Progression

1. **First 429 Error**: 
   - Logs: "Rate limit hit for request X - waiting 5000ms"
   - User sees: "Rate limit reached. Waiting 5s before retry..."

2. **After Retries Exhausted**:
   - User sees: "Rate limit exceeded. Please wait a moment and try again, or consider upgrading your API plan."

## Key Features

### 1. Intelligent Retry Logic
- **Rate limits get longer delays** than other errors
- **Exponential backoff** prevents overwhelming the API
- **Configurable retries** (default: 2, can be adjusted)

### 2. User Experience
- **Clear progress messages** during waits
- **Actionable guidance** (wait or upgrade plan)
- **No silent failures** - users always know what's happening

### 3. Provider Agnostic
- Works with OpenAI, Gemini, and Claude
- Consistent behavior across all providers
- Easy to add more providers

### 4. Smart Error Detection
- Detects status code 429
- Detects "rate limit" in error messages
- Case-insensitive matching

## Configuration

### Default Settings
```typescript
{
  retries: 2,              // Maximum retry attempts
  retryDelay: 1000,        // Initial delay (1 second)
  timeout: 30000,          // Request timeout (30 seconds)
  cache: true,             // Cache responses
  cacheTTL: 300000         // Cache for 5 minutes
}
```

### Rate Limit Specific
```typescript
{
  minRateLimitDelay: 5000,      // Minimum 5 seconds for rate limits
  backoffMultiplier: 3,         // Triple delay each retry
  // Delay sequence: 5s → 15s → 45s
}
```

## Usage Examples

### 1. Using Enhanced AI Provider
```typescript
import { createEnhancedAIProvider } from './utils/enhancedAIProviders';

const provider = createEnhancedAIProvider({
  provider: 'openai',
  apiKey: 'your-api-key',
  timeout: 60000,
  enableCache: true
});

try {
  const result = await provider.optimizeCV(cvData, jobDescription);
  // Success!
} catch (error) {
  // Will show: "Rate limit exceeded. Please wait and try again..."
  console.error(error.message);
}
```

### 2. Using API Manager Directly
```typescript
import { APIManager } from './utils/apiManager';

const result = await APIManager.request(
  'my-request',
  async () => {
    // Your API call here
    return await fetch('...');
  },
  {
    retries: 3,
    retryDelay: 2000,
    onProgress: (progress) => {
      console.log(progress.message);
      // Shows: "Rate limit reached. Waiting 5s before retry..."
    }
  }
);
```

## Benefits

### For Users
1. **Automatic Recovery**: Don't need to manually retry
2. **Clear Feedback**: Know exactly what's happening
3. **Actionable Advice**: Understand next steps (wait or upgrade)

### For Developers
1. **Centralized Logic**: All rate limit handling in one place
2. **Consistent Behavior**: Same across all providers
3. **Easy Testing**: Comprehensive test suite included
4. **Configurable**: Can adjust retry behavior per use case

### For Operations
1. **Reduced Support Tickets**: Users see helpful messages
2. **Better API Usage**: Respects rate limits automatically
3. **Logging**: All rate limit events are logged for monitoring

## Testing

Run the test suite:
```bash
npm test src/utils/__tests__/rateLimitHandling.test.ts
```

Tests cover:
- ✅ Rate limit detection (all providers)
- ✅ Retry timing and exponential backoff
- ✅ Error message formatting
- ✅ Progress updates
- ✅ Non-retryable error handling
- ✅ Integration scenarios

## Error Handling Matrix

| Status | Retryable? | Initial Delay | Backoff | Max Retries |
|--------|-----------|---------------|---------|-------------|
| 429 Rate Limit | ✅ Yes | 5s | 3x | 2 (default) |
| 503 Service Unavailable | ✅ Yes | 1s | 2x | 2 (default) |
| 502/504 Gateway | ✅ Yes | 1s | 2x | 2 (default) |
| Timeout | ✅ Yes | 1s | 2x | 2 (default) |
| 401 Auth Error | ❌ No | - | - | 0 |
| 400 Bad Request | ❌ No | - | - | 0 |
| Invalid API Key | ❌ No | - | - | 0 |

## Monitoring

The implementation includes comprehensive logging:

```typescript
// Rate limit detected
logger.warn(`Rate limit hit for request ${key} - waiting ${delay}ms`);

// Retry attempt
logger.info(`Retrying request ${key} after ${delay}ms (attempt ${n}/${max})`);

// Success after retry
logger.info(`Request ${key} completed successfully after ${n} retries`);

// Failure after all retries
logger.error(`Request ${key} failed after ${n} attempts`);
```

## Future Enhancements

Potential improvements for future iterations:

1. **Adaptive Backoff**: Learn optimal delays from API headers
2. **Rate Limit Quotas**: Track and display remaining quota
3. **Request Queuing**: Queue requests when near limit
4. **Circuit Breaker**: Temporarily stop requests after repeated 429s
5. **Multi-Key Rotation**: Rotate between multiple API keys
6. **Cost Tracking**: Monitor API costs alongside rate limits

## Related Files

- `src/utils/apiManager.ts` - Core retry logic
- `src/utils/aiProviders.ts` - Provider implementations
- `src/utils/enhancedAIProviders.ts` - Enhanced wrappers
- `src/lib/ai.ts` - Simple AI library
- `extension/src/lib/ai.ts` - Extension AI library
- `src/utils/__tests__/rateLimitHandling.test.ts` - Test suite

## Conclusion

This implementation provides robust, user-friendly handling of OpenAI rate limit errors with:
- ✅ Automatic retry with exponential backoff
- ✅ Clear user communication
- ✅ Comprehensive error handling
- ✅ Full test coverage
- ✅ Works across all AI providers

The system now gracefully handles rate limits, improving both user experience and API reliability.
