import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login, Signup, PrivateRoute } from './components/Auth';
import { EisenhowerMatrix } from './components/Matrix';
import ApiDocsPage from './components/UI/ApiDocsPage';
import './styles/index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <EisenhowerMatrix />
                </PrivateRoute>
              } 
            />
            <Route path="/login/*" element={<Login />} />
            <Route path="/signup/*" element={<Signup />} />
            <Route path="/docs" element={<ApiDocsPage onBack={() => window.location.href = '/'} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
