# Panduan Deploy EleganMart ke Vercel (Metode Alternatif)

Karena ada kendala permission dengan Vercel CLI, berikut metode alternatif untuk deploy:

## Metode 1: GitHub Integration (Recommended)

1. **Push kode ke GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/eleganmart.git
   git push -u origin main
   ```

2. **Import dari Vercel Dashboard**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan akun Anda
   - Klik "New Project"
   - Import dari GitHub repository
   - Configure environment variables
   - Deploy

## Metode 2: Manual Upload

1. **Persiapan file**
   - Pastikan semua file sudah siap
   - Environment variables sudah dikonfigurasi

2. **Upload via Vercel Dashboard**
   - Drag & drop folder project ke Vercel dashboard
   - Configure settings
   - Deploy

## Environment Variables yang Perlu Diatur:

```
SESSION_SECRET=your-secure-session-secret-key-here
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password
```

## Struktur File yang Sudah Siap:
- ✅ `vercel.json` - Konfigurasi Vercel
- ✅ `server.js` - Entry point aplikasi
- ✅ `package.json` - Dependencies
- ✅ `public/` - Static files
- ✅ `data/` - Database JSON