# SPEC.md — Ichiraku

**Versi:** 1.0  
**Jenis:** Spesifikasi MVP / latihan implementasi 1 hari  
**Produk:** Katalog dan dashboard produk UMKM makanan/minuman berbasis web

## 1. Tujuan

Ichiraku adalah aplikasi web satu halaman untuk memperkenalkan katalog produk rumah makan bergaya Jepang sekaligus menyediakan dashboard demo bagi pengelola toko. Aplikasi ditujukan sebagai latihan pengembangan frontend selama satu hari.

MVP memprioritaskan pengalaman katalog yang menarik dan mudah digunakan, serta pengelolaan data produk sederhana tanpa backend.

## 2. Pengguna dan konteks penggunaan

### 2.1 Calon pembeli
- Melihat daftar produk, kategori, harga, deskripsi, dan ketersediaan stok.
- Mencari produk dan mengurutkan katalog.
- Menghubungi toko melalui WhatsApp untuk menanyakan atau memesan produk.

### 2.2 Pengelola toko
- Membuka dashboard demo pada perangkat yang sama.
- Melihat ringkasan produk, stok, kategori, dan produk unggulan.
- Menambah, mengubah, dan menghapus data produk.
- Mengandalkan localStorage browser untuk menyimpan perubahan pada perangkat/browser tersebut.

### 2.3 Asumsi penggunaan
- Pembeli dan pengelola menggunakan perangkat/browser yang sama secara bergantian.
- Dashboard bukan area privat karena tidak ada autentikasi.
- Data tidak tersinkronisasi antarperangkat atau antarbrowser.

## 3. Ruang lingkup fitur MVP

| ID | Fitur | Deskripsi |
|---|---|---|
| F-01 | Katalog produk | Menampilkan 8 produk contoh saat pertama kali aplikasi dibuka. |
| F-02 | Placeholder gambar lokal | Produk tanpa `imageUrl` menampilkan ilustrasi/placeholder lokal yang dibuat dengan CSS/emoji, tanpa mengambil aset eksternal. |
| F-03 | Informasi produk | Menampilkan nama, kategori, harga Rupiah, stok, deskripsi, dan penanda unggulan. |
| F-04 | Pencarian | Pencarian berdasarkan nama, kategori, dan deskripsi. |
| F-05 | Filter kategori | Filter berdasarkan kategori produk dan opsi semua kategori. |
| F-06 | Sorting | Urutkan berdasarkan unggulan, nama A–Z, harga termurah/termahal, dan stok terbanyak. |
| F-07 | WhatsApp | Tombol pesan membuka WhatsApp dengan teks produk yang dipilih. Nomor toko dapat dikonfigurasi pada source code; jika kosong, pengguna memilih/menggunakan WhatsApp melalui link umum. |
| F-08 | Dashboard demo | Dashboard dapat dibuka dari tombol pada halaman katalog, tanpa login palsu. |
| F-09 | CRUD produk | Tambah, baca, ubah, dan hapus produk melalui dashboard. |
| F-10 | Ringkasan dashboard | Menampilkan total produk, total stok, jumlah kategori unik, dan jumlah produk unggulan. |
| F-11 | Persistensi lokal | Data katalog disimpan di localStorage dan dimuat kembali saat halaman dibuka. |
| F-12 | Reset data demo | Sediakan tindakan untuk mengembalikan delapan produk awal dengan konfirmasi. |

## 4. Data model

### 4.1 Entitas Product

| Field | Tipe | Wajib | Aturan |
|---|---|---:|---|
| `id` | string | Ya | Unik untuk setiap produk. |
| `nama` | string | Ya | Tidak boleh kosong setelah trim. |
| `kategori` | string | Ya | Nama kategori, misalnya Sushi, Ramen, Japanese Sides, Beverages. |
| `harga` | number | Ya | Angka finite dan `>= 0`; disimpan sebagai nilai numerik Rupiah, bukan string terformat. |
| `stok` | integer | Ya | Bilangan bulat dan `>= 0`. |
| `deskripsi` | string | Tidak | Deskripsi singkat produk. |
| `imageUrl` | string | Tidak | URL gambar opsional; kosong berarti gunakan placeholder lokal. |
| `unggulan` | boolean | Ya | Menentukan apakah produk ditandai sebagai unggulan. |

### 4.2 Contoh objek

```js
{
  id: "sushi-01",
  nama: "Salmon Nigiri",
  kategori: "Sushi",
  harga: 28000,
  stok: 18,
  deskripsi: "Fresh salmon over seasoned sushi rice.",
  imageUrl: "",
  unggulan: true
}
```

### 4.3 Data awal

Muat 8 produk contoh lintas kategori Sushi, Ramen, Japanese Sides, dan Beverages. Data bersifat fiktif/nonpribadi dan hanya untuk demo. Produk awal tidak boleh dianggap sebagai menu, harga, atau stok aktual suatu usaha.

