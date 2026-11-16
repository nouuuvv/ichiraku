// ICHIRAKU JAPANESE KITCHEN — STORAGE & REPOSITORY LAYER
// High-reliability LocalStorage database engine with auto-seeding, stock tracking, and analytics

window.IchirakuStore = (function () {
  'use strict';

  const STORAGE_PREFIX = 'ichiraku_v2_';
  const KEYS = {
    PRODUCTS: STORAGE_PREFIX + 'products',
    ORDERS: STORAGE_PREFIX + 'orders',
    TABLES: STORAGE_PREFIX + 'tables',
    SETTINGS: STORAGE_PREFIX + 'settings',
    ROLE: STORAGE_PREFIX + 'role',
    CART: STORAGE_PREFIX + 'cart',
    GUEST_ORDER: STORAGE_PREFIX + 'guest_order_id'
  };

  const seed = window.IchirakuSeed;

  // Safe JSON operations
  function getItem(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== null ? parsed : fallback;
    } catch (e) {
      console.warn(`[IchirakuStore] Failed to read ${key}:`, e);
      return fallback;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[IchirakuStore] Failed to write ${key}:`, e);
      return false;
    }
  }

  // Auto-init on script load
  function init() {
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      setItem(KEYS.PRODUCTS, seed.PRODUCTS);
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      setItem(KEYS.ORDERS, seed.ORDERS);
    }
    if (!localStorage.getItem(KEYS.TABLES)) {
      setItem(KEYS.TABLES, seed.TABLES);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      setItem(KEYS.SETTINGS, seed.SETTINGS);
    }
    if (!localStorage.getItem(KEYS.ROLE)) {
      localStorage.setItem(KEYS.ROLE, 'guest');
    }
    if (!localStorage.getItem(KEYS.CART)) {
      setItem(KEYS.CART, []);
    }
  }

  init();

  // ==========================================
  // PRODUCT CATALOG REPOSITORY
  // ==========================================
  function getProducts() {
    return getItem(KEYS.PRODUCTS, seed.PRODUCTS);
  }

  function getProductById(id) {
    const list = getProducts();
    return list.find(p => p.id === id) || null;
  }

  function saveProduct(productData) {
    const list = getProducts();
    const id = productData.id || `prod-custom-${Date.now()}`;
    const cleanProduct = {
      id,
      nama: String(productData.nama || '').trim(),
      kanji: String(productData.kanji || '').trim() || '特選',
      kategori: String(productData.kategori || 'Sushi & Sashimi'),
      harga: Math.max(0, Number(productData.harga) || 0),
      stok: Math.max(0, Math.floor(Number(productData.stok) || 0)),
      deskripsi: String(productData.deskripsi || '').trim(),
      allergens: Array.isArray(productData.allergens) ? productData.allergens : [],
      dietary: Array.isArray(productData.dietary) ? productData.dietary : [],
      unggulan: Boolean(productData.unggulan),
      emoji: productData.emoji || '🍱',
      tone: productData.tone || '#ede8dd',
      imageUrl: String(productData.imageUrl || '').trim(),
      soldCount: Number(productData.soldCount || 0),
      prepTime: productData.prepTime || '8-10 mins'
    };

    if (!cleanProduct.nama) {
      throw new Error('Nama produk tidak boleh kosong.');
    }

    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = cleanProduct;
    } else {
      list.unshift(cleanProduct);
    }

    setItem(KEYS.PRODUCTS, list);
    return cleanProduct;
  }

  function deleteProduct(id) {
    let list = getProducts();
    const beforeLen = list.length;
    list = list.filter(p => p.id !== id);
    if (list.length !== beforeLen) {
      setItem(KEYS.PRODUCTS, list);
      return true;
    }
    return false;
  }

  function adjustStock(id, delta) {
    const list = getProducts();
    const product = list.find(p => p.id === id);
    if (product) {
      product.stok = Math.max(0, product.stok + delta);
      if (delta < 0) {
        product.soldCount = (product.soldCount || 0) + Math.abs(delta);
      }
      setItem(KEYS.PRODUCTS, list);
      return product.stok;
    }
    return null;
  }

  // ==========================================
  // ORDERS REPOSITORY
  // ==========================================
  function getOrders() {
    return getItem(KEYS.ORDERS, seed.ORDERS);
  }

  function getOrderById(id) {
    const list = getOrders();
    return list.find(o => o.id === id) || null;
  }

  function createOrder(orderPayload) {
    const orders = getOrders();
    const settings = getSettings();

    // Generate unique order number & ID
    const highestNum = orders.reduce((max, o) => Math.max(max, o.orderNumber || 1000), 1000);
    const orderNumber = highestNum + 1;
    const orderId = `ICH-2026-${orderNumber}`;

    const items = (orderPayload.items || []).map(item => ({
      id: item.id,
      nama: item.nama,
      harga: Number(item.harga),
      qty: Math.max(1, Number(item.qty)),
      notes: String(item.notes || ''),
      total: Number(item.harga) * Math.max(1, Number(item.qty))
    }));

    const subtotal = items.reduce((sum, it) => sum + it.total, 0);
    const discount = Math.max(0, Number(orderPayload.discount || 0));
    const discountedSubtotal = Math.max(0, subtotal - discount);

    const serviceRate = orderPayload.orderType === 'dine_in' ? (settings.serviceRate || 5) : 0;
    const service = Math.round(discountedSubtotal * (serviceRate / 100));

    const taxRate = settings.taxRate || 10;
    const tax = Math.round((discountedSubtotal + service) * (taxRate / 100));

    const total = discountedSubtotal + service + tax;

    const newOrder = {
      id: orderId,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName: String(orderPayload.customerName || 'Tamu Ichiraku').trim(),
      orderType: orderPayload.orderType === 'takeaway' ? 'takeaway' : 'dine_in',
      tableNumber: orderPayload.orderType === 'dine_in' ? (orderPayload.tableNumber || 'Meja 01') : null,
      items,
      subtotal,
      service,
      tax,
      discount,
      total,
      paymentMethod: orderPayload.paymentMethod || 'unpaid',
      cashReceived: orderPayload.cashReceived ? Number(orderPayload.cashReceived) : null,
      change: orderPayload.change !== null && orderPayload.change !== undefined ? Number(orderPayload.change) : null,
      status: orderPayload.status || 'pending',
      source: orderPayload.source || 'cashier_pos',
      cashierName: orderPayload.cashierName || 'Aoi Tanaka'
    };

    // Auto deduct inventory stock
    items.forEach(item => {
      adjustStock(item.id, -item.qty);
    });

    // Update table occupation if dine in
    if (newOrder.orderType === 'dine_in' && newOrder.tableNumber) {
      occupyTable(newOrder.tableNumber, newOrder.customerName, newOrder.id);
    }

    orders.unshift(newOrder);
    setItem(KEYS.ORDERS, orders);

    return newOrder;
  }

  function updateOrderStatus(orderId, newStatus, additionalData = {}) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (additionalData.paymentMethod) order.paymentMethod = additionalData.paymentMethod;
    if (additionalData.cashReceived !== undefined) order.cashReceived = additionalData.cashReceived;
    if (additionalData.change !== undefined) order.change = additionalData.change;
    if (additionalData.cashierName) order.cashierName = additionalData.cashierName;

    // If order is completed or cancelled, free the table
    if ((newStatus === 'completed' || newStatus === 'cancelled') && order.tableNumber) {
      freeTable(order.tableNumber);
    }

    // If cancelled, restore stock
    if (newStatus === 'cancelled' && additionalData.restoreStock !== false) {
      order.items.forEach(item => {
        adjustStock(item.id, item.qty);
      });
    }

    setItem(KEYS.ORDERS, orders);
    return order;
  }

  function payAndCompleteOrder(orderId, paymentMethod, cashReceived = 0, change = 0, cashierName = 'Aoi Tanaka') {
    return updateOrderStatus(orderId, 'completed', {
      paymentMethod,
      cashReceived,
      change,
      cashierName
    });
  }

  // ==========================================
  // TABLES REPOSITORY
  // ==========================================
  function getTables() {
    return getItem(KEYS.TABLES, seed.TABLES);
  }

  function getTableByName(name) {
    const list = getTables();
    return list.find(t => t.name === name) || null;
  }

  function occupyTable(tableName, customerName, orderId) {
    const tables = getTables();
    const table = tables.find(t => t.name === tableName);
    if (table) {
      table.status = 'occupied';
      table.customerName = customerName;
      table.currentOrderId = orderId;
      setItem(KEYS.TABLES, tables);
    }
  }

  function freeTable(tableName) {
    const tables = getTables();
    const table = tables.find(t => t.name === tableName);
    if (table) {
      table.status = 'available';
      table.customerName = null;
      table.currentOrderId = null;
      setItem(KEYS.TABLES, tables);
    }
  }

  function setTableReserved(tableName, customerName, reservedAt) {
    const tables = getTables();
    const table = tables.find(t => t.name === tableName);
    if (table) {
      table.status = 'reserved';
      table.customerName = customerName;
      table.reservedAt = reservedAt;
      setItem(KEYS.TABLES, tables);
    }
  }

  // ==========================================
  // SETTINGS REPOSITORY
  // ==========================================
  function getSettings() {
    return getItem(KEYS.SETTINGS, seed.SETTINGS);
  }

  function saveSettings(newSettings) {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    setItem(KEYS.SETTINGS, updated);
    return updated;
  }

  // ==========================================
  // ROLE & AUTH
  // ==========================================
  function getCurrentRole() {
    return localStorage.getItem(KEYS.ROLE) || 'guest';
  }

  function setCurrentRole(role) {
    const valid = ['admin', 'cashier', 'guest'];
    const r = valid.includes(role) ? role : 'guest';
    localStorage.setItem(KEYS.ROLE, r);
    return r;
  }

  function getUserInfo(role) {
    return seed.USERS[role] || seed.USERS.guest;
  }

  // ==========================================
  // GUEST CART IN LOCAL STORAGE
  // ==========================================
  function getCart() {
    return getItem(KEYS.CART, []);
  }

  function saveCart(cartItems) {
    setItem(KEYS.CART, cartItems);
    return cartItems;
  }

  function addToCart(productId, qty = 1, notes = '') {
    const cart = getCart();
    const product = getProductById(productId);
    if (!product) return cart;

    const existingIdx = cart.findIndex(it => it.id === productId && (it.notes || '') === (notes || ''));
    if (existingIdx >= 0) {
      cart[existingIdx].qty += qty;
    } else {
      cart.push({
        id: product.id,
        nama: product.nama,
        kanji: product.kanji,
        harga: product.harga,
        emoji: product.emoji,
        tone: product.tone,
        qty: Math.max(1, qty),
        notes: notes || ''
      });
    }
    saveCart(cart);
    return cart;
  }

  function updateCartQty(index, qty) {
    const cart = getCart();
    if (cart[index]) {
      if (qty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].qty = qty;
      }
      saveCart(cart);
    }
    return cart;
  }

  function removeFromCart(index) {
    const cart = getCart();
    if (cart[index]) {
      cart.splice(index, 1);
      saveCart(cart);
    }
    return cart;
  }

  function clearCart() {
    saveCart([]);
    return [];
  }

  // Guest active order tracking
  function setGuestActiveOrder(orderId) {
    if (orderId) {
      localStorage.setItem(KEYS.GUEST_ORDER, orderId);
    } else {
      localStorage.removeItem(KEYS.GUEST_ORDER);
    }
  }

  function getGuestActiveOrder() {
    const id = localStorage.getItem(KEYS.GUEST_ORDER);
    if (!id) return null;
    return getOrderById(id);
  }

  // ==========================================
  // ANALYTICS & EXECUTIVE KPI REPORTS
  // ==========================================
  function getAnalytics() {
    const orders = getOrders();
    const products = getProducts();

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === todayStr);
    const completedOrders = orders.filter(o => o.status === 'completed');
    const todayCompleted = todayOrders.filter(o => o.status === 'completed');

    const revenueAllTime = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const revenueToday = todayCompleted.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = todayCompleted.length ? Math.round(revenueToday / todayCompleted.length) : (completedOrders.length ? Math.round(revenueAllTime / completedOrders.length) : 0);

    // Sales by Category
    const categorySales = {};
    seed.CATEGORIES.forEach(c => { categorySales[c] = 0; });
    completedOrders.forEach(o => {
      (o.items || []).forEach(it => {
        const p = products.find(x => x.id === it.id);
        const cat = p ? p.kategori : 'Other';
        categorySales[cat] = (categorySales[cat] || 0) + it.total;
      });
    });

    // Top Selling Products
    const sortedProducts = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    const topProducts = sortedProducts.slice(0, 5);

    // Low stock items
    const lowStock = products.filter(p => p.stok <= 5);

    // Payment methods
    const paymentBreakdown = { cash: 0, qris: 0, card: 0, transfer: 0 };
    completedOrders.forEach(o => {
      const pm = (o.paymentMethod || 'cash').toLowerCase();
      if (paymentBreakdown[pm] !== undefined) {
        paymentBreakdown[pm] += o.total;
      } else {
        paymentBreakdown.cash += o.total;
      }
    });

    return {
      revenueToday,
      revenueAllTime,
      todayOrdersCount: todayOrders.length,
      todayCompletedCount: todayCompleted.length,
      allTimeOrdersCount: orders.length,
      avgOrderValue,
      categorySales,
      topProducts,
      lowStock,
      paymentBreakdown,
      activeOrdersCount: orders.filter(o => o.status === 'pending' || o.status === 'cooking' || o.status === 'ready').length
    };
  }

  // Shift report for cashier
  function getShiftSummary(cashierName = 'Aoi Tanaka') {
    const orders = getOrders();
    const todayStr = new Date().toISOString().slice(0, 10);
    const shiftOrders = orders.filter(o =>
      o.createdAt.slice(0, 10) === todayStr &&
      (o.cashierName === cashierName || !o.cashierName) &&
      o.status === 'completed'
    );

    let totalCash = 0;
    let totalQRIS = 0;
    let totalCard = 0;
    let itemsSold = 0;

    shiftOrders.forEach(o => {
      const pm = (o.paymentMethod || '').toLowerCase();
      if (pm === 'cash') totalCash += o.total;
      else if (pm === 'qris') totalQRIS += o.total;
      else if (pm === 'card' || pm === 'transfer') totalCard += o.total;

      (o.items || []).forEach(it => {
        itemsSold += it.qty;
      });
    });

    return {
      cashierName,
      shiftDate: todayStr,
      transactionCount: shiftOrders.length,
      totalSales: totalCash + totalQRIS + totalCard,
      totalCash,
      totalQRIS,
      totalCard,
      itemsSold,
      startingFloat: 250000, // Rp 250k initial cash drawer float
      expectedCashInDrawer: 250000 + totalCash
    };
  }

  // ==========================================
  // BACKUP, RESTORE & FACTORY RESET
  // ==========================================
  function exportDatabaseJSON() {
    const snapshot = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      products: getProducts(),
      orders: getOrders(),
      tables: getTables(),
      settings: getSettings()
    };
    return JSON.stringify(snapshot, null, 2);
  }

  function importDatabaseJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Format cadangan JSON tidak valid: data produk hilang.');
      }
      setItem(KEYS.PRODUCTS, data.products);
      if (Array.isArray(data.orders)) setItem(KEYS.ORDERS, data.orders);
      if (Array.isArray(data.tables)) setItem(KEYS.TABLES, data.tables);
      if (data.settings && typeof data.settings === 'object') setItem(KEYS.SETTINGS, data.settings);
      return true;
    } catch (e) {
      console.error('[IchirakuStore] Import failed:', e);
      throw e;
    }
  }

  function resetToFactorySeed() {
    setItem(KEYS.PRODUCTS, seed.PRODUCTS);
    setItem(KEYS.ORDERS, seed.ORDERS);
    setItem(KEYS.TABLES, seed.TABLES);
    setItem(KEYS.SETTINGS, seed.SETTINGS);
    setItem(KEYS.CART, []);
    localStorage.removeItem(KEYS.GUEST_ORDER);
    return true;
  }

  return {
    getProducts,
    getProductById,
    saveProduct,
    deleteProduct,
    adjustStock,
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    payAndCompleteOrder,
    getTables,
    getTableByName,
    occupyTable,
    freeTable,
    setTableReserved,
    getSettings,
    saveSettings,
    getCurrentRole,
    setCurrentRole,
    getUserInfo,
    getCart,
    saveCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    setGuestActiveOrder,
    getGuestActiveOrder,
    getAnalytics,
    getShiftSummary,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToFactorySeed
  };
})();
