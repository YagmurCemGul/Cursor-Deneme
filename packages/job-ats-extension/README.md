# Job Autofill & ATS Assistant

AI-powered Chrome extension for automating job applications with ATS scoring, smart autofill, cover letter generation, and application tracking.

## Features

### 🎯 Core Features

- **🤖 Smart Autofill**: Automatically fill job application forms with your profile data
- **📊 ATS Match Score**: Calculate compatibility score between your resume and job descriptions
- **✍️ AI Cover Letter Generator**: Generate tailored cover letters using OpenAI GPT models
- **📋 Application Tracker**: Track job applications with status updates and notes
- **🔍 Job Description Extraction**: Automatically extract and cache job postings

### 🏢 Supported ATS Platforms

- Workday
- Greenhouse
- Lever
- Ashby
- SmartRecruiters
- SuccessFactors
- Workable
- iCIMS
- LinkedIn Jobs
- Indeed
- And more generic forms...

### 🌐 Internationalization

- English (en)
- Turkish (tr)

## Installation

### Development Setup

1. **Clone and Install Dependencies**

   ```bash
   cd packages/job-ats-extension
   pnpm install
   ```

2. **Build the Extension**

   ```bash
   # Development mode with hot reload
   pnpm dev

   # Production build
   pnpm build
   ```

3. **Load in Chrome**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the extension directory

### Configuration

1. **Get OpenAI API Key**
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure Extension**
   - Click the extension icon or open Options
   - Enter your OpenAI API key
   - Choose your preferred model (GPT-4o Mini recommended)
   - Set up your profile with personal information

## Usage

### Quick Actions

#### Keyboard Shortcuts

- **`Ctrl+Shift+A`** (Mac: `Cmd+Shift+A`): Auto-fill current form
- **`Ctrl+Shift+M`** (Mac: `Cmd+Shift+M`): Calculate ATS match score
- **`Ctrl+Shift+L`** (Mac: `Cmd+Shift+L`): Open side panel

#### Dashboard

Click the extension icon to open the full dashboard where you can:

- Manage your profile and resume
- View saved jobs and tracked applications
- Generate cover letters
- Configure settings

### Workflow

1. **Set Up Your Profile**
   - Navigate to Dashboard → Profile
   - Fill in personal information, work authorization, and preferences
   - Add education, experience, and skills in the Resume section

2. **Browse Job Postings**
   - Visit any job posting on supported platforms
   - The extension automatically extracts job details

3. **Apply with Autofill**
   - On the application page, press `Ctrl+Shift+A`
   - Review auto-filled fields (especially file uploads require manual action)
   - Submit the application

4. **Track Applications**
   - Use the Tracker page to monitor application status
   - Update status as you progress through interviews

### Cover Letter Generation

1. Navigate to a job posting
2. Click the extension icon → "Cover Letter"
3. Review and edit the generated letter
4. Download or copy to your application

### ATS Score Checking

1. Open a job posting
2. Press `Ctrl+Shift+M` or click "ATS Score"
3. View match percentage and missing keywords
4. Update your resume based on suggestions

## Architecture

### Technology Stack

- **Build System**: Vite + @crxjs/vite-plugin
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Storage**: Chrome Storage API + IndexedDB (idb)
- **Styling**: Custom CSS with CSS variables
- **Testing**: Vitest (unit) + Playwright (e2e)

### Project Structure

```
packages/job-ats-extension/
├── public/
│   ├── manifest.json
│   └── _locales/
│       ├── en/messages.json
│       └── tr/messages.json
├── src/
│   ├── background/        # Service worker
│   │   ├── index.ts       # Main background script
│   │   ├── openai.ts      # OpenAI API client
│   │   └── crypto.ts      # Encryption utilities
│   ├── content/           # Content scripts
│   │   ├── index.ts       # Main content script
│   │   ├── core/
│   │   │   ├── detector.ts    # Field detection
│   │   │   ├── filler.ts      # Form filling
│   │   │   └── extract-jd.ts  # Job description extraction
│   │   └── adapters/      # ATS-specific adapters
│   ├── tab/               # Dashboard UI
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── pages/
│   ├── options/           # Options page
│   ├── popup/             # Popup UI
│   ├── lib/               # Shared utilities
│   │   ├── i18n.ts
│   │   ├── storage.ts
│   │   ├── idb.ts
│   │   └── messaging.ts
│   ├── types/             # TypeScript definitions
│   ├── styles/            # Global styles
│   └── tests/             # Unit and E2E tests
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm e2e

# With UI
pnpm test:ui
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Type Checking

```bash
pnpm type-check
```

## Security & Privacy

### Data Storage

- All data is stored locally in Chrome Storage and IndexedDB
- No data is sent to external servers except OpenAI API calls
- API key is stored in local storage (consider encryption)

### Optional Encryption

Enable AES-256-GCM encryption in Settings to encrypt your profile data:

1. Go to Settings → Security
2. Enable "Local data encryption"
3. Set a strong password

⚠️ **Warning**: If you lose your encryption password, your data cannot be recovered!

### API Key Security

- Your OpenAI API key is stored locally
- Never share your API key
- Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)

## Limitations

### File Upload Restrictions

Due to browser security policies, the extension **cannot** programmatically select files for `<input type="file">` fields. When autofill encounters a file upload:

1. The field will be highlighted
2. A tooltip will show the recommended file name
3. You must manually click and select the file

### Form Submission

The extension **never** automatically submits forms. You must always:

1. Review auto-filled data
2. Upload required files manually
3. Click the submit button yourself

## Troubleshooting

### Autofill Not Working

1. Verify your profile is complete (Dashboard → Profile)
2. Check if the site is supported (see Supported ATS Platforms)
3. Try refreshing the page
4. Check console for errors (F12 → Console)

### API Errors

- **401 Unauthorized**: Invalid API key
- **429 Rate Limit**: Too many requests, wait and retry
- **500 Server Error**: OpenAI service issue, try again later

### Form Detection Issues

Some websites use custom form frameworks that may not be detected. If autofill doesn't work:

1. Try manual filling
2. Report the site URL as an issue
3. Check if custom adapter is needed

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for job seekers**
