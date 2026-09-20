import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import adminService from '../../services/adminService';
import { ShieldAlert, RefreshCw, Filter, Sparkles } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  async function loadLogs() {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({
        action: actionFilter || undefined,
        limit: 50
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
                Security & HIPAA Compliance Audit Trail
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
                Immutable record of administrative, clinical, and authentication events with client IP tracking.
              </p>
            </div>

            <button
              onClick={loadLogs}
              className="btn btn-outline-teal btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Trail</span>
            </button>
          </div>

          {/* Table */}
          <div className="card p-4">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Sparkles size={28} color="#00A896" className="animate-spin" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#64748B' }}>Loading security logs...</p>
              </div>
            ) : logs.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '12px 14px' }}>Timestamp</th>
                      <th style={{ padding: '12px 14px' }}>Action</th>
                      <th style={{ padding: '12px 14px' }}>Entity</th>
                      <th style={{ padding: '12px 14px' }}>User ID</th>
                      <th style={{ padding: '12px 14px' }}>IP Address</th>
                      <th style={{ padding: '12px 14px' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      let parsedDetails = log.details;
                      if (typeof log.details === 'string') {
                        try {
                          parsedDetails = JSON.stringify(JSON.parse(log.details));
                        } catch (e) {
                          parsedDetails = log.details;
                        }
                      } else if (typeof log.details === 'object') {
                        parsedDetails = JSON.stringify(log.details);
                      }

                      return (
                        <tr key={log.log_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#64748B' }}>
                            {log.created_at?.replace('T', ' ').substring(0, 19)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontWeight: 700,
                              color: '#0F172A',
                              backgroundColor: '#F1F5F9',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 600 }}>
                            {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>
                            {log.user_id ? `User #${log.user_id}` : 'System'}
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#475569' }}>
                            {log.ip_address || '127.0.0.1'}
                          </td>
                          <td style={{ padding: '12px 14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748B', fontFamily: 'monospace' }}>
                            {parsedDetails || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                <ShieldAlert size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: 0, fontSize: '15px', color: '#0F172A' }}>No Audit Logs Recorded</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
