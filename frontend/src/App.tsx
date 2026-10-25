import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const handleLoginSuccess = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;