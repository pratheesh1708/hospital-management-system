import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import MedicalReportModal from '../../components/MedicalReport/MedicalReportModal';
import medicalService from '../../services/medicalService';
import { FileText, Calendar, User, Stethoscope, Sparkles, Download, Eye } from 'lucide-react';

export default function PatientMedicalHistoryPage() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  async function loadMedicalHistory() {
    try {
      setLoading(true);
      const res = await medicalService.getPatientHistory();
      if (res.success) {
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error('Error fetching medical history:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Medical History & Clinical Reports
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
              Official diagnosis history, physician consultation summaries, and active prescription records.
            </p>
          </div>

          {/* Records List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Sparkles size={32} color="#00A896" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748B', fontWeight: 600 }}>Retrieving your medical records...</p>
            </div>
          ) : records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {records.map((record) => {
                let medicationsList = [];
                try {
                  medicationsList = typeof record.medications === 'string'
                    ? JSON.parse(record.medications)
                    : (record.medications || []);
                } catch (e) {
                  medicationsList = [];
                }

                return (
                  <div
                    key={record.record_id}
                    className="card"
                    style={{ padding: '24px', borderLeft: '4px solid #00A896' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            backgroundColor: '#E6F8F6',
                            color: '#00A896',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {record.specialization_name || 'Consultation'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>
                            Report #{record.report_number || `REC-${record.record_id}`}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {record.diagnosis}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                          Consulted by <strong>{record.doctor_name}</strong> on {record.created_at?.split('T')[0]}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="btn btn-outline-teal btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} />
                        <span>View Official Report</span>
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '16px',
                      backgroundColor: '#F8FAFC',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <h5 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Reported Symptoms
                        </h5>
                        <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.5 }}>
                          {record.symptoms || 'None recorded'}
                        </p>
                      </div>

                      <div>
                        <h5 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Treatment Plan
                        </h5>
                        <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.5 }}>
                          {record.treatment || 'Standard clinical observation'}
                        </p>
                      </div>
                    </div>

                    {/* Prescribed Medications */}
                    {medicationsList.length > 0 && (
                      <div>
                        <h5 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Prescriptions ({medicationsList.length})
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {medicationsList.map((med, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                color: '#1E40AF',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                            >
                              💊 {med.name} ({med.dosage}) - {med.frequency}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '60px 24px'
            }}>
              <FileText size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                No Clinical Reports On File
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                After you conclude a consultation with our physicians, your diagnosis, clinical notes, and digital prescriptions will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Official Report Modal */}
      {selectedRecord && (
        <MedicalReportModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
