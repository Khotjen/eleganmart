# EleganMart - E-Commerce Sederhana

EleganMart adalah aplikasi e-commerce sederhana dengan panel admin, built dengan Node.js dan Express.

## Fitur

- 🛍️ Katalog produk dengan kategori
- 🛒 Keranjang belanja
- 💳 Integrasi pembayaran Midtrans
- 📱 Desain responsif dan mobile-friendly
- 🔐 Admin panel dengan otentikasi
- 📦 Manajemen produk dan pesanan
- 🚀 Performa cepat dengan skeleton loading

## Teknologi

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Database**: JSON file-based
- **Payment**: Midtrans
- **Deployment**: Vercel-ready

## Deploy ke Vercel

1. Fork repository ini
2. Import ke Vercel
3. Atur environment variables:
   - `SESSION_SECRET`: Secret key untuk session
   - `MIDTRANS_SERVER_KEY`: Server key dari Midtrans
   - `MIDTRANS_CLIENT_KEY`: Client key dari Midtrans
   - `ADMIN_EMAIL`: Email admin
   - `ADMIN_PASSWORD`: Password admin

## Local Development

```bash
npm install
npm start
```

Akses di `http://localhost:3000`

## Struktur Project

```
├── server.js          # Main server
├── public/            # Static files
├── data/              # Database JSON
└── vercel.json        # Vercel config
```

## Kontribusi

Silakan buat issue atau pull request untuk improvement.