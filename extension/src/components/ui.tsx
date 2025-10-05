import React from 'react';

export function TabButton({ 
  id, 
  active, 
  setActive, 
  children 
}: { 
  id: string; 
  active: string; 
  setActive: (id: string) => void; 
  children: React.ReactNode 
}) {
  return (
    <button 
      className={"tab" + (active === id ? " active" : "")} 
      onClick={() => setActive(id)}
    >
      {children}
    </button>
  );
}

export function TextRow({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string 
}) {
  return (
    <label className="col" style={{ minWidth: 220, flex: 1 }}>
      <span className="label">{label}</span>
      <input 
        className="text-input" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
      />
    </label>
  );
}

export function SectionHeader({ 
  title, 
  actions 
}: { 
  title: string; 
  actions?: React.ReactNode 
}) {
  return (
    <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <h3 style={{ margin: '12px 0 6px' }}>{title}</h3>
      <div className="row">{actions}</div>
    </div>
  );
}

export function Pill({ 
  text, 
  onRemove 
}: { 
  text: string; 
  onRemove?: () => void 
}) {
  return (
    <span className="pill">
      {text}
      <span className="close" onClick={onRemove}>×</span>
    </span>
  );
}

export function Button({ 
  variant = 'primary',
  onClick, 
  children,
  disabled = false
}: { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const className = variant === 'primary' ? 'btn' 
    : variant === 'secondary' ? 'btn secondary'
    : variant === 'ghost' ? 'btn ghost'
    : 'btn danger';
  
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
