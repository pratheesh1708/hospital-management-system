import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  User,
  Users,
  ShieldAlert,
  ListFilter,
  LogOut,
  Stethoscope
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/doctors', label: 'Find & Book Doctor', icon: Stethoscope },
    { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/patient/history', label: 'Medical History & Reports', icon: FileText },
    { to: '/patient/profile', label: 'Account Profile', icon: User }
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Clinical Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Patient Schedule', icon: Calendar },
    { to: '/doctor/availability', label: 'Manage Availability', icon: Clock }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory & Roles', icon: Users },
    { to: '/admin/appointments', label: 'Monitor Appointments', icon: Calendar },
    { to: '/admin/specializations', label: 'Departments & Fees', icon: ListFilter },
    { to: '/admin/audit-logs', label: 'Compliance Audit Logs', icon: ShieldAlert }
  ];

  let links = patientLinks;
  if (user?.role === 'doctor') links = doctorLinks;
  if (user?.role === 'admin') links = adminLinks;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Stethoscope size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            St. Jude
          </h3>
          <span style={{ fontSize: '11px', color: '#00A896', fontWeight: 600, textTransform: 'uppercase' }}>
            {user?.role} Portal
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-snippet">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#F87171',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
