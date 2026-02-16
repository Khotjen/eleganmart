document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const nameInput = registerForm.querySelector('input[name="name"]');
  const emailInput = registerForm.querySelector('input[name="email"]');
  const phoneInput = registerForm.querySelector('input[name="phone"]');
  const passwordInput = registerForm.querySelector('input[name="password"]');
  const confirmPasswordInput = registerForm.querySelector('input[name="confirmPassword"]');
  const registerButton = registerForm.querySelector('.btn');
  const registerError = document.getElementById('registerError');
  const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });
  
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleRegister();
  });
  
  async function handleRegister() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (registerError) registerError.textContent = '';
    if (!name || !email || !phone || !password || !confirmPassword) {
      if (registerError) registerError.textContent = 'Semua field harus diisi.';
      return;
    }
    
    if (!isValidEmail(email)) {
      if (registerError) registerError.textContent = 'Format email tidak valid.';
      return;
    }
    
    if (password.length < 8) {
      if (registerError) registerError.textContent = 'Password minimal 8 karakter.';
      return;
    }
    
    if (password !== confirmPassword) {
      if (registerError) registerError.textContent = 'Konfirmasi password tidak cocok.';
      return;
    }
    
    if (!isValidPhone(phone)) {
      if (registerError) registerError.textContent = 'Format nomor telepon tidak valid.';
      return;
    }
    
    registerButton.disabled = true;
    registerButton.textContent = 'Loading...';
    
    try {
      await fetchJSON('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      window.location.href = '/akun';
    } catch (error) {
      console.error('Error:', error);
      if (registerError) registerError.textContent = 'Registrasi gagal. Periksa data Anda.';
    } finally {
      registerButton.disabled = false;
      registerButton.textContent = 'Daftar';
    }
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    return phoneRegex.test(phone);
  }
});
