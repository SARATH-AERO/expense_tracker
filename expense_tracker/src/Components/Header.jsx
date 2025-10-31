import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { BiDollarCircle } from "react-icons/bi";
import { Button } from 'react-bootstrap';

const Header = () => {
  // const { currentView } = useContext(AppContext);
const { currentView, currentUser, logout } = useContext(AppContext);
  
return (
  <header style={styles.header}  >
    <div style={styles.logoWrapper}>
      <BiDollarCircle style={styles.dollarIcon} />
      <span style={styles.appName}>Expense Tracker</span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {currentUser ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              color: '#f4f6f8',                // clean light color
              fontWeight: 700,
              fontSize: '1.6rem',
              fontFamily: '"Merriweather", serif',
              textTransform: 'capitalize',
              letterSpacing: '0.4px',
              marginRight: '12px',
            }}
          >
            {(currentUser.name || currentUser.email) || ''}
          </div>

          <Button
            size="sm"
            variant="outline-light"
            style={{
              fontWeight: 600,
              borderRadius: '22px',
              padding: '6px 18px',
              fontSize: '0.9rem',
              fontFamily: '"Poppins", "Segoe UI", sans-serif',
              transition: 'all 0.2s ease-in-out',
              borderColor: '#fff',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#fff', e.target.style.color = '#0a3d62')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#fff')}
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div style={{ color: '#fff', opacity: 0.9 }}>Not signed in</div>
      )}
    </div>
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
