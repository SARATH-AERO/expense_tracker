

function Header() {
    return (
        <header>
            <div className="ui header">
                <i aria-hidden="true" className="bars icon"></i>
                <h2 className="content">Dashboard</h2>
                <i 
                    aria-hidden="true" 
                    className="refresh icon" 
                    style={{ cursor: 'pointer' }} // Use an object for the style prop
                ></i>
            </div>
        </header>
    );
}

export default Header;