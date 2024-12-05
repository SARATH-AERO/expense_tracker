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
    { name:'Sarath Wallet', amount:114000, group:'Cash'},
    { name:'Rashmika Wallet', amount:10000, group:'Cash'},
    { name:'Chirji SBI savings', amount:60000, group:'Bank Account'},
    { name:'Sarath HDFC savings', amount:135000, group:'Bank Account'},
    { name:'HDFC Master Credit', amount:130000, group:'Credit'},
    { name:'SBI Reliance Credit', amount:70000, group:'Credit'},
    { name:'Bike Loan', amount:150000, group:'Loan'},
    { name:'Car Loan', amount:550400, group:'Loan'}
  ])  

  setTransactions([ ...transactions,
    {from : 'Salary', amount:95000, tag :'Sarath HDFC savings', date:new Date(), note: 'HCL salary', transType : 'Income'},
    {from : 'Sarath Wallet', amount:500, tag :'Rashmika Wallet', date:new Date(), note: 'self transfer', transType : 'Self-Transfer'},
    {from : 'Sarath Wallet', amount:500, tag :'Chirji SBI savings', date:new Date(), note: 'self transfer GPay', transType : 'Self-Transfer'},
    {from : 'Sarath HDFC savings', amount:1000, tag :'Bike Loan', date:new Date(), note: 'Loan Payment', transType : 'Loan Payment'},
    {from : 'HDFC Master Credit', amount:9500, tag :'Rent', date:new Date(), note: 'PG - Rent', transType : 'Expense'},
    {from : 'HDFC Master Credit', amount:5500, tag :'Clothes', date:new Date(), note: 'Arrow - Forum Mall', transType : 'Expense'},
    {from : 'HDFC Master Credit', amount:4500, tag :'Restaurant', date:new Date(), note: 'Barbeque', transType : 'Expense'},
    {from : 'HDFC Master Credit', amount:2500, tag :'Shopping', date:new Date(), note: 'Iron Box', transType : 'Expense'}
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