const elCheckoutItems = document.getElementById('checkoutItems');
const elCheckoutTotal = document.getElementById('checkoutTotal');
const elCheckoutEmpty = document.getElementById('checkoutEmpty');
const elCheckoutForm = document.getElementById('checkoutForm');
const elCheckoutError = document.getElementById('checkoutError');
const elCheckoutLoading = document.getElementById('checkoutLoading');
const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

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

function setLoading(isLoading) {
  if (!elCheckoutLoading) return;
  elCheckoutLoading.hidden = !isLoading;
}

function setError(message) {
  if (!elCheckoutError) return;
  elCheckoutError.textContent = message;
  elCheckoutError.hidden = !message;
}

async function renderCheckout() {
  setLoading(true);
  setError('');
  const cart = await getCartItems();
  elCheckoutItems.innerHTML = '';
  if (cart.length === 0) {
    elCheckoutEmpty.hidden = false;
    if (elCheckoutTotal) elCheckoutTotal.textContent = rupiah(0);
    setLoading(false);
    return;
  }
  elCheckoutEmpty.hidden = true;
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'checkout-row';
    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = item.title;
    const meta = document.createElement('div');
    meta.className = 'product-desc';
    meta.textContent = `${item.qty} x ${rupiah(item.price)}`;
    const subtotal = document.createElement('div');
    subtotal.className = 'cart-subtotal';
    subtotal.textContent = rupiah(item.price * item.qty);
    row.append(title, meta, subtotal);
    elCheckoutItems.appendChild(row);
  });
  if (elCheckoutTotal) elCheckoutTotal.textContent = rupiah(total);
  setLoading(false);
}

if (elCheckoutForm) {
  elCheckoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cart = await getCartItems();
    if (cart.length === 0) {
      setError('Keranjang kosong.');
      return;
    }
    
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    try {
      setError('');
      const paymentData = await fetchJSON('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_amount: totalAmount,
          items: cart.map(item => ({
            id: item.id,
            name: item.title,
            price: item.price,
            qty: item.qty
          }))
        })
      });
      window.location.href = paymentData.redirect_url;
    } catch (error) {
      console.error('Payment error:', error);
      setError('Gagal membuat pembayaran. Coba lagi.');
    }
  });
}

renderCheckout();
