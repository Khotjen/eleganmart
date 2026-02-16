const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const crypto = require('crypto');
const midtransClient = require('midtrans-client');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!process.env.SESSION_SECRET) {
  console.warn('Warning: SESSION_SECRET is not set. Using insecure default for development only.');
}
if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  console.warn('Warning: MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY not set. Payment will fail.');
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn('Warning: ADMIN_EMAIL / ADMIN_PASSWORD not set. Admin login will be disabled.');
}

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  // Allow Chrome extensions for development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';");
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
  }
  next();
});

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

function ensureDirs() {
  [PUBLIC_DIR, DATA_DIR, UPLOADS_DIR].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ categories: [], products: [] }, null, 2));
  }
}
ensureDirs();

function readDB() {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let dbLock = Promise.resolve();
function withDbLock(fn) {
  const run = () => Promise.resolve().then(fn);
  dbLock = dbLock.then(run, run);
  return dbLock;
}
function updateDB(mutator) {
  return withDbLock(() => {
    const db = readDB();
    const result = mutator(db);
    writeDB(db);
    return result;
  });
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Silakan login terlebih dahulu' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) {
    return res.status(403).json({ error: 'Akses admin diperlukan' });
  }
  next();
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    const name = `${Date.now()}-${base}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Hanya file gambar yang diizinkan'));
    }
    cb(null, true);
  },
});

app.use(express.static(PUBLIC_DIR, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));

app.get('/api/csrf', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = uuidv4();
  }
  res.json({ token: req.session.csrfToken });
});

app.use('/api', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  if (req.path === '/payment/notification') {
    return next();
  }
  if (req.path === '/csrf') {
    return next();
  }
  const token = req.get('x-csrf-token');
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF token tidak valid' });
  }
  next();
});

function isNonEmptyString(v, min = 1, max = 200) {
  if (typeof v !== 'string') return false;
  const s = v.trim();
  return s.length >= min && s.length <= max;
}

function isValidEmail(v) {
  if (typeof v !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCartPayload(items) {
  if (!Array.isArray(items)) {
    const err = new Error('Item cart tidak valid');
    err.status = 400;
    throw err;
  }
  if (items.length === 0) return [];
  const qtyMap = new Map();
  for (const item of items) {
    const id = String(item?.id || '').trim();
    const qty = toNumber(item?.qty);
    if (!id || qty === null || qty <= 0) {
      const err = new Error('Item cart tidak valid');
      err.status = 400;
      throw err;
    }
    qtyMap.set(id, (qtyMap.get(id) || 0) + qty);
  }
  return Array.from(qtyMap.entries()).map(([id, qty]) => ({ id, qty }));
}

function materializeCartItems(items, db) {
  const productsById = new Map((db.products || []).map((p) => [p.id, p]));
  const result = [];
  let total = 0;
  for (const item of items) {
    const product = productsById.get(item.id);
    if (!product) {
      const err = new Error('Produk tidak ditemukan');
      err.status = 400;
      throw err;
    }
    const price = toNumber(product.price);
    const qty = toNumber(item.qty);
    if (price === null || price < 0 || qty === null || qty <= 0) {
      const err = new Error('Item cart tidak valid');
      err.status = 400;
      throw err;
    }
    const stockNumber = product.stock === null || product.stock === undefined ? null : toNumber(product.stock);
    if (stockNumber !== null && qty > stockNumber) {
      const err = new Error(`Stok tidak cukup untuk ${product.title}`);
      err.status = 400;
      throw err;
    }
    result.push({ id: product.id, name: product.title, price, qty });
    total += price * qty;
  }
  return { items: result, total };
}

function rateLimit({ keyPrefix, windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${req.ip}`;
    const entry = hits.get(key) || { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) {
      return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
    }
    next();
  };
}

const authLimiter = rateLimit({ keyPrefix: 'auth', windowMs: 10 * 60 * 1000, max: 20 });
const adminLimiter = rateLimit({ keyPrefix: 'admin', windowMs: 10 * 60 * 1000, max: 20 });

app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

