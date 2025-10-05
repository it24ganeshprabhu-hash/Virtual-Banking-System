import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import Transfer from './components/Transfer';
import Passbook from './components/Passbook';

// Context for user state
export const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('bankingUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('bankingUser');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('bankingUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('bankingUser');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      <Router>
        <div className="app-container">
          {user && <Header />}
          <main className="main-content">
            <div className="container">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
                />
                <Route 
                  path="/register" 
                  element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/deposit" 
                  element={user ? <DepositModal /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/withdraw" 
                  element={user ? <WithdrawModal /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/transfer" 
                  element={user ? <Transfer /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/passbook" 
                  element={user ? <Passbook /> : <Navigate to="/login" replace />} 
                />
                
                {/* Default Route */}
                <Route 
                  path="/" 
                  element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
                />
                
                {/* Catch all route */}
                <Route 
                  path="*" 
                  element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
                />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;