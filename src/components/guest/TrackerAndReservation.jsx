import React, { useState } from 'react';
import { formatRupiah } from '../../services/storage';

export default function TrackerAndReservation({ activeOrder, orders, onSearchOrder, onReserveTable }) {
  const [searchId, setSearchId] = useState('');
  const [displayedOrder, setDisplayedOrder] = useState(activeOrder);

  // Reservation form
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState('2');
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('18:00 WIB');
  const [resNotes, setResNotes] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const found = orders.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase());
    setDisplayedOrder(found || null);
  };

  const handleReservation = (e) => {
    e.preventDefault();
    onReserveTable({
      name: resName,
      phone: resPhone,
      guests: Number(resGuests),
      date: resDate,
      time: resTime,
      notes: resNotes
    });
    setResName('');
    setResPhone('');
    setResNotes('');
  };

  const currentOrder = displayedOrder || activeOrder;

  const steps = [
    { key: 'pending', title: '1. Received', desc: 'Order entered kitchen system' },
    { key: 'cooking', title: '2. Cooking', desc: 'Chefs preparing your dishes' },
    { key: 'ready', title: '3. Ready', desc: 'Plated and ready to be served' },
    { key: 'completed', title: '4. Completed', desc: 'Bill settled. Itadakimasu!' }
  ];

  const currentIdx = currentOrder ? steps.findIndex(s => s.key === currentOrder.status) : -1;

  return (
    <section className="tracker-res-section" id="section-tracker">
      <div className="container tracker-res-grid">
        {/* Order Tracker */}
        <div className="tracker-panel">
          <div className="panel-header-clean">
            <span className="panel-kicker">LIVE KITCHEN FEED · 調理状況</span>
            <h3 className="panel-title">Track Your Dishes</h3>
          </div>

          <form className="tracker-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ICH-2026-1021)..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
            <button type="submit" className="btn-search-tracker">Track</button>
          </form>

          {currentOrder ? (
            <div className="order-status-card">
              <div className="order-status-top">
                <div>
                  <span className="order-id-label">ORDER ID</span>
                  <h4 className="order-id-val">{currentOrder.id}</h4>
                  <span className="order-customer-sub">
                    {currentOrder.customerName} · {currentOrder.orderType === 'dine_in' ? currentOrder.tableNumber : 'Take-Away'}
                  </span>
                </div>
                <div className={`status-pill ${currentOrder.status}`}>
                  {currentOrder.status.toUpperCase()}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="order-progress-stepper">
                {steps.map((st, i) => {
                  const isDone = i < currentIdx || currentOrder.status === 'completed';
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={st.key} className={`step-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-circle">{isDone ? '✓' : i + 1}</div>
                      <div className="step-info">
                        <strong>{st.title}</strong>
                        <span>{st.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-items-preview">
                <div className="preview-label">Ordered Items:</div>
                {currentOrder.items.map((it, idx) => (
                  <div key={idx} className="preview-item-row">
                    <span>{it.qty}x {it.nama}</span>
                    <span className="mono-price">{formatRupiah(it.total)}</span>
                  </div>
                ))}
                <div className="preview-total-row">
                  <span>Total Bill:</span>
                  <span className="mono-price total">{formatRupiah(currentOrder.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="tracker-empty-view">
              <span className="tracker-empty-icon">⏱️</span>
              <p>Place an order or enter your ticket ID above to watch real-time kitchen progress.</p>
            </div>
          )}
        </div>

        {/* Table Reservation */}
        <div className="reservation-panel" id="section-reservation">
          <div className="panel-header-clean">
            <span className="panel-kicker">TABLE RESERVATION · 席予約</span>
            <h3 className="panel-title">Reserve an Intimate Table</h3>
          </div>

          <form className="clean-res-form" onSubmit={handleReservation}>
            <div className="form-row-2">
              <div className="clean-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={resName}
                  onChange={e => setResName(e.target.value)}
                />
              </div>
              <div className="clean-field">
                <label>WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={resPhone}
                  onChange={e => setResPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="clean-field">
                <label>Guests</label>
                <select value={resGuests} onChange={e => setResGuests(e.target.value)}>
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests</option>
                </select>
              </div>
              <div className="clean-field">
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={resDate}
                  onChange={e => setResDate(e.target.value)}
                />
              </div>
              <div className="clean-field">
                <label>Time Slot</label>
                <select value={resTime} onChange={e => setResTime(e.target.value)}>
                  <option>12:00 WIB (Lunch)</option>
                  <option>13:30 WIB (Lunch)</option>
                  <option>18:00 WIB (Dinner)</option>
                  <option>19:30 WIB (Dinner)</option>
                  <option>20:30 WIB (Evening)</option>
                </select>
              </div>
            </div>

            <div className="clean-field">
              <label>Special Requests (Optional)</label>
              <input
                type="text"
                placeholder="e.g. quiet corner table, birthday celebration..."
                value={resNotes}
                onChange={e => setResNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-res-confirm">
              Confirm Table Reservation
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
