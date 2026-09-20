import React from 'react';
import { Calendar, Clock, AlertCircle, FileText, Ban } from 'lucide-react';

export default function AppointmentCard({ appointment, onCancel, onViewReport, isDoctorView = false }) {
  const dateObj = new Date(appointment.appointment_date);
  const day = dateObj.getUTCDate();
  const month = dateObj.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

  return (
    <div className="appointment-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="appt-date-badge">
          <div className="appt-day">{day}</div>
          <div className="appt-month">{month}</div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              {isDoctorView ? appointment.patient_name : appointment.doctor_name}
            </h4>
            <span className={`badge badge-${appointment.status}`}>
              {appointment.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#64748B', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color="#00A896" /> {appointment.start_time} - {appointment.end_time || '30 min'}
            </span>
            <span>•</span>
            <span>{isDoctorView ? `Blood Group: ${appointment.blood_group || 'N/A'}` : appointment.specialization_name}</span>
          </div>

          {appointment.reason && (
            <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
              <strong>Reason:</strong> {appointment.reason}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {appointment.status === 'COMPLETED' && (appointment.report_id || onViewReport) && (
          <button
            onClick={() => onViewReport(appointment)}
            className="btn btn-outline-teal btn-sm"
          >
            <FileText size={15} />
            <span>Consultation Report</span>
          </button>
        )}

        {(appointment.status === 'CONFIRMED' || appointment.status === 'BOOKED') && onCancel && (
          <button
            onClick={() => onCancel(appointment)}
            className="btn btn-danger btn-sm"
          >
            <Ban size={15} />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
}
