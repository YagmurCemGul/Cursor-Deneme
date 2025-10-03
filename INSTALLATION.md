# Installation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This will create a `dist/` folder with all the compiled files.

### 3. Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle switch in top-right corner)
4. Click "Load unpacked"
5. Select the `dist` folder from this project
6. The extension should now appear in your Chrome toolbar

## Development Mode

To work on the extension with live reloading:

```bash
npm run dev
```

This will watch for file changes and rebuild automatically. After changes, go to `chrome://extensions/` and click the reload icon for the extension.

## Adding Icons

The extension includes placeholder icons. For a professional look, you should replace them:

1. Create or design three icon sizes:
   - 16x16 pixels (icon16.png)
   - 48x48 pixels (icon48.png)
   - 128x128 pixels (icon128.png)

2. Place them in the `icons/` folder

3. Rebuild the extension:
   ```bash
   npm run build
   ```

## AI Configuration (Optional)

To enable real AI-powered optimization (instead of demo mode):

1. Get an API key from OpenAI or your preferred AI provider
2. The extension will prompt you to enter it on first use
3. The API key is stored locally in Chrome storage

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Delete `node_modules` and `dist` folders
2. Run `npm install` again
3. Run `npm run build`

### Extension Not Loading

If the extension doesn't load in Chrome:

1. Check that you selected the `dist` folder (not the root folder)
2. Look for error messages in the Extensions page
3. Try disabling and re-enabling the extension

### Missing Dependencies

If you see errors about missing packages:

```bash
npm install
```

If that doesn't work:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Verification

After installation, verify the extension works by:

1. Clicking the extension icon in Chrome toolbar
2. The popup should open with the CV Optimizer interface
3. You should see 4 tabs: CV Information, Optimize & Preview, Cover Letter, Profiles

## Next Steps

Once installed, check out the [README.md](README.md) for usage instructions and feature documentation.
