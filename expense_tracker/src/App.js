import React from "react";
import { AppProvider } from "./context/AppContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

const App = () => {
  return (
    <AppProvider>
      <div style={styles.app}>
        {/* Header remains at the top */}
        <Header />
        
        {/* Sidebar and MainContent go below the header */}
        <div style={styles.main}>
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
};

const styles = {
  app: {
    display: "flex",
    flexDirection: "column", // Header at the top
    height: "100vh",
    backgroundColor: "black", // Black background for the app
  },
  main: {
    display: "flex",
    flex: 1, // Sidebar and content take the remaining space
    backgroundColor: "black", // Black background for the main area
  },
};

export default App;
