# AI CV & Cover Letter Optimizer - Complete Setup Guide (English)

## 📹 Step-by-Step Installation and Setup

This guide will walk you through every step needed to install and configure the AI CV & Cover Letter Optimizer Chrome Extension.

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Google Chrome Browser** (version 90 or higher)
2. **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
3. **npm** (comes with Node.js) or **yarn**
4. **Git** (optional, for cloning the repository)
5. **API Key** from one of these AI providers (optional, for full AI features):
   - OpenAI (ChatGPT) - [Get API Key](https://platform.openai.com/api-keys)
   - Google Gemini - [Get API Key](https://makersuite.google.com/app/apikey)
   - Anthropic Claude - [Get API Key](https://console.anthropic.com/)

---

## 🚀 Part 1: Installation (5 minutes)

### Step 1: Download or Clone the Repository

**Option A: Using Git (Recommended)**
```bash
# Open your terminal and run:
git clone <repository-url>
cd ai-cv-optimizer
```

**Option B: Download ZIP**
1. Download the project as a ZIP file
2. Extract it to a folder of your choice
3. Open terminal/command prompt in that folder

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

This will take 2-3 minutes and install all necessary libraries.

### Step 3: Build the Extension

```bash
# Build the extension for Chrome
npm run build
```

You should see a new `dist` folder created in your project directory.

---

## 🔧 Part 2: Loading Extension in Chrome (3 minutes)

### Step 4: Open Chrome Extensions Page

1. Open **Google Chrome**
2. Navigate to: `chrome://extensions/`
   - Or click the **three dots** (⋮) → **More tools** → **Extensions**

### Step 5: Enable Developer Mode

1. Find the **Developer mode** toggle in the **top-right corner**
2. Click it to **turn it ON**
3. You'll see new buttons appear: "Load unpacked", "Pack extension", etc.

### Step 6: Load the Extension

1. Click **"Load unpacked"** button
2. Navigate to your project folder
3. Select the **`dist`** folder (NOT the root folder)
4. Click **"Select Folder"**

### Step 7: Verify Installation

✅ You should now see the extension in your extensions list with:
- Extension name: "AI CV & Cover Letter Optimizer"
- Status: Enabled (blue toggle)
- Extension icon in your Chrome toolbar

---

## ⚙️ Part 3: Initial Configuration (5 minutes)

### Step 8: Open the Extension

1. Click the **extension icon** in your Chrome toolbar
   - If you don't see it, click the **puzzle icon** (🧩) and pin the extension
2. The extension popup will open

### Step 9: Set Your Language

1. Click the **Settings** (⚙️) tab
2. Find **"Language"** option
3. Select your preferred language:
   - **English** (EN)
   - **Turkish** (TR)

### Step 10: Configure AI Provider

1. In the **Settings** tab, find **"AI Provider"** section
2. Choose your AI provider:
   - **ChatGPT (OpenAI)** - Recommended
   - **Gemini (Google)**
   - **Claude (Anthropic)**
3. Click **"Save API Key"** button

### Step 11: Enter API Key

**For ChatGPT (OpenAI):**
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (save it somewhere safe!)
5. Paste it into the extension
6. Click **"Save"**

**For Gemini:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy and paste into the extension

**For Claude:**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign in and go to API Keys
3. Create a new key and copy it
4. Paste into the extension

---

## 📝 Part 4: First-Time Setup (10 minutes)

### Step 12: Upload Your CV (Optional)

1. Go to **"CV Information"** tab
2. Click **"Upload CV"** button
3. Select your CV file (PDF or DOCX)
4. Wait for automatic parsing
5. Review and correct any auto-filled information

### Step 13: Fill Personal Information

Fill in all required fields:

**Basic Information:**
- First Name
- Middle Name (optional)
- Last Name
- Email
- Phone Number (with country code)

**Professional Links:**
- LinkedIn Username (just the username, not full URL)
- GitHub Username (optional)
- Portfolio URL (optional)
- WhatsApp Link (optional)

**Professional Summary:**
Write a brief summary (2-3 sentences) about your professional background.

### Step 14: Add Your Skills

1. Scroll to **"Skills"** section
2. Type a skill and press **Enter** or click **"Add"**
3. Add all relevant technical and soft skills
4. Skills appear as removable tags

**Examples:**
- Technical: JavaScript, Python, React, SQL, Docker
- Soft: Leadership, Communication, Problem Solving

### Step 15: Add Work Experience

For each position:

1. Click **"Add Experience"**
2. Fill in:
   - **Job Title**: Your role (e.g., "Senior Software Engineer")
   - **Company Name**: Employer name
   - **Employment Type**: Full-time, Part-time, Contract, etc.
   - **Location**: City and Country
   - **Location Type**: On-site, Remote, Hybrid
   - **Start Date**: MM/YYYY
   - **End Date**: MM/YYYY (or check "Currently Working")
   - **Description**: What you did and achieved
   - **Skills Used**: Add relevant skills

3. Click **"Save"**
4. Repeat for all positions

### Step 16: Add Education

For each degree:

1. Click **"Add Education"**
2. Fill in:
   - **School Name**: University or institution
   - **Degree**: Bachelor's, Master's, PhD, etc.
   - **Field of Study**: Your major
   - **Location**: City and Country
   - **Start Date**: MM/YYYY
   - **End Date**: MM/YYYY (or check "Currently Studying")
   - **GPA**: Optional
   - **Activities**: Clubs, societies, etc.
   - **Description**: Relevant coursework or achievements

3. Click **"Save"**
4. Repeat for all degrees

### Step 17: Add Certifications (Optional)

1. Click **"Add Certification"**
2. Fill in:
   - **Certification Name**
   - **Issuing Organization**
   - **Issue Date**
   - **Expiration Date** (or check "No Expiration")
   - **Credential ID** (optional)
   - **Credential URL** (optional)

3. Repeat for all certifications

### Step 18: Add Projects (Optional)

1. Click **"Add Project"**
2. Fill in:
   - **Project Name**
   - **Description**: What the project does
   - **Skills Used**
   - **Start Date**
   - **End Date** (or check "Currently Working")
   - **Associated With**: Company or organization

3. Repeat for all projects

---

## 🎯 Part 5: Using the Extension (15 minutes)

### Step 19: Add a Job Description

1. Open a job posting you want to apply for
2. Copy the entire job description
3. Go to **"CV Information"** tab
4. Find **"Job Description"** text area
5. Paste the job description
6. Click anywhere outside the text area to save

### Step 20: Optimize Your CV

1. Click **"Optimize CV with AI"** button at the bottom
2. Wait 30-60 seconds for AI analysis
3. Review the **ATS Score** (appears at the top)

### Step 21: Review Optimization Suggestions

In the **"Optimize & Preview"** tab:

1. See all suggested optimizations as **pills**
2. Each pill shows:
   - Category (Keywords, Action Verbs, Quantification, etc.)
   - The specific change
3. **Hover** over a pill to see it turn red with an X
4. **Click** the pill to toggle the change on/off
5. **Click X** to permanently remove a suggestion

### Step 22: Preview Your CV

1. Scroll down to the **CV Preview** section
2. See your optimized CV in real-time
3. Select a **Template** from the dropdown:
   - Classic
   - Modern
   - Executive
   - Creative
   - Compact
   - Academic
   - Tech
   - Startup

### Step 23: Download Your CV

1. Choose your format:
   - **PDF**: Best for applications
   - **DOCX**: Editable format
   - **Google Docs**: Direct export to Google Drive
2. Click the download button
3. Your CV is automatically named with your name and date

### Step 24: Generate Cover Letter

1. Go to **"Cover Letter"** tab
2. (Optional) Add extra instructions in the prompt field
   - Example: "Make it enthusiastic and highlight my leadership skills"
3. Click **"Generate Cover Letter"**
4. Wait 30-60 seconds
5. Review the generated letter

### Step 25: Customize and Download Cover Letter

1. Read through the cover letter
2. Make any manual edits in the preview
3. Download as:
   - **PDF**
   - **DOCX**
   - **Google Docs**
4. Or click **"Copy to Clipboard"** to paste elsewhere

---

## 💾 Part 6: Saving and Managing Profiles (5 minutes)

### Step 26: Save Your Profile

1. Go to **"Profiles"** tab
2. Enter a **profile name** (e.g., "Software Engineer Profile")
3. Click **"Save Profile"**
4. Success! Your profile is saved

### Step 27: Load a Saved Profile

1. Go to **"Profiles"** tab
2. Find your saved profile
3. Click **"Load"** button
4. All your CV information will be loaded instantly

### Step 28: Manage Multiple Profiles

**Why use multiple profiles?**
- Different job types (e.g., Frontend vs Backend)
- Different industries
- Different experience levels

**To create a new profile:**
1. Modify your CV information
2. Give it a different name
3. Save as a new profile

---

## 🔍 Part 7: Analytics and Error Tracking (5 minutes)

### Step 29: View Optimization Analytics

1. Go to **"Analytics"** tab
2. See statistics:
   - Total optimizations applied
   - Average per session
   - Most optimized sections
   - AI provider usage
3. View category breakdowns
4. See recent activity

### Step 30: Monitor Error Analytics

1. Scroll down in the **"Analytics"** tab
2. View **Error Analytics** section:
   - Total errors
   - Critical errors
   - Error types breakdown
   - Error severity chart
3. Filter errors by:
   - Severity (Critical, High, Medium, Low)
   - Type (Runtime, Network, API, etc.)
4. Click on any error to see details:
   - Stack trace
   - Metadata
   - Timestamp
5. Mark errors as **resolved** after fixing

### Step 31: Clear Analytics Data

**To clear optimization analytics:**
1. In Analytics section, click **"Clear Analytics Data"**
2. Confirm the action

**To clear error logs:**
1. In Error Analytics section, click **"Clear Error Logs"**
2. Confirm the action

---

## 🎨 Part 8: Advanced Features (5 minutes)

### Step 32: Save Prompts for Cover Letters

1. Go to **"Cover Letter"** tab
2. Enter a custom prompt
3. Click **"Save Prompt"**
4. Give it a name
5. Organize in folders (optional)

### Step 33: Job Description Library

1. After pasting a job description
2. Click **"Save to Library"**
3. Give it a name and category
4. Add tags for easy searching
5. Reuse saved job descriptions later

### Step 34: Google Drive Integration

1. Go to **"Settings"** tab
2. Find **"Google Drive Integration"**
3. Click **"Sign In with Google"**
4. Allow permissions
5. Now you can export directly to:
   - Google Docs
   - Google Sheets
   - Google Slides

### Step 35: Theme Settings

1. Go to **"Settings"** tab
2. Find **"Theme"** option
3. Choose:
   - **Light**: Bright theme
   - **Dark**: Dark mode
   - **System**: Follows your OS theme

---

## 🆘 Part 9: Troubleshooting (5 minutes)

### Common Issues and Solutions

#### Issue 1: Extension Not Loading
**Solution:**
1. Make sure you selected the `dist` folder, not the root
2. Check Developer Mode is enabled
3. Try reloading: Click reload icon (🔄) next to the extension
4. Check for errors in the Extensions page

#### Issue 2: API Key Not Working
**Solution:**
1. Verify the API key is correct (no extra spaces)
2. Check you have credits/quota with your AI provider
3. Try regenerating the API key
4. Make sure you selected the correct provider

#### Issue 3: CV Upload Not Parsing
**Solution:**
1. Check file format (only PDF and DOCX supported)
2. Try a different file
3. Manually enter information instead
4. Check Error Analytics for details

#### Issue 4: Optimizations Not Applying
**Solution:**
1. Make sure job description is provided
2. Check internet connection
3. Verify API key is configured
4. Try with a different AI provider
5. Check Error Analytics tab

#### Issue 5: Download Not Working
**Solution:**
1. Allow downloads in Chrome settings
2. Check popup blocker settings
3. Try a different format (PDF vs DOCX)
4. Check browser console for errors

### Getting Help

If you encounter issues:
1. Check **Error Analytics** tab for details
2. Check browser console (F12 → Console)
3. Review error logs
4. Open a GitHub issue with:
   - Steps to reproduce
   - Error messages
   - Screenshots
   - Browser version

---

## ✅ Part 10: Verification Checklist

After setup, verify everything works:

- [ ] Extension appears in Chrome toolbar
- [ ] Can switch between English and Turkish
- [ ] Can select and save AI provider settings
- [ ] Can upload and parse CV
- [ ] Can fill in all form sections
- [ ] Can add/edit/remove experiences, education, etc.
- [ ] Can paste job descriptions
- [ ] Can optimize CV with AI
- [ ] Can see optimizations as pills
- [ ] Can toggle optimizations on/off
- [ ] Can preview CV with different templates
- [ ] Can download CV as PDF/DOCX
- [ ] Can generate cover letters
- [ ] Can save and load profiles
- [ ] Can view analytics
- [ ] Can view error tracking
- [ ] Can export to Google Drive (if configured)

---

## 🎉 Congratulations!

You have successfully installed and configured the AI CV & Cover Letter Optimizer Extension!

### Next Steps:

1. **Customize your profile** for different job types
2. **Try different AI providers** to compare results
3. **Experiment with templates** to find your favorite
4. **Build a library** of job descriptions
5. **Monitor analytics** to improve over time

### Tips for Best Results:

- ✨ Keep your CV information up-to-date
- 📝 Use specific, measurable achievements
- 🎯 Tailor each application to the job description
- 🔄 Review and tweak AI suggestions
- 💾 Save multiple profile versions
- 📊 Check analytics regularly
- 🐛 Report bugs in Error Analytics

---

## 📚 Additional Resources

- **README.md**: Feature documentation
- **TROUBLESHOOTING.md**: Detailed troubleshooting guide
- **DEVELOPER_GUIDE.md**: For developers and contributors
- **GitHub Issues**: Report bugs and request features

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-04  
**Language:** English

---

*Made with ❤️ for job seekers worldwide*
