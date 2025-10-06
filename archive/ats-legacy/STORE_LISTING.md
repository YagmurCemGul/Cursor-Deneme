# Chrome Web Store Listing

## Extension Name

Job Autofill & ATS Assistant

## Tagline (short description - 132 characters max)

AI-powered job application automation with smart autofill, ATS scoring, cover letter generation, and application tracking.

## Detailed Description (min 250 characters)

Streamline your job search with Job Autofill & ATS Assistant - the intelligent Chrome extension that automates tedious application forms while helping you optimize your resume for Applicant Tracking Systems (ATS).

### 🎯 Key Features

**Smart Autofill**
- Automatically fill job application forms with your profile data
- Supports 11+ major ATS platforms including Workday, Greenhouse, Lever, LinkedIn, Indeed, and more
- Intelligent field detection with fuzzy matching
- Works with React, Angular, and vanilla JavaScript forms
- Multi-step form support with real-time detection

**ATS Match Scoring**
- Calculate compatibility between your resume and job descriptions (0-100%)
- TF-IDF based keyword analysis
- Identify missing skills and requirements
- AI-powered improvement suggestions
- Real-time score updates

**AI Cover Letter Generator**
- Generate tailored cover letters using OpenAI GPT models
- Multiple templates (Short, Standard, STAR Method)
- Customizable tone and style
- Real-time streaming generation
- Editable output with copy/export options

**Application Tracker**
- Track applications through your pipeline: Saved → Applied → Interview → Offered → Rejected
- Add notes and timestamps to each application
- Filter and search your applications
- ATS scores tracked per job
- Never lose track of where you applied

**Job Description Extraction**
- Automatically extract and cache job postings
- Works on LinkedIn, Indeed, Glassdoor, and more
- Offline access to saved jobs
- Structured data parsing (requirements, responsibilities, benefits)

**Privacy-First Design**
- All data stored locally on your device
- No external servers or data collection
- Optional AES-256 encryption for sensitive data
- No telemetry or analytics
- No auto-submission - you review everything

### 🏢 Supported Platforms

- Workday
- Greenhouse
- Lever
- Ashby
- SmartRecruiters
- SAP SuccessFactors
- Workable
- iCIMS
- LinkedIn Jobs
- Indeed
- Glassdoor
- Generic job application forms

### ⚡ Quick Actions

**Keyboard Shortcuts:**
- `Ctrl+Shift+A` - Auto-fill current form
- `Ctrl+Shift+M` - Calculate ATS score
- `Ctrl+Shift+L` - Open side panel

### 🔒 Security & Privacy

- **Local Storage Only**: All your data stays on your device
- **No Tracking**: Zero telemetry or analytics
- **Optional Encryption**: AES-256-GCM encryption available
- **API Security**: Your OpenAI key stored locally, never transmitted to us
- **Manual Review**: Forms never auto-submit; you always review first
- **Open Source**: Code available for audit on GitHub

### 🌐 Internationalization

- English (en)
- Turkish (tr)
- More languages coming soon

### 🚀 Getting Started

1. Install the extension
2. Click the extension icon to open the dashboard
3. Complete your profile with personal info and resume
4. (Optional) Add your OpenAI API key for AI features
5. Navigate to any job posting
6. Press `Ctrl+Shift+A` to auto-fill or use quick actions

### 📝 Requirements

- Chrome browser (version 88+)
- OpenAI API key (optional, only for AI features)

### 💡 Use Cases

- **Job Seekers**: Save hours filling repetitive application forms
- **Career Changers**: Optimize resumes for different industries
- **Recruiters**: Test ATS compatibility of candidate resumes
- **Students**: Streamline internship and entry-level applications
- **Freelancers**: Quickly apply to multiple gig opportunities

### ❓ FAQ

**Q: Is this extension free?**
A: Yes, the extension is completely free. AI features require an OpenAI API key (costs ~$0.01-0.02 per cover letter).

**Q: Do you collect my data?**
A: No. All data is stored locally on your device. We have no backend servers.

**Q: Can I use this without an OpenAI API key?**
A: Yes! Autofill, tracking, and manual ATS scoring work without AI. Only cover letter generation and AI suggestions require an API key.

**Q: Which ATS platforms are supported?**
A: We support 11+ major platforms. See the full list above. Generic forms also work.

**Q: Is my resume data safe?**
A: Yes. Data is stored in Chrome's protected storage. Optional encryption adds an extra layer of security.

**Q: Can I export my data?**
A: Yes! Export your profile as JSON for backup or portability.

### 🆘 Support

- GitHub Issues: [Repository URL]
- Documentation: See extension README
- Privacy Policy: Included in extension

### 📜 License

MIT License - Open Source

---

**Note**: This extension does NOT guarantee job offers or ATS success. It is a productivity tool to streamline applications and provide insights. Always review auto-filled data before submission. You are responsible for the accuracy of your applications.

## Category

Productivity

## Language

English (with Turkish localization)

## Screenshots

1. **Dashboard Home** - Overview of quick actions and recent jobs
2. **Profile Management** - Complete profile setup interface
3. **ATS Score View** - Match score with missing keywords
4. **Cover Letter Generator** - AI-powered generation in action
5. **Application Tracker** - Kanban-style pipeline view
6. **Autofill Demo** - Form being automatically filled
7. **Settings Panel** - Configuration options

## Promotional Images

- **Small Tile**: 440x280 (required)
- **Large Tile**: 920x680 (optional)
- **Marquee**: 1400x560 (optional)

## Website URL

[Your GitHub Repository or Project Website]

## Support URL

[GitHub Issues Page]

## Privacy Policy URL

Included in extension as PRIVACY.md

## Permissions Justification

| Permission | Reason |
|------------|--------|
| `storage` | Save user profile, settings, and tracked jobs locally |
| `activeTab` | Detect forms on current job application page |
| `scripting` | Inject content scripts to enable autofill functionality |
| `contextMenus` | Provide right-click menu shortcuts for quick actions |
| `sidePanel` | Display side panel with job insights and quick tools |
| Host permissions (specific ATS domains) | Required to run autofill and detection on job sites. We only request access to known ATS platforms, not all websites. |
| `https://api.openai.com/*` | Make API calls for AI features (cover letter generation, suggestions). Only used when you explicitly use AI features. |

## Target Audience

- Job seekers (entry-level to executive)
- Career changers
- Recruiters and HR professionals
- Students seeking internships
- Freelancers and contractors

## Tags/Keywords

job search, resume, ATS, applicant tracking system, autofill, cover letter, job application, career, recruitment, automation, productivity, AI, OpenAI, GPT

---

**Prepared by**: Job ATS Extension Team  
**Date**: October 5, 2025  
**Version**: 1.0.0
