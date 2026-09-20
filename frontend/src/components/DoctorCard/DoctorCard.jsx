import React from 'react';
import { Calendar, Award, DollarSign } from 'lucide-react';

export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <img
          src={doctor.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces'}
          alt={doctor.name}
          className="doctor-avatar"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces';
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 className="doctor-name">{doctor.name}</h3>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            {doctor.specialization_name}
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
            {doctor.qualification}
          </p>
        </div>
      </div>

      <div className="doctor-card-body">
        <p className="doctor-bio">
          {doctor.bio || 'Specialist physician providing comprehensive clinical consultations and advanced diagnostics.'}
        </p>

        <div className="doctor-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#00A896" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              {doctor.experience} Yrs Experience
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Fee:</span>
            <span className="doctor-fee">${Number(doctor.consultation_fee).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => onBook(doctor)}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <Calendar size={16} />
          <span>Book Appointment</span>
        </button>
      </div>
    </div>
  );
}
