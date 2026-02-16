# Checklist Verifikasi Sistem

## 1. Verifikasi Keamanan
- [ ] Coba akses `/admin` tanpa login -> Harus redirect ke login atau error 403.
- [ ] Coba login admin dengan kredensial salah -> Harus muncul pesan error.
- [ ] Coba upload file bukan gambar (misal .txt) -> Harus ditolak server.
- [ ] Coba kirim request POST tanpa CSRF token -> Harus gagal (403 Forbidden).
- [ ] Coba brute force login (banyak request cepat) -> Harus kena rate limit.

## 2. Verifikasi Fungsionalitas User
- [ ] Register akun baru -> Berhasil login otomatis/manual.
- [ ] Tambah produk ke keranjang -> Cart count bertambah.
- [ ] Login di device lain -> Isi keranjang harus sinkron.
- [ ] Checkout barang -> Stok berkurang di database.
- [ ] Cek riwayat pesanan -> Pesanan baru muncul di `/pesanan`.

## 3. Verifikasi UI/UX & Mobile
- [ ] Buka di layar kecil (< 768px) -> Menu navigasi jadi hamburger.
- [ ] Klik tombol hamburger -> Menu sidebar/dropdown muncul.
- [ ] Navigasi dengan keyboard (Tab) -> Fokus terlihat jelas pada elemen interaktif.
- [ ] Loading state muncul saat fetch data lambat (simulasi network throttle).

## 4. Verifikasi Admin
- [ ] Login admin -> Masuk ke dashboard `/admin`.
- [ ] Tambah produk baru -> Muncul di daftar produk.
- [ ] Edit harga/stok produk -> Perubahan tersimpan.
- [ ] Hapus produk -> Produk hilang dari katalog.
