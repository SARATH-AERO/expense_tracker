import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const MainContent = () => {
  const { currentView } = useContext(AppContext);

  return (
    <div style={styles.container}>
      <h2>{currentView} Page</h2>
      {/* Add content for each view */}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    flex: 1, // Take up the remaining space
    color: "white", // White text for contrast
    backgroundColor: "#ebe6ff", // Black background
    overflowY: "auto", // Enable scrolling if content is too large
  },
};


export default MainContent;
