import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  User, 
  Trophy,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'PLAYER';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      path: role === 'ROLE_ADMIN' ? '/admin' : '/player', 
      icon: <LayoutDashboard size={20} className="me-2" /> 
    },
    { label: 'Profile', path: '/profile', icon: <User size={20} className="me-2" /> },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="d-flex flex-column h-100">
          {/* Logo + close button (mobile) */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-5">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center">
                <Trophy className="text-white" size={20} />
              </div>
              <span className="fs-5 fw-bold">QuizTournament</span>
            </div>
            <button 
              className="btn btn-link text-white p-0 d-lg-none"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="nav flex-column flex-grow-1 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) => 
                  `nav-link rounded p-2 d-flex align-items-center ${isActive ? 'bg-primary text-white' : 'text-white-50 hover-text-white'}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto py-4 border-top border-secondary">
            <button 
              onClick={handleLogout}
              className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content bg-light">
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <div className="d-flex align-items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="btn btn-light border d-lg-none p-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-primary text-uppercase fs-6 fw-bold mb-0">Welcome Back</h2>
              <h1 className="h3 text-dark fw-bold mb-0">{username}</h1>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border">
              <div className="bg-light rounded-circle p-1">
                <User size={16} />
              </div>
              <span className="text-primary fw-bold text-uppercase small" style={{fontSize: '0.7rem'}}>
                {role.replace('ROLE_', '')}
              </span>
            </div>
          </div>
        </header>

        <section>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
