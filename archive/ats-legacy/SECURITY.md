# Security Policy

**Extension**: Job Autofill & ATS Assistant  
**Version**: 1.0.0  
**Last Updated**: October 5, 2025

---

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this extension, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email: [security@yourproject.com] or use GitHub Security Advisories
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 48 hours and provide a fix within 7 days for critical vulnerabilities.

---

## Threat Model

### Assets

1. **User Profile Data**: Personal information, resume, work history
2. **API Keys**: OpenAI API key stored locally
3. **Job Application Data**: Tracked applications, job descriptions
4. **Encrypted Data**: User profile encrypted with user password (optional)

### Threats

| Threat | Severity | Mitigation |
|--------|----------|------------|
| **Malicious website accessing user data** | High | Data stored in Chrome's protected storage, isolated from web pages |
| **API key theft via XSS** | High | CSP enforced, no inline scripts, API key only in background worker |
| **Data exfiltration via compromised extension** | Critical | Open source for auditing, domain allowlist, no telemetry |
| **Man-in-the-middle attacks** | Medium | HTTPS required for OpenAI API, TLS verification |
| **Data loss from browser crash** | Low | Data persisted to disk, IndexedDB auto-recovery |
| **Unauthorized form submission** | Medium | No auto-submit, user must review all data |
| **Malicious file uploads** | High | File inputs cannot be programmatically filled (browser security) |
| **Cross-extension data access** | Medium | Chrome storage is extension-isolated |
| **Social engineering (phishing for API key)** | High | User education, warnings in UI |

---

## Attack Surface

### 1. Content Scripts

**Exposed to**: Web pages on allowed domains

**Attack Vectors**:
- DOM manipulation by malicious page scripts
- Fake form fields to trick autofill
- JavaScript injection attempts

**Mitigations**:
- Content scripts run in isolated world
- No sensitive data in content script scope
- Kill switch to disable all content scripts
- Domain allowlist (only 24 specific domains)
- Adapter-specific detection logic

### 2. Background Service Worker

**Exposed to**: Extension pages and content scripts only

**Attack Vectors**:
- Message spoofing from malicious content scripts
- API key theft from storage
- Unauthorized API calls

**Mitigations**:
- Message sender origin verification (extension only)
- API key never exposed to content scripts
- Request queue with rate limiting
- AbortController for request cancellation

### 3. Dashboard/Options/Popup

**Exposed to**: User interaction only

**Attack Vectors**:
- XSS via user-generated content
- CSRF if API endpoints existed (N/A)
- DOM-based XSS

**Mitigations**:
- CSP: `script-src 'self'; object-src 'self'`
- React auto-escapes user input
- No dangerous innerHTML usage
- No external scripts loaded

### 4. Storage

**Exposed to**: Extension only (Chrome API isolation)

**Attack Vectors**:
- Data theft if storage is compromised
- Plaintext storage of sensitive data

**Mitigations**:
- Chrome storage is extension-isolated
- Optional AES-256-GCM encryption
- API key stored with user awareness
- Data wipe functionality

### 5. Network

**Exposed to**: OpenAI API only

**Attack Vectors**:
- API key interception (HTTPS MITM)
- Data exfiltration via API calls
- Rate limit DoS

**Mitigations**:
- HTTPS enforced for API calls
- TLS certificate validation
- Request queue with concurrency limits
- Exponential backoff for rate limits
- User controls API usage (manual triggers)

---

## Data Flows

### Autofill Flow
```
User Profile (Storage)
  → Content Script (isolated world)
  → DOM manipulation (setValue + events)
  → User reviews
  → User submits form
```

**Security**: No automatic submission, user reviews all data.

### ATS Scoring Flow
```
Job Description (extracted from page)
  → Content Script sends to Background
  → Background + Profile → Calculate score
  → Return to Content Script
  → Display to user
```

**Security**: No external API calls for basic scoring (local TF-IDF).

### Cover Letter Generation Flow
```
User clicks "Generate"
  → Content Script extracts JD
  → Background Worker enqueues request
  → OpenAI API call (HTTPS)
  ← Stream response chunks
  → Display to user (editable)
```

**Security**: API key in background only, requests queued, user can abort.

### Data Persistence Flow
```
User enters data
  → React state
  → chrome.storage.local.set()
  OR
  → IndexedDB (via idb library)
  
(Optional encryption):
  → Encrypt with user password (AES-256-GCM)
  → Store encrypted blob
```

**Security**: Encryption optional, password never stored, PBKDF2 key derivation.

---

## Security Features

### Implemented

1. **Content Security Policy (CSP)**
   ```json
   {
     "extension_pages": "script-src 'self'; object-src 'self'"
   }
   ```

2. **Domain Allowlist**
   - 24 specific domains (vs. `<all_urls>`)
   - User can add custom domains
   - Adapters can be disabled per-platform

3. **Kill Switch**
   - Global toggle to disable all content scripts
   - Useful if conflicts occur

4. **Optional Encryption**
   - AES-256-GCM for profile data
   - PBKDF2 key derivation (100,000 iterations)
   - User-provided password

5. **Message Authentication**
   - Background verifies `sender.origin` is extension
   - Prevents spoofed messages from web pages

6. **Request Queue**
   - Concurrency limit (1 per tab)
   - Exponential backoff for rate limits
   - Cancellation on tab close

7. **No Auto-Submit**
   - Forms never automatically submitted
   - User must review and submit manually

8. **File Upload Protection**
   - Cannot programmatically set file inputs (browser security)
   - User must manually select files

