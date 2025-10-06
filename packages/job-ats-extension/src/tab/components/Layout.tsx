import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, User, FileText, Briefcase, ListChecks, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg-secondary)' }}>
      {/* Sidebar */}
      <nav style={{
        width: '240px',
        background: 'var(--color-bg)',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
      }}>
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            🦉 Job ATS
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
            Assistant
          </p>
        </div>

        <NavItem to="/" icon={<Home size={18} />} label="Home" />
        <NavItem to="/profile" icon={<User size={18} />} label="Profile" />
        <NavItem to="/resume" icon={<FileText size={18} />} label="Resume" />
        <NavItem to="/jobs" icon={<Briefcase size={18} />} label="Jobs" />
        <NavItem to="/tracker" icon={<ListChecks size={18} />} label="Tracker" />
        
        <div style={{ marginTop: 'auto' }}>
          <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontSize: '0.9375rem',
        fontWeight: '500',
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
        transition: 'all 0.2s',
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
