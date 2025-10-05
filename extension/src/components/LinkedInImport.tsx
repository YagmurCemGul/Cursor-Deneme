import React, { useState } from 'react';
import { Button } from './ui';
import { parseLinkedInFromText, parseLinkedInJSON, LinkedInProfile } from '../lib/linkedinImport';

interface LinkedInImportProps {
  onImport: (profile: Partial<LinkedInProfile>) => void;
  onClose: () => void;
}

export function LinkedInImport({ onImport, onClose }: LinkedInImportProps) {
  const [importMethod, setImportMethod] = useState<'text' | 'json' | 'scrape'>('text');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  async function handleTextImport() {
    if (!textInput.trim()) {
      setError('Please paste your LinkedIn profile text');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const profile = parseLinkedInFromText(textInput);
      
      if (!profile.firstName && !profile.skills?.length) {
        setError('Could not extract profile data. Please check the format.');
        return;
      }

      onImport(profile);
      onClose();
    } catch (err) {
      setError('Error parsing profile data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleFileImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const text = await file.text();
      let profile: Partial<LinkedInProfile>;

      if (file.name.endsWith('.json')) {
        profile = parseLinkedInJSON(text);
      } else {
        profile = parseLinkedInFromText(text);
      }

      if (!profile.firstName && !profile.skills?.length) {
        setError('Could not extract profile data from file.');
        return;
      }

      onImport(profile);
      onClose();
    } catch (err) {
      setError('Error reading file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleScrapeFromLinkedIn() {
    setIsProcessing(true);
    setError('');

    try {
      // Query active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url?.includes('linkedin.com/in/')) {
        setError('Please navigate to a LinkedIn profile page first.');
        setIsProcessing(false);
        return;
      }

      // Execute content script
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          // This function runs in the context of the LinkedIn page
          const profile: any = {
            skills: [],
            experience: [],
            education: [],
          };

          try {
            // Name
            const nameElement = document.querySelector('h1.text-heading-xlarge');
            if (nameElement) {
              const fullName = nameElement.textContent?.trim() || '';
              const nameParts = fullName.split(' ');
              profile.firstName = nameParts[0];
              profile.lastName = nameParts.slice(1).join(' ');
            }

            // Headline
            const headlineElement = document.querySelector('.text-body-medium.break-words');
            if (headlineElement) {
              profile.headline = headlineElement.textContent?.trim();
            }

            // Location
            const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words');
            if (locationElement) {
              profile.location = locationElement.textContent?.trim();
            }

            // Skills (first 20)
            const skillElements = document.querySelectorAll('.pvs-list__paged-list-item .mr1.hoverable-link-text span[aria-hidden="true"]');
            profile.skills = Array.from(skillElements)
              .slice(0, 20)
              .map(el => el.textContent?.trim() || '')
              .filter(s => s.length > 0 && s.length < 50);

          } catch (error) {
            console.error('Scraping error:', error);
          }

          return profile;
        },
      });

      const profile = results[0]?.result;
      
      if (!profile || (!profile.firstName && !profile.skills?.length)) {
        setError('Could not extract profile data. Make sure you are on a LinkedIn profile page.');
        return;
      }

      onImport(profile);
      onClose();
    } catch (err) {
      console.error('Scrape error:', err);
      setError('Error accessing LinkedIn page. Please make sure you have the page open.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>
              💼 Import from LinkedIn
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Choose how you want to import your profile
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 8,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {/* Import Method Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              onClick={() => setImportMethod('text')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: importMethod === 'text' ? '#667eea' : 'white',
                color: importMethod === 'text' ? 'white' : '#64748b',
                border: `1px solid ${importMethod === 'text' ? '#667eea' : '#cbd5e1'}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              📝 Paste Text
            </button>
            <button
              onClick={() => setImportMethod('json')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: importMethod === 'json' ? '#667eea' : 'white',
                color: importMethod === 'json' ? 'white' : '#64748b',
                border: `1px solid ${importMethod === 'json' ? '#667eea' : '#cbd5e1'}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              📄 Upload File
            </button>
            <button
              onClick={() => setImportMethod('scrape')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: importMethod === 'scrape' ? '#667eea' : 'white',
                color: importMethod === 'scrape' ? 'white' : '#64748b',
                border: `1px solid ${importMethod === 'scrape' ? '#667eea' : '#cbd5e1'}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              🔗 From Page
            </button>
          </div>

          {/* Text Import */}
          {importMethod === 'text' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', display: 'block', marginBottom: 8 }}>
                  Paste your LinkedIn profile text
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Copy and paste your LinkedIn profile information here...

Example:
John Doe
Software Engineer at Google
San Francisco, CA

Skills: React, TypeScript, Python, etc."
                  style={{
                    width: '100%',
                    minHeight: 200,
                    padding: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
              
              <div style={{
                background: '#f0f9ff',
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #bfdbfe',
              }}>
                <div style={{ fontSize: 13, color: '#1e40af', marginBottom: 8, fontWeight: 600 }}>
                  💡 How to copy from LinkedIn:
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#1e40af' }}>
                  <li>Go to your LinkedIn profile</li>
                  <li>Select and copy text from your profile sections</li>
                  <li>Paste here and click Import</li>
                </ol>
              </div>

              <Button
                variant="primary"
                onClick={handleTextImport}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? '⏳ Processing...' : '✅ Import Profile'}
              </Button>
            </div>
          )}

          {/* File Import */}
          {importMethod === 'json' && (
            <div>
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <div style={{ fontSize: 14, color: '#1e293b', marginBottom: 8, fontWeight: 500 }}>
                  Upload LinkedIn export file
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                  JSON or TXT file
                </div>
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="secondary"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    as="span"
                  >
                    Choose File
                  </Button>
                </label>
              </div>

              <div style={{
                background: '#f0f9ff',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #bfdbfe',
              }}>
                <div style={{ fontSize: 13, color: '#1e40af', marginBottom: 8, fontWeight: 600 }}>
                  💡 How to export from LinkedIn:
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#1e40af' }}>
                  <li>Go to LinkedIn Settings & Privacy</li>
                  <li>Click "Get a copy of your data"</li>
                  <li>Download and extract the file</li>
                  <li>Upload Profile.json here</li>
                </ol>
              </div>
            </div>
          )}

          {/* Scrape from Page */}
          {importMethod === 'scrape' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: 32,
                borderRadius: 12,
                textAlign: 'center',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
                <div style={{ fontSize: 16, marginBottom: 8, fontWeight: 600 }}>
                  Import directly from LinkedIn page
                </div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  Make sure you have a LinkedIn profile open in your current tab
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #fbbf24',
              }}>
                <div style={{ fontSize: 13, color: '#92400e', marginBottom: 8, fontWeight: 600 }}>
                  ⚠️ Before importing:
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#92400e' }}>
                  <li>Open your LinkedIn profile in a new tab</li>
                  <li>Make sure you're logged in</li>
                  <li>Scroll down to load all sections</li>
                  <li>Come back here and click Import</li>
                </ol>
              </div>

              <Button
                variant="primary"
                onClick={async () => {
                  setIsProcessing(true);
                  setError('');

                  try {
                    // Query active tab
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    
                    if (!tab.url?.includes('linkedin.com/in/')) {
                      setError('Please navigate to a LinkedIn profile page first.');
                      setIsProcessing(false);
                      return;
                    }

                    // Execute content script
                    const results = await chrome.scripting.executeScript({
                      target: { tabId: tab.id! },
                      func: () => {
                        // This function runs in the context of the LinkedIn page
                        const profile: any = {
                          skills: [],
                          experience: [],
                          education: [],
                        };

                        try {
                          // Name
                          const nameElement = document.querySelector('h1.text-heading-xlarge');
                          if (nameElement) {
                            const fullName = nameElement.textContent?.trim() || '';
                            const nameParts = fullName.split(' ');
                            profile.firstName = nameParts[0];
                            profile.lastName = nameParts.slice(1).join(' ');
                          }

                          // Headline
                          const headlineElement = document.querySelector('.text-body-medium.break-words');
                          if (headlineElement) {
                            profile.headline = headlineElement.textContent?.trim();
                          }

                          // Location
                          const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words');
                          if (locationElement) {
                            profile.location = locationElement.textContent?.trim();
                          }

                          // Skills (first 20)
                          const skillElements = document.querySelectorAll('.pvs-list__paged-list-item .mr1.hoverable-link-text span[aria-hidden="true"]');
                          profile.skills = Array.from(skillElements)
                            .slice(0, 20)
                            .map(el => el.textContent?.trim() || '')
                            .filter(s => s.length > 0 && s.length < 50);

                        } catch (error) {
                          console.error('Scraping error:', error);
                        }

                        return profile;
                      },
                    });

                    const profile = results[0]?.result;
                    
                    if (!profile || (!profile.firstName && !profile.skills?.length)) {
                      setError('Could not extract profile data. Make sure you are on a LinkedIn profile page.');
                      return;
                    }

                    onImport(profile);
                    onClose();
                  } catch (err) {
                    console.error('Scrape error:', err);
                    setError('Error accessing LinkedIn page. Please make sure you have the page open.');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? '⏳ Importing...' : '🔗 Import from Current Tab'}
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              color: '#dc2626',
              fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
