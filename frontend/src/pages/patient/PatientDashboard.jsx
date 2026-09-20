import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import AppointmentCard from '../../components/AppointmentCard/AppointmentCard';
import MedicalReportModal from '../../components/MedicalReport/MedicalReportModal';
import BookAppointmentModal from './BookAppointmentModal';
import appointmentService from '../../services/appointmentService';
import medicalService from '../../services/medicalService';
import doctorService from '../../services/doctorService';
import {
  Calendar,
  FileText,
  Clock,
  Stethoscope,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [apptsRes, recordsRes] = await Promise.all([
        appointmentService.getMyAppointments(),
        medicalService.getPatientHistory()
      ]);
      if (apptsRes.success) setAppointments(apptsRes.appointments || []);
      if (recordsRes.success) setMedicalRecords(recordsRes.records || []);
    } catch (err) {
      console.error('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const upcomingAppts = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'BOOKED'
  );
  const nextAppointment = upcomingAppts[0];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Welcome Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Welcome back, {user?.name || 'Patient'}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
                Your personal health overview, upcoming consultations, and clinical records.
              </p>
            </div>

            <Link
              to="/doctors"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              <span>Book Appointment</span>
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
                  Upcoming Visits
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                  {upcomingAppts.length}
                </h3>
              </div>
            </div>

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
                <FileText size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Medical Reports
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                  {medicalRecords.length}
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
                <ShieldCheck size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Account Status
                </p>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: '#16A34A' }}>
                  Verified & Active
                </h3>
              </div>
            </div>
          </div>

          {/* Next Upcoming Appointment Highlight */}
          {nextAppointment ? (
            <div style={{
              background: 'linear-gradient(135deg, #0B132B, #1C2541)',
              borderRadius: '16px',
              padding: '24px 32px',
              color: '#ffffff',
              marginBottom: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <span style={{
                  backgroundColor: 'rgba(0, 168, 150, 0.25)',
                  color: '#99F6E4',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  Next Scheduled Consultation
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '12px 0 6px', color: '#ffffff' }}>
                  {nextAppointment.doctor_name || 'Dr. Specialist'}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#CBD5E1' }}>
                  {nextAppointment.specialization_name} • {nextAppointment.appointment_date} at {nextAppointment.start_time}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link
                  to="/patient/appointments"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Manage Appointments</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px dashed #CBD5E1',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '36px'
            }}>
              <Stethoscope size={36} color="#00A896" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                No Upcoming Appointments Scheduled
              </h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 16px' }}>
                Consult with our leading cardiologists, dermatologists, or physicians today.
              </p>
              <Link to="/doctors" className="btn btn-primary btn-sm">
                Schedule a Consultation
              </Link>
            </div>
          )}

          {/* Two Columns: Recent Appointments & Medical Records */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '28px' }}>
            {/* Recent Appointments */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Recent Appointments
                </h3>
                <Link to="/patient/appointments" style={{ fontSize: '13px', fontWeight: 600, color: '#00A896', textDecoration: 'none' }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.slice(0, 3).map((appt) => (
                  <AppointmentCard
                    key={appt.appointment_id}
                    appointment={appt}
                    onStatusChange={loadDashboardData}
                  />
                ))}
                {appointments.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No appointment records found.
                  </p>
                )}
              </div>
            </div>

            {/* Medical History & Reports */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Clinical Reports & Prescriptions
                </h3>
                <Link to="/patient/history" style={{ fontSize: '13px', fontWeight: 600, color: '#00A896', textDecoration: 'none' }}>
                  View All History
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medicalRecords.slice(0, 3).map((record) => (
                  <div
                    key={record.record_id}
                    className="card p-3"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                        {record.diagnosis}
                      </h5>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                        By {record.doctor_name} • {record.created_at?.split('T')[0] || 'Recent'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedReport(record)}
                      className="btn btn-outline-teal btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FileText size={13} />
                      <span>View Report</span>
                    </button>
                  </div>
                ))}

                {medicalRecords.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No consultation records or laboratory reports on file yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Report Modal */}
      {selectedReport && (
        <MedicalReportModal
          record={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
