import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SparePart from './components/SparePart';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/check');
      setIsAuthenticated(response.data.authenticated);
      if (response.data.authenticated) {
        setUsername(response.data.username);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setIsAuthenticated(false);
      setUsername('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard username={username} onLogout={handleLogout} />} />
            <Route path="/spare-parts" element={<SparePart username={username} onLogout={handleLogout} />} />
            <Route path="/stock-in" element={<StockIn username={username} onLogout={handleLogout} />} />
            <Route path="/stock-out" element={<StockOut username={username} onLogout={handleLogout} />} />
            <Route path="/reports" element={<Reports username={username} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;