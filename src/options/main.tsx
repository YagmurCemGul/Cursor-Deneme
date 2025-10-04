import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadOptions, saveOptions } from '../lib/storage';

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
    await saveOptions({ apiKey, apiProvider: provider, language });
    alert('Saved');
  }

  return (
    <div className="container">
      <h2>Settings</h2>
      <div className="col" style={{ gap: 8 }}>
        <label className="col">
          <span className="label">API Provider</span>
          <select className="select" value={provider} onChange={(e) => setProvider(e.target.value as any)}>
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
          <select className="select" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
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