### 4.4 Penyimpanan

- Key localStorage: `ichiraku_catalog_v1`.
- Bentuk penyimpanan: JSON array berisi objek Product.
- Saat key belum tersedia, aplikasi menginisialisasi data contoh.
- Saat JSON rusak atau bukan array, aplikasi melakukan fallback ke data contoh.
- Perubahan CRUD langsung memperbarui localStorage.
- Reset data mengembalikan seed awal.

## 5. Kebutuhan nonfungsional

| ID | Kategori | Kebutuhan |
|---|---|---|
| NF-01 | Teknologi | Implementasi latihan menggunakan Vite + JavaScript vanilla; tidak menggunakan framework frontend. |
| NF-02 | Backend | Tidak ada backend, database server, API server, atau layanan autentikasi. |
| NF-03 | Penyimpanan | Persistensi hanya pada localStorage browser/perangkat aktif. |
| NF-04 | Responsif | Layout dapat digunakan pada desktop dan mobile. |
| NF-05 | Usability | Pencarian, filter, sorting, dan CTA WhatsApp mudah ditemukan. |
| NF-06 | Validasi | Harga harus angka `>= 0`; stok harus integer `>= 0`; nama tidak boleh kosong. |
| NF-07 | Keamanan | Tidak menyimpan API key, token, password, atau kredensial. |
| NF-08 | Keamanan | Tidak menjalankan perintah berbahaya atau mengandalkan input pengguna sebagai kode. |
| NF-09 | Privasi | Data contoh tidak memuat data pribadi atau data pelanggan nyata. |
| NF-10 | Aset | Gunakan CSS, emoji, atau aset buatan sendiri; jangan memakai gambar berhak cipta tanpa izin. |
| NF-11 | Kompatibilitas | Mendukung browser modern yang menyediakan localStorage dan JavaScript ES6+. |
| NF-12 | Kegagalan | Jika localStorage tidak tersedia, aplikasi harus menampilkan perilaku fallback/pesan yang jelas; data tidak boleh diklaim tersimpan permanen. |

## 6. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| localStorage dihapus pengguna/browser | Perubahan katalog hilang | Jelaskan bahwa penyimpanan hanya lokal; sediakan reset data contoh. |
| Dashboard tidak memakai autentikasi | Siapa pun yang membuka perangkat dapat mengubah katalog | Tandai dashboard sebagai demo, jangan masukkan data sensitif. |
| Nomor WhatsApp belum dikonfigurasi | Pesan tidak langsung menuju nomor toko | Sediakan konstanta konfigurasi dan instruksi mengganti nomor. |
| URL gambar tidak valid | Gambar produk gagal tampil | Gunakan placeholder lokal sebagai fallback. |
| Data localStorage rusak | Katalog gagal dimuat | Validasi JSON dan fallback ke seed. |
| Harga/stok tidak valid | Data katalog tidak konsisten | Validasi form sebelum menyimpan. |
| Browser/perangkat berbeda | Data tidak sinkron | Nyatakan batasan local-only dengan jelas. |

## 7. Out of scope

Fitur berikut tidak termasuk MVP latihan satu hari:
- Backend, database, API, dan sinkronisasi cloud.
- Login, registrasi, role, dan permission.
- Checkout, keranjang belanja, pembayaran, dan konfirmasi transaksi.
- Manajemen pesanan atau status pesanan.
- Pengurangan stok otomatis setelah pemesanan.
- Integrasi WhatsApp Business API.
- Upload dan manajemen file gambar.
- Multi-toko, multi-cabang, dan multi-pengguna.
- Laporan penjualan, analitik, dan ekspor data.
- SEO tingkat lanjut, CMS, dan panel konfigurasi brand.
- Deployment dan domain produksi.

## 8. Acceptance criteria (pemeriksaan manual)

