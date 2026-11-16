import React, { useState } from 'react';
import { formatRupiah } from '../../services/storage';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  tables,
  settings,
  onUpdateQty,
  onRemoveItem,
  onSubmitOrder,
  onWhatsAppOrder
}) {
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState('Meja 01');
  const [customerName, setCustomerName] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, it) => sum + (it.harga * it.qty), 0);
  const service = orderType === 'dine_in' ? Math.round(subtotal * ((settings.serviceRate || 5) / 100)) : 0;
  const tax = Math.round((subtotal + service) * ((settings.taxRate || 10) / 100));
  const grandTotal = subtotal + service + tax;

  const handleSubmit = () => {
    onSubmitOrder({
      orderType,
      tableNumber: orderType === 'dine_in' ? selectedTable : null,
      customerName: customerName.trim() || 'Tamu Ichiraku'
    });
  };

  const handleWhatsApp = () => {
    onWhatsAppOrder({
      orderType,
      tableNumber: orderType === 'dine_in' ? selectedTable : 'Take-Away',
      customerName: customerName.trim() || 'Tamu Ichiraku',
      subtotal,
      service,
      tax,
      grandTotal
    });
  };

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="clean-cart-drawer" role="dialog" aria-modal="true" aria-label="Keranjang pesanan">
        <div className="cart-head">
          <div className="cart-head-title">
            <h3>Your Order</h3>
            <span>{cart.reduce((s, it) => s + it.qty, 0)} items</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Tutup">×</button>
        </div>

        <div className="cart-content">
          {/* Service Settings Card */}
          <div className="cart-service-settings">
            <div className="service-type-toggle">
              <button
                type="button"
                className={`toggle-option ${orderType === 'dine_in' ? 'active' : ''}`}
                onClick={() => setOrderType('dine_in')}
              >
                Dine-In
              </button>
              <button
                type="button"
                className={`toggle-option ${orderType === 'takeaway' ? 'active' : ''}`}
                onClick={() => setOrderType('takeaway')}
              >
                Take-Away
              </button>
            </div>

            {orderType === 'dine_in' && (
              <div className="form-field-compact">
                <label>Select Table</label>
                <select
                  value={selectedTable}
                  onChange={e => setSelectedTable(e.target.value)}
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.capacity} pax - {t.status === 'occupied' ? 'Occupied' : 'Available'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-field-compact">
              <label>Your Name</label>
              <input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="cart-empty-view">
              <span className="cart-empty-icon">🥢</span>
              <p>Your order is empty</p>
              <small>Explore our dishes and tap "+ Add"</small>
            </div>
          ) : (
            <div className="cart-items-scroll">
              {cart.map((item, idx) => (
                <div key={idx} className="cart-item-card">
                  <div className="cart-item-info">
                    <h4>{item.nama}</h4>
                    <span className="cart-item-unit-price">{formatRupiah(item.harga)}</span>
                    {item.notes && (
                      <span className="cart-item-note">Note: {item.notes}</span>
                    )}
                    <div className="cart-qty-stepper">
                      <button onClick={() => onUpdateQty(idx, item.qty - 1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => onUpdateQty(idx, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-subtotal">{formatRupiah(item.harga * item.qty)}</span>
                    <button className="cart-item-delete" onClick={() => onRemoveItem(idx)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Bottom Summary */}
        {cart.length > 0 && (
          <div className="cart-bottom-actions">
            <div className="cart-totals-breakdown">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {orderType === 'dine_in' && (
                <div className="total-row">
                  <span>Service ({settings.serviceRate || 5}%)</span>
                  <span>{formatRupiah(service)}</span>
                </div>
              )}
              <div className="total-row">
                <span>PB1 Tax ({settings.taxRate || 10}%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="total-row grand">
                <span>Total Amount</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <button className="btn-order-submit" onClick={handleSubmit}>
              Send to Kitchen & Cashier ↗
            </button>
            <button className="btn-whatsapp-order" onClick={handleWhatsApp}>
              Order via WhatsApp 💬
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
