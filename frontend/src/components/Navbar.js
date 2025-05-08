import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Smart Study Finder
        </Link>
        <div className="navbar-menu">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="navbar-item">Dashboard</Link>
              <Link to="/courses" className="navbar-item">Courses</Link>
              <Link to="/groups" className="navbar-item">Study Groups</Link>
              <Link to="/matching" className="navbar-item">Find Matches</Link>
              <Link to="/profile" className="navbar-item">Profile</Link>
              <button onClick={handleLogout} className="navbar-item logout-btn">
                Logout
              </button>
              <span className="navbar-user">
                Hi, {currentUser.displayName || currentUser.email}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="navbar-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;