const Budget = () => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)', // leave space for header
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0a3d62 0%, #174949ff 100%)',
        color: '#fff',
        fontFamily: '"Playfair Display", serif',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3.2rem',
          fontWeight: 700,
          letterSpacing: '1px',
          textShadow: '2px 2px 10px rgba(0,0,0,0.3)',
          marginBottom: '0.5rem',
        }}
      >
        Coming Soon
      </h1>
      <p
        style={{
          fontSize: '1.2rem',
          opacity: 0.85,
          fontFamily: '"Merriweather", serif',
        }}
      >
        This feature is under development. Stay tuned!
      </p>
    </div>
  );
};

export default Budget;
