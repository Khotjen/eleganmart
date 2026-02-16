# Daftar Tugas (Tasks) - EleganMart

## Status Terkini (Completed)
Berikut adalah daftar perbaikan dan fitur yang telah diimplementasikan sesuai dengan `kekurangan-web.txt`:

- [x] **Keamanan Admin**: Implementasi middleware `requireAdmin` pada rute admin.
- [x] **Manajemen Secrets**: Migrasi hardcoded secrets ke environment variables.
- [x] **Validasi Input**: Penambahan validasi tipe data dan sanitasi input di server.
- [x] **Filter Upload**: Pembatasan tipe file dan ukuran upload gambar.
- [x] **CSRF & Rate Limiting**: Proteksi endpoint sensitif dari serangan CSRF dan brute force.
- [x] **Database Consistency**: Implementasi locking mechanism pada operasi tulis file JSON.
- [x] **Navigasi Mobile**: Pembuatan menu responsif (hamburger menu) untuk perangkat mobile.
- [x] **Aksesibilitas**: Perbaikan struktur HTML dan atribut ARIA untuk aksesibilitas.
- [x] **UX Improvements**: Penambahan state loading dan error handling di frontend.
- [x] **Sinkronisasi Keranjang**: Fitur merge cart lokal dengan server cart saat login.
- [x] **Validasi Stok Server-side**: Pengecekan stok real-time saat proses checkout.
- [x] **SEO & Meta Tags**: Optimasi SEO dasar pada halaman publik.

## Rencana Pengembangan Selanjutnya (Backlog)
- [ ] **Database Migration**: Migrasi dari JSON file ke database relasional (PostgreSQL/MySQL) jika trafik meningkat.
- [ ] **Email Notifications**: Integrasi layanan email (Nodemailer/SendGrid) untuk notifikasi pesanan.
- [ ] **User Dashboard**: Fitur ubah profil dan ganti password pengguna.
- [ ] **Laporan Penjualan**: Halaman analitik admin untuk melihat tren penjualan.
- [ ] **Voucher Diskon**: Sistem kode promo untuk potongan harga saat checkout.
