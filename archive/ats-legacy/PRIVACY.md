# Privacy Policy - Job ATS Extension

**Last Updated**: October 5, 2025  
**Version**: 1.0.0

## Our Commitment to Privacy

The Job ATS Extension is designed with privacy as a fundamental principle. We believe you should have complete control over your personal data.

## Data Collection and Storage

### What Data We Collect

The extension collects and stores the following data **locally on your device**:

1. **Profile Information**
   - Personal details (name, email, phone, location)
   - Work authorization status
   - Salary expectations and preferences
   - Resume data (education, experience, skills)

2. **Application Tracking Data**
   - Saved job listings
   - Application statuses and notes
   - ATS match scores
   - Job descriptions (cached for offline access)

3. **Settings and Preferences**
   - OpenAI API key (if provided)
   - Preferred AI model
   - Language preference
   - Adapter enable/disable states
   - Optional encryption settings

### Where Data Is Stored

All extension data is stored **locally** using:

- **Chrome Storage API**: For settings and small data
- **IndexedDB**: For large data (job descriptions, resume versions)

**Important**: No data is transmitted to any server except:
- OpenAI API calls (when using AI features)
- These are direct requests from your browser to OpenAI
- We do not operate any backend servers
- We do not collect or store any data on external servers

## Data Usage

### How We Use Your Data

Your data is used exclusively for:

1. **Autofilling job application forms** on supported ATS platforms
2. **Calculating ATS match scores** between your resume and job descriptions
3. **Generating cover letters** using AI (via OpenAI API)
4. **Tracking your applications** and their statuses
5. **Providing you with a personalized experience**

### What We DO NOT Do

❌ We do NOT:
- Send your data to any server (except OpenAI API when explicitly requested)
- Collect analytics or telemetry
- Track your browsing history
- Share data with third parties
- Sell or monetize your data
- Auto-submit job applications without your review

## Third-Party Services

### OpenAI API

When you use AI features (cover letter generation, answer suggestions, ATS analysis), the extension makes direct API calls to OpenAI's servers.

**What is sent to OpenAI**:
- Job descriptions (for analysis)
- Relevant portions of your resume (for matching)
- Questions and prompts you generate

**Your OpenAI API Key**:
- Stored locally in your browser
- Never transmitted to us
- Used only for your direct API calls

**OpenAI's Privacy Policy**: https://openai.com/privacy

**Note**: You are responsible for your OpenAI API usage and any associated costs.

## Data Security

### Local Storage Security

- Data is stored in Chrome's protected storage
- Only this extension can access its storage
- Storage is isolated from web pages and other extensions

### Optional Encryption

The extension offers **optional AES-256-GCM encryption** for sensitive data:

- **How it works**: Your profile data is encrypted with a password you provide
- **Key derivation**: Uses PBKDF2 with 100,000 iterations
- **What's encrypted**: All profile and resume data
- **What's NOT encrypted**: Settings, job cache (for performance)

⚠️ **Important**: If you enable encryption and lose your password, your data **cannot be recovered**. There is no password reset mechanism.

### Form Submission Safety

- The extension **never auto-submits** forms
- You must always review and manually submit
- File uploads require your explicit interaction (browser security requirement)

## Permissions Explanation

The extension requires the following Chrome permissions:

| Permission | Purpose | Justification |
|------------|---------|---------------|
| `storage` | Save settings and data | Required for all local data storage |
| `activeTab` | Access current tab | Required to detect forms and autofill |
| `scripting` | Inject content scripts | Required for form detection on job sites |
| `contextMenus` | Right-click menu actions | Optional convenience feature |
| `sidePanel` | Open side panel | Optional UI feature |
| Host permissions (specific ATS domains) | Access job application pages | Required only for supported ATS platforms (Workday, Greenhouse, LinkedIn, Indeed, etc.) |
| `https://api.openai.com/*` | Make API calls | Required only if using AI features |

### Least-Privilege Approach

- We only request access to **specific ATS domains**, not all websites
- You can disable individual adapters in Settings
- Disabling an adapter stops the extension from running on those sites

## Data Retention and Deletion

### How Long We Keep Data

- Data is kept **indefinitely on your local device** until you delete it
- No server-side retention (we don't have your data)
- Cached job descriptions are retained for offline access
- Application tracking data persists until manually deleted

### How to Delete Your Data

You can delete your data at any time:

1. **Delete specific items**: 
   - Use the in-app delete buttons (jobs, applications)
   - Remove individual tracked jobs from Tracker page
   - Clear job cache from Jobs page

2. **Clear all data** (Nuclear Option):
   - Settings → Data Management → "Wipe All Data"
   - Type "DELETE ALL DATA" to confirm
   - This deletes ALL extension data (profile, settings, tracked jobs, cache)
   - **This action cannot be undone**

3. **Uninstall extension**:
   - Chrome → Extensions → Job ATS Extension → Remove
   - All extension data is automatically deleted

4. **Clear browser data**:
   - Chrome Settings → Privacy → Clear browsing data → Hosted app data
   - Select "Job ATS Extension" if prompted

### Data Deletion Guarantees

When you delete data:
- ✅ Removed from Chrome Storage immediately
- ✅ Removed from IndexedDB immediately
- ✅ Cannot be recovered by us (we have no backup)
- ✅ May remain in browser cache temporarily (cleared on restart)
- ✅ Encrypted data is securely deleted (key destroyed)

## Your Rights

Since all data is stored locally on your device, you have complete control:

- ✅ **Right to Access**: View all your data in the extension dashboard
- ✅ **Right to Export**: Export your profile as JSON
- ✅ **Right to Delete**: Delete any or all data at any time
- ✅ **Right to Portability**: Import/export data as needed

## Children's Privacy

This extension is not intended for use by individuals under 18 years of age. We do not knowingly collect data from children.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be documented in the CHANGELOG.md file. Continued use of the extension after changes constitutes acceptance of the new policy.

## Telemetry and Analytics

**We do NOT collect any telemetry or analytics.**

- No tracking pixels
- No error reporting (unless you explicitly share logs)
- No usage statistics
- No A/B testing

## Open Source

This extension is open source. You can:
- Review all source code on GitHub
- Verify our privacy claims
- Audit data handling yourself
- Build from source if desired

## Contact

For privacy concerns or questions:
- GitHub Issues: [Your Repository URL]
- Email: [Your Contact Email] (if applicable)

## Compliance

This extension is designed to comply with:
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- Other applicable privacy laws

Since all data is stored locally and no telemetry is collected, compliance is straightforward.

## Important Disclaimers

1. **No Warranty**: The extension is provided "as is" without warranty
2. **No Liability**: We are not responsible for job application outcomes
3. **User Responsibility**: You are responsible for reviewing all auto-filled data before submission
4. **API Costs**: You are responsible for any OpenAI API costs incurred
5. **Data Loss**: Back up important data; we are not liable for data loss

## Transparency Report

**Data Requests Received**: 0 (we have no data to share)  
**Data Provided**: 0 (we have no data to provide)  
**User Data Sold**: 0 (we will never sell data)

---

**Summary**: Your data stays on your device. We don't collect, store, or share anything. You're in control.

If you have any questions about this privacy policy, please open an issue on our GitHub repository.
