# Environment Variables for Vercel Deployment

Untuk deploy ke Vercel, Anda perlu mengatur environment variables berikut:

## Cara Mengatur Environment Variables di Vercel:

1. **Login ke Vercel Dashboard**
2. **Pilih project EleganMart**
3. **Klik tab Settings**
4. **Klik Environment Variables**
5. **Tambahkan variables berikut:**

```
SESSION_SECRET=your-secure-session-secret-key-here
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password
```

## Atau via Vercel CLI:

```bash
vercel env add SESSION_SECRET
vercel env add MIDTRANS_SERVER_KEY
vercel env add MIDTRANS_CLIENT_KEY
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
```

## Catatan Penting:
- SESSION_SECRET: Gunakan string acak yang panjang (min 32 karakter)
- MIDTRANS keys: Dapatkan dari dashboard Midtrans
- ADMIN_EMAIL & ADMIN_PASSWORD: Untuk login admin panel
- Semua values akan terenkripsi di Vercel