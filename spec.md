# Spesifikasi Sistem EleganMart (Updated)

## 1. Arsitektur Sistem
- **Backend Framework**: Express.js
- **Database**: JSON file-based storage (`data/db.json`) dengan mekanisme locking (`dbLock`) untuk mencegah race condition.
- **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES6+).
- **Payment Gateway**: Midtrans Snap integration.
- **File Upload**: Multer dengan validasi tipe MIME dan ukuran file (max 2MB).

## 2. Fitur Keamanan (Updated)
- **Otentikasi & Otorisasi**:
  - Middleware `requireAuth` untuk memproteksi rute pengguna.
  - Middleware `requireAdmin` untuk memproteksi rute admin dan API manajemen produk.
  - Password di-hash menggunakan `bcryptjs`.
- **Proteksi CSRF**: Token CSRF diimplementasikan pada semua endpoint API yang memodifikasi data (POST, PUT, DELETE).
- **Rate Limiting**: Pembatasan request pada endpoint sensitif (login, register) untuk mencegah brute force.
- **Input Validation**: Validasi ketat pada input pengguna (email, password, harga, stok) di sisi server.
- **Secure File Upload**: Hanya mengizinkan file gambar (JPEG, PNG, GIF, WEBP) dengan ukuran maksimal 2MB.
- **Environment Variables**: Konfigurasi sensitif (SESSION_SECRET, MIDTRANS_KEY) dimuat dari environment variables, tidak hardcoded.

## 3. Spesifikasi Frontend
- **Desain Responsif**: Layout beradaptasi untuk desktop dan mobile.
- **Navigasi Mobile**: Menu hamburger (`.nav-toggle`) yang responsif dengan animasi transisi.
- **Aksesibilitas (A11y)**:
  - Penggunaan elemen semantik HTML5.
  - `aria-label` pada tombol interaktif.
  - Asosiasi label form yang benar (`for` attribute).
  - Fokus keyboard yang jelas.
- **Manajemen State**:
  - Indikator loading dan error pada setiap operasi fetch data.
  - Sinkronisasi keranjang belanja antara localStorage dan server saat user login.
- **Performa**: Lazy loading pada gambar produk.
- **SEO**: Meta tags, Open Graph tags, dan canonical links pada setiap halaman.

## 4. API Endpoints Utama
- **Auth**:
  - `POST /api/login`, `POST /api/register`, `POST /api/logout`
  - `POST /api/admin/login`
- **Produk**:
  - `GET /api/products` (Public)
  - `POST /api/products` (Admin only)
  - `PUT /api/products/:id` (Admin only)
  - `DELETE /api/products/:id` (Admin only)
  - `PUT /api/products/:id/stock` (Admin only)
  - `PUT /api/products/:id/price` (Admin only)
- **Keranjang**:
  - `GET /api/cart` (User only)
  - `PUT /api/cart` (User only)
- **Pesanan**:
  - `POST /api/payment/create` (User only)
  - `GET /api/orders` (User only)
  - `POST /api/payment/notification` (Webhook Midtrans)

## 5. Skema Data (JSON)
- **Products**: `id`, `title`, `price`, `description`, `image`, `stock`, `category_id`, `created_at`
- **Users**: `id`, `name`, `email`, `password` (hashed), `phone`, `role` ('admin' | 'customer')
- **Orders**: `id`, `user_id`, `items`, `total`, `status`, `payment_token`, `created_at`
- **Carts**: Key-value pair `userId`: `[{ id, qty }]`
- **Categories**: `id`, `name`, `slug`
