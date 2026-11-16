import React, { useState } from 'react';
import { CATEGORIES } from '../../data/mockData';
import { formatRupiah } from '../../services/storage';

export default function AdminView({
  products,
  tables,
  orders,
  settings,
  analytics,
  onSaveProduct,
  onDeleteProduct,
  onAdjustStock,
  onUpdateSettings,
  onOpenReceipt,
  onExportDB,
  onImportDB,
  onResetDB,
  onFreeTable,
  onReserveTable
}) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'orders' | 'tables' | 'settings'

  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [fName, setFName] = useState('');
  const [fKanji, setFKanji] = useState('');
  const [fCategory, setFCategory] = useState('Sushi & Sashimi');
  const [fPrice, setFPrice] = useState('');
  const [fStock, setFStock] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fEmoji, setFEmoji] = useState('🍱');
  const [fTone, setFTone] = useState('#ede8dd');
  const [fFeatured, setFFeatured] = useState(false);

  // Settings State
  const [sName, setSName] = useState(settings.storeName || '');
  const [sTagline, setSTagline] = useState(settings.tagline || '');
  const [sAddress, setSAddress] = useState(settings.address || '');
  const [sPhone, setSPhone] = useState(settings.phone || '');
  const [sTax, setSTax] = useState(settings.taxRate || 10);
  const [sService, setSService] = useState(settings.serviceRate || 5);

  const openAddModal = () => {
    setEditingProduct(null);
    setFName('');
    setFKanji('');
    setFCategory('Sushi & Sashimi');
    setFPrice('');
    setFStock('');
    setFDesc('');
    setFEmoji('🍱');
    setFTone('#ede8dd');
    setFFeatured(false);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFName(p.nama);
    setFKanji(p.kanji || '');
    setFCategory(p.kategori);
    setFPrice(p.harga);
    setFStock(p.stok);
    setFDesc(p.deskripsi || '');
    setFEmoji(p.emoji || '🍱');
    setFTone(p.tone || '#ede8dd');
    setFFeatured(Boolean(p.unggulan));
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!fName.trim()) return;

    onSaveProduct({
      id: editingProduct?.id,
      nama: fName.trim(),
      kanji: fKanji.trim() || '一楽',
      kategori: fCategory,
      harga: Number(fPrice) || 0,
      stok: Number(fStock) || 0,
      deskripsi: fDesc.trim(),
      emoji: fEmoji.trim() || '🍱',
      tone: fTone.trim() || '#ede8dd',
      unggulan: fFeatured
    });

    setIsProductModalOpen(false);
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings({
      storeName: sName,
      tagline: sTagline,
      address: sAddress,
      phone: sPhone,
      taxRate: Number(sTax),
      serviceRate: Number(sService)
    });
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        onImportDB(ev.target.result);
      } catch (err) {
        alert('Gagal impor database: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const maxCatVal = Math.max(...Object.values(analytics.categorySales || {}), 1);

  return (
    <div className="admin-app-wrapper">
      {/* Admin Top Header */}
      <div className="admin-top-nav">
        <div className="container-wide admin-top-nav-inner">
          <div className="admin-profile-badge">
            <span className="admin-avatar">👨‍💼</span>
            <div>
              <h3>Manajemen Toko (Admin)</h3>
              <small>General Manager: <strong>Kenji Sato</strong></small>
            </div>
          </div>

          <div className="admin-nav-tabs-row">
            <button
              className={`admin-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 Analitik & Omset
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🍱 Katalog Menu ({products.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🧾 Riwayat Transaksi ({orders.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveTab('tables')}
            >
              🪑 Denah Meja ({tables.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Pengaturan & Database
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide admin-main-content">
        {/* SUBTAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="admin-analytics-view">
            {/* KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="kpi-card">
                <span>Omset Hari Ini</span>
                <strong>{formatRupiah(analytics.revenueToday)}</strong>
                <small>{analytics.todayCompletedCount} transaksi selesai</small>
              </div>
              <div className="kpi-card">
                <span>Total Omset Kumulatif</span>
                <strong style={{ color: 'var(--forest)' }}>{formatRupiah(analytics.revenueAllTime)}</strong>
                <small>{analytics.allTimeOrdersCount} total transaksi</small>
              </div>
              <div className="kpi-card">
                <span>Rata-Rata Order (AOV)</span>
                <strong style={{ color: 'var(--gold)' }}>{formatRupiah(analytics.avgOrderValue)}</strong>
                <small>Average Order Value</small>
              </div>
              <div className="kpi-card">
                <span>Peringatan Stok Kritis</span>
                <strong style={{ color: 'var(--vermilion)' }}>{analytics.lowStock.length} Menu</strong>
                <small>Stok di bawah 5 porsi</small>
              </div>
            </div>

            {/* Visual Charts & Rankings */}
            <div className="admin-charts-grid">
              {/* Category Sales Distribution */}
              <div className="admin-panel-card">
                <h4 className="panel-card-title">Distribusi Penjualan per Kategori</h4>
                <div className="cat-bars-list">
                  {Object.entries(analytics.categorySales || {}).map(([cat, val]) => {
                    const pct = Math.round((val / maxCatVal) * 100);
                    return (
                      <div key={cat} className="cat-bar-row">
                        <div className="cat-bar-meta">
                          <span>{cat}</span>
                          <strong>{formatRupiah(val)}</strong>
                        </div>
                        <div className="cat-bar-track">
                          <div className="cat-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 5 Best Sellers */}
              <div className="admin-panel-card">
                <h4 className="panel-card-title">5 Menu Terlaris (Top Performers)</h4>
                <div className="top-dishes-ranking">
                  {analytics.topProducts.map((p, idx) => (
                    <div key={p.id} className="top-dish-row">
                      <span className="rank-num">#{idx + 1}</span>
                      <div className="dish-name-block">
                        <strong>{p.nama}</strong>
                        <small>{p.kategori}</small>
                      </div>
                      <div className="dish-sales-block">
                        <strong>{p.soldCount || 0} terjual</strong>
                        <small>{formatRupiah((p.soldCount || 0) * p.harga)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PRODUCT CRUD */}
        {activeTab === 'products' && (
          <div className="admin-products-view">
            <div className="table-action-header">
              <h3>Daftar Katalog Menu Restoran</h3>
              <button className="btn-add-product" onClick={openAddModal}>
                + Tambah Menu Baru
              </button>
            </div>

            <div className="table-responsive-box">
              <table className="clean-admin-table">
                <thead>
                  <tr>
                    <th>Menu Masakan</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Signature</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-dish-meta">
                          <span className="dish-emoji">{p.emoji || '🍱'}</span>
                          <div>
                            <strong>{p.nama}</strong>
                            <small className="kanji-sub">{p.kanji}</small>
                          </div>
                        </div>
                      </td>
                      <td>{p.kategori}</td>
                      <td className="mono-num">{formatRupiah(p.harga)}</td>
                      <td>
                        <span className={`stock-tag ${p.stok <= 5 ? 'low' : ''}`}>
                          {p.stok} porsi
                        </span>
                      </td>
                      <td>{p.unggulan ? <span className="star-tag">★ Signature</span> : '—'}</td>
                      <td>
                        <div className="table-actions-cell">
                          <button className="btn-action-edit" onClick={() => openEditModal(p)}>Edit</button>
                          <button className="btn-action-stock" onClick={() => onAdjustStock(p.id, 5)}>+5 Stok</button>
                          <button className="btn-action-del" onClick={() => {
                            if (window.confirm(`Hapus menu "${p.nama}"?`)) onDeleteProduct(p.id);
                          }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: TRANSACTION AUDIT */}
        {activeTab === 'orders' && (
          <div className="admin-orders-view">
            <h3 className="section-title-sub">Riwayat & Audit Transaksi</h3>
            <div className="table-responsive-box">
              <table className="clean-admin-table">
                <thead>
                  <tr>
                    <th>No. Transaksi</th>
                    <th>Waktu</th>
                    <th>Pelanggan / Meja</th>
                    <th>Jumlah Item</th>
                    <th>Total Bayar</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="mono-num font-bold">{o.id}</td>
                      <td>{new Date(o.createdAt).toLocaleString('id-ID')}</td>
                      <td>
                        <strong>{o.customerName}</strong><br />
                        <small>{o.orderType === 'dine_in' ? o.tableNumber : 'Takeaway'}</small>
                      </td>
                      <td>{o.items.length} menu</td>
                      <td className="mono-num font-bold">{formatRupiah(o.total)}</td>
                      <td>
                        <span className="method-pill">{o.paymentMethod.toUpperCase()}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${o.status}`}>{o.status.toUpperCase()}</span>
                      </td>
                      <td>
                        <button className="btn-action-edit" onClick={() => onOpenReceipt(o)}>
                          🖨️ Struk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 4: TABLES FLOOR PLAN */}
        {activeTab === 'tables' && (
          <div className="admin-tables-view">
            <h3 className="section-title-sub">Denah & Status 12 Meja Restoran</h3>
            <div className="tables-floor-grid">
              {tables.map(t => (
                <div key={t.id} className={`table-box-card ${t.status}`}>
                  <div className="table-box-head">
                    <h4>{t.name}</h4>
                    <span className="table-status-label">{t.status.toUpperCase()}</span>
                  </div>
                  <p className="table-capacity">Kapasitas: {t.capacity} Orang · {t.section}</p>
                  {t.customerName && (
                    <div className="table-customer-banner">
                      <strong>{t.customerName}</strong>
                      {t.currentOrderId && <small>{t.currentOrderId}</small>}
                    </div>
                  )}
                  <div className="table-box-actions">
                    {t.status === 'occupied' && (
                      <button className="btn-free-table" onClick={() => onFreeTable(t.name)}>
                        Kosongkan Meja
                      </button>
                    )}
                    {t.status === 'available' && (
                      <button
                        className="btn-reserve-table"
                        onClick={() => {
                          const name = prompt(`Nama tamu reservasi untuk ${t.name}:`, 'Tamu Reservasi');
                          if (name) onReserveTable(t.name, name, 'Hari Ini');
                        }}
                      >
                        Set Reservasi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 5: SETTINGS & DATABASE */}
        {activeTab === 'settings' && (
          <div className="admin-settings-view">
            {/* Restaurant Profile Settings */}
            <div className="admin-panel-card">
              <h4 className="panel-card-title">Profil Usaha & Tarif Pajak</h4>
              <form className="settings-grid-form" onSubmit={handleSettingsSubmit}>
                <div className="form-field-group">
                  <label>Nama Restoran</label>
                  <input type="text" value={sName} onChange={e => setSName(e.target.value)} required />
                </div>
                <div className="form-field-group">
                  <label>Slogan / Tagline</label>
                  <input type="text" value={sTagline} onChange={e => setSTagline(e.target.value)} />
                </div>
                <div className="form-field-group">
                  <label>Alamat Toko</label>
                  <input type="text" value={sAddress} onChange={e => setSAddress(e.target.value)} />
                </div>
                <div className="form-field-group">
                  <label>WhatsApp Toko</label>
                  <input type="text" value={sPhone} onChange={e => setSPhone(e.target.value)} />
                </div>
                <div className="form-field-group">
                  <label>Pajak Restoran PB1 (%)</label>
                  <input type="number" value={sTax} onChange={e => setSTax(e.target.value)} />
                </div>
                <div className="form-field-group">
                  <label>Service Charge (%)</label>
                  <input type="number" value={sService} onChange={e => setSService(e.target.value)} />
                </div>
                <button type="submit" className="btn-save-settings">Simpan Pengaturan</button>
              </form>
            </div>

            {/* LocalStorage Database Center */}
            <div className="admin-panel-card">
              <h4 className="panel-card-title">Pusat Cadangan Basis Data (LocalStorage)</h4>
              <p className="db-info-desc">
                Semua data menu, riwayat transaksi, meja, dan pengaturan tersimpan di LocalStorage browser perangkat ini.
              </p>
              <div className="db-actions-row">
                <button className="btn-db-action export" onClick={onExportDB}>
                  💾 Unduh Cadangan JSON (Export)
                </button>
                <label className="btn-db-action import">
                  📂 Pulihkan Database (Import JSON)
                  <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-db-action reset" onClick={onResetDB}>
                  🔄 Reset ke Data Awal Pabrik
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
          <div className="clean-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-simple">
              <h3>{editingProduct ? 'Edit Menu Masakan' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => setIsProductModalOpen(false)}>×</button>
            </div>
            <form className="modal-form-grid" onSubmit={handleProductSubmit}>
              <div className="form-col-2">
                <div className="clean-field">
                  <label>Nama Hidangan (Wajib)</label>
                  <input type="text" required value={fName} onChange={e => setFName(e.target.value)} />
                </div>
                <div className="clean-field">
                  <label>Kaligrafi Kanji / Jepang</label>
                  <input type="text" value={fKanji} onChange={e => setFKanji(e.target.value)} />
                </div>
              </div>

              <div className="form-col-3">
                <div className="clean-field">
                  <label>Kategori</label>
                  <select value={fCategory} onChange={e => setFCategory(e.target.value)}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="clean-field">
                  <label>Harga Satuan (IDR)</label>
                  <input type="number" min="0" required value={fPrice} onChange={e => setFPrice(e.target.value)} />
                </div>
                <div className="clean-field">
                  <label>Stok Porsi</label>
                  <input type="number" min="0" required value={fStock} onChange={e => setFStock(e.target.value)} />
                </div>
              </div>

              <div className="form-col-2">
                <div className="clean-field">
                  <label>Ikon Emoji</label>
                  <input type="text" value={fEmoji} onChange={e => setFEmoji(e.target.value)} />
                </div>
                <div className="clean-field">
                  <label>Warna Latar Kartu (Hex)</label>
                  <input type="text" value={fTone} onChange={e => setFTone(e.target.value)} />
                </div>
              </div>

              <div className="clean-field checkbox">
                <label>
                  <input type="checkbox" checked={fFeatured} onChange={e => setFFeatured(e.target.checked)} />
                  <span>Tandai sebagai Chef's Signature (Unggulan)</span>
                </label>
              </div>

              <div className="clean-field">
                <label>Deskripsi Cita Rasa</label>
                <textarea rows="3" value={fDesc} onChange={e => setFDesc(e.target.value)} />
              </div>

              <button type="submit" className="btn-submit-dish">
                Simpan Menu ke Katalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
