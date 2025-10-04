# AI CV & Cover Letter Optimizer Chrome Extension

A powerful Chrome Extension that uses AI to optimize your CV and generate ATS-friendly cover letters tailored to specific job descriptions.

## 🌟 Features

### CV Templates
- **🎨 8 Professional Templates**: Choose from Classic, Modern, Executive, Creative, Compact, Academic, Tech, and Startup styles
- **🎯 Industry-Specific**: Templates tailored for different industries and career levels
- **🖌️ Full Customization**: Each template with unique colors, fonts, and layouts
- **👁️ Live Preview**: See how each template looks before selecting
- **💾 Persistent Selection**: Your template choice is saved automatically

### CV Management
- **📄 CV Upload**: Upload your existing CV in PDF or DOCX format with automatic parsing
- **👤 Complete Profile Form**: Comprehensive forms for:
  - Personal Information (Name, Email, Phone, LinkedIn, GitHub, Portfolio, WhatsApp)
  - Professional Summary
  - Skills with tag-based management
  - Work Experience (with employment type, dates, location, description)
  - Education (degrees, fields of study, GPA, activities)
  - Certifications & Licenses
  - Projects (with skills and date tracking)
  - Custom Questions (multiple input types: text, choice, checkbox, etc.)

### AI-Powered Optimization
- **✨ ATS Optimization**: Analyzes job descriptions and optimizes your CV for Applicant Tracking Systems
- **🎯 Smart Keyword Matching**: Automatically identifies and incorporates relevant keywords
- **💪 Action Verb Enhancement**: Replaces passive language with powerful action verbs
- **📊 Quantification Suggestions**: Helps add measurable results to your achievements
- **🔄 Reversible Changes**: Each optimization is displayed as a "pill" - hover and click X to remove

### Optimization Details Display
- **💊 Interactive Pills UI**: Each change shown as a pill that:
  - Displays category and change description
  - Turns red on hover with X button
  - Can be clicked to toggle on/off
- **📋 Detailed View**: See before/after comparisons for each optimization

### CV Export
- **📥 Multiple Formats**: Download as PDF, DOCX, or export to Google Drive
- **☁️ Google Drive Integration**: Export directly to Google Docs, Sheets, or Slides
- **👁️ Live Preview**: See exactly how your CV will look before downloading
- **🎨 Professional Formatting**: Clean, ATS-friendly templates
- **📝 Smart Naming**: Automatically generates professional filenames
- **📊 Structured Data Export**: Export to Google Sheets for data analysis

### Cover Letter Generation
- **✉️ AI-Generated Letters**: Create compelling cover letters based on your CV and job description
- **🎯 Job-Specific**: Tailored to match the specific job requirements
- **💭 Extra Prompts**: Add custom instructions for tone and style
- **💾 Prompt Management**: Save and organize frequently used prompts in folders
- **📋 One-Click Copy**: Copy entire cover letter to clipboard
- **📥 Export Options**: Download as PDF, DOCX, or export to Google Docs

### Profile & Template Management
- **💾 Save Profiles**: Save multiple CV profiles for different job types
- **🎨 Professional Templates**: 8 pre-made CV templates (Classic, Modern, Executive, Creative, Compact, Academic, Tech, Startup)
- **📋 Template Gallery**: Browse and preview all available templates
- **✨ Template Customization**: Each template with unique color schemes and layouts
- **✏️ Editable Names**: Rename profiles and organize them
- **🔄 Quick Loading**: Load saved profiles with one click

