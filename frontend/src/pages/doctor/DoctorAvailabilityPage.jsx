import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import doctorService from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Clock, Plus, Trash2, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);

  // New slot form state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchDoctorProfileAndSlots();
  }, [selectedDate]);

  async function fetchDoctorProfileAndSlots() {
    try {
      setLoading(true);
      // Fetch doctor list to locate current user's doctor_id
      const docsRes = await doctorService.getDoctors();
      if (docsRes.success) {
        const currentDoc = docsRes.doctors.find((d) => d.email === user?.email || d.name === user?.name);
        const docId = currentDoc?.doctor_id || 1;
        setDoctorId(docId);

        const slotsRes = await doctorService.getDoctorAvailability(docId, selectedDate);
        if (slotsRes.success) {
          setSlots(slotsRes.slots || []);
        }
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      const res = await doctorService.addAvailability({
        availableDate: selectedDate,
        startTime,
        endTime
      });
      if (res.success) {
        showToast('New availability slot added!');
        fetchDoctorProfileAndSlots();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add slot', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSlot = async (availabilityId) => {
    try {
      const res = await doctorService.deleteAvailability(availabilityId);
      if (res.success) {
        showToast('Slot removed.');
        setSlots(slots.filter((s) => s.availability_id !== availabilityId));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete slot', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Manage Clinical Availability
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
              Define consultation hours and available slots for patients to book online.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Left: Add Slot Card */}
            <div className="card p-4">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#00A896" />
                <span>Add Time Slot</span>
              </h3>

              <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>{adding ? 'Adding...' : 'Add Slot'}</span>
                </button>
              </form>
            </div>

            {/* Right: Existing Slots for Selected Date */}
            <div className="card p-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#00A896" />
                  <span>Slots for {selectedDate}</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  {slots.length} Slots
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Sparkles size={24} color="#00A896" className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: '#64748B', fontSize: '13px' }}>Loading slots...</p>
                </div>
              ) : slots.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                  {slots.map((slot) => (
                    <div
                      key={slot.availability_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: slot.status === 'booked' ? '#FEF2F2' : '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={14} color={slot.status === 'booked' ? '#EF4444' : '#00A896'} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: slot.status === 'booked' ? '#FEE2E2' : '#DCFCE7',
                          color: slot.status === 'booked' ? '#DC2626' : '#15803D'
                        }}>
                          {slot.status}
                        </span>
                      </div>

                      {slot.status !== 'booked' && (
                        <button
                          onClick={() => handleDeleteSlot(slot.availability_id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove Slot"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <Calendar size={36} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    No slots scheduled for this date yet. Use the form to add slots.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