9. **Debug Logging**
   - Stripped in production builds (tree-shaking)
   - Opt-in debug mode in settings

10. **Data Isolation**
    - Chrome storage is extension-only
    - IndexedDB isolated by origin
    - No cross-extension access

---

## Secure Coding Practices

### Applied

✅ **Input Validation**: All user inputs sanitized and validated  
✅ **Output Encoding**: React auto-escapes, no `dangerouslySetInnerHTML`  
✅ **Type Safety**: TypeScript strict mode  
✅ **Error Handling**: Try-catch blocks, graceful degradation  
✅ **Least Privilege**: Minimal permissions, domain allowlist  
✅ **Defense in Depth**: Multiple layers (CSP, isolation, encryption)  
✅ **Fail Secure**: Errors disable features, don't expose data  
✅ **Audit Logging**: Optional debug logs for troubleshooting  

### Not Applied (Intentionally)

❌ **Backend Validation**: No backend (local-only architecture)  
❌ **Rate Limiting**: Handled by OpenAI, not us  
❌ **Session Management**: No sessions (stateless)  

---

## Known Vulnerabilities

### None Currently Known

As of October 5, 2025, no security vulnerabilities are known.

Last security audit: October 5, 2025  
Next audit: Quarterly or on major updates

---

## Security Checklist for Developers

When contributing code:

- [ ] No `eval()`, `Function()`, or `innerHTML` with user data
- [ ] All external data sanitized
- [ ] CSP compliance verified
- [ ] No secrets in code (API keys, passwords)
- [ ] Message sender origin verified in background
- [ ] User confirmation for destructive actions
- [ ] Error messages don't leak sensitive info
- [ ] TypeScript types prevent common bugs
- [ ] Tests cover security-critical paths

---

## Compliance

### Standards

This extension follows:

- ✅ **OWASP Top 10** (Web Application Security)
- ✅ **CWE Top 25** (Common Weakness Enumeration)
- ✅ **GDPR** (Privacy by Design)
- ✅ **Chrome Extension Security Best Practices**

### Privacy Regulations

- ✅ **GDPR** (General Data Protection Regulation)
- ✅ **CCPA** (California Consumer Privacy Act)
- ✅ Local data storage, no server transmission
- ✅ User rights (access, export, delete)

---

## Incident Response

### In Case of Security Breach

1. **Identify**: Scope and impact assessment
2. **Contain**: Disable affected features via kill switch
3. **Eradicate**: Fix vulnerability in code
4. **Recover**: Deploy patch via Chrome Web Store
5. **Lessons Learned**: Update threat model

### User Notification

If a breach affects user data:
- Notify via extension update notes
- Provide mitigation steps
- Offer data export before patch
- Document in CHANGELOG.md

---

## Secure Defaults

The extension ships with secure defaults:

- ✅ Encryption: OFF (user must enable)
- ✅ Debug logs: OFF
- ✅ Telemetry: OFF (doesn't exist)
- ✅ Auto-submit: OFF (doesn't exist)
- ✅ Auto-open panel: OFF
- ✅ All adapters: ON (user can disable)

---

## Third-Party Dependencies

### Security Scanning

Dependencies are scanned via:
- `pnpm audit` (npm audit for known vulnerabilities)
- Dependabot (GitHub automated updates)
- Manual review for major updates

### Trusted Dependencies

- ✅ `react`, `react-dom` - Trusted (Facebook/Meta)
- ✅ `idb` - Trusted (Jake Archibald/Google)
- ✅ `lucide-react` - Trusted (Icon library)
- ✅ `zod` - Trusted (Validation library)
- ✅ `vite`, `@crxjs/vite-plugin` - Trusted (Build tools)

### Audit Schedule

- **Weekly**: Automated `pnpm audit`
- **Monthly**: Manual dependency review
- **Quarterly**: Full security audit
- **On Updates**: Review changelogs for security notes

---

## Cryptography

### Encryption Details

**Algorithm**: AES-256-GCM (Authenticated Encryption)  
**Key Derivation**: PBKDF2 with SHA-256  
**Iterations**: 100,000  
**Salt**: 16 bytes (randomly generated per encryption)  
**IV**: 12 bytes (randomly generated per encryption)  

**Implementation**: Web Crypto API (browser native, audited)

### Randomness

**Source**: `crypto.getRandomValues()` (CSPRNG)  
**Uses**:
- Salt generation
- IV generation
- UUID generation (`crypto.randomUUID()`)

---

## Future Security Enhancements

### Planned (Not in 1.0.0)

1. **OAuth 2.0 for API keys**: Chrome Identity API integration
2. **Subresource Integrity (SRI)**: For CDN resources (none currently)
3. **Permissions API**: Request permissions only when needed
4. **Web Authentication (WebAuthn)**: For password-less encryption unlock
5. **Automated Penetration Testing**: Scheduled scans
6. **Bug Bounty Program**: Community-driven security

---

## Secure Development Lifecycle

1. **Design**: Threat modeling, security requirements
2. **Development**: Secure coding, code review, linting
3. **Testing**: Unit tests, security tests, fuzzing
4. **Deployment**: Signed releases, secure distribution
5. **Maintenance**: Monitoring, patching, audits

---

## References

- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Extension Security](https://owasp.org/www-community/vulnerabilities/)
- [Web Crypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)

---

**Security is a continuous process. This document is living and will be updated as threats evolve.**

If you have security concerns or questions, please open a security advisory on GitHub or contact us via email.
