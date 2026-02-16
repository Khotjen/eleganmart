const elOrdersList = document.getElementById('ordersList');
const elOrdersEmpty = document.getElementById('ordersEmpty');
const elOrdersLoading = document.getElementById('ordersLoading');
const elOrdersError = document.getElementById('ordersError');

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

function readOrders() {
  return JSON.parse(localStorage.getItem('orders') || '[]');
}

async function fetchOrders() {
  const res = await fetch('/api/orders');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data.orders) ? data.orders : [];
}

async function renderOrders() {
  if (!elOrdersList) return;
  if (elOrdersLoading) elOrdersLoading.hidden = false;
  if (elOrdersError) elOrdersError.hidden = true;
  let orders = [];
  try {
    const remote = await fetchOrders();
    orders = remote === null ? readOrders() : remote;
  } catch {
    orders = readOrders();
    if (elOrdersError) {
      elOrdersError.textContent = 'Gagal memuat pesanan. Menampilkan data lokal.';
      elOrdersError.hidden = false;
    }
  }
  elOrdersList.innerHTML = '';
  if (orders.length === 0) {
    elOrdersEmpty.hidden = false;
    if (elOrdersLoading) elOrdersLoading.hidden = true;
    return;
  }
  elOrdersEmpty.hidden = true;
  orders.forEach((order) => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const head = document.createElement('div');
    head.className = 'order-head';
    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = order.id;
    const status = document.createElement('div');
    status.className = 'badge';
    status.textContent = order.status;
    head.append(title, status);
    const meta = document.createElement('div');
    meta.className = 'product-desc';
    const createdAt = order.created_at || order.createdAt;
    meta.textContent = createdAt ? new Date(createdAt).toLocaleString('id-ID') : '-';
    const total = document.createElement('div');
    total.className = 'cart-subtotal';
    const amount = order.amount || order.total || 0;
    total.textContent = rupiah(amount);
    const actions = document.createElement('div');
    actions.className = 'order-actions';
    const link = document.createElement('a');
    link.className = 'btn-outline';
    link.href = `/tracking?id=${encodeURIComponent(order.id)}`;
    link.textContent = 'Lacak pesanan';
    actions.append(link);
    card.append(head, meta, total, actions);
    elOrdersList.appendChild(card);
  });
  if (elOrdersLoading) elOrdersLoading.hidden = true;
}

renderOrders();
