# Troubleshooting Guide

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Build Errors](#build-errors)
3. [Runtime Errors](#runtime-errors)
4. [API and Authentication Issues](#api-and-authentication-issues)
5. [Performance Issues](#performance-issues)
6. [Testing Issues](#testing-issues)
7. [Chrome Extension Issues](#chrome-extension-issues)

## Installation Issues

### npm install fails

**Problem:** Dependencies fail to install

**Solutions:**

1. Clear npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. Try using a different Node version:
```bash
nvm install 20
nvm use 20
npm install
```

3. Check for network/proxy issues:
```bash
npm config get proxy
npm config get https-proxy
```

### Module not found errors

**Problem:** Import statements fail

**Solution:**
```bash
# Rebuild and reinstall
npm run build
npm install
```

## Build Errors

### Webpack compilation fails

**Problem:** Build process crashes

**Common causes:**
- Syntax errors in TypeScript
- Missing type definitions
- Circular dependencies

**Solutions:**

1. Check TypeScript errors:
```bash
npm run type-check
```

2. Run linter:
```bash
npm run lint
```

3. Clean build:
```bash
rm -rf dist
npm run build
```

### TypeScript errors

**Problem:** Type checking fails

**Solutions:**

1. Update type definitions:
```bash
npm install --save-dev @types/chrome @types/react @types/react-dom
```

2. Check tsconfig.json settings
3. Add type assertions where necessary:
```typescript
const data = response as MyType;
```

## Runtime Errors

### "Cannot read property of undefined"

**Problem:** Accessing undefined values

**Solution:**
Use optional chaining and nullish coalescing:
```typescript
// Bad
const name = user.profile.name;

// Good
const name = user?.profile?.name ?? 'Unknown';
```

### React component not rendering

**Problem:** Component appears blank

**Debugging steps:**

1. Check browser console for errors
2. Verify props are passed correctly
3. Check conditional rendering logic
4. Use React DevTools to inspect component tree

**Common causes:**
```typescript
// Forgetting to return JSX
const MyComponent = () => {
  <div>Content</div>  // ❌ Missing return
}

// Correct
const MyComponent = () => {
  return <div>Content</div>  // ✅
}

// Or use implicit return
const MyComponent = () => (
  <div>Content</div>  // ✅
)
```

### State not updating

**Problem:** React state doesn't reflect changes

**Solutions:**

1. Ensure you're not mutating state directly:
```typescript
// Bad
data.push(newItem);
setData(data);

// Good
setData([...data, newItem]);
```

2. Use functional updates for dependent state:
```typescript
// Bad
setCount(count + 1);

// Good
setCount(prev => prev + 1);
```

### ErrorBoundary catches all errors

**Problem:** App constantly shows error UI

**Debugging:**

1. Check error logs:
```typescript
logger.error('Component error:', error, errorInfo);
```

2. Temporarily disable ErrorBoundary to see original error
3. Check for async errors not properly handled
4. Verify API responses

## API and Authentication Issues

### AI API returns errors

**Problem:** OpenAI/Gemini/Claude API fails

**Common errors and solutions:**

#### 1. Invalid API Key
```
Error: Invalid API key
```

**Solution:**
- Verify API key in Settings
- Check for extra spaces
- Regenerate key if needed
- Visit provider console to confirm key is active

#### 2. Rate Limit Exceeded
```
Error: Rate limit exceeded
```

**Solution:**
- Wait a few minutes before retrying
- Upgrade API plan if needed
- Implement exponential backoff (already included)

#### 3. Network Errors
```
Error: Network request failed
```

**Solution:**
- Check internet connection
- Verify firewall settings
- Check if API service is down (status pages)
- Try different network

#### 4. Content Policy Violation
```
Error: Content violates policy
```

**Solution:**
- Review input text for inappropriate content
- Sanitize job descriptions and CV data
- Contact API provider if false positive

### Google Drive authentication fails

**Problem:** Cannot connect to Google Drive

**Solutions:**

1. Check manifest.json OAuth configuration:
```json
{
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.file"
    ]
  }
}
```

2. Verify Google Cloud Console setup:
   - Correct OAuth 2.0 Client ID
   - Correct redirect URIs
   - APIs enabled (Drive, Docs, Sheets, Slides)

3. Clear authentication token:
```typescript
chrome.identity.clearAllCachedAuthTokens();
```

## Performance Issues

### Slow CV optimization

**Problem:** AI processing takes too long

**Solutions:**

1. Choose faster model:
   - OpenAI: Use `gpt-4o-mini` instead of `gpt-4`
   - Gemini: Use `gemini-1.5-flash` instead of `gemini-pro`
   - Claude: Use `claude-3-haiku` instead of `claude-3-opus`

2. Reduce temperature for faster responses
3. Check network latency
4. Verify no background processes consuming resources

### Extension is slow/laggy

**Problem:** UI feels sluggish

**Solutions:**

1. Check bundle size:
```bash
npm run build
du -sh dist
```

2. Profile with Chrome DevTools:
   - Open DevTools → Performance tab
   - Record while using extension
   - Identify slow operations

3. Optimize images:
   - Compress profile photos
   - Use appropriate image sizes
   - Implement lazy loading

### Memory leaks

**Problem:** Extension uses increasing memory

**Debugging:**

1. Check for:
   - Unremoved event listeners
   - Unclosed connections
   - Large objects in state
   - Circular references

2. Use Chrome Task Manager:
   - `Shift + Esc` in Chrome
   - Monitor extension memory usage

**Prevention:**
```typescript
useEffect(() => {
  const handler = () => {};
  element.addEventListener('click', handler);
  
  // Cleanup
  return () => {
    element.removeEventListener('click', handler);
  };
}, []);
```

## Testing Issues

### Tests fail to run

**Problem:** Jest crashes or hangs

**Solutions:**

1. Clear Jest cache:
```bash
npm test -- --clearCache
```

2. Check test configuration in `jest.config.js`

3. Verify all test dependencies installed:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Tests timeout

**Problem:** Async tests exceed timeout

**Solution:**
Increase timeout for specific test:
```typescript
it('should process large file', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Mock not working

**Problem:** Jest mocks don't intercept calls

**Solution:**
```typescript
// Mock before importing module
jest.mock('../utils/aiService');
import { aiService } from '../utils/aiService';

// Setup mock implementation
const mockAiService = aiService as jest.Mocked<typeof aiService>;
mockAiService.optimizeCV.mockResolvedValue({ /* ... */ });
```

### Coverage too low

**Problem:** Test coverage below 80%

**Solutions:**

1. Identify uncovered code:
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

2. Add tests for:
   - Error paths
   - Edge cases
   - Conditional branches
   - Async operations

## Chrome Extension Issues

### Extension won't load

**Problem:** Chrome rejects extension

**Common causes and solutions:**

1. **Manifest errors:**
   - Validate manifest.json syntax
   - Check required fields
   - Verify permissions

2. **Build artifacts missing:**
```bash
npm run build
# Check that dist/ folder contains:
# - manifest.json
# - popup.html
# - popup.js
# - styles.css
```

3. **Incorrect paths:**
   - Verify webpack output paths
   - Check file references in manifest

### Changes not reflected

**Problem:** Code changes don't appear

**Solutions:**

1. Rebuild extension:
```bash
npm run build
```

2. Reload extension in Chrome:
   - Go to `chrome://extensions/`
   - Click reload icon for your extension

3. Hard refresh popup:
   - Open popup
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Press `Cmd + Shift + R` (Mac)

4. Clear extension storage:
```typescript
chrome.storage.local.clear();
chrome.storage.sync.clear();
```

### Storage quota exceeded

**Problem:** Cannot save data

**Solution:**
Chrome storage has limits:
- `sync`: 100KB total, 8KB per item
- `local`: 5MB total (or unlimited with permission)

Optimize storage:
```typescript
// Compress large data
const compressed = JSON.stringify(data);

// Clean old data periodically
const profiles = await StorageService.getProfiles();
const recent = profiles.slice(-10); // Keep only 10 most recent
```

### Permissions not working

**Problem:** API calls fail due to permissions

**Solutions:**

1. Check manifest.json permissions:
```json
{
  "permissions": [
    "storage",
    "identity"
  ],
  "host_permissions": [
    "https://*.googleapis.com/*",
    "https://api.openai.com/*"
  ]
}
```

2. Request permissions at runtime if needed:
```typescript
chrome.permissions.request({
  origins: ['https://api.example.com/*']
});
```

## Common Error Messages

### "Extension Context Invalidated"

**Cause:** Extension was reloaded while popup was open

**Solution:** Close and reopen popup

### "Uncaught (in promise)"

**Cause:** Unhandled promise rejection

**Solution:**
```typescript
// Always handle promise rejections
try {
  await asyncOperation();
} catch (error) {
  logger.error('Operation failed', error);
  // Show user-friendly message
}
```

### "Maximum call stack size exceeded"

**Cause:** Infinite recursion or circular dependency

**Solution:**
- Check for infinite loops
- Verify recursive functions have base case
- Review import statements for circular dependencies

## Getting Further Help

If you've tried the solutions above and still have issues:

1. **Check existing issues:** Search [GitHub Issues](https://github.com/yourusername/ai-cv-optimizer/issues)

2. **Create new issue:** Include:
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs
   - Environment details (OS, Chrome version, Node version)
   - Screenshots if relevant

3. **Enable debug logging:**
```typescript
import { logger, LogLevel } from './utils/logger';
logger.setLevel(LogLevel.DEBUG);
```

4. **Check browser console:**
   - Right-click extension icon → Inspect popup
   - Look for errors in Console tab
   - Check Network tab for failed requests

5. **Review recent changes:**
```bash
git log --oneline -10
git diff HEAD~1
```

## Useful Commands

```bash
# Full cleanup and rebuild
rm -rf node_modules dist coverage
npm install
npm run build

# Run all checks
npm run lint
npm run type-check
npm test

# Debug specific test
npm test -- --testNamePattern="MyComponent"

# Analyze bundle size
npm run build
ls -lh dist/

# Check for outdated dependencies
npm outdated

# Update dependencies
npm update
```

## Prevention Tips

1. **Always use TypeScript** - Catches errors at compile time
2. **Write tests** - Prevents regressions
3. **Use logger** - Helps debug issues in production
4. **Handle errors gracefully** - Improves user experience
5. **Validate inputs** - Prevents bad data
6. **Use ErrorBoundary** - Catches React errors
7. **Monitor performance** - Use profiler regularly
8. **Keep dependencies updated** - Security and bug fixes
9. **Review logs** - Check for warnings and errors
10. **Test in clean environment** - Ensure reproducibility
