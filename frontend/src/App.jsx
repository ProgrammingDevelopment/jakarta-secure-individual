
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PersonaAnalysis from './pages/PersonaAnalysis';
import FraudDetection from './pages/FraudDetection';
import NIKScanner from './pages/NIKScanner';
import PhoneTracker from './pages/PhoneTracker';
import DeviceTracker from './pages/DeviceTracker';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="persona" element={<PersonaAnalysis />} />
                <Route path="fraud" element={<FraudDetection />} />
                <Route path="nik" element={<NIKScanner />} />
                <Route path="phone" element={<PhoneTracker />} />
                <Route path="device-track" element={<DeviceTracker />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
