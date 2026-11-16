import React from 'react';
import { USERS } from '../../data/mockData';

export default function RoleBar({ currentRole, onSelectRole }) {
  const activeUser = USERS[currentRole] || USERS.guest;

  return (
    <header className="persistent-role-bar">
      <div className="container-wide role-bar-container">
        {/* Brand Stamp */}
        <div className="role-bar-brand">
          <span className="role-bar-kanji">一楽</span>
          <strong>ICHIRAKU SUITE</strong>
          <span className="role-bar-divider">|</span>
          <span className="role-bar-label">Mode:</span>
        </div>

        {/* 3 Role Switcher Buttons */}
        <nav className="role-bar-switcher" aria-label="Role Switcher">
          <button
            className={`role-switcher-btn ${currentRole === 'guest' ? 'active' : ''}`}
            onClick={() => onSelectRole('guest')}
          >
            <span>👤 Tamu (Guest)</span>
            <span className="role-chip">Katalog & Order</span>
          </button>
          <button
            className={`role-switcher-btn ${currentRole === 'cashier' ? 'active' : ''}`}
            onClick={() => onSelectRole('cashier')}
          >
            <span>💳 Kasir (POS)</span>
            <span className="role-chip">Kasir & Antrean</span>
          </button>
          <button
            className={`role-switcher-btn ${currentRole === 'admin' ? 'active' : ''}`}
            onClick={() => onSelectRole('admin')}
          >
            <span>📊 Admin (Manajer)</span>
            <span className="role-chip">Analitik & CRUD</span>
          </button>
        </nav>

        {/* Active Profile Info */}
        <div className="role-bar-profile">
          <span className="profile-status-dot"></span>
          <span className="profile-avatar">{activeUser.avatar}</span>
          <span className="profile-name">{activeUser.name}</span>
          <span className="profile-badge">({activeUser.badge})</span>
        </div>
      </div>
    </header>
  );
}
