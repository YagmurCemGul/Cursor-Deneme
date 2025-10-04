# Setup Wizard - Quick Reference

## 🚀 What's New?

An **Interactive Setup Wizard** has been added to help you configure Google Drive integration step-by-step with live validation and automatic checks.

## 🎯 Features

### ✅ All Requested Features Implemented

1. **Step-by-Step Setup Guide**
   - 4 clear steps with detailed instructions
   - Visual progress tracking
   - Navigation controls

2. **Client ID Validation Button**
   - Manual validation trigger
   - Format checking
   - Instant feedback

3. **Live Status Updates**
   - Real-time validation
   - Color-coded indicators
   - Progressive checks

4. **Automatic Client ID Validation**
   - Auto-validates as you type
   - 800ms debounce
   - Toggle on/off option

## 🎬 How to Use

### Step 1: Launch the Wizard

1. Open the extension
2. Navigate to **Settings** tab
3. Scroll to **Google Drive Integration** section
4. Click **🚀 Launch Setup Wizard** button

### Step 2: Follow the Steps

The wizard guides you through 4 steps:

**Step 1: Create Google Cloud Project**
- Opens Google Cloud Console
- Create a new project
- Name it (e.g., "CV Optimizer")

**Step 2: Enable Required APIs**
- Enable Google Drive API
- Enable Google Docs API
- Enable Google Sheets API
- Enable Google Slides API

**Step 3: Create OAuth Credentials**
- Create OAuth 2.0 Client ID
- Select "Chrome Extension" type
- Add your extension ID

**Step 4: Configure & Validate**
- Copy your Client ID
- Paste it in the wizard
- Automatic validation runs
- Update manifest.json as shown

### Step 3: Complete Setup

1. Update `manifest.json` with your Client ID
2. Reload the Chrome extension
3. Sign in to Google Drive
4. Done! 🎉

## 📝 Client ID Validation

The wizard validates your Client ID with these checks:

| Check | Description | Example |
|-------|-------------|---------|
| ✅ **Not Empty** | Must have a value | `123456789...` |
| ✅ **Not Placeholder** | Not `YOUR_GOOGLE_CLIENT_ID` | ❌ `YOUR_GOOGLE_CLIENT_ID...` |
| ✅ **Correct Format** | Ends with `.apps.googleusercontent.com` | ✅ `...apps.googleusercontent.com` |
| ✅ **Contains Numbers** | Has digits | ✅ `123456789-abc...` |
| ✅ **Minimum Length** | At least 40 characters | ✅ `123456789-abc...xyz.apps.googleusercontent.com` |

### Validation States

| State | Indicator | Color | Meaning |
|-------|-----------|-------|---------|
| **Validating** | 🔄 | Yellow | Checking your input |
| **Valid** | ✅ | Green | Client ID is correct! |
| **Invalid** | ❌ | Red | Please fix the error |
| **Idle** | - | Gray | No input yet |

## 🌍 Language Support

The wizard is available in:
- 🇬🇧 **English** (en)
- 🇹🇷 **Turkish** (tr)

Language automatically matches your extension settings.

## 🎨 UI Elements

### Progress Bar
```
1️⃣ → 2️⃣ → 3️⃣ → 4️⃣
Create  APIs  OAuth  Config
```

Shows your current step and overall progress.

### Status Indicators
- ✅ **Completed** - Step is done
- 🔄 **In Progress** - Current step
- ⏳ **Pending** - Not started yet
- ❌ **Error** - Something went wrong

### Buttons
- **🔗 Open Google Console** - Opens relevant Google Cloud page
- **🔍 Validate Client ID** - Manually check Client ID
- **← Previous** - Go back a step
- **Next →** - Continue to next step
- **✅ Complete Setup** - Finish wizard

## ⚙️ Settings

### Auto-Validate Toggle
- **✅ Enabled** (default): Validates as you type
- **❌ Disabled**: Manual validation only

Located in Step 4 under the Client ID input field.

## 💡 Tips

1. **Keep the wizard open** while working in Google Cloud Console
2. **Use the direct links** - They open the correct page
3. **Enable auto-validate** for instant feedback
4. **Copy the examples** - They show the exact format needed
5. **Check all 4 APIs** - All are required for full functionality

## 🐛 Troubleshooting

### Wizard won't open
- Make sure you're in the **Settings** tab
- Look for the warning message about setup required
- Try refreshing the extension

### Validation fails
- Check for typos in the Client ID
- Ensure you copied the entire ID
- Verify it ends with `.apps.googleusercontent.com`
- Don't include any extra spaces

### Can't find Extension ID
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Find "AI CV & Cover Letter Optimizer"
4. Copy the ID below the extension name

### Still having issues?
Check these documents:
- 📖 [Quick Start Guide](QUICK_START_GOOGLE_DRIVE.md)
- 📚 [Full Documentation](GOOGLE_DRIVE_INTEGRATION.md)
- 🔧 [Troubleshooting](TROUBLESHOOTING.md)

## 📱 Responsive Design

The wizard works on all screen sizes:
- 🖥️ **Desktop**: Full modal (800px wide)
- 💻 **Laptop**: Responsive scaling
- 📱 **Tablet**: Touch-friendly buttons
- 📲 **Mobile**: Vertical scroll, stacked layout

## ♿ Accessibility

- ⌨️ **Keyboard Navigation**: Tab through all controls
- 🔊 **Screen Reader Support**: ARIA labels included
- 🎨 **High Contrast**: Clear visual hierarchy
- 👆 **Touch Targets**: Large, easy-to-tap buttons

## 🔐 Privacy & Security

- ✅ **No data sent** - All validation happens locally
- ✅ **No storage** - Client ID not saved by wizard
- ✅ **No tracking** - Your data stays private
- ✅ **Safe links** - Only official Google Cloud URLs

## 📊 What Happens Next?

After completing the wizard:

1. **Update manifest.json**
   ```json
   "oauth2": {
     "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com"
   }
   ```

2. **Reload Extension**
   - Go to `chrome://extensions`
   - Click reload button

3. **Sign In**
   - Open extension
   - Go to Settings → Google Drive
   - Click "Sign In with Google"

4. **Start Using**
   - Export CVs to Google Docs
   - Save to Google Drive
   - Access from anywhere

## 🎓 Learn More

### Documentation
- [Setup Wizard Implementation](SETUP_WIZARD_IMPLEMENTATION.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Google Drive Integration](GOOGLE_DRIVE_INTEGRATION.md)

### Google Resources
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Extension OAuth](https://developer.chrome.com/docs/extensions/mv3/oauth2/)

## 🎉 Success Stories

Once set up, you can:
- ✅ Export CVs to Google Docs with one click
- ✅ Save cover letters to Google Drive
- ✅ Access your documents from anywhere
- ✅ Share and collaborate easily

## 📞 Support

Need help?
1. Check the troubleshooting section above
2. Review the documentation
3. Look for existing issues in the project
4. Create a new issue with details

## 🚀 Quick Start (TL;DR)

```
1. Open extension → Settings → Google Drive
2. Click "🚀 Launch Setup Wizard"
3. Follow 4 steps in the wizard
4. Copy your Client ID
5. Paste and validate
6. Update manifest.json
7. Reload extension
8. Sign in
9. Done! 🎉
```

---

**Made with ❤️ for easier Google Drive setup**

*Interactive Setup Wizard v1.0*
