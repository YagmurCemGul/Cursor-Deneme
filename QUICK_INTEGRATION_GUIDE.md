# 🚀 Quick Integration Guide

## New Components to Import

### 1. Auto-Sync Settings
```typescript
import { AutoSyncSettings } from './components/AutoSyncSettings';
import { AutoSyncService } from './utils/autoSyncService';

// Initialize auto-sync on app startup
AutoSyncService.initialize();

// Use in your main component
<AutoSyncSettings language={currentLanguage} />
```

### 2. Custom Template Creator
```typescript
import { CustomTemplateCreator } from './components/CustomTemplateCreator';

// Already integrated in CVTemplateManager
// Use through CVTemplateManager component
```

### 3. Enhanced Components
All enhanced components retain their original interface, so no code changes are needed:
- `GoogleDriveSettings` - Already includes folder selection and email sharing
- `AnalyticsDashboard` - Already includes enhanced statistics
- `CVTemplateManager` - Already includes custom template creator
- `ProfileManager` - Already includes bulk export

---

## 📱 Adding to Your App

### Option 1: Add Auto-Sync Tab
```typescript
// In your main popup component
const tabs = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'experience', label: 'Experience' },
  // ... other tabs
  { id: 'google-drive', label: 'Google Drive' },
  { id: 'auto-sync', label: 'Auto-Sync' }, // NEW
  { id: 'analytics', label: 'Analytics' },
];

// In your render method
{activeTab === 'auto-sync' && (
  <AutoSyncSettings language={language} />
)}
```

### Option 2: Integrate into Google Drive Settings
```typescript
// Add AutoSyncSettings as a subsection in Google Drive tab
<GoogleDriveSettings language={language} />
<AutoSyncSettings language={language} />
```

---

## 🔧 Initialization Code

Add this to your main app initialization:

```typescript
import { AutoSyncService } from './utils/autoSyncService';

// In your App component's useEffect
useEffect(() => {
  // Initialize auto-sync service
  AutoSyncService.initialize();
}, []);
```

---

## 📝 Usage Examples

### Trigger Auto-Sync on Profile Save
```typescript
import { AutoSyncService } from './utils/autoSyncService';

const handleSaveProfile = async (profile: CVProfile) => {
  // Save profile to storage
  await StorageService.saveProfile(profile);
  
  // Trigger auto-sync if enabled
  await AutoSyncService.syncProfile(profile.data);
};
```

### Export Multiple Profiles to Google Drive
```typescript
import { GoogleDriveService } from './utils/googleDriveService';

const handleBulkExport = async (profiles: CVProfile[]) => {
  const cvDataList = profiles.map(p => ({
    cvData: p.data,
    optimizations: []
  }));
  
  const result = await GoogleDriveService.bulkExportToFolder(
    cvDataList,
    'CV Backups ' + new Date().toISOString().split('T')[0]
  );
  
  console.log(`Exported ${result.files.length} profiles to ${result.folder.name}`);
};
```

### Share a File via Email
```typescript
import { GoogleDriveService } from './utils/googleDriveService';

const handleShareFile = async (fileId: string, email: string) => {
  const success = await GoogleDriveService.shareFile(
    fileId,
    email,
    'reader' // or 'writer'
  );
  
  if (success) {
    alert(`File shared with ${email}`);
  }
};
```

### Create Custom Template
```typescript
import { CVTemplateStyle } from './data/cvTemplates';
import { StorageService } from './utils/storage';

const createTemplate = async (templateData: CVTemplateStyle) => {
  await StorageService.saveTemplate({
    id: templateData.id,
    name: templateData.name,
    content: JSON.stringify(templateData),
    createdAt: new Date().toISOString(),
  });
};
```

---

## 🎨 CSS Classes Added

### Toggle Switch
```css
.toggle-switch
.toggle-slider
```

Usage:
```html
<label class="toggle-switch">
  <input type="checkbox" checked={enabled} />
  <span class="toggle-slider"></span>
</label>
```

---

## 🌐 i18n Keys to Add (Optional)

If you want to add more translations, add these keys to your i18n file:

```typescript
// English
autoSync: {
  title: 'Auto-Sync Settings',
  enable: 'Enable Auto-Sync',
  interval: 'Sync Interval',
  folder: 'Sync Folder',
  syncOnSave: 'Sync on Save',
  syncNow: 'Sync Now',
  lastSync: 'Last synchronized:',
}

// Turkish
autoSync: {
  title: 'Otomatik Senkronizasyon Ayarları',
  enable: 'Otomatik Senkronizasyonu Etkinleştir',
  interval: 'Senkronizasyon Aralığı',
  folder: 'Senkronizasyon Klasörü',
  syncOnSave: 'Kaydetmede Senkronize Et',
  syncNow: 'Şimdi Senkronize Et',
  lastSync: 'Son senkronizasyon:',
}
```

---

## 🔐 Permissions Required

Make sure your `manifest.json` has these permissions:

```json
{
  "permissions": [
    "storage",
    "identity"
  ],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  }
}
```

---

## 📦 No New Dependencies

All features use existing dependencies:
- ✅ React (already installed)
- ✅ TypeScript (already installed)
- ✅ Chrome APIs (built-in)
- ✅ Google APIs (REST calls)

---

## 🧪 Testing Quick Checklist

1. **Auto-Sync:**
   - [ ] Enable auto-sync
   - [ ] Wait for interval to trigger
   - [ ] Check Google Drive for synced files
   - [ ] Test "Sync Now" button

2. **Folder Selection:**
   - [ ] Open "Manage Folders"
   - [ ] Create a new folder
   - [ ] Select folder for exports
   - [ ] Export CV to selected folder

3. **Email Sharing:**
   - [ ] Click "Share" on a file
   - [ ] Enter email address
   - [ ] Select permission level
   - [ ] Verify email received

4. **Custom Templates:**
   - [ ] Click "Create Custom Template"
   - [ ] Fill in all fields
   - [ ] Save template
   - [ ] Select custom template
   - [ ] Export with custom template

5. **Bulk Export:**
   - [ ] Create multiple profiles
   - [ ] Click "Export All Profiles"
   - [ ] Verify JSON file contains all profiles

6. **Analytics:**
   - [ ] Perform some optimizations
   - [ ] Check analytics dashboard
   - [ ] Verify all statistics are accurate

---

## 🐛 Troubleshooting

### Auto-Sync Not Working
1. Check if Google Drive is authenticated
2. Verify sync interval is set correctly
3. Check browser console for errors
4. Ensure permissions are granted

### Folder Selection Empty
1. Sign out and sign in to Google Drive
2. Check Google Drive permissions in manifest
3. Verify OAuth client ID is correct

### Email Sharing Failed
1. Check if email address is valid
2. Ensure file exists in Google Drive
3. Verify Google Drive permissions

### Custom Templates Not Saving
1. Check browser storage quota
2. Verify all required fields are filled
3. Check browser console for errors

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify all permissions are granted
3. Test with Google Drive integration working
4. Review implementation files for reference

---

## 🎉 That's It!

All features are ready to use. No complex setup required. Just import and use!

**Happy coding! 🚀**
