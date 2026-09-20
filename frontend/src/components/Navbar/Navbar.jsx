import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../Notification/NotificationDropdown';
import { Stethoscope, User, LogOut, LayoutDashboard, Calendar } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const getDashboardPath = () => {
    if (user?.role === 'doctor') return '/doctor/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00A896, #028090)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(0, 168, 150, 0.3)'
          }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.5px' }}>
              St. Jude
            </span>
            <span style={{ fontSize: '20px', fontWeight: 400, color: '#00A896', marginLeft: '4px' }}>
              Hospital
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/" style={{ color: '#334155', fontWeight: 600, fontSize: '14px' }}>Home</Link>
          <Link to="/doctors" style={{ color: '#334155', fontWeight: 600, fontSize: '14px' }}>Find Doctors</Link>
          <Link to="/#specializations" style={{ color: '#334155', fontWeight: 600, fontSize: '14px' }}>Departments</Link>
          <Link to="/#services" style={{ color: '#334155', fontWeight: 600, fontSize: '14px' }}>Services</Link>
          <Link to="/#faq" style={{ color: '#334155', fontWeight: 600, fontSize: '14px' }}>Hospital FAQ</Link>
        </nav>

        {/* Right Auth / User Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <NotificationDropdown />

              <Link
                to={getDashboardPath()}
                className="btn btn-outline-teal btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={15} />
                <span>Portal</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#0B132B',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    {user.name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: user.role === 'doctor' ? '#028090' : user.role === 'admin' ? '#DB2777' : '#2563EB'
                  }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#334155', fontWeight: 600, fontSize: '14px', padding: '8px 14px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
