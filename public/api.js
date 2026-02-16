(() => {
  let csrfTokenCache = null;

  async function getCsrfToken() {
    if (csrfTokenCache) return csrfTokenCache;
    const res = await fetch('/api/csrf');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    csrfTokenCache = data.token;
    return csrfTokenCache;
  }

  async function fetchJSON(url, opts) {
    const options = opts ? { ...opts } : {};
    const method = options.method ? String(options.method).toUpperCase() : 'GET';
    const headers = options.headers ? { ...options.headers } : {};
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      headers['x-csrf-token'] = await getCsrfToken();
    }
    options.headers = headers;
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  window.apiGetCsrfToken = getCsrfToken;
  window.apiFetchJSON = fetchJSON;
})();
