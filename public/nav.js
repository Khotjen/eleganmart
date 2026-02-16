(() => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    nav.classList.toggle('open', expanded);
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target && event.target.tagName === 'A') {
      setExpanded(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setExpanded(false);
    }
  });
})();
