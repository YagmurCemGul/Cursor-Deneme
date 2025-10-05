import { Zap, Target, FileText, Settings, ExternalLink } from 'lucide-react';

export default function App() {
  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/tab/index.html') });
  }

  function handleAutofill() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'START_AUTOFILL' });
      }
    });
    window.close();
  }

  function handleScore() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'CALCULATE_SCORE' });
      }
    });
    window.close();
  }

  function handleCoverLetter() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GENERATE_COVER_LETTER' });
      }
    });
    window.close();
  }

  return (
    <div style={{ width: '320px', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🦉</div>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Job ATS Assistant</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
          Quick actions for current page
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={handleAutofill}
          style={{ justifyContent: 'flex-start' }}
        >
          <Zap size={16} />
          Auto-fill Form
          <code style={{
            marginLeft: 'auto',
            fontSize: '0.65rem',
            padding: '0.125rem 0.375rem',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-sm)',
          }}>
            Ctrl+Shift+A
          </code>
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleScore}
          style={{ justifyContent: 'flex-start' }}
        >
          <Target size={16} />
          ATS Score
          <code style={{
            marginLeft: 'auto',
            fontSize: '0.65rem',
            padding: '0.125rem 0.375rem',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-sm)',
          }}>
            Ctrl+Shift+M
          </code>
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleCoverLetter}
          style={{ justifyContent: 'flex-start' }}
        >
          <FileText size={16} />
          Cover Letter
        </button>
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => chrome.runtime.openOptionsPage()}
          style={{ fontSize: '0.8125rem' }}
        >
          <Settings size={14} />
          Settings
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={openDashboard}
          style={{ fontSize: '0.8125rem' }}
        >
          Dashboard
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
