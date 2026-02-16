document.addEventListener('DOMContentLoaded', function() {
  const akunError = document.getElementById('akunError');
  const fetchJSON = window.apiFetchJSON || (async (url, opts) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  });

  checkAuth();
  loadUserData();
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  function checkAuth() {
    fetch('/api/user')
      .then(response => {
        if (!response.ok) {
          window.location.href = '/login';
          throw new Error('Not authenticated');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
      });
  }
  
  function loadUserData() {
    fetch('/api/user')
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          updateProfile(data.user);
        }
      })
      .catch(error => {
        console.error('Error loading user data:', error);
        if (akunError) akunError.textContent = 'Gagal memuat data akun.';
      });
  }
  
  function updateProfile(user) {
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.product-desc');
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
  }
  
  function handleLogout() {
    if (confirm('Yakin ingin logout?')) {
      fetchJSON('/api/logout', { method: 'POST' })
        .then(() => {
          window.location.href = '/';
        })
        .catch(error => {
          console.error('Logout error:', error);
          if (akunError) akunError.textContent = 'Logout gagal. Coba lagi.';
        });
    }
  }
});
