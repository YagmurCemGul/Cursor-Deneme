# Google Drive Integration Guide

## Overview

This CV Optimizer extension now includes full Google Drive integration, allowing you to export your CV and cover letters directly to Google Docs, Sheets, and Slides. This guide will help you set up and use these features.

## Features

### 📄 Google Docs Export
- Export your formatted CV directly to Google Docs
- Automatically opens in your browser for immediate editing
- Preserves formatting, styles, and structure
- Includes all sections: personal info, experience, education, skills, etc.

### 📊 Google Sheets Export  
- Export your CV data in a structured spreadsheet format
- Separate sheets for Personal Info, Skills, Experience, and Education
- Perfect for data analysis and tracking multiple CV versions
- Easy to filter and sort your information

### 📽️ Google Slides Export
- Create a presentation-style resume
- Each section gets its own slide
- Great for visual presentations and portfolios
- Professional layout with automatic formatting

### ☁️ File Management
- View all your exported files
- Open files directly from the extension
- Delete old versions
- Automatic timestamping

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "CV Optimizer Extension")
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable the following APIs:
   - **Google Drive API**
   - **Google Docs API**
   - **Google Sheets API**
   - **Google Slides API**

For each API:
- Click on the API name
- Click "Enable"
- Wait for it to be enabled

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: CV Optimizer
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip for now
   - Test users: Add your email
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: **Chrome Extension**
   - Name: CV Optimizer Extension
   - Click "Create"

5. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

### Step 4: Configure the Extension

1. Open your extension's `manifest.json` file
2. Find the `oauth2` section
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:

```json
{
  "oauth2": {
    "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/presentations"
    ]
  }
}
```

4. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension

### Step 5: Authorize the Extension

1. Open the extension
2. Go to the "Settings" tab
3. Scroll down to "Google Drive Integration"
4. Click "Sign In with Google"
5. Follow the prompts to authorize the extension
6. Grant the requested permissions

## Usage

### Exporting to Google Docs

1. Complete your CV information
2. Go to "Optimize & Preview" tab
3. Click the cloud button (☁️ Export to Google)
4. Select "📄 Export to Google Docs"
5. Your CV will be created and opened in a new tab

### Exporting to Google Sheets

1. Complete your CV information
2. Go to "Optimize & Preview" tab
3. Click the cloud button (☁️ Export to Google)
4. Select "📊 Export to Google Sheets"
5. Your structured CV data will open in Google Sheets

### Exporting to Google Slides

1. Complete your CV information
2. Go to "Optimize & Preview" tab
3. Click the cloud button (☁️ Export to Google)
4. Select "📽️ Export to Google Slides"
5. Your presentation-style CV will open in Google Slides

### Exporting Cover Letters

1. Generate your cover letter in the "Cover Letter" tab
2. Click "☁️ Export to Google Docs"
3. Your cover letter will be created and opened

### Managing Files

1. Go to "Settings" tab
2. Scroll to "Google Drive Integration"
3. Click "📁 View My Files"
4. You can:
   - Click "👁️ Open" to view a file
   - Click "🗑️ Delete" to remove a file
   - See creation dates for all files

## Troubleshooting

### "Authentication Required" Error

**Solution:**
1. Go to Settings → Google Drive Integration
2. Click "Sign Out" if already signed in
3. Click "Sign In with Google" again
4. Complete the authorization flow

### "Failed to Export" Error

**Possible causes:**
1. **APIs not enabled**: Go back to Step 2 and verify all APIs are enabled
2. **Invalid Client ID**: Check your manifest.json has the correct Client ID
3. **Network issue**: Check your internet connection

**Solution:**
- Verify all setup steps were completed
- Check browser console for detailed error messages
- Try signing out and signing in again

### "Access Denied" Error

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "OAuth consent screen"
3. Make sure your email is added as a test user
4. If using "External" type, you may need to publish the app or add users

### Files Not Showing

**Solution:**
1. Make sure you're signed in to Google Drive
2. Click "View My Files" to refresh the list
3. Check that the files weren't created in a different Google account

## Security & Privacy

### Data Handling
- All CV data is stored locally in Chrome's storage
- No data is sent to external servers except Google APIs
- You control which files to export and when

### Permissions Explained
- **drive.file**: Create and manage files created by this app only
- **documents**: Create and edit Google Docs files
- **spreadsheets**: Create and edit Google Sheets files
- **presentations**: Create and edit Google Slides files

### OAuth Token Management
- Tokens are stored securely by Chrome
- Tokens automatically refresh when expired
- You can revoke access anytime from Settings

## Best Practices

### File Organization
1. Use meaningful CV versions (export after major updates)
2. Regularly clean up old versions
3. Consider creating a "CV Versions" folder in Google Drive

### Backup Strategy
1. Keep local PDF/DOCX backups
2. Export to Google Docs for version history
3. Use Google Sheets for data tracking

### Collaboration
1. Share Google Docs versions with mentors/reviewers
2. Use comment features for feedback
3. Track changes using Google Docs version history

## Advanced Features

### Bulk Export
You can export multiple formats at once:
1. Export to Google Docs for editing
2. Export to Google Sheets for data management
3. Export to Google Slides for presentations

### Version Control
Google Docs automatically tracks versions:
1. Open your exported document
2. Go to File → Version history
3. View all changes and restore previous versions

### Sharing
Share your exported files:
1. Open the file in Google Drive
2. Click "Share"
3. Add email addresses or get a shareable link

## API Quotas

Google APIs have usage quotas:
- **Drive API**: 1,000 requests per 100 seconds per user
- **Docs API**: 300 requests per minute per user
- **Sheets API**: 500 requests per 100 seconds per user
- **Slides API**: 300 requests per minute per user

For typical usage (personal CV exports), these limits are more than sufficient.

## FAQ

### Q: Do I need to pay for Google Cloud?
**A:** No, the free tier is sufficient for personal use. You only need a Google account.

### Q: Can I use this with multiple Google accounts?
**A:** Yes, sign out and sign in with a different account when needed.

### Q: Will my files be private?
**A:** Yes, all files are created in your personal Google Drive and are private by default.

### Q: Can I edit the exported files?
**A:** Yes! That's one of the main benefits. Edit them directly in Google Docs/Sheets/Slides.

### Q: What happens if I delete a file from the extension?
**A:** It's permanently deleted from your Google Drive. Make sure you have backups.

### Q: Can I export without signing in?
**A:** No, you must authorize the extension to access your Google Drive.

### Q: Is there a file size limit?
**A:** Google Drive limits files to 50MB, but typical CVs are under 1MB.

## Support

For issues or questions:
1. Check this documentation first
2. Verify all setup steps were completed correctly
3. Check the browser console for error messages
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser console logs

## Updates

### Version 1.0.0
- Initial Google Drive integration
- Support for Docs, Sheets, and Slides export
- File management interface
- OAuth2 authentication

## Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [Google Docs API Documentation](https://developers.google.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets)
- [Google Slides API Documentation](https://developers.google.com/slides)
- [Chrome Extension OAuth Guide](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)

## License

This extension is provided as-is. Google, Google Drive, Google Docs, Google Sheets, and Google Slides are trademarks of Google LLC.
