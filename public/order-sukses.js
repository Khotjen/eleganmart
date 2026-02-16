const elOrderId = document.getElementById('orderId');
const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');
if (elOrderId && orderId) elOrderId.textContent = orderId;
