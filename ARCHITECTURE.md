# Project Architecture

## Directory Structure

This project has two separate implementations:

### Main Project (`/src`)
- **Build Tool**: Webpack 5
- **Purpose**: Production-ready Chrome extension with comprehensive features
- **Entry Point**: `src/popup.tsx`
- **Features**: Full-featured CV optimizer with multiple templates, AI integration, advanced analytics
- **Status**: ✅ Active development, production-ready

### Experimental Extension (`/extension`)
- **Build Tool**: Vite
- **Purpose**: Alternative, lighter implementation for testing and experimentation
- **Entry Point**: `extension/src/popup/main.tsx`
- **Features**: Simplified CV optimizer with basic functionality
- **Status**: ⚠️ Experimental, not for production use

## Which to Use?

**For production and development, use the main `/src` folder.**

The `/extension` folder is kept for:
1. Testing alternative build approaches
2. Performance benchmarking
3. Experimental features before integrating into main codebase

## Build Commands

### Main Project (Recommended)
```bash
npm run build        # Production build
npm run dev          # Development watch mode
npm run type-check   # Type checking
npm run lint         # Linting
npm test            # Run tests
```

### Extension Folder (Experimental)
```bash
cd extension
npm install
npm run build
```

## Key Files

### Configuration
- `webpack.config.js` - Main build configuration
- `tsconfig.json` - TypeScript configuration
- `manifest.json` - Chrome extension manifest (v3)

### Entry Points
- `src/popup.tsx` - Main application entry
- `src/background/index.ts` - Background service worker

### Core Utilities
- `src/utils/aiService.ts` - AI provider integration
- `src/utils/fileParser.ts` - CV file parsing (PDF/DOCX)
- `src/utils/documentGenerator.ts` - Export functionality
- `src/utils/storage.ts` - Chrome storage service

## Build Output

The build process creates a `dist/` folder with:
- `popup.html` - Extension popup interface
- `popup.[hash].js` - Main application bundle
- `background.js` - Service worker (no hash for manifest compatibility)
- `vendors.[hash].js` - Third-party dependencies
- `react.[hash].js` - React library (code-split)
- `pdfjs.[hash].js` - PDF.js library (code-split)
- `docx.[hash].js` - Document generation libraries (code-split)
- `manifest.json` - Extension manifest
- `icons/` - Extension icons

## Bundle Size Optimization

The project uses several optimization strategies:
1. **Code Splitting**: Separates vendors, React, PDF.js, and DOCX libraries
2. **Tree Shaking**: Removes unused code (usedExports + sideEffects)
3. **Minification**: Production builds are minified
4. **Lazy Loading**: Heavy components can be lazy-loaded

Current bundle sizes:
- Main bundle: ~200KB
- Vendors: ~1.2MB (mostly PDF.js worker)
- React: ~150KB
- Total: ~2.3MB (within acceptable range for extension)

## TypeScript Configuration

Strict mode is progressively enabled:
- ✅ `strictFunctionTypes` - Enabled
- ✅ `strictBindCallApply` - Enabled
- ✅ `noImplicitThis` - Enabled
- ✅ `alwaysStrict` - Enabled
- ✅ `noImplicitReturns` - Enabled
- ✅ `noFallthroughCasesInSwitch` - Enabled
- ⏳ `strict` - To be enabled after fixing existing issues
- ⏳ `noImplicitAny` - To be enabled incrementally
- ⏳ `strictNullChecks` - To be enabled incrementally

## Extension Permissions

The extension requires:
- `storage` - Store CV profiles and settings
- `activeTab` - Access current tab (future feature)
- `downloads` - Download generated CVs
- `identity` - Google OAuth for Drive integration

## Future Improvements

1. **Bundle Size**:
   - Consider switching to PDF.js lite version
   - Implement dynamic imports for heavy features
   - Add service worker caching

2. **TypeScript**:
   - Enable full strict mode
   - Add comprehensive type coverage
   - Remove all `any` types

3. **Testing**:
   - Increase test coverage
   - Add E2E tests
   - Add visual regression tests

4. **Performance**:
   - Implement virtual scrolling for large lists
   - Add memoization for expensive computations
   - Optimize re-renders

5. **Features**:
   - Complete AI integration for interview questions
   - Add real-time collaboration
   - Implement offline support
