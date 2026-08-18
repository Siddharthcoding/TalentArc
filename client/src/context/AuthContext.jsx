import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getMe, logout as apiLogout } from '@/services/api';

const TOKEN_KEY = 'talentarc-token';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'AUTH_CHECK_COMPLETE':
      return { ...state, loading: false, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
}

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}

function userFromToken(token) {
  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    const decoded = JSON.parse(json);
    return {
      id: decoded.id,
      email: decoded.email,
      displayName: decoded.displayName,
      avatarUrl: decoded.avatarUrl,
      isAdmin: !!decoded.isAdmin,
    };
  } catch {
    return null;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      dispatch({ type: 'AUTH_CHECK_COMPLETE', payload: null });
      return;
    }
    getMe()
      .then((user) => {
        dispatch({ type: 'SET_USER', payload: user });
      })
      .catch(() => {
        clearToken();
        dispatch({ type: 'AUTH_CHECK_COMPLETE', payload: null });
      });
  }, []);

  const login = useCallback(() => {
    try {
      sessionStorage.setItem('authRedirect', `${window.location.pathname}${window.location.search}${window.location.hash}`);
    } catch {
    }
    const frontendUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${BACKEND_URL}/api/auth/google?frontendUrl=${frontendUrl}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
    }
    clearToken();
    try {
      sessionStorage.removeItem('pendingReport');
      sessionStorage.removeItem('authRedirect');
    } catch {
    }
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/';
  }, []);

  const setToken = useCallback((token) => {
    storeToken(token);
    const optimisticUser = userFromToken(token);
    if (optimisticUser?.id) {
      dispatch({ type: 'SET_USER', payload: optimisticUser });
    }
    return getMe().then((user) => {
      dispatch({ type: 'SET_USER', payload: user });
      return user;
    }).catch((err) => {
      if (optimisticUser?.id) return optimisticUser;
      throw err;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
