import './index.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth } from './services/api';
import SleepBreathTracker from './components/SleepBreathTracker';
import TherapistDashboard from './components/TherapistDashboard';
import Login from './components/Login';
import Register from './components/Register';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const profile = await auth.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.role === 'therapist' ? (
                  <TherapistDashboard />
                ) : (
                  <SleepBreathTracker />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Login onLogin={(user) => setUser(user)} />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Register onRegister={(user) => setUser(user)} />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 