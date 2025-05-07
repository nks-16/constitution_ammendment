import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [sessionToken, setSessionToken] = useState(() => {
    return localStorage.getItem('sessionToken') || null;
  });
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('userData');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
    } else {
      localStorage.removeItem('sessionToken');
    }
  }, [sessionToken]);

  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  }, [userData]);

  return (
    <AuthContext.Provider value={{ sessionToken, setSessionToken, userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);