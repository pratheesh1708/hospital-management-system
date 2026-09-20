import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ConsultationFormModal from './ConsultationFormModal';
import appointmentService from '../../services/appointmentService';
import { Calendar, Filter, Stethoscope, Sparkles } from 'lucide-react';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      setLoading(true);
      const res = await appointmentService.getDoctorAppointments();
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = appointments.filter((appt) => {
    if (statusFilter === 'ALL') return true;
    return appt.status === statusFilter;
  });

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
                Patient Consultation Schedule
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
                Complete directory of booked, concluded, and cancelled patient sessions.
              </p>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
              {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                    color: statusFilter === status ? '#00A896' : '#64748B',
                    boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card p-4">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Sparkles size={32} color="#00A896" className="animate-spin" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#64748B', fontWeight: 600 }}>Loading appointment roster...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '12px 14px' }}>Patient</th>
                      <th style={{ padding: '12px 14px' }}>Date & Slot</th>
                      <th style={{ padding: '12px 14px' }}>Reason</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((appt) => (
                      <tr key={appt.appointment_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                          {appt.patient_name}
                        </td>
                        <td style={{ padding: '14px', color: '#334155' }}>
                          {appt.appointment_date} <br />
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{appt.start_time} - {appt.end_time}</span>
                        </td>
                        <td style={{ padding: '14px', color: '#475569', maxWidth: '250px' }}>
                          {appt.reason || 'General consultation'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge badge-${appt.status}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          {appt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => setActiveConsultation(appt)}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Stethoscope size={13} />
                              <span>Consult</span>
                            </button>
                          )}
                          {appt.status === 'COMPLETED' && (
                            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>
                              Report Concluded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748B' }}>
                <Calendar size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                  No Appointments Found
                </h3>
                <p style={{ margin: 0 }}>No sessions matching "{statusFilter}".</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {activeConsultation && (
        <ConsultationFormModal
          appointment={activeConsultation}
          onClose={() => setActiveConsultation(null)}
          onSuccess={() => {
            setActiveConsultation(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
