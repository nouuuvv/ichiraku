// LOCALSTORAGE DATABASE ENGINE (REACT SERVICE)

import { INITIAL_PRODUCTS, INITIAL_TABLES, INITIAL_ORDERS, INITIAL_SETTINGS, CATEGORIES } from '../data/mockData';

const PREFIX = 'ichiraku_v2_';
const KEYS = {
  PRODUCTS: PREFIX + 'products',
  ORDERS: PREFIX + 'orders',
  TABLES: PREFIX + 'tables',
  SETTINGS: PREFIX + 'settings',
  CART: PREFIX + 'cart',
  ROLE: PREFIX + 'role',
  GUEST_ORDER: PREFIX + 'guest_order_id'
};

function readItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null ? parsed : fallback;
  } catch (e) {
    console.warn(`[storage] failed to read ${key}:`, e);
    return fallback;
  }
}

function writeItem(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.error(`[storage] failed to write ${key}:`, e);
    return false;
  }
}

export function initStorage() {
  if (!localStorage.getItem(KEYS.PRODUCTS)) writeItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (!localStorage.getItem(KEYS.ORDERS)) writeItem(KEYS.ORDERS, INITIAL_ORDERS);
  if (!localStorage.getItem(KEYS.TABLES)) writeItem(KEYS.TABLES, INITIAL_TABLES);
  if (!localStorage.getItem(KEYS.SETTINGS)) writeItem(KEYS.SETTINGS, INITIAL_SETTINGS);
  if (!localStorage.getItem(KEYS.CART)) writeItem(KEYS.CART, []);
  if (!localStorage.getItem(KEYS.ROLE)) localStorage.setItem(KEYS.ROLE, 'guest');
}

// Auto init
initStorage();

export function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(num) || 0);
}

// Products
export function getProducts() {
  return readItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function getProductById(id) {
  return getProducts().find(p => p.id === id) || null;
}

export function saveProduct(product) {
  const list = getProducts();
  const id = product.id || `prod-custom-${Date.now()}`;
  const clean = {
    ...product,
    id,
    nama: String(product.nama || '').trim(),
    kanji: String(product.kanji || '一楽').trim(),
    kategori: product.kategori || 'Sushi & Sashimi',
    harga: Math.max(0, Number(product.harga) || 0),
    stok: Math.max(0, Math.floor(Number(product.stok) || 0)),
    deskripsi: String(product.deskripsi || '').trim(),
    emoji: product.emoji || '🍱',
    tone: product.tone || '#ede8dd',
    unggulan: Boolean(product.unggulan),
    soldCount: Number(product.soldCount || 0)
  };

  const idx = list.findIndex(p => p.id === id);
  if (idx >= 0) list[idx] = clean;
  else list.unshift(clean);

  writeItem(KEYS.PRODUCTS, list);
  return clean;
}

export function deleteProduct(id) {
  const list = getProducts().filter(p => p.id !== id);
  writeItem(KEYS.PRODUCTS, list);
  return list;
}

export function adjustStock(id, delta) {
  const list = getProducts();
  const p = list.find(x => x.id === id);
  if (p) {
    p.stok = Math.max(0, p.stok + delta);
    if (delta < 0) p.soldCount = (p.soldCount || 0) + Math.abs(delta);
    writeItem(KEYS.PRODUCTS, list);
  }
  return list;
}

// Orders
export function getOrders() {
  return readItem(KEYS.ORDERS, INITIAL_ORDERS);
}

export function getOrderById(id) {
  return getOrders().find(o => o.id === id) || null;
}

export function createOrder(payload) {
  const orders = getOrders();
  const settings = getSettings();

  const maxNum = orders.reduce((m, o) => Math.max(m, o.orderNumber || 1000), 1000);
  const orderNumber = maxNum + 1;
  const orderId = `ICH-2026-${orderNumber}`;

  const items = (payload.items || []).map(it => ({
    id: it.id,
    nama: it.nama,
    harga: Number(it.harga),
    qty: Math.max(1, Number(it.qty)),
    notes: String(it.notes || ''),
    total: Number(it.harga) * Math.max(1, Number(it.qty))
  }));

  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const discount = Math.max(0, Number(payload.discount || 0));
  const discounted = Math.max(0, subtotal - discount);

  const serviceRate = payload.orderType === 'dine_in' ? (settings.serviceRate || 5) : 0;
  const service = Math.round(discounted * (serviceRate / 100));

  const taxRate = settings.taxRate || 10;
  const tax = Math.round((discounted + service) * (taxRate / 100));
  const total = discounted + service + tax;

  const newOrder = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    customerName: String(payload.customerName || 'Tamu Ichiraku').trim(),
    orderType: payload.orderType === 'takeaway' ? 'takeaway' : 'dine_in',
    tableNumber: payload.orderType === 'dine_in' ? (payload.tableNumber || 'Meja 01') : null,
    items,
    subtotal,
    service,
    tax,
    discount,
    total,
    paymentMethod: payload.paymentMethod || 'unpaid',
    cashReceived: payload.cashReceived ? Number(payload.cashReceived) : null,
    change: payload.change !== null && payload.change !== undefined ? Number(payload.change) : null,
    status: payload.status || 'pending',
    source: payload.source || 'guest_self_order',
    cashierName: payload.cashierName || 'Aoi Tanaka'
  };

  // Deduct inventory stock
  items.forEach(it => adjustStock(it.id, -it.qty));

  // Occupy table if dine-in
  if (newOrder.orderType === 'dine_in' && newOrder.tableNumber) {
    occupyTable(newOrder.tableNumber, newOrder.customerName, newOrder.id);
  }

  orders.unshift(newOrder);
  writeItem(KEYS.ORDERS, orders);
  return newOrder;
}

