import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const savedToken = localStorage.getItem('customerToken');
    const savedCustomer = localStorage.getItem('customerData');
    if (savedToken && savedCustomer) {
      try {
        setToken(savedToken);
        setCustomer(JSON.parse(savedCustomer));
      } catch {
     
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
      }
    }
    setLoading(false); 
  }, []);

  //  Login - token + customer both save
  const login = (customerData, authToken, cartCallbacks) => {
    setCustomer(customerData);
    setToken(authToken);
    localStorage.setItem('customerToken', authToken);
    localStorage.setItem('customerData', JSON.stringify(customerData));
    if (cartCallbacks?.onLogin) cartCallbacks.onLogin(customerData.id);
  };

  //  Logout - BOTH keys (customerToken AND customerData)
  const logout = (cartCallbacks) => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    // cart/wishlist also clear
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    if (cartCallbacks?.onLogout) cartCallbacks.onLogout();
  };

  const updateCustomer = (updatedData) => {
    const merged = { ...customer, ...updatedData };
    setCustomer(merged);
    localStorage.setItem('customerData', JSON.stringify(merged));
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{
      customer,
      token,
      isLoggedIn,
      loading,
      login,
      logout,
      updateCustomer,
      setCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);