app.post('/api/categories', requireAdmin, async (req, res, next) => {
  const { name } = req.body;
  if (!isNonEmptyString(name, 2, 60)) return res.status(400).json({ error: 'Nama kategori wajib' });
  try {
    const category = await updateDB((db) => {
      const exists = db.categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
      if (exists) {
        const err = new Error('Kategori sudah ada');
        err.status = 409;
        throw err;
      }
      const item = { id: `cat_${Date.now()}`, name: name.trim() };
      db.categories.push(item);
      return item;
    });
    res.json(category);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.post('/api/products', requireAdmin, upload.single('image'), async (req, res, next) => {
  const { title, description, price, categoryId, stock } = req.body;
  if (!isNonEmptyString(title, 3, 120)) return res.status(400).json({ error: 'Judul wajib (min 3 karakter)' });
  const priceNumber = toNumber(price);
  if (priceNumber === null || priceNumber < 0) return res.status(400).json({ error: 'Harga tidak valid' });
  if (description && !isNonEmptyString(String(description), 0, 500)) {
    return res.status(400).json({ error: 'Deskripsi terlalu panjang' });
  }
  const stockNumber = stock === undefined || stock === '' ? null : toNumber(stock);
  if (stockNumber !== null && stockNumber < 0) return res.status(400).json({ error: 'Stok tidak valid' });
  try {
    const product = await updateDB((db) => {
      const category = db.categories.find((c) => c.id === categoryId);
      if (!category && categoryId) {
        const err = new Error('Kategori tidak ditemukan');
        err.status = 400;
        throw err;
      }
      const item = {
        id: `prd_${Date.now()}`,
        title: String(title).trim(),
        description: String(description || '').trim(),
        price: priceNumber,
        stock: stockNumber,
        categoryId: category ? category.id : null,
        image: req.file ? `uploads/${req.file.filename}` : null,
        createdAt: new Date().toISOString(),
      };
      db.products.push(item);
      return item;
    });
    res.json(product);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

app.put('/api/products/:id/price', requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { price } = req.body;
  const priceNumber = toNumber(price);
  if (priceNumber === null || priceNumber < 0) return res.status(400).json({ error: 'Harga tidak valid' });
  try {
    const product = await updateDB((db) => {
      const item = db.products.find((p) => p.id === id);
      if (!item) {
        const err = new Error('Produk tidak ditemukan');
        err.status = 404;
        throw err;
      }
      item.price = priceNumber;
      return item;
    });
    res.json(product);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

app.put('/api/products/:id/stock', requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { stock } = req.body;
  const stockNumber = toNumber(stock);
  if (stockNumber === null || stockNumber < 0) return res.status(400).json({ error: 'Stok tidak valid' });
  try {
    const product = await updateDB((db) => {
      const item = db.products.find((p) => p.id === id);
      if (!item) {
        const err = new Error('Produk tidak ditemukan');
        err.status = 404;
        throw err;
      }
      item.stock = stockNumber;
      return item;
    });
    res.json(product);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  try {
    let removed = null;
    await updateDB((db) => {
      const idx = db.products.findIndex((p) => p.id === id);
      if (idx === -1) {
        const err = new Error('Produk tidak ditemukan');
        err.status = 404;
        throw err;
      }
      removed = db.products.splice(idx, 1)[0];
      return removed;
    });
    if (removed?.image) {
      const filePath = path.join(PUBLIC_DIR, removed.image);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }
    res.json({ success: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
app.get('/admin', (req, res) => {
  if (req.session?.isAdmin) {
    return res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
  }
  return res.sendFile(path.join(PUBLIC_DIR, 'admin-login.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'about.html'));
});
app.get('/produk', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'produk.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'register.html'));
});
app.get('/cart', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'cart.html'));
});
app.get('/produk-detail', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'produk-detail.html'));
});
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'checkout.html'));
});
app.get('/order-sukses', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'order-sukses.html'));
});
app.get('/akun', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'akun.html'));
});
app.get('/pesanan', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pesanan.html'));
});
app.get('/lupa-password', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'lupa-password.html'));
});
app.get('/kontak', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'kontak.html'));
});
app.get('/faq', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'faq.html'));
});
app.get('/tracking', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'tracking.html'));
});

