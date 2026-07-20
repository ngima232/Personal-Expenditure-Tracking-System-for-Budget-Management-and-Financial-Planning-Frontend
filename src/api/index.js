import { apiClient } from './client';

// --- Auth ---
// Assumes standard /auth/login and /auth/register endpoints returning { data: { token, user } }
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (payload) => apiClient.post('/auth/register', payload),
  me: () => apiClient.get('/auth/me'),
};

// --- Categories ---
export const categoriesApi = {
  list: (params) => apiClient.get('/categories', params),
  create: (payload) => apiClient.post('/categories', payload),
  update: (id, payload) => apiClient.patch(`/categories/${id}`, payload),
  remove: (id) => apiClient.delete(`/categories/${id}`),
};

// --- Income-Expense ---
export const transactionsApi = {
  list: (params) => apiClient.get('/income-expense', params),
  summary: (params) => apiClient.get('/income-expense/summary', params),
  create: (payload) => apiClient.post('/income-expense', payload),
  update: (id, payload) => apiClient.patch(`/income-expense/${id}`, payload),
  remove: (id) => apiClient.delete(`/income-expense/${id}`),
};

// --- Budgets ---
export const budgetsApi = {
  list: (params) => apiClient.get('/budgets', params),
  status: (id) => apiClient.get(`/budgets/${id}/status`),
  create: (payload) => apiClient.post('/budgets', payload),
  update: (id, payload) => apiClient.patch(`/budgets/${id}`, payload),
  remove: (id) => apiClient.delete(`/budgets/${id}`),
};

// --- Savings Goals ---
export const savingsGoalsApi = {
  list: (params) => apiClient.get('/savings-goals', params),
  create: (payload) => apiClient.post('/savings-goals', payload),
  update: (id, payload) => apiClient.patch(`/savings-goals/${id}`, payload),
  remove: (id) => apiClient.delete(`/savings-goals/${id}`),
  contribute: (id, payload) => apiClient.post(`/savings-goals/${id}/contributions`, payload),
};

// --- loans ---
export const loansApi = {
  list: (params) => apiClient.get('/loans', params),
  create: (payload) => apiClient.post('/loans', payload),
  update: (id, payload) => apiClient.patch(`/loans/${id}`, payload),
  remove: (id) => apiClient.delete(`/loans/${id}`),
  updateStatus: (id, payload) => apiClient.patch(`/loans/${id}/status`,payload),
};

// --- investments ---
export const investmentsApi = {
  list: (params) => apiClient.get('/investments', params),
  create: (payload) => apiClient.post('/investments', payload),
  update: (id, payload) => apiClient.patch(`/investments/${id}`, payload),
  remove: (id) => apiClient.delete(`/investments/${id}`),
};