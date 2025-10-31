// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import Auth from './Auth';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);
  
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

function App() {
  const { currentUser } = useContext(AppContext);

  return (
    <Router>
      <div className="app">
        {/* Render header at top-level so it spans full width above the sidebar */}
        {currentUser && <Header />}
        {currentUser && <Sidebar />}
        {/* Ensure routed pages are offset when sidebar/header are visible */}
        <div
          className="main-content"
          style={{
            marginLeft: currentUser ? '200px' : undefined,
            marginTop: currentUser ? '60px' : undefined
          }}
        >
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />

            <Route path="/accounts" element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />

            <Route path="/budget" element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;