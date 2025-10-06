import React, { useState, useEffect } from "react";
import type { AppSettings, AIProvider } from "../lib/storage/schema";
import { AIRouter } from "../lib/ai/router";
import { getTokenInfo, disconnect } from "../background/google/auth";

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await chrome.storage.local.get(["settings"]);
    setSettings(result.settings || getDefaultSettings());
    setLoading(false);
  };

  const getDefaultSettings = (): AppSettings => ({
    version: 2,
    ai: {
      provider: "openai",
      temperature: 0.7,
      apiKeys: {},
      fallbackChain: ["openai", "gemini", "anthropic"],
      timeout: 30000,
      maxRetries: 3,
    },
    google: {
      connected: false,
    },
    ui: {
      highlightOptimized: true,
      locale: "en",
      theme: "auto",
    },
  });

  const saveSettings = async () => {
    if (!settings) return;
    await chrome.storage.local.set({ settings });
    alert("Settings saved!");
  };

  const handleTestConnection = async () => {
    if (!settings) return;
    setTestResult("Testing...");

    try {
      const router = new AIRouter({
        provider: settings.ai.provider,
        model: settings.ai.model,
        temperature: settings.ai.temperature,
        apiKeys: settings.ai.apiKeys,
      });

      const success = await router.testConnection();
      setTestResult(success ? "✅ Connection successful!" : "❌ Connection failed");
    } catch (error) {
      setTestResult(`❌ Error: ${(error as Error).message}`);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const token = await chrome.identity.getAuthToken({ interactive: true });
      if (token) {
        const tokenInfo = await getTokenInfo();
        if (tokenInfo) {
          setSettings({
            ...settings!,
            google: {
              connected: true,
              tokenMetadata: {
                expiresAt: tokenInfo.expiresAt,
                scopes: tokenInfo.scopes,
              },
            },
          });
        }
      }
    } catch (error) {
      alert(`Failed to connect: ${(error as Error).message}`);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await disconnect();
      setSettings({
        ...settings!,
        google: {
          connected: false,
        },
      });
    } catch (error) {
      alert(`Failed to disconnect: ${(error as Error).message}`);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>Settings</h1>

      {/* AI Settings */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ borderBottom: "2px solid #3b82f6", paddingBottom: "10px" }}>AI Settings</h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Provider</label>
          <select
            value={settings.ai.provider}
            onChange={(e) =>
              setSettings({
                ...settings,
                ai: { ...settings.ai, provider: e.target.value as AIProvider },
              })
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="azure">Azure OpenAI</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Model (optional)</label>
          <input
            type="text"
            value={settings.ai.model || ""}
            onChange={(e) =>
              setSettings({ ...settings, ai: { ...settings.ai, model: e.target.value } })
            }
            placeholder="e.g., gpt-4, gemini-pro, claude-3-5-sonnet-20241022"
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
            Temperature: {settings.ai.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.ai.temperature}
            onChange={(e) =>
              setSettings({
                ...settings,
                ai: { ...settings.ai, temperature: parseFloat(e.target.value) },
              })
            }
            style={{ width: "100%" }}
          />
        </div>

        {["openai", "gemini", "anthropic", "azure"].map((provider) => (
          <div key={provider} style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key
              {provider === "azure" && " (format: key|endpoint|deployment)"}
            </label>
            <input
              type="password"
              value={settings.ai.apiKeys[provider as AIProvider] || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai: {
                    ...settings.ai,
                    apiKeys: { ...settings.ai.apiKeys, [provider]: e.target.value },
                  },
                })
              }
              placeholder={`Enter ${provider} API key`}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
        ))}

        <button
          onClick={handleTestConnection}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Test Connection
        </button>

        {testResult && (
          <span style={{ marginLeft: "10px", fontWeight: 500 }}>{testResult}</span>
        )}
      </section>

      {/* Google Integration */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ borderBottom: "2px solid #22c55e", paddingBottom: "10px" }}>Google Integration</h2>

        <p>
          Connect to Google to export your CV & Cover Letter to Docs, track applications in Sheets, create
          portfolio presentations in Slides, upload files to Drive, and create Gmail drafts.
        </p>

        <div style={{ marginTop: "20px" }}>
          {settings.google.connected ? (
            <>
              <div style={{ color: "#22c55e", fontWeight: 600, marginBottom: "10px" }}>✅ Connected</div>
              <button
                onClick={handleGoogleDisconnect}
                style={{
                  padding: "10px 20px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleConnect}
              style={{
                padding: "10px 20px",
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Connect to Google
            </button>
          )}
        </div>
      </section>

      {/* UI Settings */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ borderBottom: "2px solid #8b5cf6", paddingBottom: "10px" }}>UI Settings</h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={settings.ui.highlightOptimized}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ui: { ...settings.ui, highlightOptimized: e.target.checked },
                })
              }
            />
            <span>Enable optimization highlights in CV preview</span>
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Language</label>
          <select
            value={settings.ui.locale}
            onChange={(e) =>
              setSettings({
                ...settings,
                ui: { ...settings.ui, locale: e.target.value as "en" | "tr" },
              })
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Theme</label>
          <select
            value={settings.ui.theme}
            onChange={(e) =>
              setSettings({
                ...settings,
                ui: { ...settings.ui, theme: e.target.value as "light" | "dark" | "auto" },
              })
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        style={{
          padding: "12px 30px",
          background: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Save Settings
      </button>
    </div>
  );
}
