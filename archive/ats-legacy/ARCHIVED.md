# ATS Extension - Archived

**Date Archived:** 2025-10-06

## Status

This package has been **merged into the main extension** at `/extension`.

## What Happened?

The standalone Job ATS Extension has been integrated into the main AI CV & Cover Letter Optimizer extension to provide a unified experience. All ATS auto-fill features are now available as part of the main extension.

## New Location

All ATS code has been moved to:
- `/extension/src/ats/` - Core ATS functionality
- `/extension/src/ats/content/` - Content scripts for form detection and filling
- `/extension/src/ats/background/` - Background services (AI, crypto, request queue)
- `/extension/src/ats/lib/` - Shared utilities (storage, messaging, i18n, logger)
- `/extension/tests/ats/` - Test files

## Migration Notes

### Settings Migration

The extension automatically migrates old settings to the new structure:
- Old: `chrome.storage.local.settings`
- New: `chrome.storage.local.settings.ats.*`

### Features Preserved

All features from the standalone ATS extension have been preserved:
- ✅ Auto-fill for Workday, Greenhouse, Lever, Ashby, SmartRecruiters, SuccessFactors, Workable, iCIMS
- ✅ Job description extraction
- ✅ ATS score calculation
- ✅ Profile management
- ✅ Job tracking
- ✅ Context menu integration
- ✅ Keyboard shortcuts
- ✅ Domain allowlist with custom domain support
- ✅ Encryption support
- ✅ Request queue with rate limiting

### New Features

Additional features available in the merged extension:
- 🆕 Unified settings page with ATS toggle
- 🆕 Single extension to manage (CV optimizer + ATS auto-fill)
- 🆕 Shared storage and authentication
- 🆕 Better integration with CV optimization features

## For Developers

If you need to reference the original standalone implementation, this archived version contains the complete source code as it existed before the merge.

### Build System

The original extension used:
- Vite 5.0 + CRXJS
- Vitest for testing
- Playwright for E2E tests

The merged extension uses the same build system but with a unified configuration.

### Testing

Original tests have been moved to `/extension/tests/ats/` and can be run with:
```bash
cd /workspace/extension
npm test
```

## References

- Main extension: `/workspace/extension`
- Merge PR: See git history for details
- Documentation: Updated in main extension README

---

**Note:** This archive is preserved for historical reference only. All active development should be done in the main extension.
