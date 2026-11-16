// ICHIRAKU JAPANESE KITCHEN — MASTER APPLICATION CONTROLLER
// Seamless 3-Role Architecture: Admin, Kasir (POS), Guest (Editorial)

window.IchirakuApp = (function () {
  'use strict';

  const DB = window.IchirakuStore;
  const SEED = window.IchirakuSeed;

  // DOM Helper
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // Active state
  let currentRole = 'guest';
  let activeCategory = 'All';
  let guestActiveFilter = 'all';
  let selectedProductForModal = null;
  let posCart = []; // POS live ticket items
  let posDiscountPercent = 0;
  let posOrderType = 'dine_in';
  let posSelectedTable = 'Meja 01';
  let posCustomerName = 'Pelanggan Meja 01';
  let posActiveOrderId = null; // When editing existing order
  let currentAdminTab = 'analytics';
  let currentPosTab = 'terminal';

  // Currency Formatter
  function rupiah(n) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(n) || 0);
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  // Web Audio Synthesizer (Instant tactile feedback without external audio files)
  const soundFX = {
    beep: (freq = 600, duration = 0.08) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    },
    cashRegister: () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.1, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.25);
        });
      } catch (e) {}
    },
    orderChime: () => {
      soundFX.beep(880, 0.12);
      setTimeout(() => soundFX.beep(1174, 0.18), 120);
    }
  };

  // Toast System
  function showToast(message, icon = '✨') {
    const container = $('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size:16px">${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ==========================================================================
  // INITIALIZATION & ROLE SWITCHING
  // ==========================================================================
  function init() {
    currentRole = DB.getCurrentRole() || 'guest';
    bindRoleBarEvents();
    bindGlobalModals();
    bindGuestEvents();
    bindPosEvents();
    bindAdminEvents();

    switchRole(currentRole, false);
    renderAll();

    // Check if there is an active guest order to track
    const activeGuestOrder = DB.getGuestActiveOrder();
    if (activeGuestOrder) {
      renderGuestOrderTracker(activeGuestOrder.id);
    }
  }

  function bindRoleBarEvents() {
    $$('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetRole = btn.dataset.role;
        promptRoleSwitch(targetRole);
      });
    });

    $('btnQuickSwitchRole')?.addEventListener('click', () => {
      openRoleModal();
    });
  }

  function promptRoleSwitch(targetRole) {
    if (targetRole === currentRole) return;

    if (targetRole === 'admin') {
      openPinModal('admin', '1234', 'Masuk Area Admin (PIN default: 1234)');
    } else if (targetRole === 'cashier') {
      openPinModal('cashier', '1111', 'Masuk Terminal Kasir (PIN default: 1111)');
    } else {
      switchRole('guest');
    }
  }

  function openPinModal(role, defaultPin, title) {
    $('pinModalTitle').textContent = title;
    $('pinModalRole').value = role;
    $('pinModalInput').value = '';
    $('pinHint').textContent = `* Demo shortcut: Gunakan PIN "${defaultPin}" atau klik "Masuk Langsung".`;
    $('pinModal').classList.add('open');
    setTimeout(() => $('pinModalInput').focus(), 100);
  }

  function switchRole(role, notify = true) {
    currentRole = DB.setCurrentRole(role);

    // Update UI tabs in role bar
    $$('.role-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.role === role);
    });

    // Update active profile pill
    const user = DB.getUserInfo(role);
    if ($('activeUserName')) $('activeUserName').textContent = user.name;
    if ($('activeUserBadge')) $('activeUserBadge').textContent = user.badge;
    if ($('activeUserAvatar')) $('activeUserAvatar').textContent = user.avatar;

    // Toggle Role Views
    $('guestView').classList.toggle('active-view', role === 'guest');
    $('cashierView').classList.toggle('active-view', role === 'cashier');
    $('adminView').classList.toggle('active-view', role === 'admin');

    if (notify) {
      soundFX.beep(750, 0.08);
      showToast(`Beralih ke mode ${user.badge} (${user.name})`, user.avatar);
    }

    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAll() {
    if (currentRole === 'guest') {
      renderGuestCatalog();
      renderGuestCart();
    } else if (currentRole === 'cashier') {
      renderPosCatalog();
      renderPosTicket();
      renderPosQueue();
      renderPosShift();
    } else if (currentRole === 'admin') {
      renderAdminDashboard();
    }
  }

  // ==========================================================================
  // GUEST EXPERIENCE IMPLEMENTATION
  // ==========================================================================
  function bindGuestEvents() {
    // Search & Sort in Guest Catalog
    $('guestSearchInput')?.addEventListener('input', renderGuestCatalog);
    $('guestSortSelect')?.addEventListener('change', renderGuestCatalog);

    // Category Pills in Guest Catalog
    $$('.guest-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        $$('.guest-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.dataset.category;
        renderGuestCatalog();
      });
    });

    // Dietary filter buttons
    $$('.guest-diet-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.guest-diet-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        guestActiveFilter = btn.dataset.filter;
        renderGuestCatalog();
      });
    });

    // Cart Drawer Toggle
    $('btnToggleCart')?.addEventListener('click', () => openCartDrawer());
    $('btnCloseCartDrawer')?.addEventListener('click', () => closeCartDrawer());
    $('cartDrawerOverlay')?.addEventListener('click', () => closeCartDrawer());

    // Guest Cart Mode selection (Dine In vs Takeaway)
    $('guestOrderTypeSelect')?.addEventListener('change', e => {
      const isDineIn = e.target.value === 'dine_in';
      $('guestTableSelectGroup').style.display = isDineIn ? 'block' : 'none';
      renderGuestCart();
    });

    // Submit Guest Self-Order
    $('btnGuestSubmitOrder')?.addEventListener('click', handleGuestOrderSubmit);
    $('btnGuestWhatsAppOrder')?.addEventListener('click', handleGuestWhatsAppOrder);

    // Order Tracking search
    $('btnSearchTrackOrder')?.addEventListener('click', () => {
      const id = $('trackOrderIdInput').value.trim();
      renderGuestOrderTracker(id);
    });

    // Table Reservation form
    $('reservationForm')?.addEventListener('submit', handleReservationSubmit);
  }

  function renderGuestCatalog() {
    const products = DB.getProducts();
    const query = ($('guestSearchInput')?.value || '').trim().toLowerCase();
    const sort = $('guestSortSelect')?.value || 'featured';

    let filtered = products.filter(p => {
      const matchCat = activeCategory === 'All' || p.kategori === activeCategory;
      const matchQuery = [p.nama, p.kanji, p.deskripsi, p.kategori].some(field =>
        String(field || '').toLowerCase().includes(query)
      );
      let matchDiet = true;
      if (guestActiveFilter === 'signature') matchDiet = p.unggulan;
      else if (guestActiveFilter === 'spicy') matchDiet = (p.dietary || []).some(d => d.toLowerCase().includes('spicy'));
      else if (guestActiveFilter === 'halal') matchDiet = (p.dietary || []).some(d => d.toLowerCase().includes('halal'));
      return matchCat && matchQuery && matchDiet;
    });

    // Sorting
    if (sort === 'name') filtered.sort((a, b) => a.nama.localeCompare(b.nama));
    else if (sort === 'price-asc') filtered.sort((a, b) => a.harga - b.harga);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.harga - a.harga);
    else if (sort === 'stock') filtered.sort((a, b) => b.stok - a.stok);
    else filtered.sort((a, b) => Number(b.unggulan) - Number(a.unggulan));

    const grid = $('guestProductGrid');
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-catalog">
          <h3>Tidak ada menu yang sesuai</h3>
          <p>Coba kata kunci lain atau pilih kategori "Semua Menu".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const isLowStock = p.stok > 0 && p.stok <= 5;
      const isSoldOut = p.stok <= 0;
      return `
        <article class="product-card" data-product-id="${escapeHtml(p.id)}">
          <div class="card-image-wrap" style="--tone: ${escapeHtml(p.tone || '#ede8dd')}">
            <span class="card-kanji-watermark">${escapeHtml(p.kanji || '一楽')}</span>
            <span class="card-emoji-art" aria-hidden="true">${escapeHtml(p.emoji || '🍱')}</span>
            ${p.unggulan ? '<span class="card-signature-badge">★ Chef Signature</span>' : ''}
            <span class="card-stock-pill ${isLowStock ? 'low-stock' : ''}">
              ${isSoldOut ? 'Habis' : `${p.stok} porsi`}
            </span>
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <span>${escapeHtml(p.kategori)}</span>
              <span>${escapeHtml(p.prepTime || '8-10 mins')}</span>
            </div>
            <h3 class="card-title">${escapeHtml(p.nama)}</h3>
            <p class="card-desc">${escapeHtml(p.deskripsi)}</p>
            <div class="card-footer-row">
              <span class="card-price">${rupiah(p.harga)}</span>
              <button class="btn-add-cart-card" data-quick-add="${escapeHtml(p.id)}" ${isSoldOut ? 'disabled' : ''}>
                ${isSoldOut ? 'Sold Out' : '+ Tambah'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind click events on cards & quick add buttons
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('[data-quick-add]')) return;
        const id = card.dataset.productId;
        openProductDetailModal(id);
      });
    });

    grid.querySelectorAll('[data-quick-add]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.quickAdd;
        DB.addToCart(id, 1, '');
        soundFX.beep(650, 0.06);
        showToast('Ditambahkan ke pesanan Anda!', '🍱');
        renderGuestCart();
      });
    });
  }

  function openProductDetailModal(productId) {
    const product = DB.getProductById(productId);
    if (!product) return;
    selectedProductForModal = product;

    $('modalProductKanji').textContent = product.kanji || '一楽特製';
    $('modalProductName').textContent = product.nama;
    $('modalProductCategory').textContent = product.kategori;
    $('modalProductPrice').textContent = rupiah(product.harga);
    $('modalProductDesc').textContent = product.deskripsi;
    $('modalProductArt').textContent = product.emoji || '🍱';
    $('modalProductArtWrap').style.backgroundColor = product.tone || '#ede8dd';
    $('modalProductStock').textContent = product.stok > 0 ? `${product.stok} porsi tersedia` : 'Habis (Sold Out)';
    $('modalProductPrepTime').textContent = product.prepTime || '8-10 mins';

    // Allergens & Dietary
    const tagsContainer = $('modalProductTags');
    const tags = [...(product.dietary || []), ...(product.allergens || []).map(a => `Alergen: ${a}`)];
    tagsContainer.innerHTML = tags.map(t => `<span class="badge-pill" style="background:var(--bg-subtle);border:1px solid var(--border-light);padding:4px 10px;font-size:10.5px">${escapeHtml(t)}</span>`).join('');

    $('modalProductNotes').value = '';
    $('modalProductQty').value = 1;

    $('productDetailModal').classList.add('open');
  }

  function openCartDrawer() {
    renderGuestCart();
    $('cartDrawer').classList.add('open');
    $('cartDrawerOverlay').classList.add('open');
  }

  function closeCartDrawer() {
    $('cartDrawer').classList.remove('open');
    $('cartDrawerOverlay').classList.remove('open');
  }

  function renderGuestCart() {
    const cart = DB.getCart();
    const settings = DB.getSettings();

    // Update badge counter
    const totalCount = cart.reduce((sum, it) => sum + it.qty, 0);
    $$('.cart-counter-badge').forEach(b => {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? 'grid' : 'none';
    });

    const listEl = $('cartDrawerItems');
    if (!listEl) return;

    if (!cart.length) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:48px 16px;color:var(--text-tertiary)">
          <span style="font-size:48px;display:block;margin-bottom:12px">🥢</span>
          <p style="font-weight:600;color:var(--forest)">Keranjang Anda masih kosong</p>
          <p style="font-size:11px">Pilih menu favorit Anda dan klik "+ Tambah".</p>
        </div>
      `;
      $('cartDrawerSummary').style.display = 'none';
      return;
    }

    $('cartDrawerSummary').style.display = 'block';

    listEl.innerHTML = cart.map((it, idx) => `
      <div class="ticket-item-row" style="padding-bottom:12px;border-bottom:1px dashed var(--border-light)">
        <div class="ticket-item-left">
          <div class="ticket-item-title">${escapeHtml(it.nama)}</div>
          <div style="font-size:10.5px;color:var(--text-tertiary)">${rupiah(it.harga)}</div>
          ${it.notes ? `<div class="ticket-item-notes">Catatan: ${escapeHtml(it.notes)}</div>` : ''}
          <div class="ticket-item-calc">
            <button class="qty-btn" data-cart-minus="${idx}">-</button>
            <span class="ticket-item-qty">${it.qty}</span>
            <button class="qty-btn" data-cart-plus="${idx}">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="ticket-item-subtotal">${rupiah(it.harga * it.qty)}</div>
          <button class="btn-remove-item" data-cart-remove="${idx}">✕</button>
        </div>
      </div>
    `).join('');

    // Quantities events
    listEl.querySelectorAll('[data-cart-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.cartMinus);
        DB.updateCartQty(idx, cart[idx].qty - 1);
        renderGuestCart();
      });
    });

    listEl.querySelectorAll('[data-cart-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.cartPlus);
        DB.updateCartQty(idx, cart[idx].qty + 1);
        renderGuestCart();
      });
    });

    listEl.querySelectorAll('[data-cart-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.cartRemove);
        DB.removeFromCart(idx);
        renderGuestCart();
      });
    });

    // Populate Table Select if dine in
    const tableSelect = $('guestTableSelect');
    if (tableSelect) {
      const tables = DB.getTables();
      tableSelect.innerHTML = tables.map(t => `
        <option value="${escapeHtml(t.name)}">${escapeHtml(t.name)} (${t.capacity} Orang - ${t.status === 'occupied' ? 'Terisi' : 'Tersedia'})</option>
      `).join('');
    }

    // Totals
    const orderType = $('guestOrderTypeSelect')?.value || 'dine_in';
    const subtotal = cart.reduce((sum, it) => sum + (it.harga * it.qty), 0);
    const service = orderType === 'dine_in' ? Math.round(subtotal * (settings.serviceRate / 100)) : 0;
    const tax = Math.round((subtotal + service) * (settings.taxRate / 100));
    const grandTotal = subtotal + service + tax;

    $('cartSubtotalDisplay').textContent = rupiah(subtotal);
    $('cartServiceDisplay').textContent = rupiah(service);
    $('cartTaxDisplay').textContent = rupiah(tax);
    $('cartTotalDisplay').textContent = rupiah(grandTotal);
  }

  function handleGuestOrderSubmit() {
    const cart = DB.getCart();
    if (!cart.length) {
      showToast('Keranjang Anda kosong!', '⚠️');
      return;
    }

    const orderType = $('guestOrderTypeSelect').value;
    const customerName = ($('guestCustomerNameInput').value || '').trim() || 'Tamu Ichiraku';
    const tableNumber = orderType === 'dine_in' ? $('guestTableSelect').value : null;

    const newOrder = DB.createOrder({
      items: cart,
      orderType,
      customerName,
      tableNumber,
      source: 'guest_self_order',
      paymentMethod: 'unpaid',
      status: 'pending'
    });

    DB.clearCart();
    DB.setGuestActiveOrder(newOrder.id);
    closeCartDrawer();

    soundFX.cashRegister();
    showToast(`Pesanan #${newOrder.id} berhasil dikirim ke Dapur & Kasir!`, '🎉');

    // Switch view / scroll to tracker
    renderGuestCatalog();
    renderGuestOrderTracker(newOrder.id);

    const trackerSec = $('sectionTracking');
    if (trackerSec) trackerSec.scrollIntoView({ behavior: 'smooth' });
  }

  function handleGuestWhatsAppOrder() {
    const cart = DB.getCart();
    if (!cart.length) {
      showToast('Keranjang Anda masih kosong!', '⚠️');
      return;
    }
    const settings = DB.getSettings();
    const orderType = $('guestOrderTypeSelect').value;
    const customerName = ($('guestCustomerNameInput').value || '').trim() || 'Tamu Ichiraku';
    const tableNumber = orderType === 'dine_in' ? $('guestTableSelect').value : 'Bungkus / Take-Away';

    const subtotal = cart.reduce((sum, it) => sum + (it.harga * it.qty), 0);
    const service = orderType === 'dine_in' ? Math.round(subtotal * (settings.serviceRate / 100)) : 0;
    const tax = Math.round((subtotal + service) * (settings.taxRate / 100));
    const grandTotal = subtotal + service + tax;

    const itemsText = cart.map(it => `• ${it.qty}x ${it.nama} (${rupiah(it.harga * it.qty)})${it.notes ? ` [Catatan: ${it.notes}]` : ''}`).join('\n');

    const msg = `Halo ${settings.storeName},\nSaya ingin memesan menu hidangan berikut:\n\n*Nama Pemesan:* ${customerName}\n*Layanan:* ${orderType === 'dine_in' ? `Dine-In (${tableNumber})` : 'Take-Away / Delivery'}\n\n*Rincian Menu:*\n${itemsText}\n\n*Subtotal:* ${rupiah(subtotal)}\n*Service (5%):* ${rupiah(service)}\n*Pajak PB1 (10%):* ${rupiah(tax)}\n*TOTAL PESANAN:* ${rupiah(grandTotal)}\n\nMohon konfirmasi pesanan saya. Terima kasih! (ありがとうございます)`;

    const url = settings.phone ? `https://wa.me/${settings.phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka WhatsApp untuk mengirim pesanan...', '💬');
  }

  function renderGuestOrderTracker(orderId) {
    if (!orderId) {
      const active = DB.getGuestActiveOrder();
      if (active) orderId = active.id;
    }
    if (!orderId) return;

    const order = DB.getOrderById(orderId);
    const container = $('orderTrackingResult');
    if (!container) return;

    if (!order) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--vermilion)">
          Nomor pesanan "${escapeHtml(orderId)}" tidak ditemukan.
        </div>
      `;
      return;
    }

    const statusSteps = [
      { key: 'pending', title: '1. Pesanan Diterima', desc: 'Pesanan masuk ke sistem antrean' },
      { key: 'cooking', title: '2. Sedang Dimasak', desc: 'Koki menyiapkan hidangan di dapur' },
      { key: 'ready', title: '3. Siap Disajikan', desc: 'Makanan siap diantar ke meja' },
      { key: 'completed', title: '4. Selesai / Terbayar', desc: 'Transaksi lunas, selamat menikmati!' }
    ];

    const currentIdx = statusSteps.findIndex(s => s.key === order.status);

    container.innerHTML = `
      <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:24px;border-radius:2px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--border-light);padding-bottom:14px;margin-bottom:16px">
          <div>
            <span style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-tertiary)">Nomor Pesanan</span>
            <h4 style="font-family:var(--font-mono);font-size:20px;color:var(--forest);font-weight:700">${escapeHtml(order.id)}</h4>
            <div style="font-size:12px;color:var(--text-secondary)">${escapeHtml(order.customerName)} · ${order.tableNumber || 'Bungkus / Takeaway'}</div>
          </div>
          <div style="text-align:right">
            <span class="badge-pill" style="background:var(--forest);color:#fff;padding:6px 12px;font-size:11px">
              Status: ${order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div class="order-timeline-tracker">
          ${statusSteps.map((step, idx) => {
            const isCompleted = idx < currentIdx || order.status === 'completed';
            const isCurrent = idx === currentIdx;
            return `
              <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <div class="timeline-marker">${isCompleted ? '✓' : idx + 1}</div>
                <div class="timeline-info">
                  <strong>${step.title}</strong>
                  <span>${step.desc}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:20px;border-top:1px dashed var(--border-light);padding-top:14px">
          <div style="font-weight:600;font-size:12px;margin-bottom:8px">Item Pesanan:</div>
          ${order.items.map(it => `
            <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px">
              <span>${it.qty}x ${escapeHtml(it.nama)}</span>
              <span style="font-family:var(--font-mono)">${rupiah(it.total)}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:13px;border-top:1px solid var(--border-light);margin-top:8px;padding-top:8px">
            <span>Total Tagihan:</span>
            <span style="font-family:var(--font-mono);color:var(--vermilion)">${rupiah(order.total)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function handleReservationSubmit(e) {
    e.preventDefault();
    const name = $('resName').value.trim();
    const phone = $('resPhone').value.trim();
    const guests = $('resGuests').value;
    const date = $('resDate').value;
    const time = $('resTime').value;
    const notes = $('resNotes').value.trim();

    // Assign to a free table
    const tables = DB.getTables();
    const freeTable = tables.find(t => t.status === 'available' && t.capacity >= Number(guests)) || tables.find(t => t.status === 'available');

    if (freeTable) {
      DB.setTableReserved(freeTable.name, `${name} (${guests}pax - ${time})`, `${date} ${time}`);
    }

    soundFX.beep(880, 0.12);
    showToast(`Reservasi berhasil untuk ${name} pada ${date} pukul ${time}!`, '📅');
    $('reservationForm').reset();
    renderAll();
  }

  // ==========================================================================
  // KASIR (POINT OF SALE) IMPLEMENTATION
  // ==========================================================================
  function bindPosEvents() {
    // POS subtabs: Terminal, Antrean Dapur, Shift Kasir
    $$('.pos-subnav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.pos-subnav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPosTab = btn.dataset.postab;
        $('posTabTerminal').style.display = currentPosTab === 'terminal' ? 'grid' : 'none';
        $('posTabQueue').style.display = currentPosTab === 'queue' ? 'block' : 'none';
        $('posTabShift').style.display = currentPosTab === 'shift' ? 'block' : 'none';
        if (currentPosTab === 'queue') renderPosQueue();
        if (currentPosTab === 'shift') renderPosShift();
      });
    });

    // POS Search & Category Filter
    $('posSearchInput')?.addEventListener('input', renderPosCatalog);
    $$('.pos-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        $$('.pos-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderPosCatalog();
      });
    });

    // POS Order Settings (Table & Order Type)
    $('posOrderTypeSelect')?.addEventListener('change', e => {
      posOrderType = e.target.value;
      $('posTableSelect').style.display = posOrderType === 'dine_in' ? 'block' : 'none';
      renderPosTicket();
    });

    $('posTableSelect')?.addEventListener('change', e => {
      posSelectedTable = e.target.value;
      posCustomerName = `Pelanggan ${posSelectedTable}`;
      $('posCustomerNameInput').value = posCustomerName;
    });

    $('posCustomerNameInput')?.addEventListener('input', e => {
      posCustomerName = e.target.value.trim();
    });

    // Clear Ticket
    $('btnClearPosTicket')?.addEventListener('click', () => {
      if (!posCart.length) return;
      if (confirm('Kosongkan struk pesanan aktif?')) {
        posCart = [];
        posDiscountPercent = 0;
        posActiveOrderId = null;
        renderPosTicket();
        showToast('Pesanan dikosongkan.', '🗑️');
      }
    });

    // Discounts
    $$('.btn-pos-discount').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.btn-pos-discount').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        posDiscountPercent = Number(btn.dataset.discount || 0);
        renderPosTicket();
      });
    });

    // Pay Button (F4 or Click)
    $('btnPosPayNow')?.addEventListener('click', openPaymentModal);

    window.addEventListener('keydown', e => {
      if (currentRole === 'cashier' && e.key === 'F4') {
        e.preventDefault();
        openPaymentModal();
      }
    });

    // Payment Modal methods & Cash calculation
    $$('.payment-method-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        $$('.payment-method-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const method = pill.dataset.method;
        $('payMethodCashPanel').style.display = method === 'cash' ? 'block' : 'none';
        $('payMethodQrisPanel').style.display = method === 'qris' ? 'block' : 'none';
        $('payMethodCardPanel').style.display = method === 'card' ? 'block' : 'none';
      });
    });

    $('cashAmountInput')?.addEventListener('input', calculateChange);

    // Quick cash denomination buttons
    $$('.btn-quick-cash').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.cash;
        if (val === 'exact') {
          const total = getPosCalculations().grandTotal;
          $('cashAmountInput').value = total;
        } else {
          $('cashAmountInput').value = val;
        }
        calculateChange();
      });
    });

    // Confirm Payment
    $('btnConfirmPayment')?.addEventListener('click', handlePaymentComplete);

    // QRIS simulation instant pay
    $('btnSimulateQrisSuccess')?.addEventListener('click', () => {
      const calcs = getPosCalculations();
      completeOrderTransaction('qris', calcs.grandTotal, 0);
    });

    // Shift report print
    $('btnPrintShiftSummary')?.addEventListener('click', () => {
      window.print();
    });
  }

  function renderPosCatalog() {
    const products = DB.getProducts();
    const query = ($('posSearchInput')?.value || '').trim().toLowerCase();
    const activeCat = document.querySelector('.pos-cat-pill.active')?.dataset.category || 'All';

    const filtered = products.filter(p => {
      const matchCat = activeCat === 'All' || p.kategori === activeCat;
      const matchQ = [p.nama, p.kanji, p.kategori].some(f => String(f).toLowerCase().includes(query));
      return matchCat && matchQ;
    });

    const grid = $('posProductTiles');
    if (!grid) return;

    grid.innerHTML = filtered.map(p => `
      <div class="pos-tile" data-pos-product-id="${escapeHtml(p.id)}">
        <div class="pos-tile-top">
          <span class="pos-tile-emoji">${escapeHtml(p.emoji || '🍱')}</span>
          <span class="pos-tile-stock ${p.stok <= 5 ? 'low-stock' : ''}">${p.stok} stok</span>
        </div>
        <div>
          <div class="pos-tile-name">${escapeHtml(p.nama)}</div>
          <div class="pos-tile-price">${rupiah(p.harga)}</div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.pos-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const id = tile.dataset.posProductId;
        addPosItem(id);
      });
    });
  }

  function addPosItem(productId) {
    const product = DB.getProductById(productId);
    if (!product) return;

    if (product.stok <= 0) {
      showToast(`${product.nama} habis stok!`, '⚠️');
      return;
    }

    const existing = posCart.find(it => it.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      posCart.push({
        id: product.id,
        nama: product.nama,
        harga: product.harga,
        qty: 1,
        notes: ''
      });
    }

    soundFX.beep(800, 0.05);
    renderPosTicket();
  }

  function getPosCalculations() {
    const settings = DB.getSettings();
    const subtotal = posCart.reduce((sum, it) => sum + (it.harga * it.qty), 0);
    const discount = Math.round(subtotal * (posDiscountPercent / 100));
    const discountedSubtotal = Math.max(0, subtotal - discount);

    const serviceRate = posOrderType === 'dine_in' ? settings.serviceRate : 0;
    const service = Math.round(discountedSubtotal * (serviceRate / 100));

    const taxRate = settings.taxRate;
    const tax = Math.round((discountedSubtotal + service) * (taxRate / 100));

    const grandTotal = discountedSubtotal + service + tax;

    return {
      subtotal,
      discount,
      discountedSubtotal,
      service,
      tax,
      grandTotal
    };
  }

  function renderPosTicket() {
    const list = $('posTicketItems');
    if (!list) return;

    // Populate tables in select
    const tableSelect = $('posTableSelect');
    if (tableSelect && !tableSelect.children.length) {
      const tables = DB.getTables();
      tableSelect.innerHTML = tables.map(t => `
        <option value="${escapeHtml(t.name)}">${escapeHtml(t.name)} (${t.status})</option>
      `).join('');
    }

    if (!posCart.length) {
      list.innerHTML = `
        <div style="text-align:center;padding:36px 12px;color:var(--text-tertiary)">
          <span>Belum ada item dipilih</span><br>
          <small>Klik menu di panel kiri untuk menambahkan</small>
        </div>
      `;
    } else {
      list.innerHTML = posCart.map((it, idx) => `
        <div class="ticket-item-row">
          <div class="ticket-item-left">
            <div class="ticket-item-title">${escapeHtml(it.nama)}</div>
            <div style="font-size:10px;color:var(--text-tertiary)">${rupiah(it.harga)}</div>
            <div class="ticket-item-calc">
              <button class="qty-btn" data-pos-qty-minus="${idx}">-</button>
              <span class="ticket-item-qty">${it.qty}</span>
              <button class="qty-btn" data-pos-qty-plus="${idx}">+</button>
            </div>
          </div>
          <div style="text-align:right">
            <div class="ticket-item-subtotal">${rupiah(it.harga * it.qty)}</div>
            <button class="btn-remove-item" data-pos-item-remove="${idx}">✕</button>
          </div>
        </div>
      `).join('');

      // Bind +/- and remove
      list.querySelectorAll('[data-pos-qty-minus]').forEach(b => {
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.posQtyMinus);
          if (posCart[idx].qty > 1) {
            posCart[idx].qty -= 1;
          } else {
            posCart.splice(idx, 1);
          }
          renderPosTicket();
        });
      });

      list.querySelectorAll('[data-pos-qty-plus]').forEach(b => {
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.posQtyPlus);
          posCart[idx].qty += 1;
          renderPosTicket();
        });
      });

      list.querySelectorAll('[data-pos-item-remove]').forEach(b => {
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.posItemRemove);
          posCart.splice(idx, 1);
          renderPosTicket();
        });
      });
    }

    // Calculations
    const calcs = getPosCalculations();
    $('posSubtotalDisplay').textContent = rupiah(calcs.subtotal);
    $('posDiscountDisplay').textContent = `- ${rupiah(calcs.discount)}`;
    $('posServiceDisplay').textContent = rupiah(calcs.service);
    $('posTaxDisplay').textContent = rupiah(calcs.tax);
    $('posGrandTotalDisplay').textContent = rupiah(calcs.grandTotal);
  }

  function openPaymentModal() {
    if (!posCart.length) {
      showToast('Tiket pesanan masih kosong!', '⚠️');
      return;
    }

    const calcs = getPosCalculations();
    $('payTotalAmountDisplay').textContent = rupiah(calcs.grandTotal);
    $('cashAmountInput').value = '';
    $('changeAmountDisplay').textContent = 'Rp 0';
    $('btnConfirmPayment').disabled = true;

    $('paymentModal').classList.add('open');
    setTimeout(() => $('cashAmountInput').focus(), 150);
  }

  function calculateChange() {
    const calcs = getPosCalculations();
    const paid = Number($('cashAmountInput').value) || 0;
    const change = paid - calcs.grandTotal;

    const display = $('changeAmountDisplay');
    const confirmBtn = $('btnConfirmPayment');

    if (change >= 0) {
      display.textContent = rupiah(change);
      display.style.color = '#10b981';
      confirmBtn.disabled = false;
    } else {
      display.textContent = `Kurang ${rupiah(Math.abs(change))}`;
      display.style.color = 'var(--vermilion)';
      confirmBtn.disabled = true;
    }
  }

  function handlePaymentComplete() {
    const calcs = getPosCalculations();
    const activeMethod = document.querySelector('.payment-method-pill.active')?.dataset.method || 'cash';
    const cashReceived = Number($('cashAmountInput').value) || calcs.grandTotal;
    const change = Math.max(0, cashReceived - calcs.grandTotal);

    completeOrderTransaction(activeMethod, cashReceived, change);
  }

  function completeOrderTransaction(method, cashReceived, change) {
    const calcs = getPosCalculations();
    const cashier = DB.getUserInfo('cashier');

    let order;
    if (posActiveOrderId) {
      // Complete existing pending/cooking order
      order = DB.payAndCompleteOrder(posActiveOrderId, method, cashReceived, change, cashier.name);
    } else {
      // Create fresh completed order
      order = DB.createOrder({
        items: posCart,
        orderType: posOrderType,
        tableNumber: posOrderType === 'dine_in' ? posSelectedTable : null,
        customerName: posCustomerName || 'Tamu',
        discount: calcs.discount,
        paymentMethod: method,
        cashReceived,
        change,
        status: 'completed',
        source: 'cashier_pos',
        cashierName: cashier.name
      });
    }

    soundFX.cashRegister();
    $('paymentModal').classList.remove('open');

    // Reset pos live ticket
    posCart = [];
    posDiscountPercent = 0;
    posActiveOrderId = null;
    renderPosTicket();
    renderPosQueue();
    renderPosShift();
    renderPosCatalog();

    showToast(`Transaksi ${order.id} berhasil lunas!`, '✅');

    // Open Thermal Receipt Modal
    renderThermalReceipt(order);
  }

  function renderThermalReceipt(order) {
    const settings = DB.getSettings();
    const container = $('thermalReceiptContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="receipt-wrapper">
        <div class="receipt-header">
          <h4>${escapeHtml(settings.storeName)}</h4>
          <p>${escapeHtml(settings.tagline)}</p>
          <p>${escapeHtml(settings.address)}</p>
          <p>WA: +${escapeHtml(settings.phone)}</p>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <span>No: <strong>${escapeHtml(order.id)}</strong></span><br>
            <span>Kasir: ${escapeHtml(order.cashierName || 'Aoi Tanaka')}</span>
          </div>
          <div style="text-align:right">
            <span>${new Date(order.createdAt).toLocaleDateString('id-ID')}</span><br>
            <span>${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div style="font-size:10.5px;margin-bottom:6px;border-bottom:1px dashed #888;padding-bottom:4px">
          Tipe: <strong>${order.orderType === 'dine_in' ? `Dine-In (${order.tableNumber})` : 'Take-Away'}</strong><br>
          Pelanggan: ${escapeHtml(order.customerName)}
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(it => `
              <tr>
                <td>
                  ${escapeHtml(it.nama)}
                  ${it.notes ? `<br><small style="color:#666">* ${escapeHtml(it.notes)}</small>` : ''}
                </td>
                <td style="text-align:center">${it.qty}</td>
                <td style="text-align:right">${rupiah(it.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="receipt-totals">
          <div class="receipt-row">
            <span>Subtotal:</span>
            <span>${rupiah(order.subtotal)}</span>
          </div>
          ${order.discount ? `
            <div class="receipt-row">
              <span>Diskon:</span>
              <span>-${rupiah(order.discount)}</span>
            </div>
          ` : ''}
          ${order.service ? `
            <div class="receipt-row">
              <span>Service Charge (${settings.serviceRate}%):</span>
              <span>${rupiah(order.service)}</span>
            </div>
          ` : ''}
          <div class="receipt-row">
            <span>Pajak Restoran PB1 (${settings.taxRate}%):</span>
            <span>${rupiah(order.tax)}</span>
          </div>
          <div class="receipt-row grand-total">
            <span>TOTAL BAYAR:</span>
            <span>${rupiah(order.total)}</span>
          </div>
          <div class="receipt-row" style="margin-top:6px">
            <span>Metode Bayar:</span>
            <span>${order.paymentMethod.toUpperCase()}</span>
          </div>
          ${order.cashReceived ? `
            <div class="receipt-row">
              <span>Tunai Diterima:</span>
              <span>${rupiah(order.cashReceived)}</span>
            </div>
            <div class="receipt-row">
              <span>Kembalian:</span>
              <span>${rupiah(order.change || 0)}</span>
            </div>
          ` : ''}
        </div>

        <div class="receipt-footer">
          <div class="receipt-barcode">||| | |||| | ||||||| | |||</div>
          <p style="white-space:pre-line">${escapeHtml(settings.receiptFooterMessage)}</p>
        </div>
      </div>
    `;

    $('receiptModal').classList.add('open');
  }

  // POS Kitchen Queue Board
  function renderPosQueue() {
    const orders = DB.getOrders();
    const cols = {
      pending: $('queueColPending'),
      cooking: $('queueColCooking'),
      ready: $('queueColReady'),
      completed: $('queueColCompleted')
    };

    if (!cols.pending) return;

    Object.keys(cols).forEach(k => { cols[k].innerHTML = ''; });

    const counts = { pending: 0, cooking: 0, ready: 0, completed: 0 };

    orders.forEach(o => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
      const targetCol = cols[o.status];
      if (!targetCol) return;

      const card = document.createElement('div');
      card.className = `queue-card ${o.status}`;
      card.innerHTML = `
        <div class="queue-card-top">
          <span>${escapeHtml(o.id)}</span>
          <span>${o.orderType === 'dine_in' ? escapeHtml(o.tableNumber) : 'Takeaway'}</span>
        </div>
        <div class="queue-card-customer">${escapeHtml(o.customerName)}</div>
        <div class="queue-items-text">
          ${o.items.map(it => `<div>• ${it.qty}x ${escapeHtml(it.nama)}</div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700">
          <span>Total:</span>
          <span style="color:var(--vermilion)">${rupiah(o.total)}</span>
        </div>
        <div class="queue-card-actions">
          ${o.status === 'pending' ? `
            <button class="btn-queue-action" data-q-action="cooking" data-q-id="${o.id}">🍳 Masak</button>
            <button class="btn-queue-action" data-q-action="cancel" data-q-id="${o.id}">Batal</button>
          ` : ''}
          ${o.status === 'cooking' ? `
            <button class="btn-queue-action" data-q-action="ready" data-q-id="${o.id}">🛎️ Siap Saji</button>
          ` : ''}
          ${o.status === 'ready' ? `
            <button class="btn-queue-action" data-q-action="pay" data-q-id="${o.id}">💳 Bayar & Selesai</button>
          ` : ''}
          ${o.status === 'completed' ? `
            <button class="btn-queue-action" data-q-action="reprint" data-q-id="${o.id}">🖨️ Cetak Ulang</button>
          ` : ''}
        </div>
      `;
      targetCol.appendChild(card);
    });

    $('queueCountPending').textContent = counts.pending;
    $('queueCountCooking').textContent = counts.cooking;
    $('queueCountReady').textContent = counts.ready;
    $('queueCountCompleted').textContent = counts.completed;

    // Bind queue actions
    $$('[data-q-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.qAction;
        const id = btn.dataset.qId;
        const order = DB.getOrderById(id);
        if (!order) return;

        if (action === 'cooking') {
          DB.updateOrderStatus(id, 'cooking');
          soundFX.orderChime();
          showToast(`Pesanan ${id} mulai dimasak di dapur!`, '🍳');
          renderPosQueue();
        } else if (action === 'ready') {
          DB.updateOrderStatus(id, 'ready');
          soundFX.orderChime();
          showToast(`Pesanan ${id} siap disajikan ke meja!`, '🛎️');
          renderPosQueue();
        } else if (action === 'pay') {
          // Load this order into POS to process payment
          posActiveOrderId = id;
          posCart = order.items.map(it => ({ ...it }));
          posOrderType = order.orderType;
          posSelectedTable = order.tableNumber || 'Meja 01';
          posCustomerName = order.customerName;
          $('posTabTerminal').style.display = 'grid';
          $('posTabQueue').style.display = 'none';
          $$('.pos-subnav-btn').forEach(b => b.classList.toggle('active', b.dataset.postab === 'terminal'));
          renderPosTicket();
          openPaymentModal();
        } else if (action === 'cancel') {
          if (confirm(`Batalkan pesanan ${id}? Stok akan dikembalikan.`)) {
            DB.updateOrderStatus(id, 'cancelled', { restoreStock: true });
            showToast(`Pesanan ${id} dibatalkan.`, '❌');
            renderPosQueue();
            renderPosCatalog();
          }
        } else if (action === 'reprint') {
          renderThermalReceipt(order);
        }
      });
    });
  }

  function renderPosShift() {
    const summary = DB.getShiftSummary('Aoi Tanaka');
    $('shiftCashierName').textContent = summary.cashierName;
    $('shiftDate').textContent = summary.shiftDate;
    $('shiftTxCount').textContent = summary.transactionCount;
    $('shiftTotalSales').textContent = rupiah(summary.totalSales);
    $('shiftCashSales').textContent = rupiah(summary.totalCash);
    $('shiftQrisSales').textContent = rupiah(summary.totalQRIS);
    $('shiftCardSales').textContent = rupiah(summary.totalCard);
    $('shiftStartingFloat').textContent = rupiah(summary.startingFloat);
    $('shiftExpectedDrawer').textContent = rupiah(summary.expectedCashInDrawer);
  }

  // ==========================================================================
  // ADMIN (MANAGEMENT DASHBOARD) IMPLEMENTATION
  // ==========================================================================
  function bindAdminEvents() {
    // Admin Subnav Tabs
    $$('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAdminTab = btn.dataset.admintab;
        $$('.admin-tab-content').forEach(c => c.style.display = 'none');
        $(`adminTab_${currentAdminTab}`).style.display = 'block';
        renderAdminDashboard();
      });
    });

    // Add Product Modal
    $('btnOpenAddProductModal')?.addEventListener('click', () => {
      openProductEditModal(null);
    });

    $('productForm')?.addEventListener('submit', handleProductFormSubmit);

    // Export DB Backup JSON
    $('btnExportDatabase')?.addEventListener('click', () => {
      const jsonStr = DB.exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ichiraku_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Cadangan database berhasil diunduh!', '💾');
    });

    // Import DB JSON
    $('btnImportDatabase')?.addEventListener('click', () => {
      $('dbFileInput').click();
    });

    $('dbFileInput')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          DB.importDatabaseJSON(ev.target.result);
          showToast('Database berhasil dipulihkan!', '✅');
          renderAll();
        } catch (err) {
          alert('Gagal memulihkan database: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Factory Reset
    $('btnFactoryReset')?.addEventListener('click', () => {
      if (confirm('PERINGATAN: Kembalikan seluruh database ke data awal bawaan pabrik (18 menu, transaksi demo, meja)?')) {
        DB.resetToFactorySeed();
        soundFX.beep(400, 0.2);
        showToast('Database berhasil direset ke data awal!', '🔄');
        renderAll();
      }
    });

    // Settings Form
    $('settingsForm')?.addEventListener('submit', e => {
      e.preventDefault();
      DB.saveSettings({
        storeName: $('setStoreName').value.trim(),
        tagline: $('setTagline').value.trim(),
        address: $('setAddress').value.trim(),
        phone: $('setPhone').value.trim(),
        taxRate: Number($('setTaxRate').value) || 10,
        serviceRate: Number($('setServiceRate').value) || 5
      });
      showToast('Pengaturan toko berhasil diperbarui!', '⚙️');
      renderAll();
    });
  }

  function renderAdminDashboard() {
    if (currentAdminTab === 'analytics') {
      renderAdminAnalytics();
    } else if (currentAdminTab === 'products') {
      renderAdminProductsTable();
    } else if (currentAdminTab === 'orders') {
      renderAdminOrdersHistory();
    } else if (currentAdminTab === 'tables') {
      renderAdminTablesFloor();
    } else if (currentAdminTab === 'settings') {
      renderAdminSettings();
    }
  }

  function renderAdminAnalytics() {
    const analytics = DB.getAnalytics();

    $('metricRevenueToday').textContent = rupiah(analytics.revenueToday);
    $('metricRevenueAllTime').textContent = rupiah(analytics.revenueAllTime);
    $('metricOrdersCount').textContent = `${analytics.todayCompletedCount} selesai (${analytics.todayOrdersCount} total)`;
    $('metricAOV').textContent = rupiah(analytics.avgOrderValue);
    $('metricLowStockCount').textContent = `${analytics.lowStock.length} produk`;

    // Sales by Category Bars
    const catList = $('adminCategoryBars');
    if (catList) {
      const maxCatVal = Math.max(...Object.values(analytics.categorySales), 1);
      catList.innerHTML = Object.entries(analytics.categorySales).map(([cat, val]) => {
        const pct = Math.round((val / maxCatVal) * 100);
        return `
          <div class="cat-bar-item">
            <div class="cat-bar-label">
              <span>${escapeHtml(cat)}</span>
              <strong>${rupiah(val)}</strong>
            </div>
            <div class="cat-bar-track">
              <div class="cat-bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Top Selling Dishes
    const topList = $('adminTopDishesList');
    if (topList) {
      topList.innerHTML = analytics.topProducts.map((p, idx) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-family:var(--font-serif);font-size:18px;font-weight:700;color:var(--forest)">#${idx + 1}</span>
            <div>
              <div style="font-weight:600;font-size:12.5px">${escapeHtml(p.nama)}</div>
              <div style="font-size:10px;color:var(--text-tertiary)">${escapeHtml(p.kategori)}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--font-mono);font-weight:700">${p.soldCount || 0} terjual</div>
            <div style="font-size:10.5px;color:var(--text-secondary)">${rupiah((p.soldCount || 0) * p.harga)}</div>
          </div>
        </div>
      `).join('');
    }
  }

  function renderAdminProductsTable() {
    const products = DB.getProducts();
    const tbody = $('adminProductsTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">${escapeHtml(p.emoji || '🍱')}</span>
            <div>
              <strong>${escapeHtml(p.nama)}</strong>
              <div style="font-family:var(--font-jp);font-size:10px;color:var(--sage)">${escapeHtml(p.kanji || '')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(p.kategori)}</td>
        <td style="font-family:var(--font-mono);font-weight:700">${rupiah(p.harga)}</td>
        <td>
          <span class="badge-pill ${p.stok <= 5 ? 'low-stock' : ''}" style="background:var(--bg-subtle)">
            ${p.stok}
          </span>
        </td>
        <td>${p.unggulan ? '<span style="color:var(--vermilion);font-weight:700">★ Chef Signature</span>' : '—'}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-table-action" data-edit-product="${escapeHtml(p.id)}">Edit</button>
            <button class="btn-table-action" data-restock-product="${escapeHtml(p.id)}">+5 Stok</button>
            <button class="btn-table-action danger" data-delete-product="${escapeHtml(p.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Actions
    tbody.querySelectorAll('[data-edit-product]').forEach(b => {
      b.addEventListener('click', () => openProductEditModal(b.dataset.editProduct));
    });

    tbody.querySelectorAll('[data-restock-product]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.restockProduct;
        DB.adjustStock(id, 5);
        showToast('Stok berhasil ditambah +5', '📦');
        renderAdminProductsTable();
      });
    });

    tbody.querySelectorAll('[data-delete-product]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.deleteProduct;
        const p = DB.getProductById(id);
        if (p && confirm(`Hapus menu "${p.nama}" dari katalog?`)) {
          DB.deleteProduct(id);
          showToast(`Menu "${p.nama}" dihapus.`, '🗑️');
          renderAdminProductsTable();
        }
      });
    });
  }

  function openProductEditModal(productId) {
    const isEdit = Boolean(productId);
    $('productFormModalTitle').textContent = isEdit ? 'Edit Menu Masakan' : 'Tambah Menu Baru';
    $('productForm').reset();

    if (isEdit) {
      const p = DB.getProductById(productId);
      if (!p) return;
      $('fProductId').value = p.id;
      $('fProductName').value = p.nama;
      $('fProductKanji').value = p.kanji || '';
      $('fProductCategory').value = p.kategori;
      $('fProductPrice').value = p.harga;
      $('fProductStock').value = p.stok;
      $('fProductDesc').value = p.deskripsi || '';
      $('fProductEmoji').value = p.emoji || '🍱';
      $('fProductTone').value = p.tone || '#ede8dd';
      $('fProductFeatured').checked = Boolean(p.unggulan);
    } else {
      $('fProductId').value = '';
      $('fProductCategory').value = 'Sushi & Sashimi';
      $('fProductEmoji').value = '🍱';
      $('fProductTone').value = '#ede8dd';
    }

    $('productFormModal').classList.add('open');
  }

  function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = $('fProductId').value;
    const productData = {
      id: id || undefined,
      nama: $('fProductName').value.trim(),
      kanji: $('fProductKanji').value.trim(),
      kategori: $('fProductCategory').value,
      harga: Number($('fProductPrice').value),
      stok: Number($('fProductStock').value),
      deskripsi: $('fProductDesc').value.trim(),
      emoji: $('fProductEmoji').value.trim() || '🍱',
      tone: $('fProductTone').value.trim() || '#ede8dd',
      unggulan: $('fProductFeatured').checked
    };

    try {
      DB.saveProduct(productData);
      showToast('Menu berhasil disimpan!', '💾');
      $('productFormModal').classList.remove('open');
      renderAdminProductsTable();
      renderGuestCatalog();
      renderPosCatalog();
    } catch (err) {
      alert(err.message);
    }
  }

  function renderAdminOrdersHistory() {
    const orders = DB.getOrders();
    const tbody = $('adminOrdersTableBody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td style="font-family:var(--font-mono);font-weight:700">${escapeHtml(o.id)}</td>
        <td>${new Date(o.createdAt).toLocaleString('id-ID')}</td>
        <td>
          <strong>${escapeHtml(o.customerName)}</strong><br>
          <small style="color:var(--text-tertiary)">${o.orderType === 'dine_in' ? escapeHtml(o.tableNumber) : 'Takeaway'}</small>
        </td>
        <td>${o.items.length} item</td>
        <td style="font-family:var(--font-mono);font-weight:700">${rupiah(o.total)}</td>
        <td>
          <span class="badge-pill" style="background:var(--bg-subtle)">
            ${(o.paymentMethod || 'unpaid').toUpperCase()}
          </span>
        </td>
        <td>
          <span class="badge-pill" style="background:${o.status === 'completed' ? '#10b981' : (o.status === 'cancelled' ? '#ef4444' : '#f59e0b')};color:#fff">
            ${o.status.toUpperCase()}
          </span>
        </td>
        <td>
          <button class="btn-table-action" data-view-receipt="${escapeHtml(o.id)}">Struk</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-view-receipt]').forEach(b => {
      b.addEventListener('click', () => {
        const order = DB.getOrderById(b.dataset.viewReceipt);
        if (order) renderThermalReceipt(order);
      });
    });
  }

  function renderAdminTablesFloor() {
    const tables = DB.getTables();
    const grid = $('adminTablesGrid');
    if (!grid) return;

    grid.innerHTML = tables.map(t => `
      <div class="table-seat-card ${t.status}">
        <div class="table-seat-head">
          <h4>${escapeHtml(t.name)}</h4>
          <span class="badge-pill" style="font-size:10px">${t.status.toUpperCase()}</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-secondary)">
          Kapasitas: ${t.capacity} Orang · ${escapeHtml(t.section || 'Ruangan')}
        </div>
        ${t.customerName ? `
          <div style="font-size:11px;background:var(--bg-subtle);padding:6px 10px;border-radius:2px;margin:4px 0">
            <strong>${escapeHtml(t.customerName)}</strong>
            ${t.currentOrderId ? `<br><small style="font-family:var(--font-mono)">${escapeHtml(t.currentOrderId)}</small>` : ''}
          </div>
        ` : ''}
        <div style="margin-top:auto;display:flex;gap:6px">
          ${t.status === 'occupied' ? `
            <button class="btn-table-action danger" style="flex:1" data-free-table="${escapeHtml(t.name)}">Kosongkan Meja</button>
          ` : ''}
          ${t.status === 'available' ? `
            <button class="btn-table-action" style="flex:1" data-reserve-table="${escapeHtml(t.name)}">Set Reservasi</button>
          ` : ''}
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('[data-free-table]').forEach(b => {
      b.addEventListener('click', () => {
        const name = b.dataset.freeTable;
        DB.freeTable(name);
        showToast(`${name} sekarang tersedia.`, '🧹');
        renderAdminTablesFloor();
      });
    });

    grid.querySelectorAll('[data-reserve-table]').forEach(b => {
      b.addEventListener('click', () => {
        const name = b.dataset.reserveTable;
        const resName = prompt(`Nama tamu untuk reservasi ${name}:`, 'Tamu Reservasi');
        if (resName) {
          DB.setTableReserved(name, resName, 'Hari ini');
          showToast(`Reservasi ${name} tercatat.`, '📅');
          renderAdminTablesFloor();
        }
      });
    });
  }

  function renderAdminSettings() {
    const settings = DB.getSettings();
    $('setStoreName').value = settings.storeName || '';
    $('setTagline').value = settings.tagline || '';
    $('setAddress').value = settings.address || '';
    $('setPhone').value = settings.phone || '';
    $('setTaxRate').value = settings.taxRate || 10;
    $('setServiceRate').value = settings.serviceRate || 5;
  }

  // ==========================================================================
  // GLOBAL MODALS & UTILITY CONTROLS
  // ==========================================================================
  function bindGlobalModals() {
    // PIN Modal Form
    $('pinModalForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const role = $('pinModalRole').value;
      const pin = $('pinModalInput').value.trim();
      const expected = role === 'admin' ? '1234' : '1111';

      if (pin === expected) {
        $('pinModal').classList.remove('open');
        switchRole(role);
      } else {
        alert(`PIN salah! Gunakan PIN "${expected}" untuk demo.`);
      }
    });

    // Bypass / Direct Login for Evaluation Convenience
    $('btnBypassPin')?.addEventListener('click', () => {
      const role = $('pinModalRole').value;
      $('pinModal').classList.remove('open');
      switchRole(role);
    });

    // Close Modals on click outside or close buttons
    $$('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });

    $$('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    // Thermal Receipt Actions
    $('btnPrintReceipt')?.addEventListener('click', () => {
      window.print();
    });

    $('btnCopyReceiptText')?.addEventListener('click', () => {
      const receiptText = $('thermalReceiptContainer')?.innerText || '';
      navigator.clipboard.writeText(receiptText).then(() => {
        showToast('Teks struk disalin ke papan klip!', '📋');
      });
    });

    // Detail Modal Add to Cart
    $('btnModalAddToCart')?.addEventListener('click', () => {
      if (!selectedProductForModal) return;
      const qty = Math.max(1, Number($('modalProductQty').value) || 1);
      const notes = $('modalProductNotes').value.trim();
      DB.addToCart(selectedProductForModal.id, qty, notes);
      soundFX.beep(650, 0.08);
      showToast(`${qty}x ${selectedProductForModal.nama} ditambahkan!`, '🍱');
      $('productDetailModal').classList.remove('open');
      renderGuestCart();
    });

    $('btnModalQtyMinus')?.addEventListener('click', () => {
      const input = $('modalProductQty');
      input.value = Math.max(1, (Number(input.value) || 1) - 1);
    });

    $('btnModalQtyPlus')?.addEventListener('click', () => {
      const input = $('modalProductQty');
      input.value = (Number(input.value) || 1) + 1;
    });
  }

  function openRoleModal() {
    $('roleModal').classList.add('open');
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    switchRole,
    renderAll,
    showToast
  };
})();
