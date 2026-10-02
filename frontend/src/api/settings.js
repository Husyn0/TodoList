import api from './client';

export const getSettings = () => api.get('/settings').then((r) => r.data);

export const updateSettings = (payload) =>
  api.put('/settings', payload).then((r) => r.data);

export const updatePassword = (payload) =>
  api.put('/settings/password', payload).then((r) => r.data);