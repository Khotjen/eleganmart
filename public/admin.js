const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

const elCatName = document.getElementById('catName');
const elBtnAddCat = document.getElementById('btnAddCat');
const elCatList = document.getElementById('catList');
const elProductForm = document.getElementById('productForm');
const elProductCat = document.getElementById('productCat');
const elAdminProducts = document.getElementById('adminProducts');
const elAdminStatsProducts = document.getElementById('adminStatsProducts');
const elAdminStatsCategories = document.getElementById('adminStatsCategories');
const elBtnAdminLogout = document.getElementById('btnAdminLogout');
const elAdminLoading = document.getElementById('adminLoading');
const elAdminError = document.getElementById('adminError');

let categories = [];
let products = [];

async function loadData() {
  if (elAdminLoading) elAdminLoading.hidden = false;
  if (elAdminError) elAdminError.hidden = true;
  try {
    categories = await fetchJSON('/api/categories');
    products = await fetchJSON('/api/products');
    renderCategories();
    renderProductCat();
    renderProducts();
  } catch (error) {
    if (elAdminError) {
      elAdminError.textContent = 'Gagal memuat data admin.';
      elAdminError.hidden = false;
    }
  } finally {
    if (elAdminLoading) elAdminLoading.hidden = true;
  }
}

function renderCategories() {
  elCatList.innerHTML = categories.map((c) => `* ${c.name}`).join('<br/>');
  if (elAdminStatsCategories) elAdminStatsCategories.textContent = String(categories.length);
}
function renderProductCat() {
  elProductCat.innerHTML = '<option value="">Tanpa kategori</option>';
  for (const c of categories) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    elProductCat.appendChild(opt);
  }
}

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

function renderProducts() {
  elAdminProducts.innerHTML = '';
  if (elAdminStatsProducts) elAdminStatsProducts.textContent = String(products.length);
  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'admin-card';
    const img = document.createElement('img');
    img.src = p.image ? `/${p.image}` : 'https://picsum.photos/seed/placeholder/400/300';
    img.alt = p.title;
    img.className = 'admin-image';
    img.loading = 'lazy';
    const content = document.createElement('div');
    content.className = 'admin-body';
    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = p.title;
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = rupiah(p.price);
    const editWrap = document.createElement('div');
    editWrap.className = 'controls';
    const inputPrice = document.createElement('input');
    inputPrice.type = 'number';
    inputPrice.value = p.price;
    const inputStock = document.createElement('input');
    inputStock.type = 'number';
    inputStock.placeholder = 'Stok';
    inputStock.value = p.stock ?? '';
    const btnUpdate = document.createElement('button');
    btnUpdate.textContent = 'Update harga';
    btnUpdate.onclick = async () => {
      const v = Number(inputPrice.value);
      await fetchJSON(`/api/products/${p.id}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: v }),
      });
      await loadData();
    };
    const btnUpdateStock = document.createElement('button');
    btnUpdateStock.textContent = 'Update stok';
    btnUpdateStock.onclick = async () => {
      const v = Number(inputStock.value);
      await fetchJSON(`/api/products/${p.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: v }),
      });
      await loadData();
    };
    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-danger';
    btnDelete.textContent = 'Hapus';
    btnDelete.onclick = async () => {
      if (!confirm('Hapus produk?')) return;
      await fetchJSON(`/api/products/${p.id}`, { method: 'DELETE' });
      await loadData();
    };
    editWrap.append(inputPrice, btnUpdate, inputStock, btnUpdateStock, btnDelete);
    content.append(title, price, editWrap);
    card.append(img, content);
    elAdminProducts.appendChild(card);
  }
}

elBtnAddCat.addEventListener('click', async () => {
  const name = elCatName.value.trim();
  if (!name) return alert('Isi nama kategori');
  try {
    await fetchJSON('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    elCatName.value = '';
    await loadData();
  } catch (e) {
    if (elAdminError) {
      elAdminError.textContent = 'Gagal membuat kategori. Coba lagi.';
      elAdminError.hidden = false;
    }
  }
});

elProductForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const form = new FormData(elProductForm);
  try {
    await fetchJSON('/api/products', { method: 'POST', body: form });
    elProductForm.reset();
    await loadData();
  } catch (e) {
    if (elAdminError) {
      elAdminError.textContent = 'Gagal unggah produk. Coba lagi.';
      elAdminError.hidden = false;
    }
  }
});

loadData().catch((e) => console.error(e));

if (elBtnAdminLogout) {
  elBtnAdminLogout.addEventListener('click', async () => {
    try {
      await fetchJSON('/api/admin/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/admin';
  });
}
