import React from 'react';
import { formatRupiah } from '../../services/storage';

export default function ThermalReceiptModal({ order, settings, onClose, onCopyText }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop no-print-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="thermal-receipt-modal" onClick={e => e.stopPropagation()}>
        <div className="receipt-modal-head no-print">
          <h3>Struk Pembayaran</h3>
          <button onClick={onClose}>×</button>
        </div>

        {/* 58mm / 80mm ESC-POS Styled Thermal Receipt */}
        <div className="receipt-paper-slip" id="printableThermalReceipt">
          <div className="receipt-store-header">
            <h4>{settings.storeName}</h4>
            <p>{settings.tagline}</p>
            <p>{settings.address}</p>
            <p>WA: +{settings.phone}</p>
          </div>

          <div className="receipt-info-grid">
            <div>
              <span>No: <strong>{order.id}</strong></span><br />
              <span>Kasir: {order.cashierName || 'Aoi Tanaka'}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span><br />
              <span>{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="receipt-customer-tag">
            Layanan: <strong>{order.orderType === 'dine_in' ? `Dine-In (${order.tableNumber})` : 'Take-Away'}</strong><br />
            Pelanggan: {order.customerName}
          </div>

          <table className="receipt-items-table">
            <thead>
              <tr>
                <th>Menu</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    {it.nama}
                    {it.notes && <div className="receipt-item-note">* {it.notes}</div>}
                  </td>
                  <td style={{ textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-math-section">
            <div className="receipt-math-row">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="receipt-math-row">
                <span>Diskon:</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            {order.service > 0 && (
              <div className="receipt-math-row">
                <span>Service Charge ({settings.serviceRate || 5}%):</span>
                <span>{formatRupiah(order.service)}</span>
              </div>
            )}
            <div className="receipt-math-row">
              <span>Pajak Restoran PB1 ({settings.taxRate || 10}%):</span>
              <span>{formatRupiah(order.tax)}</span>
            </div>
            <div className="receipt-math-row grand">
              <span>TOTAL BAYAR:</span>
              <span>{formatRupiah(order.total)}</span>
            </div>
            <div className="receipt-math-row" style={{ marginTop: '8px' }}>
              <span>Metode:</span>
              <span>{order.paymentMethod.toUpperCase()}</span>
            </div>
            {order.cashReceived > 0 && (
              <>
                <div className="receipt-math-row">
                  <span>Tunai Diterima:</span>
                  <span>{formatRupiah(order.cashReceived)}</span>
                </div>
                <div className="receipt-math-row">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(order.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          <div className="receipt-slip-footer">
            <div className="fake-barcode">||| | |||| | ||||||| | |||</div>
            <p>{settings.receiptFooterMessage}</p>
          </div>
        </div>

        <div className="receipt-modal-actions no-print">
          <button className="btn-copy-receipt" onClick={onCopyText}>
            📋 Salin Teks
          </button>
          <button className="btn-print-receipt" onClick={handlePrint}>
            🖨️ Cetak Struk (Print)
          </button>
        </div>
      </div>
    </div>
  );
}
