/**
 * Keyboard Shortcuts Help Modal
 * Displays available keyboard shortcuts
 */

import React, { useState } from 'react';
import { keyboardShortcuts, KeyboardShortcut } from '../utils/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  language: 'en' | 'tr';
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = keyboardShortcuts.getShortcuts();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={language === 'en' ? 'Keyboard Shortcuts' : 'Klavye Kısayolları'}
      >
        ⌨️
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{ margin: 0 }}>
            ⌨️ {language === 'en' ? 'Keyboard Shortcuts' : 'Klavye Kısayolları'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {shortcuts.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            {language === 'en' 
              ? 'No keyboard shortcuts available' 
              : 'Mevcut klavye kısayolu yok'}
          </p>
        ) : (
          <div>
            {shortcuts.map((shortcut, index) => (
              <ShortcutRow key={index} shortcut={shortcut} />
            ))}
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '14px',
          color: '#666',
        }}>
          <p style={{ margin: 0 }}>
            {language === 'en' 
              ? 'Press ? to toggle this help dialog' 
              : 'Bu yardım penceresini açıp kapatmak için ? tuşuna basın'}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ShortcutRowProps {
  shortcut: KeyboardShortcut;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ shortcut }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <span style={{ color: '#374151' }}>{shortcut.description}</span>
      <kbd style={{
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        padding: '4px 8px',
        fontFamily: 'monospace',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#1f2937',
      }}>
        {keyboardShortcuts.formatShortcut(shortcut)}
      </kbd>
    </div>
  );
};
