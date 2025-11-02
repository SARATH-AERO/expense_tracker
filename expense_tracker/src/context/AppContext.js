import React, { createContext, useEffect, useState, useMemo } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // -------------------------------
  // Load persisted data
  // -------------------------------
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem("expense_users");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      return localStorage.getItem("expense_currentUserId") || null;
    } catch {
      return null;
    }
  });

  // -------------------------------
  // Persist users and userId
  // -------------------------------
  useEffect(() => {
    localStorage.setItem("expense_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId)
      localStorage.setItem("expense_currentUserId", currentUserId);
    else localStorage.removeItem("expense_currentUserId");
  }, [currentUserId]);

  // -------------------------------
  // Derived user data
  // -------------------------------
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const accounts = currentUser ? currentUser.accounts || [] : [];
  const transactions = currentUser ? currentUser.transactions || [] : [];

  // -------------------------------
  // UI view state
  // -------------------------------
  const [currentView, setCurrentView] = useState("Dashboard");

  // -------------------------------
  // Authentication
  // -------------------------------
  const register = async ({ name, email, password }) => {
    if (users.find((u) => u.email === email)) {
      throw new Error("Email already registered");
    }
    const id = `u_${Date.now()}`;
    const newUser = { id, name, email, password, accounts: [], transactions: [] };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(id);
    return newUser;
  };

  const login = async (email, password) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    setCurrentUserId(user.id);
    return user;
  };

  const logout = () => setCurrentUserId(null);

  // -------------------------------
  // Account helpers
  // -------------------------------
  // const setAccounts = (newAccounts) => {
  //   setUsers((prev) =>
  //     prev.map((u) =>
  //       u.id === currentUserId ? { ...u, accounts: newAccounts } : u
  //     )
  //   );
  // };

  const addAccount = (account) => {
    const acct = { ...account, id: `a_${Date.now()}` };
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? { ...u, accounts: [...(u.accounts || []), acct] }
          : u
      )
    );
    return acct;
  };

  const editAccount = (updated) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        return {
          ...u,
          accounts: (u.accounts || []).map((a) =>
            a.id === updated.id ? { ...a, ...updated } : a
          ),
        };
      })
    );
  };

  const deleteAccount = (accountId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? {
              ...u,
              accounts: (u.accounts || []).filter((a) => a.id !== accountId),
            }
          : u
      )
    );
  };

  // -------------------------------
  // Transaction helpers
  // -------------------------------
  // const setTransactions = (newTransactions) => {
  //   setUsers((prev) =>
  //     prev.map((u) =>
  //       u.id === currentUserId ? { ...u, transactions: newTransactions } : u
  //     )
  //   );
  // };

  const addTransaction = (transaction) => {
  const tx = { ...transaction, id: `t_${Date.now()}`, createdAt: new Date().toISOString() };
  updateCurrentUser(u => ({
    ...u,
    transactions: [...(u.transactions || []), tx]
  }));
  return tx;
};

 const updateCurrentUser = (updateFn) => {
  setUsers(prev => prev.map(u =>
    u.id === currentUserId ? updateFn(u) : u
  ));
};

// --- replace addTransaction, setAccounts, setTransactions like this ---

const setAccounts = (newAccounts) => {
  updateCurrentUser(u => ({ ...u, accounts: newAccounts }));
};

const setTransactions = (newTransactions) => {
  updateCurrentUser(u => ({ ...u, transactions: newTransactions }));
};


  const editTransaction = (updated) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        return {
          ...u,
          transactions: (u.transactions || []).map((t) =>
            t.id === updated.id ? { ...t, ...updated } : t
          ),
        };
      })
    );
  };

  const deleteTransaction = (txId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? {
              ...u,
              transactions: (u.transactions || []).filter((t) => t.id !== txId),
            }
          : u
      )
    );
  };

  const clearCurrentUserData = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? { ...u, accounts: [], transactions: [] }
          : u
      )
    );
  };

  // -------------------------------
  // Memoized context value
  // -------------------------------
  const contextValue = useMemo(
    () => ({
      currentView,
      setCurrentView,
      users,
      currentUser,
      currentUserId,
      accounts,
      transactions,
      register,
      login,
      logout,
      setAccounts,
      addAccount,
      editAccount,
      deleteAccount,
      setTransactions,
      addTransaction,
      editTransaction,
      deleteTransaction,
      clearCurrentUserData,
      setUsers,
      setCurrentUserId,
    }),
    [currentView, users, currentUser, currentUserId]
  );

  // -------------------------------
  // Provider
  // -------------------------------
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
