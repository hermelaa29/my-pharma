import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StoreSelection from './pages/StoreSelection';
import StoreLayout from './components/layout/StoreLayout';
import Medicine from './pages/Medicine';
import Cosmetics from './pages/Cosmetics';
import Transaction from './pages/Transaction';
import Notification from './pages/Notification';

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
                <StoreLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes rendered inside StoreLayout's Outlet */}
            <Route index element={<Dashboard />} />
            <Route path="medicine" element={<Medicine />} />
            <Route path="cosmetics" element={<Cosmetics />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="notification" element={<Notification />} />
          </Route>

          {/* Default Wildcard Redirect Route */}
          <Route path="/" element={<Navigate to="/stores" replace />} />
          <Route path="*" element={<Navigate to="/stores" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
