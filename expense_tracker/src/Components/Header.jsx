import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { BiDollarCircle } from "react-icons/bi";

const Header = () => {
  const { currentView } = useContext(AppContext);

  return (
    <header style={styles.header}>
      <div style={styles.logoWrapper}>
        <BiDollarCircle style={styles.dollarIcon} />
        <span style={styles.appName}>Expense Tracker</span>
      </div>
      <h1 style={styles.title}>{currentView}</h1>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2F3E8A",
    color: "white",
    padding: "10px 25px",
    width: "100%",
    position: "fixed",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: "6px 14px",
    borderRadius: "10px",
    boxShadow: "0 0 8px rgba(255, 255, 255, 0.2)",
    transition: "transform 0.2s ease, box-shadow 0.3s ease",
  },
  dollarIcon: {
    fontSize: "30px",
    color: "#31f07aff",
    marginRight: "8px",
  },
  appName: {
    fontSize: "22px",
    fontWeight: "600",
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: "0.5px",
    color: "#fff",
    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: "20px",
    fontWeight: "500",
    fontFamily: "'Roboto', sans-serif",
    letterSpacing: "0.3px",
  },
};

export default Header;