export function updateOrderStatus(orderId, newStatus, additional = {}) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  order.status = newStatus;
  if (additional.paymentMethod) order.paymentMethod = additional.paymentMethod;
  if (additional.cashReceived !== undefined) order.cashReceived = additional.cashReceived;
  if (additional.change !== undefined) order.change = additional.change;
  if (additional.cashierName) order.cashierName = additional.cashierName;

  if ((newStatus === 'completed' || newStatus === 'cancelled') && order.tableNumber) {
    freeTable(order.tableNumber);
  }

  if (newStatus === 'cancelled' && additional.restoreStock !== false) {
    order.items.forEach(it => adjustStock(it.id, it.qty));
  }

  writeItem(KEYS.ORDERS, orders);
  return order;
}

export function payAndCompleteOrder(orderId, paymentMethod, cashReceived = 0, change = 0, cashierName = 'Aoi Tanaka') {
  return updateOrderStatus(orderId, 'completed', {
    paymentMethod,
    cashReceived,
    change,
    cashierName
  });
}

// Tables
export function getTables() {
  return readItem(KEYS.TABLES, INITIAL_TABLES);
}

export function occupyTable(tableName, customerName, orderId) {
  const tables = getTables();
  const t = tables.find(x => x.name === tableName);
  if (t) {
    t.status = 'occupied';
    t.customerName = customerName;
    t.currentOrderId = orderId;
    writeItem(KEYS.TABLES, tables);
  }
}

export function freeTable(tableName) {
  const tables = getTables();
  const t = tables.find(x => x.name === tableName);
  if (t) {
    t.status = 'available';
    t.customerName = null;
    t.currentOrderId = null;
    writeItem(KEYS.TABLES, tables);
  }
}

export function setTableReserved(tableName, customerName, reservedAt) {
  const tables = getTables();
  const t = tables.find(x => x.name === tableName);
  if (t) {
    t.status = 'reserved';
    t.customerName = customerName;
    t.reservedAt = reservedAt;
    writeItem(KEYS.TABLES, tables);
  }
}

