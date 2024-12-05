import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Dashboard from "../pages/Dashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Reports from "../pages/Reports";
import Budget from "../pages/Budget";
import Settings from "../pages/Settings";

const MainContent = () => {
  const { currentView } = useContext(AppContext);

  const renderComponent = () => {
    switch (currentView) {
        case 'Dashboard':
            return <Dashboard />;
        case 'Transactions':
            return <Transactions />;
        case 'Accounts':
            return <Accounts />;
        case 'Budget':
          return <Budget />;
        case 'Reports':
          return <Reports />;
        case 'Settings':
          return <Settings />;
        default:
            return <Dashboard />;
    }
};

return (
    <div style={styles.container}>
        {renderComponent()}
        {/* Add content for each view */}
    </div>
);
}

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
