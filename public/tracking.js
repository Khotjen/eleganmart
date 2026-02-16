const elTrackingForm = document.getElementById('trackingForm');
const elTrackingInput = document.getElementById('trackingInput');
const elTrackingResult = document.getElementById('trackingResult');

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

function renderResult(order) {
  if (!elTrackingResult) return;
  if (!order) {
    elTrackingResult.innerHTML = '<div class="product-desc">Order tidak ditemukan.</div>';
    return;
  }
  const createdAt = order.created_at || order.createdAt;
  elTrackingResult.innerHTML = `
    <div class="order-card">
      <div class="order-head">
        <div class="product-title">${order.id}</div>
        <div class="badge">${order.status}</div>
      </div>
      <div class="product-desc">${createdAt ? new Date(createdAt).toLocaleString('id-ID') : '-'}</div>
      <div class="tracking-steps">
        <div class="tracking-step active">Order diterima</div>
        <div class="tracking-step">Dikemas</div>
        <div class="tracking-step">Dikirim</div>
        <div class="tracking-step">Sampai tujuan</div>
      </div>
    </div>
  `;
}

async function findOrderById(id) {
  try {
    const remote = await fetchOrders();
    if (remote) return remote.find((o) => o.id === id);
  } catch {}
  const orders = readOrders();
  return orders.find((o) => o.id === id);
}

if (elTrackingForm) {
  elTrackingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = elTrackingInput.value.trim();
    if (!id) {
      renderResult(null);
      return;
    }
    renderResult(await findOrderById(id));
  });
}

const params = new URLSearchParams(window.location.search);
const prefill = params.get('id');
if (prefill && elTrackingInput) {
  elTrackingInput.value = prefill;
  findOrderById(prefill).then(renderResult);
}
