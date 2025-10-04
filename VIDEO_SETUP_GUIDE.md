# 📹 Video Setup Guide: Google Cloud Console API Integration

## Complete Step-by-Step Visual Guide for Setting Up OAuth2 Client ID

---

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Google Cloud Project](#step-1-create-google-cloud-project)
4. [Step 2: Enable Required APIs](#step-2-enable-required-apis)
5. [Step 3: Configure OAuth Consent Screen](#step-3-configure-oauth-consent-screen)
6. [Step 4: Create OAuth 2.0 Client ID](#step-4-create-oauth-20-client-id)
7. [Step 5: Configure Extension Manifest](#step-5-configure-extension-manifest)
8. [Step 6: Validate Your Setup](#step-6-validate-your-setup)
9. [Step 7: Test the Integration](#step-7-test-the-integration)
10. [Troubleshooting](#troubleshooting)
11. [Video Tutorial](#video-tutorial)

---

## 🎯 Introduction

This guide will walk you through the complete process of setting up Google Cloud Console API integration for the AI CV Optimizer Chrome Extension. By the end of this guide, you'll have:

- ✅ A configured Google Cloud Project
- ✅ Enabled APIs (Drive, Docs, Sheets, Slides)
- ✅ A valid OAuth 2.0 Client ID
- ✅ Working Google Drive integration
- ✅ Automatic Client ID validation

**Estimated Time:** 15-20 minutes  
**Difficulty:** Beginner-Friendly  
**Cost:** Free (Google Cloud Free Tier)

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] A Google Account (Gmail)
- [ ] Chrome Browser installed
- [ ] AI CV Optimizer Extension installed
- [ ] Basic understanding of Chrome Extensions
- [ ] Internet connection

---

## Step 1: Create Google Cloud Project

### 🎬 Video Timestamp: 0:00 - 2:30

### Instructions:

1. **Open Google Cloud Console**
   - Navigate to: [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google Account

2. **Create New Project**
   - Click the project dropdown in the top navigation bar
   - Click "New Project" button
   - Enter project details:
     - **Project Name:** `AI-CV-Optimizer` (or your preferred name)
     - **Organization:** Leave as default
     - **Location:** Leave as default
   - Click "Create"

3. **Wait for Project Creation**
   - This usually takes 10-30 seconds
   - You'll see a notification when it's ready

### ✅ Checkpoint:
- You should see your new project name in the top navigation bar
- The project ID should be visible (format: `ai-cv-optimizer-######`)

### 📸 Visual Reference:
```
┌─────────────────────────────────────────┐
│ Google Cloud Console                    │
│ ┌─────────────────────────────────────┐ │
│ │ My First Project ▼                  │ │
│ │  ├─ AI-CV-Optimizer (New)           │ │
│ │  ├─ + New Project                   │ │
│ │  └─ My Other Projects               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Step 2: Enable Required APIs

### 🎬 Video Timestamp: 2:30 - 5:00

### Instructions:

1. **Navigate to API Library**
   - In the left sidebar, click "APIs & Services"
   - Click "Library"
   - Or use direct link: [API Library](https://console.cloud.google.com/apis/library)

2. **Enable Google Drive API**
   - Search for "Google Drive API"
   - Click on "Google Drive API"
   - Click "Enable" button
   - Wait for confirmation (green checkmark)

3. **Enable Google Docs API**
   - Return to API Library
   - Search for "Google Docs API"
   - Click on "Google Docs API"
   - Click "Enable" button

4. **Enable Google Sheets API**
   - Return to API Library
   - Search for "Google Sheets API"
   - Click on "Google Sheets API"
   - Click "Enable" button

5. **Enable Google Slides API**
   - Return to API Library
   - Search for "Google Slides API"
   - Click on "Google Slides API"
   - Click "Enable" button

### ✅ Checkpoint:
Navigate to "APIs & Services" → "Enabled APIs & services" and verify you see:
- ✅ Google Drive API
- ✅ Google Docs API
- ✅ Google Sheets API
- ✅ Google Slides API

### 💡 Pro Tip:
Enable all APIs before proceeding to avoid configuration issues later.

---

## Step 3: Configure OAuth Consent Screen

### 🎬 Video Timestamp: 5:00 - 8:00

### Instructions:

1. **Navigate to OAuth Consent Screen**
   - Click "APIs & Services" in left sidebar
   - Click "OAuth consent screen"
   - Or use direct link: [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

2. **Select User Type**
   - Choose **"External"** (for personal use)
   - Click "Create"

3. **Fill App Information**
   - **App name:** `AI CV Optimizer`
   - **User support email:** Your email address
   - **App logo:** (Optional) Upload extension icon
   - **Application home page:** (Optional)
   - **Application privacy policy:** (Optional)
   - **Application terms of service:** (Optional)
   - **Authorized domains:** Leave empty for testing
   - **Developer contact information:** Your email address
   - Click "Save and Continue"

4. **Configure Scopes**
   - Click "Add or Remove Scopes"
   - Search and select these scopes:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/documents`
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/presentations`
   - Click "Update"
   - Click "Save and Continue"

5. **Add Test Users**
   - Click "Add Users"
   - Enter your Gmail address (the one you'll use for testing)
   - Click "Add"
   - Click "Save and Continue"

6. **Review and Confirm**
   - Review all settings
   - Click "Back to Dashboard"

### ✅ Checkpoint:
- OAuth consent screen status should show "Testing"
- Test users should include your email
- Publishing status: "Testing" (not published)

### ⚠️ Important:
While in "Testing" mode, only test users (max 100) can use the integration. This is sufficient for personal use.

---

## Step 4: Create OAuth 2.0 Client ID

### 🎬 Video Timestamp: 8:00 - 11:00

### Instructions:

1. **Navigate to Credentials**
   - Click "APIs & Services" in left sidebar
   - Click "Credentials"
   - Or use direct link: [Credentials](https://console.cloud.google.com/apis/credentials)

2. **Create Credentials**
   - Click "+ Create Credentials" at the top
   - Select "OAuth client ID"

3. **Get Your Chrome Extension ID**
   - Open Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Find "AI CV & Cover Letter Optimizer"
   - Copy the Extension ID (format: `abcdefghijklmnopqrstuvwxyz123456`)

4. **Configure OAuth Client**
   - **Application type:** Select "Chrome extension"
   - **Name:** `AI CV Optimizer Chrome Extension`
   - **Item ID:** Paste your Chrome Extension ID
   - Click "Create"

5. **Save Your Client ID**
   - A popup will appear with your Client ID
   - Copy the **Client ID** (format: `123456789-abc...xyz.apps.googleusercontent.com`)
   - Click "OK"

### ✅ Checkpoint:
- You should see your new OAuth 2.0 Client ID in the credentials list
- Client ID format: `[PROJECT_NUMBER]-[RANDOM_STRING].apps.googleusercontent.com`

### 📸 Visual Reference:
```
┌────────────────────────────────────────────┐
│ OAuth client created                       │
│                                            │
│ Here is your client ID:                   │
│ ┌────────────────────────────────────────┐│
│ │ 123456789-abc...xyz.apps.              ││
│ │ googleusercontent.com        [Copy]    ││
│ └────────────────────────────────────────┘│
│                                            │
│ [OK]                                       │
└────────────────────────────────────────────┘
```

---

## Step 5: Configure Extension Manifest

### 🎬 Video Timestamp: 11:00 - 13:00

### Instructions:

1. **Locate manifest.json**
   - Navigate to your extension directory
   - Open `manifest.json` file in a text editor

2. **Find OAuth2 Section**
   ```json
   "oauth2": {
     "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/drive.file",
       "https://www.googleapis.com/auth/documents",
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/presentations"
     ]
   }
   ```

3. **Replace Placeholder**
   - Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - With your actual Client ID from Step 4
   - Example:
   ```json
   "oauth2": {
     "client_id": "123456789-abc...xyz.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/drive.file",
       "https://www.googleapis.com/auth/documents",
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/presentations"
     ]
   }
   ```

4. **Save the File**
   - Save `manifest.json`
   - Close the editor

5. **Reload Extension**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click the refresh/reload icon

### ✅ Checkpoint:
- Extension reloaded without errors
- No console warnings about Client ID

### 🎯 Quick Test:
Open extension popup - you should no longer see the "Client ID not configured" warning.

---

## Step 6: Validate Your Setup

### 🎬 Video Timestamp: 13:00 - 14:30

This is the **new automatic validation feature**!

### Instructions:

1. **Open Extension Popup**
   - Click the extension icon in Chrome toolbar
   - Navigate to "Google Drive Settings" tab

2. **Locate Validation Section**
   - Scroll to "🔍 Automatic Client ID Validation"
   - You'll see your current Client ID displayed

3. **Run Validation**
   - Click "✓ Validate Client ID" button
   - Wait for validation (5-10 seconds)

4. **Check Results**
   - ✅ **Success:** "Client ID is valid! Ready for authentication."
   - ❌ **Failed:** Review error message and follow troubleshooting steps

### ✅ Checkpoint:
- Validation shows ✅ Success
- No error messages
- Setup status indicator shows "Ready"

### 📸 Visual Reference:
```
┌─────────────────────────────────────────────┐
│ 🔍 Automatic Client ID Validation          │
│                                             │
│ Current Client ID:                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 123456789-abc...xyz.apps.               │ │
│ │ googleusercontent.com                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [✓ Validate Client ID]                     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ✅ Client ID is valid!                  │ │
│ │                                         │ │
│ │ Validation Details:                     │ │
│ │ Client ID is valid. Ready for           │ │
│ │ authentication.                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Step 7: Test the Integration

### 🎬 Video Timestamp: 14:30 - 16:00

### Instructions:

1. **Initiate Sign-In**
   - Click "🔑 Sign in with Google" button
   - A Google OAuth popup should appear

2. **Grant Permissions**
   - Select your Google account
   - Review requested permissions
   - Click "Allow"

3. **Verify Connection**
   - Extension should show "✓ Connected to Google Drive"
   - Green status indicator

4. **Test Export Functionality**
   - Fill in some CV data (or use existing)
   - Click "📄 Export to Google Docs"
   - Check your Google Drive for the new document

### ✅ Checkpoint:
- Successfully signed in
- Can export to Google Docs
- File appears in Google Drive
- Can view/manage files through extension

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Bad Client ID" Error

**Symptoms:**
- Error message: "OAuth2 error: Bad Client ID"
- Validation fails

**Solutions:**
1. ✓ Verify Client ID is copied correctly (no extra spaces)
2. ✓ Ensure Client ID ends with `.apps.googleusercontent.com`
3. ✓ Check that Extension ID in Google Cloud matches actual Extension ID
4. ✓ Reload extension after changing manifest.json

#### Issue 2: "APIs Not Enabled"

**Symptoms:**
- Can authenticate but export fails
- Error: "API has not been used"

**Solutions:**
1. ✓ Enable all 4 required APIs (Drive, Docs, Sheets, Slides)
2. ✓ Wait 5 minutes after enabling APIs
3. ✓ Refresh Google Cloud Console page
4. ✓ Try validation again

#### Issue 3: "Access Denied"

**Symptoms:**
- Error: "Access denied" or "403 Forbidden"
- Can't authenticate

**Solutions:**
1. ✓ Add your email as test user in OAuth consent screen
2. ✓ Verify OAuth consent screen is configured
3. ✓ Check scopes are correctly added
4. ✓ Sign in with the test user email

#### Issue 4: "Client ID Still Shows Placeholder"

**Symptoms:**
- Validation shows "Setup Required"
- Warning: "Client ID not configured"

**Solutions:**
1. ✓ Open manifest.json in text editor
2. ✓ Search for "YOUR_GOOGLE_CLIENT_ID"
3. ✓ Replace with your actual Client ID
4. ✓ Save file
5. ✓ Go to chrome://extensions/
6. ✓ Click reload icon for the extension

#### Issue 5: Extension Doesn't Load After Changes

**Symptoms:**
- Extension shows errors in chrome://extensions/
- Popup doesn't open

**Solutions:**
1. ✓ Check manifest.json syntax (use JSON validator)
2. ✓ Ensure Client ID is in quotes
3. ✓ No trailing commas in JSON
4. ✓ File saved before reloading

---

## 📺 Video Tutorial

### Watch the Complete Setup Process

**🎥 Full Video Tutorial:** [Link to Video Tutorial]

**Chapter Timestamps:**
- 0:00 - Introduction
- 0:30 - Prerequisites
- 2:30 - Creating Google Cloud Project
- 5:00 - Enabling APIs
- 8:00 - OAuth Consent Screen
- 11:00 - Creating Client ID
- 13:00 - Configuring Extension
- 14:30 - **NEW: Automatic Validation**
- 16:00 - Testing Integration
- 18:00 - Troubleshooting Tips

**Additional Resources:**
- 📖 [Text-based Quick Start Guide](QUICK_START_GOOGLE_DRIVE.md)
- 📖 [Detailed Integration Guide](GOOGLE_DRIVE_INTEGRATION.md)
- 🔧 [Troubleshooting Guide](TROUBLESHOOTING.md)

---

## 🎓 Learning Outcomes

After completing this guide, you will have learned:

- ✅ How to create and configure a Google Cloud Project
- ✅ How to enable Google APIs
- ✅ How to set up OAuth 2.0 for Chrome Extensions
- ✅ How to use the automatic Client ID validation feature
- ✅ How to troubleshoot common setup issues
- ✅ How to integrate Google services with Chrome Extensions

---

## 💡 Best Practices

1. **Security:**
   - Never share your Client ID publicly (it's not a secret, but avoid unnecessary exposure)
   - Keep your OAuth credentials secure
   - Regularly review authorized applications in your Google Account

2. **Testing:**
   - Always use the validation feature before attempting authentication
   - Test with a personal Google account first
   - Verify each export type (Docs, Sheets, Slides)

3. **Maintenance:**
   - Keep Google Cloud Console project organized
   - Monitor API usage (though free tier is generous)
   - Update OAuth consent screen if app details change

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check Documentation:**
   - [Google Cloud Console Documentation](https://cloud.google.com/docs)
   - [Chrome Extension OAuth Guide](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)

2. **Extension Support:**
   - GitHub Issues: [Link to Issues]
   - Email: [Support Email]

3. **Community:**
   - Chrome Extension Developer Forum
   - Stack Overflow (tag: chrome-extension + google-oauth)

---

## 📊 Feature Highlights

### New in This Version: Automatic Client ID Validation

The extension now includes **automatic Client ID validation** that:

- ✅ Tests your Client ID against Google's APIs
- ✅ Provides detailed error messages
- ✅ Verifies OAuth configuration
- ✅ No sign-in required for validation
- ✅ Instant feedback on configuration status

This feature eliminates guesswork and ensures your setup is correct before attempting authentication!

---

## ✨ Next Steps

After completing this setup:

1. ✅ Explore Google Drive features
2. ✅ Export CVs to different formats (Docs, Sheets, Slides)
3. ✅ Test file management features
4. ✅ Try the ATS optimization tools
5. ✅ Customize your CV templates

---

## 📝 Checklist Summary

Print or save this checklist:

- [ ] Google Cloud Project created
- [ ] Google Drive API enabled
- [ ] Google Docs API enabled
- [ ] Google Sheets API enabled
- [ ] Google Slides API enabled
- [ ] OAuth consent screen configured
- [ ] Test user added
- [ ] OAuth 2.0 Client ID created
- [ ] Extension ID added to Client ID
- [ ] Client ID copied to manifest.json
- [ ] Extension reloaded
- [ ] **Automatic validation passed**
- [ ] Successfully authenticated
- [ ] Test export completed

---

**📅 Last Updated:** 2025-10-04  
**📌 Version:** 1.0.0  
**👤 Author:** AI CV Optimizer Team

---

## 📄 License

This guide is part of the AI CV Optimizer Extension documentation.

---

**🎉 Congratulations!** You've successfully set up Google Cloud Console API integration with automatic Client ID validation. Happy CV building! 🚀
