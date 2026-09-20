import React from 'react';
import { X, Printer, ShieldCheck, Stethoscope } from 'lucide-react';

export default function MedicalReportModal({ report, onClose }) {
  if (!report) return null;

  let medications = [];
  try {
    medications = typeof report.medications === 'string'
      ? JSON.parse(report.medications)
      : (report.medications || []);
  } catch (e) {
    medications = [];
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#00A896" />
            <h3 style={{ margin: 0, fontSize: '18px' }}>Official Consultation Report</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              title="Print Clinical Summary"
            >
              <Printer size={15} /> Print / Save
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '32px' }}>
          <div className="report-document">
            <div className="report-watermark">ST. JUDE MEDICAL</div>

            {/* Banner */}
            <div className="report-header-banner">
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#0B132B' }}>St. Jude Hospital</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Department of {report.specialization_name || 'Clinical Medicine'} • Accreditation #MED-8890
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ marginBottom: '4px' }}>
                  {report.status?.toUpperCase() || 'FINAL'}
                </span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {report.report_number}
                </p>
              </div>
            </div>

            {/* Patient & Physician Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              backgroundColor: '#F8FAFC',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #E2E8F0'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                  Patient Information
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  {report.patient_name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                  Gender: {report.gender || 'N/A'} • Blood: {report.blood_group || 'N/A'}
                </p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                  Consulting Physician
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  {report.doctor_name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                  {report.qualification}
                </p>
              </div>
            </div>

            {/* Clinical Findings */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Presenting Symptoms & Chief Complaint
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: 1.5, backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                {report.symptoms}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#028090', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Clinical Diagnosis
              </h4>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A', backgroundColor: '#F0FDFA', padding: '12px 14px', borderRadius: '6px', border: '1px solid #99F6E4' }}>
                {report.diagnosis}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Treatment & Clinical Recommendations
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: 1.5 }}>
                {report.treatment}
              </p>
            </div>

            {/* Prescribed Medications */}
            {medications.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Prescribed Pharmacotherapy
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px' }}>Medication</th>
                      <th style={{ padding: '8px 10px' }}>Dosage</th>
                      <th style={{ padding: '8px 10px' }}>Frequency</th>
                      <th style={{ padding: '8px 10px' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '8px 10px' }}>{m.dosage}</td>
                        <td style={{ padding: '8px 10px' }}>{m.frequency}</td>
                        <td style={{ padding: '8px 10px' }}>{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doctor Notes & Follow-up */}
            {report.doctor_notes && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Physician Care Notes
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                  "{report.doctor_notes}"
                </p>
              </div>
            )}

            {report.follow_up_date && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#FEF3C7',
                borderRadius: '6px',
                color: '#92400E',
                fontSize: '13px',
                fontWeight: 600
              }}>
                📅 Recommended Follow-up Appointment Date: {report.follow_up_date}
              </div>
            )}

            {/* Verification Stamp */}
            <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Electronically generated via St. Jude Health Cloud.<br />
                Report Verified & Digitally Certified.
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  {report.doctor_name}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#00A896', fontWeight: 600 }}>
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