app.post('/api/admin/login', adminLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin credentials belum dikonfigurasi' });
  }
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Email atau password admin salah' });
  }
  req.session.isAdmin = true;
  req.session.userId = req.session.userId || 'admin';
  res.json({ message: 'Login admin berhasil' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ message: 'Logout admin berhasil' });
});

app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('Hanya file gambar')) {
    return res.status(400).json({ error: err.message });
  }
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file terlalu besar (maks 2MB)' });
  }
  next(err);
});

app.post('/api/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!isNonEmptyString(name, 2, 80)) {
      return res.status(400).json({ error: 'Nama tidak valid' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email tidak valid' });
    }
    if (!isNonEmptyString(password, 6, 100)) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }
    if (phone && !isNonEmptyString(String(phone), 6, 20)) {
      return res.status(400).json({ error: 'Nomor telepon tidak valid' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await updateDB((db) => {
      if (!db.users) db.users = [];
      if (db.users.find(u => u.email === email)) {
        const err = new Error('Email sudah terdaftar');
        err.status = 400;
        throw err;
      }
      const item = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        phone,
        createdAt: new Date().toISOString()
      };
      db.users.push(item);
      return item;
    });
    
    req.session.userId = user.id;
    res.json({ message: 'Registrasi berhasil', user: { id: user.id, name, email, phone } });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    
    if (!db.users) db.users = [];
    if (!isValidEmail(email) || !isNonEmptyString(password, 1, 100)) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    const user = db.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    req.session.userId = user.id;
    res.json({ message: 'Login berhasil', user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout berhasil' });
});

app.get('/api/cart', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const rawItems = db.carts?.[req.session.userId] || [];
    const { items } = materializeCartItems(rawItems, db);
    res.json({ items });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    res.status(500).json({ error: 'Gagal memuat cart' });
  }
});

app.put('/api/cart', requireAuth, async (req, res, next) => {
  try {
    const normalized = normalizeCartPayload(req.body?.items || []);
    const items = await updateDB((db) => {
      const { items: materialized } = materializeCartItems(normalized, db);
      if (!db.carts) db.carts = {};
      db.carts[req.session.userId] = normalized;
      return materialized;
    });
    res.json({ items });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

app.get('/api/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const db = readDB();
  const user = db.users?.find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

app.post('/api/payment/create', requireAuth, async (req, res) => {
  try {
    const { total_amount, items } = req.body;
    const db = readDB();
    const user = db.users?.find(u => u.id === req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalNumber = toNumber(total_amount);
    if (totalNumber === null || totalNumber <= 0) {
      return res.status(400).json({ error: 'Total pembayaran tidak valid' });
    }
    const normalized = normalizeCartPayload(items);
    const materialized = materializeCartItems(normalized, db);
    if (totalNumber !== materialized.total) {
      return res.status(400).json({ error: 'Total pembayaran tidak valid' });
    }
    
    const order_id = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;
    
    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: materialized.total
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone
      },
      item_details: materialized.items.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.qty,
        name: item.name
      }))
    };
    
    const transaction = await snap.createTransaction(parameter);
    
    await updateDB((db) => {
      if (!db.orders) db.orders = [];
      db.orders.push({
        id: order_id,
        user_id: user.id,
        amount: materialized.total,
        status: 'pending',
        items: materialized.items,
        created_at: new Date().toISOString(),
        snap_token: transaction.token,
        snap_redirect_url: transaction.redirect_url
      });
    });
    
    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: order_id
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

app.post('/api/payment/notification', async (req, res) => {
  try {
    const notification = req.body;
    await updateDB((db) => {
      if (!db.orders) db.orders = [];
      const order = db.orders.find(o => o.id === notification.order_id);
      if (order) {
        order.status = notification.transaction_status;
        order.payment_type = notification.payment_type;
        order.payment_time = notification.transaction_time;
        order.updated_at = new Date().toISOString();
      }
    });
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Notification processing failed' });
  }
});

app.get('/api/orders', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const userOrders = db.orders?.filter(o => o.user_id === req.session.userId) || [];
    res.json({ orders: userOrders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}/`);
});
