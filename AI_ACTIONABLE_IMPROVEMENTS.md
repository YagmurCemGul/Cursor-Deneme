# AI-Actionable Improvements List

This document contains a structured list of improvements that can be implemented by AI agents or developers.

## ✅ COMPLETED

### IMPL-001: Toast Notification Service
**Status:** COMPLETED  
**Files:** `src/lib/toastService.ts` (NEW), `src/options/main.tsx` (UPDATED)  
**Description:** Created toast service for user feedback with success/error/info/warning messages  
**Impact:** High - Better UX

### IMPL-002: Logger Service Standardization
**Status:** COMPLETED  
**Files:** 9 utility files updated  
**Description:** Replaced all console.* calls with logger service for consistent logging  
**Impact:** Medium - Better debugging and error tracking

---

## 🔄 READY TO IMPLEMENT (No dependencies)

### IMPL-003: Jest Testing Setup
**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Dependencies:** None  
**Files to Check:** `jest.config.js`, test files in `src/utils/__tests__/`  
**Command:**
```bash
npm install
npm run test
# If fails, debug jest configuration
```
**Success Criteria:** All existing tests pass, coverage report generated

---

### IMPL-004: TypeScript Type Safety
**Priority:** MEDIUM  
**Estimated Time:** 1-2 days  
**Dependencies:** None  
**Current State:** 91 'any' type usages  
**Target Files:**
- `src/utils/fileParser.ts` (5 any)
- `src/utils/googleDriveService.ts` (11 any)
- `src/utils/storage.ts` (3 any)
- `src/i18n.ts` (4 any)

**Steps:**
1. Scan file for `any` types
2. Replace with proper TypeScript types
3. Add interfaces where needed
4. Enable `strictNullChecks` incrementally
5. Test compilation: `npm run type-check`

**Success Criteria:** Reduce 'any' usage by 50%+, strict checks enabled

---

### IMPL-005: Bundle Size Optimization
**Priority:** MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Current Size:** 2.3MB total (955KB PDF.js, 1.17MB vendors)  

**Optimization Steps:**
1. Replace full PDF.js with PDF.js-lite
2. Implement lazy loading for heavy components
3. Add dynamic imports for advanced features
4. Optimize tree shaking configuration

**Files to Modify:**
- `webpack.config.js`
- `src/popup.tsx` (add React.lazy)
- `package.json` (update PDF.js dependency)

**Success Criteria:** Reduce bundle size by 30%+

---

## 📦 SHORT-TERM FEATURES (1-2 days each)

### FEAT-001: Batch Export
**Priority:** HIGH  
**Estimated Time:** 1 day  
**Dependencies:** Existing export functions  

**Requirements:**
- Export CV in PDF, DOCX, Google Docs simultaneously
- Progress indicator (0-100%)
- Status for each format (pending/success/error)
- Cancel capability

**Implementation Plan:**
```typescript
// src/utils/batchExporter.ts
export async function batchExport(
  cvData: CVData,
  formats: ('pdf' | 'docx' | 'gdocs')[],
  onProgress: (progress: number) => void
): Promise<ExportResult[]>
```

**Files to Create/Modify:**
- NEW: `src/utils/batchExporter.ts`
- UPDATE: `src/components/ExportPanel.tsx`

---

### FEAT-002: Google Drive Folder Selection
**Priority:** HIGH  
**Estimated Time:** 2 days  
**Dependencies:** `googleDriveService.ts`  

**Requirements:**
- Browse Drive folders UI
- Remember last selected folder (Chrome storage)
- Create new folder from extension
- Breadcrumb navigation

**Implementation Plan:**
```typescript
// src/components/FolderPicker.tsx
export function FolderPicker({
  onSelect: (folderId: string) => void
}): JSX.Element

// src/utils/googleDriveService.ts
export async function listFolders(parentId?: string): Promise<Folder[]>
export async function createFolder(name: string, parentId?: string): Promise<Folder>
```

---

### FEAT-003: Export History Tracking
**Priority:** MEDIUM  
**Estimated Time:** 1-2 days  
**Dependencies:** Chrome storage  

**Requirements:**
- Track all exports with timestamp
- Store: filename, format, date, status, destination
- History tab in UI
- Filter by date/format/type
- Statistics view

**Storage Schema:**
```typescript
interface ExportHistory {
  id: string;
  filename: string;
  format: 'pdf' | 'docx' | 'gdocs';
  timestamp: string;
  status: 'success' | 'failed';
  destination: 'local' | 'drive';
  driveFileId?: string;
}
```

---

### FEAT-004: Custom File Naming Templates
**Priority:** MEDIUM  
**Estimated Time:** 1 day  
**Dependencies:** None  

**Requirements:**
- Variable system: {firstName}, {lastName}, {company}, {position}, {date}, {format}
- Multiple template presets
- Template preview
- Save/manage templates

