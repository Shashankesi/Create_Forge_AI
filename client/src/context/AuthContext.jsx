import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Sequence ref prevents stale in-flight /auth/me requests from clearing newer logins
  const authSeqRef = useRef(0);

  // Restore authenticated session from backend on application mount
  useEffect(() => {
    let isMounted = true;
    const currentSeq = ++authSeqRef.current;

    const restoreSession = async () => {
      const storedToken =
        localStorage.getItem('createforge_token') ||
        localStorage.getItem('token');

      try {
        const res = await authService.getMe();
        
        // If a login/register occurred while getMe was in flight, abort
        if (!isMounted || currentSeq !== authSeqRef.current) return;

        const authenticatedUser = res.user || res.data?.user;

        if (res.success && authenticatedUser) {
          setUser(authenticatedUser);
          localStorage.setItem('createforge_user', JSON.stringify(authenticatedUser));
          const freshToken = res.token || res.data?.token || storedToken;
          if (freshToken) {
            setToken(freshToken);
            localStorage.setItem('createforge_token', freshToken);
            localStorage.setItem('token', freshToken);
          }
        } else if (!storedToken) {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        // If /me returns 401 and no newer login took place, clear local cache
        if (isMounted && currentSeq === authSeqRef.current) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('createforge_token');
          localStorage.removeItem('createforge_user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        if (isMounted && currentSeq === authSeqRef.current) {
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
    // Invalidate any pending initial session restoration
    const currentSeq = ++authSeqRef.current;

    const res = await authService.login(credentials);
    const loggedInUser = res.user || res.data?.user;
    const authToken = res.token || res.data?.token;

    if (res.success && loggedInUser) {
      if (authToken) {
        localStorage.setItem('createforge_token', authToken);
        localStorage.setItem('token', authToken);
        setToken(authToken);
      }
      localStorage.setItem('createforge_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setLoading(false);
    }
    return res;
  };

  const register = async (userData) => {
    // Invalidate any pending initial session restoration
    const currentSeq = ++authSeqRef.current;

    const res = await authService.register(userData);
    const registeredUser = res.user || res.data?.user;
    const authToken = res.token || res.data?.token;

    if (res.success && registeredUser) {
      if (authToken) {
        localStorage.setItem('createforge_token', authToken);
        localStorage.setItem('token', authToken);
        setToken(authToken);
      }
      localStorage.setItem('createforge_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      setLoading(false);
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
    ++authSeqRef.current;
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
      localStorage.removeItem('user');
      localStorage.removeItem('cf_active_project_id');
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isInitializing: loading,
        isAuthenticated,
        isAdmin,
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
