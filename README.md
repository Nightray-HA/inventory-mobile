# 📦 Inventori - Sistem Manajemen Barang Lokal

**Inventori** adalah aplikasi *mobile* manajemen barang berbasis *offline* yang dirancang untuk membantu UMKM atau bisnis kecil dalam mencatat stok, transaksi, dan membuat laporan secara profesional langsung dari ponsel.

---

## ✨ Fitur Utama

- 📊 **Dashboard Real-time**: Pantauan total stok, transaksi masuk/keluar hari ini, dan peringatan stok kritis secara instan.
- 📦 **Master Barang**: Pengelolaan data barang lengkap dengan kategori, satuan, harga, dan foto produk.
- 🔄 **Input Transaksi**: Pencatatan barang masuk (pembelian) dan barang keluar (penjualan) yang terintegrasi otomatis dengan stok.
- 🕰️ **Riwayat Detail**: Filter dan telusuri riwayat transaksi berdasarkan periode tanggal atau jenis transaksi.
- 📄 **Ekspor Laporan**: Generate laporan profesional dalam format **PDF** dan **Excel** secara lokal di perangkat tanpa koneksi internet.
- 🔒 **Keamanan PIN**: Lindungi data bisnis Anda dengan fitur pengunci aplikasi menggunakan PIN.
- 🌓 **Tema Dinamis**: Dukungan penuh untuk Mode Terang (*Light*), Mode Gelap (*Dark*), dan penyesuaian otomatis mengikuti sistem HP.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **Database**: [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Local Storage)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with Theme Support
- **Reports**: `expo-print` (PDF) & `xlsx` (Excel)

---

## 📂 Struktur Folder Projek

```text
inventory/
├── app/                # Halaman aplikasi (Expo Router)
│   ├── (auth)/         # Autentikasi & PIN Security
│   ├── (main)/         # Fitur utama (Dashboard, Barang, Transaksi, dll)
│   └── _layout.tsx     # Root layout & Theme Provider
├── assets/             # Gambar, ikon, dan font
├── components/         # Komponen UI reusable
│   ├── features/       # Komponen spesifik fitur (Dashboard, Transaksi)
│   ├── layout/         # Wrapper & Global UI
│   └── ui/             # UI Kit (Button, Input, Badge, Modal, dll)
├── constants/          # Design Tokens (Colors, Typography, Spacing)
├── hooks/              # Custom Hooks untuk logika bisnis
├── lib/                # Core Logic & Services
│   ├── auth/           # Manajemen Keamanan & PIN
│   ├── db/             # SQLite Schema & Repositories
│   ├── reports/        # PDF & Excel Generator logic
│   ├── theme/          # Dynamic Theme System
│   └── utils/          # Helper & Utility functions
├── types/              # Definisi TypeScript
├── app.json            # Konfigurasi Expo
└── package.json        # Dependensi Projek
```

---

## 🚀 Cara Menjalankan

1. **Instal Dependensi**
   ```bash
   npm install
   ```

2. **Jalankan Aplikasi**
   ```bash
   npx expo start
   ```

3. **Gunakan Perangkat**
   - Tekan `a` untuk membuka di Emulator Android.
   - Tekan `i` untuk membuka di Simulator iOS.
   - Scan kode QR dengan aplikasi **Expo Go** untuk mencoba langsung di HP fisik.

---

## ⚙️ Informasi Tambahan

- **Penyimpanan**: Aplikasi ini sepenuhnya menggunakan database lokal (SQLite). Data Anda tidak dikirim ke server manapun demi privasi.
- **Laporan**: Lokasi penyimpanan laporan (PDF/Excel) di Android dapat diatur melalui menu Pengaturan menggunakan sistem *Storage Access Framework* (SAF).

Created by **Nightray-HA**
