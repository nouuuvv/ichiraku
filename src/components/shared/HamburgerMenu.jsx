import React, { useEffect } from 'react';
import { USERS } from '../../data/mockData';
import { sound } from '../../services/audio';

export default function HamburgerMenu({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  onOpenCart,
  cartCount,
  settings,
  onResetDB
}) {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavClick = (anchorId) => {
    sound.click(600, 0.04);
    onClose();
    setTimeout(() => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleRoleClick = (role) => {
    sound.click(750, 0.06);
    onClose();
    onSelectRole(role);
  };

  const navItems = [
    {
      num: '01',
      en: 'The Grand Menu',
      jp: 'お品書き',
      desc: 'Small-batch ramen, handcrafted nigiri & donburi',
      target: 'menu-catalog'
    },
    {
      num: '02',
      en: 'Order Tracker',
      jp: '注文追跡',
      desc: 'Live kitchen ticket status & progress stepper',
      target: 'section-tracker'
    },
    {
      num: '03',
      en: 'Table Reservation',
      jp: '席の予約',
      desc: 'Book an intimate dining experience',
      target: 'section-reservation'
    },
    {
      num: '04',
      en: 'Culinary Philosophy',
      jp: '職人の想い',
      desc: 'Artisanal broth craft & Edo-period discipline',
      target: 'section-philosophy'
    }
  ];

  return (
    <div className="hamburger-modal-root" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop */}
      <div
        className="hamburger-backdrop"
        onClick={() => {
          sound.click(450, 0.04);
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside className="hamburger-drawer">
        {/* Subtle Background Watermark Kanji */}
        <div className="hamburger-bg-kanji" aria-hidden="true">一楽</div>

        {/* Drawer Header */}
        <div className="hamburger-drawer-header">
          <div className="hamburger-header-brand">
            <span className="brand-kanji-stamp">一楽</span>
            <div className="brand-text-col">
              <span className="brand-name-editorial">ichiraku<em>.</em></span>
              <span className="brand-sub-editorial">KYOTO & TOKYO CRAFT</span>
            </div>
          </div>

          <button
            className="hamburger-close-btn"
            onClick={() => {
              sound.click(450, 0.04);
              onClose();
            }}
            aria-label="Tutup menu"
          >
            <span className="close-text">CLOSE</span>
            <span className="close-cross">✕</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="hamburger-drawer-body">
          {/* Quick Cart Pill if items exist */}
          {currentRole === 'guest' && cartCount > 0 && (
            <div className="hamburger-cart-highlight">
              <div>
                <span className="cart-highlight-kicker">ACTIVE ORDER</span>
                <p className="cart-highlight-text">{cartCount} hidangan siap dipesan</p>
              </div>
              <button
                className="cart-highlight-btn"
                onClick={() => {
                  sound.click(700, 0.06);
                  onClose();
                  onOpenCart();
                }}
              >
                Lihat Pesanan →
              </button>
            </div>
          )}

          {/* Section 1: Editorial Navigation Links */}
          <div className="hamburger-nav-block">
            <span className="hamburger-block-eyebrow">NAVIGATION · ナビゲーション</span>
            <nav className="hamburger-nav-list">
              {navItems.map((item) => (
                <button
                  key={item.num}
                  className="hamburger-nav-link"
                  onClick={() => handleNavClick(item.target)}
                >
                  <span className="nav-link-num">{item.num}</span>
                  <div className="nav-link-title-wrap">
                    <span className="nav-link-en">{item.en}</span>
                    <span className="nav-link-jp">{item.jp}</span>
                    <span className="nav-link-desc">{item.desc}</span>
                  </div>
                  <span className="nav-link-arrow">→</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Section 2: Role Switcher Suite */}
          <div className="hamburger-roles-block">
            <div className="hamburger-block-header">
              <span className="hamburger-block-eyebrow">SYSTEM ROLES · 役割の切り替え</span>
              <span className="hamburger-roles-badge">3 ROLES ACTIVE</span>
            </div>

            <div className="hamburger-role-cards">
              {/* Guest Card */}
              <button
                className={`hamburger-role-card ${currentRole === 'guest' ? 'active' : ''}`}
                onClick={() => handleRoleClick('guest')}
              >
                <div className="role-card-top">
                  <span className="role-avatar-icon">👤</span>
                  <span className="role-title-text">Mode Tamu (Guest)</span>
                  {currentRole === 'guest' && <span className="role-active-dot">● Aktif</span>}
                </div>
                <p className="role-card-desc">
                  Katalog menu interaktif, keranjang pemesanan, self-order, dan live tracker.
                </p>
                <div className="role-card-footer">
                  <span className="role-free-tag">Akses Terbuka</span>
                </div>
              </button>

              {/* Cashier Card */}
              <button
                className={`hamburger-role-card ${currentRole === 'cashier' ? 'active' : ''}`}
                onClick={() => handleRoleClick('cashier')}
              >
                <div className="role-card-top">
                  <span className="role-avatar-icon">💳</span>
                  <span className="role-title-text">Kasir (POS Terminal)</span>
                  {currentRole === 'cashier' && <span className="role-active-dot">● Aktif</span>}
                </div>
                <p className="role-card-desc">
                  Terminal kasir cepat, denah meja, antrean kitchen kanban, dan laporan kasir.
                </p>
                <div className="role-card-footer">
                  <span className="role-pin-tag">PIN: 1111</span>
                  <span className="role-user-name">Aoi Tanaka</span>
                </div>
              </button>

              {/* Admin Card */}
              <button
                className={`hamburger-role-card ${currentRole === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleClick('admin')}
              >
                <div className="role-card-top">
                  <span className="role-avatar-icon">📊</span>
                  <span className="role-title-text">Admin (Manajer Resto)</span>
                  {currentRole === 'admin' && <span className="role-active-dot">● Aktif</span>}
                </div>
                <p className="role-card-desc">
                  Analitik omset hari ini, CRUD produk & stok, audit log pesanan, dan backup JSON.
                </p>
                <div className="role-card-footer">
                  <span className="role-pin-tag">PIN: 1234</span>
                  <span className="role-user-name">Kenji Sato</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Restaurant Information & Quick Actions */}
          <div className="hamburger-info-block">
            <span className="hamburger-block-eyebrow">RESTAURANT INFO · 店舗案内</span>
            <div className="hamburger-info-list">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <strong>{settings.storeName || 'Ichiraku Kitchen'}</strong>
                  <p>{settings.address || 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan'}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">🕒</span>
                <div>
                  <strong>Jam Operasional</strong>
                  <p>{settings.openingHours || 'Senin – Minggu: 11:00 – 22:00 WIB'}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">💬</span>
                <div>
                  <strong>WhatsApp Reservation & Delivery</strong>
                  <a
                    href={`https://wa.me/${settings.phone || '628123456789'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wa-link"
                  >
                    +{settings.phone || '62 812-3456-789'} (Chat Sekarang) ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Demo Reset Shortcut */}
            <div className="hamburger-tools-row">
              <button
                className="hamburger-tool-btn"
                onClick={() => {
                  if (window.confirm('Reset database LocalStorage ke data dummy awal?')) {
                    onResetDB();
                    onClose();
                  }
                }}
              >
                <span>🔄</span>
                <span>Reset Database Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="hamburger-drawer-footer">
          <span className="footer-kanji-sign">いただきます · ITADAKIMASU</span>
          <small>© 2026 Ichiraku Japanese Kitchen. All rights reserved.</small>
        </div>
      </aside>
    </div>
  );
}
