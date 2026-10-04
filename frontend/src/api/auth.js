import api from './client';

export const getMe = () => api.get('/me').then((r) => r.data);

export const login = (email, password) =>
  api.post('/login', { email, password }).then((r) => r.data);

export const register = (payload) =>
  api.post('/register', payload).then((r) => r.data);

export const logout = () => api.post('/logout').catch(() => {});

export const resendVerification = () =>
  api.post('/email/verification-notification').then((r) => r.data);

export const verificationStatus = () =>
  api.get('/email/verification-status').then((r) => r.data);

export const forgotPassword = (email) =>
  api.post('/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (payload) =>
  api.post('/reset-password', payload).then((r) => r.data);