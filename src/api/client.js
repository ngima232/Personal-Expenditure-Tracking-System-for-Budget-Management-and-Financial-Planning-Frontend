const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const AUTH_PATHS = ['/auth/login', '/auth/register'];

function getToken() {
  const token = localStorage.getItem('ledger_token');
  // Guard against a broken/empty token ever being sent as "Bearer undefined"
  if (!token || token === 'undefined' || token === 'null') return null;
  return token;
}

function clearSessionAndRedirect() {
  localStorage.removeItem('ledger_token');
  localStorage.removeItem('ledger_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = payload?.message || payload?.errorMessage || res.statusText || 'Request failed';

    // Token missing/expired/invalid: clear the bad session instead of retrying forever
    // with the same broken token on every subsequent request.
    const isAuthRoute = AUTH_PATHS.some((p) => path.startsWith(p));
    if (!isAuthRoute && (res.status === 401 || res.status === 403)) {
      clearSessionAndRedirect();
    }

    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return payload;
}

export const apiClient = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
