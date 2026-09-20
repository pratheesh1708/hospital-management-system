import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, Clock, X, CheckCircle, ChevronRight, User, Stethoscope } from 'lucide-react';

export default function BookAppointmentModal({ initialDoctor = null, onClose, onSuccess }) {
  const { showToast } = useNotifications();
  const [step, setStep] = useState(initialDoctor ? 3 : 1);
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(initialDoctor?.specialization_id || null);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctor || null);
  
  // Dates: today + next 7 days
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    fetchSpecializations();
    if (initialDoctor) {
      setSelectedDoctor(initialDoctor);
      fetchSlots(initialDoctor.doctor_id, selectedDate);
    }
  }, []);

  async function fetchSpecializations() {
    try {
      const res = await api.get('/doctors/specializations');
      if (res.success) {
        setSpecializations(res.specializations || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSelectSpec(specId) {
    setSelectedSpec(specId);
    setLoading(true);
    try {
      const res = await api.get(`/doctors?specializationId=${specId}`);
      if (res.success) {
        setDoctors(res.doctors || []);
        setStep(2);
      }
    } catch (e) {
      setError('Failed to load doctors for this department.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectDoctor(doc) {
    setSelectedDoctor(doc);
    fetchSlots(doc.doctor_id, selectedDate);
    setStep(3);
  }

  async function fetchSlots(docId, date) {
    setSlotsLoading(true);
    setError('');
    setSelectedSlot(null);
    try {
      const res = await api.get(`/doctors/${docId}/availability?date=${date}`);
      if (res.success) {
        const openSlots = (res.slots || []).filter(s => s.current_status === 'available');
        setAvailableSlots(openSlots);
      }
    } catch (e) {
      setError('Could not retrieve slots for selected date.');
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleDateChange(e) {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (selectedDoctor) {
      fetchSlots(selectedDoctor.doctor_id, newDate);
    }
  }

  async function handleConfirmBooking() {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Please select a doctor, date, and appointment slot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/appointments', {
        doctorId: selectedDoctor.doctor_id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.start_time,
        endTime: selectedSlot.end_time,
        reason: reason.trim() || 'General Consultation'
      });

      if (res.success) {
        setBookingSuccess(res);
        showToast('Appointment successfully reserved and confirmed!', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // Catches concurrency 409 collision or transactional failures gracefully
      setError(err.message || 'Unable to complete booking. Please try another slot.');
    } finally {
      setLoading(false);
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0B132B' }}>
              {bookingSuccess ? 'Booking Confirmed' : 'Book Clinical Consultation'}
            </h3>
            {!bookingSuccess && (
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Step {step} of 4: {
                  step === 1 ? 'Select Department' :
                  step === 2 ? 'Select Physician' :
                  step === 3 ? 'Choose Date & Slot' : 'Confirm Consultation'
                }
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #FECACA',
              fontSize: '13px',
              marginBottom: '20px',
              fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          {bookingSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '20px', margin: '0 0 8px', color: '#0B132B' }}>
                Appointment Confirmed!
              </h3>
              <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
                Your appointment with <strong>{bookingSuccess.doctorName}</strong> has been scheduled.
              </p>

              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'left',
                maxWidth: '400px',
                margin: '0 auto 24px'
              }}>
                <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Specialization:</strong> {bookingSuccess.specialization}</p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Date:</strong> {bookingSuccess.appointmentDate}</p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Time:</strong> {bookingSuccess.startTime} - {bookingSuccess.endTime}</p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Status:</strong> <span className="badge badge-success">{bookingSuccess.status}</span></p>
              </div>

              <button onClick={onClose} className="btn btn-primary" style={{ minWidth: '160px' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Select Specialization */}
              {step === 1 && (
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '14px', color: '#334155' }}>
                    Select a Medical Department:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {specializations.map(s => (
                      <div
                        key={s.specialization_id}
                        onClick={() => handleSelectSpec(s.specialization_id)}
                        style={{
                          padding: '16px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00A896'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                      >
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                          {s.specialization_name}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                          {s.doctor_count || 1} certified doctors
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Doctor */}
              {step === 2 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>
                      Choose your Physician:
                    </h4>
                    <button
                      onClick={() => setStep(1)}
                      style={{ background: 'none', border: 'none', color: '#00A896', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      &larr; Change Department
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {doctors.map(doc => (
                      <div
                        key={doc.doctor_id}
                        onClick={() => handleSelectDoctor(doc)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00A896'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            backgroundColor: '#E6F8F6',
                            color: '#028090',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                          }}>
                            <Stethoscope size={20} />
                          </div>
                          <div>
                            <h5 style={{ margin: 0, fontSize: '15px', color: '#0F172A' }}>{doc.name}</h5>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                              {doc.qualification} • {doc.experience} yrs exp.
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0B132B' }}>
                            ${Number(doc.consultation_fee).toFixed(2)}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#00A896', fontWeight: 600 }}>
                            Select &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Choose Date & Slot */}
              {step === 3 && selectedDoctor && (
                <div>
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Selected Physician</span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#0B132B' }}>{selectedDoctor.name}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#028090', fontWeight: 600 }}>{selectedDoctor.specialization_name}</p>
                    </div>
                    {!initialDoctor && (
                      <button
                        onClick={() => setStep(2)}
                        style={{ background: 'none', border: 'none', color: '#00A896', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Change
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consultation Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDate}
                      min={todayStr}
                      onChange={handleDateChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Available Time Slots ({availableSlots.length} Open)
                    </label>
                    {slotsLoading ? (
                      <p style={{ color: '#64748B', fontSize: '13px' }}>Checking real availability...</p>
                    ) : availableSlots.length === 0 ? (
                      <div style={{ padding: '20px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', color: '#92400E', fontSize: '13px' }}>
                        No open consultation slots on this date. Please pick another date or consult another physician.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '8px',
                              border: selectedSlot?.start_time === slot.start_time ? '2px solid #00A896' : '1px solid #E2E8F0',
                              backgroundColor: selectedSlot?.start_time === slot.start_time ? '#E6F8F6' : '#ffffff',
                              color: selectedSlot?.start_time === slot.start_time ? '#028090' : '#334155',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {slot.start_time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Visit / Symptoms (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g., Routine health checkup, persistent chest discomfort, follow-up"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={!selectedSlot || loading}
                      className="btn btn-primary"
                    >
                      {loading ? 'Confirming...' : 'Confirm & Reserve Slot'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
