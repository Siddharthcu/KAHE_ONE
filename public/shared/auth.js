// Shared helper used by every page. Kept dependency-free (no build step)
// so any plain HTML page can just <script src="/shared/auth.js"></script>.

const Kahe = {
  getToken() {
    return localStorage.getItem('kahe_token');
  },
  setToken(token) {
    localStorage.setItem('kahe_token', token);
  },
  getUser() {
    const raw = localStorage.getItem('kahe_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    localStorage.setItem('kahe_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('kahe_token');
    localStorage.removeItem('kahe_user');
    window.location.href = '/index.html';
  },
  // Redirect to login if not authenticated. Call at top of protected pages.
  requireLogin() {
    if (!this.getToken()) {
      window.location.href = '/login.html';
    }
  },
  // Wrapper around fetch that attaches the JWT and handles JSON.
  async api(path, options = {}) {
    const headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      // token invalid/expired - send back to login
      this.logout();
      throw new Error('Session expired');
    }
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }
};
