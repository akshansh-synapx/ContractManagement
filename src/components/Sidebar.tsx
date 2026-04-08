import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const location = useLocation();
  const { currentUser } = useApp();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/requests', icon: FileText, label: 'All Requests' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Synapx</span>
            <span className="sidebar-logo-subtitle">Contract Manager</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>
          Categories
        </div>
        <div
          className={`sidebar-nav-item ${location.search.includes('type=contract') ? 'active' : ''}`}
          onClick={() => {}}
          style={{ cursor: 'default' }}
        >
          <FolderOpen />
          <span>Contracts</span>
        </div>
        <div
          className={`sidebar-nav-item ${location.search.includes('type=legal') ? 'active' : ''}`}
          onClick={() => {}}
          style={{ cursor: 'default' }}
        >
          <FolderOpen />
          <span>Legal Documents</span>
        </div>

        <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>
          Support
        </div>
        <div className="sidebar-nav-item">
          <Settings />
          <span>Settings</span>
        </div>
        <div className="sidebar-nav-item">
          <HelpCircle />
          <span>Help & Support</span>
        </div>
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{currentUser.initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{currentUser.name}</span>
            <span className="sidebar-user-role">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
