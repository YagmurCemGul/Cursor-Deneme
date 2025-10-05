import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest(async () => ({
  manifest_version: 3,
  name: "AI CV & Cover Letter Optimizer",
  version: "0.1.0",
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
    "https://generativelanguage.googleapis.com/*",
    "https://api.anthropic.com/*",
    "http://localhost/*"
  ],
  web_accessible_resources: [
    {
      resources: [
        "src/styles/*",
        "src/assets/*",
        "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
      ],
      matches: ["<all_urls>"]
    }
  ]
}));