| ID | Skenario | Langkah pemeriksaan | Hasil yang diharapkan |
|---|---|---|---|
| AC-01 | Inisialisasi katalog | Buka aplikasi dengan localStorage key belum ada. | Delapan produk contoh tampil. |
| AC-02 | Detail kartu produk | Periksa beberapa kartu produk. | Nama, kategori, harga IDR, stok, deskripsi, dan status unggulan terlihat. |
| AC-03 | Placeholder | Pastikan produk tanpa URL gambar. | Placeholder lokal tampil tanpa gambar eksternal. |
| AC-04 | Pencarian | Ketik `salmon` pada kolom pencarian. | Produk yang nama/deskripsi/kategorinya cocok ditampilkan; produk lain disembunyikan. |
| AC-05 | Filter kategori | Pilih kategori Ramen. | Hanya produk kategori Ramen yang tampil. |
| AC-06 | Reset filter | Pilih kategori All. | Semua produk yang cocok dengan pencarian tampil kembali. |
| AC-07 | Sorting harga | Pilih harga termurah. | Produk diurutkan dari harga terendah ke tertinggi. |
| AC-08 | Sorting nama | Pilih Name A–Z. | Nama produk terurut alfabetis. |
| AC-09 | Sorting stok | Pilih Stock Highest. | Stok terbanyak muncul lebih dahulu. |
| AC-10 | WhatsApp | Klik tombol pesan pada satu produk. | WhatsApp/link WhatsApp terbuka dengan nama produk dan harga pada teks pesan. |
| AC-11 | Dashboard | Klik Demo dashboard. | Dashboard terbuka dan menampilkan ringkasan serta tabel produk. |
| AC-12 | Ringkasan | Cocokkan angka dashboard dengan tabel. | Total produk, stok, kategori unik, dan unggulan sesuai data. |
| AC-13 | Create | Tambahkan produk dengan data valid. | Produk baru muncul di katalog dan dashboard. |
| AC-14 | Read | Buka dashboard setelah produk dibuat. | Produk baru tercantum dengan data yang sesuai. |
| AC-15 | Update | Ubah nama/harga/stok produk. | Katalog, tabel, dan ringkasan menampilkan nilai terbaru. |
| AC-16 | Delete | Hapus produk dan setujui konfirmasi. | Produk hilang dari katalog dan dashboard; ringkasan diperbarui. |
| AC-17 | Validasi harga | Masukkan harga negatif. | Browser/form menolak nilai atau aplikasi menampilkan validasi; data tidak tersimpan. |
| AC-18 | Validasi stok | Masukkan stok negatif atau desimal. | Data ditolak; stok hanya integer `>= 0`. |
| AC-19 | Validasi nama | Kirim form dengan nama kosong/spasi. | Data tidak tersimpan dan pesan validasi tampil. |
| AC-20 | Persistensi | Ubah data, refresh halaman. | Perubahan tetap tampil pada browser yang sama. |
| AC-21 | Reset demo | Klik reset dan konfirmasi. | Data kembali ke delapan produk awal. |
| AC-22 | Responsif | Uji viewport desktop dan mobile. | Konten tidak terpotong; katalog dan dashboard tetap dapat digunakan. |

## 9. Implementation plan per iterasi

Estimasi latihan satu hari: sekitar 6–8 jam, dapat disesuaikan.

| Iterasi | Estimasi | Pekerjaan | Definition of done |
|---|---:|---|---|
| I-1 — Project setup | 30 menit | Buat proyek Vite vanilla JS, struktur file, dan entry point. | Aplikasi berjalan lokal melalui Vite. |
| I-2 — Visual foundation | 60 menit | Definisikan palet, tipografi, layout, header, hero, section, footer, dan responsive rules. | Landing page dasar konsisten pada desktop/mobile. |
| I-3 — Product catalog | 75 menit | Buat seed 8 produk, kartu produk, formatter Rupiah, placeholder lokal. | Delapan produk tampil sesuai model. |
| I-4 — Catalog interactions | 45 menit | Implementasi pencarian, filter kategori, sorting, dan WhatsApp CTA. | Semua interaksi katalog lulus uji manual. |
| I-5 — Dashboard & CRUD | 90 menit | Dashboard, metrik, tabel, form create/update, delete, validasi. | Pengelola dapat mengelola katalog melalui UI. |
| I-6 — Persistence | 35 menit | Integrasi localStorage, fallback data, reset demo. | Perubahan bertahan setelah refresh pada browser yang sama. |
| I-7 — QA & polish | 60 menit | Uji acceptance criteria, responsive, empty state, error handling, dan copy. | Semua acceptance criteria MVP dapat diperiksa manual. |

## 10. Struktur implementasi yang disarankan (Vite)

```text
ichiraku/
├── index.html
├── package.json
├── SPEC.md
└── src/
    ├── main.js
    ├── style.css
    ├── data/
    │   └── products.js
    ├── services/
    │   └── storage.js
    ├── components/
    │   ├── product-card.js
    │   └── dashboard.js
    └── utils/
        └── format.js
```

Catatan: prototype single-HTML dapat digunakan sebagai demonstrasi cepat. Implementasi final latihan Vite sebaiknya memisahkan HTML, CSS, data seed, storage, dan fungsi UI sesuai struktur di atas.

## 11. Definition of done

MVP dianggap selesai apabila:
1. Katalog memuat delapan produk contoh.
2. Pencarian, filter, sorting, dan WhatsApp CTA berfungsi.
3. Dashboard demo menyediakan CRUD dan ringkasan yang akurat.
4. Perubahan tersimpan pada localStorage dan bertahan setelah refresh.
5. Validasi harga, stok, dan nama berjalan.
6. Layout dapat digunakan pada desktop dan mobile.
7. Tidak ada backend, login palsu, API key, data pribadi, atau aset berhak cipta yang tidak berizin.
8. Seluruh acceptance criteria dapat diperiksa manual.
