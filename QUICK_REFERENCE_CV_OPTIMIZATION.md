# Quick Reference: CV Optimization System

## 🚀 How It Works (1 Minute Read)

### The Problem
Optimizations were visual-only. Clicking "Apply" didn't change the actual CV data.

### The Solution
```typescript
// 1. Store original CV when optimizing
setOriginalCVData(cvData);

// 2. When user toggles optimization
const optimizedCV = applyCVOptimizations(originalCVData, optimizations);
setCVData(optimizedCV);

// 3. Exports now use optimized data automatically
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/utils/cvOptimizer.ts` | **Core logic** - applies optimizations to CV data |
| `src/popup.tsx` | **State management** - handles optimization toggles |
| `src/types.ts` | **Type definitions** - ATSOptimization interface |

---

## 💡 Quick Usage

### Apply an Optimization
```typescript
// In popup.tsx
const handleOptimizationsChange = (newOptimizations: ATSOptimization[]) => {
  setOptimizations(newOptimizations);
  if (originalCVData) {
    const optimizedCV = applyCVOptimizations(originalCVData, newOptimizations);
    setCVData(optimizedCV);
  }
};
```

### Add New Section Support
```typescript
// In cvOptimizer.ts - Add to applyCVOptimizations()
optimizedCV.newSection.forEach(item => {
  if (item.field) {
    item.field = replaceText(item.field, opt.originalText, opt.optimizedText);
  }
});
```

### Create Optimization from AI
```typescript
// AI provider response format
{
  optimizations: [{
    category: "Keywords",
    change: "Add technical terms",
    originalText: "experienced developer",
    optimizedText: "experienced Full-Stack developer",
    section: "summary"  // optional but recommended
  }]
}
```

---

## 🎯 State Variables

```typescript
cvData          // Current CV (with optimizations applied)
originalCVData  // Original CV (baseline)
optimizations   // Array of optimization objects with 'applied' flags
```

**Important:** Never modify `originalCVData` directly. Always work from a copy.

---

## 🛠️ Common Tasks

### Task 1: Add Optimization Category
```typescript
// Just use any string in 'category' field
const opt = {
  category: "Your New Category",
  // ... other fields
};
```

### Task 2: Make Optimization Persist
Already done! Optimizations save automatically in:
- Draft (every 400ms)
- When state changes

### Task 3: Debug Optimization Not Applying
```typescript
// Check these in order:
1. Is optimization.applied = true?
2. Is originalCVData set?
3. Does originalText exist in CV?
4. Check console for errors in applyCVOptimizations()
```

### Task 4: Clear All Optimizations
```typescript
setOptimizations([]);
setOriginalCVData(null);
```

---

## ⚠️ Important Rules

1. **Never mutate originalCVData** - Always create new copy
2. **Clear optimizations on manual edit** - Already handled in `handleCVDataChange`
3. **Clear optimizations on profile load** - Already handled in `handleLoadProfile`
4. **Use case-insensitive matching** - Already implemented in `replaceText()`

---

## 🔍 Debugging Tips

### Optimization Not Showing in Preview?
```typescript
// Check CVPreview.tsx - highlightOptimized() function
// Ensure optimization.applied = true
// Check if optimizedText exists in cvData
```

### Export Doesn't Contain Optimized Text?
```typescript
// Check that cvData contains optimized text BEFORE export
console.log(cvData); // Should show optimized text
// DocumentGenerator uses cvData directly
```

### State Not Persisting?
```typescript
// Check draft autosave includes originalCVData
StorageService.saveDraft({
  // ...
  originalCVData,  // ← Must be included
  optimizations
});
```

---

## 📊 Flow Chart

```
User clicks "Optimize CV"
         ↓
Store originalCVData (copy of current cvData)
         ↓
AI returns optimizations (all applied=false)
         ↓
User toggles optimization
         ↓
handleOptimizationsChange() called
         ↓
applyCVOptimizations(originalCVData, optimizations)
         ↓
Returns new CVData object with changes applied
         ↓
setCVData(optimizedCV)
         ↓
UI updates (preview + export ready)
```

---

## 🧪 Quick Test

```typescript
// 1. Add test data
const cvData = {
  personalInfo: { summary: "I am a developer" },
  // ... other fields
};

// 2. Create optimization
const opt = {
  applied: true,
  originalText: "developer",
  optimizedText: "senior developer"
};

// 3. Apply
const result = applyCVOptimizations(cvData, [opt]);

// 4. Verify
console.log(result.personalInfo.summary); 
// Expected: "I am a senior developer"
```

---

## 📞 Need Help?

1. Read `CV_OPTIMIZATION_FIXES.md` (Turkish)
2. Read `CV_OPTIMIZATION_FIXES_EN.md` (English)
3. Read `IMPLEMENTATION_SUMMARY.md` (Overview)
4. Check `src/utils/cvOptimizer.ts` (Well-commented code)

---

**Last Updated:** 2025-10-04  
**Status:** Production-Ready ✅
