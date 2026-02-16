const elCartList = document.getElementById('cartList');
const elCartEmpty = document.getElementById('cartEmpty');
const elCartTotal = document.getElementById('cartTotal');
const elCheckoutBtn = document.getElementById('checkoutBtn');

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

function readCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function writeCart(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}

async function getCartItems() {
  if (window.cartStore) return window.cartStore.get();
  return readCart();
}

async function saveCartItems(items) {
  if (window.cartStore) return window.cartStore.set(items);
  writeCart(items);
  return items;
}

async function renderCart() {
  if (!elCartList) return;
  const cart = await getCartItems();
  elCartList.innerHTML = '';
  if (cart.length === 0) {
    elCartEmpty.hidden = false;
    if (elCartTotal) elCartTotal.textContent = rupiah(0);
    return;
  }
  elCartEmpty.hidden = true;
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-row';
    const left = document.createElement('div');
    left.className = 'cart-info';
    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = item.title;
    const meta = document.createElement('div');
    meta.className = 'product-desc';
    meta.textContent = `${item.qty} x ${rupiah(item.price)}`;
    left.append(title, meta);
    const actions = document.createElement('div');
    actions.className = 'cart-actions';
    const qty = document.createElement('input');
    qty.type = 'number';
    qty.min = '1';
    qty.value = item.qty;
    qty.onchange = async () => {
      const v = Math.max(1, Number(qty.value || 1));
      item.qty = v;
      await saveCartItems(cart);
      renderCart();
    };
    const remove = document.createElement('button');
    remove.className = 'btn-danger';
    remove.textContent = 'Hapus';
    remove.onclick = async () => {
      const next = cart.filter((c) => c.id !== item.id);
      await saveCartItems(next);
      renderCart();
    };
    actions.append(qty, remove);
    const subtotal = document.createElement('div');
    subtotal.className = 'cart-subtotal';
    subtotal.textContent = rupiah(item.price * item.qty);
    row.append(left, actions, subtotal);
    elCartList.appendChild(row);
  });
  if (elCartTotal) elCartTotal.textContent = rupiah(total);
}

renderCart();

if (elCheckoutBtn) {
  elCheckoutBtn.addEventListener('click', async () => {
    const cart = await getCartItems();
    if (cart.length === 0) {
      alert('Keranjang masih kosong');
      return;
    }
    window.location.href = '/checkout';
  });
}
