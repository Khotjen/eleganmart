const elAdminLoginForm = document.getElementById('adminLoginForm');
const elAdminLoginError = document.getElementById('adminLoginError');

const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

if (elAdminLoginForm) {
  elAdminLoginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (elAdminLoginError) elAdminLoginError.textContent = '';
    const form = new FormData(elAdminLoginForm);
    const payload = Object.fromEntries(form.entries());
    try {
      await fetchJSON('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      window.location.href = '/admin';
    } catch (e) {
      if (elAdminLoginError) elAdminLoginError.textContent = 'Login gagal. Periksa email/password.';
    }
  });
}
