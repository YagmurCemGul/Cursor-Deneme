import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadOptions, saveOptions } from '../lib/storage';
import { toastService } from '../lib/toastService';

function Options() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'azure'>('openai');
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    (async () => {
      const opts = await loadOptions();
      if (opts?.apiKey) setApiKey(opts.apiKey);
      if (opts?.apiProvider) setProvider(opts.apiProvider);
      if (opts?.language) setLanguage(opts.language);
    })();
  }, []);

  async function save() {
    try {
      await saveOptions({ apiKey, apiProvider: provider, language });
      toastService.success('Settings saved successfully!');
    } catch (error) {
      toastService.error('Failed to save settings. Please try again.');
    }
  }

  return (
    <div className="container">
      <h2>Settings</h2>
      <div className="col" style={{ gap: 8 }}>
        <label className="col">
          <span className="label">API Provider</span>
          <select className="select" value={provider} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProvider(e.target.value as 'openai' | 'azure')}>
            <option value="openai">OpenAI</option>
            <option value="azure">Azure OpenAI</option>
          </select>
        </label>
        <label className="col">
          <span className="label">API Key</span>
          <input className="text-input" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </label>
        <label className="col">
          <span className="label">Language</span>
          <select className="select" value={language} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as 'tr' | 'en')}>
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </label>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
