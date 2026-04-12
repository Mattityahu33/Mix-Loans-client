import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Clients from './pages/clients/Clients';
import Loans from './pages/loans/Loans';
import AddLoan from './pages/addLoan/AddLoan';
import PaymentRecording from './pages/paymentRecording/PaymentRecording';
import Collateral from './pages/collateral/Collateral';
import PaymentHistory from './pages/paymentHistory/PaymentHistory';
import Reports from './pages/reports/Reports';
import Notifications from './pages/notifications/Notifications';
import Settings from './pages/settings/Settings';
import Login from './pages/login/Login';

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <SettingsProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SettingsProvider>
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedPage>
        <Dashboard />
      </ProtectedPage>
    ),
  },
  {
    path: '/clients',
    element: (
      <ProtectedPage>
        <Clients />
      </ProtectedPage>
    ),
  },
  {
    path: '/loans',
    element: (
      <ProtectedPage>
        <Loans />
      </ProtectedPage>
    ),
  },
  {
    path: '/loans/add',
    element: (
      <ProtectedPage>
        <AddLoan />
      </ProtectedPage>
    ),
  },
  {
    path: '/loans/payment',
    element: (
      <ProtectedPage>
        <PaymentRecording />
      </ProtectedPage>
    ),
  },
  {
    path: '/collateral',
    element: (
      <ProtectedPage>
        <Collateral />
      </ProtectedPage>
    ),
  },
  {
    path: '/payment-history',
    element: (
      <ProtectedPage>
        <PaymentHistory />
      </ProtectedPage>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedPage>
        <Reports />
      </ProtectedPage>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedPage>
        <Notifications />
      </ProtectedPage>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedPage>
        <Settings />
      </ProtectedPage>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
