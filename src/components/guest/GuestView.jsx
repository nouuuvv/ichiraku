import React, { useState } from 'react';
import HeroFullscreen from './HeroFullscreen';
import MenuEditorial from './MenuEditorial';
import CartDrawer from './CartDrawer';
import ProductModal from './ProductModal';
import TrackerAndReservation from './TrackerAndReservation';

export default function GuestView({
  products,
  tables,
  orders,
  settings,
  cart,
  activeOrderId,
  isCartOpen,
  setIsCartOpen,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onSubmitOrder,
  onWhatsAppOrder,
  onReserveTable
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const activeOrder = orders.find(o => o.id === activeOrderId) || null;

  return (
    <div className="guest-page-wrapper">
      {/* 1. Fullscreen Hero Section (Pure Typography & Negative Space, No Clutter) */}
      <HeroFullscreen />

      {/* 2. Menu Section (Clean Editorial with 8-Item Pagination) */}
      <MenuEditorial
        products={products}
        onSelectProduct={setSelectedProduct}
        onQuickAdd={(item) => onAddToCart(item.id, 1, '')}
      />

      {/* 3. Live Order Tracking & Table Reservation */}
      <TrackerAndReservation
        activeOrder={activeOrder}
        orders={orders}
        onReserveTable={onReserveTable}
      />

      {/* 4. Culinary Craft & Philosophy Section (Inspired by /example i2.jpg) */}
      <section className="philosophy-editorial-sec" id="section-philosophy">
        <div className="container philosophy-inner">
          <div className="philosophy-left-col">
            <span className="philosophy-eyebrow">OUR DISCIPLINE · 職人のこだわり</span>
            <h2 className="philosophy-title">
              Simplicity is the <em>Ultimate</em> Sophistication.
            </h2>
            <p className="philosophy-lead">
              Setiap mangkuk ramen dan potongan sushi disiapkan dari kaldu yang direbus perlahan selama 14 jam,
              menggunakan resep rahasia Tokyo dan bahan lokal segar pilihan. Tanpa kompromi, tanpa pengawet buatan.
            </p>
            <div className="philosophy-badges-row">
              <div className="phil-badge-item">
                <strong>14 Hours</strong>
                <span>Slow-Simmered Broth</span>
              </div>
              <div className="phil-badge-item">
                <strong>Fresh Daily</strong>
                <span>Sashimi Grade Fish</span>
              </div>
              <div className="phil-badge-item">
                <strong>Edo Heritage</strong>
                <span>Artisanal Technique</span>
              </div>
            </div>
          </div>

          <div className="philosophy-right-col">
            <div className="philosophy-quote-card">
              <span className="quote-kanji">一生懸命</span>
              <p className="quote-text">
                "Memasak bukan sekadar menyajikan makanan, melainkan menghadirkan momen hangat yang tak terlupakan bagi setiap tamu."
              </p>
              <div className="quote-author">
                <strong>Kenji Sato</strong>
                <span>Executive Chef & Co-Founder</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Minimalist Editorial Footer */}
      <footer className="guest-footer" id="section-footer">
        <div className="container guest-footer-inner">
          <div className="footer-brand-pane">
            <div className="footer-brand-logo">
              <span className="footer-stamp">一楽</span>
              <span className="footer-title">ichiraku<em>.</em></span>
            </div>
            <p className="footer-sub">{settings.tagline} · {settings.address}</p>
          </div>
          <div className="footer-right">
            <span>Hours: {settings.openingHours}</span>
            <span>WhatsApp: +{settings.phone}</span>
            <small>© 2026 Ichiraku Japanese Kitchen · Banyuwangi / Jakarta</small>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        tables={tables}
        settings={settings}
        onUpdateQty={onUpdateCartQty}
        onRemoveItem={onRemoveCartItem}
        onSubmitOrder={(payload) => {
          onSubmitOrder(payload);
          setIsCartOpen(false);
        }}
        onWhatsAppOrder={onWhatsAppOrder}
      />
    </div>
  );
}