**Implementation:**
```typescript
// src/utils/fileNamingService.ts (already exists, enhance it)
export function parseTemplate(
  template: string,
  variables: Record<string, string>
): string

// Example templates:
// "{firstName}_{lastName}_CV_{company}_{date}.{format}"
// "CV_{lastName}_{position}_{date}.{format}"
```

---

### FEAT-005: Direct Sharing
**Priority:** HIGH  
**Estimated Time:** 2 days  
**Dependencies:** Google Drive API, Email integration  

**Requirements:**
- Share via email
- Generate Google Drive share link
- Copy link to clipboard
- Set permissions (view/edit)
- Share CV + cover letter together

**APIs Needed:**
- Google Drive: `files.permissions.create`
- Browser: `navigator.share` (Web Share API)

---

## 🔮 MEDIUM-TERM FEATURES (3-7 days each)

### FEAT-006: Google Drive Auto-Sync
**Priority:** HIGH  
**Estimated Time:** 3-5 days  
**Technical Complexity:** High  

**Requirements:**
- Automatic backup of CV profiles to Drive
- Sync on change (debounced)
- Conflict resolution (local vs cloud)
- Sync status indicator
- Manual sync trigger

---

### FEAT-007: Google Calendar Integration
**Priority:** HIGH  
**Estimated Time:** 2-3 days  

**Requirements:**
- Add interview reminders
- Application deadlines
- Calendar view
- Preparation reminders

---

### FEAT-008: Application Tracking in Sheets
**Priority:** HIGH  
**Estimated Time:** 3-5 days  

**Requirements:**
- Auto-create Google Sheets
- Track: status, company, position, date, notes
- Update from extension
- Analytics/insights

---

## 🌟 LONG-TERM FEATURES (1-2 weeks each)

### FEAT-009: Real-time Collaboration
**Priority:** MEDIUM  
**Estimated Time:** 1-2 weeks  
**Technical Complexity:** Very High  

**Requirements:**
- WebSocket/Firebase for real-time sync
- Multiple users editing simultaneously
- Cursor positions visible
- Comment system
- Version control

---

### FEAT-010: Analytics Dashboard
**Priority:** MEDIUM  
**Estimated Time:** 1 week  

**Requirements:**
- Application success rates
- Response rates by industry
- Time-to-interview stats
- CV optimization impact
- Skills demand analysis

---

## 🛠 TECHNICAL IMPROVEMENTS

### TECH-001: Increase Test Coverage
**Current:** Low (~10-20%)  
**Target:** 80%+  
**Files needing tests:**
- All utils in `src/utils/`
- Critical components
- Integration tests for AI providers

### TECH-002: ESLint Configuration
**Add rules:**
- no-console (except in logger.ts)
- no-any (warn)
- strict-null-checks

### TECH-003: Performance Monitoring
**Add:**
- Bundle size monitoring
- Runtime performance tracking
- API call monitoring

---

## 📋 PRIORITY MATRIX

| ID | Feature | Priority | Time | Difficulty |
|----|---------|----------|------|------------|
| ✅ IMPL-001 | Toast Service | HIGH | 1h | Easy |
| ✅ IMPL-002 | Logger Standard | MED | 2h | Easy |
| IMPL-003 | Jest Setup | HIGH | 3h | Easy |
| IMPL-004 | Type Safety | MED | 2d | Medium |
| IMPL-005 | Bundle Size | MED | 4h | Medium |
| FEAT-001 | Batch Export | HIGH | 1d | Medium |
| FEAT-002 | Folder Select | HIGH | 2d | Medium |
| FEAT-003 | Export History | MED | 2d | Easy |
| FEAT-004 | File Naming | MED | 1d | Easy |
| FEAT-005 | Direct Share | HIGH | 2d | Medium |
| FEAT-006 | Auto-Sync | HIGH | 5d | Hard |
| FEAT-007 | Calendar | HIGH | 3d | Medium |
| FEAT-008 | Sheets Track | HIGH | 4d | Medium |
| FEAT-009 | Collaboration | MED | 10d | Very Hard |
| FEAT-010 | Analytics | MED | 7d | Hard |

---

## 🤖 AI COMMAND EXAMPLES

To implement these features, use commands like:

```
"Implement FEAT-001: Create batch export functionality with progress tracking"
"Implement IMPL-003: Setup and configure Jest testing infrastructure"
"Implement FEAT-002: Create Google Drive folder picker component"
"Fix IMPL-004: Replace 'any' types in src/utils/fileParser.ts with proper types"
"Implement FEAT-004: Add custom file naming template system"
```

---

**Generated:** 2025-10-05  
**Total Improvements:** 15  
**Completed:** 2  
**Ready to Implement:** 13  
**Estimated Total Time:** 6-8 weeks for all features
