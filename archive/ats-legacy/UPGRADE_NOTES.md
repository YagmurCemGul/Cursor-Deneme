# Upgrade Notes

## Migrating to Job ATS Extension v1.0.0

**Target Audience**: Users of the previous webpack-based CV optimizer extension  
**Migration Type**: New implementation (not in-place upgrade)  
**Data Migration**: Manual export/import recommended

---

## Overview

Version 1.0.0 is a **complete rewrite** of the job application automation extension with:

- ✅ Manifest V3 (from Manifest V2)
- ✅ Vite + CRXJS (from Webpack)
- ✅ Tab-based dashboard (from popup)
- ✅ Domain allowlist (from `<all_urls>`)
- ✅ Request queue (new)
- ✅ Enhanced security (CSP, encryption, sender verification)

---

## Breaking Changes

### 1. Architecture

**Old**: Webpack + popup-based UI  
**New**: Vite + tab-based dashboard

**Impact**: 
- Extension opens in new tab instead of popup
- Better UX with more screen real estate
- Routing via React Router (hash-based)

**Action Required**: None (automatic)

### 2. Permissions

**Old**: `<all_urls>` permission  
**New**: Domain allowlist (24 specific domains)

**Impact**:
- Extension only works on supported ATS platforms
- Generic forms on unknown sites may not work
- Improved privacy and security

**Action Required**: 
- Review supported platforms in Settings
- Add custom domains if needed

### 3. Storage Structure

**Old**: Single flat storage schema  
**New**: Structured storage + IndexedDB

**Impact**:
- Profile data may need re-entry
- Previous tracked jobs not automatically migrated

**Action Required**:
1. Export data from old extension (if available)
2. Import into new extension via Settings
3. Or manually re-enter profile information

### 4. API Integration

**Old**: Hardcoded API endpoints (if any)  
**New**: OpenAI API with user-provided key

**Impact**:
- You must provide your own OpenAI API key
- Costs are borne by user (~$0.01-0.02 per cover letter)

**Action Required**:
1. Get API key from platform.openai.com
2. Enter in Settings → API Configuration
3. Choose preferred model (GPT-4o-mini recommended)

---

## New Features (Not in Old Version)

### Features Added in 1.0.0

1. **Request Queue**: Prevents API rate limits
2. **Kill Switch**: Disable all content scripts
3. **Auto-Open Panel**: Automatic panel on job pages
4. **Data Wipe**: Complete data deletion with confirmation
5. **Adapter Toggles**: Enable/disable specific platforms
6. **Custom Domains**: Add your own ATS domains
7. **Debug Logging**: Optional detailed logs
8. **Encryption**: Optional AES-256-GCM encryption
9. **E2E Tests**: Comprehensive test suite
10. **Security Docs**: SECURITY.md and PRIVACY.md

---

## Migration Guide

### Step 1: Export Data (Old Extension)

If using the old extension:

1. Open old extension popup
2. Go to Settings or Data
3. Click "Export Profile" (if available)
4. Save JSON file

### Step 2: Install New Extension

1. Download or build new extension
2. Open `chrome://extensions/`
3. Remove old extension (if present)
4. Load unpacked: select `dist/` folder
5. Click extension icon to open dashboard

### Step 3: Initial Setup

1. Complete onboarding wizard
2. Enter OpenAI API key (Settings)
3. Fill out profile (Profile page)
4. Add resume data (Resume page)

### Step 4: Import Data (Optional)

If you exported data from old extension:

1. Settings → Data Management
2. Click "Import Profile"
3. Select exported JSON file
4. Review imported data
5. Save

**Note**: Import feature may need manual mapping if schema differs significantly.

### Step 5: Configure Adapters

1. Settings → ATS Platform Adapters
2. Review enabled adapters
3. Disable unused platforms (improves performance)
4. Add custom domains if needed

### Step 6: Test

1. Navigate to a job posting (e.g., LinkedIn)
2. Press `Ctrl+Shift+A` to autofill
3. Verify fields populate correctly
4. Check ATS score (`Ctrl+Shift+M`)
5. Generate test cover letter
6. Track a job application

---

## Compatibility

### Forward Compatibility

Data from v1.0.0 will be compatible with future versions (v1.1.0+) using automatic migrations.

### Backward Compatibility

⚠️ **Not compatible** with pre-1.0.0 versions due to architecture changes.

---

## Data Schema Changes

### Old Schema (if applicable)
```json
{
  "profile": { ...flat object... },
  "jobs": [ ...array... ]
}
```

### New Schema
```json
{
  "settings": {
    "model": "gpt-4o-mini",
    "language": "en",
    "encryptionEnabled": false,
    "killSwitch": false,
    "autoOpenPanel": false,
    "debugLogs": false
  },
  "profile": {
    "personalInfo": { ... },
    "workAuth": { ... },
    "preferences": { ... },
    "resume": {
      "education": [ ... ],
      "experience": [ ... ],
      "skills": [ ... ]
    }
  },
  "trackedJobs": [ ... ]
}
```

**IndexedDB**: Added for job cache, resume versions, cover letters

---

## Known Issues in Migration

### Issue 1: Custom Questions Not Migrated

**Problem**: Old extension's custom Q&A bank may not transfer  
**Workaround**: Re-enter custom answers manually  
**Fix**: Planned for v1.1.0 (import wizard improvement)

### Issue 2: Cover Letter Templates

**Problem**: Old templates may not match new schema  
**Workaround**: Use new default templates, customize as needed  
**Fix**: N/A (by design)

---

## Rollback Plan

If you experience issues with v1.0.0:

### Option 1: Disable Extension

1. Chrome Extensions → Disable Job ATS Extension
2. Use manual job application process
3. Report issue on GitHub

### Option 2: Revert to Old Extension (if available)

1. Remove v1.0.0
2. Reinstall old extension (if you have the files)
3. Your old data should still be present

### Option 3: Use Extension with Kill Switch

1. Settings → Advanced → Enable Kill Switch
2. This disables content scripts but keeps dashboard
3. Use dashboard for tracking only

---

## Getting Help

### Resources

- **README.md**: Installation and usage guide
- **PRIVACY.md**: Privacy policy and data handling
- **SECURITY.md**: Security features and threat model
- **MANUAL_TEST_REPORT.md**: Detailed test results
- **GitHub Issues**: Report bugs or request features

### Common Issues

**Q: Extension not working on my ATS site**  
A: Check if it's in the supported platforms list. Add custom domain in Settings if needed.

**Q: Autofill skips some fields**  
A: Custom questions require AI suggestions (optional). File uploads require manual action (security).

**Q: API errors (401, 429)**  
A: 401 = invalid API key, check Settings. 429 = rate limit, wait 60s and retry.

**Q: Want to go back to old extension**  
A: Uninstall v1.0.0, reinstall old extension (data may be lost).

---

## Future Updates

### Planned for v1.1.0
- Additional ATS adapters (BambooHR, JazzHR)
- Resume tailoring suggestions
- Interview prep features
- Improved import/export

### Planned for v1.2.0
- LinkedIn profile import
- Browser sync across devices
- Template marketplace
- Analytics dashboard

### Planned for v2.0.0
- Multi-resume support
- Company research integration
- Salary negotiation assistant
- Mobile companion app (?)

---

## Feedback

We value your feedback on v1.0.0:

- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **General Feedback**: Email or Twitter

Your input helps us improve!

---

**Last Updated**: October 5, 2025  
**Next Review**: On v1.1.0 release
