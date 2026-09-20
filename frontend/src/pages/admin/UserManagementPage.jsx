import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import adminService from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Users, Search, Filter, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

export default function UserManagementPage() {
  const { showToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ role: roleFilter || undefined, search: search || undefined });
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await adminService.updateUserStatus(userId, newStatus);
      if (res.success) {
        showToast(res.message || 'User status updated');
        setUsers(users.map((u) => u.user_id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        showToast(res.message || 'User role updated');
        setUsers(users.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              User Directory & Role Governance
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
              Manage patient, physician, and administrative credentials, statuses, and access permissions.
            </p>
          </div>

          {/* Search & Filter */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} style={{ flex: '1 1 300px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="#64748B" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              >
                <option value="">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card p-4">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Sparkles size={28} color="#00A896" className="animate-spin" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#64748B' }}>Loading user directory...</p>
              </div>
            ) : users.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '12px 14px' }}>User</th>
                      <th style={{ padding: '12px 14px' }}>Contact</th>
                      <th style={{ padding: '12px 14px' }}>Role</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '14px', color: '#475569' }}>
                          {u.phone || 'N/A'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: u.role === 'admin' ? '#DB2777' : u.role === 'doctor' ? '#028090' : '#2563EB'
                            }}
                          >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: u.status === 'active' ? '#DCFCE7' : u.status === 'suspended' ? '#FEE2E2' : '#F1F5F9',
                            color: u.status === 'active' ? '#15803D' : u.status === 'suspended' ? '#DC2626' : '#64748B'
                          }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(u.user_id, 'suspended')}
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(u.user_id, 'active')}
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10B981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
