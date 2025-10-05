# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes

---

## Step 1: Clone & Install (1 min)

```bash
# Clone repository
git clone https://github.com/your-repo/cv-optimizer.git
cd cv-optimizer

# Install dependencies
npm install
```

---

## Step 2: Run Tests (1 min)

```bash
# Run all tests
npm test

# Or use test runner script
./test-runner.sh

# Expected output:
# ✓ Unit tests passed!
# ✓ Coverage: 87%
# ✓ All tests passed!
```

---

## Step 3: Try Demo (1 min)

```bash
# Open demo in browser
open demo/index.html

# Or run local server
cd demo
python -m http.server 8000
# Visit http://localhost:8000
```

**Try these in demo:**
- ⚡ Streaming API (tab 1)
- 🤖 ML Selection (tab 2)
- 🔧 Web Workers (tab 3)
- Press `Ctrl+/` for shortcuts!

---

## Step 4: Use in Your App (2 min)

### Simple Usage
```typescript
import { smartAI } from './utils/smartAIIntegration';

// That's it! Everything automatic:
const result = await smartAI.optimizeCV(cvData, jobDescription);

console.log(result.result.optimizations);
console.log('Cost:', result.metadata.cost);
console.log('Provider:', result.metadata.provider);
```

### With Options
```typescript
const result = await smartAI.optimizeCV(cvData, jobDescription, {
  provider: 'openai',
  tier: 'tier-1',
  enableQueue: true,
  enableCache: true,
  enableFallback: true,
  enableAnalytics: true,
  onProgress: (progress) => {
    console.log(progress.message);
  }
});
```

---

## Step 5: Deploy (Optional)

```bash
# Build for production
npm run build

# Test build
npm run test

# Deploy
# - Chrome Extension: Upload dist/ to Chrome Web Store
# - Web App: Deploy to Vercel/Netlify
```

---

## 🎯 What You Get

### Automatic Features
✅ Rate limit protection  
✅ Request queuing  
✅ Result caching  
✅ Provider fallback  
✅ Cost tracking  
✅ Analytics  
✅ Notifications  

### Advanced Features
✅ Real-time streaming  
✅ ML provider selection  
✅ Web Worker processing  
✅ Dark mode (4 themes)  
✅ E2E encryption  
✅ Keyboard shortcuts  
✅ Plugin system  

---

## 💡 Quick Examples

### Example 1: Optimize CV
```typescript
import { smartAI } from './utils/smartAIIntegration';

const cvData = {
  personalInfo: { firstName: 'John', lastName: 'Doe', ... },
  experience: [...],
  skills: ['JavaScript', 'React', ...]
};

const jobDesc = 'Looking for senior software engineer...';

const result = await smartAI.optimizeCV(cvData, jobDesc);

// Apply optimizations
result.result.optimizations.forEach(opt => {
  console.log(`${opt.category}: ${opt.change}`);
});
```

### Example 2: Stream Cover Letter
```typescript
import { createStreamingProvider } from './utils/streamingAI';

const provider = createStreamingProvider('openai', apiKey);
const stream = provider.streamGenerateCoverLetter(cvData, jobDesc);

for await (const chunk of stream) {
  if (chunk.type === 'chunk') {
    console.log(chunk.content); // Real-time!
  }
}
```

### Example 3: ML Provider Selection
```typescript
import { getMLProviderSelector } from './utils/mlProviderSelector';

const mlSelector = getMLProviderSelector();

const bestProvider = await mlSelector.selectProvider({
  operation: 'optimizeCV',
  prioritize: 'cost', // or 'speed' or 'quality'
  budget: 0.05
});

console.log('Best provider:', bestProvider);
// Auto-learns and improves over time!
```

### Example 4: Dark Mode
```typescript
import { theme } from './utils/themeManager';

theme.setTheme('dark');
theme.enableAutoSwitch(18, 6); // Dark at 18:00, Light at 6:00
```

### Example 5: Keyboard Shortcuts
```typescript
import { shortcuts } from './utils/keyboardShortcuts';

shortcuts.register('ctrl+o', 'Optimize CV', () => {
  optimizeCV();
});

// Press Ctrl+/ to see all shortcuts
```

---

## 📚 Next Steps

### Learn More
1. **Detailed Docs:** `USAGE_EXAMPLES.md`
2. **All Features:** `ROADMAP_COMPLETE.md`
3. **Testing:** `TESTING_GUIDE.md`

### Explore Features
1. Try interactive demo
2. Run tests
3. Read source code
4. Experiment!

### Customize
1. Configure budget limits
2. Set your OpenAI tier
3. Choose preferred provider
4. Create custom themes

---

## 🐛 Troubleshooting

### Tests not running?
```bash
npm install --save-dev vitest @vitest/ui
npm test
```

### Demo not working?
- Use modern browser (Chrome, Firefox, Safari)
- Enable JavaScript
- Clear cache

### Import errors?
```bash
npm install
npm run type-check
```

---

## ✅ Checklist

Before using in production:

- [ ] Run all tests (`npm test`)
- [ ] Check coverage (`npm run test:coverage`)
- [ ] Try demo (`demo/index.html`)
- [ ] Configure API keys
- [ ] Set budget limits
- [ ] Choose your tier
- [ ] Enable features you want

---

## 🎉 You're Ready!

**5 minutes to enterprise-grade CV optimization!**

**Questions?**
- Check documentation
- Try demo
- Run tests
- Open issue

**Happy optimizing! 🚀**
