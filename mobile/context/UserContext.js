import React, { createContext, useState, useContext } from 'react';
import { useAuthStore } from '../store/authStore';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user = { id, name, role }

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook për përdorim më të thjeshtë
export const useUser = () => useContext(UserContext);
