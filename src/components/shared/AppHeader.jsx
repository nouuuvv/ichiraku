import React, { useState, useEffect } from 'react';
import { USERS } from '../../data/mockData';
import { sound } from '../../services/audio';

export default function AppHeader({
  currentRole,
  onSelectRole,
  cartCount,
  onOpenCart,
  onToggleMenu,
  isMenuOpen
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const activeUser = USERS[currentRole] || USERS.guest;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`app-unified-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-wide app-header-inner">
        {/* Brand Identity */}
        <div
          className="app-header-brand"
          onClick={() => {
            if (currentRole === 'guest') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          role="button"
          tabIndex={0}
        >
          <span className="brand-stamp-square">一楽</span>
          <div className="brand-titles">
            <span className="brand-logo-name">ichiraku<em>.</em></span>
            <span className="brand-logo-tagline">TOKYO CRAFT · EST. 2021</span>
          </div>
        </div>

        {/* Right Actions Cluster */}
        <div className="app-header-right">
          {/* Active Role Quick Pill (Click to open menu with roles) */}
          <button
            className={`header-role-pill role-${currentRole}`}
            onClick={() => {
              sound.click(600, 0.05);
              onToggleMenu();
            }}
            title="Klik untuk beralih peran (Tamu / Kasir / Admin)"
            aria-label={`Mode aktif: ${activeUser.badge}. Buka menu role.`}
          >
            <span className="role-pill-indicator">●</span>
            <span className="role-pill-icon">{activeUser.avatar}</span>
            <span className="role-pill-name">{activeUser.badge}</span>
            <span className="role-pill-caret">▾</span>
          </button>

          {/* Cart / Order Trigger (Only visible for Guest) */}
          {currentRole === 'guest' && (
            <button
              className={`header-cart-trigger ${cartCount > 0 ? 'has-items' : ''}`}
              onClick={() => {
                sound.click(700, 0.05);
                onOpenCart();
              }}
              aria-label={`Buka Keranjang Pesanan, ${cartCount} item`}
            >
              <span className="cart-trigger-icon">🍱</span>
              <span className="cart-trigger-label">Pesanan</span>
              <span className="cart-trigger-count">{cartCount}</span>
            </button>
          )}

          {/* Luxury Editorial Hamburger Trigger */}
          <button
            className={`header-hamburger-trigger ${isMenuOpen ? 'is-active' : ''}`}
            onClick={() => {
              sound.click(isMenuOpen ? 450 : 650, 0.05);
              onToggleMenu();
            }}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
          >
            <span className="hamburger-text-label">
              {isMenuOpen ? 'CLOSE' : 'MENU'}
            </span>
            <div className="hamburger-bars-box" aria-hidden="true">
              <span className="bar-line line-top"></span>
              <span className="bar-line line-bottom"></span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
