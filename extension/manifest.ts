const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "AI CV & Cover Letter Optimizer",
  version: "1.0.0",
  description: "AI-powered CV and Cover Letter optimization with ATS compatibility",
  action: {
    default_title: "AI CV Optimizer",
    default_popup: "src/popup/index.html"
  },
  options_page: "src/options/index.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  permissions: [
    "storage",
    "activeTab",
    "downloads",
    "scripting"
  ],
  host_permissions: [
    "https://api.openai.com/*",
    "https://*.openai.azure.com/*",
    "https://cdn.jsdelivr.net/*",
    "http://localhost:3000/*"
  ],
  web_accessible_resources: [
    {
      resources: [
        "src/styles/*",
        "src/assets/*"
      ],
      matches: ["<all_urls>"]
    }
  ],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'"
  }
};

export default manifest;
