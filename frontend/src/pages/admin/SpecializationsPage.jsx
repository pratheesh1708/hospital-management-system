import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import doctorService from '../../services/doctorService';
import adminService from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Stethoscope, Plus, CheckCircle2, Sparkles } from 'lucide-react';

export default function SpecializationsPage() {
  const { showToast } = useNotifications();
  const [specializations, setSpecializations] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs() {
    try {
      setLoading(true);
      const res = await doctorService.getSpecializations();
      if (res.success) {
        setSpecializations(res.specializations || []);
      }
    } catch (err) {
      console.error('Error fetching specializations:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSpec = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const res = await adminService.addSpecialization({
        name: name.trim(),
        description: description.trim(),
        icon: 'Stethoscope'
      });
      if (res.success) {
        showToast('Department added successfully!');
        setName('');
        setDescription('');
        loadSpecs();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Hospital Departments & Specialties
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
              Configure clinical divisions, diagnostic scopes, and consultation departments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Form */}
            <div className="card p-4">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#00A896" />
                <span>Add New Clinical Department</span>
              </h3>

              <form onSubmit={handleAddSpec} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oncology, Pulmonology"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Department Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of clinical scope and care provided..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-control"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>{submitting ? 'Creating...' : 'Create Department'}</span>
                </button>
              </form>
            </div>

            {/* List */}
            <div className="card p-4">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>
                Active Specializations ({specializations.length})
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Sparkles size={24} color="#00A896" className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: '#64748B', fontSize: '13px' }}>Loading departments...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '440px', overflowY: 'auto' }}>
                  {specializations.map((spec) => (
                    <div
                      key={spec.specialization_id}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                    >
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                        {spec.specialization_name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                        {spec.description || 'Clinical department specialization'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
