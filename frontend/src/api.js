const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function request(path, { method='GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data || { error: 'Network error' };
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth helpers
export function saveLocalAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearLocalAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

// Cart local helpers
export function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem('local_cart') || '[]');
  } catch (e) {
    return [];
  }
}

export function setLocalCart(items) {
  localStorage.setItem('local_cart', JSON.stringify(items));
}

export function clearLocalCart() {
  localStorage.removeItem('local_cart');
}

// API functions
export const auth = {
  signup: (email, password, name) => 
    request('/auth/signup', { method: 'POST', body: { email, password, name } }),
  
  login: (email, password) => 
    request('/auth/login', { method: 'POST', body: { email, password } })
};

export const items = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return request(`/items?${params.toString()}`);
  },
  
  create: (item, token) => 
    request('/items', { method: 'POST', body: item, token }),
  
  update: (id, item, token) => 
    request(`/items/${id}`, { method: 'PUT', body: item, token }),
  
  delete: (id, token) => 
    request(`/items/${id}`, { method: 'DELETE', token })
};

export const cart = {
  get: (token) => request('/cart', { token }),
  
  update: (items, token) => 
    request('/cart', { method: 'PUT', body: { items }, token }),
  
  add: (itemId, qty = 1, token) => 
    request('/cart/add', { method: 'POST', body: { itemId, qty }, token }),
  
  remove: (itemId, token) => 
    request('/cart/remove', { method: 'POST', body: { itemId }, token })
};
