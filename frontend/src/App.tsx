import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StoreSelection from './pages/StoreSelection';

/**
 * Root Application Router & Authentication Context Wrapper.
 * Binds page routing endpoints to their respective security guards.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Secure Protected Routes */}
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <StoreSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:storeId"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Wildcard Redirect Route */}
          <Route path="/" element={<Navigate to="/stores" replace />} />
          <Route path="*" element={<Navigate to="/stores" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