### Resume Writing Guidelines
The AI follows professional resume best practices:
- Specific rather than general language
- Active voice with powerful action verbs
- Fact-based with quantified achievements
- Easy to scan and ATS-friendly
- Consistent formatting
- No personal pronouns or passive language

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser
- Google account (optional, for Google Drive integration)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-cv-optimizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```
   This will create a `dist` folder with the compiled extension.

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from your project
   - The extension icon should appear in your toolbar

5. **Google Drive Setup (Optional)**
   - See [Google Drive Integration Guide](GOOGLE_DRIVE_INTEGRATION.md) for setup instructions
   - Enables direct export to Google Docs, Sheets, and Slides

## 🎯 Usage

### Basic Workflow

1. **Upload Your CV**
   - Click the extension icon
   - Go to "CV Information" tab
   - Upload your existing CV (PDF/DOCX) or fill in manually
   - The extension will auto-fill detected information

2. **Add Job Description**
   - Paste the complete job description you're applying for
   - The AI will use this to optimize your CV

3. **Complete Your Profile**
   - Fill in or verify all sections:
     - Personal Information
     - Skills
     - Experience
     - Education
     - Certifications
     - Projects
     - Custom Questions (optional)

4. **Optimize Your CV**
   - Click "Optimize CV with AI"
   - Review the ATS optimization suggestions
   - Click pills to toggle specific changes
   - Preview your optimized CV

5. **Download or Export Your CV**
   - Download as PDF or DOCX
   - Or export directly to Google Drive (Docs, Sheets, or Slides)
   - Files are professionally named automatically

6. **Generate Cover Letter**
   - Go to "Cover Letter" tab
   - Add any extra instructions (optional)
   - Click "Generate Cover Letter"
   - Review and download or copy to clipboard

7. **Save Your Profile**
   - Go to "Profiles" tab
   - Name your profile
   - Click "Save Profile"
   - Load it anytime for future applications

## 🛠️ Development

### Project Structure
```
ai-cv-optimizer/
├── src/
│   ├── components/          # React components
│   │   ├── CVUpload.tsx
│   │   ├── PersonalInfoForm.tsx
│   │   ├── SkillsForm.tsx
│   │   ├── ExperienceForm.tsx
│   │   ├── EducationForm.tsx
│   │   ├── CertificationsForm.tsx
│   │   ├── ProjectsForm.tsx
│   │   ├── CustomQuestionsForm.tsx
│   │   ├── JobDescriptionInput.tsx
│   │   ├── ATSOptimizations.tsx
│   │   ├── CVPreview.tsx
│   │   ├── CoverLetter.tsx
│   │   └── ProfileManager.tsx
│   ├── utils/
│   │   ├── aiService.ts     # AI integration
│   │   ├── fileParser.ts    # CV parsing
│   │   ├── documentGenerator.ts  # Export functionality
│   │   └── storage.ts       # Chrome storage
│   ├── types.ts             # TypeScript interfaces
│   ├── styles.css           # Styling
│   ├── popup.tsx            # Main app
│   └── popup.html           # HTML template
├── manifest.json            # Chrome extension manifest
├── webpack.config.js        # Build configuration
├── package.json
└── tsconfig.json
```

### Available Scripts

- `npm run build` - Build for production
- `npm run dev` - Build and watch for changes
- `npm run type-check` - Check TypeScript types

### Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Webpack** - Bundling
- **mammoth** - DOCX parsing
- **pdf.js** - PDF parsing
- **docx** - DOCX generation
- **jsPDF** - PDF generation
- **Chrome Extension APIs** - Storage and downloads

## 📝 Features Checklist

✅ Chrome Extension structure
✅ CV upload with file parsing (PDF, DOCX)
✅ Job description input UI
✅ Complete personal information form
✅ LinkedIn profile (pre-filled base URL)
✅ GitHub profile (pre-filled base URL)
✅ Skills management with tags
✅ Experience form (multiple entries)
✅ Education form (multiple entries)
✅ Certifications form
✅ Projects form
✅ Custom questions with multiple input types
✅ AI-powered CV optimization
✅ ATS optimization details with pill UI
✅ Pill hover effect (red with X)
✅ Click X to remove/revert changes
✅ CV preview UI
✅ CV download (PDF, DOCX, Google Docs option)
✅ Cover letter generation
✅ Cover letter preview
✅ Cover letter download (PDF, DOCX, Google Docs option)
✅ Copy cover letter to clipboard
✅ Extra prompt input for cover letter
✅ Save and organize prompts in folders
✅ Profile management (save, load, edit names)
✅ Professional file naming
✅ Resume writing rules implementation
✅ Cover letter writing rules implementation
✅ Auto-fill from uploaded CV
✅ **8 Professional CV Templates**
✅ **Template Selection UI with Preview**
✅ **Template-based PDF/DOCX Export**
✅ **Industry-Specific Template Designs**
✅ **Color Schemes and Layout Options**
✅ **Google Drive Integration (Docs, Sheets, Slides)**
✅ **File Management in Google Drive**
✅ **OAuth2 Authentication**
✅ **Multi-format Export Support**

## 🎨 UI Components

### Pills UI
- Displays optimization changes as interactive pills
- Hover effect: background turns red, X appears
- Click to toggle the optimization on/off
- Visual feedback for applied/removed changes

### Forms
- Clean, modern design
- Validation and auto-fill support
- Responsive layout
- Intuitive field grouping

### Preview
- Professional formatting
- Matches final output
- Real-time updates
- Print-friendly layout

## 🔒 Privacy & Security

- All data stored locally in Chrome storage
- No data sent to external servers (except AI API and Google Drive if configured)
- Complete control over your information
- Export and delete data anytime
- Google Drive integration uses OAuth2 for secure authentication
- Only requested permissions are used (drive.file, documents, spreadsheets, presentations)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Resume best practices based on professional career counseling standards
- ATS optimization techniques from industry research
- UI/UX inspired by modern job application platforms

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

For Google Drive integration setup, see [Google Drive Integration Guide](GOOGLE_DRIVE_INTEGRATION.md).

---

**Made with ❤️ for job seekers worldwide**
