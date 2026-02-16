# Panduan Deploy EleganMart ke Vercel (Langkah-demi-Langkah)

## Langkah 1: Buat Repository GitHub

1. Buka [github.com](https://github.com)
2. Login ke akun Anda
3. Klik tombol "+" di pojok kanan atas
4. Pilih "New repository"
5. Nama repository: `eleganmart`
6. Deskripsi: "E-commerce sederhana dengan panel admin"
7. Pilih "Public"
8. JANGAN centang "Initialize this repository with a README"
9. Klik "Create repository"

## Langkah 2: Upload File ke GitHub

1. Di halaman repository baru, klik "uploading an existing file"
2. Drag & drop SEMUA file dari folder `C:\Users\user\Documents\web` ke browser
3. PASTIKAN file-file ini ada:
   - ✅ `server.js`
   - ✅ `package.json`
   - ✅ `vercel.json`
   - ✅ `public/` folder (dengan semua file HTML, CSS, JS)
   - ✅ `data/` folder (dengan `db.json`)
   - ✅ `.gitignore`
   - ✅ `README.md`
4. Tulis commit message: "Initial commit - EleganMart ready for Vercel"
5. Klik "Commit changes"

## Langkah 3: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun Anda (bisa pakai GitHub)
3. Klik "New Project"
4. Import dari GitHub repository `eleganmart`
5. Configure Environment Variables:
   ```
   SESSION_SECRET=your-secure-session-secret-key-here
   MIDTRANS_SERVER_KEY=your-midtrans-server-key
   MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your-secure-admin-password
   ```
6. Klik "Deploy"

## Langkah 4: Verifikasi Deployment

Setelah selesai, Anda akan mendapat URL seperti:
`https://eleganmart-xyz123.vercel.app`

## Catatan Penting:

- Semua file sudah siap untuk production
- Database akan disimpan di Vercel (JSON file)
- Admin panel tersedia di `/admin`
- Pastikan environment variables diisi dengan benar

## Alternatif: Download ZIP

Jika ingin cara lebih mudah:
1. Buat repository di GitHub
2. Saya akan bantu buat ZIP file untuk diupload
3. Upload ZIP ke GitHub
4. Lanjutkan dengan Vercel deployment