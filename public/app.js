const elProducts = document.getElementById('products');
const elCategoryFilter = document.getElementById('categoryFilter');
const elSearchInput = document.getElementById('searchInput');
const elCartCount = document.getElementById('cartCount');
const elStatProducts = document.getElementById('statProducts');
const elStatCategories = document.getElementById('statCategories');
const elEmptyState = document.getElementById('emptyState');
const elLoadingState = document.getElementById('loadingState');
const elErrorState = document.getElementById('errorState');
const elBtnShop = document.getElementById('btnShop');

// --- Toast Notification Helper ---
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

let categories = [];
let products = [];

// --- Skeleton Loading ---
function renderSkeleton() {
  if (!elProducts) return;
  elProducts.innerHTML = '';
  // Show 6 skeleton cards
  for (let i = 0; i < 6; i++) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image skeleton"></div>
      <div class="product-body">
        <div class="skeleton skeleton-text" style="width: 40%"></div>
        <div class="skeleton skeleton-text" style="width: 80%"></div>
        <div class="skeleton skeleton-text" style="width: 60%"></div>
        <div class="product-footer">
           <div class="skeleton skeleton-text" style="width: 30%"></div>
           <div class="skeleton skeleton-text" style="width: 30%"></div>
        </div>
      </div>
    `;
    elProducts.appendChild(card);
  }
}

async function load() {
  setLoading(true);
  setError('');
  try {
    categories = await fetchJSON('/api/categories');
    products = await fetchJSON('/api/products');
    renderFilters();
    renderProducts();
    renderStats();
    updateCartCount();
  } catch (err) {
    setError('Gagal memuat produk. Coba muat ulang.');
    showToast('Gagal memuat data', 'error');
  } finally {
    setLoading(false);
  }
}

function renderFilters() {
  if (!elCategoryFilter) return;
  elCategoryFilter.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.textContent = 'Semua';
  elCategoryFilter.appendChild(optAll);
  for (const c of categories) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    elCategoryFilter.appendChild(opt);
  }
}

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

function renderProducts() {
  if (!elProducts || !elCategoryFilter || !elSearchInput) return;
  const cat = elCategoryFilter.value;
  const q = elSearchInput.value.trim().toLowerCase();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const list = products.filter((p) => {
    const okCat = !cat || p.categoryId === cat;
    const okQ = !q || (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    return okCat && okQ;
  });
  elProducts.innerHTML = '';
  if (elEmptyState) elEmptyState.hidden = list.length > 0;
  for (const p of list) {
    const card = document.createElement('div');
    card.className = 'product-card';
    const img = document.createElement('img');
    img.src = p.image ? `/${p.image}` : 'https://picsum.photos/seed/placeholder/400/300';
    img.alt = p.title;
    img.className = 'product-image';
    img.loading = 'lazy';
    const content = document.createElement('div');
    content.className = 'product-body';
    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = p.title;
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = rupiah(p.price);
    const desc = document.createElement('div');
    desc.className = 'product-desc';
    desc.textContent = p.description || 'Deskripsi belum tersedia';
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = categoryMap[p.categoryId] || 'Umum';
    const footer = document.createElement('div');
    footer.className = 'product-footer';
    const link = document.createElement('a');
    link.className = 'btn-outline';
    link.href = `/produk-detail?id=${encodeURIComponent(p.id)}`;
    link.textContent = 'Detail';
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Beli';
    btn.onclick = () => addToCart(p);
    footer.append(price, link, btn);
    content.append(badge, title, desc, footer);
    card.append(img, content);
    elProducts.appendChild(card);
  }
}

function readLocalCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function writeLocalCart(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}

function mergeCarts(base, extra) {
  const map = new Map();
  for (const item of base) map.set(item.id, { ...item });
  for (const item of extra) {
    const prev = map.get(item.id);
    if (prev) prev.qty += item.qty;
    else map.set(item.id, { ...item });
  }
  return Array.from(map.values());
}

let cartCache = null;
let cartPromise = null;

async function fetchServerCart() {
  const res = await fetch('/api/cart');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

async function saveServerCart(items) {
  try {
    const res = await fetchJSON('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })) })
    });
    return Array.isArray(res.items);
  } catch {
    return false;
  }
}

async function getCart() {
  if (cartCache) return cartCache;
  if (cartPromise) return cartPromise;
  cartPromise = (async () => {
    let cart = null;
    try {
      cart = await fetchServerCart();
    } catch {
      cart = null;
    }
    if (cart) {
      const local = readLocalCart();
      if (local.length > 0) {
        const merged = mergeCarts(cart, local);
        const saved = await saveServerCart(merged);
        if (saved) {
          writeLocalCart([]);
          cartCache = merged;
          return merged;
        }
        cartCache = merged;
        return merged;
      }
      cartCache = cart;
      return cart;
    }
    cartCache = readLocalCart();
    return cartCache;
  })();
  return cartPromise;
}

async function setCart(items) {
  cartCache = items;
  const saved = await saveServerCart(items);
  if (!saved) writeLocalCart(items);
  return items;
}

async function addToCart(product) {
  const cart = await getCart();
  const found = cart.find((c) => c.id === product.id);
  if (found) found.qty += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
  await setCart(cart);
  updateCartCount();
  showToast('Ditambahkan ke keranjang');
}

async function updateCartCount() {
  if (!elCartCount) return;
  const cart = await getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  elCartCount.textContent = String(total);
}

function setLoading(isLoading) {
  if (isLoading) {
    if (elLoadingState) elLoadingState.hidden = true; // Hide text loading
    renderSkeleton(); // Show skeleton
  } else {
    // Skeleton is removed when renderProducts is called
  }
}

function setError(message) {
  if (!elErrorState) return;
  elErrorState.textContent = message;
  elErrorState.hidden = !message;
}

function renderStats() {
  if (elStatProducts) elStatProducts.textContent = String(products.length);
  if (elStatCategories) elStatCategories.textContent = String(categories.length);
}

if (elCategoryFilter && elSearchInput) {
  elCategoryFilter.addEventListener('change', renderProducts);
  elSearchInput.addEventListener('input', renderProducts);
}
if (elBtnShop && elProducts) {
  elBtnShop.addEventListener('click', () => {
    elProducts.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
updateCartCount();
if (elProducts) {
  load().catch((e) => console.error(e));
}

window.cartStore = { get: getCart, set: setCart, readLocal: readLocalCart, writeLocal: writeLocalCart };
window.csrfFetchJSON = fetchJSON;
window.showToast = showToast;