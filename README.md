# 🍜 ICHIRAKU (一楽) — React + Vite Japanese Kitchen & POS Suite

> **Production-Grade Web Restaurant Suite** berbasis **React 19 & Vite 6** dengan arsitektur **3 Peran (Admin, Kasir, Guest)**, basis data **LocalStorage** dengan dummy data lengkap & realistis, serta visual desain & tipografi terinspirasi referensi **Awwwards & Kyoto Minimalist Editorial** (`/example`).

---

## 🌟 Pembaruan Desain & Arsitektur (Berdasarkan `/example`)

1. **Migrasi Penuh ke React + Vite**:
   - Seluruh logika, komponen UI, state management, dan database service telah dimigrasi ke komponen modern **React + Vite**.
   - Performa build sangat cepat (< 1 detik).
2. **Hero Fullscreen (100vh)**:
   - Tampilan hero memenuhi layar penuh (*full viewport height*) dengan nuansa atmosferik washi & pine forest.
   - **Tombol di sebelah kiri hero dihapus sepenuhnya** sesuai instruksi untuk memberikan ruang bernapas (*negative space*) yang bersih dan elegan.
   - **Kaligrafi Hiragana Vertikal** (`おいしい時間を。` dan `いただきます`) dipertahankan secara anggun dengan `writing-mode: vertical-rl`.
3. **Penyederhanaan Teks & UI Bersih**:
   - Menghilangkan teks paragraf yang berlebihan (*decluttered*).
   - Tipografi mengacu pada referensi `/example` (`i1.jpg`, `i2.jpg`, `i6.jpg`): **Cormorant Garamond**, **Plus Jakarta Sans**, **Space Mono**, dan **Noto Serif JP**.
   - Kartu menu bersih dengan garis pembatas halus (*hairline*), warna latar pastel lembut, harga monospaced presisi, dan tombol `+ Add` minimalis.

---

## 👥 3 Peran Pengguna (Multi-Role Suite)

Terdapat **Role Bar** yang menempel di bagian paling atas layar untuk berpindah peran:

