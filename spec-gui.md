# Spesifikasi Desain GUI & UX Baru (EleganMart)

## 1. Konsep Visual (Elegant & Modern)
- **Warna Utama**: Menggunakan palet `Indigo` yang lebih dalam untuk kesan premium, dipadukan dengan `Slate` untuk teks agar kontras nyaman di mata.
  - Primary: `#4338ca` (Indigo 700) -> `#3730a3` (Indigo 800) saat hover.
  - Accent: `#f97316` (Orange 500) untuk tombol aksi (CTA) seperti "Beli Sekarang".
  - Background: Off-white `#f8fafc` (Slate 50) untuk kebersihan visual.
- **Tipografi**: Menggunakan `Inter` dengan tracking (letter-spacing) yang sedikit diperluas pada heading untuk kesan elegan.
- **Radius & Shadow**:
  - Radius kartu diperbesar (16px - 24px) untuk kesan modern (Apple-like).
  - Shadow yang lebih halus (`diffuse shadows`) untuk memberikan kedalaman tanpa terlihat kotor.

## 2. Peningkatan Tampilan Mobile (Mobile-First)
- **Navigasi (Hamburger Menu)**:
  - Mengubah tombol "Menu" teks menjadi Ikon SVG (Garis 3).
  - Menu mobile akan muncul sebagai **Slide-down Panel** atau **Off-canvas Drawer** dari kanan dengan animasi halus (`transition: transform 0.3s cubic-bezier(...)`).
  - Item menu di mobile memiliki `padding` lebih besar (min 44px height) untuk target sentuh jari yang mudah.
- **Grid Produk**:
  - Mobile: 2 kolom dengan gap lebih kecil (agar muat banyak tapi tetap terbaca).
  - Tablet/Desktop: 3-4 kolom responsif.

## 3. Loading State (Skeleton Loading)
Menggantikan teks "Loading..." dengan animasi **Skeleton UI** (kotak abu-abu yang berkilau) agar user merasa aplikasi lebih cepat (perceived performance).

### Pola Skeleton:
- **Produk Card**:
  - Gambar: Kotak rasio 1:1 atau 4:3.
  - Judul: Garis panjang 60%.
  - Harga: Garis pendek 30%.
- **Detail Produk**:
  - Gambar besar.
  - Blok teks deskripsi.

### Implementasi CSS:
```css
.skeleton {
  background: #e2e8f0;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 4. Komponen UI Baru
- **Toast Notification**: Menggantikan `alert()` browser yang memblokir interaksi. Notifikasi muncul di pojok kanan bawah/atas (hijau untuk sukses, merah untuk error).
- **Badge Status**: Desain badge yang lebih rapi untuk status pesanan (e.g., "Menunggu Bayar" warna kuning, "Lunas" warna hijau).
- **Empty States**: Ilustrasi atau ikon SVG sederhana saat data kosong (keranjang kosong, pencarian tidak ditemukan), bukan sekadar teks.

## 5. Rencana Implementasi
1.  **Update `style.css`**: Terapkan variabel warna baru, style skeleton, dan perbaikan mobile nav.
2.  **Update JavaScript**: Ubah logika render data untuk menampilkan skeleton sebelum data dimuat.
3.  **Refactor HTML**: Pastikan struktur mendukung layout baru.
