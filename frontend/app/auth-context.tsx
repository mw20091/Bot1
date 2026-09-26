import { useEffect, useState, createContext, useContext } from 'react';

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('wa_token');
    const savedUser = localStorage.getItem('wa_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem('wa_token', token);
    else localStorage.removeItem('wa_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('wa_user', JSON.stringify(user));
    else localStorage.removeItem('wa_user');
  }, [user]);

  const login = (nextToken: string, nextUser: any) => {
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
