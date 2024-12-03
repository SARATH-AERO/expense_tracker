import React, { createContext, useState } from 'react';

// Create Context
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('Dashboard');
  const [accounts, setAccounts] = useState([]);

  const addAccount = (account) => {
    setAccounts([...accounts, account]);
  };

  const editAccount = (updatedAccount) => {
    setAccounts(accounts.map(account => account.name === updatedAccount.name ? updatedAccount : account));
  };
  const deleteAccount = (accountName) => {
    setAccounts(accounts.filter(account => account.name !== accountName));
  };

  return (
    <AppContext.Provider value={{ currentView, setCurrentView, accounts, addAccount, editAccount, deleteAccount }}>
      {children}
    </AppContext.Provider>
  );
};