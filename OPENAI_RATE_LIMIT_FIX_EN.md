# OpenAI Rate Limit and Quota Error Fixes

## Problem
Users were receiving 429 (Rate Limit Exceeded) errors from OpenAI API despite having budget in their accounts. The error messages didn't distinguish between **rate limit** (too many requests) and **quota/budget** (insufficient credits) issues.

## OpenAI 429 Error Types

OpenAI API returns 429 errors for 2 different reasons:

### 1. Rate Limit (Request Frequency)
- **Cause**: Sending too many requests in a short time period
- **Example**: Sending 10 requests when you have a limit of 3 requests per minute
- **Solution**: 
  - Wait 20-60 seconds and try again
  - Add more delay between requests
  - Upgrade your API plan for higher rate limits
- **Retry**: Yes, automatically retried with exponential backoff

### 2. Quota/Budget Limit
- **Cause**: Insufficient credits or quota in your account
- **Examples**:
  - Free tier monthly limit exhausted
  - Payment method declined
  - No credits added to account
- **Solution**:
  - Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)
  - Add credits at [OpenAI Billing](https://platform.openai.com/account/billing)
  - Wait for monthly reset if on free tier
- **Retry**: No, cannot retry until credits are added

## Improvements Made

### 1. Enhanced Error Detection
```typescript
// BEFORE - Simple error
if (response.status === 429) {
  throw new Error(`OpenAI rate limit exceeded (429). Please wait and try again.`);
}

// AFTER - Detailed error analysis
if (response.status === 429) {
  const errorMessage = errorJson.error?.message || errorText;
  const errorType = errorJson.error?.type || 'unknown';
  
  // Is it a quota error?
  if (errorMessage.includes('quota') || 
      errorMessage.includes('insufficient_quota') || 
      errorType === 'insufficient_quota') {
    throw new Error(
      `OpenAI quota exceeded: ${errorMessage}\n\n` +
      `Your account has insufficient quota/credits. Please:\n` +
      `1. Check your usage at https://platform.openai.com/usage\n` +
      `2. Add credits or upgrade your plan at https://platform.openai.com/account/billing\n` +
      `3. Wait for your monthly quota to reset if on free tier`
    );
  } else {
    // Rate limit error
    throw new Error(
      `OpenAI rate limit exceeded (429): ${errorMessage}\n\n` +
      `You're sending requests too quickly. Please:\n` +
      `1. Wait 20-60 seconds before trying again\n` +
      `2. Reduce the frequency of your requests\n` +
      `3. Consider upgrading to a higher tier for increased rate limits`
    );
  }
}
```

### 2. API Manager Improvements
Enhanced retry logic in `src/utils/apiManager.ts`:

```typescript
// Don't retry quota errors
if (error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
  const quotaMessage = 'Quota exceeded: Your account has insufficient credits...';
  throw new Error(quotaMessage);
} else {
  // Longer backoff for rate limits
  const rateLimitMessage = 'Rate limit exceeded: Too many requests...';
  throw new Error(rateLimitMessage);
}
```

### 3. Retry Strategy
- **Rate Limit Errors**: 
  - 5 second minimum wait time
  - Exponential backoff: 5s → 15s → 45s
  - Maximum 2-3 retries
  
- **Quota Errors**:
  - No retry (retryable = false)
  - Clear guidance provided to user

## Updated Files

1. **src/utils/aiProviders.ts**
   - Enhanced 429 error handling in OpenAI provider
   - Both optimizeCV and generateCoverLetter functions

2. **extension/src/lib/aiProviders.ts**
   - Same improvements in extension OpenAI calls
   - Clearer messages for users

3. **extension/src/lib/aiProviders.improved.ts**
   - Production-ready version for all providers (OpenAI, Claude, Gemini)
   - Added retryable flag for quota errors

4. **src/utils/apiManager.ts**
   - Quota vs rate limit distinction in generic retry logic
   - Longer backoff times for rate limits

## Usage Examples

### Scenario 1: Rate Limit Error
```
Error: "OpenAI rate limit exceeded (429): Rate limit reached for requests

