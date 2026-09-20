import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, FileText, Stethoscope } from 'lucide-react';
import medicalService from '../../services/medicalService';
import appointmentService from '../../services/appointmentService';
import { useNotifications } from '../../context/NotificationContext';

export default function ConsultationFormModal({ appointment, onClose, onSuccess }) {
  const { showToast } = useNotifications();

  const [symptoms, setSymptoms] = useState(appointment?.reason || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !treatment.trim()) {
      setError('Diagnosis and treatment plan are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const validMedications = medications.filter((m) => m.name.trim());

      const payload = {
        appointment_id: appointment.appointment_id,
        patient_id: appointment.patient_id,
        symptoms,
        diagnosis,
        treatment,
        medications: JSON.stringify(validMedications),
        doctor_notes: doctorNotes,
        follow_up_date: followUpDate || null
      };

      const res = await medicalService.createRecord(payload);
      if (res.success) {
        // Mark appointment as COMPLETED
        await appointmentService.updateStatus(appointment.appointment_id, 'COMPLETED');
        showToast('Consultation concluded and official report generated!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to submit consultation record.');
      }
    } catch (err) {
      setError(err.message || 'Error creating consultation record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#E6F8F6',
              color: '#00A896',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Clinical Consultation & Report
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Patient: <strong>{appointment?.patient_name || 'Patient'}</strong> • Appt #{appointment?.appointment_id}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#B91C1C'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Patient Symptoms / Chief Complaint *
            </label>
            <textarea
              rows={2}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="form-control"
              placeholder="Describe symptoms presented by the patient..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="form-control"
              placeholder="e.g. Acute Bronchitis, Essential Hypertension"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Treatment Plan & Clinical Directives *
            </label>
            <textarea
              rows={3}
              required
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="form-control"
              placeholder="Prescribed rest, dietary modifications, therapeutic procedures..."
            />
          </div>

          {/* Medications Builder */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0 }}>
                Prescription & Medications
              </label>
              <button
                type="button"
                onClick={handleAddMedication}
                className="btn btn-outline-teal btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '12px' }}
              >
                <Plus size={13} />
                <span>Add Medicine</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {medications.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1.5fr 36px', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g. 2x Daily)"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Duration (7 days)"
                    value={med.duration}
                    onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                  />
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Confidential Doctor Notes
              </label>
              <input
                type="text"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="form-control"
                placeholder="Internal clinical observations..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Finalizing...' : 'Finalize & Issue Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
