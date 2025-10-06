# AI CV & Cover Letter Optimizer - Complete Documentation

**Version:** 2.0.0  
**Build System:** MV3 with Vite + CRXJS  
**Languages:** English, Turkish

---

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Features](#features)
4. [Country & City Selectors](#country--city-selectors)
5. [Optimization Highlights](#optimization-highlights)
6. [Additional Questions](#additional-questions)
7. [CV Templates](#cv-templates)
8. [Cover Letter Templates](#cover-letter-templates)
9. [AI Providers](#ai-providers)
10. [Photo Editor](#photo-editor)
11. [Google Integrations](#google-integrations)
12. [Settings](#settings)
13. [Storage & Migration](#storage--migration)
14. [Development](#development)
15. [Troubleshooting](#troubleshooting)

---

## Overview

The AI CV & Cover Letter Optimizer is a Chrome extension (Manifest V3) that helps job seekers create ATS-optimized CVs and cover letters using AI. It integrates with multiple AI providers (OpenAI, Google Gemini, Anthropic Claude, Azure OpenAI) and Google services (Docs, Sheets, Slides, Gmail, Drive).

**Key Features:**
- Multi-AI provider support with fallback
- 4 CV templates (Modern, Classic, Minimal, ATS)
- 5 Cover letter templates (Standard, Short, STAR, Concise, Managerial)
- Country & City location selectors with i18n
- Dynamic additional questions builder (9 question types)
- Photo editor with canvas-based editing and optional AI enhancement
- Google integrations for export and collaboration
- Optimization highlighting in CV preview
- ATS compatibility scoring and optimization
- Full i18n support (EN/TR)

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser
- (Optional) Google Cloud project with OAuth2 credentials for Google integrations

### Build from Source

```bash
cd extension
npm install
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `/workspace/dist` directory (or `extension/dist`)
5. The extension will appear in your toolbar

### Google OAuth Setup (Optional)

To use Google integrations:

1. Create a Google Cloud project at https://console.cloud.google.com
2. Enable APIs: Drive API, Docs API, Sheets API, Slides API, Gmail API
3. Create OAuth2 credentials (Web application type)
4. Add authorized redirect URI: `https://<extension-id>.chromiumapp.org/`
5. Update `extension/manifest.json` with your `client_id` in the `oauth2` section
6. Rebuild the extension

If you don't set up OAuth, you can still use all other features except Google integrations.

---

## Features

### Profile Management

Create and manage multiple CV profiles with:
- Personal information (name, email, phone, location, photo)
- Experience (with country/city, employment type, location type)
- Education (with country/city, grades, dates)
- Skills (categorized and keyword-rich)
- Projects (with technologies and associations)
- Licenses & Certifications (with expiration tracking)
- Additional custom questions (dynamic types)

### ATS Optimization

The extension includes built-in ATS (Applicant Tracking System) compatibility:
- Keyword matching against job descriptions
- Formatting recommendations
- Score calculation
- Optimization suggestions with rationale

### Export Formats

- **PDF**: High-quality, print-ready
- **DOCX**: Editable Word documents
- **Google Docs**: Direct export to Google Docs
- **Google Sheets**: Application tracker export
- **Google Slides**: Portfolio presentations

---

## Country & City Selectors

### Usage

Country and City fields are available in:
- Experience entries
- Education entries
- Licenses & Certifications
- Projects

### Features

- **Searchable dropdowns**: Type to filter
- **i18n support**: Country names in English and Turkish
- **Auto-filtering**: City dropdown filters by selected country
- **Keyboard navigation**: Fully accessible
- **Safe migration**: Existing profiles get `undefined` defaults

### Data Source

The extension includes a lightweight built-in dataset covering major countries and cities. For extended coverage:

1. Go to Settings
2. Navigate to "Data" section
3. Click "Download Extended City Dataset"

This downloads a larger dataset on demand and stores it locally.

### Example

```tsx
<CountryCitySelect
  countryValue={profile.experience[0].country}
  cityValue={profile.experience[0].city}
  onCountryChange={(code) => updateExperience(0, { country: code })}
  onCityChange={(name) => updateExperience(0, { city: name })}
  locale="en"
/>
```

---

## Optimization Highlights

### How It Works

When the AI optimizes your CV, it returns specific sections that were improved. Clicking the green "Optimized" pill:

1. Publishes an event to the highlight bus
2. CV Preview scrolls to the relevant section
3. Applies a 2-3 second animated CSS highlight
4. Announces to screen readers via `aria-live`

### Event Structure

```typescript
interface OptimizationHighlight {
  section: string;       // e.g., "experience"
  field?: string;        // e.g., "bullets"
  index?: number;        // Array index if applicable
}
```

### Implementation

```tsx
import { highlightBus } from "../../lib/highlight/bus";

// Publisher (OptimizationDetails component)
highlightBus.publish({ section: "experience", field: "bullets", index: 2 });

// Subscriber (CVPreview component)
useEffect(() => {
  const unsubscribe = highlightBus.subscribe((highlight) => {
    // Scroll to element and apply highlight
    const element = document.querySelector(`[data-section="${highlight.section}"][data-index="${highlight.index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-animation");
      setTimeout(() => element.classList.remove("highlight-animation"), 2500);
    }
  });
  return unsubscribe;
}, []);
```

### CSS Animation

```css
@keyframes highlight {
  0% { background-color: #fef08a; }
  100% { background-color: transparent; }
}

.highlight-animation {
  animation: highlight 2.5s ease-out;
}
```

---

## Additional Questions

### Question Types

The extension supports 9 dynamic question types:

1. **Short Text**: Single-line text input
2. **Long Text**: Multi-line textarea
3. **Single Select**: Radio buttons or dropdown
4. **Multi Select**: Checkboxes
5. **Yes/No**: Boolean choice
6. **Date**: Date picker
7. **File**: File upload with metadata
8. **Link**: URL input with validation
9. **Number**: Numeric input

### Building Questions

1. Click "Add Question"
2. Enter the question label
3. Select the question type
4. For select types, add options dynamically
5. Save the question

### Answer Storage

Answers are stored in the profile schema:

```typescript
interface AdditionalAnswer {
  qId: string;
  label: string;
  type: QuestionType;
  value?: unknown;
  meta?: {
    options?: Array<{ label: string; value: string }>;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };
}
```

### Usage in Exports

Additional questions and answers are automatically included in:
- PDF exports
- DOCX exports
- Google Docs exports

---

## CV Templates

The extension provides 4 professionally designed CV templates:

### 1. Modern

**Style**: Clean, professional with color accents (blue)  
**Best For**: Tech, creative, and startup roles  
**Features**:
- Sans-serif fonts (Segoe UI)
- Color-coded sections
- Skill badges
- Left border highlights

**Preview**: Blue accent colors, modern spacing, icon-friendly

### 2. Classic

**Style**: Traditional, conservative, serif fonts  
**Best For**: Finance, law, academia, government  
**Features**:
- Times New Roman fonts
- Black and white
- Centered header
- Formal section dividers

**Preview**: Traditional resume format, no colors

### 3. Minimal

**Style**: Ultra-clean, maximum whitespace, modern typography  
**Best For**: Design, architecture, minimalist portfolios  
**Features**:
- System fonts (SF Pro, Helvetica Neue)
- Subtle typography
- Maximum breathing room
- Elegant spacing

**Preview**: Very clean, almost no decoration

### 4. ATS

**Style**: Plain text friendly, keyword rich, parseable  
**Best For**: Companies using Applicant Tracking Systems  
**Features**:
- Arial fonts
- No complex formatting
- Keyword emphasis
- Machine-readable structure
- Clear section headers

**Preview**: Simple, text-focused, easy to parse

### Switching Templates

```typescript
profile.selectedCVTemplate = "modern"; // or "classic", "minimal", "ats"
```

Templates are rendered server-side to HTML and can be exported to PDF or DOCX.

---

## Cover Letter Templates

5 cover letter templates are included:

### 1. Standard

**Format**: Traditional business letter  
**Length**: 3-4 paragraphs  
**Includes**: Full contact info, date, company address

### 2. Short

**Format**: Email-friendly, concise  
**Length**: 2-3 short paragraphs  
**Includes**: Subject line style header

### 3. STAR

**Format**: Situation-Task-Action-Result methodology  
**Length**: Structured narrative  
**Includes**: Specific achievement examples

### 4. Concise

**Format**: Ultra-brief, bullet-point style  
**Length**: 1-2 paragraphs + bullets  
**Includes**: Highlighted key qualifications

### 5. Managerial

**Format**: Executive/leadership focus  
**Length**: 4 paragraphs, formal  
**Includes**: Professional letterhead, executive presence

### AI Generation

Cover letters can be generated automatically using:

```typescript
import { generateCoverLetter } from "./lib/ai/coverLetter";

const letter = await generateCoverLetter(router, {
  profile: currentProfile,
  jobDescription: jobPost.description,
  jobTitle: jobPost.title,
  company: jobPost.company,
  template: "standard",
});
```

The AI uses your profile and the job description to create a tailored cover letter following the selected template format.

---

## AI Providers

### Supported Providers

1. **OpenAI** (GPT-4, GPT-3.5)
2. **Google Gemini** (Gemini Pro, Gemini Pro Vision)
3. **Anthropic Claude** (Claude 3.5 Sonnet, Claude 3 Opus)
4. **Azure OpenAI** (GPT-4, GPT-3.5 via Azure)

### Configuration

Navigate to Settings → AI Settings:

1. **Select Provider**: Choose your preferred AI provider
2. **Model** (optional): Specify model name (uses defaults if empty)
3. **Temperature**: Control creativity (0.0 = deterministic, 1.0 = creative)
4. **API Keys**: Enter your API key(s)
5. **Test Connection**: Verify your setup

### API Key Formats

- **OpenAI**: Standard API key (sk-...)
- **Gemini**: Google AI API key
- **Anthropic**: Claude API key (sk-ant-...)
- **Azure**: Format as `key|endpoint|deployment` (e.g., `abc123|https://myresource.openai.azure.com|gpt-4`)

### Fallback Chain

The extension supports automatic fallback. If the primary provider fails, it tries the next provider in the chain:

Default chain: `OpenAI → Gemini → Anthropic`

You can customize this in Settings.

### Features

- **Timeout**: 30s default (configurable)
- **Retries**: 3 attempts with exponential backoff
- **Rate Limiting**: Built-in request queue with 100ms minimum interval
- **Streaming**: Supported for real-time generation

### Security

- API keys are stored **locally** in `chrome.storage.local`
- Keys are **encrypted at rest** using AES-GCM
- Keys are **never sent** to any server except the respective AI provider
- No telemetry or tracking

---

## Photo Editor

### Features

The built-in photo editor supports:

1. **Upload**: JPEG, PNG, WebP (max 10MB)
2. **EXIF Stripping**: Removes metadata for privacy
3. **Crop & Zoom**: Adjust framing (1.0x to 3.0x zoom)
4. **Brightness**: -100 to +100
5. **Contrast**: -100 to +100
6. **Round Mask**: Circular profile photo effect
7. **Background Blur**: Soft focus background (0-20 intensity)
8. **AI Enhancement** (optional): Automatic improvement via OpenAI

### Canvas-Based Editing

All edits are performed **client-side** using HTML5 Canvas. No images are sent off-device unless you explicitly enable AI Enhancement and have configured an AI provider with image support.

### Usage

```tsx
<PhotoEditor
  initialPhoto={profile.personal.photoUrl}
  onSave={(photoUrl, metadata) => {
    updateProfile({
      personal: {
        ...profile.personal,
        photoUrl,
        photoMetadata: metadata,
      },
    });
  }}
  onCancel={closeEditor}
  aiEditEnabled={settings.ai.provider === "openai" && !!settings.ai.apiKeys.openai}
  aiApiKey={settings.ai.apiKeys.openai}
  locale={settings.ui.locale}
/>
```

### AI Enhancement

**Important**: AI Enhancement requires:
1. OpenAI API key configured
2. Explicit user consent (checkbox in UI)
3. User-initiated action

When enabled, the image is sent to OpenAI's Images API for automatic enhancement (brightness, contrast, sharpness, color correction).

**Privacy Note**: By default, AI Enhancement is **disabled**. Users must explicitly enable it in Settings and understand that images will be sent to OpenAI.

---

## Google Integrations

### Available Integrations

1. **Google Docs**: Export CV and Cover Letter
2. **Google Sheets**: Export Application Tracker
3. **Google Slides**: Export Portfolio Presentation
4. **Google Drive**: Upload PDF/DOCX files
5. **Gmail**: Create draft with cover letter and CV attachment

### Setup

1. Configure OAuth2 credentials (see [Installation & Setup](#installation--setup))
2. Go to Settings → Google Integration
3. Click "Connect to Google"
4. Authorize the extension with minimal scopes
5. Start exporting!

### OAuth Scopes

The extension requests **minimal scopes**:

- `drive.file`: Access only files created by this extension
- `documents`: Create and edit Google Docs
- `spreadsheets`: Create and edit Google Sheets
- `presentations`: Create and edit Google Slides
- `gmail.compose`: Create Gmail drafts

**Note**: The extension does **not** request:
- Full Drive access
- Gmail read access
- Calendar access
- Contacts access

### Export Examples

#### Export CV to Google Docs

```typescript
import { exportCV } from "./background/google/docs";

const docUrl = await exportCV("My_CV_2025", htmlContent);
console.log("Document created:", docUrl);
```

#### Export Application Tracker to Google Sheets

```typescript
import { exportApplicationTracker } from "./background/google/sheets";

const sheetUrl = await exportApplicationTracker(applications);
console.log("Spreadsheet created:", sheetUrl);
```

#### Create Gmail Draft

```typescript
import { createApplicationDraft } from "./background/google/gmail";

const draftUrl = await createApplicationDraft(
  "hiring@company.com",
  "Acme Corp",
  "Senior Engineer",
  coverLetterHtml,
  cvPdfBase64
);
console.log("Draft created:", draftUrl);
```

### Disconnect

To revoke access:

1. Go to Settings → Google Integration
2. Click "Disconnect"
3. The extension revokes its token and clears stored credentials

You can also revoke access at https://myaccount.google.com/permissions

---

## Settings

### AI Settings

- **Provider**: OpenAI, Gemini, Claude, Azure
- **Model**: Optional model override
- **Temperature**: 0.0 to 1.0
- **API Keys**: Encrypted storage
- **Fallback Chain**: Automatic provider fallback
- **Timeout**: Request timeout (default 30s)
- **Max Retries**: Retry attempts (default 3)

### Google Integration

- **Connect/Disconnect**: OAuth2 flow
- **Token Status**: Expiration and scopes info
- **Revoke**: Clear credentials

### UI Settings

- **Highlight Optimized**: Enable/disable optimization highlights
- **Language**: English or Turkish
- **Theme**: Light, Dark, or Auto

### Privacy Settings

- **AI Image Enhancement**: Enable/disable AI photo editing
- **Data Collection**: No telemetry or tracking (ever)
- **Local Storage**: All data stored locally in Chrome

---

## Storage & Migration

### Storage Schema

Data is stored in `chrome.storage.local`:

```typescript
{
  profiles: ResumeProfile[],
  currentProfile: string, // profile ID
  settings: AppSettings,
  encryptedTokens: string, // Encrypted Google tokens
  jobPosts: JobPost[],
  coverLetters: CoverLetterData[],
  applications: JobApplication[]
}
```

### Migration System

The extension includes a robust migration system:

- **Version Tracking**: `settings.version` tracks schema version
- **Safe Defaults**: New fields get `undefined` defaults
- **Forward Migration**: Automatically upgrades on extension update
- **Backward Compatibility**: Old profiles continue to work

### Migration Process

```typescript
import { initializeStorage } from "./lib/storage/migrate";

// Called on extension install/update
await initializeStorage();
```

Migrations:
- **v1 → v2**: Added country/city fields, additional questions, photo metadata, template selection

### Backup & Restore

Users can backup their data:

1. Open extension
2. Go to Settings → Backup
3. Click "Export All Data"
4. Save JSON file

To restore:

1. Go to Settings → Backup
2. Click "Import Data"
3. Select JSON file
4. Confirm import

---

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Chrome (for testing)

### Project Structure

```
extension/
├── src/
│   ├── background/          # Service worker
│   │   ├── index.ts
│   │   └── google/          # Google API integrations
│   ├── lib/
│   │   ├── ai/              # AI providers and router
│   │   └── storage/         # Schema and migration
│   ├── newtab/              # Main UI
│   │   ├── components/      # React components
│   │   └── templates/       # CV & cover letter templates
│   ├── options/             # Settings page
│   ├── popup/               # Extension popup
│   └── utils/               # Utilities
│       ├── geo/             # Country/city data
│       └── image/           # Canvas editing
├── public/
│   └── _locales/            # i18n messages
│       ├── en/
│       └── tr/
├── tests/
│   ├── unit/                # Unit tests (Jest)
│   └── e2e/                 # E2E tests (Playwright)
├── manifest.json
├── package.json
└── vite.config.ts
```

### Build Commands

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

### Testing

#### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Geo utilities (country/city search)
- Storage migration
- AI router (provider fallback)
- Template rendering

#### E2E Tests

```bash
npm run test:e2e
```

Tests cover:
- CV template switching
- Optimization highlight interaction
- Additional questions builder
- Photo editor workflow

### Adding a New AI Provider

1. Create provider class in `src/lib/ai/providers/`:

```typescript
export class MyAIProvider {
  constructor(private apiKey: string, private model: string, private temperature: number) {}

  async chat(messages: AIMessage[], options?: { signal?: AbortSignal }): Promise<AIResponse> {
    // Implementation
  }

  async *chatStream(messages: AIMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    // Streaming implementation
  }

  async testConnection(): Promise<boolean> {
    // Test implementation
  }
}
```

2. Register in router (`src/lib/ai/router.ts`):

```typescript
case "myai":
  return new MyAIProvider(apiKey, model || "default-model", temperature);
```

3. Update schema (`src/lib/storage/schema.ts`):

```typescript
export type AIProvider = "openai" | "gemini" | "anthropic" | "azure" | "myai";
```

4. Add to Settings UI

### Adding a New CV Template

1. Create template in `src/newtab/templates/cv/mytemplate/index.tsx`:

```typescript
export function renderMyTemplateCV(profile: ResumeProfile, locale: string = "en"): string {
  return `<div>...</div>`;
}
```

2. Update schema:

```typescript
export type CVTemplate = "modern" | "classic" | "minimal" | "ats" | "mytemplate";
```

3. Add to template picker UI

### Internationalization (i18n)

Add strings to `public/_locales/en/messages.json` and `public/_locales/tr/messages.json`:

```json
{
  "myNewString": {
    "message": "My new string in English"
  }
}
```

Use in code:

```typescript
chrome.i18n.getMessage("myNewString");
```

Or in React:

```typescript
const t = (key: string) => chrome.i18n.getMessage(key);
t("myNewString");
```

---

## Troubleshooting

### Extension Won't Load

**Error**: "Background script couldn't be loaded"

**Solution**:
1. Verify `dist/manifest.json` exists
2. Check `dist/service-worker-loader.js` exists
3. Ensure manifest `background.service_worker` points to correct file
4. Rebuild: `npm run build`

### Google OAuth Not Working

**Error**: "redirect_uri_mismatch"

**Solution**:
1. Check `manifest.json` has correct `client_id`
2. Verify authorized redirect URI in Google Cloud Console
3. Format: `https://<extension-id>.chromiumapp.org/`
4. Get extension ID from `chrome://extensions`

### AI Provider Connection Fails

**Error**: "Connection failed" or "API error"

**Solutions**:
- **OpenAI**: Check API key format (starts with `sk-`)
- **Gemini**: Verify API key has Gemini API enabled
- **Claude**: Check API key format (starts with `sk-ant-`)
- **Azure**: Verify format is `key|endpoint|deployment`

Test with curl:

```bash
# OpenAI
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hi"}]}'

# Gemini
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hi"}]}]}'

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","messages":[{"role":"user","content":"Hi"}],"max_tokens":100}'
```

### CV Preview Not Highlighting

**Issue**: Clicking "Optimized" pill doesn't highlight

**Solution**:
1. Check Settings → UI Settings → "Enable optimization highlights" is checked
2. Verify CV Preview component has `data-section` and `data-index` attributes
3. Check browser console for JavaScript errors

### Photo Upload Fails

**Error**: "Invalid file type" or "File too large"

**Solutions**:
- Supported formats: JPEG, PNG, WebP only
- Max size: 10MB
- Reduce file size using image compression tools
- Convert to supported format

### Build Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist

# Rebuild
npm run build
```

**Error**: "Module not found"

**Solution**:
- Check import paths are correct
- Verify file exists
- Check `tsconfig.json` paths are configured

### Performance Issues

**Issue**: Extension is slow

**Solutions**:
- Reduce profile size (remove unused experience/projects)
- Limit Additional Questions to essential ones
- Disable optimization highlights if not needed
- Clear old data from storage
- Reduce AI temperature (faster responses)

### Data Loss

**Issue**: Profiles disappeared

**Solutions**:
1. Check if you're using the correct Chrome profile
2. Go to `chrome://extensions` → Extension details → Storage
3. Restore from backup (Settings → Backup → Import Data)

**Prevention**:
- Regular backups (weekly recommended)
- Export profiles before major updates

---

## Additional Resources

- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/
- **Manifest V3 Migration**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **Google APIs**: https://console.cloud.google.com/
- **OpenAI API**: https://platform.openai.com/docs
- **Anthropic API**: https://docs.anthropic.com
- **Google Gemini**: https://ai.google.dev/docs

---

## License

This extension is provided as-is for personal and educational use.

---

## Support

For issues, questions, or feature requests, please file an issue in the repository.

**IMPORTANT**: Never share your API keys publicly. If you accidentally expose an API key, revoke it immediately and generate a new one.

---

**End of Documentation**
