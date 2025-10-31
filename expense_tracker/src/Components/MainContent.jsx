import React from "react";
import { useLocation } from 'react-router-dom';
import Dashboard from "../pages/Dashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Reports from "../pages/Reports";
import Budget from "../pages/Budget";
import Settings from "../pages/Settings";

const MainContent = () => {
  const location = useLocation();

  const renderByPath = () => {
    const path = location.pathname.replace('/', '').toLowerCase();
    switch (path) {
      case 'dashboard':
      case '':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'accounts':
        return <Accounts />;
      case 'budget':
        return <Budget />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={styles.container}>
      {renderByPath()}
    </div>
  );
};

// const styles = {
//   container: {
//     padding: "20px",
//     flex: 1, // Take up the remaining space
//     // color: "white", // White text for contrast
//     backgroundColor: "#ebe6ff", // Black background
//     overflowY: "auto", // Enable scrolling if content is too large
//   },
// };

const styles = {
  container: {
    padding: "20px",
    flex: 1, // Take up the remaining space
    backgroundColor: "#ebe6ff", // Light background color
    overflowY: "auto", // Enable scrolling if content is too large
    marginLeft: "200px", // Add margin to account for the sidebar width
    marginTop: "50px", // Add margin to account for the fixed header height
  },
};


export default MainContent;