You're sending requests too quickly. Please:
1. Wait 20-60 seconds before trying again
2. Reduce the frequency of your requests
3. Consider upgrading to a higher tier for increased rate limits at https://platform.openai.com/account/limits"
```

**What to do**: Wait 1-2 minutes and try again. The system will automatically retry.

### Scenario 2: Quota/Budget Error
```
Error: "OpenAI quota exceeded: You exceeded your current quota, please check your plan and billing details

Your account has insufficient quota/credits. Please:
1. Check your usage at https://platform.openai.com/usage
2. Add credits or upgrade your plan at https://platform.openai.com/account/billing
3. Wait for your monthly quota to reset if on free tier"
```

**What to do**: Go to OpenAI dashboard and add credits or check your plan.

## Test Scenarios

### Test 1: Rate Limit Test
```typescript
// Send rapid successive requests
for (let i = 0; i < 10; i++) {
  await optimizeCV(cvData, jobDesc); // Should trigger rate limit
}
// Expected: "Rate limit exceeded" message, automatic retry
```

### Test 2: Quota Test  
```typescript
// With API key that has no credits
await optimizeCV(cvData, jobDesc);
// Expected: "Quota exceeded" message, no retry
```

## Prevention and Best Practices

1. **Delay Between Requests**
   ```typescript
   await delay(2000); // Wait 2 seconds between each request
   ```

2. **Queue for Batch Requests**
   ```typescript
   const queue = new RequestQueue({ 
     maxConcurrent: 1, 
     minDelay: 2000 
   });
   ```

3. **Use Caching**
   ```typescript
   // Cache to avoid resending same requests
   const cacheKey = generateCacheKey(cvData, jobDesc);
   ```

4. **Monitoring and Limits**
   - Regularly check usage dashboard
   - Alert when approaching rate limit
   - Track costs

## Useful Links

- [OpenAI Rate Limits Documentation](https://platform.openai.com/docs/guides/rate-limits)
- [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- [OpenAI Billing](https://platform.openai.com/account/billing)
- [OpenAI API Status](https://status.openai.com/)
- [API Key Limits](https://platform.openai.com/account/limits)

## Future Improvements

1. **Proactive Rate Limiting**
   - Track request count on client-side
   - Automatically slow down when approaching limits

2. **Cost Tracking**
   - Show cost per request
   - Daily/monthly cost limits

3. **Provider Fallback**
   - Automatically switch to Gemini/Claude when OpenAI quota/rate limit reached
   - Notify user of the switch

4. **Advanced Queue System**
   - Prioritize requests
   - Dynamic throttling based on rate limits

## Why You See 429 With Budget

Even though you have $18 budget, you can still get 429 errors due to:

1. **Tier-based Rate Limits**: OpenAI has different tiers with different rate limits
   - Free tier: Very limited requests per minute
   - Tier 1: Moderate limits (need to add $5+ credit)
   - Tier 2+: Higher limits (need more usage history)

2. **Your Current Situation**:
   - You have $18 budget ✅
   - But you're hitting the **requests per minute** limit ❌
   - The budget is fine, but you need to space out your requests

3. **Solution**:
   - Wait 20-60 seconds between requests
   - The improved error handling will now tell you exactly what the issue is
   - The system will automatically retry with proper delays

## Real OpenAI Error Messages

The code now properly parses these actual OpenAI error responses:

### Rate Limit (Retryable)
```json
{
  "error": {
    "message": "Rate limit reached for requests",
    "type": "requests",
    "code": "rate_limit_exceeded"
  }
}
```

### Quota (Not Retryable)
```json
{
  "error": {
    "message": "You exceeded your current quota, please check your plan and billing details",
    "type": "insufficient_quota",
    "code": "insufficient_quota"
  }
}
```