### 1. 👤 Tamu (Guest / Pelanggan)
* **Hero Fullscreen (100vh)**: Tipografi editorial anggun, hiragana vertikal, tanpa tombol kiri yang mengganggu.
* **Katalog Menu Minimalis**: Filter kategori (Sushi, Ramen, Donburi, Bites, Drinks, Desserts), filter preferensi koki (★ Chef's Choice, 🌿 Halal, 🌶️ Spicy).
* **Detail Pop-up Hidangan**: Porsi, alergen, instruksi khusus (misal: *"tanpa wasabi"*, *"kuah lebih gurih"*), dan stepper jumlah pesanan.
* **Keranjang & Self-Order**: Pemilihan Meja (Meja 01–12) atau Take-Away, perhitungan otomatis PB1 (10%) & Service (5%), kirim langsung ke Dapur/Kasir atau pesan rincian via WhatsApp.
* **Pelacak Status Dapur (Live Tracker)**: Pelanggan dapat memantau status pesanannya (`Received` ➔ `Cooking` ➔ `Ready` ➔ `Completed`).
* **Reservasi Meja Online**: Booking meja dengan tanggal, sesi jam, dan jumlah tamu.

### 2. 💳 Kasir (Cashier / POS Terminal)
* **Operator**: `Aoi Tanaka` (Head Cashier) — PIN: `1111` *(atau klik Masuk Langsung)*
* **Terminal POS Cepat**: Pencarian F2, tap menu langsung masuk ke tiket pesanan, diskon cepat (0%, 5%, 10%, 15%).
* **Kalkulator Pembayaran Multifungsi**:
  - **Tunai**: Pecahan cepat (Uang Pas, 50k, 100k, 150k, 200k) dengan kalkulasi otomatis **Uang Kembalian**.
  - **QRIS**: Tampilan QR code merchant dengan tombol simulasi verifikasi lunas.
  - **Kartu Debit / EDC**: Input kode referensi mesin EDC.
* **Struk Kasir Termal 58mm/80mm**: Format struk ESC/POS dengan barcode, rincian biaya, tombol Cetak Struk (`window.print()`), dan Salin Teks.
* **Antrean Dapur (Kitchen Kanban)**: Memproses tahapan pesanan `Menunggu` ➔ `Memasak` ➔ `Siap Saji` ➔ `Selesai`.
* **Laporan Shift & Kasir**: Rekonsiliasi modal awal, penjualan tunai, QRIS, dan uang tunai di laci kasir.

### 3. 📊 Admin (Store General Manager)
* **Pengelola**: `Kenji Sato` (General Manager) — PIN: `1234` *(atau klik Masuk Langsung)*
* **Analitik Bisnis & KPI**: Omset hari ini, omset kumulatif, AOV, grafik batang penjualan per kategori, dan 5 menu terlaris.
* **Manajemen Katalog Menu (CRUD)**: Tambah menu baru, edit data, hapus dengan konfirmasi, dan tombol restock cepat (+5 stok).
* **Riwayat Transaksi & Audit**: Audit seluruh transaksi lampau dengan kemampuan membuka dan mencetak ulang struk.
* **Denah 12 Meja Restoran**: Visual status meja (Tersedia, Terisi, Reservasi) dan tombol kosongkan meja.
* **Pusat Database LocalStorage**: Pengaturan profil toko & tarif pajak, unduh cadangan JSON (*export*), unggah pemulihan (*import*), dan tombol *Factory Reset*.

---

## 📁 Struktur Berkas React + Vite

```text
Workshop/
├── index.html                   # Vite HTML entry point
├── package.json                 # Dependencies (React 19, Vite 6, @vitejs/plugin-react)
├── vite.config.js               # Konfigurasi bundler Vite
├── README.md                    # Dokumentasi lengkap
├── example/                     # Referensi desain clean & foto inspirasi
│   ├── i1.jpg                   # Referensi menu Kizuna
│   ├── i2.jpg                   # Referensi Shoyu ramen minimalis
│   ├── i6.jpg                   # Referensi Ito sushi editorial
│   └── ...
└── src/
    ├── main.jsx                 # React root mounting
    ├── App.jsx                  # Master app controller & state sync
    ├── index.css                # Awwwards clean minimalist stylesheet
    ├── data/
    │   └── mockData.js          # Seed 20 menu, 12 meja, transaksi, pengaturan
    ├── services/
    │   ├── storage.js           # LocalStorage database engine
    │   └── audio.js             # Web Audio API synthesizer (lonceng & kasir)
    └── components/
        ├── shared/
        │   ├── RoleBar.jsx      # Persistent top role switcher
        │   ├── PinModal.jsx     # Modal PIN kasir & admin
        │   └── ThermalReceiptModal.jsx # Struk termal 58mm/80mm
        ├── guest/
        │   ├── GuestView.jsx    # Halaman Tamu utama
        │   ├── HeroFullscreen.jsx # Hero 100vh + Hiragana vertikal (tanpa tombol kiri)
        │   ├── MenuEditorial.jsx  # Katalog menu clean ala /example
        │   ├── CartDrawer.jsx   # Keranjang self-order slide-over
        │   ├── ProductModal.jsx # Detail racikan koki & instruksi khusus
        │   └── TrackerAndReservation.jsx # Pelacak dapur & reservasi
        ├── cashier/
        │   └── CashierView.jsx  # POS terminal, kanban dapur, shift
        └── admin/
            └── AdminView.jsx    # Analitik omset, CRUD katalog, denah meja, DB
```

---

## 🚀 Cara Menjalankan

### Menjalankan Development Server (React + Vite):
Buka terminal di folder proyek dan jalankan:
```bash
npm run dev
```
Buka browser pada alamat: **`http://localhost:5173`**

### Membuat Build Produksi:
```bash
npm run build
```
Hasil build instan tersimpan di direktori `dist/` dan siap di-deploy ke hosting mana saja (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---
*Crafted with silence and passion. 一期一会 (Ichigo Ichie).*
