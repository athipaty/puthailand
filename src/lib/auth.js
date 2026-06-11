import api from './api';

const KEY = 'pu_token';

export function getToken() {
  return localStorage.getItem(KEY);
}

export function saveToken(token) {
  localStorage.setItem(KEY, token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export async function login(password) {
  const res = await api.post('/api/accounting/auth/login', { password });
  saveToken(res.data.token);
  return res.data;
}

export async function verify() {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await api.post('/api/accounting/auth/verify', { token });
    return res.data.valid === true;
  } catch {
    clearToken();
    return false;
  }
}

export function logout() {
  clearToken();
  window.location.href = '/login';
}
