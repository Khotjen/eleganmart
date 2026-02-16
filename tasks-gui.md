# Tasks - GUI & UX Overhaul

## 1. Styling & Theming (CSS)
- [x] **Color Palette**: Update `:root` variables dengan warna Indigo/Slate yang lebih elegan.
- [x] **Typography**: Atur `line-height` dan `letter-spacing` agar lebih mudah dibaca.
- [x] **Card Design**: Perhalus shadow dan border-radius pada `.product-card` dan `.section-card`.
- [x] **Skeleton UI**: Tambahkan class `.skeleton` dan animasinya di `style.css`.
- [x] **Mobile Nav**: Buat style untuk menu mobile yang lebih baik (slide/fade effect) dan ikon hamburger.

## 2. Component Logic (JS/HTML)
- [x] **Skeleton Implementation**:
  - Update `app.js` (untuk produk) untuk menampilkan 6 kartu skeleton saat fetch data.
  - Update `produk-detail.js` untuk skeleton detail.
- [x] **Mobile Menu Action**: Update `nav.js` logic (sudah handle toggle class `.open`).
- [x] **Toast System**: Buat fungsi `showToast(message, type)` sederhana dan inject containernya ke DOM. Ganti semua `alert()` penting dengan `showToast()`.

## 3. Verification
- [x] Cek tampilan di resolusi mobile (375px - 414px) -> Menggunakan CSS Media Query `max-width: 900px` dengan `position: fixed`.
- [x] Pastikan animasi loading muncul dan hilang saat data diterima -> Menggunakan `renderSkeleton()` dan `setLoading()`.
- [x] Pastikan navigasi bisa dibuka/tutup dengan lancar di mobile -> Transisi CSS `transform` sudah diterapkan.
