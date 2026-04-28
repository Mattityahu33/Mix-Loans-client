import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  TrendingUp, 
  Bell, 
  Settings,
  Menu,
  X,
  History
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import './Styles.css'; // Import the CSS file
import { useAuth } from '../context/AuthContext';
import { getUnreadNotificationCount } from '../services/notificationService';



const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Loans', href: '/loans', icon: FileText },
  { name: 'Collateral', href: '/collateral', icon: Package }, 
  { name: 'Payment History', href: '/payment-history', icon: History },
  { name: 'Reports', href: '/reports', icon: TrendingUp },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { admin, logout } = useAuth();

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [location.pathname, refreshUnreadCount]);

  useEffect(() => {
    const onNotificationsUpdated = (event) => {
      const nextCount = event?.detail?.unreadCount;
      if (typeof nextCount === 'number') {
        setUnreadCount(Math.max(0, nextCount));
        return;
      }
      refreshUnreadCount();
    };

    window.addEventListener('notifications:updated', onNotificationsUpdated);
    return () => {
      window.removeEventListener('notifications:updated', onNotificationsUpdated);
    };
  }, [refreshUnreadCount]);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="layout-container">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <h1 className="logo-text">Mix Loans</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="close-btn"
            >
              <X className="icon" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="nav">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="nav-icon" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="footer-text">
              <p className="footer-title">Administrator</p>
              <p className="footer-sub">{admin?.full_name || admin?.username || 'Logged in'}</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top header */}
        <header className="header">
          <div className="header-inner">
            <button
              onClick={() => setSidebarOpen(true)}
              className="menu-btn"
            >
              <Menu className="icon" />
            </button>
            
            <div className="header-right">
              <div className="date">{currentDate}</div>
              <Link to="/notifications" className="notification-link">
                <Bell className="icon" />
                {unreadCount > 0 ? (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                ) : null}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
