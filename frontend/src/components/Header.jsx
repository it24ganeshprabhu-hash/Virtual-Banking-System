import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const Header = () => {
  const { user, logout } = React.useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            <div className="logo-icon">VBS</div>
            <span>Virtual Banking</span>
          </Link>
          
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/passbook" className="nav-link">Passbook</Link>
          </nav>
          
          <div className="user-info">
            <span className="user-welcome">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

