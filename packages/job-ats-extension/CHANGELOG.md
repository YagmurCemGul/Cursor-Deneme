# Changelog

All notable changes to the Job ATS Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-05

### Added - Initial Release

#### Core Features
- **Smart Autofill System**: Intelligent form field detection and filling with 8 ATS platform adapters
  - Workday with `data-automation-id` detection
  - Greenhouse with form-based detection
  - Lever, Ashby, SmartRecruiters, SuccessFactors, Workable, iCIMS adapters
  - Levenshtein distance-based fuzzy matching for field identification
  - React/Angular framework compatibility with native setter bypass
  - Multi-step form support using MutationObserver
  
- **ATS Match Scoring**: Job description vs. resume compatibility analysis
  - TF-IDF based keyword extraction
  - Jaccard similarity coefficient calculation
  - Must-have vs. nice-to-have keyword differentiation
  - Score calculation (0-100%)
  - Missing keywords identification
  - AI-powered improvement suggestions

- **AI Cover Letter Generator**: OpenAI GPT-4o-mini powered cover letter creation
  - Multiple templates (Short, Standard, STAR Method)
  - Real-time streaming with AbortController support
  - Customizable tone (professional, marketing, technical)
  - Editable output with rich text
  - Context-aware generation using job description and profile

- **Application Tracker**: Comprehensive job application pipeline management
  - Status tracking: Saved → Applied → Interview → Offered → Rejected
  - Notes and timestamps for each application
  - ATS score tracking per job
  - Filter and search capabilities
  - Quick status updates

- **Job Description Extraction**: Automatic job posting data extraction
  - Auto-detection on job listing pages
  - Site-specific extractors (LinkedIn, Indeed, Glassdoor)
  - Generic fallback parser for unknown sites
  - IndexedDB caching for offline access
  - Structured data extraction (requirements, responsibilities, benefits)

- **Full Dashboard UI**: Complete React-based user interface
  - Home page with quick actions and recent jobs
  - Profile management with personal info and work authorization
  - Resume builder with education, experience, and skills sections
  - Jobs page for saved listings
  - Tracker page with kanban-style view
  - Settings page for configuration
  - Onboarding wizard for first-time users

#### Technical Implementation
- **Manifest V3** compliance with service worker architecture
- **Build System**: Vite 5 + @crxjs/vite-plugin for modern development
- **Framework**: React 18 + TypeScript 5 for type-safe development
- **Storage**: Chrome Storage API + IndexedDB (idb) for data persistence
- **Security**: Optional AES-256-GCM encryption with PBKDF2 key derivation
- **Internationalization**: English and Turkish language support via Chrome i18n API

#### User Experience
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`): Auto-fill current form
  - `Ctrl+Shift+M` (Mac: `Cmd+Shift+M`): Calculate ATS match score
  - `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`): Toggle side panel

- **Dashboard Access**: Click extension icon to open full dashboard in new tab
- **Popup**: Quick access to common actions
- **Options Page**: Detailed configuration interface
- **Side Panel**: Context-aware assistance on job pages

#### Security & Privacy
- Local-only data storage (no external servers except OpenAI API)
- Optional end-to-end encryption for sensitive profile data
- API key stored securely in local storage
- No telemetry or analytics collection
- No automatic form submission (user review required)
- Content Security Policy enforced

#### Developer Experience
- Comprehensive TypeScript definitions
- Unit tests with Vitest
- E2E tests with Playwright
- ESLint and Prettier configuration
- Hot module replacement in development mode
- CI/CD pipeline with GitHub Actions

### Technical Details

#### Architecture
```
Extension Components:
- Background Service Worker: API calls, encryption, messaging
- Content Scripts: Form detection, autofill, job extraction
- Dashboard Tab: Full React SPA with routing
- Options Page: Configuration interface
- Popup: Quick actions menu
```

#### Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "idb": "^8.0.0",
  "zod": "^3.22.4",
  "lucide-react": "^0.292.0"
}
```

#### Build Output
- Total bundle size: ~372 KB
- Gzipped size: ~76 KB
- Code splitting enabled
- Tree shaking applied

### Known Limitations
- File upload fields require manual user interaction due to browser security policies
- Forms are never auto-submitted; user must review and submit manually
- Some custom ATS platforms may not be detected without additional adapters

### Future Roadmap
- Additional ATS platform adapters (BambooHR, JazzHR, etc.)
- Resume tailoring suggestions based on job description
- Interview preparation features with AI-generated questions
- Application analytics and insights
- Browser synchronization across devices
- Template gallery for cover letters
- LinkedIn profile import
- Bulk application queue

---

## Development

### Building
```bash
pnpm install
pnpm build
```

### Testing
```bash
pnpm test        # Unit tests
pnpm e2e         # E2E tests
```

### Development
```bash
pnpm dev         # Hot reload mode
```

---

**Note**: This is the initial release. Future versions will be documented with their changes in this file.
