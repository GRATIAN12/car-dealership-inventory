import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

interface AuthProps {
  onLoginSuccess: (token: string, role: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (isLogin) {
        const res = await loginUser({ username, password });
        const token = res.data.token;
        // Decode simple token role or store it
        localStorage.setItem('token', token);
        // Extract role from token payload safely or pass default
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('role', payload.role);
        localStorage.setItem('username', payload.username);
        onLoginSuccess(token, payload.role);
      } else {
        await registerUser({ username, password, role });
        setSuccessMsg('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {isLogin ? 'Car Dealership Login' : 'Register New Account'}
        </h2>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}
        {successMsg && <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};