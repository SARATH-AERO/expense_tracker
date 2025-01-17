import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
// import { FaDollarSign } from "react-icons/fa";
import { BiDollarCircle } from "react-icons/bi";

const Header = () => {
  const { currentView } = useContext(AppContext);

  return (
    <header style={styles.header}>
      <div style={{ ...styles.logo, display: 'flex', alignItems: 'center' }}>
        <BiDollarCircle style={{ ...styles.dollarIcon, verticalAlign: 'middle' }} />
        <h1 style={{ ...styles.title, margin: 0, lineHeight: '1.2', marginLeft:'8px' }}>{currentView}</h1>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex", // Use flexbox to align elements horizontally
    alignItems: "center", // Vertically center the content
    backgroundColor: "#2F3E8A", // Blue header
    color: "white",
    padding: "10px 20px",
    width: "100%",
    position: "fixed",
    top: 0,
    zIndex: 1000, // Ensure header is above other elements
  },
  logo: {
    display: "flex",
    alignItems: "center", // Align the icon vertically with text
    marginRight: "15px", // Add space between the icon and the title
  },
  dollarIcon: {
    fontSize: "30px", // Size of the dollar icon
    color: "white", // White color for the dollar sign
  },
  title: {
    fontSize: "20px",
    fontWeight: "500", // Medium weight for section title
  },
};
  

export default Header;
