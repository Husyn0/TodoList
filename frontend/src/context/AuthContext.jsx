import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);

    authApi
      .getMe()
      .then((data) => {
        setUser(data.user ?? data);
        setEmailVerified(!!(data.email_verified ?? data.user?.email_verified_at));
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setEmailVerified(!!data.email_verified);
  };

  const register = async (name, email, password, password_confirmation) => {
    const data = await authApi.register({
      name,
      email,
      password,
      password_confirmation,
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setEmailVerified(!!data.email_verified);
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('token');
    setUser(null);
    setEmailVerified(true);
  };

  const refreshMe = async () => {
    const data = await authApi.getMe();
    setUser(data.user ?? data);
    setEmailVerified(!!(data.email_verified ?? data.user?.email_verified_at));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        emailVerified,
        loading,
        login,
        register,
        logout,
        setUser,
        setEmailVerified,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);