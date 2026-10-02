import api from './client';

export const getMe = () => api.get('/me').then((r) => r.data);

export const login = (email, password) =>
  api.post('/login', { email, password }).then((r) => r.data);

export const register = (payload) =>
  api.post('/register', payload).then((r) => r.data);

export const logout = () => api.post('/logout').catch(() => {});