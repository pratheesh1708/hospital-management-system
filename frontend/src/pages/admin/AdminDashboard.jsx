import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import adminService from '../../services/adminService';
import {
  Users,
  Stethoscope,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [metricRes, logsRes] = await Promise.all([
        adminService.getMetrics(),
        adminService.getAuditLogs({ limit: 5 })
      ]);
      if (metricRes.success) setMetrics(metricRes.metrics);
      if (logsRes.success) setRecentLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Hospital System Administration
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
                System-wide metrics, user governance, clinical department configuration, and HIPAA audit trails.
              </p>
            </div>

            <Link
              to="/admin/users"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Users size={16} />
              <span>Manage User Directory</span>
            </Link>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Registered Patients
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
                  {metrics?.totalPatients ?? '-'}
                </h3>
              </div>
            </div>

            <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#E6F8F6',
                color: '#00A896',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Stethoscope size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Active Specialists
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
                  {metrics?.totalDoctors ?? '-'}
                </h3>
              </div>
            </div>

            <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FDF2F8',
                color: '#DB2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Total Consultations
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
                  {metrics?.appointments?.total ?? metrics?.appointments?.count ?? '-'}
                </h3>
              </div>
            </div>

            <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Compliance
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 800, color: '#16A34A' }}>
                  100% Audit Logged
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Logs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '28px' }}>
            {/* Quick Actions Card */}
            <div className="card p-4">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
                Governance & Controls
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to="/admin/users"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={18} color="#2563EB" />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>User Management & RBAC</h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Activate, suspend, or change user roles</p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#94A3B8" />
                </Link>

                <Link
                  to="/admin/specializations"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Stethoscope size={18} color="#00A896" />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Departments & Specializations</h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Configure medical specialties and descriptions</p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#94A3B8" />
                </Link>

                <Link
                  to="/admin/audit-logs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert size={18} color="#DB2777" />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Security & Audit Trail</h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Review immutable clinical and auth access logs</p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#94A3B8" />
                </Link>
              </div>
            </div>

            {/* Recent Audit Logs */}
            <div className="card p-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Recent Security Events
                </h3>
                <Link to="/admin/audit-logs" style={{ fontSize: '13px', fontWeight: 600, color: '#00A896', textDecoration: 'none' }}>
                  Full Audit Log
                </Link>
              </div>

              {loading ? (
                <p style={{ color: '#64748B', fontSize: '13px' }}>Loading audit events...</p>
              ) : recentLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentLogs.map((log) => (
                    <div
                      key={log.log_id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{log.action}</span>
                        <span style={{ color: '#64748B' }}>{log.created_at?.split('T')[0]}</span>
                      </div>
                      <p style={{ margin: 0, color: '#475569' }}>
                        Entity: {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''} • IP: {log.ip_address || '127.0.0.1'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748B', fontSize: '13px' }}>No recent audit events recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
