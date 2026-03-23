/**
 * Example usage of AdminSystemSettings component
 * This file demonstrates various ways to implement the component
 */

// ============================================
// Example 1: Basic Usage
// ============================================
import React from 'react';
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';
import { ToastContainer } from 'react-toastify';

function BasicExample() {
  return (
    <div className="container">
      <AdminSystemSettings />
      <ToastContainer />
    </div>
  );
}

// ============================================
// Example 2: With React Router
// ============================================
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';

function RouterExample() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/settings" element={<AdminSystemSettings />} />
      </Routes>
    </Router>
  );
}

// ============================================
// Example 3: With Layout Wrapper
// ============================================
import AdminLayout from './layouts/AdminLayout';
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';

function LayoutExample() {
  return (
    <AdminLayout>
      <AdminSystemSettings />
    </AdminLayout>
  );
}

// ============================================
// Example 4: With Protected Route
// ============================================
import { Navigate } from 'react-router-dom';
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';

function ProtectedRoute({ children, isAdmin }) {
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ProtectedExample() {
  const isAdmin = true; // Replace with actual auth check

  return (
    <ProtectedRoute isAdmin={isAdmin}>
      <AdminSystemSettings />
    </ProtectedRoute>
  );
}

// ============================================
// Example 5: Complete App Integration
// ============================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Components
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Login from './pages/Auth/Login';

// Layout
import AdminLayout from './layouts/AdminLayout';

function CompleteApp() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              isAuthenticated && userRole === 'admin' ? (
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="settings" element={<AdminSystemSettings />} />
                  </Routes>
                </AdminLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default CompleteApp;

// ============================================
// Example 6: With Custom API Configuration
// ============================================
import React from 'react';
import axios from 'axios';
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function ConfiguredApp() {
  return (
    <div>
      <AdminSystemSettings />
    </div>
  );
}

// ============================================
// Example 7: Environment Configuration
// ============================================

// Create a .env file in your project root:
/*
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ENV=development
*/

// Then in your code:
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1',
  environment: process.env.REACT_APP_ENV || 'development',
};

// Use the config in your component
console.log('API Base URL:', config.apiBaseUrl);

// ============================================
// Example 8: With Error Boundary
// ============================================
import React from 'react';
import AdminSystemSettings from './pages/Admin/AdminSystemSettings';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-4">
          <h4>Something went wrong</h4>
          <p>{this.state.error?.message}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundaryExample() {
  return (
    <ErrorBoundary>
      <AdminSystemSettings />
    </ErrorBoundary>
  );
}

// ============================================
// Example 9: Package.json scripts
// ============================================
/*
Add these scripts to your package.json:

{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.4.0",
    "react-toastify": "^9.1.3",
    "bootstrap": "^5.3.0",
    "bootstrap-icons": "^1.11.0"
  }
}
*/

// ============================================
// Example 10: Testing Setup
// ============================================
/*
// AdminSystemSettings.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSystemSettings from './AdminSystemSettings';

// Mock axios
jest.mock('axios');
jest.mock('react-toastify');

describe('AdminSystemSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component and loads settings', async () => {
    const mockSettings = {
      data: {
        data: {
          maintenanceMode: false,
          ownerTheme: 'blue',
          studentTheme: 'green',
          canViewInvoice: true,
          canEditProfile: true,
          hasLearningAccess: true
        }
      }
    };

    axios.get.mockResolvedValue(mockSettings);

    render(<AdminSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });
  });

  test('toggles maintenance mode', async () => {
    // Add your test implementation
  });
});
*/

export {
  BasicExample,
  RouterExample,
  LayoutExample,
  ProtectedExample,
  CompleteApp,
  ConfiguredApp,
  ErrorBoundaryExample
};
