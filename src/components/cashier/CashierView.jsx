import React, { useState } from 'react';
import { CATEGORIES } from '../../data/mockData';
import { formatRupiah } from '../../services/storage';

export default function CashierView({
  products,
  tables,
  orders,
  settings,
  shiftSummary,
  onCompletePayment,
  onUpdateOrderStatus,
  onOpenReceipt
}) {
  const [activeSubTab, setActiveSubTab] = useState('terminal'); // 'terminal' | 'queue' | 'shift'

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [ticketItems, setTicketItems] = useState([]);
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState('Meja 01');
  const [customerName, setCustomerName] = useState('Pelanggan Meja 01');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [activeProcessingOrderId, setActiveProcessingOrderId] = useState(null);

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('cash'); // 'cash' | 'qris' | 'card'
  const [cashGiven, setCashGiven] = useState('');
  const [cardRef, setCardRef] = useState('');

  // Calculations
  const subtotal = ticketItems.reduce((sum, it) => sum + (it.harga * it.qty), 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const discounted = Math.max(0, subtotal - discount);
  const service = orderType === 'dine_in' ? Math.round(discounted * ((settings.serviceRate || 5) / 100)) : 0;
  const tax = Math.round((discounted + service) * ((settings.taxRate || 10) / 100));
  const grandTotal = discounted + service + tax;

  const cashNum = Number(cashGiven) || 0;
  const change = Math.max(0, cashNum - grandTotal);
  const isCashSufficient = cashNum >= grandTotal;

  // Add Item to ticket
  const handleAddItem = (product) => {
    if (product.stok <= 0) return;
    setTicketItems(prev => {
      const idx = prev.findIndex(x => x.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { id: product.id, nama: product.nama, harga: product.harga, qty: 1, notes: '' }];
    });
  };

  const handleUpdateQty = (idx, newQty) => {
    setTicketItems(prev => {
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      const copy = [...prev];
      copy[idx].qty = newQty;
      return copy;
    });
  };

  const handleClearTicket = () => {
    if (ticketItems.length && window.confirm('Kosongkan struk kasir?')) {
      setTicketItems([]);
      setDiscountPercent(0);
      setActiveProcessingOrderId(null);
    }
  };

  const handlePayConfirm = () => {
    const paidAmount = payMethod === 'cash' ? cashNum : grandTotal;
    const changeAmount = payMethod === 'cash' ? change : 0;

    onCompletePayment({
      existingOrderId: activeProcessingOrderId,
      items: ticketItems,
      orderType,
      tableNumber: orderType === 'dine_in' ? selectedTable : null,
      customerName: customerName || 'Tamu',
      discount,
      subtotal,
      service,
      tax,
      total: grandTotal,
      paymentMethod: payMethod,
      cashReceived: paidAmount,
      change: changeAmount
    });

    // Reset ticket
    setTicketItems([]);
    setDiscountPercent(0);
    setActiveProcessingOrderId(null);
    setIsPayModalOpen(false);
    setCashGiven('');
  };

  // Kitchen Queue counts
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Filtered products for POS
  const filteredProducts = products.filter(p => {
    const matchCat = posCategory === 'All' || p.kategori === posCategory;
    const matchQ = [p.nama, p.kanji, p.romaji].some(f => String(f).toLowerCase().includes(posSearch.toLowerCase()));
    return matchCat && matchQ;
  });

  return (
    <div className="pos-app-wrapper">
      {/* POS Subheader Bar */}
      <div className="pos-top-nav">
        <div className="container-wide pos-top-nav-inner">
          <div className="pos-cashier-profile">
            <span className="pos-badge-icon">💳</span>
            <div>
              <h3>Terminal Kasir (POS)</h3>
              <small>Operator: <strong>Aoi Tanaka</strong> · Shift Aktif</small>
            </div>
          </div>

          <div className="pos-view-tabs">
            <button
              className={`pos-tab-pill ${activeSubTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('terminal')}
            >
              Terminal Kasir (F4)
            </button>
            <button
              className={`pos-tab-pill ${activeSubTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('queue')}
            >
              Antrean Dapur ({pendingOrders.length + cookingOrders.length})
            </button>
            <button
              className={`pos-tab-pill ${activeSubTab === 'shift' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('shift')}
            >
              Laporan Shift & Kas
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide pos-main-container">
        {/* SUBTAB 1: TERMINAL POS */}
        {activeSubTab === 'terminal' && (
          <div className="pos-terminal-layout">
            {/* Catalog Grid Panel */}
            <div className="pos-left-panel">
              <div className="pos-filter-row">
                <input
                  type="text"
                  placeholder="Cari menu cepat / barcode (F2)..."
                  value={posSearch}
                  onChange={e => setPosSearch(e.target.value)}
                />
              </div>

              <div className="pos-categories-row">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    className={`pos-cat-chip ${posCategory === c ? 'active' : ''}`}
                    onClick={() => setPosCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="pos-tiles-grid">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    className="pos-product-tile"
                    onClick={() => handleAddItem(p)}
                    disabled={p.stok <= 0}
                  >
                    <div className="tile-top">
                      <span className="tile-emoji">{p.emoji || '🍱'}</span>
                      <span className={`tile-stock ${p.stok <= 5 ? 'critical' : ''}`}>
                        {p.stok} stok
                      </span>
                    </div>
                    <div className="tile-name">{p.nama}</div>
                    <div className="tile-price">{formatRupiah(p.harga)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Bill & Ticket Panel */}
            <div className="pos-ticket-box">
              <div className="pos-ticket-head">
                <h4>Tiket Pesanan</h4>
                <button className="btn-clear-ticket" onClick={handleClearTicket}>Clear</button>
              </div>

              <div className="pos-table-settings">
                <select value={orderType} onChange={e => setOrderType(e.target.value)}>
                  <option value="dine_in">Dine-In (Meja)</option>
                  <option value="takeaway">Take-Away (Bungkus)</option>
                </select>

                {orderType === 'dine_in' && (
                  <select
                    value={selectedTable}
                    onChange={e => {
                      setSelectedTable(e.target.value);
                      setCustomerName(`Pelanggan ${e.target.value}`);
                    }}
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <input
                type="text"
                className="pos-customer-input"
                placeholder="Nama pelanggan..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />

              {/* Ticket Items Scroll */}
              <div className="pos-ticket-items-wrap">
                {ticketItems.length === 0 ? (
                  <div className="pos-empty-ticket">
                    <p>Belum ada menu dipilih</p>
                    <small>Klik menu di panel kiri</small>
                  </div>
                ) : (
                  ticketItems.map((it, idx) => (
                    <div key={idx} className="pos-ticket-row">
                      <div className="pos-ticket-item-name">
                        <strong>{it.nama}</strong>
                        <span>{formatRupiah(it.harga)}</span>
                      </div>
                      <div className="pos-ticket-item-qty">
                        <button onClick={() => handleUpdateQty(idx, it.qty - 1)}>-</button>
                        <span>{it.qty}</span>
                        <button onClick={() => handleUpdateQty(idx, it.qty + 1)}>+</button>
                      </div>
                      <div className="pos-ticket-item-sub">
                        {formatRupiah(it.harga * it.qty)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Discounts */}
              <div className="pos-discount-chips">
                <span className="discount-label">Diskon:</span>
                {[0, 5, 10, 15].map(d => (
                  <button
                    key={d}
                    className={`disc-btn ${discountPercent === d ? 'active' : ''}`}
                    onClick={() => setDiscountPercent(d)}
                  >
                    {d}%
                  </button>
                ))}
              </div>

              {/* Totals */}
              <div className="pos-ticket-totals">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="total-line discount">
                    <span>Diskon ({discountPercent}%):</span>
                    <span>- {formatRupiah(discount)}</span>
                  </div>
                )}
                {orderType === 'dine_in' && (
                  <div className="total-line">
                    <span>Service ({settings.serviceRate || 5}%):</span>
                    <span>{formatRupiah(service)}</span>
                  </div>
                )}
                <div className="total-line">
                  <span>PB1 ({settings.taxRate || 10}%):</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
                <div className="total-line grand">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <button
                className="btn-pos-pay-now"
                onClick={() => setIsPayModalOpen(true)}
                disabled={ticketItems.length === 0}
              >
                BAYAR SEKARANG (F4) ➔
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 2: ANTREAN DAPUR (KITCHEN QUEUE KANBAN) */}
        {activeSubTab === 'queue' && (
          <div className="kitchen-kanban-grid">
            {/* 1. Pending Column */}
            <div className="kanban-col pending">
              <div className="kanban-col-head">
                <h4>Menunggu ({pendingOrders.length})</h4>
              </div>
              <div className="kanban-col-cards">
                {pendingOrders.map(o => (
                  <div key={o.id} className="kanban-card">
                    <div className="kanban-card-top">
                      <strong>{o.id}</strong>
                      <span>{o.orderType === 'dine_in' ? o.tableNumber : 'Takeaway'}</span>
                    </div>
                    <div className="kanban-card-customer">{o.customerName}</div>
                    <div className="kanban-card-items">
                      {o.items.map((it, i) => (
                        <div key={i}>• {it.qty}x {it.nama}</div>
                      ))}
                    </div>
                    <div className="kanban-card-total">{formatRupiah(o.total)}</div>
                    <div className="kanban-card-actions">
                      <button className="btn-kanban-action primary" onClick={() => onUpdateOrderStatus(o.id, 'cooking')}>
                        🍳 Masak
                      </button>
                      <button className="btn-kanban-action danger" onClick={() => onUpdateOrderStatus(o.id, 'cancelled')}>
                        Batal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Cooking Column */}
            <div className="kanban-col cooking">
              <div className="kanban-col-head">
                <h4>Sedang Dimasak ({cookingOrders.length})</h4>
              </div>
              <div className="kanban-col-cards">
                {cookingOrders.map(o => (
                  <div key={o.id} className="kanban-card">
                    <div className="kanban-card-top">
                      <strong>{o.id}</strong>
                      <span>{o.orderType === 'dine_in' ? o.tableNumber : 'Takeaway'}</span>
                    </div>
                    <div className="kanban-card-customer">{o.customerName}</div>
                    <div className="kanban-card-items">
                      {o.items.map((it, i) => (
                        <div key={i}>• {it.qty}x {it.nama}</div>
                      ))}
                    </div>
                    <div className="kanban-card-total">{formatRupiah(o.total)}</div>
                    <div className="kanban-card-actions">
                      <button className="btn-kanban-action ready" onClick={() => onUpdateOrderStatus(o.id, 'ready')}>
                        🛎️ Siap Saji
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Ready Column */}
            <div className="kanban-col ready">
              <div className="kanban-col-head">
                <h4>Siap Disajikan ({readyOrders.length})</h4>
              </div>
              <div className="kanban-col-cards">
                {readyOrders.map(o => (
                  <div key={o.id} className="kanban-card">
                    <div className="kanban-card-top">
                      <strong>{o.id}</strong>
                      <span>{o.orderType === 'dine_in' ? o.tableNumber : 'Takeaway'}</span>
                    </div>
                    <div className="kanban-card-customer">{o.customerName}</div>
                    <div className="kanban-card-items">
                      {o.items.map((it, i) => (
                        <div key={i}>• {it.qty}x {it.nama}</div>
                      ))}
                    </div>
                    <div className="kanban-card-total">{formatRupiah(o.total)}</div>
                    <div className="kanban-card-actions">
                      <button
                        className="btn-kanban-action pay"
                        onClick={() => {
                          setActiveProcessingOrderId(o.id);
                          setTicketItems(o.items);
                          setOrderType(o.orderType);
                          setSelectedTable(o.tableNumber || 'Meja 01');
                          setCustomerName(o.customerName);
                          setActiveSubTab('terminal');
                          setIsPayModalOpen(true);
                        }}
                      >
                        💳 Pelunasan Kasir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Completed Column */}
            <div className="kanban-col completed">
              <div className="kanban-col-head">
                <h4>Selesai ({completedOrders.length})</h4>
              </div>
              <div className="kanban-col-cards">
                {completedOrders.slice(0, 8).map(o => (
                  <div key={o.id} className="kanban-card completed">
                    <div className="kanban-card-top">
                      <strong>{o.id}</strong>
                      <span>{o.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div className="kanban-card-customer">{o.customerName}</div>
                    <div className="kanban-card-total">{formatRupiah(o.total)}</div>
                    <button className="btn-kanban-action" onClick={() => onOpenReceipt(o)}>
                      🖨️ Cetak Struk
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: LAPORAN SHIFT */}
        {activeSubTab === 'shift' && (
          <div className="shift-report-wrapper">
            <div className="shift-header-card">
              <div>
                <h3>Laporan Kasir & Shift Kerja</h3>
                <p>Operator: {shiftSummary.cashierName} · Tanggal: {shiftSummary.shiftDate}</p>
              </div>
              <button className="btn-print-shift" onClick={() => window.print()}>
                🖨️ Cetak Laporan
              </button>
            </div>

            <div className="shift-metrics-row">
              <div className="shift-card">
                <span>Total Penjualan Shift</span>
                <strong>{formatRupiah(shiftSummary.totalSales)}</strong>
                <small>{shiftSummary.transactionCount} Transaksi</small>
              </div>
              <div className="shift-card">
                <span>Penerimaan Tunai</span>
                <strong style={{ color: 'var(--vermilion)' }}>{formatRupiah(shiftSummary.totalCash)}</strong>
                <small>Uang fisik kasir</small>
              </div>
              <div className="shift-card">
                <span>Penerimaan QRIS</span>
                <strong style={{ color: 'var(--blue)' }}>{formatRupiah(shiftSummary.totalQRIS)}</strong>
                <small>Digital e-wallet</small>
              </div>
              <div className="shift-card">
                <span>Penerimaan EDC/Kartu</span>
                <strong style={{ color: 'var(--gold)' }}>{formatRupiah(shiftSummary.totalCard)}</strong>
                <small>Debit / Kartu Kredit</small>
              </div>
            </div>

            <div className="cash-drawer-box">
              <h4>Rekonsiliasi Laci Kas (Cash Drawer)</h4>
              <div className="drawer-line">
                <span>Modal Awal Kasir (Cash Float):</span>
                <strong>{formatRupiah(shiftSummary.startingFloat)}</strong>
              </div>
              <div className="drawer-line">
                <span>Total Penjualan Tunai:</span>
                <strong>+ {formatRupiah(shiftSummary.totalCash)}</strong>
              </div>
              <div className="drawer-line grand">
                <span>Uang Tunai Seharusnya di Laci:</span>
                <strong style={{ color: 'var(--vermilion)' }}>
                  {formatRupiah(shiftSummary.expectedCashInDrawer)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPayModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPayModalOpen(false)}>
          <div className="clean-modal-card pay-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-head">
              <h3>Pembayaran Transaksi</h3>
              <button onClick={() => setIsPayModalOpen(false)}>×</button>
            </div>

            <div className="pay-total-banner">
              <span>TOTAL TAGIHAN</span>
              <h2>{formatRupiah(grandTotal)}</h2>
            </div>

            {/* Method Tabs */}
            <div className="pay-method-tabs">
              <button
                className={`method-tab ${payMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPayMethod('cash')}
              >
                💵 Tunai (Cash)
              </button>
              <button
                className={`method-tab ${payMethod === 'qris' ? 'active' : ''}`}
                onClick={() => setPayMethod('qris')}
              >
                📱 QRIS
              </button>
              <button
                className={`method-tab ${payMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPayMethod('card')}
              >
                💳 Kartu EDC
              </button>
            </div>

            {/* Cash Input */}
            {payMethod === 'cash' && (
              <div className="cash-pay-section">
                <label>Nominal Tunai Diterima:</label>
                <input
                  type="number"
                  className="cash-input-field"
                  placeholder="Ketik uang tunai..."
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  autoFocus
                />

                <div className="quick-denominations">
                  <button onClick={() => setCashGiven(grandTotal)}>Uang Pas</button>
                  <button onClick={() => setCashGiven(50000)}>50.000</button>
                  <button onClick={() => setCashGiven(100000)}>100.000</button>
                  <button onClick={() => setCashGiven(150000)}>150.000</button>
                  <button onClick={() => setCashGiven(200000)}>200.000</button>
                </div>

                <div className="change-calc-box">
                  <span>Kembalian:</span>
                  <strong className={isCashSufficient ? 'sufficient' : 'insufficient'}>
                    {isCashSufficient ? formatRupiah(change) : `Kurang ${formatRupiah(Math.abs(cashNum - grandTotal))}`}
                  </strong>
                </div>
              </div>
            )}

            {/* QRIS Input */}
            {payMethod === 'qris' && (
              <div className="qris-pay-section">
                <div className="qris-box-art">
                  <span className="qris-badge">QRIS ICHIRAKU</span>
                </div>
                <p>Arahkan kamera pelanggan ke kode QRIS di atas (GoPay/OVO/BCA/ShopeePay)</p>
                <button
                  className="btn-simulate-qris"
                  onClick={() => {
                    setPayMethod('qris');
                    handlePayConfirm();
                  }}
                >
                  ✓ Simulasi QRIS Berhasil Terbayar
                </button>
              </div>
            )}

            {/* Card Input */}
            {payMethod === 'card' && (
              <div className="card-pay-section">
                <label>Nomor Referensi EDC / Approval Code</label>
                <input
                  type="text"
                  placeholder="Contoh: REF-881923"
                  value={cardRef}
                  onChange={e => setCardRef(e.target.value)}
                />
              </div>
            )}

            <button
              className="btn-confirm-payment"
              onClick={handlePayConfirm}
              disabled={payMethod === 'cash' && !isCashSufficient}
            >
              Konfirmasi Lunas & Cetak Struk 🖨️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
