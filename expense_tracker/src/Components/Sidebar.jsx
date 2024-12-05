import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom"; 
import {
  FaTachometerAlt,
  FaExchangeAlt,
  FaCreditCard,
  FaChartLine,
  FaShoppingBasket,
  FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  const { setCurrentView } = useContext(AppContext);
  const [selectedSection, setSelectedSection] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Transactions", icon: <FaExchangeAlt /> },
    { name: "Accounts", icon: <FaCreditCard /> },
    { name: "Reports", icon: <FaChartLine /> },
    { name: "Budget", icon: <FaShoppingBasket /> },
    { name: "Settings", icon: <FaCog /> },
  ];

  const handleSectionClick = (section) => {
    setSelectedSection(section); // Update selected section
    setCurrentView(section); // Update current view in context
  };

  return (
    <nav style={styles.sidebar}>
      <ul style={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.name}
            onClick={() => handleSectionClick(item.name)}
            style={{
              ...styles.menuItem,
              backgroundColor:
                selectedSection === item.name ? "#2F3E8A" : "transparent", // Highlight selected item
              color: selectedSection === item.name ? "white" : "white", // Change text color
            }}
          >
            <span
              style={{
                ...styles.icon,
                color: selectedSection === item.name ? "white" : "white", // Change icon color
              }}
            >
              {item.icon}
            </span>
            {item.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const styles = {
  sidebar: {
    width: "200px",
    backgroundColor: "#1c1c1c",
    height: "100vh", // Full viewport height
    padding: "20px",
    paddingTop: "60px", // Add padding to the top to avoid overlap with the header
    boxShadow: "2px 0 5px rgba(0,0,0,0.5)",
    position: "fixed", // Fix the sidebar position
    top: 0, // Align to the top of the viewport
    left: 0, // Align to the left of the viewport
    overflowY: "auto", // Add vertical scroll if content overflows
    zIndex: 1, // Ensure sidebar is below the header
  },
  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "background 0.3s, color 0.3s",
  },
  icon: {
    marginRight: "10px",
    fontSize: "18px",
    transition: "color 0.3s", // Smooth color transition
  },
};

export default Sidebar;
