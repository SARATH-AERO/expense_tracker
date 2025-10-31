import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { NavLink, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [selectedSection, setSelectedSection] = useState(() => {
    // initialize from current path
    const path = location.pathname.replace('/', '') || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  });

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Transactions", icon: <FaExchangeAlt /> },
    { name: "Accounts", icon: <FaCreditCard /> },
    { name: "Reports", icon: <FaChartLine /> },
    { name: "Budget", icon: <FaShoppingBasket /> },
    { name: "Settings", icon: <FaCog /> },
  ];

  const pathMap = {
    Dashboard: '/dashboard',
    Transactions: '/transactions',
    Accounts: '/accounts',
    Reports: '/reports',
    Budget: '/budget',
    Settings: '/settings'
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section); // keep local highlight for instant feedback
    setCurrentView && setCurrentView(section); // Update current view in context (if available)
    // navigation will be handled by NavLink click
  };

  return (
    <nav style={styles.sidebar}>
      <ul style={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.name} style={styles.menuItem}>
            <NavLink
              to={pathMap[item.name] || '/'}
              onClick={() => handleSectionClick(item.name)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 15px',
                borderRadius: '4px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'white',
                backgroundColor: isActive ? '#2F3E8A' : 'transparent'
              })}
            >
              <span style={{ ...styles.icon }}>{item.icon}</span>
              {item.name}
            </NavLink>
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