// Settings
export function getSettings() {
  return readItem(KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSettings(settings) {
  const current = getSettings();
  const updated = { ...current, ...settings };
  writeItem(KEYS.SETTINGS, updated);
  return updated;
}

// Role
export function getStoredRole() {
  return localStorage.getItem(KEYS.ROLE) || 'guest';
}

export function setStoredRole(role) {
  localStorage.setItem(KEYS.ROLE, role);
  return role;
}

// Cart
export function getCart() {
  return readItem(KEYS.CART, []);
}

export function saveCart(items) {
  writeItem(KEYS.CART, items);
  return items;
}

export function addToCart(productId, qty = 1, notes = '') {
  const cart = getCart();
  const p = getProductById(productId);
  if (!p) return cart;

  const existingIdx = cart.findIndex(it => it.id === productId && (it.notes || '') === (notes || ''));
  if (existingIdx >= 0) {
    cart[existingIdx].qty += qty;
  } else {
    cart.push({
      id: p.id,
      nama: p.nama,
      kanji: p.kanji,
      harga: p.harga,
      emoji: p.emoji,
      tone: p.tone,
      qty: Math.max(1, qty),
      notes: notes || ''
    });
  }
  saveCart(cart);
  return cart;
}

export function updateCartQty(index, qty) {
  const cart = getCart();
  if (cart[index]) {
    if (qty <= 0) cart.splice(index, 1);
    else cart[index].qty = qty;
    saveCart(cart);
  }
  return cart;
}

export function removeFromCart(index) {
  const cart = getCart();
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart(cart);
  }
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}

export function setGuestActiveOrder(orderId) {
  if (orderId) localStorage.setItem(KEYS.GUEST_ORDER, orderId);
  else localStorage.removeItem(KEYS.GUEST_ORDER);
}

export function getGuestActiveOrderId() {
  return localStorage.getItem(KEYS.GUEST_ORDER) || null;
}

// Analytics
export function getAnalytics() {
  const orders = getOrders();
  const products = getProducts();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === todayStr);
  const completedOrders = orders.filter(o => o.status === 'completed');
  const todayCompleted = todayOrders.filter(o => o.status === 'completed');

  const revenueAllTime = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueToday = todayCompleted.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = todayCompleted.length
    ? Math.round(revenueToday / todayCompleted.length)
    : (completedOrders.length ? Math.round(revenueAllTime / completedOrders.length) : 0);

  const categorySales = {};
  CATEGORIES.filter(c => c !== 'All').forEach(c => { categorySales[c] = 0; });
  completedOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const p = products.find(x => x.id === it.id);
      const cat = p ? p.kategori : 'Other';
      if (categorySales[cat] !== undefined) categorySales[cat] += it.total;
    });
  });

  const sortedProducts = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  const topProducts = sortedProducts.slice(0, 5);
  const lowStock = products.filter(p => p.stok <= 5);

  return {
    revenueToday,
    revenueAllTime,
    todayOrdersCount: todayOrders.length,
    todayCompletedCount: todayCompleted.length,
    allTimeOrdersCount: orders.length,
    avgOrderValue,
    categorySales,
    topProducts,
    lowStock
  };
}

export function getShiftSummary(cashierName = 'Aoi Tanaka') {
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

    (o.items || []).forEach(it => { itemsSold += it.qty; });
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
    startingFloat: 250000,
    expectedCashInDrawer: 250000 + totalCash
  };
}

export function exportDatabaseJSON() {
  const snapshot = {
    version: '2.0-react',
    exportedAt: new Date().toISOString(),
    products: getProducts(),
    orders: getOrders(),
    tables: getTables(),
    settings: getSettings()
  };
  return JSON.stringify(snapshot, null, 2);
}

export function importDatabaseJSON(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (!data.products || !Array.isArray(data.products)) throw new Error('Data tidak valid: produk tidak ditemukan');
  writeItem(KEYS.PRODUCTS, data.products);
  if (Array.isArray(data.orders)) writeItem(KEYS.ORDERS, data.orders);
  if (Array.isArray(data.tables)) writeItem(KEYS.TABLES, data.tables);
  if (data.settings) writeItem(KEYS.SETTINGS, data.settings);
  return true;
}

export function resetToFactorySeed() {
  writeItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  writeItem(KEYS.ORDERS, INITIAL_ORDERS);
  writeItem(KEYS.TABLES, INITIAL_TABLES);
  writeItem(KEYS.SETTINGS, INITIAL_SETTINGS);
  writeItem(KEYS.CART, []);
  localStorage.removeItem(KEYS.GUEST_ORDER);
  return true;
}
