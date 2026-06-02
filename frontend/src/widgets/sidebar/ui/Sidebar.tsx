import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Rocket,
  LayoutDashboard,
  MapPin,
  Store,
  Settings,
  Package,
  Calculator,
  ArrowUpFromLine,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cities', icon: MapPin, label: 'Города и контуры' },
  { path: '/stores', icon: Store, label: 'Торговые точки' },
  { path: '/settings', icon: Settings, label: 'Настройки' },
  { path: '/products', icon: Package, label: 'Товары' },
  { path: '/calculator', icon: Calculator, label: 'Калькулятор' },
  { path: '/lifting', icon: ArrowUpFromLine, label: 'Подъём' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon"><Rocket size={24} color="var(--blue)" /></span>
        <span className="sidebar__logo-text">Domingo</span>
        <span className="sidebar__logo-sub">Delivery</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`sidebar__link ${
              location.pathname === item.path ? 'sidebar__link--active' : ''
            }`}
          >
            <span className="sidebar__link-icon"><item.icon size={18} /></span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__version">v2.0.0 — Калькулятор</div>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--line);
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          background: var(--bg-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .sidebar__logo {
          height: var(--header-height);
          padding: 0 var(--space-lg);
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--line);
          flex-shrink: 0;
        }

        .sidebar__logo-icon {
          font-size: 1.5rem;
        }

        .sidebar__logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text), var(--blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .sidebar__logo-sub {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding: 2px 6px;
          border: 1px solid var(--line);
          border-radius: 4px;
          margin-left: -4px;
        }

        .sidebar__nav {
          flex: 1;
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar__link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          position: relative;
        }

        .sidebar__link:hover {
          background: var(--surface);
          color: var(--text);
        }

        .sidebar__link--active {
          background: var(--blue-soft);
          color: var(--cyan);
        }

        .sidebar__link--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--cyan);
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 8px var(--cyan);
        }

        .sidebar__link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
        }

        .sidebar__footer {
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--line);
        }

        .sidebar__version {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }
      `}</style>
    </aside>
  );
};
