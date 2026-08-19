import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved =
        localStorage.getItem('createforge_user') ||
        localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () =>
      localStorage.getItem('createforge_token') ||
      localStorage.getItem('token') ||
      null
  );

  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend on application mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const res = await authService.getMe();
        const authenticatedUser = res.user || res.data?.user;

        if (isMounted && res.success && authenticatedUser) {
          setUser(authenticatedUser);
          localStorage.setItem('createforge_user', JSON.stringify(authenticatedUser));
          if (res.token || res.data?.token) {
            const freshToken = res.token || res.data?.token;
            setToken(freshToken);
            localStorage.setItem('createforge_token', freshToken);
            localStorage.setItem('token', freshToken);
          }
        }
      } catch (err) {
        // If /me returns 401, session token is expired or invalid
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('createforge_token');
          localStorage.removeItem('createforge_user');
          localStorage.removeItem('token');
          localStorage.removeItem('pixora_token');
          localStorage.removeItem('pixora_user');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const loggedInUser = res.user || res.data?.user;
    const authToken = res.token || res.data?.token;

    if (res.success && loggedInUser) {
      setUser(loggedInUser);
      if (authToken) {
        setToken(authToken);
        localStorage.setItem('createforge_token', authToken);
        localStorage.setItem('token', authToken);
      }
      localStorage.setItem('createforge_user', JSON.stringify(loggedInUser));
      localStorage.removeItem('pixora_token');
      localStorage.removeItem('pixora_user');
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const registeredUser = res.user || res.data?.user;
    const authToken = res.token || res.data?.token;

    if (res.success && registeredUser) {
      setUser(registeredUser);
      if (authToken) {
        setToken(authToken);
        localStorage.setItem('createforge_token', authToken);
        localStorage.setItem('token', authToken);
      }
      localStorage.setItem('createforge_user', JSON.stringify(registeredUser));
      localStorage.removeItem('pixora_token');
      localStorage.removeItem('pixora_user');
    }
    return res;
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      const authenticatedUser = res.user || res.data?.user;
      if (res.success && authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('createforge_user', JSON.stringify(authenticatedUser));
        return authenticatedUser;
      }
    } catch {
      return null;
    }
  }, []);

  const changePassword = async (passwords) => {
    return await authService.changePassword(passwords);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing client state regardless of network status
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('createforge_token');
      localStorage.removeItem('createforge_user');
      localStorage.removeItem('token');
      localStorage.removeItem('pixora_token');
      localStorage.removeItem('pixora_user');
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isInitializing: loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
