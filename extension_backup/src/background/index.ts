chrome.runtime.onInstalled.addListener(() => {
  console.log("AI CV Optimizer installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true });
  }
});
