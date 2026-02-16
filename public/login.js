document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const loginButton = loginForm.querySelector('.btn');
  const loginError = document.getElementById('loginError');
  const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLogin();
  });
  
  async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (loginError) loginError.textContent = '';
    if (!email || !password) {
      if (loginError) loginError.textContent = 'Email dan password harus diisi.';
      return;
    }
    
    if (!isValidEmail(email)) {
      if (loginError) loginError.textContent = 'Format email tidak valid.';
      return;
    }
    
    loginButton.disabled = true;
    loginButton.textContent = 'Loading...';

    try {
      await fetchJSON('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      window.location.href = '/akun';
    } catch (error) {
      console.error('Error:', error);
      if (loginError) loginError.textContent = 'Login gagal. Periksa email dan password.';
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Masuk';
    }
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
