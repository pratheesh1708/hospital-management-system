import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import AppointmentCard from '../../components/AppointmentCard/AppointmentCard';
import appointmentService from '../../services/appointmentService';
import { Calendar, Filter, Sparkles, AlertCircle } from 'lucide-react';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                My Appointments
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
                Review, reschedule, or cancel your scheduled consultations.
              </p>
            </div>

            {/* Filter Tabs */}
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

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Sparkles size={32} color="#00A896" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748B', fontWeight: 600 }}>Loading appointment records...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="appointment-list">
              {filtered.map((appt) => (
                <AppointmentCard
                  key={appt.appointment_id}
                  appointment={appt}
                  onStatusChange={loadAppointments}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '60px 24px'
            }}>
              <Calendar size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                No Appointments Found
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                {statusFilter === 'ALL'
                  ? 'You have not booked any appointments yet.'
                  : `No appointments with status "${statusFilter}".`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
