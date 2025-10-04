# Project Structure

This repository contains two versions of the AI CV & Cover Letter Optimizer Chrome Extension:

## Main Extension (Root `/src` directory)
- **Build Tool**: Webpack
- **Location**: `/src`, `/manifest.json`, `/package.json`
- **Status**: Legacy/Stable version
- **Build Command**: `npm run build`
- **Output**: `/dist`

This is the original version of the extension using Webpack for bundling.

## New Extension (Extension directory)
- **Build Tool**: Vite + CRXJS
- **Location**: `/extension`
- **Status**: Modern/Development version
- **Build Command**: `cd extension && npm run build`
- **Output**: `/extension/dist`

This is a newer implementation using Vite for faster development and CRXJS for better Chrome extension support.

## Key Differences

| Feature | Main Extension | Extension Directory |
|---------|---------------|---------------------|
| Build Tool | Webpack | Vite |
| jspdf version | 3.0.3 (updated) | 3.0.3 (secure) |
| pdfjs-dist version | 5.4.149 (updated) | 5.4.149 (secure) |
| docx version | 9.5.1 (updated) | 9.5.1 |
| React version | 18.2.0 | 19.2.0 |
| Dev Experience | Slower rebuilds | Fast HMR |
| Manifest | JSON | TypeScript |

## Recommendation

**For new development**: Use the `/extension` directory with Vite for better developer experience.

**For production**: Both versions should work, but the Vite version has:
- Faster build times
- Better development experience with Hot Module Replacement
- Modern tooling
- Up-to-date dependencies with security fixes

## Migration Path

To fully consolidate to the Vite version:

1. Test all features in the `/extension` version
2. Update any missing features from `/src` to `/extension`
3. Archive or remove the `/src` directory
4. Move `/extension` contents to root
5. Update documentation and CI/CD pipelines
