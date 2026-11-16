// ICHIRAKU JAPANESE KITCHEN — SEED & DUMMY DATABASE
// Production-grade client database seed for localStorage

window.IchirakuSeed = (function () {
  'use strict';

  const CATEGORIES = [
    'Sushi & Sashimi',
    'Ramen & Noodles',
    'Donburi & Rice',
    'Bites & Sides',
    'Beverages & Tea',
    'Desserts'
  ];

  const PRODUCTS = [
    {
      id: 'prod-sushi-01',
      nama: 'Salmon Nigiri Prime',
      kanji: '特上サーモン握り',
      kategori: 'Sushi & Sashimi',
      harga: 34000,
      stok: 24,
      deskripsi: 'Air-flown Norwegian salmon glazed with house-aged nikiri soy sauce over warm seasoned Akazu sushi rice.',
      allergens: ['Fish', 'Soy', 'Gluten'],
      dietary: ['Chef Signature', 'Halal-Friendly'],
      unggulan: true,
      emoji: '🍣',
      tone: '#f4e0d7',
      soldCount: 86,
      prepTime: '8-10 mins'
    },
    {
      id: 'prod-sushi-02',
      nama: 'Hon-Maguro Akami Sashimi',
      kanji: '本マグロ赤身刺身',
      kategori: 'Sushi & Sashimi',
      harga: 68000,
      stok: 14,
      deskripsi: 'Thick cut Pacific bluefin tuna loin, freshly grated Shizuoka wasabi root, micro shiso leaves.',
      allergens: ['Fish'],
      dietary: ['Chef Signature', 'High Protein'],
      unggulan: true,
      emoji: '🐟',
      tone: '#e8d4d4',
      soldCount: 52,
      prepTime: '6-8 mins'
    },
    {
      id: 'prod-sushi-03',
      nama: 'Aburi Wagyu Beef Roll',
      kanji: '炙り和牛カルビ巻',
      kategori: 'Sushi & Sashimi',
      harga: 78000,
      stok: 12,
      deskripsi: 'A5 Miyazaki Wagyu beef torched with garlic truffle butter, crispy asparagus, sweet tare glaze.',
      allergens: ['Beef', 'Soy', 'Dairy', 'Gluten'],
      dietary: ['Chef Signature'],
      unggulan: true,
      emoji: '🍱',
      tone: '#e6ded4',
      soldCount: 64,
      prepTime: '12-15 mins'
    },
    {
      id: 'prod-sushi-04',
      nama: 'Spicy Salmon Crunch Roll',
      kanji: 'スパイシーサーモン巻',
      kategori: 'Sushi & Sashimi',
      harga: 42000,
      stok: 20,
      deskripsi: 'Chopped fresh salmon with sriracha Kewpie mayo, cucumber, topped with crunchy tempura flakes and tobiko.',
      allergens: ['Fish', 'Eggs', 'Soy', 'Gluten'],
      dietary: ['Spicy'],
      unggulan: false,
      emoji: '🍙',
      tone: '#f3e6db',
      soldCount: 71,
      prepTime: '10-12 mins'
    },
    {
      id: 'prod-sushi-05',
      nama: 'Ebi Tempura Truffle Roll',
      kanji: '海老天ぷらトリュフ巻',
      kategori: 'Sushi & Sashimi',
      harga: 46000,
      stok: 16,
      deskripsi: 'Crispy tiger prawn tempura wrapped with avocado, drizzled with black truffle emulsion and sesame.',
      allergens: ['Crustaceans', 'Gluten', 'Eggs', 'Soy'],
      dietary: ['Popular'],
      unggulan: false,
      emoji: '🍤',
      tone: '#ede8dc',
      soldCount: 49,
      prepTime: '10-12 mins'
    },
    {
      id: 'prod-ramen-01',
      nama: 'Ichiraku Special Tori Paitan Ramen',
      kanji: '一楽特製鶏白湯ラーメン',
      kategori: 'Ramen & Noodles',
      harga: 56000,
      stok: 18,
      deskripsi: '12-hour slow simmered rich collagen chicken broth, handmade wavy noodles, sous-vide chicken chashu, and ajitsuke tamago.',
      allergens: ['Gluten', 'Eggs', 'Soy'],
      dietary: ['Chef Signature', 'Halal-Friendly'],
      unggulan: true,
      emoji: '🍜',
      tone: '#e3ebd8',
      soldCount: 118,
      prepTime: '12-14 mins'
    },
    {
      id: 'prod-ramen-02',
      nama: 'Black Garlic Shoyu Ramen',
      kanji: '黒マー油醤油ラーメン',
      kategori: 'Ramen & Noodles',
      harga: 52000,
      stok: 15,
      deskripsi: 'Charred Mayu (black garlic oil) paired with robust dashi-shoyu broth, menma bamboo shoots, nori, and roasted pork/chicken.',
      allergens: ['Gluten', 'Soy', 'Eggs'],
      dietary: ['Rich Flavor'],
      unggulan: false,
      emoji: '🥢',
      tone: '#e0dfd5',
      soldCount: 88,
      prepTime: '10-12 mins'
    },
    {
      id: 'prod-ramen-03',
      nama: 'Spicy Sesame Tantanmen',
      kanji: '麻辣胡麻坦々麺',
      kategori: 'Ramen & Noodles',
      harga: 54000,
      stok: 14,
      deskripsi: 'Creamy roasted sesame broth infused with chili oil, topped with savory minced meat, bok choy, and crushed peanuts.',
      allergens: ['Gluten', 'Peanuts', 'Soy', 'Sesame'],
      dietary: ['Spicy', 'Popular'],
      unggulan: true,
      emoji: '🍲',
      tone: '#f2ded4',
      soldCount: 94,
      prepTime: '10-12 mins'
    },
    {
      id: 'prod-ramen-04',
      nama: 'Cold Zaru Soba with Tsuyu Dip',
      kanji: '信州手打ちざる蕎麦',
      kategori: 'Ramen & Noodles',
      harga: 38000,
      stok: 22,
      deskripsi: 'Chilled buckwheat soba noodles served on bamboo zaru with chilled umami tsuyu dipping sauce, wasabi, and scallions.',
      allergens: ['Gluten', 'Soy'],
      dietary: ['Vegetarian-Friendly', 'Refreshing'],
      unggulan: false,
      emoji: '🥣',
      tone: '#e3e8e1',
      soldCount: 43,
      prepTime: '8-10 mins'
    },
    {
      id: 'prod-don-01',
      nama: 'Gyudon with Onsen Tamago',
      kanji: '特上牛丼温玉のせ',
      kategori: 'Donburi & Rice',
      harga: 48000,
      stok: 20,
      deskripsi: 'Thinly sliced US shortplate simmered in sweet mirin onion broth, served over steamed Koshihikari rice with runny onsen egg.',
      allergens: ['Beef', 'Soy', 'Eggs', 'Gluten'],
      dietary: ['Chef Signature', 'Comfort Food'],
      unggulan: true,
      emoji: '🥩',
      tone: '#ede5d8',
      soldCount: 104,
      prepTime: '8-10 mins'
    },
    {
      id: 'prod-don-02',
      nama: 'Unagi Kabayaki Jyu',
      kanji: '特製鰻蒲焼き重',
      kategori: 'Donburi & Rice',
      harga: 92000,
      stok: 9,
      deskripsi: 'Charcoal-grilled freshwater eel glazed repeatedly with sweet tare, sprinkled with fragrant Japanese Sansho pepper.',
      allergens: ['Fish', 'Soy', 'Gluten'],
      dietary: ['Chef Signature', 'Premium'],
      unggulan: true,
      emoji: '🍱',
      tone: '#ebd9cb',
      soldCount: 41,
      prepTime: '14-16 mins'
    },
    {
      id: 'prod-don-03',
      nama: 'Chicken Katsu Curry Don',
      kanji: '自家製チキンカツカレー',
      kategori: 'Donburi & Rice',
      harga: 45000,
      stok: 25,
      deskripsi: 'Golden crispy panko chicken cutlet served with rich 24-spice aromatic Japanese brown curry and pickled fukujinzuke.',
      allergens: ['Gluten', 'Eggs', 'Soy'],
      dietary: ['Halal-Friendly'],
      unggulan: false,
      emoji: '🍛',
      tone: '#f3e7d5',
      soldCount: 97,
      prepTime: '12-14 mins'
    },
    {
      id: 'prod-side-01',
      nama: 'Truffle Pan-Seared Gyoza (5 pcs)',
      kanji: '黒トリュフ焼き餃子',
      kategori: 'Bites & Sides',
      harga: 32000,
      stok: 30,
      deskripsi: 'Crisp lace bottom dumplings filled with minced chicken, shiitake, and a touch of black truffle oil. Served with ponzu chili dip.',
      allergens: ['Gluten', 'Soy', 'Sesame'],
      dietary: ['Popular Bite'],
      unggulan: true,
      emoji: '🥟',
      tone: '#ede8dd',
      soldCount: 135,
      prepTime: '8-10 mins'
    },
    {
      id: 'prod-side-02',
      nama: 'Tori Karaage with Garlic Kewpie',
      kanji: '若鶏の竜田揚げ',
      kategori: 'Bites & Sides',
      harga: 29000,
      stok: 24,
      deskripsi: 'Juicy chicken thighs marinated in ginger soy sauce, flash-fried to crispy perfection. Served with lemon and roasted garlic mayo.',
      allergens: ['Gluten', 'Eggs', 'Soy'],
      dietary: ['Favorite'],
      unggulan: false,
      emoji: '🍗',
      tone: '#faebd7',
      soldCount: 112,
      prepTime: '8-10 mins'
    },
    {
      id: 'prod-side-03',
      nama: 'Edamame with Flaky Maldon Salt',
      kanji: '塩茹で枝豆',
      kategori: 'Bites & Sides',
      harga: 18000,
      stok: 35,
      deskripsi: 'Steamed green Japanese soybeans tossed in flaky Maldon sea salt and toasted sesame oil aroma.',
      allergens: ['Soy'],
      dietary: ['Vegan', 'Gluten-Free'],
      unggulan: false,
      emoji: '🫛',
      tone: '#ddead8',
      soldCount: 80,
      prepTime: '4-5 mins'
    },
    {
      id: 'prod-drink-01',
      nama: 'Ceremonial Uji Matcha Latte',
      kanji: '宇治極上抹茶ラテ',
      kategori: 'Beverages & Tea',
      harga: 28000,
      stok: 30,
      deskripsi: 'First-harvest Kyoto Uji matcha hand-whisked with creamy fresh milk and a hint of organic raw cane sugar.',
      allergens: ['Dairy'],
      dietary: ['Signature Drink'],
      unggulan: true,
      emoji: '🍵',
      tone: '#dfe8d6',
      soldCount: 122,
      prepTime: '4-5 mins'
    },
    {
      id: 'prod-drink-02',
      nama: 'Yuzu Honey Sparkling Cooler',
      kanji: '柚子蜂蜜スパークリング',
      kategori: 'Beverages & Tea',
      harga: 26000,
      stok: 28,
      deskripsi: 'Shikoku island yuzu citrus purée, wild blossom honey, chilled carbonated soda, and fresh mint sprig.',
      allergens: [],
      dietary: ['Refreshing'],
      unggulan: false,
      emoji: '🍋',
      tone: '#f8f1d8',
      soldCount: 95,
      prepTime: '3-4 mins'
    },
    {
      id: 'prod-drink-03',
      nama: 'Iced Genmaicha Roasted Brown Rice Tea',
      kanji: '水出し玄米茶',
      kategori: 'Beverages & Tea',
      harga: 18000,
      stok: 40,
      deskripsi: 'Traditional cold-brewed Japanese green tea with toasted roasted brown rice. Nutty, calming, and naturally refreshing.',
      allergens: [],
      dietary: ['Sugar-Free', 'Vegan'],
      unggulan: false,
      emoji: '🍶',
      tone: '#e5e9df',
      soldCount: 140,
      prepTime: '2-3 mins'
    },
    {
      id: 'prod-dessert-01',
      nama: 'Ichigo Daifuku Fresh Strawberry Mochi',
      kanji: 'いちご大福',
      kategori: 'Desserts',
      harga: 24000,
      stok: 16,
      deskripsi: 'Handmade pillowy soft glutinous rice mochi wrapped around sweet azuki red bean paste and a fresh whole sweet strawberry.',
      allergens: ['Soy'],
      dietary: ['Vegetarian', 'Handcrafted'],
      unggulan: true,
      emoji: '🍓',
      tone: '#fbe2e2',
      soldCount: 68,
      prepTime: 'Ready to serve'
    },
    {
      id: 'prod-dessert-02',
      nama: 'Hojicha Silk Caramel Pudding',
      kanji: 'ほうじ茶絹ごしプリン',
      kategori: 'Desserts',
      harga: 26000,
      stok: 18,
      deskripsi: 'Silky smooth custard infused with roasted green tea (hojicha) topped with kuromitsu black sugar caramel.',
      allergens: ['Dairy', 'Eggs'],
      dietary: ['Chef Signature'],
      unggulan: false,
      emoji: '🍮',
      tone: '#ece3d6',
      soldCount: 57,
      prepTime: 'Ready to serve'
    }
  ];

  const TABLES = [
    { id: 'T-01', name: 'Meja 01', capacity: 2, status: 'available', currentOrderId: null, customerName: null, section: 'Indoor Front' },
    { id: 'T-02', name: 'Meja 02', capacity: 2, status: 'available', currentOrderId: null, customerName: null, section: 'Indoor Front' },
    { id: 'T-03', name: 'Meja 03', capacity: 4, status: 'occupied', currentOrderId: 'ICH-2026-1021', customerName: 'Bayu Hendra', section: 'Main Hall' },
    { id: 'T-04', name: 'Meja 04', capacity: 4, status: 'available', currentOrderId: null, customerName: null, section: 'Main Hall' },
    { id: 'T-05', name: 'Meja 05', capacity: 2, status: 'occupied', currentOrderId: 'ICH-2026-1023', customerName: 'Reza Pratama', section: 'Counter Bar' },
    { id: 'T-06', name: 'Meja 06', capacity: 2, status: 'available', currentOrderId: null, customerName: null, section: 'Counter Bar' },
    { id: 'T-07', name: 'Meja 07', capacity: 4, status: 'occupied', currentOrderId: 'ICH-2026-1022', customerName: 'Siti Rahma', section: 'Tatami Garden' },
    { id: 'T-08', name: 'Meja 08', capacity: 4, status: 'available', currentOrderId: null, customerName: null, section: 'Tatami Garden' },
    { id: 'T-09', name: 'Meja 09', capacity: 6, status: 'reserved', currentOrderId: null, customerName: 'Keluarga Santoso (19:30)', section: 'Private Room' },
    { id: 'T-10', name: 'Meja 10', capacity: 6, status: 'available', currentOrderId: null, customerName: null, section: 'Private Room' },
    { id: 'T-11', name: 'Meja 11', capacity: 2, status: 'available', currentOrderId: null, customerName: null, section: 'Veranda' },
    { id: 'T-12', name: 'Meja 12', capacity: 4, status: 'available', currentOrderId: null, customerName: null, section: 'Veranda' }
  ];

  // Helper date generators for realistic timestamps
  const now = new Date();
  const makeTime = (hoursAgo, minsAgo = 0) => {
    const d = new Date(now.getTime() - (hoursAgo * 3600000 + minsAgo * 60000));
    return d.toISOString();
  };

  const ORDERS = [
    {
      id: 'ICH-2026-1023',
      orderNumber: 1023,
      createdAt: makeTime(0, 10),
      customerName: 'Reza Pratama',
      orderType: 'dine_in',
      tableNumber: 'Meja 05',
      items: [
        { id: 'prod-don-01', nama: 'Gyudon with Onsen Tamago', harga: 48000, qty: 1, notes: 'Telur setengah matang sempurna', total: 48000 },
        { id: 'prod-drink-02', nama: 'Yuzu Honey Sparkling Cooler', harga: 26000, qty: 1, notes: 'Less ice', total: 26000 }
      ],
      subtotal: 74000,
      service: 3700,
      tax: 7770,
      discount: 0,
      total: 85470,
      paymentMethod: 'unpaid',
      cashReceived: null,
      change: null,
      status: 'pending',
      source: 'guest_self_order',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1021',
      orderNumber: 1021,
      createdAt: makeTime(0, 22),
      customerName: 'Bayu Hendra',
      orderType: 'dine_in',
      tableNumber: 'Meja 03',
      items: [
        { id: 'prod-ramen-01', nama: 'Ichiraku Special Tori Paitan Ramen', harga: 56000, qty: 2, notes: 'Mie kenyal, kuah kental', total: 112000 },
        { id: 'prod-side-01', nama: 'Truffle Pan-Seared Gyoza (5 pcs)', harga: 32000, qty: 1, notes: 'Saus ponzu extra', total: 32000 },
        { id: 'prod-drink-03', nama: 'Iced Genmaicha Roasted Brown Rice Tea', harga: 18000, qty: 2, notes: '', total: 36000 }
      ],
      subtotal: 180000,
      service: 9000,
      tax: 18900,
      discount: 0,
      total: 207900,
      paymentMethod: 'unpaid',
      cashReceived: null,
      change: null,
      status: 'cooking',
      source: 'cashier_pos',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1022',
      orderNumber: 1022,
      createdAt: makeTime(0, 35),
      customerName: 'Siti Rahma',
      orderType: 'dine_in',
      tableNumber: 'Meja 07',
      items: [
        { id: 'prod-sushi-01', nama: 'Salmon Nigiri Prime', harga: 34000, qty: 2, notes: 'Wasabi dipisah', total: 68000 },
        { id: 'prod-sushi-03', nama: 'Aburi Wagyu Beef Roll', harga: 78000, qty: 1, notes: '', total: 78000 },
        { id: 'prod-drink-01', nama: 'Ceremonial Uji Matcha Latte', harga: 28000, qty: 2, notes: 'Oat milk if available', total: 56000 },
        { id: 'prod-dessert-01', nama: 'Ichigo Daifuku Fresh Strawberry Mochi', harga: 24000, qty: 2, notes: 'Sajikan setelah makan', total: 48000 }
      ],
      subtotal: 250000,
      service: 12500,
      tax: 26250,
      discount: 10000,
      total: 278750,
      paymentMethod: 'unpaid',
      cashReceived: null,
      change: null,
      status: 'ready',
      source: 'cashier_pos',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1020',
      orderNumber: 1020,
      createdAt: makeTime(1, 15),
      customerName: 'Dimas Wicaksono',
      orderType: 'dine_in',
      tableNumber: 'Meja 02',
      items: [
        { id: 'prod-ramen-03', nama: 'Spicy Sesame Tantanmen', harga: 54000, qty: 1, notes: 'Level pedas ekstra', total: 54000 },
        { id: 'prod-side-02', nama: 'Tori Karaage with Garlic Kewpie', harga: 29000, qty: 1, notes: '', total: 29000 },
        { id: 'prod-drink-02', nama: 'Yuzu Honey Sparkling Cooler', harga: 26000, qty: 1, notes: '', total: 26000 }
      ],
      subtotal: 109000,
      service: 5450,
      tax: 11445,
      discount: 0,
      total: 125895,
      paymentMethod: 'qris',
      cashReceived: 125895,
      change: 0,
      status: 'completed',
      source: 'cashier_pos',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1019',
      orderNumber: 1019,
      createdAt: makeTime(2, 5),
      customerName: 'dr. Hendra Setiawan',
      orderType: 'dine_in',
      tableNumber: 'Meja 09',
      items: [
        { id: 'prod-don-02', nama: 'Unagi Kabayaki Jyu', harga: 92000, qty: 2, notes: '', total: 184000 },
        { id: 'prod-sushi-02', nama: 'Hon-Maguro Akami Sashimi', harga: 68000, qty: 1, notes: '', total: 68000 },
        { id: 'prod-drink-01', nama: 'Ceremonial Uji Matcha Latte', harga: 28000, qty: 2, notes: '', total: 56000 }
      ],
      subtotal: 308000,
      service: 15400,
      tax: 32340,
      discount: 0,
      total: 355740,
      paymentMethod: 'card',
      cashReceived: 355740,
      change: 0,
      status: 'completed',
      source: 'cashier_pos',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1018',
      orderNumber: 1018,
      createdAt: makeTime(2, 45),
      customerName: 'Anisa & Friend',
      orderType: 'takeaway',
      tableNumber: null,
      items: [
        { id: 'prod-sushi-04', nama: 'Spicy Salmon Crunch Roll', harga: 42000, qty: 1, notes: 'Sumpit 2 pasang', total: 42000 },
        { id: 'prod-sushi-05', nama: 'Ebi Tempura Truffle Roll', harga: 46000, qty: 1, notes: '', total: 46000 },
        { id: 'prod-dessert-01', nama: 'Ichigo Daifuku Fresh Strawberry Mochi', harga: 24000, qty: 2, notes: '', total: 48000 }
      ],
      subtotal: 136000,
      service: 0,
      tax: 13600,
      discount: 0,
      total: 149600,
      paymentMethod: 'cash',
      cashReceived: 150000,
      change: 400,
      status: 'completed',
      source: 'guest_self_order',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1017',
      orderNumber: 1017,
      createdAt: makeTime(3, 30),
      customerName: 'Karyawan Bank Mandiri (Rombongan)',
      orderType: 'dine_in',
      tableNumber: 'Meja 10',
      items: [
        { id: 'prod-don-03', nama: 'Chicken Katsu Curry Don', harga: 45000, qty: 4, notes: 'Kuah kari banyak', total: 180000 },
        { id: 'prod-side-01', nama: 'Truffle Pan-Seared Gyoza (5 pcs)', harga: 32000, qty: 2, notes: '', total: 64000 },
        { id: 'prod-drink-03', nama: 'Iced Genmaicha Roasted Brown Rice Tea', harga: 18000, qty: 4, notes: '', total: 72000 }
      ],
      subtotal: 316000,
      service: 15800,
      tax: 33180,
      discount: 15000,
      total: 349980,
      paymentMethod: 'qris',
      cashReceived: 349980,
      change: 0,
      status: 'completed',
      source: 'cashier_pos',
      cashierName: 'Aoi Tanaka'
    },
    {
      id: 'ICH-2026-1016',
      orderNumber: 1016,
      createdAt: makeTime(4, 15),
      customerName: 'Fajar Nugraha',
      orderType: 'dine_in',
      tableNumber: 'Meja 01',
      items: [
        { id: 'prod-ramen-02', nama: 'Black Garlic Shoyu Ramen', harga: 52000, qty: 1, notes: '', total: 52000 },
        { id: 'prod-dessert-02', nama: 'Hojicha Silk Caramel Pudding', harga: 26000, qty: 1, notes: '', total: 26000 }
      ],
      subtotal: 78000,
      service: 3900,
      tax: 8190,
      discount: 0,
      total: 90090,
      paymentMethod: 'cash',
      cashReceived: 100000,
      change: 9910,
      status: 'completed',
      source: 'cashier_pos',
      cashierName: 'Aoi Tanaka'
    }
  ];

  const SETTINGS = {
    storeName: 'ICHIRAKU 一楽',
    tagline: 'Artisanal Japanese Kitchen & Soba Bar',
    subtitle: 'Banyuwangi · Est. 2021',
    address: 'Jl. Diponegoro No. 88, Kepatihan, Banyuwangi, Jawa Timur',
    phone: '6281234567890',
    taxRate: 10, // 10% PB1
    serviceRate: 5, // 5% Service Charge
    currency: 'IDR',
    openingHours: '11:00 – 22:00 WIB',
    receiptFooterMessage: 'Terima kasih atas kunjungan Anda.\nSemoga hari Anda menyenangkan! (ありがとうございます)'
  };

  const USERS = {
    admin: {
      role: 'admin',
      name: 'Kenji Sato',
      title: 'Store General Manager',
      pin: '1234',
      badge: 'Admin Toko',
      avatar: '👨‍💼'
    },
    cashier: {
      role: 'cashier',
      name: 'Aoi Tanaka',
      title: 'Head Cashier & Barista',
      pin: '1111',
      badge: 'Kasir POS',
      avatar: '👩‍🍳'
    },
    guest: {
      role: 'guest',
      name: 'Tamu Terhormat',
      title: 'Customer Experience',
      pin: '',
      badge: 'Tamu / Pelanggan',
      avatar: '🥢'
    }
  };

  return {
    CATEGORIES,
    PRODUCTS,
    TABLES,
    ORDERS,
    SETTINGS,
    USERS
  };
})();
