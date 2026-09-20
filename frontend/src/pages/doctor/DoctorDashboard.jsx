import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import ConsultationFormModal from './ConsultationFormModal';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowRight,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.appointment_date === todayStr);
  const pendingConsultations = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'BOOKED');
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

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
                {user?.name || 'Doctor Dashboard'}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
                Manage daily patient consultations, review scheduled appointments, and issue diagnostic reports.
              </p>
            </div>

            <Link
              to="/doctor/availability"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Clock size={16} />
              <span>Update Availability Slots</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
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
                <Calendar size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Today's Schedule
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                  {todayAppts.length}
                </h3>
              </div>
            </div>

            <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Pending Consultations
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                  {pendingConsultations.length}
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
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Completed Cases
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                  {completedCount}
                </h3>
              </div>
            </div>
          </div>

          {/* Upcoming Consultations Table */}
          <div className="card p-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Pending Consultations
              </h3>
              <Link to="/doctor/appointments" style={{ fontSize: '13px', fontWeight: 600, color: '#00A896', textDecoration: 'none' }}>
                Full Schedule
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Sparkles size={28} color="#00A896" className="animate-spin" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#64748B' }}>Loading patient schedule...</p>
              </div>
            ) : pendingConsultations.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '12px 14px' }}>Patient Name</th>
                      <th style={{ padding: '12px 14px' }}>Date & Time</th>
                      <th style={{ padding: '12px 14px' }}>Chief Complaint</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingConsultations.map((appt) => (
                      <tr key={appt.appointment_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                          {appt.patient_name}
                        </td>
                        <td style={{ padding: '14px', color: '#334155' }}>
                          📅 {appt.appointment_date} <br />
                          <span style={{ fontSize: '12px', color: '#64748B' }}>⏰ {appt.start_time} - {appt.end_time}</span>
                        </td>
                        <td style={{ padding: '14px', color: '#475569', maxWidth: '240px' }}>
                          {appt.reason || 'General clinical consultation'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge badge-${appt.status}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            onClick={() => setActiveConsultation(appt)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Stethoscope size={13} />
                            <span>Consult</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  All Consultations Concluded
                </h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  No pending patients waiting for consultation at this time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation & Report Creation Modal */}
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
