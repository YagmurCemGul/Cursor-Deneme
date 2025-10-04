const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "AI CV & Cover Letter Optimizer",
  version: "1.0.0",
  description: "Upload a CV, paste a job description, generate ATS-optimized resume and cover letter. Download as PDF/DOCX or export.",
  action: {
    default_title: "AI CV Optimizer",
    default_popup: "src/popup/index.html"
  },
  options_page: "src/options/index.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  permissions: ["storage", "activeTab", "scripting", "downloads"],
  host_permissions: [
    "https://api.openai.com/*",
    "https://*.openai.azure.com/*",
    "https://api.anthropic.com/*",
    "https://generativelanguage.googleapis.com/*",
    "http://localhost/*"
  ],
  web_accessible_resources: [
    {
      resources: [
        "src/styles/*",
        "src/assets/*",
        "pdf.worker.min.mjs",
        "pdf.worker.min.js"
      ],
      matches: ["<all_urls>"]
    }
  ],
  icons: {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
};

export default manifest;