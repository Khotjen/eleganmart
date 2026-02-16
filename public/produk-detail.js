const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

const elImage = document.getElementById('detailImage');
const elTitle = document.getElementById('detailTitle');
const elPrice = document.getElementById('detailPrice');
const elDesc = document.getElementById('detailDesc');
const elCategory = document.getElementById('detailCategory');
const elEmpty = document.getElementById('detailEmpty');
const elAddToCart = document.getElementById('addToCartBtn');
const elLoading = document.getElementById('detailLoading');

function setLoading(isLoading) {
  if (!elLoading) return;
  if (isLoading) {
    elLoading.hidden = false;
    elLoading.innerHTML = `
      <div class="detail-layout">
        <div class="skeleton" style="height: 400px; width: 100%; border-radius: 16px;"></div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="skeleton skeleton-text" style="width: 60%; height: 32px;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; height: 24px;"></div>
          <div class="skeleton skeleton-text" style="width: 100%; height: 100px;"></div>
        </div>
      </div>
    `;
    // Hide actual content while loading
    if (elImage) elImage.style.display = 'none';
  } else {
    elLoading.hidden = true;
    if (elImage) elImage.style.display = 'block';
  }
}

async function loadDetail() {
  setLoading(true);
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    elEmpty.textContent = 'Produk tidak ditemukan.';
    elEmpty.hidden = false;
    setLoading(false);
    return;
  }
  try {
    const categories = await fetchJSON('/api/categories');
    const products = await fetchJSON('/api/products');
    const product = products.find((p) => p.id === id);
    if (!product) {
      elEmpty.textContent = 'Produk tidak ditemukan.';
      elEmpty.hidden = false;
      setLoading(false);
      return;
    }
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    if (elImage) elImage.src = product.image ? `/${product.image}` : 'https://picsum.photos/seed/placeholder/800/600';
    if (elTitle) elTitle.textContent = product.title;
    if (elPrice) elPrice.textContent = rupiah(product.price);
    if (elDesc) elDesc.textContent = product.description || 'Deskripsi belum tersedia';
    if (elCategory) elCategory.textContent = categoryMap[product.categoryId] || 'Umum';
    
    if (elAddToCart) {
      elAddToCart.onclick = async () => {
        const cartStore = window.cartStore;
        if (cartStore) {
          const cart = await cartStore.get();
          const found = cart.find((c) => c.id === product.id);
          if (found) found.qty += 1;
          else cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
          await cartStore.set(cart);
          if (window.showToast) window.showToast('Ditambahkan ke cart');
          else alert('Ditambahkan ke cart');
        }
      };
    }
  } catch (error) {
    console.error(error);
    elEmpty.textContent = 'Gagal memuat produk.';
    elEmpty.hidden = false;
    if (window.showToast) window.showToast('Gagal memuat produk', 'error');
  } finally {
    setLoading(false);
  }
}

loadDetail();
