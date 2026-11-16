import React, { useState, useEffect } from 'react';
import {
  getProducts,
  getOrders,
  getTables,
  getSettings,
  getCart,
  getStoredRole,
  setStoredRole,
  saveProduct,
  deleteProduct,
  adjustStock,
  createOrder,
  updateOrderStatus,
  payAndCompleteOrder,
  occupyTable,
  freeTable,
  setTableReserved,
  saveSettings,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  getGuestActiveOrderId,
  setGuestActiveOrder,
  getAnalytics,
  getShiftSummary,
  exportDatabaseJSON,
  importDatabaseJSON,
  resetToFactorySeed,
  formatRupiah
} from './services/storage';
import { sound } from './services/audio';

import AppHeader from './components/shared/AppHeader';
import HamburgerMenu from './components/shared/HamburgerMenu';
import PinModal from './components/shared/PinModal';
import ThermalReceiptModal from './components/shared/ThermalReceiptModal';
import GuestView from './components/guest/GuestView';
import CashierView from './components/cashier/CashierView';
import AdminView from './components/admin/AdminView';

export default function App() {
  const [currentRole, setCurrentRole] = useState(getStoredRole);
  const [products, setProducts] = useState(getProducts);
  const [orders, setOrders] = useState(getOrders);
  const [tables, setTables] = useState(getTables);
  const [settings, setSettings] = useState(getSettings);
  const [cart, setCart] = useState(getCart);
  const [guestActiveOrderId, setGuestOrderIdState] = useState(getGuestActiveOrderId);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [pinModalTarget, setPinModalTarget] = useState(null); // 'admin' | 'cashier' | null
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

  // Toast
  const [toasts, setToasts] = useState([]);

  const showToast = (message, icon = '✨') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  // Sync state whenever storage updates
  const refreshState = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    setTables(getTables());
    setSettings(getSettings());
    setCart(getCart());
  };

  // Role switching
  const handleSelectRole = (targetRole) => {
    if (targetRole === currentRole) return;
    if (targetRole === 'admin' || targetRole === 'cashier') {
      setPinModalTarget(targetRole);
    } else {
      doSwitchRole('guest');
    }
  };

  const doSwitchRole = (role) => {
    setStoredRole(role);
    setCurrentRole(role);
    setPinModalTarget(null);
    sound.click(750, 0.08);
    showToast(`Beralih ke mode ${role === 'admin' ? 'Admin Manajer' : (role === 'cashier' ? 'Kasir POS' : 'Tamu / Pelanggan')}`, '🔄');
  };

  // Cart operations
  const handleAddToCart = (productId, qty, notes) => {
    const updated = addToCart(productId, qty, notes);
    setCart(updated);
    sound.click(650, 0.06);
    showToast('Ditambahkan ke pesanan!', '🍱');
  };

  const handleUpdateCartQty = (idx, qty) => {
    const updated = updateCartQty(idx, qty);
    setCart(updated);
  };

  const handleRemoveCartItem = (idx) => {
    const updated = removeFromCart(idx);
    setCart(updated);
  };

  // Guest self-order
  const handleSubmitGuestOrder = (payload) => {
    const newOrder = createOrder({
      items: cart,
      orderType: payload.orderType,
      tableNumber: payload.tableNumber,
      customerName: payload.customerName,
      source: 'guest_self_order',
      paymentMethod: 'unpaid',
      status: 'pending'
    });

    clearCart();
    setCart([]);
    setGuestActiveOrder(newOrder.id);
    setGuestOrderIdState(newOrder.id);

    refreshState();
    sound.orderBell();
    showToast(`Pesanan #${newOrder.id} berhasil dikirim ke Dapur & Kasir!`, '🎉');
  };

  const handleWhatsAppOrder = (info) => {
    const itemsList = cart.map(it => `• ${it.qty}x ${it.nama} (${formatRupiah(it.harga * it.qty)})${it.notes ? ` [${it.notes}]` : ''}`).join('\n');
    const msg = `Halo ${settings.storeName},\nSaya ingin memesan:\n\n*Nama:* ${info.customerName}\n*Layanan:* ${info.orderType === 'dine_in' ? `Dine-In (${info.tableNumber})` : 'Take-Away'}\n\n*Pesanan:*\n${itemsList}\n\n*Total:* ${formatRupiah(info.grandTotal)}\n\nMohon konfirmasi pesanan saya. Terima kasih! (ありがとうございます)`;

    const url = settings.phone ? `https://wa.me/${settings.phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka WhatsApp toko...', '💬');
  };

  const handleReserveTable = (resData) => {
    const freeT = tables.find(t => t.status === 'available' && t.capacity >= resData.guests) || tables.find(t => t.status === 'available');
    if (freeT) {
      setTableReserved(freeT.name, `${resData.name} (${resData.guests}pax - ${resData.time})`, `${resData.date} ${resData.time}`);
      refreshState();
    }
    sound.click(800, 0.1);
    showToast(`Reservasi berhasil tercatat untuk ${resData.name}!`, '📅');
  };

  // Cashier payment completion
  const handleCompletePayment = (paymentData) => {
    let order;
    if (paymentData.existingOrderId) {
      order = payAndCompleteOrder(
        paymentData.existingOrderId,
        paymentData.paymentMethod,
        paymentData.cashReceived,
        paymentData.change,
        'Aoi Tanaka'
      );
    } else {
      order = createOrder({
        items: paymentData.items,
        orderType: paymentData.orderType,
        tableNumber: paymentData.tableNumber,
        customerName: paymentData.customerName,
        discount: paymentData.discount,
        paymentMethod: paymentData.paymentMethod,
        cashReceived: paymentData.cashReceived,
        change: paymentData.change,
        status: 'completed',
        source: 'cashier_pos',
        cashierName: 'Aoi Tanaka'
      });
    }

    refreshState();
    sound.cashRegister();
    showToast(`Transaksi ${order.id} berhasil lunas!`, '✅');
    setActiveReceiptOrder(order);
  };

  // Kitchen queue status update
  const handleUpdateOrderStatus = (orderId, status) => {
    updateOrderStatus(orderId, status);
    refreshState();
    if (status === 'cooking') {
      sound.orderBell();
      showToast(`Pesanan ${orderId} mulai dimasak di dapur!`, '🍳');
    } else if (status === 'ready') {
      sound.orderBell();
      showToast(`Pesanan ${orderId} siap disajikan ke meja!`, '🛎️');
    } else if (status === 'cancelled') {
      showToast(`Pesanan ${orderId} dibatalkan. Stok dikembalikan.`, '❌');
    }
  };

  // Admin CRUD & Settings
  const handleSaveProduct = (prodData) => {
    saveProduct(prodData);
    refreshState();
    showToast('Menu masakan berhasil disimpan!', '💾');
  };

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    refreshState();
    showToast('Menu masakan dihapus.', '🗑️');
  };

  const handleAdjustStock = (id, delta) => {
    adjustStock(id, delta);
    refreshState();
    showToast(`Stok menu ditambah +${delta}`, '📦');
  };

  const handleUpdateSettings = (newSettings) => {
    const updated = saveSettings(newSettings);
    setSettings(updated);
    showToast('Pengaturan toko berhasil diperbarui!', '⚙️');
  };

  const handleFreeTable = (tableName) => {
    freeTable(tableName);
    refreshState();
    showToast(`${tableName} sekarang kosong dan tersedia.`, '🧹');
  };

  // DB Backup & Reset
  const handleExportDB = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ichiraku_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cadangan database JSON berhasil diunduh!', '💾');
  };

  const handleImportDB = (jsonStr) => {
    importDatabaseJSON(jsonStr);
    refreshState();
    showToast('Database berhasil dipulihkan dari cadangan!', '✅');
  };

  const handleResetDB = () => {
    if (window.confirm('PERINGATAN: Kembalikan seluruh database ke data awal bawaan pabrik (20 menu, 12 meja, dummy transaksi)?')) {
      resetToFactorySeed();
      refreshState();
      sound.click(400, 0.2);
      showToast('Database berhasil direset ke data pabrik!', '🔄');
    }
  };

  const copyReceiptText = () => {
    const el = document.getElementById('printableThermalReceipt');
    if (el) {
      navigator.clipboard.writeText(el.innerText).then(() => {
        showToast('Teks struk disalin ke papan klip!', '📋');
      });
    }
  };

  return (
    <div className="app-root">
      {/* Unified Luxury Floating Header with Animated Hamburger Menu */}
      <AppHeader
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        cartCount={cart.reduce((sum, it) => sum + it.qty, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleMenu={() => setIsHamburgerOpen(prev => !prev)}
        isMenuOpen={isHamburgerOpen}
      />

      {/* Editorial Slide-Over Hamburger Menu */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cart.reduce((sum, it) => sum + it.qty, 0)}
        settings={settings}
        onResetDB={handleResetDB}
      />

      {/* Main View According to Role */}
      <main className="main-viewport">
        {currentRole === 'guest' && (
          <GuestView
            products={products}
            tables={tables}
            orders={orders}
            settings={settings}
            cart={cart}
            activeOrderId={guestActiveOrderId}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onSubmitOrder={handleSubmitGuestOrder}
            onWhatsAppOrder={handleWhatsAppOrder}
            onReserveTable={handleReserveTable}
          />
        )}

        {currentRole === 'cashier' && (
          <CashierView
            products={products}
            tables={tables}
            orders={orders}
            settings={settings}
            shiftSummary={getShiftSummary('Aoi Tanaka')}
            onCompletePayment={handleCompletePayment}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenReceipt={setActiveReceiptOrder}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            products={products}
            tables={tables}
            orders={orders}
            settings={settings}
            analytics={getAnalytics()}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
            onUpdateSettings={handleUpdateSettings}
            onOpenReceipt={setActiveReceiptOrder}
            onExportDB={handleExportDB}
            onImportDB={handleImportDB}
            onResetDB={handleResetDB}
            onFreeTable={handleFreeTable}
            onReserveTable={(tableName, name, time) => {
              setTableReserved(tableName, name, time);
              refreshState();
            }}
          />
        )}
      </main>

      {/* Security PIN Modal */}
      {pinModalTarget && (
        <PinModal
          targetRole={pinModalTarget}
          onClose={() => setPinModalTarget(null)}
          onSuccess={doSwitchRole}
        />
      )}

      {/* Thermal Receipt Modal */}
      {activeReceiptOrder && (
        <ThermalReceiptModal
          order={activeReceiptOrder}
          settings={settings}
          onClose={() => setActiveReceiptOrder(null)}
          onCopyText={copyReceiptText}
        />
      )}

      {/* Floating Toast Notifications */}
      <div className="floating-toasts-area">
        {toasts.map(t => (
          <div key={t.id} className="app-toast">
            <span className="toast-icon">{t.icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
