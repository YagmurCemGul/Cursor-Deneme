/**
 * Theme Selector Component
 */

import React from 'react';
import { getThemeManager } from '../utils/themeManager';

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = React.useState(getThemeManager().getCurrentTheme());
  const themes = getThemeManager().getAllThemes();

  React.useEffect(() => {
    return getThemeManager().subscribe((theme) => {
      setCurrentTheme(theme);
    });
  }, []);

  return (
    <select
      value={currentTheme}
      onChange={(e) => getThemeManager().setTheme(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-background)',
        color: 'var(--color-text-primary)'
      }}
    >
      {themes.map(theme => (
        <option key={theme.name} value={theme.name}>
          {theme.label}
        </option>
      ))}
    </select>
  );
}
