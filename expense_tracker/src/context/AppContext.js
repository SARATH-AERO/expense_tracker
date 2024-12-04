import React, { createContext, useEffect, useState } from 'react';

// Create Context
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('Dashboard');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);


  const addAccount = (account) => {
    setAccounts([...accounts, account]);
  };

  const editAccount = (updatedAccount) => {
    setAccounts(accounts.map(account => account.name === updatedAccount.name ? updatedAccount : account));
  };
  const deleteAccount = (accountName) => {
    setAccounts(accounts.filter(account => account.name !== accountName));
  };


  const addTransaction = (transaction, type) => {
    setAccounts((prevAccounts) => {
      return prevAccounts.map((account) => {
        if (account.name === transaction.from) {
          let newBalance = account.balance;
          if (account.group === 'cash' || account.group === 'bank') {
            newBalance -= parseFloat(transaction.amount);
          } else if (account.group === 'credit') {
            newBalance += parseFloat(transaction.amount);
          }
          return { ...account, balance: newBalance };
        }
        return account;
      });
    });

    setTransactions((prevTransactions) => [
      ...prevTransactions,
      { ...transaction, type }
    ]);
  };



  // initial values
  useEffect (() => {
  setAccounts([...accounts, 
    { name:'Sarath Wallet', money:5000, group:'Cash'},
    { name:'Rashmika Wallet', money:5000, group:'Cash'},
    { name:'Chirji SBI savings ', money:5000, group:'Bank Account'},
    { name:'Sarath HDFC savings ', money:5000, group:'Bank Account'},
    { name:'HDFC Master Credit', money:5000, group:'Credit'},
    { name:'SBI Reliance Credit', money:5000, group:'Credit'},
    { name:'Bike Loan', money:150000, group:'Loan'},
    { name:'Car Loan', money:550400, group:'Loan'}
  ])  
},[]);

  return (
    <AppContext.Provider value={{ currentView, setCurrentView, accounts,
     addAccount, setAccounts, editAccount, deleteAccount,transactions, addTransaction,
     setTransactions }}>
      {children}
    </AppContext.Provider>
  );
};